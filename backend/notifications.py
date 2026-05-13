import requests
import os
from datetime import datetime, timedelta
import logging
import json

from config import load_environment

load_environment()

class NotificationService:
    def __init__(self):
        self.expo_api_url = "https://exp.host/--/api/v2/push/send"
        self.logger = logging.getLogger(__name__)
        self.supported_languages = {"tr", "en", "de"}
        self.angel_number_templates = {
            "111": {
                "tr": {"title": "👼 111 bugün seninle", "body": "Yeni bir başlangıç yaklaşıyor. Düşüncelerini net tut."},
                "en": {"title": "👼 111 is with you today", "body": "A new beginning is approaching. Keep your thoughts clear."},
                "de": {"title": "👼 111 begleitet dich heute", "body": "Ein neuer Anfang nähert sich. Halte deine Gedanken klar."},
            },
            "222": {
                "tr": {"title": "👼 222 dengeni çağırıyor", "body": "İlişkilerde sakin kal ve sürece güven."},
                "en": {"title": "👼 222 calls for balance", "body": "Stay calm in relationships and trust the process."},
                "de": {"title": "👼 222 ruft nach Balance", "body": "Bleib in Beziehungen ruhig und vertraue dem Prozess."},
            },
            "333": {
                "tr": {"title": "👼 333 sesini yükseltiyor", "body": "Yaratıcılığını saklama, görünür ol."},
                "en": {"title": "👼 333 lifts your voice", "body": "Do not hide your creativity. Let yourself be seen."},
                "de": {"title": "👼 333 stärkt deine Stimme", "body": "Verstecke deine Kreativität nicht. Zeig dich."},
            },
            "444": {
                "tr": {"title": "👼 444 seni koruyor", "body": "Bugün attığın adımlarda güven ve sağlamlık var."},
                "en": {"title": "👼 444 is protecting you", "body": "There is steadiness and safety in the steps you take today."},
                "de": {"title": "👼 444 schützt dich", "body": "In deinen heutigen Schritten liegen Stabilität und Schutz."},
            },
            "555": {
                "tr": {"title": "👼 555 değişimi fısıldıyor", "body": "Yaklaşan dönüşümü korkuyla değil akışla karşıla."},
                "en": {"title": "👼 555 whispers change", "body": "Meet the coming shift with flow instead of fear."},
                "de": {"title": "👼 555 kündigt Wandel an", "body": "Begegne dem kommenden Wandel mit Fluss statt mit Angst."},
            },
            "777": {
                "tr": {"title": "👼 777 sezgini güçlendiriyor", "body": "Bugün iç sesin sana doğru kapıyı gösterebilir."},
                "en": {"title": "👼 777 strengthens intuition", "body": "Today your inner voice may point you toward the right door."},
                "de": {"title": "👼 777 stärkt deine Intuition", "body": "Heute kann dich deine innere Stimme zur richtigen Tür führen."},
            },
            "888": {
                "tr": {"title": "👼 888 bolluğu yaklaştırıyor", "body": "Emeğinin karşılığını almaya biraz daha yakınsın."},
                "en": {"title": "👼 888 draws abundance closer", "body": "You are closer to receiving the return for your effort."},
                "de": {"title": "👼 888 bringt Fülle näher", "body": "Du bist dem Ertrag deiner Mühe ein Stück näher."},
            },
            "999": {
                "tr": {"title": "👼 999 bir döngüyü kapatıyor", "body": "Sana ait olmayanı bırakman için doğru zamandasın."},
                "en": {"title": "👼 999 closes a cycle", "body": "This is a good moment to release what no longer belongs to you."},
                "de": {"title": "👼 999 schließt einen Zyklus", "body": "Dies ist ein guter Moment, loszulassen, was nicht mehr zu dir gehört."},
            },
            "1111": {
                "tr": {"title": "👼 1111 kapıları açıyor", "body": "Niyetin ile gerçeğin arasındaki çizgi bugün daha güçlü."},
                "en": {"title": "👼 1111 opens doors", "body": "The line between intention and reality feels stronger today."},
                "de": {"title": "👼 1111 öffnet Türen", "body": "Die Verbindung zwischen Absicht und Realität wirkt heute stärker."},
            },
        }

    def _lang(self, language):
        return language if language in self.supported_languages else "tr"

    def _pick(self, language, templates):
        return templates.get(self._lang(language), templates["tr"])

    def send_notification(self, push_token, title, body, data=None, sound="default"):
        """Push notification gönder - HTTP requests kullanarak"""
        try:
            # Expo push notification payload
            payload = {
                "to": push_token,
                "title": title,
                "body": body,
                "data": data or {},
                "sound": sound,
                "badge": 1,
                "priority": "high"
            }

            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Accept-encoding": "gzip, deflate"
            }

            self.logger.info(f"Notification gönderiliyor: {title} -> {push_token[:20]}...")
            self.logger.info(f"Payload: {payload}")
            self.logger.info(f"Headers: {headers}")

            # Expo API'ye POST request gönder
            response = requests.post(
                self.expo_api_url,
                json=payload,
                headers=headers,
                timeout=30
            )

            self.logger.info(f"Response status: {response.status_code}")
            self.logger.info(f"Response text: {response.text}")

            if response.status_code == 200:
                result = response.json()
                if result.get('data') and result['data'].get('status') == 'ok':
                    self.logger.info(f"Notification gönderildi: {title} -> {push_token[:20]}...")
                    return True
                else:
                    self.logger.error(f"Notification gönderilemedi: {result}")
                    return False
            else:
                self.logger.error(f"Notification API hatası: {response.status_code} - {response.text}")
                return False

        except Exception as e:
            self.logger.error(f"Notification gönderme hatası: {e}")
            import traceback
            self.logger.error(f"Traceback: {traceback.format_exc()}")
            return False
    
    def send_daily_fal_reminder(self, push_token, user_name, language="tr"):
        """Günlük fal hatırlatıcısı"""
        content = self._pick(language, {
            "tr": {
                "title": "🔮 Günlük falın hazır",
                "body": f"{user_name}, bugünün enerjisini görmek için falına göz at.",
            },
            "en": {
                "title": "🔮 Your daily reading is ready",
                "body": f"{user_name}, take a look at your reading to see today's energy.",
            },
            "de": {
                "title": "🔮 Deine tägliche Legung ist bereit",
                "body": f"{user_name}, wirf einen Blick auf deine Legung und entdecke die Energie des Tages.",
            },
        })
        return self.send_notification(
            push_token=push_token,
            title=content["title"],
            body=content["body"],
            data={
                "type": "daily_reminder", 
                "screen": "Daily",
                "timestamp": datetime.now().isoformat()
            }
        )

    def send_daily_angel_number(self, push_token, number, language="tr"):
        template = self.angel_number_templates.get(str(number), self.angel_number_templates["444"])
        content = self._pick(language, template)
        return self.send_notification(
            push_token=push_token,
            title=content["title"],
            body=content["body"],
            data={
                "type": "angel_number_daily",
                "screen": "Angel Numbers",
                "number": str(number),
                "timestamp": datetime.now().isoformat(),
            }
        )
    
    def send_weekly_summary(self, push_token, user_name):
        """Haftalık fal özeti"""
        return self.send_notification(
            push_token=push_token,
            title="📊 Haftalık Fal Özetiniz",
            body=f"{user_name}, bu hafta hangi falları çektiniz? Kontrol edin!",
            data={
                "type": "weekly_summary", 
                "screen": "Profile",
                "timestamp": datetime.now().isoformat()
            }
        )
    
    def send_premium_expiry_reminder(self, push_token, user_name, days_left, language="tr"):
        """Premium üyelik sona erme hatırlatıcısı"""
        if days_left <= 0:
            content = self._pick(language, {
                "tr": {
                    "title": "⭐ Premium süren bugün bitiyor",
                    "body": f"{user_name}, ayrıcalıklarını kaybetmemek için premium üyeliğini kontrol et.",
                },
                "en": {
                    "title": "⭐ Your premium ends today",
                    "body": f"{user_name}, check your premium membership to keep your benefits active.",
                },
                "de": {
                    "title": "⭐ Dein Premium endet heute",
                    "body": f"{user_name}, prüfe deine Premium-Mitgliedschaft, damit deine Vorteile aktiv bleiben.",
                },
            })
        else:
            content = self._pick(language, {
                "tr": {
                    "title": "⭐ Premium süren yakında bitiyor",
                    "body": f"{user_name}, premium üyeliğin {days_left} gün içinde sona erecek.",
                },
                "en": {
                    "title": "⭐ Your premium ends soon",
                    "body": f"{user_name}, your premium membership will expire in {days_left} days.",
                },
                "de": {
                    "title": "⭐ Dein Premium endet bald",
                    "body": f"{user_name}, deine Premium-Mitgliedschaft endet in {days_left} Tagen.",
                },
            })
        return self.send_notification(
            push_token=push_token,
            title=content["title"],
            body=content["body"],
            data={
                "type": "premium_expiry", 
                "screen": "Premium",
                "days_left": days_left,
                "timestamp": datetime.now().isoformat()
            }
        )
    
    def send_fal_result_ready(self, push_token, user_name, fal_type):
        """Fal sonucu hazır bildirimi"""
        fal_names = {
            "yildizname": "Yıldızname",
            "tarot": "Tarot",
            "rune": "Rün",
            "chinese": "Çin",
            "coffee": "Kahve",
            "kabala": "Kabala"
        }
        
        return self.send_notification(
            push_token=push_token,
            title="✨ Fal Sonucunuz Hazır!",
            body=f"{user_name}, {fal_names.get(fal_type, fal_type)} falınızın sonucu hazır!",
            data={
                "type": "fal_result", 
                "fal_type": fal_type,
                "screen": "Result",
                "timestamp": datetime.now().isoformat()
            }
        )
    
    def send_new_feature_announcement(self, push_token, user_name, feature_name):
        """Yeni özellik duyurusu"""
        return self.send_notification(
            push_token=push_token,
            title="🎉 Yeni Özellik!",
            body=f"{user_name}, {feature_name} özelliği eklendi! Hemen deneyin!",
            data={
                "type": "new_feature", 
                "feature": feature_name,
                "screen": "Home",
                "timestamp": datetime.now().isoformat()
            }
        )
    
    def send_birthday_notification(self, push_token, user_name, language="tr"):
        """Doğum günü bildirimi"""
        content = self._pick(language, {
            "tr": {
                "title": "🎂 Doğum günün kutlu olsun",
                "body": f"{user_name}, yeni yaşının enerjisini keşfetmek için sana özel falına göz at.",
            },
            "en": {
                "title": "🎂 Happy birthday",
                "body": f"{user_name}, discover the energy of your new year with a reading made for you.",
            },
            "de": {
                "title": "🎂 Alles Gute zum Geburtstag",
                "body": f"{user_name}, entdecke die Energie deines neuen Lebensjahres mit einer Legung nur für dich.",
            },
        })
        return self.send_notification(
            push_token=push_token,
            title=content["title"],
            body=content["body"],
            data={
                "type": "birthday", 
                "screen": "Yıldızname",
                "timestamp": datetime.now().isoformat()
            },
            sound="birthday"
        )

    def send_special_day_notification(self, push_token, user_name, special_day_key, language="tr"):
        """Özel gün bildirimi"""
        special_day_templates = {
            "new_year": {
                "screen": "Ana Sayfa",
                "tr": {
                    "title": "✨ Yeni yıl, yeni enerji",
                    "body": f"{user_name}, yeni başlangıçların yılına nasıl bir enerjiyle girdiğini keşfet.",
                },
                "en": {
                    "title": "✨ New year, new energy",
                    "body": f"{user_name}, discover the energy you're bringing into this new year.",
                },
                "de": {
                    "title": "✨ Neues Jahr, neue Energie",
                    "body": f"{user_name}, entdecke mit welcher Energie du in dieses neue Jahr startest.",
                },
            },
            "valentines_day": {
                "screen": "Tarot",
                "tr": {
                    "title": "❤️ Aşk enerjisi bugün daha yakın",
                    "body": f"{user_name}, kalbini meşgul eden konular için aşk odaklı yorumunu keşfet.",
                },
                "en": {
                    "title": "❤️ Love feels closer today",
                    "body": f"{user_name}, explore a love-focused reading for what’s on your heart.",
                },
                "de": {
                    "title": "❤️ Die Liebesenergie ist heute näher",
                    "body": f"{user_name}, entdecke eine liebesbezogene Legung für das, was dein Herz bewegt.",
                },
            },
            "womens_day": {
                "screen": "Daily",
                "tr": {
                    "title": "🌸 Bugün senin ışığın parlıyor",
                    "body": f"{user_name}, içsel gücünü ve bugünün enerjisini keşfetmek için falına göz at.",
                },
                "en": {
                    "title": "🌸 Your light shines brighter today",
                    "body": f"{user_name}, check your reading to connect with your inner strength and today’s energy.",
                },
                "de": {
                    "title": "🌸 Heute leuchtet dein Licht heller",
                    "body": f"{user_name}, wirf einen Blick auf deine Legung und verbinde dich mit deiner inneren Kraft.",
                },
            },
            "mothers_day": {
                "screen": "Daily",
                "tr": {
                    "title": "💐 Bugün kalpten gelen bağlar öne çıkıyor",
                    "body": f"{user_name}, sevdiklerinle olan enerjini keşfetmek için bugünkü falına göz at.",
                },
                "en": {
                    "title": "💐 Heartfelt bonds feel stronger today",
                    "body": f"{user_name}, check today’s reading to explore the energy around your loved ones.",
                },
                "de": {
                    "title": "💐 Herzensbindungen fühlen sich heute stärker an",
                    "body": f"{user_name}, sieh dir deine heutige Legung an und entdecke die Energie deiner Liebsten.",
                },
            },
            "spring_equinox": {
                "screen": "Daily",
                "tr": {
                    "title": "🌿 Yeni bir denge dönemi başlıyor",
                    "body": f"{user_name}, ilkbahar ekinoksunun enerjisiyle içsel dengenizi keşfedin.",
                },
                "en": {
                    "title": "🌿 A new season of balance begins",
                    "body": f"{user_name}, discover your inner balance with the energy of the spring equinox.",
                },
                "de": {
                    "title": "🌿 Eine neue Zeit der Balance beginnt",
                    "body": f"{user_name}, entdecke deine innere Balance mit der Energie der Frühlings-Tagundnachtgleiche.",
                },
            },
            "summer_solstice": {
                "screen": "Daily",
                "tr": {
                    "title": "☀️ Günün enerjisi en yüksek noktasında",
                    "body": f"{user_name}, yaz gündönümünün parlak enerjisini bugünkü falında keşfet.",
                },
                "en": {
                    "title": "☀️ Today’s energy is at its brightest",
                    "body": f"{user_name}, explore the radiant energy of the summer solstice in today’s reading.",
                },
                "de": {
                    "title": "☀️ Die Energie des Tages ist auf ihrem Höhepunkt",
                    "body": f"{user_name}, entdecke die strahlende Energie der Sommersonnenwende in deiner heutigen Legung.",
                },
            },
            "autumn_equinox": {
                "screen": "Daily",
                "tr": {
                    "title": "🍂 Bırakma ve denge zamanı",
                    "body": f"{user_name}, sonbahar ekinoksu içe dönüş ve yenilenme için güçlü bir eşik sunuyor.",
                },
                "en": {
                    "title": "🍂 It’s time for release and balance",
                    "body": f"{user_name}, the autumn equinox offers a strong threshold for reflection and renewal.",
                },
                "de": {
                    "title": "🍂 Zeit für Loslassen und Balance",
                    "body": f"{user_name}, die Herbst-Tagundnachtgleiche ist ein kraftvoller Moment für Einkehr und Erneuerung.",
                },
            },
            "winter_solstice": {
                "screen": "Daily",
                "tr": {
                    "title": "❄️ İçe dönüş zamanı",
                    "body": f"{user_name}, kış gündönümünün derin enerjisiyle sezgilerine kulak ver.",
                },
                "en": {
                    "title": "❄️ Time to turn inward",
                    "body": f"{user_name}, listen to your intuition through the deep energy of the winter solstice.",
                },
                "de": {
                    "title": "❄️ Zeit, nach innen zu schauen",
                    "body": f"{user_name}, höre mit der tiefen Energie der Wintersonnenwende auf deine Intuition.",
                },
            },
        }

        template = special_day_templates.get(special_day_key)
        if not template:
            return False

        content = self._pick(language, template)
        return self.send_notification(
            push_token=push_token,
            title=content["title"],
            body=content["body"],
            data={
                "type": "special_day", 
                "special_day": special_day_key,
                "screen": template["screen"],
                "timestamp": datetime.now().isoformat()
            }
        )
    
    def send_test_notification(self, push_token, user_name):
        """Test notification"""
        return self.send_notification(
            push_token=push_token,
            title="🧪 Test Bildirimi",
            body=f"Merhaba {user_name}, bu bir test bildirimidir!",
            data={
                "type": "test",
                "timestamp": datetime.now().isoformat()
            }
        )
