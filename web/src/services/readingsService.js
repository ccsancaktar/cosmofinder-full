import API from "./api";

const readingsService = {
  // Tüm okumalar
  getReadings: async () => {
    return API.get("/readings");
  },

  // Okuma bilgisi
  getReadingInfo: async (type) => {
    const readings = {
      yildizname: {
        id: "yildizname",
        name: "Yıldızname",
        description: "Doğum bilgilerinizle detaylı astroloji yorumu",
        tokenCost: 50,
        backgroundImage: "/assets/images/yildizname-bg.jpg",
      },
      tarot: {
        id: "tarot",
        name: "Tarot",
        description: "78 kartlık tarot destesiyle gelecek yorumu",
        tokenCost: 35,
        backgroundImage: "/assets/images/tarot-bg.jpg",
      },
      coffee: {
        id: "coffee",
        name: "Kahve Falı",
        description: "Kahve fincanı fotografı ile geleneksel fal",
        tokenCost: 25,
        backgroundImage: "/assets/images/coffee-bg.jpg",
      },
      rune: {
        id: "rune",
        name: "Rune",
        description: "Eski Viking runeleriyle gelecek çekimi",
        tokenCost: 30,
        backgroundImage: "/assets/images/rune-bg.jpg",
      },
      chinese: {
        id: "chinese",
        name: "Çin Falı",
        description: "Ba Zi analizi ile element analizi",
        tokenCost: 40,
        backgroundImage: "/assets/images/chinese-bg.jpg",
      },
      daily: {
        id: "daily",
        name: "Günlük Burç Yorumu",
        description: "Burcunuza göre günlük astroloji yorumu",
        tokenCost: 15,
        backgroundImage: "/assets/images/daily-bg.jpg",
      },
      kabala: {
        id: "kabala",
        name: "Kabala",
        description: "İbrani mistik geleceği ile ruhsal yorum",
        tokenCost: 45,
        backgroundImage: "/assets/images/kabala-bg.jpg",
      },
    };
    return readings[type];
  },

  // Fal çek
  performReading: async (type, data) => {
    return API.post(`/${type}`, data);
  },

  // Fal geçmişi
  getReadingHistory: async () => {
    return API.get(`/readings/history`);
  },
};

export default readingsService;
