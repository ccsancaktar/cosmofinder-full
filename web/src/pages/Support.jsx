const supportSections = [
  {
    title: "Uygulama Desteği",
    body: [
      "CosmoFinder ile ilgili yardım, teknik destek, hesap sorunları veya satın alma soruları için bizimle e-posta üzerinden iletişime geçebilirsiniz.",
      "Destek taleplerinde mümkünse kullandığınız cihazı, işletim sistemi sürümünü ve yaşadığınız sorunun kısa açıklamasını paylaşın.",
    ],
  },
  {
    title: "Hesap ve Erişim",
    body: [
      "Giriş yapamama, profil verileri veya uygulama içi hesap işlemleriyle ilgili taleplerde kayıtlı e-posta adresinizi belirtmeniz süreci hızlandırır.",
      "Hesap silme işlemi mobil uygulama içinden yapılabilir. Silme işleminden sonra hesap verileri ve ilişkili uygulama içi içerikler kalıcı olarak kaldırılır.",
    ],
  },
  {
    title: "Satın Alma ve Abonelikler",
    body: [
      "Token paketleri, premium erişim ve satın alma geri yükleme süreçleriyle ilgili sorularınızda satın alma ekranı ve hata mesajı detaylarını paylaşabilirsiniz.",
      "App Store abonelikleri Apple tarafından yönetilir. Abonelik iptali veya plan değişikliği Apple hesap ayarlarınız üzerinden yapılmalıdır.",
    ],
  },
  {
    title: "Yanıt Süresi",
    body: [
      "Destek taleplerine makul süre içinde dönüş yapmayı hedefliyoruz. Yoğun dönemlerde yanıt süresi uzayabilir.",
    ],
  },
  {
    title: "Yayıncı Bilgisi",
    body: [
      "CosmoFinder, bireysel yayıncı Cihan Sancak tarafından sunulmaktadır.",
      "Konum bilgisi: Bandırma / Balıkesir, Türkiye.",
    ],
  },
];

export default function Support() {
  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-3xl border border-primary/20 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-sm">
          <p className="mb-3 text-sm uppercase tracking-[0.28em] text-primary/80">
            Support
          </p>
          <h1 className="mb-4 text-4xl font-semibold text-white sm:text-5xl">
            Destek
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-gray-300 sm:text-base">
            CosmoFinder ile ilgili destek talepleri, hesap işlemleri, satın alma
            soruları ve genel yardım için bu sayfayı kullanabilirsiniz.
          </p>
          <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/10 p-5 text-sm text-gray-200">
            <p className="font-semibold text-white">Destek ve İletişim</p>
            <p className="mt-2 text-gray-300">Yayıncı: Cihan Sancak</p>
            <a
              href="mailto:info@cosmofinder.com"
              className="mt-1 inline-block text-primary hover:text-primary/80"
            >
              info@cosmofinder.com
            </a>
            <p className="mt-2 text-gray-300">Bandırma / Balıkesir, Türkiye</p>
          </div>
        </div>

        <div className="space-y-6">
          {supportSections.map((section) => (
            <section
              key={section.title}
              className="rounded-3xl border border-white/8 bg-white/5 p-7 shadow-lg shadow-black/10 backdrop-blur-sm"
            >
              <h2 className="mb-4 text-2xl font-semibold text-white">
                {section.title}
              </h2>
              <div className="space-y-4 text-sm leading-7 text-gray-300 sm:text-base">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
