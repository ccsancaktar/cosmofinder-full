"""
Çok dilli prompt sistemi
Her fal türü için farklı dillerde prompt'lar sağlar
"""

from .bazi import build_bazi_prompt
from .daily import build_daily_prompt
from .kabala import build_kabala_prompt
from .rune import build_rune_prompt
from .tarot import build_tarot_prompt
from .yildizname import build_yildizname_prompt

# Desteklenen diller
SUPPORTED_LANGUAGES = ['tr', 'en', 'de']

def get_prompt_by_language(fortune_type, language='tr', **kwargs):
    """
    Belirtilen fal türü ve dil için prompt döndürür
    
    Args:
        fortune_type (str): Fal türü (tarot, rune, chinese, coffee, daily, kabala, yildizname)
        language (str): Dil kodu (tr, en, de)
        **kwargs: Prompt için gerekli parametreler
    
    Returns:
        str: Dil bazlı prompt
    """
    if language not in SUPPORTED_LANGUAGES:
        language = 'tr'  # Varsayılan dil
    
    prompt_functions = {
        'tarot': get_tarot_prompt,
        'rune': get_rune_prompt,
        'chinese': get_chinese_prompt,
        'coffee': get_coffee_prompt,
        'daily': get_daily_prompt,
        'kabala': get_kabala_prompt,
        'yildizname': get_yildizname_prompt,
        'numerology': get_numerology_prompt,
        'compatibility': get_compatibility_prompt,
        'angel_numbers': get_angel_numbers_prompt,
    }
    
    if fortune_type not in prompt_functions:
        raise ValueError(f"Desteklenmeyen fal türü: {fortune_type}")
    
    return prompt_functions[fortune_type](language, **kwargs)

# Tarot prompt'ları
def get_tarot_prompt(language, **kwargs):
    return build_tarot_prompt(language, **kwargs)

# Rune prompt'ları
def get_rune_prompt(language, **kwargs):
    return build_rune_prompt(language, **kwargs)

# Çin falı prompt'ları
def get_chinese_prompt(language, **kwargs):
    return build_bazi_prompt(language, **kwargs)

# Diğer prompt fonksiyonları buraya eklenebilir...
def get_coffee_prompt(language, **kwargs):
    soru = kwargs.get('soru', '')
    
    if language == 'tr':
        return f"""
        Sen deneyimli bir kahve falı uzmanısın. Aşağıdaki soruya göre detaylı bir kahve falı yorumu yap:

        Soru: {soru}

        Lütfen şu konuları kapsayan detaylı bir kahve falı yorumu yap:
        1. Fincanın genel görünümü ve enerji
        2. Fincanın farklı bölgelerindeki semboller
        3. Geçmiş, şimdi ve gelecek açısından yorum
        4. Kişisel ilişkiler ve aşk hayatı
        5. Kariyer ve iş hayatı
        6. Sağlık durumu
        7. Yakın gelecekteki olaylar
        8. Pratik öneriler ve tavsiyeler

        Yorumu Türkçe olarak, samimi ve anlaşılır bir dille yaz. Kahve falı geleneğine uygun olarak yaz.
        """
    
    elif language == 'en':
        return f"""
        You are an experienced coffee fortune teller. Please provide a detailed coffee fortune reading based on the following question:

        Question: {soru}

        Please provide a detailed coffee fortune reading covering these topics:
        1. General appearance and energy of the cup
        2. Symbols in different areas of the cup
        3. Interpretation from past, present, and future perspectives
        4. Personal relationships and love life
        5. Career and work life
        6. Health status
        7. Upcoming events
        8. Practical advice and recommendations

        Write the interpretation in English, using a warm and understandable language. Follow coffee fortune telling traditions.
        """
    
    elif language == 'de':
        return f"""
        Du bist ein erfahrener Kaffeesatzleser. Bitte erstelle eine detaillierte Kaffeesatz-Deutung basierend auf der folgenden Frage:

        Frage: {soru}

        Bitte erstelle eine detaillierte Kaffeesatz-Deutung, die diese Themen abdeckt:
        1. Allgemeines Aussehen und Energie der Tasse
        2. Symbole in verschiedenen Bereichen der Tasse
        3. Deutung aus Vergangenheit, Gegenwart und Zukunft
        4. Persönliche Beziehungen und Liebesleben
        5. Karriere und Arbeitsleben
        6. Gesundheitszustand
        7. Kommende Ereignisse
        8. Praktische Ratschläge und Empfehlungen

        Schreibe die Deutung auf Deutsch, verwende eine warme und verständliche Sprache. Folge den Kaffeesatzlesen-Traditionen.
        """

def get_daily_prompt(language, **kwargs):
    return build_daily_prompt(language, **kwargs)

def get_kabala_prompt(language, **kwargs):
    return build_kabala_prompt(language, **kwargs)

def get_yildizname_prompt(language, **kwargs):
    return build_yildizname_prompt(language, **kwargs)


def get_numerology_prompt(language, **kwargs):
    isim = kwargs.get('isim', '')
    dogum_tarihi = kwargs.get('dogumTarihi', '')
    life_path = kwargs.get('life_path', '')
    destiny_number = kwargs.get('destiny_number', '')
    soul_urge = kwargs.get('soul_urge', '')
    personality_number = kwargs.get('personality_number', '')
    reading_tier = kwargs.get('reading_tier', 'free')

    premium_block = {
        'tr': """
7. Bu dönemde tekrar eden sayı temasını ve bunun hangi karar alanını tetiklediğini açıkla
8. Kişinin içsel gücünü daha verimli kullanması için net bir yönlendirme ver
""",
        'en': """
7. Explain the repeating number theme of this period and which decision area it activates
8. Offer clear guidance on how the person can use their inner strength more effectively
""",
        'de': """
7. Erkläre das wiederkehrende Zahlenthema dieser Phase und welchen Entscheidungsbereich es aktiviert
8. Gib eine klare Orientierung, wie die Person ihre innere Stärke wirksamer nutzen kann
""",
    }

    if language == 'en':
        extra = premium_block['en'] if reading_tier == 'premium' else ''
        return f"""
You are an experienced numerology guide with a premium, intuitive tone.

User details:
- Name: {isim}
- Birth date: {dogum_tarihi}
- Life Path Number: {life_path}
- Destiny Number: {destiny_number}
- Soul Urge Number: {soul_urge}
- Personality Number: {personality_number}

Write an original numerology reading in English. Keep it deeply personal, emotionally intelligent, and easy to read.

Use these section headings exactly:
🔢 LIFE PATH NUMBER
🌙 SOUL URGE
✨ CHARACTER AND TALENTS
💼 CAREER FLOW
❤️ RELATIONSHIP ENERGY
🔮 THIS PERIOD'S MESSAGE

Cover these points naturally:
1. Explain how the Life Path Number shapes the person's direction
2. Explain the emotional need behind the Soul Urge Number
3. Describe visible strengths and natural talents using the Destiny and Personality numbers
4. Interpret career, productivity, and decision-making style
5. Interpret relationship energy, closeness, and communication style
6. End with a grounded but inspiring message for the current phase
{extra}

Avoid generic bullet lists. Write in short paragraphs under each heading.
"""

    if language == 'de':
        extra = premium_block['de'] if reading_tier == 'premium' else ''
        return f"""
Du bist ein erfahrener Numerologie-Guide mit einer edlen, intuitiven Sprache.

Angaben der Person:
- Name: {isim}
- Geburtsdatum: {dogum_tarihi}
- Lebenswegzahl: {life_path}
- Schicksalszahl: {destiny_number}
- Seelenzahl: {soul_urge}
- Persönlichkeitszahl: {personality_number}

Schreibe eine originelle Numerologie-Deutung auf Deutsch. Sie soll persönlich, warm und hochwertig wirken.

Nutze diese Abschnittsüberschriften exakt:
🔢 LEBENSWEGZAHL
🌙 SEELENIMPULS
✨ CHARAKTER UND TALENTE
💼 BERUFLICHER FLUSS
❤️ BEZIEHUNGSENERGIE
🔮 BOTSCHAFT DIESER PHASE

Decke diese Punkte natürlich ab:
1. Wie die Lebenswegzahl die Richtung und Entwicklung prägt
2. Welches emotionale Bedürfnis hinter der Seelenzahl liegt
3. Welche sichtbaren Stärken und Talente sich aus Schicksals- und Persönlichkeitszahl zeigen
4. Wie sich Beruf, Produktivität und Entscheidungen entfalten
5. Wie Nähe, Bindung und Kommunikation in Beziehungen wirken
6. Beende die Deutung mit einer klaren, inspirierenden Botschaft für die aktuelle Phase
{extra}

Keine generischen Listen. Schreibe kurze, klare Absätze unter jeder Überschrift.
"""

    extra = premium_block['tr'] if reading_tier == 'premium' else ''
    return f"""
Sen deneyimli bir numeroloji uzmanısın. Yorumların sıcak, kişisel ve premium hissettiren bir tonda olmalı.

Kullanıcı bilgileri:
- İsim: {isim}
- Doğum Tarihi: {dogum_tarihi}
- Yaşam Yolu Sayısı: {life_path}
- Kader Sayısı: {destiny_number}
- Ruh Arzusu Sayısı: {soul_urge}
- Kişilik Sayısı: {personality_number}

Türkçe olarak özgün bir numeroloji yorumu yaz.

Şu başlıkları aynen kullan:
🔢 YAŞAM YOLU SAYISI
🌙 RUH ARZUSU
✨ KARAKTER VE YETENEKLER
💼 KARİYER AKIŞI
❤️ İLİŞKİ ENERJİSİ
🔮 BU DÖNEMİN MESAJI

Yorum şu noktaları doğal biçimde kapsasın:
1. Yaşam yolu sayısının kişinin yönünü ve ana temasını nasıl belirlediğini açıkla
2. Ruh arzusu sayısının kişinin içten gelen duygusal ihtiyacını anlat
3. Kader ve kişilik sayısına göre öne çıkan yetenekleri ve güçlü yanları yorumla
4. Kariyer, üretkenlik ve karar alma tarzını yorumla
5. İlişkilerde yakınlık, bağ kurma ve iletişim enerjisini yorumla
6. Son bölümde mevcut dönem için ilham verici ama ayakları yere basan bir mesaj ver
{extra}

Maddeli kuru liste gibi yazma. Her başlık altında kısa ama dolu paragraflar kullan.
"""


def get_compatibility_prompt(language, **kwargs):
    kisi1_isim = kwargs.get('kisi1Isim', '')
    kisi1_dogum_tarihi = kwargs.get('kisi1DogumTarihi', '')
    kisi2_isim = kwargs.get('kisi2Isim', '')
    kisi2_dogum_tarihi = kwargs.get('kisi2DogumTarihi', '')
    iliski_turu = kwargs.get('iliskiTuru', '')
    score = kwargs.get('score', '')
    score_label = kwargs.get('score_label', '')
    ortak_tema = kwargs.get('core_theme', '')
    friction_theme = kwargs.get('friction_theme', '')
    guidance_theme = kwargs.get('guidance_theme', '')
    reading_tier = kwargs.get('reading_tier', 'free')

    premium_lines = {
        'tr': """
7. Bu bağın önümüzdeki dönemde hangi sınavdan geçebileceğini yorumla
8. İlişkiyi güçlendirmek için kısa ama net bir pratik öneri ver
""",
        'en': """
7. Describe the key test this connection may face in the near future
8. Offer one short but practical step to strengthen the relationship
""",
        'de': """
7. Beschreibe, welche zentrale Prüfung diese Verbindung in naher Zukunft erleben könnte
8. Gib einen kurzen, praktischen Schritt, um die Beziehung zu stärken
""",
    }

    if language == 'en':
        extra = premium_lines['en'] if reading_tier == 'premium' else ''
        return f"""
You are an experienced compatibility and relationship energy reader.

Person 1:
- Name: {kisi1_isim}
- Birth date: {kisi1_dogum_tarihi}

Person 2:
- Name: {kisi2_isim}
- Birth date: {kisi2_dogum_tarihi}

Relationship type: {iliski_turu}
Compatibility score: {score}/100
Compatibility level: {score_label}
Core theme: {ortak_tema}
Main friction: {friction_theme}
Guidance theme: {guidance_theme}

Write the reading in English. Make it warm, emotionally intelligent, and premium in tone.

Use these section headings exactly:
❤️ EMOTIONAL COMPATIBILITY
🗣️ COMMUNICATION FLOW
⚡ ATTRACTION AND ENERGY
🌗 CHALLENGING AREAS
🔮 RELATIONSHIP GUIDANCE

Cover these points naturally:
1. Explain the overall emotional chemistry
2. Describe how the two people communicate under stress and comfort
3. Interpret attraction, magnetism, and shared rhythm
4. Point out the main challenge without sounding harsh
5. End with balanced, encouraging relationship guidance
{extra}

Do not write in dry bullet points. Use short paragraphs under each heading.
"""

    if language == 'de':
        extra = premium_lines['de'] if reading_tier == 'premium' else ''
        return f"""
Du bist ein erfahrener Leser für Beziehungsenergie und Kompatibilität.

Person 1:
- Name: {kisi1_isim}
- Geburtsdatum: {kisi1_dogum_tarihi}

Person 2:
- Name: {kisi2_isim}
- Geburtsdatum: {kisi2_dogum_tarihi}

Beziehungsart: {iliski_turu}
Kompatibilitätswert: {score}/100
Kompatibilitätsstufe: {score_label}
Kernthema: {ortak_tema}
Hauptspannung: {friction_theme}
Leitmotiv: {guidance_theme}

Schreibe die Deutung auf Deutsch. Sie soll warm, klar und hochwertig wirken.

Nutze diese Abschnittsüberschriften exakt:
❤️ EMOTIONALE KOMPATIBILITÄT
🗣️ KOMMUNIKATIONSFLUSS
⚡ ANZIEHUNG UND ENERGIE
🌗 HERAUSFORDERNDE BEREICHE
🔮 BEZIEHUNGSORIENTIERUNG

Behandle diese Punkte natürlich:
1. Erkläre die emotionale Grundchemie
2. Beschreibe, wie die beiden unter Druck und in Ruhe kommunizieren
3. Deute Anziehung, Magnetismus und gemeinsamen Rhythmus
4. Benenne die wichtigste Spannung ohne harte Sprache
5. Beende die Deutung mit einer ausgewogenen, ermutigenden Empfehlung
{extra}

Keine trockenen Listen. Nutze kurze Absätze unter jeder Überschrift.
"""

    extra = premium_lines['tr'] if reading_tier == 'premium' else ''
    return f"""
Sen deneyimli bir uyum analizi ve ilişki enerjisi yorumcususun.

1. Kişi:
- İsim: {kisi1_isim}
- Doğum Tarihi: {kisi1_dogum_tarihi}

2. Kişi:
- İsim: {kisi2_isim}
- Doğum Tarihi: {kisi2_dogum_tarihi}

İlişki Türü: {iliski_turu}
Uyum Skoru: {score}/100
Uyum Seviyesi: {score_label}
Ortak Tema: {ortak_tema}
Ana Sürtünme: {friction_theme}
Rehber Tema: {guidance_theme}

Türkçe olarak sıcak, duygusal zekâ taşıyan ve premium hissettiren bir uyum yorumu yaz.

Şu başlıkları aynen kullan:
❤️ DUYGUSAL UYUM
🗣️ İLETİŞİM AKIŞI
⚡ ÇEKİM VE ENERJİ
🌗 ZORLAYICI ALANLAR
🔮 İLİŞKİ REHBERLİĞİ

Yorum şu noktaları doğal biçimde kapsasın:
1. Genel duygusal kimyayı açıkla
2. İki kişinin rahat ve stresli anlarda nasıl iletişim kurduğunu anlat
3. Aralarındaki çekim, ritim ve yakınlık enerjisini yorumla
4. Zorlayıcı alanı kırmadan ama net biçimde ifade et
5. Son bölümde dengeli ve motive edici bir ilişki rehberliği sun
{extra}

Kuru madde listesi gibi yazma. Her başlık altında kısa ama güçlü paragraflar kullan.
"""


def get_angel_numbers_prompt(language, **kwargs):
    sayi = kwargs.get('sayi', '')
    digit_sum = kwargs.get('digit_sum', '')
    base_theme = kwargs.get('base_theme', '')
    guidance_focus = kwargs.get('guidance_focus', '')
    share_line = kwargs.get('share_line', '')

    if language == 'en':
        return f"""
You are a modern spiritual guide who interprets angel numbers in a short, elegant, and shareable way.

Number: {sayi}
Digit sum: {digit_sum}
Base theme: {base_theme}
Guidance focus: {guidance_focus}
Share line seed: {share_line}

Write the response in English using these headings exactly:
👼 MESSAGE OF THE NUMBER
⚡ CURRENT ENERGY
🔮 NEAR EFFECT
✨ GUIDANCE

Each section should be 1-2 short sentences only.
Keep it concise, personal, emotionally clear, and easy to share.
Do not write a long fortune reading.
"""

    if language == 'de':
        return f"""
Du bist ein moderner spiritueller Guide, der Engelszahlen kurz, elegant und teilbar deutet.

Zahl: {sayi}
Quersumme: {digit_sum}
Grundthema: {base_theme}
Leitfokus: {guidance_focus}
Teilbare Kernzeile: {share_line}

Schreibe die Antwort auf Deutsch mit diesen Überschriften:
👼 BOTSCHAFT DER ZAHL
⚡ AKTUELLE ENERGIE
🔮 NAHE WIRKUNG
✨ ORIENTIERUNG

Jeder Abschnitt soll nur 1-2 kurze Sätze enthalten.
Halte die Deutung kurz, persönlich, klar und gut teilbar.
Schreibe keine lange Wahrsagung.
"""

    return f"""
Sen modern ve spiritüel bir rehbersin. Melek sayılarını kısa, şık ve paylaşılabilir bir tonda yorumluyorsun.

Sayı: {sayi}
Rakam Toplamı: {digit_sum}
Ana Tema: {base_theme}
Rehber Odağı: {guidance_focus}
Paylaşım Cümlesi Tohumu: {share_line}

Yanıtı Türkçe olarak şu başlıklarla yaz:
👼 SAYININ MESAJI
⚡ ŞU ANKİ ENERJİ
🔮 YAKIN ETKİ
✨ TAVSİYE

Her bölüm sadece 1-2 kısa cümle olsun.
Yorum kısa, kişisel, net ve kolay paylaşılabilir olsun.
Uzun fal metni yazma.
"""
