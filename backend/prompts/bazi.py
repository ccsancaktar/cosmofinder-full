ELEMENT_LABELS = {
    "tr": {
        "wood": "Ağaç",
        "fire": "Ateş",
        "earth": "Toprak",
        "metal": "Metal",
        "water": "Su",
    },
    "en": {
        "wood": "Wood",
        "fire": "Fire",
        "earth": "Earth",
        "metal": "Metal",
        "water": "Water",
    },
    "de": {
        "wood": "Holz",
        "fire": "Feuer",
        "earth": "Erde",
        "metal": "Metall",
        "water": "Wasser",
    },
}


def _bazi_language(language):
    return language if language in ("tr", "en", "de") else "tr"


def _localize_element(language, element):
    if not element:
        return ""
    locale = _bazi_language(language)
    return ELEMENT_LABELS[locale].get(str(element).lower(), element)


def _format_element_counts(language, element_counts):
    if not isinstance(element_counts, dict):
        return str(element_counts)
    return ", ".join(
        f"{_localize_element(language, element)}: {count}"
        for element, count in element_counts.items()
    )


def build_bazi_prompt(language, **kwargs):
    language = _bazi_language(language)
    dogum_tarihi = kwargs.get('dogumTarihi', '')
    dogum_saati = kwargs.get('dogumSaati', '')
    ba_zi_result = kwargs.get('ba_zi', {})
    element_counts = kwargs.get('element_counts', '')
    reading_tier = kwargs.get('reading_tier', 'free')
    day_master = kwargs.get('day_master', '')
    dominant_element = kwargs.get('dominant_element', '')
    missing_elements = kwargs.get('missing_elements', [])
    ten_gods = kwargs.get('ten_gods', {})
    life_phase_hint = kwargs.get('life_phase_hint', '')

    localized_counts = _format_element_counts(language, element_counts)
    day_master_label = _localize_element(language, day_master or ba_zi_result.get('day_element'))
    year_element_label = _localize_element(language, ba_zi_result.get('year_element'))
    month_element_label = _localize_element(language, ba_zi_result.get('month_element'))
    hour_element_label = _localize_element(language, ba_zi_result.get('hour_element'))
    dominant_element_label = _localize_element(language, dominant_element)
    missing_text = ', '.join(_localize_element(language, element) for element in missing_elements) if missing_elements else {
        'tr': 'Belirgin eksik görünmüyor',
        'en': 'No obvious missing element appears',
        'de': 'Kein klar fehlendes Element erkennbar',
    }[language]
    wealth_label = _localize_element(language, ten_gods.get('wealth'))
    power_label = _localize_element(language, ten_gods.get('power'))
    resource_label = _localize_element(language, ten_gods.get('resource'))
    output_label = _localize_element(language, ten_gods.get('output'))

    if language == 'tr':
        if reading_tier == 'premium':
            return f"""
            Sen ileri seviye Ba Zi (Çin kader analizi) uzmanısın.
            Analizini klasik Ba Zi prensiplerine uygun, derin ve net bir şekilde yap.

            Aşağıdaki bilgilere göre kapsamlı bir kader yorumu oluştur:

            Doğum Tarihi: {dogum_tarihi}
            Doğum Saati: {dogum_saati}

            Ba Zi verileri:
            * Gün elementi (Day Master): {day_master_label}
            * Yıl elementi: {year_element_label}
            * Ay elementi: {month_element_label}
            * Saat elementi: {hour_element_label}

            Element dağılımı: {localized_counts}
            Baskın element: {dominant_element_label}
            Eksik/zayıf elementler: {missing_text}

            10 Gods referansları:
            * Wealth: {wealth_label}
            * Power: {power_label}
            * Resource: {resource_label}
            * Output: {output_label}

            Dönem ipucu:
            * {life_phase_hint}

            ÖNEMLİ KURALLAR:
            * Yorumlar net, güçlü ve kesin ifadeler içersin
            * Her analizde sebep -> sonuç ilişkisi kur
            * Genel konuşma yapma, spesifik çıkarımlar yap
            * Zamanlama mutlaka ver
            * Kullanıcıya neden böyle oluyor hissini açıkla
            * Modern motivasyon dili kullanma; element, yapı, denge ve döngü mantığıyla yaz

            Aşağıdaki başlıklarda yaz:
            DAY MASTER VE KADER YAPISI
            ELEMENT DENGESİ VE HAYATTAKİ ANA SORUN
            PARA, KARİYER VE GÜÇ ANALİZİ
            İLİŞKİ VE AŞK DİNAMİKLERİ
            ŞANS DÖNGÜLERİ VE ZAMANLAMA (EN KRİTİK BÖLÜM)
            ELEMENT DENGELEME VE YAŞAM ÖNERİLERİ
            GENEL KADER AKIŞI
            """

        return f"""
        Sen deneyimli bir Ba Zi (Çin kader analizi) uzmanısın.

        Aşağıdaki bilgilere göre sade ama etkileyici bir Ba Zi yorumu yap:

        Doğum Tarihi: {dogum_tarihi}
        Doğum Saati: {dogum_saati}

        Ba Zi verileri:
        * Gün elementi (Day Master): {day_master_label or 'Bilinmiyor'}
        * Yıl elementi: {year_element_label or 'Bilinmiyor'}
        * Ay elementi: {month_element_label or 'Bilinmiyor'}
        * Saat elementi: {hour_element_label or 'Bilinmiyor'}

        Element dağılımı: {localized_counts}
        Baskın element: {dominant_element_label}
        Eksik/zayıf elementler: {missing_text}

        ÖNEMLİ:
        * Yorum kısa ama merak uyandırıcı olsun
        * Detayların hepsini verme
        * Net zamanlar ve derin analizleri sakla
        * Kesin hükümler yerine işaret ve eğilim dili kullan

        Aşağıdaki başlıklarda yaz:
        DAY MASTER VE TEMEL KARAKTER
        ELEMENT DENGESİ (GENEL)
        GENEL AKIŞ VE ŞANS
        YAKIN GELECEK İPUCU

        Sonunda şu fikri taşıyan tek cümlelik bir kapanış ekle:
        Detaylı analizde kader döngülerin, para ve ilişki dönemlerin net olarak açıklanır.
        """

    if language == 'en':
        if reading_tier == 'premium':
            return f"""
            You are an advanced Ba Zi (Chinese destiny analysis) expert.
            Interpret the chart in a deep, structured, and classical Ba Zi manner.

            Birth Date: {dogum_tarihi}
            Birth Time: {dogum_saati}

            Ba Zi data:
            * Day Master: {day_master_label}
            * Year element: {year_element_label}
            * Month element: {month_element_label}
            * Hour element: {hour_element_label}

            Element distribution: {localized_counts}
            Dominant element: {dominant_element_label}
            Missing/weaker elements: {missing_text}

            10 Gods references:
            * Wealth: {wealth_label}
            * Power: {power_label}
            * Resource: {resource_label}
            * Output: {output_label}

            Current cycle hint:
            * {life_phase_hint}

            IMPORTANT RULES:
            * Be specific, strong, and structured
            * Use cause -> result logic
            * Avoid vague motivational language
            * Keep the analysis rooted in element balance, Day Master, and cycles

            Write under these headings:
            DAY MASTER AND DESTINY STRUCTURE
            ELEMENT BALANCE AND THE MAIN LIFE ISSUE
            MONEY, CAREER AND POWER ANALYSIS
            RELATIONSHIP AND LOVE DYNAMICS
            LUCK CYCLES AND TIMING
            ELEMENT BALANCING AND LIFE GUIDANCE
            GENERAL DESTINY FLOW
            """

        return f"""
        You are an experienced Ba Zi (Chinese destiny analysis) expert.

        Based on the following information, write a concise but intriguing Ba Zi interpretation:

        Birth Date: {dogum_tarihi}
        Birth Time: {dogum_saati}

        Ba Zi data:
        * Day Master: {day_master_label or 'Unknown'}
        * Year element: {year_element_label or 'Unknown'}
        * Month element: {month_element_label or 'Unknown'}
        * Hour element: {hour_element_label or 'Unknown'}

        Element distribution: {localized_counts}
        Dominant element: {dominant_element_label}
        Missing/weaker elements: {missing_text}

        IMPORTANT:
        * Keep it short but compelling
        * Do not reveal all deep details
        * Do not give exact timing
        * Leave curiosity for the detailed version

        Write under these headings:
        DAY MASTER AND CORE NATURE
        ELEMENT BALANCE (GENERAL)
        GENERAL FLOW AND LUCK
        NEAR-FUTURE HINT

        End with one sentence suggesting that the detailed analysis reveals destiny cycles, money periods, and relationship timing more clearly.
        """

    if reading_tier == 'premium':
        return f"""
        Du bist ein fortgeschrittener Ba Zi-Experte (chinesische Schicksalsanalyse).
        Analysiere tief, strukturiert und nach klassischen Ba Zi-Prinzipien.

        Geburtsdatum: {dogum_tarihi}
        Geburtszeit: {dogum_saati}

        Ba Zi-Daten:
        * Day Master: {day_master_label}
        * Jahreselement: {year_element_label}
        * Monatselement: {month_element_label}
        * Stundenelement: {hour_element_label}

        Elementverteilung: {localized_counts}
        Dominantes Element: {dominant_element_label}
        Fehlende/schwächere Elemente: {missing_text}

        10-Gods-Referenzen:
        * Wealth: {wealth_label}
        * Power: {power_label}
        * Resource: {resource_label}
        * Output: {output_label}

        Schreibe unter diesen Überschriften:
        DAY MASTER UND SCHICKSALSSTRUKTUR
        ELEMENTGLEICHGEWICHT UND DAS HAUPTPROBLEM IM LEBEN
        GELD, KARRIERE UND MACHTANALYSE
        BEZIEHUNGS- UND LIEBESDYNAMIK
        GLÜCKSZYKLEN UND ZEITLICHE PHASEN
        ELEMENTAUSGLEICH UND LEBENSHINWEISE
        ALLGEMEINER SCHICKSALSVERLAUF
        """

    return f"""
    Du bist ein erfahrener Ba Zi-Experte.

    Erstelle eine kurze, aber interessante Ba Zi-Deutung:

    Geburtsdatum: {dogum_tarihi}
    Geburtszeit: {dogum_saati}

    Ba Zi-Daten:
    * Day Master: {day_master_label or 'Unbekannt'}
    * Jahreselement: {year_element_label or 'Unbekannt'}
    * Monatselement: {month_element_label or 'Unbekannt'}
    * Stundenelement: {hour_element_label or 'Unbekannt'}

    Elementverteilung: {localized_counts}
    Dominantes Element: {dominant_element_label}
    Fehlende/schwächere Elemente: {missing_text}

    Schreibe kurz und lasse bewusst Neugier offen.

    Schreibe unter diesen Überschriften:
    DAY MASTER UND GRUNDNATUR
    ELEMENTGLEICHGEWICHT (ALLGEMEIN)
    ALLGEMEINER FLUSS UND GLÜCK
    HINWEIS AUF DIE NAHE ZUKUNFT
    """
