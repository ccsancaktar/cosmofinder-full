from datetime import datetime, timedelta
from pathlib import Path
import os
import platform
import re
import resource
import shutil

from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt, get_jwt_identity, jwt_required
from bson import ObjectId

from models import (
    PremiumSubscription,
    TokenTransaction,
    User,
    calculate_chinese_element,
    calculate_zodiac_sign,
    db,
    is_database_available,
)
from redis_manager import redis_manager
from scheduler import scheduler


admin_bp = Blueprint("admin", __name__)
ADMIN_STARTED_AT = datetime.now()
BACKEND_LOG_PATH = Path(__file__).resolve().parents[1] / "backend.log"


def get_admin_username():
    return os.getenv("ADMIN_USERNAME", "admin")


def get_admin_password():
    return os.getenv("ADMIN_PASSWORD", "admin")


def _is_admin_token():
    claims = get_jwt()
    identity = get_jwt_identity()
    return bool(claims.get("is_admin_panel")) and isinstance(identity, str) and identity.startswith("admin:")


def _load_admin_user():
    if _is_admin_token():
        return {"username": get_admin_username()}, None

    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    if not user:
        return None, (jsonify({"error": "Kullanıcı bulunamadı"}), 404)
    if not user.is_admin():
        return None, (jsonify({"error": "Bu alan yalnızca admin kullanıcılar içindir"}), 403)
    return user, None


def _start_of_today():
    now = datetime.now()
    return datetime(now.year, now.month, now.day)


def _safe_ratio(part, whole):
    if not whole:
        return 0
    return round((part / whole) * 100, 1)


def _serialize_recent_reading(reading_doc, user_map):
    user_id = reading_doc.get("user_id")
    user = user_map.get(user_id) or {}
    result = reading_doc.get("result") or ""
    preview = re.sub(r"\s+", " ", result).strip()
    preview = preview[:180] + ("..." if len(preview) > 180 else "")
    return {
        "id": str(reading_doc.get("_id")),
        "reading_type": reading_doc.get("reading_type"),
        "created_at": reading_doc.get("created_at").isoformat() if reading_doc.get("created_at") else None,
        "user_id": user_id,
        "user_name": user.get("name") or user.get("username") or user.get("email") or "Bilinmeyen kullanıcı",
        "email": user.get("email"),
        "is_public": bool(reading_doc.get("is_public")),
        "preview": preview,
    }


def _serialize_recent_transaction(transaction_doc, user_map):
    user_id = transaction_doc.get("user_id")
    user = user_map.get(user_id) or {}
    return {
        "id": str(transaction_doc.get("_id")),
        "transaction_type": transaction_doc.get("transaction_type"),
        "amount": transaction_doc.get("amount", 0),
        "description": transaction_doc.get("description"),
        "created_at": transaction_doc.get("created_at").isoformat() if transaction_doc.get("created_at") else None,
        "user_id": user_id,
        "user_name": user.get("name") or user.get("username") or user.get("email") or "Bilinmeyen kullanıcı",
        "email": user.get("email"),
    }


def _serialize_admin_user(user):
    user_data = user.to_dict()
    user_data["name"] = " ".join(filter(None, [user.first_name, user.last_name])).strip()
    active_subscription = PremiumSubscription.find_active_by_user_id(str(user._id))
    user_data["premium"] = active_subscription.to_dict() if active_subscription else None
    return user_data


def _parse_birth_date(raw_value):
    if not raw_value:
        return None
    if isinstance(raw_value, datetime):
        return raw_value.date()
    return datetime.strptime(raw_value, "%Y-%m-%d").date()


def _parse_birth_time(raw_value):
    if not raw_value:
        return None
    if isinstance(raw_value, datetime):
        return raw_value.time()
    return datetime.strptime(raw_value, "%H:%M").time()


def _build_user_map(user_ids):
    normalized = [user_id for user_id in {uid for uid in user_ids if uid}]
    if not normalized:
        return {}
    user_docs = list(
        db.users.find(
            {"_id": {"$in": [ObjectId(uid) for uid in normalized if re.fullmatch(r"[a-f0-9]{24}", uid)]}},
            {"first_name": 1, "last_name": 1, "username": 1, "email": 1},
        )
    )
    user_map = {}
    for user_doc in user_docs:
        full_name = " ".join(filter(None, [user_doc.get("first_name"), user_doc.get("last_name")])).strip()
        user_map[str(user_doc["_id"])] = {
            "name": full_name,
            "username": user_doc.get("username"),
            "email": user_doc.get("email"),
        }
    return user_map


def _tail_log_lines(limit=80):
    if not BACKEND_LOG_PATH.exists():
        return []
    try:
        lines = BACKEND_LOG_PATH.read_text(encoding="utf-8", errors="ignore").splitlines()
        return lines[-limit:]
    except Exception:
        return []


def _memory_mb():
    try:
        max_rss = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
        if platform.system() == "Darwin":
            return round(max_rss / (1024 * 1024), 1)
        return round(max_rss / 1024, 1)
    except Exception:
        return None


def _disk_stats():
    try:
        usage = shutil.disk_usage(Path(__file__).resolve().parents[2])
        total_gb = round(usage.total / (1024 ** 3), 1)
        used_gb = round(usage.used / (1024 ** 3), 1)
        free_gb = round(usage.free / (1024 ** 3), 1)
        used_pct = round((usage.used / usage.total) * 100, 1) if usage.total else 0
        return {
            "total_gb": total_gb,
            "used_gb": used_gb,
            "free_gb": free_gb,
            "used_pct": used_pct,
        }
    except Exception:
        return None


def _load_average():
    try:
        values = os.getloadavg()
        return {
            "1m": round(values[0], 2),
            "5m": round(values[1], 2),
            "15m": round(values[2], 2),
        }
    except Exception:
        return None


def _scheduler_jobs():
    try:
        jobs = []
        for job in scheduler.get_jobs():
            jobs.append(
                {
                    "id": job.id,
                    "next_run_time": job.next_run_time.isoformat() if job.next_run_time else None,
                    "trigger": str(job.trigger),
                }
            )
        return jobs
    except Exception:
        return []
    

def _log_summary():
    lines = _tail_log_lines(120)
    warnings = [line for line in lines if "WARNING" in line]
    errors = [line for line in lines if "ERROR" in line or "Traceback" in line]
    return {
        "recent_warnings": warnings[-12:],
        "recent_errors": errors[-12:],
        "tail": lines[-40:],
    }


@admin_bp.route("/auth/login", methods=["POST"])
def admin_login():
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        return jsonify({"error": "Kullanıcı adı ve parola gereklidir"}), 400

    if username != get_admin_username() or password != get_admin_password():
        return jsonify({"error": "Geçersiz admin kullanıcı adı veya parola"}), 401

    access_token = create_access_token(
        identity=f"admin:{username}",
        additional_claims={"is_admin_panel": True},
        expires_delta=timedelta(days=30),
    )

    return jsonify(
        {
            "message": "Admin girişi başarılı",
            "token": access_token,
            "admin": {
                "username": username,
                "is_admin": True,
            },
        }
    ), 200


@admin_bp.route("/auth/me", methods=["GET"])
@jwt_required()
def admin_me():
    if not _is_admin_token():
        return jsonify({"error": "Geçersiz admin oturumu"}), 403

    return jsonify(
        {
            "admin": {
                "username": get_admin_username(),
                "is_admin": True,
            }
        }
    ), 200


@admin_bp.route("/overview", methods=["GET"])
@jwt_required()
def get_admin_overview():
    _, error_response = _load_admin_user()
    if error_response:
        return error_response

    now = datetime.now()
    today_start = _start_of_today()
    last_7_days = now - timedelta(days=7)

    total_users = db.users.count_documents({})
    active_users = db.users.count_documents({"is_active": True})
    onboarding_completed = db.users.count_documents({"onboarding_completed": True})
    verified_users = db.users.count_documents({"email_verified": True})

    active_premium = db.premium_subscriptions.count_documents(
        {
            "status": "active",
            "start_date": {"$lte": now},
            "end_date": {"$gte": now},
        }
    )

    total_readings = db.readings.count_documents({})
    readings_today = db.readings.count_documents({"created_at": {"$gte": today_start}})
    readings_last_7_days = db.readings.count_documents({"created_at": {"$gte": last_7_days}})

    purchase_pipeline = [
        {"$match": {"created_at": {"$gte": today_start}, "transaction_type": "purchase"}},
        {"$group": {"_id": None, "total_amount": {"$sum": "$amount"}, "count": {"$sum": 1}}},
    ]
    spend_pipeline = [
        {"$match": {"created_at": {"$gte": today_start}, "transaction_type": "spend"}},
        {"$group": {"_id": None, "total_amount": {"$sum": "$amount"}, "count": {"$sum": 1}}},
    ]

    purchases_today = list(db.token_transactions.aggregate(purchase_pipeline))
    spend_today = list(db.token_transactions.aggregate(spend_pipeline))

    purchase_total = purchases_today[0]["total_amount"] if purchases_today else 0
    purchase_count = purchases_today[0]["count"] if purchases_today else 0
    spend_total = abs(spend_today[0]["total_amount"]) if spend_today else 0
    spend_count = spend_today[0]["count"] if spend_today else 0

    readings_by_type = list(
        db.readings.aggregate(
            [
                {"$match": {"created_at": {"$gte": last_7_days}}},
                {"$group": {"_id": "$reading_type", "count": {"$sum": 1}}},
                {"$sort": {"count": -1}},
            ]
        )
    )

    recent_readings_docs = list(db.readings.find({}).sort("created_at", -1).limit(10))
    recent_transactions_docs = list(db.token_transactions.find({}).sort("created_at", -1).limit(10))
    user_map = _build_user_map(
        [doc.get("user_id") for doc in recent_readings_docs] + [doc.get("user_id") for doc in recent_transactions_docs]
    )

    return jsonify(
        {
            "system": {
                "database_connected": is_database_available(),
                "scheduler_running": bool(getattr(scheduler, "running", False)),
                "generated_at": now.isoformat(),
            },
            "metrics": {
                "total_users": total_users,
                "active_users": active_users,
                "premium_users": active_premium,
                "total_readings": total_readings,
                "readings_today": readings_today,
                "readings_last_7_days": readings_last_7_days,
                "token_purchase_total_today": purchase_total,
                "token_purchase_count_today": purchase_count,
                "token_spend_total_today": spend_total,
                "token_spend_count_today": spend_count,
                "onboarding_completion_rate": _safe_ratio(onboarding_completed, total_users),
                "verified_user_rate": _safe_ratio(verified_users, total_users),
                "premium_rate": _safe_ratio(active_premium, total_users),
            },
            "readings_by_type": [
                {"type": item.get("_id") or "bilinmiyor", "count": item.get("count", 0)} for item in readings_by_type
            ],
            "recent_readings": [_serialize_recent_reading(doc, user_map) for doc in recent_readings_docs],
            "recent_transactions": [_serialize_recent_transaction(doc, user_map) for doc in recent_transactions_docs],
        }
    ), 200


@admin_bp.route("/system", methods=["GET"])
@jwt_required()
def get_admin_system():
    _, error_response = _load_admin_user()
    if error_response:
        return error_response

    now = datetime.now()
    redis_stats = redis_manager.get_stats()
    disk_stats = _disk_stats()
    load_avg = _load_average()
    job_items = _scheduler_jobs()
    log_summary = _log_summary()

    return jsonify(
        {
            "generated_at": now.isoformat(),
            "uptime_seconds": int((now - ADMIN_STARTED_AT).total_seconds()),
            "runtime": {
                "python_version": platform.python_version(),
                "platform": platform.platform(),
                "process_memory_mb": _memory_mb(),
                "load_average": load_avg,
                "disk": disk_stats,
            },
            "services": {
                "database_connected": is_database_available(),
                "redis": redis_stats,
                "scheduler_running": bool(getattr(scheduler, "running", False)),
                "scheduler_jobs": job_items,
            },
            "logs": log_summary,
        }
    ), 200


@admin_bp.route("/users", methods=["GET"])
@jwt_required()
def search_admin_users():
    _, error_response = _load_admin_user()
    if error_response:
        return error_response

    query = (request.args.get("q") or "").strip()
    limit = request.args.get("limit", 12, type=int)
    limit = min(max(limit, 1), 50)

    search_filter = {}
    if query:
        safe_query = re.escape(query)
        search_filter = {
            "$or": [
                {"email": {"$regex": safe_query, "$options": "i"}},
                {"username": {"$regex": safe_query, "$options": "i"}},
                {"first_name": {"$regex": safe_query, "$options": "i"}},
                {"last_name": {"$regex": safe_query, "$options": "i"}},
            ]
        }

    user_docs = list(
        db.users.find(
            search_filter,
            {
                "username": 1,
                "email": 1,
                "first_name": 1,
                "last_name": 1,
                "token_balance": 1,
                "is_active": 1,
                "email_verified": 1,
                "onboarding_completed": 1,
                "created_at": 1,
            },
        )
        .sort("created_at", -1)
        .limit(limit)
    )

    users = []
    for user_doc in user_docs:
        full_name = " ".join(filter(None, [user_doc.get("first_name"), user_doc.get("last_name")])).strip()
        user_id = str(user_doc["_id"])
        premium_active = db.premium_subscriptions.count_documents(
            {
                "user_id": user_id,
                "status": "active",
                "start_date": {"$lte": datetime.now()},
                "end_date": {"$gte": datetime.now()},
            }
        ) > 0
        users.append(
            {
                "id": user_id,
                "username": user_doc.get("username"),
                "email": user_doc.get("email"),
                "name": full_name,
                "token_balance": user_doc.get("token_balance", 0),
                "is_active": bool(user_doc.get("is_active", True)),
                "email_verified": bool(user_doc.get("email_verified", False)),
                "onboarding_completed": bool(user_doc.get("onboarding_completed", True)),
                "has_premium": premium_active,
                "created_at": user_doc.get("created_at").isoformat() if user_doc.get("created_at") else None,
            }
        )

    return jsonify({"users": users, "count": len(users)}), 200


@admin_bp.route("/users/<user_id>", methods=["GET"])
@jwt_required()
def get_admin_user(user_id):
    _, error_response = _load_admin_user()
    if error_response:
        return error_response

    user = User.find_by_id(user_id)
    if not user:
        return jsonify({"error": "Kullanıcı bulunamadı"}), 404

    return jsonify({"user": _serialize_admin_user(user)}), 200


@admin_bp.route("/users/<user_id>", methods=["PATCH"])
@jwt_required()
def update_admin_user(user_id):
    _, error_response = _load_admin_user()
    if error_response:
        return error_response

    user = User.find_by_id(user_id)
    if not user:
        return jsonify({"error": "Kullanıcı bulunamadı"}), 404

    data = request.get_json() or {}

    username = (data.get("username") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    first_name = (data.get("first_name") or "").strip() or None
    last_name = (data.get("last_name") or "").strip() or None
    phone = (data.get("phone") or "").strip() or None
    birth_date_raw = (data.get("birth_date") or "").strip()
    birth_time_raw = (data.get("birth_time") or "").strip()
    birth_place = (data.get("birth_place") or "").strip() or None
    language = (data.get("language") or user.language or "tr").strip()
    is_active = bool(data.get("is_active", user.is_active))
    email_verified = bool(data.get("email_verified", user.email_verified))
    onboarding_completed = bool(data.get("onboarding_completed", user.onboarding_completed))
    has_premium = bool(data.get("has_premium", user.has_active_premium()))
    token_balance_target = data.get("token_balance", user.token_balance)

    if not username or not email:
        return jsonify({"error": "Kullanıcı adı ve email zorunludur"}), 400

    existing_username = db.users.find_one({"username": username, "_id": {"$ne": user._id}})
    if existing_username:
        return jsonify({"error": "Bu kullanıcı adı başka bir kullanıcı tarafından kullanılıyor"}), 409

    existing_email = db.users.find_one({"email": email, "_id": {"$ne": user._id}})
    if existing_email:
        return jsonify({"error": "Bu email başka bir kullanıcı tarafından kullanılıyor"}), 409

    try:
        birth_date = _parse_birth_date(birth_date_raw) if birth_date_raw else None
        birth_time = _parse_birth_time(birth_time_raw) if birth_time_raw else None
    except ValueError:
        return jsonify({"error": "Doğum tarihi veya saati formatı geçersiz"}), 400

    try:
        target_balance = int(token_balance_target)
    except (TypeError, ValueError):
        return jsonify({"error": "Token bakiyesi sayısal olmalıdır"}), 400

    user.username = username
    user.email = email
    user.first_name = first_name
    user.last_name = last_name
    user.phone = phone
    user.birth_date = birth_date
    user.birth_time = birth_time
    user.birth_place = birth_place
    user.language = language
    user.is_active = is_active
    user.email_verified = email_verified
    user.onboarding_completed = onboarding_completed
    user.updated_at = datetime.now()

    if birth_date_raw:
        user.zodiac_sign = calculate_zodiac_sign(birth_date_raw)
        user.chinese_element = calculate_chinese_element(birth_date_raw, birth_time_raw or None)
    else:
        user.zodiac_sign = None
        user.chinese_element = None

    if password.strip():
        user.set_password(password.strip())

    current_balance = user.get_token_balance()
    balance_delta = target_balance - current_balance
    if balance_delta != 0:
        TokenTransaction(
            user_id=str(user._id),
            transaction_type="bonus" if balance_delta > 0 else "spend",
            amount=balance_delta,
            description="Admin panel üzerinden manuel bakiye güncellemesi",
        ).save()

    if has_premium:
        active_subscription = PremiumSubscription.find_active_by_user_id(str(user._id))
        if not active_subscription:
            now = datetime.now()
            subscription = PremiumSubscription(
                user_id=str(user._id),
                plan_type="premium",
                start_date=now,
                end_date=now + timedelta(days=30),
                is_active=True,
                auto_renew=False,
            )
            subscription.save()
    else:
        db.premium_subscriptions.update_many(
            {"user_id": str(user._id), "is_active": True},
            {"$set": {"is_active": False, "end_date": datetime.now()}},
        )

    user.save()
    user.update_token_balance()
    refreshed_user = User.find_by_id(user_id)

    return jsonify({"message": "Kullanıcı bilgileri güncellendi", "user": _serialize_admin_user(refreshed_user)}), 200
