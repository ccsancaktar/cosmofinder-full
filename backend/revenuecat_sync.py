import os
from datetime import datetime, timezone
from urllib.parse import quote

import requests
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from config import load_environment
from models import PremiumSubscription, TokenTransaction, User, db

load_environment()

revenuecat_bp = Blueprint("revenuecat", __name__)

REVENUECAT_API_BASE = "https://api.revenuecat.com/v1"
REVENUECAT_SECRET_API_KEY = os.getenv("REVENUECAT_SECRET_API_KEY", "").strip()
REVENUECAT_WEBHOOK_AUTH = os.getenv("REVENUECAT_WEBHOOK_AUTH", "").strip()

TOKEN_PRODUCT_AMOUNTS = {
    "token_pack_small": 40,
    "token_pack_medium": 90,
    "token_pack_large": 160,
}

PREMIUM_PRODUCT_DAYS = {
    "premium_monthly": 30,
    "premium_yearly": 182,
}


def _parse_rc_datetime(value):
    if not value:
        return None

    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(timezone.utc).replace(tzinfo=None)
    except Exception:
        return None


def _fetch_subscriber(app_user_id):
    if not REVENUECAT_SECRET_API_KEY:
        raise RuntimeError("REVENUECAT_SECRET_API_KEY tanımlı değil")

    encoded_user_id = quote(str(app_user_id), safe="")
    response = requests.get(
        f"{REVENUECAT_API_BASE}/subscribers/{encoded_user_id}",
        headers={
            "Authorization": f"Bearer {REVENUECAT_SECRET_API_KEY}",
            "Content-Type": "application/json",
        },
        timeout=20,
    )
    response.raise_for_status()
    payload = response.json()
    return payload.get("subscriber", {})


def _sync_premium_subscription(user_id, subscriber):
    entitlements = subscriber.get("entitlements", {})
    premium_entitlement = entitlements.get("premium")

    existing_subscription = PremiumSubscription.find_active_by_user_id(user_id)

    if not premium_entitlement:
        if existing_subscription and existing_subscription.purchase_source == "revenuecat":
            existing_subscription.is_active = False
            existing_subscription.auto_renew = False
            existing_subscription.save()
            return {
                "has_premium": False,
                "plan_type": None,
                "days_remaining": None,
            }

        if existing_subscription:
            return {
                "has_premium": True,
                "plan_type": existing_subscription.plan_type,
                "days_remaining": existing_subscription.days_remaining(),
                "end_date": existing_subscription.end_date.isoformat() if existing_subscription.end_date else None,
            }

        return {
            "has_premium": False,
            "plan_type": None,
            "days_remaining": None,
        }

    expires_date = _parse_rc_datetime(premium_entitlement.get("expires_date"))
    purchase_date = _parse_rc_datetime(premium_entitlement.get("purchase_date")) or datetime.now()
    product_identifier = premium_entitlement.get("product_identifier")

    if expires_date and expires_date <= datetime.utcnow():
        if existing_subscription and existing_subscription.purchase_source == "revenuecat":
            existing_subscription.is_active = False
            existing_subscription.auto_renew = False
            existing_subscription.save()
            return {
                "has_premium": False,
                "plan_type": None,
                "days_remaining": None,
            }

        if existing_subscription:
            return {
                "has_premium": True,
                "plan_type": existing_subscription.plan_type,
                "days_remaining": existing_subscription.days_remaining(),
                "end_date": existing_subscription.end_date.isoformat() if existing_subscription.end_date else None,
            }

        return {
            "has_premium": False,
            "plan_type": None,
            "days_remaining": None,
        }

    if existing_subscription:
        subscription = existing_subscription
    else:
        subscription = PremiumSubscription(user_id=user_id, plan_type=product_identifier or "premium_monthly")

    subscription.plan_type = product_identifier or "premium_monthly"
    subscription.start_date = purchase_date
    subscription.end_date = expires_date or datetime.utcnow()
    subscription.is_active = True
    subscription.auto_renew = True
    subscription.purchase_source = "revenuecat"
    subscription.external_product_id = product_identifier
    subscription.revenuecat_transaction_id = premium_entitlement.get("product_identifier")
    subscription.save()

    return {
        "has_premium": True,
        "plan_type": subscription.plan_type,
        "days_remaining": subscription.days_remaining(),
        "end_date": subscription.end_date.isoformat() if subscription.end_date else None,
    }


def _claim_token_transactions(user, subscriber, product_id=None):
    non_subscriptions = subscriber.get("non_subscriptions", {})
    product_ids = [product_id] if product_id else list(TOKEN_PRODUCT_AMOUNTS.keys())
    claimed = []

    for current_product_id in product_ids:
        purchases = non_subscriptions.get(current_product_id, [])
        token_amount = TOKEN_PRODUCT_AMOUNTS.get(current_product_id)

        if not token_amount:
            continue

        for purchase in purchases:
            transaction_id = purchase.get("id") or purchase.get("store_transaction_id")
            if not transaction_id:
                continue

            if TokenTransaction.find_by_revenuecat_transaction_id(transaction_id):
                continue

            transaction = TokenTransaction(
                user_id=str(user._id),
                transaction_type="purchase",
                amount=token_amount,
                description=f"{current_product_id} RevenueCat üzerinden işlendi",
                package_id=current_product_id,
                purchase_source="revenuecat",
                revenuecat_transaction_id=transaction_id,
                external_product_id=current_product_id,
            )
            transaction.save()
            claimed.append(
                {
                    "product_id": current_product_id,
                    "transaction_id": transaction_id,
                    "token_amount": token_amount,
                }
            )

    if claimed:
        user.update_token_balance()

    return claimed


@revenuecat_bp.route("/sync-premium", methods=["POST"])
@jwt_required()
def sync_premium():
    try:
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)
        if not user:
            return jsonify({"error": "Kullanıcı bulunamadı"}), 404

        subscriber = _fetch_subscriber(user_id)
        result = _sync_premium_subscription(user_id, subscriber)
        return jsonify(result), 200
    except requests.HTTPError as exc:
        return jsonify({"error": f"RevenueCat premium senkronizasyonu başarısız: {str(exc)}"}), 502
    except Exception as exc:
        return jsonify({"error": f"Premium senkronizasyon hatası: {str(exc)}"}), 500


@revenuecat_bp.route("/claim-token-purchase", methods=["POST"])
@jwt_required()
def claim_token_purchase():
    try:
        user_id = get_jwt_identity()
        user = User.find_by_id(user_id)
        if not user:
            return jsonify({"error": "Kullanıcı bulunamadı"}), 404

        data = request.get_json() or {}
        product_id = data.get("product_id")

        if product_id and product_id not in TOKEN_PRODUCT_AMOUNTS:
            return jsonify({"error": "Geçersiz token ürünü"}), 400

        subscriber = _fetch_subscriber(user_id)
        claimed_transactions = _claim_token_transactions(user, subscriber, product_id)

        return jsonify(
            {
                "claimed_transactions": claimed_transactions,
                "new_balance": user.get_token_balance(),
                "claimed_count": len(claimed_transactions),
            }
        ), 200
    except requests.HTTPError as exc:
        return jsonify({"error": f"RevenueCat token senkronizasyonu başarısız: {str(exc)}"}), 502
    except Exception as exc:
        return jsonify({"error": f"Token senkronizasyon hatası: {str(exc)}"}), 500


@revenuecat_bp.route("/webhook", methods=["POST"])
def revenuecat_webhook():
    expected_auth = REVENUECAT_WEBHOOK_AUTH
    incoming_auth = request.headers.get("Authorization", "").strip()

    if expected_auth and incoming_auth != expected_auth:
        return jsonify({"error": "Yetkisiz webhook isteği"}), 401

    payload = request.get_json(silent=True) or {}
    event = payload.get("event", {})
    app_user_id = event.get("app_user_id")

    if not app_user_id:
        return jsonify({"received": True, "ignored": True}), 200

    user = User.find_by_id(app_user_id)
    if not user:
        return jsonify({"received": True, "ignored": True}), 200

    try:
        subscriber = _fetch_subscriber(app_user_id)
        _sync_premium_subscription(app_user_id, subscriber)
        _claim_token_transactions(user, subscriber)
    except Exception:
        # Webhook'u idempotent ve hızlı tutmak için burada hata yutmuyor,
        # ama RC tarafında retry tetiklememek adına 200 dönüyoruz.
        return jsonify({"received": True, "synced": False}), 200

    return jsonify({"received": True, "synced": True}), 200
