const termsSections = [
  {
    title: "Hizmetin Kapsamı",
    body: [
      "CosmoFinder, kullanıcılara yapay zeka destekli fal, spiritüel yorum ve kişisel içgörü deneyimleri sunan dijital bir uygulamadır.",
      "Web sitesi tanıtım, bilgilendirme, destek ve yasal içerik sağlamak amacıyla kullanılır. Asıl uygulama deneyimi mobil uygulama üzerinden sunulur.",
      "Bu hizmet bireysel yayıncı Cihan Sancak tarafından sunulmaktadır.",
    ],
  },
  {
    title: "Eğlence ve Yorum Niteliği",
    body: [
      "CosmoFinder içeriği eğlence, kişisel yorum ve spiritüel keşif amaçlıdır. Sunulan yorumlar profesyonel tıbbi, hukuki, finansal veya psikolojik danışmanlık yerine geçmez.",
    ],
  },
  {
    title: "Hesap ve Kullanıcı Sorumluluğu",
    body: [
      "Kullanıcılar, hesap bilgilerini doğru ve güncel tutmaktan sorumludur. Hesap güvenliği ve cihaz erişimi kullanıcının sorumluluğundadır.",
      "Kullanıcı, hizmeti hukuka aykırı, yanıltıcı, kötüye kullanıma açık veya başkalarının haklarını ihlal edecek şekilde kullanmamayı kabul eder.",
    ],
  },
  {
    title: "Satın Almalar ve Abonelikler",
    body: [
      "Uygulama içi satın almalar, token paketleri ve premium erişim ilgili uygulama mağazası ve ödeme sağlayıcıları üzerinden yönetilebilir.",
      "Abonelik koşulları, yenileme, iptal ve ücretlendirme süreçleri ilgili mağaza kurallarına tabi olabilir.",
    ],
  },
  {
    title: "Fikri Mülkiyet",
    body: [
      "CosmoFinder markası, tasarımları, yazılımı, arayüzleri, görselleri ve içerikleri, aksi belirtilmedikçe ilgili hak sahiplerine aittir ve izinsiz kullanılamaz, kopyalanamaz veya dağıtılamaz.",
    ],
  },
  {
    title: "Sorumluluğun Sınırlandırılması",
    body: [
      "Yürürlükteki hukukun izin verdiği ölçüde CosmoFinder, hizmetin kesintisiz veya hatasız olacağını garanti etmez. Hizmetin kullanımından doğabilecek dolaylı veya sonuçsal zararlardan sorumluluk kabul edilmez.",
    ],
  },
  {
    title: "Güncellemeler",
    body: [
      "Bu koşullar zaman zaman güncellenebilir. Güncel sürüm bu sayfada yayımlandığı andan itibaren geçerli olur.",
    ],
  },
  {
    title: "İletişim",
    body: [
      "Bu kullanım şartlarıyla ilgili sorular için info@cosmofinder.com adresi üzerinden bizimle iletişime geçebilirsiniz.",
      "Yayıncı bilgisi: Cihan Sancak, Bandırma / Balıkesir, Türkiye.",
    ],
  },
];

export default function Terms() {
  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-3xl border border-primary/20 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-sm">
          <p className="mb-3 text-sm uppercase tracking-[0.28em] text-primary/80">
            Legal
          </p>
          <h1 className="mb-4 text-4xl font-semibold text-white sm:text-5xl">
            Kullanım Şartları
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-gray-300 sm:text-base">
            Bu Kullanım Şartları, CosmoFinder web sitesi, mobil uygulaması ve
            ilişkili hizmetlerin kullanımına dair temel kuralları açıklar.
          </p>
          <div className="mt-6 inline-flex rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm text-primary">
            Yürürlük tarihi: 24 Mayıs 2026
          </div>
        </div>

        <div className="space-y-6">
          {termsSections.map((section) => (
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
