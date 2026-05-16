import base64
import json
import os
import random
import re
import uuid
from datetime import datetime
from pathlib import Path

from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
import requests

from clients import g4f_client
from g4f.Provider import Blackbox, OIVSCodeSer2, PollinationsAI, WeWordle, Yqcloud
from chinese_data import ELEMENTS, YEAR_ELEMENTS, calculate_ba_zi
from config import get_backend_public_url
from models import Reading, User, calculate_zodiac_sign
from prompts.multilingual import get_prompt_by_language
from rate_limiting import daily_fal_rate_limit, fal_rate_limit
from redis_manager import redis_manager
from rune_data import get_random_runes
from tarot_data import get_random_tarot_cards
from tokens import spend_tokens_for_reading


fortune_bp = Blueprint("fortune", __name__)

INVALID_PROVIDER_MARKERS = (
    "The Pollinations legacy text API is being deprecated",
    "Please migrate to our new service at https://enter.pollinations.ai",
    "Anonymous requests to text.pollinations.ai are NOT affected",
    "Authentication Error, No api key passed in.",
    '"type":"error"',
    'data: {"type":"error"',
    "data: [DONE]",
)

DATA_URL_RE = re.compile(r"^data:(?P<mime>[\w/+.-]+);base64,(?P<data>.+)$", re.DOTALL)
COFFEE_MIME_EXTENSIONS = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/heic": ".heic",
    "image/heif": ".heif",
}

TEXT_PROVIDERS = [Blackbox, Yqcloud, WeWordle, PollinationsAI]
VISION_PROVIDER_ATTEMPTS = [
    (OIVSCodeSer2, "gpt-4o-mini"),
    (Blackbox, "gpt-4o"),
    (PollinationsAI, "openai"),
    (None, "gpt-4o"),
]
DEFAULT_GEMINI_COFFEE_MODEL = "gemini-2.5-flash"

EBCED_VALUES = {
    "a": 1,
    "â": 1,
    "b": 2,
    "c": 3,
    "ç": 3,
    "d": 4,
    "e": 5,
    "f": 80,
    "g": 1000,
    "ğ": 1000,
    "h": 8,
    "ı": 10,
    "i": 10,
    "î": 10,
    "j": 3,
    "k": 20,
    "l": 30,
    "m": 40,
    "n": 50,
    "o": 70,
    "ö": 70,
    "p": 80,
    "r": 200,
    "s": 60,
    "ş": 300,
    "t": 400,
    "u": 6,
    "ü": 6,
    "v": 6,
    "y": 10,
    "z": 7,
}

YILDIZNAME_PLANETS = {
    1: {"star": "Şems", "planet": "Güneş", "star_key": "sems", "planet_key": "sun"},
    2: {"star": "Kamer", "planet": "Ay", "star_key": "kamer", "planet_key": "moon"},
    3: {"star": "Merih", "planet": "Mars", "star_key": "merih", "planet_key": "mars"},
    4: {"star": "Utarid", "planet": "Merkür", "star_key": "utarid", "planet_key": "mercury"},
    5: {"star": "Müşteri", "planet": "Jüpiter", "star_key": "musteri", "planet_key": "jupiter"},
    6: {"star": "Zühre", "planet": "Venüs", "star_key": "zuhre", "planet_key": "venus"},
    7: {"star": "Zuhal", "planet": "Satürn", "star_key": "zuhal", "planet_key": "saturn"},
}

ELEMENT_RELATIONS = {
    "Wood": {"generates": "Fire", "controls": "Earth", "generated_by": "Water", "controlled_by": "Metal"},
    "Fire": {"generates": "Earth", "controls": "Metal", "generated_by": "Wood", "controlled_by": "Water"},
    "Earth": {"generates": "Metal", "controls": "Water", "generated_by": "Fire", "controlled_by": "Wood"},
    "Metal": {"generates": "Water", "controls": "Wood", "generated_by": "Earth", "controlled_by": "Fire"},
    "Water": {"generates": "Wood", "controls": "Fire", "generated_by": "Metal", "controlled_by": "Earth"},
}

KABALA_HEBREW_VALUES = {
    "א": 1,
    "ב": 2,
    "ג": 3,
    "ד": 4,
    "ה": 5,
    "ו": 6,
    "ז": 7,
    "ח": 8,
    "ט": 9,
    "י": 10,
    "כ": 20,
    "ל": 30,
    "מ": 40,
    "נ": 50,
    "ס": 60,
    "ע": 70,
    "פ": 80,
    "צ": 90,
    "ק": 100,
    "ר": 200,
    "ש": 300,
    "ת": 400,
}

KABALA_NAME_TO_HEBREW = {
    "a": "א",
    "b": "ב",
    "c": "ג",
    "d": "ד",
    "e": "ה",
    "f": "ו",
    "g": "ז",
    "h": "ח",
    "i": "י",
    "j": "י",
    "k": "כ",
    "l": "ל",
    "m": "מ",
    "n": "נ",
    "o": "ע",
    "p": "פ",
    "q": "ק",
    "r": "ר",
    "s": "ש",
    "t": "ת",
    "u": "ו",
    "v": "ו",
    "w": "ו",
    "x": "ס",
    "y": "י",
    "z": "ז",
}

NUMEROLOGY_CHAR_VALUES = {
    "a": 1,
    "j": 1,
    "s": 1,
    "ş": 1,
    "b": 2,
    "k": 2,
    "t": 2,
    "c": 3,
    "ç": 3,
    "l": 3,
    "u": 3,
    "ü": 3,
    "d": 4,
    "m": 4,
    "v": 4,
    "e": 5,
    "n": 5,
    "w": 5,
    "f": 6,
    "o": 6,
    "ö": 6,
    "x": 6,
    "g": 7,
    "ğ": 7,
    "p": 7,
    "y": 7,
    "h": 8,
    "q": 8,
    "z": 8,
    "i": 9,
    "ı": 9,
    "r": 9,
}

NUMEROLOGY_VOWELS = {"a", "e", "i", "ı", "o", "ö", "u", "ü"}

COMPATIBILITY_LEVELS = {
    "tr": {"high": "Yüksek Uyum", "medium": "Dengeli Uyum", "low": "Dönüştürücü Uyum"},
    "en": {"high": "High Compatibility", "medium": "Balanced Compatibility", "low": "Transformative Compatibility"},
    "de": {"high": "Hohe Kompatibilität", "medium": "Ausgewogene Kompatibilität", "low": "Transformative Kompatibilität"},
}

COMPATIBILITY_THEMES = {
    "tr": {
        "connection": "duygusal bağ ve güven",
        "movement": "birlikte büyüme ve yön değiştirme",
        "intensity": "yoğun çekim ve derin hisler",
        "grounding": "istikrar ve güven inşası",
        "communication": "iletişim, ifade ve açıklık",
        "healing": "iyileşme ve birbirini dönüştürme",
    },
    "en": {
        "connection": "emotional bonding and trust",
        "movement": "growth together and changing direction",
        "intensity": "strong attraction and deep feeling",
        "grounding": "stability and building safety",
        "communication": "communication, expression, and clarity",
        "healing": "healing and mutual transformation",
    },
    "de": {
        "connection": "emotionale Bindung und Vertrauen",
        "movement": "gemeinsames Wachstum und Richtungswechsel",
        "intensity": "starke Anziehung und tiefe Gefühle",
        "grounding": "Stabilität und Sicherheit",
        "communication": "Kommunikation, Ausdruck und Klarheit",
        "healing": "Heilung und gegenseitige Transformation",
    },
}

ANGEL_NUMBER_GUIDANCE = {
    "111": {
        "base_theme": {"tr": "niyetin güçlenmesi", "en": "intention strengthening", "de": "Stärkung deiner Absicht"},
        "guidance_focus": {"tr": "zihinsel netlik", "en": "mental clarity", "de": "mentale Klarheit"},
        "share_line": {"tr": "111 enerjisi yeni başlangıçları destekliyor.", "en": "111 energy is supporting new beginnings.", "de": "111 unterstützt neue Anfänge."},
    },
    "222": {
        "base_theme": {"tr": "denge ve sabır", "en": "balance and patience", "de": "Gleichgewicht und Geduld"},
        "guidance_focus": {"tr": "ilişkilerde uyum", "en": "harmony in relationships", "de": "Harmonie in Beziehungen"},
        "share_line": {"tr": "222 sana sakin kalıp sürece güvenmeni söylüyor.", "en": "222 asks you to stay calm and trust the process.", "de": "222 erinnert dich daran, ruhig zu bleiben und dem Prozess zu vertrauen."},
    },
    "333": {
        "base_theme": {"tr": "yaratıcılık ve ifade", "en": "creativity and expression", "de": "Kreativität und Ausdruck"},
        "guidance_focus": {"tr": "kendini görünür kılmak", "en": "making yourself visible", "de": "dich sichtbar machen"},
        "share_line": {"tr": "333 enerjisi sesini kısmaman gerektiğini söylüyor.", "en": "333 says your voice should not stay hidden.", "de": "333 sagt, dass deine Stimme nicht verborgen bleiben sollte."},
    },
    "444": {
        "base_theme": {"tr": "korunma ve sağlamlaşma", "en": "protection and stability", "de": "Schutz und Stabilität"},
        "guidance_focus": {"tr": "güvenli adımlar", "en": "steady steps", "de": "stabile Schritte"},
        "share_line": {"tr": "444 enerjisi seni koruyor ve temellerini güçlendiriyor.", "en": "444 is protecting you and strengthening your foundations.", "de": "444 schützt dich und stärkt dein Fundament."},
    },
    "555": {
        "base_theme": {"tr": "değişim ve hareket", "en": "change and movement", "de": "Veränderung und Bewegung"},
        "guidance_focus": {"tr": "esnek kalmak", "en": "staying flexible", "de": "flexibel bleiben"},
        "share_line": {"tr": "555 yaklaşan değişimi korkuyla değil akışla karşılamanı istiyor.", "en": "555 wants you to meet change with flow, not fear.", "de": "555 möchte, dass du Wandel mit Fluss statt mit Angst begegnest."},
    },
    "777": {
        "base_theme": {"tr": "içsel bilgelik", "en": "inner wisdom", "de": "innere Weisheit"},
        "guidance_focus": {"tr": "sezgilere güvenmek", "en": "trusting intuition", "de": "deiner Intuition vertrauen"},
        "share_line": {"tr": "777 enerjisi sana iç sesinin doğru kapıyı gösterdiğini hatırlatıyor.", "en": "777 reminds you that your inner voice knows the right door.", "de": "777 erinnert dich daran, dass deine innere Stimme die richtige Tür kennt."},
    },
    "888": {
        "base_theme": {"tr": "bolluk ve karşılık", "en": "abundance and return", "de": "Fülle und Ausgleich"},
        "guidance_focus": {"tr": "emeğinin karşılığını almak", "en": "receiving what you earned", "de": "den Ertrag deiner Mühe empfangen"},
        "share_line": {"tr": "888 enerjisi emeğinin karşılığının yaklaşmakta olduğunu söylüyor.", "en": "888 says the return for your effort is getting closer.", "de": "888 sagt, dass der Ertrag deiner Mühe näher rückt."},
    },
    "999": {
        "base_theme": {"tr": "tamamlanma ve bırakış", "en": "completion and release", "de": "Abschluss und Loslassen"},
        "guidance_focus": {"tr": "eski döngüyü kapatmak", "en": "closing an old cycle", "de": "einen alten Zyklus abschließen"},
        "share_line": {"tr": "999 enerjisi artık taşımaman gereken şeyi bırakmanı söylüyor.", "en": "999 says it is time to release what no longer belongs to you.", "de": "999 sagt, dass du loslassen darfst, was nicht mehr zu dir gehört."},
    },
    "1111": {
        "base_theme": {"tr": "eşzamanlılık ve açılan kapılar", "en": "synchronicity and opening doors", "de": "Synchronizität und sich öffnende Türen"},
        "guidance_focus": {"tr": "niyeti gerçeğe yaklaştırmak", "en": "bringing intention closer to reality", "de": "Absicht näher an die Wirklichkeit bringen"},
        "share_line": {"tr": "1111 bugün niyetinle gerçek arasındaki bağı güçlendiriyor.", "en": "1111 is strengthening the link between your intention and reality today.", "de": "1111 stärkt heute die Verbindung zwischen deiner Absicht und der Wirklichkeit."},
    },
}

SEFIROT_DATA = {
    "keter": {
        "hebrew": "א",
        "tr": {"name": "Keter (Taç)", "meaning": "İlahi irade, yüksek bilinç"},
        "en": {"name": "Keter (Crown)", "meaning": "Divine will, higher consciousness"},
        "de": {"name": "Keter (Krone)", "meaning": "Göttlicher Wille, höheres Bewusstsein"},
    },
    "hokmah": {
        "hebrew": "ב",
        "tr": {"name": "Hokmah (Bilgelik)", "meaning": "Erkek enerji, yaratıcı güç"},
        "en": {"name": "Hokmah (Wisdom)", "meaning": "Masculine energy, creative force"},
        "de": {"name": "Hokmah (Weisheit)", "meaning": "Männliche Energie, schöpferische Kraft"},
    },
    "binah": {
        "hebrew": "ג",
        "tr": {"name": "Binah (Anlayış)", "meaning": "Kadın enerji, analitik düşünce"},
        "en": {"name": "Binah (Understanding)", "meaning": "Feminine energy, analytical thought"},
        "de": {"name": "Binah (Verständnis)", "meaning": "Weibliche Energie, analytisches Denken"},
    },
    "hesed": {
        "hebrew": "ד",
        "tr": {"name": "Hesed (Merhamet)", "meaning": "Sevgi, cömertlik, bağışlama"},
        "en": {"name": "Hesed (Mercy)", "meaning": "Love, generosity, forgiveness"},
        "de": {"name": "Hesed (Barmherzigkeit)", "meaning": "Liebe, Großzügigkeit, Vergebung"},
    },
    "gevurah": {
        "hebrew": "ה",
        "tr": {"name": "Gevurah (Güç)", "meaning": "Adalet, disiplin, güç"},
        "en": {"name": "Gevurah (Strength)", "meaning": "Justice, discipline, strength"},
        "de": {"name": "Gevurah (Stärke)", "meaning": "Gerechtigkeit, Disziplin, Stärke"},
    },
    "tiferet": {
        "hebrew": "ו",
        "tr": {"name": "Tiferet (Güzellik)", "meaning": "Denge, uyum, güzellik"},
        "en": {"name": "Tiferet (Beauty)", "meaning": "Balance, harmony, beauty"},
        "de": {"name": "Tiferet (Schönheit)", "meaning": "Gleichgewicht, Harmonie, Schönheit"},
    },
    "netzach": {
        "hebrew": "ז",
        "tr": {"name": "Netzach (Zafer)", "meaning": "Dayanıklılık, zafer, süreklilik"},
        "en": {"name": "Netzach (Victory)", "meaning": "Endurance, victory, continuity"},
        "de": {"name": "Netzach (Sieg)", "meaning": "Ausdauer, Sieg, Beständigkeit"},
    },
    "hod": {
        "hebrew": "ח",
        "tr": {"name": "Hod (İhtişam)", "meaning": "Teşekkür, övgü, alçakgönüllülük"},
        "en": {"name": "Hod (Splendor)", "meaning": "Gratitude, praise, humility"},
        "de": {"name": "Hod (Pracht)", "meaning": "Dankbarkeit, Lob, Demut"},
    },
    "yesod": {
        "hebrew": "ט",
        "tr": {"name": "Yesod (Temel)", "meaning": "Temel, köprü, bağlantı"},
        "en": {"name": "Yesod (Foundation)", "meaning": "Foundation, bridge, connection"},
        "de": {"name": "Yesod (Fundament)", "meaning": "Fundament, Brücke, Verbindung"},
    },
    "malkhut": {
        "hebrew": "י",
        "tr": {"name": "Malkhut (Krallık)", "meaning": "Dünyevi tezahür, krallık"},
        "en": {"name": "Malkhut (Kingdom)", "meaning": "Earthly manifestation, kingdom"},
        "de": {"name": "Malkhut (Königreich)", "meaning": "Irdische Manifestation, Königreich"},
    },
}


def _looks_like_meta_string(value):
    if not isinstance(value, str):
        return False

    normalized = value.strip()
    if len(normalized) < 24:
        return False

    meta_markers = (
        "__MODEL__",
        "__type__",
        "process_completed",
        "process_generating",
        "close_stream",
        "interactive",
        "placeholder",
        "visible",
        "choices",
        "selected",
        "rank_eta",
        "average_duration",
        "changed_state_ids",
        "render_config",
    )
    return any(marker in normalized for marker in meta_markers)


def _extract_text_candidates(value, candidates):
    if isinstance(value, str):
        normalized = value.strip()
        if (
            normalized
            and len(normalized) >= 24
            and not _looks_like_meta_string(normalized)
            and not any(marker in normalized for marker in INVALID_PROVIDER_MARKERS)
            and not normalized.startswith("data: ")
        ):
            candidates.append(normalized)
        return

    if isinstance(value, dict):
        for nested in value.values():
            _extract_text_candidates(nested, candidates)
        return

    if isinstance(value, list):
        for nested in value:
            _extract_text_candidates(nested, candidates)


def _normalize_provider_content(content):
    if not content:
        return None

    normalized = content.strip()
    if not normalized:
        return None

    if any(marker in normalized for marker in INVALID_PROVIDER_MARKERS):
        return None

    if not normalized.startswith("data: "):
        return normalized

    candidates = []
    for raw_line in normalized.splitlines():
        line = raw_line.strip()
        if not line.startswith("data: "):
            continue

        payload = line[6:].strip()
        if not payload or payload == "[DONE]":
            continue

        try:
            parsed = json.loads(payload)
        except json.JSONDecodeError:
            if len(payload) >= 24 and not _looks_like_meta_string(payload):
                candidates.append(payload)
            continue

        if isinstance(parsed, dict) and (
            parsed.get("type") == "error"
            or parsed.get("error")
            or parsed.get("errorText")
            or parsed.get("success") is False
        ):
            return None

        _extract_text_candidates(parsed, candidates)

    if not candidates:
        return None

    return max(candidates, key=len)


def _json_body():
    return request.get_json() or {}


def _load_user_or_404():
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    if not user:
        return None, user_id, (jsonify({"error": "Kullanıcı bulunamadı"}), 404)
    return user, user_id, None


def _validate_required_fields(data, fields):
    for field in fields:
        if not data.get(field):
            return jsonify({"error": f"{field} alanı gereklidir"}), 422
    return None


def _ensure_access_for_reading(user, user_id, reading_type):
    if user.has_active_premium():
        return user, None

    success, message = spend_tokens_for_reading(user_id, reading_type)
    if not success:
        return None, (jsonify({"error": message}), 400)

    refreshed_user = User.find_by_id(user_id)
    return refreshed_user, None


def _save_reading(user_id, reading_type, input_data, result):
    reading = Reading(
        user_id=user_id,
        reading_type=reading_type,
        input_data=input_data,
        result=result,
    )
    reading.save()
    return reading


def _normalize_ebced_text(text):
    if not text:
        return ""

    lowered = text.strip().lower()
    return "".join(character for character in lowered if character in EBCED_VALUES)


def _calculate_ebced_value(text):
    normalized = _normalize_ebced_text(text)
    return sum(EBCED_VALUES.get(character, 0) for character in normalized)


def _get_yildizname_analysis(isim, anne_adi):
    isim_ebced = _calculate_ebced_value(isim)
    anne_adi_ebced = _calculate_ebced_value(anne_adi)
    toplam_ebced = isim_ebced + anne_adi_ebced
    yildiz_sayisi = ((toplam_ebced - 1) % 7) + 1 if toplam_ebced > 0 else 1
    yildiz_info = YILDIZNAME_PLANETS[yildiz_sayisi]

    return {
        "isim_ebced": isim_ebced,
        "anne_adi_ebced": anne_adi_ebced,
        "toplam_ebced": toplam_ebced,
        "yildiz_sayisi": yildiz_sayisi,
        "hakim_yildiz": yildiz_info["star"],
        "hakim_gezegen": yildiz_info["planet"],
        "hakim_yildiz_key": yildiz_info["star_key"],
        "hakim_gezegen_key": yildiz_info["planet_key"],
    }


def _get_bazi_analysis(ba_zi_result, element_counts, birth_date, language="tr"):
    day_master = ba_zi_result.get("day_element", "")
    dominant_element = None
    missing_elements = []

    if isinstance(element_counts, dict) and element_counts:
        dominant_element = max(element_counts, key=element_counts.get)
        missing_elements = [element for element, count in element_counts.items() if count == 0]

    relations = ELEMENT_RELATIONS.get(day_master, {})
    ten_gods = {
        "wealth": relations.get("controls"),
        "power": relations.get("controlled_by"),
        "resource": relations.get("generated_by"),
        "output": relations.get("generates"),
    }

    current_year = datetime.now().year
    current_year_element = YEAR_ELEMENTS[current_year % 10]
    if language == "en":
        if current_year_element == day_master:
            life_phase_hint = f"The {current_year_element} influence resonates with the Day Master; identity and direction themes are strengthening."
        elif current_year_element == ten_gods["resource"]:
            life_phase_hint = f"The {current_year_element} influence creates a nourishing cycle; support and recovery themes are becoming stronger."
        elif current_year_element == ten_gods["power"]:
            life_phase_hint = f"The {current_year_element} influence may increase pressure and responsibility; a phase of structure-building is highlighted."
        elif current_year_element == ten_gods["wealth"]:
            life_phase_hint = f"The {current_year_element} influence brings money, opportunity, and material movement into focus."
        else:
            life_phase_hint = f"The {current_year_element} influence may trigger themes of expression, productivity, and directional change."
    elif language == "de":
        if current_year_element == day_master:
            life_phase_hint = f"Der Einfluss von {current_year_element} schwingt mit dem Day Master mit; Identität und Richtung werden stärker betont."
        elif current_year_element == ten_gods["resource"]:
            life_phase_hint = f"Der Einfluss von {current_year_element} erzeugt einen nährenden Zyklus; Unterstützung und Erholung treten in den Vordergrund."
        elif current_year_element == ten_gods["power"]:
            life_phase_hint = f"Der Einfluss von {current_year_element} kann Druck und Verantwortung erhöhen; eine Phase des Strukturaufbaus wird betont."
        elif current_year_element == ten_gods["wealth"]:
            life_phase_hint = f"Der Einfluss von {current_year_element} rückt Geld, Chancen und materielle Bewegung in den Vordergrund."
        else:
            life_phase_hint = f"Der Einfluss von {current_year_element} kann Themen wie Ausdruck, Produktivität und Richtungswechsel auslösen."
    else:
        if current_year_element == day_master:
            life_phase_hint = f"{current_year_element} etkisi Day Master ile aynı frekansta; kimlik ve yön teması güçleniyor."
        elif current_year_element == ten_gods["resource"]:
            life_phase_hint = f"{current_year_element} etkisi seni besleyen bir döngü yaratıyor; destek ve toparlanma teması baskın."
        elif current_year_element == ten_gods["power"]:
            life_phase_hint = f"{current_year_element} etkisi baskı ve sorumlulukları artırabilir; yapı kurma dönemi öne çıkıyor."
        elif current_year_element == ten_gods["wealth"]:
            life_phase_hint = f"{current_year_element} etkisi para, fırsat ve maddi hareketlilik temasını öne çıkarıyor."
        else:
            life_phase_hint = f"{current_year_element} etkisi üretim, ifade ve yön değişimi temalarını tetikleyebilir."

    return {
        "day_master": day_master,
        "dominant_element": dominant_element,
        "missing_elements": missing_elements,
        "ten_gods": ten_gods,
        "life_phase_hint": life_phase_hint,
        "current_year_element": current_year_element,
        "birth_date": birth_date,
    }


def _get_kabala_analysis(isim, language="tr"):
    locale = language if language in ("tr", "en", "de") else "tr"
    hebrew_name = "".join(
        KABALA_NAME_TO_HEBREW[letter]
        for letter in isim.lower()
        if letter in KABALA_NAME_TO_HEBREW
    )
    name_value = sum(KABALA_HEBREW_VALUES.get(letter, 0) for letter in hebrew_name)
    reduced_value = sum(int(digit) for digit in str(name_value)) if name_value else 0
    while reduced_value > 9:
        reduced_value = sum(int(digit) for digit in str(reduced_value))

    selected_keys = random.sample(list(SEFIROT_DATA.keys()), random.randint(1, 3))
    selected_sefirot = []
    for key in selected_keys:
        payload = SEFIROT_DATA[key]
        localized = payload[locale]
        selected_sefirot.append(
            {
                "key": key,
                "name": localized["name"],
                "hebrew": payload["hebrew"],
                "meaning": localized["meaning"],
                "description": localized["meaning"],
            }
        )

    return {
        "hebrew_name": hebrew_name,
        "name_value": name_value,
        "reduced_value": reduced_value,
        "selected_sefirot": selected_sefirot,
    }


def _reduce_numerology_number(value, preserve_master=True):
    value = abs(int(value or 0))
    if value == 0:
        return 0

    while value > 9:
        if preserve_master and value in (11, 22, 33):
            return value
        value = sum(int(digit) for digit in str(value))
    return value


def _normalize_numerology_name(text):
    if not text:
        return ""
    return "".join(
        character for character in text.strip().lower() if character in NUMEROLOGY_CHAR_VALUES
    )


def _calculate_name_number(name, mode="all"):
    normalized = _normalize_numerology_name(name)
    if not normalized:
        return 0

    characters = []
    for character in normalized:
        is_vowel = character in NUMEROLOGY_VOWELS
        if mode == "vowels" and not is_vowel:
            continue
        if mode == "consonants" and is_vowel:
            continue
        characters.append(character)

    if not characters:
        return 0

    total = sum(NUMEROLOGY_CHAR_VALUES[character] for character in characters)
    return _reduce_numerology_number(total, preserve_master=True)


def _calculate_life_path_number(birth_date):
    try:
        digits = [int(character) for character in birth_date if character.isdigit()]
    except Exception:
        return 0

    if not digits:
        return 0

    return _reduce_numerology_number(sum(digits), preserve_master=True)


def _get_numerology_analysis(isim, dogum_tarihi):
    life_path = _calculate_life_path_number(dogum_tarihi)
    destiny_number = _calculate_name_number(isim, mode="all")
    soul_urge = _calculate_name_number(isim, mode="vowels")
    personality_number = _calculate_name_number(isim, mode="consonants")

    return {
        "life_path": life_path,
        "destiny_number": destiny_number,
        "soul_urge": soul_urge,
        "personality_number": personality_number,
    }


def _compatibility_theme_for_value(value):
    themes = ["connection", "movement", "intensity", "grounding", "communication", "healing"]
    return themes[value % len(themes)]


def _get_compatibility_analysis(kisi1_isim, kisi1_dogum_tarihi, kisi2_isim, kisi2_dogum_tarihi, iliski_turu, language="tr"):
    locale = language if language in ("tr", "en", "de") else "tr"
    p1_life_path = _calculate_life_path_number(kisi1_dogum_tarihi)
    p2_life_path = _calculate_life_path_number(kisi2_dogum_tarihi)
    p1_destiny = _calculate_name_number(kisi1_isim, mode="all")
    p2_destiny = _calculate_name_number(kisi2_isim, mode="all")

    life_gap = abs(p1_life_path - p2_life_path)
    destiny_gap = abs(p1_destiny - p2_destiny)
    score = max(58, 96 - (life_gap * 7) - (destiny_gap * 4))
    if iliski_turu == "ask":
        score = min(99, score + 3)
    elif iliski_turu == "arkadaslik":
        score = min(99, score + 1)

    if score >= 85:
        score_key = "high"
    elif score >= 72:
        score_key = "medium"
    else:
        score_key = "low"

    core_theme_key = _compatibility_theme_for_value(p1_life_path + p2_life_path)
    friction_theme_key = _compatibility_theme_for_value(abs(p1_destiny - p2_destiny) + p1_life_path)
    guidance_theme_key = _compatibility_theme_for_value(score + p2_destiny)

    return {
        "person1_life_path": p1_life_path,
        "person2_life_path": p2_life_path,
        "person1_destiny": p1_destiny,
        "person2_destiny": p2_destiny,
        "score": score,
        "score_label": COMPATIBILITY_LEVELS[locale][score_key],
        "core_theme": COMPATIBILITY_THEMES[locale][core_theme_key],
        "friction_theme": COMPATIBILITY_THEMES[locale][friction_theme_key],
        "guidance_theme": COMPATIBILITY_THEMES[locale][guidance_theme_key],
    }


def _get_angel_number_analysis(sayi, language="tr"):
    locale = language if language in ("tr", "en", "de") else "tr"
    normalized = "".join(character for character in str(sayi).strip() if character.isdigit())
    if not normalized:
        raise ValueError("Geçerli bir melek sayısı girin")

    digits = [int(character) for character in normalized]
    digit_sum = _reduce_numerology_number(sum(digits), preserve_master=False)
    preset = ANGEL_NUMBER_GUIDANCE.get(normalized)

    if preset:
        return {
            "normalized_number": normalized,
            "digit_sum": digit_sum,
            "base_theme": preset["base_theme"][locale],
            "guidance_focus": preset["guidance_focus"][locale],
            "share_line": preset["share_line"][locale],
        }

    generic_focus = {
        "tr": "tekrar eden işaretleri görmek",
        "en": "noticing repeating signs",
        "de": "wiederkehrende Zeichen wahrnehmen",
    }
    generic_theme = {
        "tr": "tekrarlayan sayı mesajı",
        "en": "a repeating number message",
        "de": "eine wiederkehrende Zahlenbotschaft",
    }
    generic_share = {
        "tr": f"{normalized} bugün sana yönünü sakinlikle hatırlatıyor.",
        "en": f"{normalized} is gently reminding you of your direction today.",
        "de": f"{normalized} erinnert dich heute ruhig an deine Richtung.",
    }

    return {
        "normalized_number": normalized,
        "digit_sum": digit_sum,
        "base_theme": generic_theme[locale],
        "guidance_focus": generic_focus[locale],
        "share_line": generic_share[locale],
    }


def _create_completion(prompt, timeout=None, images=None):
    last_error = None

    provider_attempts = (
        VISION_PROVIDER_ATTEMPTS
        if images
        else [(provider, "gpt-4") for provider in [*TEXT_PROVIDERS, None]]
    )

    for provider, model in provider_attempts:
        completion_kwargs = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "web_search": False,
        }
        if provider is not None:
            completion_kwargs["provider"] = provider
        if timeout is not None:
            completion_kwargs["timeout"] = timeout
        if images:
            completion_kwargs["media"] = images

        try:
            response = g4f_client.chat.completions.create(**completion_kwargs)
            content = response.choices[0].message.content
            normalized_content = _normalize_provider_content(content)

            if not normalized_content:
                current_app.logger.warning(
                    "G4F provider %s gecersiz/ham icerik dondurdu",
                    getattr(provider, "__name__", str(provider or "default_router")),
                )
                last_error = ValueError("Provider gecersiz icerik dondurdu")
                continue

            return normalized_content
        except Exception as exc:
            current_app.logger.warning(
                "G4F provider %s basarisiz oldu: %s",
                getattr(provider, "__name__", str(provider or "default_router")),
                exc,
            )
            last_error = exc

    raise last_error or RuntimeError("Fal yorumu olusturulamadi")


def _persist_coffee_images(images, user_id):
    upload_root = Path(current_app.config["COFFEE_UPLOADS_DIR"])
    dated_dir = upload_root / datetime.now().strftime("%Y/%m/%d") / str(user_id)
    dated_dir.mkdir(parents=True, exist_ok=True)

    public_base = get_backend_public_url()
    persisted = []

    for index, image in enumerate(images, start=1):
        match = DATA_URL_RE.match((image or "").strip())
        if not match:
            persisted.append({"path": None, "url": None})
            continue

        mime_type = match.group("mime").lower()
        encoded_data = match.group("data")
        extension = COFFEE_MIME_EXTENSIONS.get(mime_type, ".jpg")
        filename = f"{datetime.now().strftime('%H%M%S')}_{index}_{uuid.uuid4().hex[:10]}{extension}"
        file_path = dated_dir / filename

        binary = base64.b64decode(encoded_data, validate=False)
        file_path.write_bytes(binary)

        relative_path = file_path.relative_to(upload_root).as_posix()
        persisted.append(
            {
                "path": relative_path,
                "url": f"{public_base}/uploads/coffee/{relative_path}",
            }
        )

    return persisted


def _strip_code_fences(text):
    if not isinstance(text, str):
        return text

    normalized = text.strip()
    if normalized.startswith("```"):
        normalized = normalized.split("\n", 1)[1] if "\n" in normalized else normalized
        if normalized.endswith("```"):
            normalized = normalized[:-3]
    return normalized.strip()


def _get_gemini_coffee_model():
    return (os.getenv("GEMINI_COFFEE_MODEL") or os.getenv("GEMINI_MODEL") or DEFAULT_GEMINI_COFFEE_MODEL).strip()


def _build_gemini_image_part(image_value):
    normalized = (image_value or "").strip()
    if not normalized:
        raise ValueError("Bos gorsel gonderildi")

    default_mime_type = "image/jpeg"
    if normalized.startswith("data:"):
        header, _, encoded = normalized.partition(",")
        mime_type = header[5:].split(";", 1)[0].strip() or default_mime_type
        return {
            "inline_data": {
                "mime_type": mime_type,
                "data": encoded.strip(),
            }
        }

    return {
        "inline_data": {
            "mime_type": default_mime_type,
            "data": normalized,
        }
    }


def _extract_gemini_text(response_json):
    candidates = response_json.get("candidates") or []
    for candidate in candidates:
        content = candidate.get("content") or {}
        for part in content.get("parts") or []:
            text = part.get("text")
            if isinstance(text, str) and text.strip():
                return text.strip()

    prompt_feedback = response_json.get("promptFeedback") or {}
    block_reason = prompt_feedback.get("blockReason")
    if block_reason:
        raise RuntimeError(f"Gemini istegi engelledi: {block_reason}")

    raise RuntimeError("Gemini yanitinda okunabilir metin bulunamadi")


def _get_gemini_finish_reason(response_json):
    candidates = response_json.get("candidates") or []
    if not candidates:
        return None
    return candidates[0].get("finishReason")


def _safe_parse_gemini_json(raw_text):
    normalized = _strip_code_fences(raw_text)
    if not isinstance(normalized, str) or not normalized.strip():
        raise ValueError("Gemini bos JSON metni dondurdu")
    try:
        return json.loads(normalized)
    except json.JSONDecodeError:
        start = normalized.find("{")
        end = normalized.rfind("}")
        if start != -1 and end != -1 and end > start:
            sliced = normalized[start : end + 1]
            try:
                return json.loads(sliced)
            except json.JSONDecodeError:
                normalized = sliced

    sanitized = normalized.replace("\r\n", "\n").replace("\r", "\n")
    for trailer in ("\n```", "```"):
        if sanitized.endswith(trailer):
            sanitized = sanitized[: -len(trailer)]
    sanitized = sanitized.strip()
    return json.loads(sanitized)


def _gemini_post(contents, generation_config=None, timeout=90):
    api_key = (os.getenv("GEMINI_API_KEY") or "").strip()
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY tanimli degil")
    payload = {
        "contents": contents,
    }
    if generation_config:
        payload["generationConfig"] = generation_config

    model = _get_gemini_coffee_model()
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    response = requests.post(
        url,
        headers={
            "x-goog-api-key": api_key,
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=timeout,
    )

    if response.status_code >= 400:
        try:
            error_payload = response.json()
        except ValueError:
            error_payload = response.text.strip()
        raise RuntimeError(f"Gemini istegi basarisiz oldu: {response.status_code} {error_payload}")

    return response.json(), model


def _gemini_generate_coffee_reading(images, language="tr", question=""):
    reading_prompt = get_prompt_by_language(
        "coffee",
        language,
        soru=question,
        image_count=len(images),
    ).strip()
    response_json, model = _gemini_post(
        contents=[
            {
                "parts": [
                    {"text": reading_prompt},
                    *[_build_gemini_image_part(image) for image in images],
                ]
            }
        ],
        generation_config={
            "temperature": 0.55,
            "maxOutputTokens": 4000,
            "responseMimeType": "text/plain",
        },
        timeout=90,
    )
    finish_reason = _get_gemini_finish_reason(response_json)
    if finish_reason == "MAX_TOKENS":
        raise RuntimeError("Gemini kahve yorumu token sinirina takildi")
    reading = _extract_gemini_text(response_json).strip()
    if not reading:
        raise RuntimeError("Gemini kahve yorumu bos dondu")
    return {
        "reading": reading,
        "model": model,
    }


def _validate_coffee_images(images, language="tr"):
    validation_prompt = {
        "tr": """
Kullanıcı 3 görsel yükledi. Görevin bunların Türk kahvesi falı için uygun olup olmadığını doğrulamak.

Kontrol kriterleri:
- Görsellerde gerçekten kahve fincanı veya fincan içi görünmeli.
- En azından çoğunda kahve telvesi seçilebilmeli.
- Görseller tamamen alakasız nesneler, selfie, ekran görüntüsü, manzara vb. olmamalı.
- Fincan içi neredeyse hiç görünmüyorsa veya telve okunamayacak kadar belirsizse geçersiz say.

Sadece geçerli JSON döndür. Başka hiçbir metin yazma.
Format tam olarak şu olsun:
{"is_valid": true, "reason": "kısa açıklama"}
veya
{"is_valid": false, "reason": "kısa açıklama"}
""",
        "en": """
The user uploaded 3 images. Your task is to validate whether they are suitable for a Turkish coffee fortune reading.

Validation criteria:
- The images should actually show a coffee cup or the inside of a cup.
- Coffee grounds should be visible in most of the images.
- The images must not be unrelated objects, selfies, screenshots, landscapes, or random scenes.
- If the inside of the cup is barely visible or the grounds are too unclear to interpret, mark them invalid.

Return valid JSON only. Do not write anything else.
Use exactly this format:
{"is_valid": true, "reason": "short explanation"}
or
{"is_valid": false, "reason": "short explanation"}
""",
        "de": """
Der Nutzer hat 3 Bilder hochgeladen. Deine Aufgabe ist zu pruefen, ob sie fuer eine türkische Kaffeesatz-Deutung geeignet sind.

Pruefkriterien:
- Die Bilder sollen tatsaechlich eine Kaffeetasse oder das Innere der Tasse zeigen.
- Kaffeesatz sollte in den meisten Bildern sichtbar sein.
- Die Bilder duerfen keine unpassenden Objekte, Selfies, Screenshots, Landschaften oder zufaellige Szenen zeigen.
- Wenn das Innere der Tasse kaum sichtbar ist oder der Satz zu unklar fuer eine Deutung ist, markiere sie als ungueltig.

Gib nur gueltiges JSON zurueck. Schreibe nichts anderes.
Nutze genau dieses Format:
{"is_valid": true, "reason": "kurze Erklaerung"}
oder
{"is_valid": false, "reason": "kurze Erklaerung"}
""",
    }.get(language, None) or {
        "tr": """
Kullanıcı 3 görsel yükledi. Görevin bunların Türk kahvesi falı için uygun olup olmadığını doğrulamak.

Kontrol kriterleri:
- Görsellerde gerçekten kahve fincanı veya fincan içi görünmeli.
- En azından çoğunda kahve telvesi seçilebilmeli.
- Görseller tamamen alakasız nesneler, selfie, ekran görüntüsü, manzara vb. olmamalı.
- Fincan içi neredeyse hiç görünmüyorsa veya telve okunamayacak kadar belirsizse geçersiz say.

Sadece geçerli JSON döndür. Başka hiçbir metin yazma.
Format tam olarak şu olsun:
{"is_valid": true, "reason": "kısa açıklama"}
veya
{"is_valid": false, "reason": "kısa açıklama"}
"""
    }["tr"]

    try:
        raw_validation = _create_completion(validation_prompt, timeout=35, images=images)
    except Exception as exc:
        current_app.logger.warning("Kahve gorsel validasyonu calisamadi: %s", exc)
        return False, "__validation_unavailable__"

    normalized = _strip_code_fences(raw_validation)

    try:
        parsed = json.loads(normalized)
    except json.JSONDecodeError:
        start = normalized.find("{")
        end = normalized.rfind("}")
        if start == -1 or end == -1 or end <= start:
            current_app.logger.warning("Kahve gorsel validasyonu parse edilemedi: %s", raw_validation)
            return False, "__validation_unavailable__"
        try:
            parsed = json.loads(normalized[start : end + 1])
        except json.JSONDecodeError:
            current_app.logger.warning("Kahve gorsel validasyonu parse edilemedi: %s", raw_validation)
            return False, "__validation_unavailable__"

    return bool(parsed.get("is_valid")), (parsed.get("reason") or "").strip() or None


@fortune_bp.route("/yildizname", methods=["POST"])
@jwt_required()
@fal_rate_limit()
def yildizname():
    try:
        user, user_id, error_response = _load_user_or_404()
        if error_response:
            return error_response

        data = _json_body()
        validation_error = _validate_required_fields(
            data,
            ["isim", "anneAdi", "dogumTarihi", "dogumSaati"],
        )
        if validation_error:
            return validation_error

        reading_tier = "premium" if user.has_active_premium() else "free"
        analysis = _get_yildizname_analysis(data["isim"], data["anneAdi"])

        user, access_error = _ensure_access_for_reading(user, user_id, "yildizname")
        if access_error:
            return access_error

        cache_key = (
            f"yildizname:{reading_tier}:{data['isim']}:{data['anneAdi']}:{data['dogumTarihi']}:"
            f"{data.get('dogumYeri', '')}:{data['dogumSaati']}:{analysis['toplam_ebced']}"
        )
        cached_result = redis_manager.get(cache_key)
        if cached_result:
            if isinstance(cached_result, dict):
                cached_payload = dict(cached_result)
            else:
                cached_payload = {
                    "success": True,
                    "yorum": cached_result,
                    "reading_tier": reading_tier,
                    "analysis": analysis,
                }
            cached_payload["from_cache"] = True
            cached_payload["reading_id"] = "cached"
            return jsonify(cached_payload), 200

        language = data.get("language", "tr")
        prompt = get_prompt_by_language(
            "yildizname",
            language,
            isim=data["isim"],
            anneAdi=data["anneAdi"],
            dogumTarihi=data["dogumTarihi"],
            dogumYeri=data.get("dogumYeri", ""),
            dogumSaati=data["dogumSaati"],
            reading_tier=reading_tier,
            **analysis,
        )
        yorum = _create_completion(prompt)
        reading = _save_reading(user_id, "yildizname", data, yorum)
        response_payload = {
            "success": True,
            "yorum": yorum,
            "from_cache": False,
            "reading_id": str(reading._id),
            "reading_tier": reading_tier,
            "analysis": analysis,
        }
        redis_manager.set(cache_key, response_payload, ttl=3600)

        return jsonify(response_payload), 200
    except Exception as exc:
        current_app.logger.exception("Yildizname falı hatası")
        return jsonify({"error": "Yıldızname falı oluşturulurken bir hata oluştu"}), 500


@fortune_bp.route("/rune", methods=["POST"])
@jwt_required()
@fal_rate_limit()
def rune():
    try:
        user, user_id, error_response = _load_user_or_404()
        if error_response:
            return error_response

        data = _json_body()
        validation_error = _validate_required_fields(data, ["soru"])
        if validation_error:
            return validation_error

        reading_tier = "premium" if user.has_active_premium() else "free"
        user, access_error = _ensure_access_for_reading(user, user_id, "rune")
        if access_error:
            return access_error

        language = data.get("language", "tr")
        cache_key = f"rune:{reading_tier}:{data['soru']}:{language}:{user_id}"
        cached_result = redis_manager.get(cache_key)
        if cached_result:
            if isinstance(cached_result, dict):
                cached_payload = dict(cached_result)
            else:
                cached_payload = {
                    "success": True,
                    "yorum": cached_result,
                    "reading_tier": reading_tier,
                    "question": data["soru"],
                    "runes": [],
                    "language": language,
                }
            cached_payload["from_cache"] = True
            cached_payload["reading_id"] = "cached"
            return jsonify(
                cached_payload
            ), 200

        runes = get_random_runes(3)
        prompt = get_prompt_by_language(
            "rune",
            language,
            soru=data["soru"],
            runes=runes,
            reading_tier=reading_tier,
        )
        yorum = _create_completion(prompt)
        reading = _save_reading(user_id, "rune", data, yorum)
        response_payload = {
            "success": True,
            "runes": runes,
            "yorum": yorum,
            "from_cache": False,
            "reading_id": str(reading._id),
            "reading_tier": reading_tier,
            "question": data["soru"],
            "language": language,
        }
        redis_manager.set(cache_key, response_payload, ttl=3600)

        return jsonify(response_payload), 200
    except Exception:
        current_app.logger.exception("Rune falı hatası")
        return jsonify({"error": "Rune falı oluşturulurken bir hata oluştu"}), 500


@fortune_bp.route("/chinese", methods=["POST"])
@jwt_required()
def chinese_fortune():
    try:
        user, user_id, error_response = _load_user_or_404()
        if error_response:
            return error_response

        data = _json_body()
        validation_error = _validate_required_fields(data, ["dogumTarihi", "dogumSaati"])
        if validation_error:
            return validation_error

        user, access_error = _ensure_access_for_reading(user, user_id, "chinese")
        if access_error:
            return access_error

        ba_zi_result = calculate_ba_zi(data["dogumTarihi"], data["dogumSaati"])
        if not ba_zi_result or "error" in ba_zi_result:
            error_message = (
                ba_zi_result.get("error", "Doğum tarihi ve saati hesaplanamadı")
                if ba_zi_result
                else "Doğum tarihi ve saati hesaplanamadı"
            )
            return jsonify({"error": error_message}), 422

        element_counts = {element: 0 for element in ELEMENTS}
        for key in ["year_element", "month_element", "day_element", "hour_element"]:
            element = ba_zi_result.get(key)
            if element in element_counts:
                element_counts[element] += 1

        reading_tier = "premium" if user.has_active_premium() else "free"
        language = data.get("language", "tr")
        analysis = _get_bazi_analysis(ba_zi_result, element_counts, data["dogumTarihi"], language)
        prompt = get_prompt_by_language(
            "chinese",
            language,
            dogumTarihi=data["dogumTarihi"],
            dogumSaati=data["dogumSaati"],
            ba_zi=ba_zi_result,
            element_counts=element_counts,
            reading_tier=reading_tier,
            **analysis,
        )

        try:
            yorum = _create_completion(prompt)
        except Exception:
            current_app.logger.exception("Chinese fortune G4F hatası")
            yorum = f"""
            Çin falı yorumu:

            Doğum tarihi: {data['dogumTarihi']}
            Doğum saati: {data['dogumSaati']}

            Ba Zi analizi sonucunda:
            - Yıl elementi: {ba_zi_result.get('year_element', 'Bilinmiyor')}
            - Ay elementi: {ba_zi_result.get('month_element', 'Bilinmiyor')}
            - Gün elementi: {ba_zi_result.get('day_element', 'Bilinmiyor')}
            - Saat elementi: {ba_zi_result.get('hour_element', 'Bilinmiyor')}

            Element dağılımı: {element_counts}

            Bu element kombinasyonuna göre kişilik özellikleri, kariyer yönelimi, aşk hayatı ve genel yaşam yolu analiz edilmiştir.
            """

        reading = _save_reading(user_id, "chinese", data, yorum)
        return jsonify(
            {
                "success": True,
                "ba_zi": ba_zi_result,
                "element_counts": element_counts,
                "analysis": analysis,
                "reading_tier": reading_tier,
                "yorum": yorum,
                "reading_id": str(reading._id),
            }
        ), 200
    except Exception as exc:
        current_app.logger.exception("Cin falı hatası")
        return jsonify({"error": f"Çin falı oluşturulurken bir hata oluştu: {str(exc)}"}), 500


@fortune_bp.route("/coffee", methods=["POST"])
@jwt_required()
@fal_rate_limit()
def coffee_fortune():
    try:
        user, user_id, error_response = _load_user_or_404()
        if error_response:
            return error_response

        data = _json_body()
        images = data.get("images") or []
        if not isinstance(images, list):
            return jsonify({"error": "images alani gecerli bir liste olmalidir"}), 422

        normalized_images = [image for image in images if isinstance(image, str) and image.strip()]
        if len(normalized_images) < 3:
            return jsonify({"error": "En az 3 kahve fincani gorseli gereklidir"}), 422

        language = data.get("language", "tr")
        question = (data.get("soru") or data.get("question") or "").strip()
        normalized_payload = dict(data)
        normalized_payload["soru"] = question
        normalized_payload["question"] = question

        if not user.has_active_premium():
            required_tokens = int(os.getenv("COFFEE_TOKEN_COST", 25))
            current_balance = int(getattr(user, "token_balance", 0) or 0)
            if current_balance < required_tokens:
                return jsonify({"error": "Yetersiz token"}), 400

        try:
            reading_result = _gemini_generate_coffee_reading(
                normalized_images,
                language=language,
                question=question,
            )
        except Exception:
            current_app.logger.exception("Gemini kahve gorsel yorum uretimi basarisiz")
            return (
                jsonify(
                    {
                        "error": "Kahve gorselleri su an yorumlanamadi. Lutfen biraz sonra tekrar deneyin; bu denemede token harcanmadi.",
                        "code": "coffee_generation_unavailable",
                    }
                ),
                503,
            )

        yorum = reading_result["reading"]
        persisted_images = _persist_coffee_images(normalized_images, user_id)
        normalized_payload["images"] = [item["url"] for item in persisted_images if item.get("url")]
        normalized_payload["image_paths"] = [item["path"] for item in persisted_images if item.get("path")]
        user, access_error = _ensure_access_for_reading(user, user_id, "coffee")
        if access_error:
            return access_error

        reading = _save_reading(user_id, "coffee", normalized_payload, yorum)

        return jsonify(
            {
                "success": True,
                "yorum": yorum,
                "reading_id": str(reading._id),
                "language": language,
                "question": question,
            }
        ), 200
    except Exception:
        current_app.logger.exception("Kahve falı hatası")
        return jsonify({"error": "Kahve falı oluşturulurken bir hata oluştu"}), 500


@fortune_bp.route("/tarot", methods=["POST"])
@jwt_required()
def tarot():
    try:
        user, user_id, error_response = _load_user_or_404()
        if error_response:
            return error_response

        data = _json_body()
        data["soru"] = (data.get("soru") or "").strip()

        language = data.get("language", "tr")
        reading_tier = "premium" if user.has_active_premium() else "free"
        if reading_tier != "premium":
            data["soru"] = ""
        user, access_error = _ensure_access_for_reading(user, user_id, "tarot")
        if access_error:
            return access_error

        question_cache_part = data["soru"] or "__general__"
        cache_key = f"tarot:{reading_tier}:{question_cache_part}:{language}:{user_id}"
        cached_result = redis_manager.get(cache_key)
        if cached_result:
            if isinstance(cached_result, dict):
                cached_payload = dict(cached_result)
            else:
                cached_payload = {
                    "success": True,
                    "yorum": cached_result,
                    "reading_tier": reading_tier,
                    "question": data["soru"],
                    "cards": [],
                    "language": language,
                }
            cached_payload["from_cache"] = True
            cached_payload["reading_id"] = "cached"
            return jsonify(
                cached_payload
            ), 200

        cards = get_random_tarot_cards(3)
        prompt = get_prompt_by_language(
            "tarot",
            language,
            soru=data["soru"],
            cards=cards,
            reading_tier=reading_tier,
        )
        yorum = _create_completion(prompt, timeout=60)
        reading = _save_reading(user_id, "tarot", data, yorum)
        response_payload = {
            "success": True,
            "cards": cards,
            "yorum": yorum,
            "from_cache": False,
            "reading_id": str(reading._id),
            "language": language,
            "reading_tier": reading_tier,
            "question": data["soru"],
        }
        redis_manager.set(cache_key, response_payload, ttl=3600)

        return jsonify(response_payload), 200
    except Exception:
        current_app.logger.exception("Tarot hatası")
        return jsonify({"error": "Tarot falı oluşturulurken bir hata oluştu"}), 500


@fortune_bp.route("/daily", methods=["POST"])
@jwt_required()
@daily_fal_rate_limit()
def daily_burc_yorumu():
    try:
        user, user_id, error_response = _load_user_or_404()
        if error_response:
            return error_response

        data = _json_body()
        dogum_tarihi = data.get("dogumTarihi")
        language = data.get("language", "tr")

        user, access_error = _ensure_access_for_reading(user, user_id, "daily")
        if access_error:
            return access_error

        birth_date = None
        zodiac_sign = None
        if dogum_tarihi:
            try:
                birth_date = datetime.strptime(dogum_tarihi, "%Y-%m-%d").date()
                zodiac_sign = calculate_zodiac_sign(dogum_tarihi)
                user.birth_date = birth_date
                user.zodiac_sign = zodiac_sign
                user.save()
            except ValueError:
                return jsonify(
                    {
                        "success": False,
                        "error": "Geçersiz doğum tarihi formatı. YYYY-MM-DD formatında girin.",
                        "type": "invalid_date_format",
                    }
                ), 422
        else:
            birth_date = user.birth_date
            zodiac_sign = user.zodiac_sign

        if not birth_date:
            return jsonify(
                {
                    "success": False,
                    "error": "Doğum tarihiniz bulunamadı. Günlük burç yorumu için profil bilgilerinizi güncelleyin.",
                    "type": "missing_birth_date",
                }
            ), 422

        if not zodiac_sign:
            return jsonify(
                {
                    "success": False,
                    "error": "Burç bilginiz bulunamadı. Lütfen profil bilgilerinizi güncelleyin.",
                    "type": "missing_zodiac_sign",
                }
            ), 422

        today = datetime.now().strftime("%d %B %Y")
        cache_key = f"daily:v2:{user_id}:{zodiac_sign}:{today}:{language}"
        cached_result = redis_manager.get(cache_key)
        if cached_result:
            return jsonify(
                {
                    "success": True,
                    "zodiac_sign": zodiac_sign,
                    "date": today,
                    "yorum": cached_result,
                    "reading_id": "cached",
                    "language": language,
                    "from_cache": True,
                }
            ), 200

        prompt = get_prompt_by_language("daily", language, tarih=today, burc=zodiac_sign)
        yorum = _create_completion(prompt, timeout=45)

        reading = _save_reading(
            user_id,
            "daily_burc_yorumu",
            {"zodiac_sign": zodiac_sign, "date": today},
            yorum,
        )
        redis_manager.set(cache_key, yorum, ttl=3600)

        return jsonify(
            {
                "success": True,
                "zodiac_sign": zodiac_sign,
                "date": today,
                "yorum": yorum,
                "reading_id": str(reading._id),
                "language": language,
                "from_cache": False,
            }
        ), 200
    except Exception:
        current_app.logger.exception("Gunluk burc yorumu hatası")
        return jsonify({"error": "Günlük burç yorumu oluşturulurken bir hata oluştu"}), 500


@fortune_bp.route("/numerology", methods=["POST"])
@jwt_required()
@fal_rate_limit()
def numerology_fortune():
    try:
        user, user_id, error_response = _load_user_or_404()
        if error_response:
            return error_response

        data = _json_body()
        validation_error = _validate_required_fields(data, ["isim", "dogumTarihi"])
        if validation_error:
            return validation_error

        language = data.get("language", "tr")
        reading_tier = "premium" if user.has_active_premium() else "free"
        user, access_error = _ensure_access_for_reading(user, user_id, "numerology")
        if access_error:
            return access_error

        analysis = _get_numerology_analysis(data["isim"], data["dogumTarihi"])
        cache_key = (
            f"numerology:{reading_tier}:{data['isim']}:{data['dogumTarihi']}:"
            f"{language}:{analysis['life_path']}:{analysis['destiny_number']}:{analysis['soul_urge']}"
        )
        cached_result = redis_manager.get(cache_key)
        if cached_result:
            if isinstance(cached_result, dict):
                cached_payload = dict(cached_result)
            else:
                cached_payload = {
                    "success": True,
                    "yorum": cached_result,
                    "analysis": analysis,
                    "reading_tier": reading_tier,
                    "original_name": data["isim"],
                    "birth_date": data["dogumTarihi"],
                }
            cached_payload["from_cache"] = True
            cached_payload["reading_id"] = "cached"
            return jsonify(cached_payload), 200

        prompt = get_prompt_by_language(
            "numerology",
            language,
            isim=data["isim"],
            dogumTarihi=data["dogumTarihi"],
            reading_tier=reading_tier,
            **analysis,
        )
        yorum = _create_completion(prompt, timeout=55)
        reading = _save_reading(user_id, "numerology", data, yorum)
        response_payload = {
            "success": True,
            "yorum": yorum,
            "analysis": analysis,
            "reading_id": str(reading._id),
            "reading_tier": reading_tier,
            "language": language,
            "original_name": data["isim"],
            "birth_date": data["dogumTarihi"],
            "from_cache": False,
        }
        redis_manager.set(cache_key, response_payload, ttl=3600)
        return jsonify(response_payload), 200
    except Exception as exc:
        current_app.logger.exception("Numeroloji falı hatası")
        return jsonify({"error": f"Numeroloji falı oluşturulurken bir hata oluştu: {str(exc)}"}), 500


@fortune_bp.route("/compatibility", methods=["POST"])
@jwt_required()
@fal_rate_limit()
def compatibility_fortune():
    try:
        user, user_id, error_response = _load_user_or_404()
        if error_response:
            return error_response

        data = _json_body()
        validation_error = _validate_required_fields(
            data,
            ["kisi1Isim", "kisi1DogumTarihi", "kisi2Isim", "kisi2DogumTarihi", "iliskiTuru"],
        )
        if validation_error:
            return validation_error

        language = data.get("language", "tr")
        reading_tier = "premium" if user.has_active_premium() else "free"
        user, access_error = _ensure_access_for_reading(user, user_id, "compatibility")
        if access_error:
            return access_error

        analysis = _get_compatibility_analysis(
            data["kisi1Isim"],
            data["kisi1DogumTarihi"],
            data["kisi2Isim"],
            data["kisi2DogumTarihi"],
            data["iliskiTuru"],
            language,
        )
        cache_key = (
            f"compatibility:{reading_tier}:{data['kisi1Isim']}:{data['kisi1DogumTarihi']}:"
            f"{data['kisi2Isim']}:{data['kisi2DogumTarihi']}:{data['iliskiTuru']}:{language}:{analysis['score']}"
        )
        cached_result = redis_manager.get(cache_key)
        if cached_result:
            cached_payload = dict(cached_result) if isinstance(cached_result, dict) else {
                "success": True,
                "yorum": cached_result,
                "analysis": analysis,
                "reading_tier": reading_tier,
            }
            cached_payload["from_cache"] = True
            cached_payload["reading_id"] = "cached"
            return jsonify(cached_payload), 200

        prompt = get_prompt_by_language(
            "compatibility",
            language,
            kisi1Isim=data["kisi1Isim"],
            kisi1DogumTarihi=data["kisi1DogumTarihi"],
            kisi2Isim=data["kisi2Isim"],
            kisi2DogumTarihi=data["kisi2DogumTarihi"],
            iliskiTuru=data["iliskiTuru"],
            reading_tier=reading_tier,
            **analysis,
        )
        yorum = _create_completion(prompt, timeout=60)
        reading = _save_reading(user_id, "compatibility", data, yorum)
        response_payload = {
            "success": True,
            "yorum": yorum,
            "analysis": analysis,
            "reading_id": str(reading._id),
            "reading_tier": reading_tier,
            "language": language,
            "from_cache": False,
        }
        redis_manager.set(cache_key, response_payload, ttl=3600)
        return jsonify(response_payload), 200
    except Exception as exc:
        current_app.logger.exception("Uyum analizi hatası")
        return jsonify({"error": f"Uyum analizi oluşturulurken bir hata oluştu: {str(exc)}"}), 500


@fortune_bp.route("/angel-numbers", methods=["POST"])
@jwt_required()
@fal_rate_limit()
def angel_numbers_fortune():
    try:
        user, user_id, error_response = _load_user_or_404()
        if error_response:
            return error_response

        data = _json_body()
        validation_error = _validate_required_fields(data, ["sayi"])
        if validation_error:
            return validation_error

        language = data.get("language", "tr")
        reading_tier = "premium" if user.has_active_premium() else "free"
        user, access_error = _ensure_access_for_reading(user, user_id, "angel_numbers")
        if access_error:
            return access_error

        analysis = _get_angel_number_analysis(data["sayi"], language)
        cache_key = f"angel:{reading_tier}:{analysis['normalized_number']}:{language}:{user_id}"
        cached_result = redis_manager.get(cache_key)
        if cached_result:
            cached_payload = dict(cached_result) if isinstance(cached_result, dict) else {
                "success": True,
                "yorum": cached_result,
                "analysis": analysis,
                "reading_tier": reading_tier,
            }
            cached_payload["from_cache"] = True
            cached_payload["reading_id"] = "cached"
            return jsonify(cached_payload), 200

        prompt = get_prompt_by_language(
            "angel_numbers",
            language,
            sayi=analysis["normalized_number"],
            digit_sum=analysis["digit_sum"],
            base_theme=analysis["base_theme"],
            guidance_focus=analysis["guidance_focus"],
            share_line=analysis["share_line"],
        )
        yorum = _create_completion(prompt, timeout=40)
        reading = _save_reading(user_id, "angel_numbers", data, yorum)
        response_payload = {
            "success": True,
            "yorum": yorum,
            "analysis": analysis,
            "reading_id": str(reading._id),
            "reading_tier": reading_tier,
            "language": language,
            "from_cache": False,
        }
        redis_manager.set(cache_key, response_payload, ttl=1800)
        return jsonify(response_payload), 200
    except Exception as exc:
        current_app.logger.exception("Melek sayıları hatası")
        return jsonify({"error": f"Melek sayıları yorumu oluşturulurken bir hata oluştu: {str(exc)}"}), 500


@fortune_bp.route("/kabala", methods=["POST"])
@jwt_required()
def kabala_fortune():
    try:
        user, user_id, error_response = _load_user_or_404()
        if error_response:
            return error_response

        data = _json_body()
        validation_error = _validate_required_fields(data, ["isim", "dogumTarihi"])
        if validation_error:
            return validation_error

        language = data.get("language", "tr")
        reading_tier = "premium" if user.has_active_premium() else "free"
        user, access_error = _ensure_access_for_reading(user, user_id, "kabala")
        if access_error:
            return access_error
        cache_key = f"kabala:{reading_tier}:{data['isim']}:{data['dogumTarihi']}:{language}:{user_id}"
        cached_result = redis_manager.get(cache_key)
        if cached_result:
            if isinstance(cached_result, dict):
                cached_payload = dict(cached_result)
            else:
                cached_payload = {
                    "success": True,
                    "yorum": cached_result,
                    "reading_tier": reading_tier,
                    "original_name": data["isim"],
                    "language": language,
                }
            cached_payload["from_cache"] = True
            cached_payload["reading_id"] = "cached"
            return jsonify(cached_payload), 200

        analysis = _get_kabala_analysis(data["isim"], language)
        prompt = get_prompt_by_language(
            "kabala",
            language,
            isim=data["isim"],
            dogumTarihi=data["dogumTarihi"],
            reading_tier=reading_tier,
            **analysis,
        )

        try:
            yorum = _create_completion(prompt)
        except Exception:
            current_app.logger.exception("Kabala G4F hatası")
            sefirot_info = "\n".join(
                f"- {sefirot['name']} ({sefirot['hebrew']}): {sefirot['meaning']}"
                for sefirot in analysis["selected_sefirot"]
            )
            yorum = f"""
            Kabala falı yorumu:

            İsim: {data['isim']}
            Doğum tarihi: {data['dogumTarihi']}

            İbrani isim analizi:
            - İbrani harfler: {analysis['hebrew_name']}
            - İsim değeri: {analysis['name_value']}
            - İndirgenmiş değer: {analysis['reduced_value']}

            Seçilen sefirotlar:
            {sefirot_info}

            Bu Kabala analizi, ruhsal yolunuz ve kaderiniz hakkında önemli bilgiler sunmaktadır.
            """

        reading = _save_reading(user_id, "kabala", data, yorum)
        response_payload = {
            "success": True,
            "hebrew_name": analysis["hebrew_name"],
            "name_value": analysis["name_value"],
            "reduced_value": analysis["reduced_value"],
            "selected_sefirot": analysis["selected_sefirot"],
            "yorum": yorum,
            "reading_id": str(reading._id),
            "language": language,
            "reading_tier": reading_tier,
            "original_name": data["isim"],
        }
        redis_manager.set(cache_key, response_payload, ttl=3600)
        return jsonify(response_payload), 200
    except Exception:
        current_app.logger.exception("Kabala falı hatası")
        return jsonify({"error": "Kabala falı oluşturulurken bir hata oluştu"}), 500
