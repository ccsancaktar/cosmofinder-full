from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from notifications import NotificationService
from models import User, db
from config import COFFEE_UPLOADS_DIR, DEFAULT_COFFEE_UPLOAD_RETENTION_HOURS
from datetime import datetime, timedelta
import logging
import os
from pathlib import Path
from pymongo.errors import DuplicateKeyError

scheduler = BackgroundScheduler()
notification_service = NotificationService()
logger = logging.getLogger(__name__)
ANGEL_NOTIFICATION_SEQUENCE = ["111", "222", "333", "444", "555", "777", "888", "999", "1111"]


def _display_name(user):
    first_name = (user.first_name or '').strip()
    return first_name or user.username or "Değerli Kullanıcı"


def _iter_users(query):
    for user_data in db.users.find(query):
        user = User.find_by_id(str(user_data["_id"]))
        if user:
            yield user


def _append_notification_history(user, notification_type, title, body, extra_data=None):
    try:
        history_entry = {
            "type": notification_type,
            "title": title,
            "body": body,
            "data": extra_data or {},
            "sent_at": datetime.now().isoformat(),
        }
        existing_history = list(user.notification_history or [])
        existing_history.insert(0, history_entry)
        user.notification_history = existing_history[:50]
        user.save()
    except Exception as exc:
        logger.error(f"Notification history kaydedilemedi for user {getattr(user, '_id', None)}: {exc}")


def _claim_notification_dispatch(notification_type, user_id, dispatch_date=None, variant=None):
    """Aynı kullanıcıya aynı gün aynı notification'ın birden fazla gitmesini engelle."""
    date_key = (dispatch_date or datetime.now()).strftime("%Y-%m-%d")
    claim_id = f"{notification_type}:{user_id}:{date_key}"
    if variant:
        claim_id = f"{claim_id}:{variant}"

    try:
        db.notification_dispatch_claims.insert_one({
            "_id": claim_id,
            "notification_type": notification_type,
            "user_id": str(user_id),
            "date_key": date_key,
            "variant": variant,
            "created_at": datetime.now(),
        })
        return True
    except DuplicateKeyError:
        return False
    except Exception as exc:
        logger.error(f"Notification dispatch claim hatası ({claim_id}): {exc}")
        return False


def _has_history_entry_today(user, notification_type, match_data=None):
    today = datetime.now().date()
    for entry in list(user.notification_history or []):
        try:
            sent_at_raw = entry.get("sent_at")
            if not sent_at_raw:
                continue
            sent_at = datetime.fromisoformat(sent_at_raw)
            if sent_at.date() != today:
                continue
            if entry.get("type") != notification_type:
                continue
            if match_data:
                data = entry.get("data") or {}
                if any(data.get(key) != value for key, value in match_data.items()):
                    continue
            return True
        except Exception:
            continue
    return False


def _nth_weekday_of_month(year, month, weekday, nth):
    first_day = datetime(year, month, 1)
    first_weekday = first_day.weekday()
    offset = (weekday - first_weekday) % 7
    day = 1 + offset + ((nth - 1) * 7)
    return day


def _get_special_day_key(today):
    month_day = (today.month, today.day)
    fixed_days = {
        (1, 1): "new_year",
        (2, 14): "valentines_day",
        (3, 8): "womens_day",
        (3, 20): "spring_equinox",
        (6, 21): "summer_solstice",
        (9, 22): "autumn_equinox",
        (12, 21): "winter_solstice",
    }

    if month_day in fixed_days:
        return fixed_days[month_day]

    mothers_day = _nth_weekday_of_month(today.year, 5, 6, 2)  # Sunday=6, second Sunday of May
    if today.month == 5 and today.day == mothers_day:
        return "mothers_day"

    return None


def _daily_angel_number_for_user(user_id=None, day=None):
    base_day = day or datetime.now()
    seed = base_day.strftime('%Y-%m-%d')
    index = sum(ord(ch) for ch in seed) % len(ANGEL_NOTIFICATION_SEQUENCE)
    return ANGEL_NOTIFICATION_SEQUENCE[index]

def send_daily_fal_reminders():
    """Günlük fal hatırlatıcılarını gönder"""
    try:
        sent_count = 0

        for user in _iter_users({
            'notification_settings.daily_reminders': True,
            'notifications_enabled': True,
        }):
            if user.last_daily_reminder and getattr(user.last_daily_reminder, "date", lambda: None)() == datetime.now().date():
                continue
            if user.push_token and user.is_active:
                if not _claim_notification_dispatch("daily_reminder", user._id):
                    continue
                try:
                    sent = notification_service.send_daily_fal_reminder(
                        user.push_token, 
                        _display_name(user),
                        user.language,
                    )
                    if sent:
                        sent_count += 1
                        user.last_daily_reminder = datetime.now()
                        _append_notification_history(
                            user,
                            "daily_reminder",
                            "daily_reminder",
                            "sent",
                            {"screen": "Daily"},
                        )
                        user.save()
                except Exception as e:
                    logger.error(f"User {getattr(user, '_id', None)} için daily reminder gönderilemedi: {e}")
        
        logger.info(f"Daily reminder gönderildi: {sent_count} kullanıcı")
        
    except Exception as e:
        logger.error(f"Daily reminder job hatası: {e}")


def send_daily_angel_number_notifications():
    """Günlük melek sayısı işaretlerini gönder"""
    try:
        sent_count = 0

        for user in _iter_users({
            'notification_settings.angel_number_notifications': True,
            'notifications_enabled': True,
        }):
            if not user.push_token or not user.is_active:
                continue
            number = _daily_angel_number_for_user(user._id)
            if _has_history_entry_today(user, "angel_number_daily", {"number": number}):
                continue
            if not _claim_notification_dispatch("angel_number_daily", user._id, variant=number):
                continue
            try:
                sent = notification_service.send_daily_angel_number(
                    user.push_token,
                    number,
                    user.language,
                )
                if sent:
                    sent_count += 1
                    _append_notification_history(
                        user,
                        "angel_number_daily",
                        f"angel_number_daily_{number}",
                        "sent",
                        {"screen": "Angel Numbers", "number": number},
                    )
            except Exception as exc:
                logger.error(f"User {getattr(user, '_id', None)} için günlük melek sayısı gönderilemedi: {exc}")

        logger.info(f"Günlük melek sayısı bildirimleri gönderildi: {sent_count} kullanıcı")

    except Exception as e:
        logger.error(f"Günlük melek sayısı job hatası: {e}")

def send_premium_expiry_reminders():
    """Premium üyelik sona erme hatırlatıcılarını gönder"""
    try:
        now = datetime.now()
        reminder_window_end = now + timedelta(days=7)
        sent_count = 0

        subscriptions = db.premium_subscriptions.find({
            'is_active': True,
            'end_date': {'$gte': now, '$lte': reminder_window_end},
        })

        for subscription in subscriptions:
            user = User.find_by_id(subscription['user_id'])
            if not user or not user.push_token or not user.is_active:
                continue
            if not user.notifications_enabled:
                continue
            if not (user.notification_settings or {}).get('premium_notifications', True):
                continue

            days_left = max(0, (subscription['end_date'] - now).days)
            if days_left not in {7, 3, 1, 0}:
                continue
            if _has_history_entry_today(user, "premium_expiry", {"days_left": days_left}):
                continue
            if not _claim_notification_dispatch("premium_expiry", user._id, variant=str(days_left)):
                continue
            try:
                sent = notification_service.send_premium_expiry_reminder(
                    user.push_token,
                    _display_name(user),
                    days_left,
                    user.language,
                )
                if sent:
                    sent_count += 1
                    user.last_premium_reminder = now
                    _append_notification_history(
                        user,
                        "premium_expiry",
                        "premium_expiry",
                        "sent",
                        {"screen": "Premium", "days_left": days_left},
                    )
                    user.save()
            except Exception as exc:
                logger.error(f"User {getattr(user, '_id', None)} için premium reminder gönderilemedi: {exc}")

        logger.info(f"Premium expiry reminders gönderildi: {sent_count} kullanıcı")
        
    except Exception as e:
        logger.error(f"Premium expiry reminder job hatası: {e}")

def send_birthday_notifications():
    """Doğum günü bildirimlerini gönder"""
    try:
        today = datetime.now()
        sent_count = 0
        for user in _iter_users({
            'notification_settings.birthday_notifications': True,
            'notifications_enabled': True,
        }):
            if not user.birth_date:
                continue
            if user.birth_date.day != today.day or user.birth_date.month != today.month:
                continue
            if _has_history_entry_today(user, "birthday"):
                continue
            if user.push_token and user.is_active:
                if not _claim_notification_dispatch("birthday", user._id):
                    continue
                try:
                    sent = notification_service.send_birthday_notification(
                        user.push_token, 
                        _display_name(user),
                        user.language,
                    )
                    if sent:
                        sent_count += 1
                        _append_notification_history(
                            user,
                            "birthday",
                            "birthday",
                            "sent",
                            {"screen": "Yıldızname"},
                        )
                        user.save()
                except Exception as e:
                    logger.error(f"User {getattr(user, '_id', None)} için birthday notification gönderilemedi: {e}")
        
        logger.info(f"Birthday notifications gönderildi: {sent_count} kullanıcı")
        
    except Exception as e:
        logger.error(f"Birthday notification job hatası: {e}")

def check_special_days():
    """Özel günleri kontrol et ve bildirim gönder"""
    try:
        today = datetime.now()
        special_day_key = _get_special_day_key(today)

        if special_day_key:
            sent_count = 0
            for user in _iter_users({
                'notification_settings.special_day_notifications': True,
                'notifications_enabled': True,
            }):
                if _has_history_entry_today(user, "special_day", {"special_day": special_day_key}):
                    continue
                if user.push_token and user.is_active:
                    if not _claim_notification_dispatch("special_day", user._id, variant=special_day_key):
                        continue
                    try:
                        sent = notification_service.send_special_day_notification(
                            user.push_token, 
                            _display_name(user),
                            special_day_key,
                            user.language,
                        )
                        if sent:
                            sent_count += 1
                            _append_notification_history(
                                user,
                                "special_day",
                                "special_day",
                                "sent",
                                {"special_day": special_day_key},
                            )
                            user.save()
                    except Exception as e:
                        logger.error(f"User {getattr(user, '_id', None)} için special day notification gönderilemedi: {e}")
            
            logger.info(f"Special day notifications gönderildi: {sent_count} kullanıcı")
        
    except Exception as e:
        logger.error(f"Special day check job hatası: {e}")


def cleanup_old_coffee_uploads():
    """Kısa süreli saklanan kahve görsellerini temizle."""
    try:
        retention_hours = int(os.getenv("COFFEE_UPLOAD_RETENTION_HOURS", DEFAULT_COFFEE_UPLOAD_RETENTION_HOURS))
        cutoff = datetime.now() - timedelta(hours=retention_hours)
        root = Path(COFFEE_UPLOADS_DIR)

        if not root.exists():
            logger.info("Coffee upload dizini bulunamadı, cleanup atlandı")
            return

        deleted_files = 0
        deleted_dirs = 0

        for file_path in root.rglob("*"):
            if not file_path.is_file():
                continue
            modified_at = datetime.fromtimestamp(file_path.stat().st_mtime)
            if modified_at < cutoff:
                file_path.unlink(missing_ok=True)
                deleted_files += 1

        for dir_path in sorted(root.rglob("*"), reverse=True):
            if dir_path.is_dir() and not any(dir_path.iterdir()):
                dir_path.rmdir()
                deleted_dirs += 1

        logger.info(
            "Coffee upload cleanup tamamlandı: %s dosya, %s klasör silindi (retention=%s saat)",
            deleted_files,
            deleted_dirs,
            retention_hours,
        )
    except Exception as exc:
        logger.error(f"Coffee upload cleanup hatası: {exc}")

def setup_scheduler():
    """Scheduler'ı başlat ve job'ları ekle"""
    try:
        if scheduler.running:
            return

        # Günlük fal hatırlatıcısı - her gün saat 9:00'da
        scheduler.add_job(
            send_daily_fal_reminders,
            CronTrigger(hour=9, minute=0),
            id='daily_fal_reminders',
            name='Günlük Fal Hatırlatıcıları',
            replace_existing=True,
        )

        scheduler.add_job(
            send_daily_angel_number_notifications,
            CronTrigger(hour=13, minute=0),
            id='daily_angel_number_notifications',
            name='Günlük Melek Sayısı Bildirimleri',
            replace_existing=True,
        )
        
        # Premium üyelik hatırlatıcısı - her gün saat 10:00'da
        scheduler.add_job(
            send_premium_expiry_reminders,
            CronTrigger(hour=10, minute=0),
            id='premium_expiry_reminders',
            name='Premium Üyelik Hatırlatıcıları',
            replace_existing=True,
        )
        
        # Doğum günü bildirimleri - her gün saat 8:00'da
        scheduler.add_job(
            send_birthday_notifications,
            CronTrigger(hour=10, minute=0),
            id='birthday_notifications',
            name='Doğum Günü Bildirimleri',
            replace_existing=True,
        )
        
        # Özel gün kontrolü - her gün saat 7:00'da
        scheduler.add_job(
            check_special_days,
            CronTrigger(hour=11, minute=0),
            id='special_days_check',
            name='Özel Gün Kontrolü',
            replace_existing=True,
        )

        scheduler.add_job(
            cleanup_old_coffee_uploads,
            CronTrigger(hour=4, minute=0),
            id='coffee_upload_cleanup',
            name='Kahve Upload Temizliği',
            replace_existing=True,
        )
        
        # Scheduler'ı başlat
        scheduler.start()
        logger.info("Notification scheduler başlatıldı")
        
    except Exception as e:
        logger.error(f"Scheduler kurulum hatası: {e}")

def stop_scheduler():
    """Scheduler'ı durdur"""
    try:
        if scheduler.running:
            scheduler.shutdown()
            logger.info("Notification scheduler durduruldu")
    except Exception as e:
        logger.error(f"Scheduler durdurma hatası: {e}")
