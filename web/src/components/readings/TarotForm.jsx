import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Crown, Lock, RefreshCcw, Sparkles, Stars, Wand2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import authService from "../../services/authService";
import { setBalance } from "../../store/tokensSlice";
import { getTarotCardImage, tarotBackImage } from "../../utils/tarotImages";

const REQUIRED_CARDS = 3;
const SLOT_LABELS = ["Geçmiş", "Şimdi", "Gelecek"];
const TAROT_COST = 35;

function shuffleIndexes(length) {
  const values = Array.from({ length }, (_, index) => index);
  for (let i = values.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}

function EmptySlot({ label }) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[11px] uppercase tracking-[0.28em] text-primary/75 mb-3">{label}</p>
      <div className="aspect-[0.7] rounded-[1.3rem] border border-dashed border-white/10 bg-[#130f20] flex flex-col items-center justify-center text-center px-5">
        <img src={tarotBackImage} alt="" className="h-28 w-20 rounded-xl object-cover opacity-45 mb-4" />
        <p className="text-sm leading-6 text-gray-500">Bu pozisyon için seçtiğin kart burada açılacak.</p>
      </div>
    </div>
  );
}

function FilledSlot({ label, card, order }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="rounded-[1.75rem] border border-primary/20 bg-white/[0.05] p-4 shadow-[0_0_24px_rgba(245,185,51,0.08)]"
    >
      <p className="text-[11px] uppercase tracking-[0.28em] text-primary/75 mb-3">{label}</p>
      <div className="relative aspect-[0.7] overflow-hidden rounded-[1.3rem] border border-primary/25 bg-[#130f20]">
        <img src={getTarotCardImage(card.image)} alt={card.name_tr || card.name} className="h-full w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#090713] via-[#090713]/75 to-transparent" />
        <div className="absolute top-3 right-3 h-9 w-9 rounded-full bg-primary text-[#0D0B1F] text-sm font-black flex items-center justify-center shadow-lg shadow-primary/25">
          {order}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-lg font-bold text-white">{card.name_tr || card.name}</p>
        <p className="text-sm text-gray-400 mt-2 leading-6">{card.meaning}</p>
      </div>
    </motion.div>
  );
}

export default function TarotForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const tokenBalance = useSelector((state) => state.tokens.balance);
  const isPremium = useSelector((state) => state.premium.isPremium);

  const [tarotCards, setTarotCards] = useState([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [question, setQuestion] = useState("");
  const [selectedCards, setSelectedCards] = useState([]);
  const [deckOrder, setDeckOrder] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("ritual");

  useEffect(() => {
    const fetchTarotCards = async () => {
      try {
        const response = await API.get("/tarot/cards");
        const cards = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.cards)
            ? response.data.cards
            : [];
        setTarotCards(cards);
        setDeckOrder(shuffleIndexes(cards.length));
      } catch (err) {
        console.error("Tarot cards fetch error:", err);
        setTarotCards([]);
        setDeckOrder([]);
      } finally {
        setCardsLoading(false);
      }
    };

    fetchTarotCards();
  }, []);

  const refreshTokenBalance = async () => {
    try {
      const response = await authService.getTokenBalance();
      dispatch(setBalance(response.data.balance || 0));
    } catch (err) {
      console.error("Token balance refresh failed:", err);
    }
  };

  const selectionMessage = useMemo(() => {
    if (selectedCards.length === 0) return "İlk kartını içinden geldiği gibi seç. Açılımın tonu orada başlar.";
    if (selectedCards.length === 1) return "İkinci kart hikayeyi derinleştirir. Acele etme.";
    if (selectedCards.length === 2) return "Son kart yaklaşan yolu açacak.";
    return "Açılım tamamlandı. Yorumu başlatabilirsin.";
  }, [selectedCards.length]);

  const selectedCardObjects = useMemo(
    () => selectedCards.map((index) => tarotCards[index]).filter(Boolean),
    [selectedCards, tarotCards]
  );

  const orderedDeckCards = useMemo(
    () => deckOrder.map((index) => ({ ...tarotCards[index], originalIndex: index })).filter((card) => card.name),
    [deckOrder, tarotCards]
  );

  const startDrawStep = () => {
    setError("");
    setStep("draw");
  };

  const reshuffleDeck = () => {
    setDeckOrder(shuffleIndexes(tarotCards.length));
    setSelectedCards([]);
    setError("");
  };

  const handleCardSelect = (index) => {
    setError("");
    setStep("draw");
    setSelectedCards((prev) => {
      if (prev.includes(index)) {
        return prev.filter((cardIndex) => cardIndex !== index);
      }
      if (prev.length >= REQUIRED_CARDS) {
        return prev;
      }
      return [...prev, index];
    });
  };

  const handleSubmit = async () => {
    setError("");

    if (selectedCards.length !== REQUIRED_CARDS) {
      setError("Tarot açılımı için tam 3 kart seçmelisin.");
      return;
    }

    if (tokenBalance < TAROT_COST) {
      setError(`Yeterli token yok. Gerekli: ${TAROT_COST}, Sahip olunan: ${tokenBalance}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedCardData = selectedCards.map((index) => tarotCards[index]);

      const response = await API.post("/tarot", {
        soru: isPremium ? question.trim() : "",
        selectedCards: [...selectedCards].sort((a, b) => a - b),
        selectedCardData,
        language: "tr",
      });

      if (response.data.success) {
        await refreshTokenBalance();
        navigate("/reading/tarot", {
          state: {
            type: "tarot",
            question: isPremium ? question.trim() : "",
            cards: response.data.cards || selectedCardData,
            fortune: response.data.yorum,
            readingId: response.data.reading_id,
            formData: {},
          },
        });
      } else {
        setError(response.data.message || "Tarot yorumu oluşturulurken hata oluştu.");
      }
    } catch (err) {
      console.error("Tarot error:", err);
      setError(err.response?.data?.message || "Tarot yorumu oluşturulurken bir hata oluştu. Lütfen tekrar dene.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,#2b1d4f,transparent_55%),linear-gradient(180deg,#121023_0%,#090713_100%)] p-6 md:p-8 xl:p-10">
        <div className="absolute -top-10 right-10 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative z-10 grid xl:grid-cols-[0.95fr_1.25fr] gap-8 items-start">
          <div className="space-y-6">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0], y: [0, -6, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-primary/25 bg-primary/10"
            >
              <Sparkles className="w-8 h-8 text-primary" />
            </motion.div>

            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-primary/75 mb-3">Tarot Ritüeli</p>
              <h2 className="text-4xl md:text-5xl font-black font-decorative gradient-text mb-4">Kartları Hisset, Sonra Çek</h2>
              <p className="text-lg text-gray-300 leading-8 max-w-2xl">
                Bu ekranı form gibi değil, küçük bir açılım ritüeli gibi kurguladım. Önce niyetini bırak, sonra desteden üç kart seç ve geçmiş-şimdi-gelecek akışını aç.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              {[
                ["1", "Niyetini bırak"],
                ["2", "Üç kart seç"],
                ["3", "Yorumu başlat"],
              ].map(([number, label]) => (
                <div key={label} className="rounded-[1.3rem] border border-white/10 bg-white/[0.04] px-4 py-4">
                  <div className="h-8 w-8 rounded-full bg-primary text-[#0D0B1F] text-sm font-black flex items-center justify-center mb-3">
                    {number}
                  </div>
                  <p className="text-sm text-white font-semibold">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-[1fr_auto] gap-6 items-start">
            <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.05] p-5 md:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 rounded-2xl border border-primary/25 bg-primary/10 flex items-center justify-center">
                  <Wand2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-primary/75">Niyet Alanı</p>
                  <p className="text-white font-semibold text-lg">Kartlara yön verecek sorunu bırak</p>
                </div>
              </div>

              {isPremium ? (
                <div className="space-y-3">
                  <textarea
                    value={question}
                    onChange={(event) => setQuestion(event.target.value.slice(0, 220))}
                    placeholder="Kalbinden geçen soruyu yazabilir ya da boş bırakıp genel açılıma geçebilirsin."
                    rows={5}
                    className="w-full rounded-[1.4rem] bg-[#0f0c1d] border border-white/10 px-5 py-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-primary resize-none"
                  />
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <p className="text-gray-400">Premium kullanıcılar için niyet alanı açık. Boş bırakmak istersen yorum genel enerji üzerinden okunur.</p>
                    <span className="text-primary font-medium whitespace-nowrap">{question.length} / 220</span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/premium")}
                  className="w-full rounded-[1.6rem] border border-amber-400/20 bg-amber-400/10 px-5 py-5 text-left hover:bg-amber-400/15 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-[#F5D06A] px-3 py-1 text-xs font-bold text-[#0D0B1F] mb-3">
                        <Crown size={12} />
                        Premium
                      </div>
                      <p className="text-white font-semibold text-lg">Özel niyetli açılım premium’da</p>
                      <p className="text-gray-300 mt-2 leading-7">
                        Kartlara özel soru iletmek ve daha odaklı bir yorum almak için premium plana geçebilirsin.
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-2xl border border-amber-300/25 bg-black/20 flex items-center justify-center flex-shrink-0">
                      <Lock className="w-5 h-5 text-[#F5D06A]" />
                    </div>
                  </div>
                </button>
              )}
            </div>

            <div className="rounded-[1.7rem] border border-primary/20 bg-primary/10 px-5 py-5 min-w-[220px]">
              <p className="text-xs uppercase tracking-[0.26em] text-primary/80 mb-3">Enerji Durumu</p>
              <p className="text-sm text-gray-300 leading-7 mb-4">
                Üç kart sırasıyla geçmişi, şimdiyi ve yaklaşan gelişmeleri temsil eder. Seçim sırası bu yüzden önemlidir.
              </p>
              <button
                type="button"
                onClick={startDrawStep}
                className="w-full rounded-[1.2rem] bg-primary px-4 py-3 text-[#0D0B1F] font-black hover:brightness-105 transition"
              >
                Kart Seçimine Geç
              </button>
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      ) : null}

      <div className="grid xl:grid-cols-[1.05fr_1.55fr] gap-6 items-start">
        <section className="glass rounded-[2rem] border border-white/10 p-5 md:p-6 xl:sticky xl:top-24">
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-primary/75 mb-2">Açılım Alanı</p>
              <h3 className="text-2xl font-bold text-white">Geçmiş · Şimdi · Gelecek</h3>
              <p className="text-gray-400 mt-2 leading-7">{selectionMessage}</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary font-medium">
              <Stars size={15} />
              {selectedCards.length} / {REQUIRED_CARDS}
            </div>
          </div>

          <div className="grid md:grid-cols-3 xl:grid-cols-1 gap-4">
            {SLOT_LABELS.map((slot, index) =>
              selectedCardObjects[index] ? (
                <FilledSlot key={slot} label={slot} card={selectedCardObjects[index]} order={index + 1} />
              ) : (
                <EmptySlot key={slot} label={slot} />
              )
            )}
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-400">Açılım maliyeti</p>
              <p className="text-2xl font-bold text-primary">{TAROT_COST} Token</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Bakiye</p>
              <p className={tokenBalance >= TAROT_COST ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>{tokenBalance}</p>
            </div>
          </div>
        </section>

        <section className="glass rounded-[2rem] border border-white/10 p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-primary/75 mb-2">Desteden Çek</p>
              <h3 className="text-2xl font-bold text-white">Kart galerisi</h3>
              <p className="text-gray-400 mt-2 leading-7">
                Kartların görselleri artık gerçek. İstersen desteyi yeniden karıştır, sonra içine sinen üç kartı seç.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={reshuffleDeck}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white hover:border-primary/30 hover:text-primary transition"
              >
                <RefreshCcw size={15} />
                Desteyi Karıştır
              </button>
              <button
                type="button"
                onClick={() => setStep("ritual")}
                className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary hover:bg-primary/15 transition"
              >
                Ritüele Dön
              </button>
            </div>
          </div>

          {cardsLoading ? (
            <div className="flex justify-center py-20">
              <div className="h-12 w-12 rounded-full border-4 border-white/10 border-t-primary animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence>
                {orderedDeckCards.map((card, index) => {
                  const isSelected = selectedCards.includes(card.originalIndex);
                  const order = selectedCards.indexOf(card.originalIndex);
                  const canInteract = step === "draw";

                  return (
                    <motion.button
                      key={`${card.originalIndex}-${card.image}`}
                      type="button"
                      initial={{ opacity: 0, y: 24 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: isSelected ? 0.97 : 1,
                        rotate: isSelected ? 0 : index % 2 === 0 ? -1.2 : 1.2,
                      }}
                      transition={{ delay: Math.min(index * 0.018, 0.25), type: "spring", stiffness: 120 }}
                      whileHover={canInteract ? { y: -10, rotate: 0, scale: 1.02 } : {}}
                      whileTap={canInteract ? { scale: 0.98 } : {}}
                      onClick={() => canInteract && handleCardSelect(card.originalIndex)}
                      className={`relative overflow-hidden rounded-[1.55rem] border text-left transition ${
                        canInteract
                          ? isSelected
                            ? "border-primary shadow-[0_0_26px_rgba(245,185,51,0.18)]"
                            : "border-white/10 hover:border-primary/35"
                          : "border-white/10 opacity-60 cursor-not-allowed"
                      }`}
                    >
                      <div className="relative aspect-[0.7] bg-[#120f1f]">
                        <img src={getTarotCardImage(card.image)} alt={card.name_tr || card.name} className="h-full w-full object-cover" />
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#090713] via-[#090713]/75 to-transparent" />
                        {isSelected ? (
                          <div className="absolute top-3 right-3 h-9 w-9 rounded-full bg-primary text-[#0D0B1F] text-sm font-black flex items-center justify-center shadow-lg shadow-primary/25">
                            {order + 1}
                          </div>
                        ) : null}
                      </div>
                      <div className="bg-[#100d1d] px-4 py-4 min-h-[104px]">
                        <p className="text-[15px] font-bold text-white leading-6">{card.name_tr || card.name}</p>
                        <p className="text-xs text-gray-400 mt-2 leading-5 line-clamp-2">{card.meaning}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </section>
      </div>

      <motion.button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting || tokenBalance < TAROT_COST || selectedCards.length !== REQUIRED_CARDS}
        whileHover={!isSubmitting && tokenBalance >= TAROT_COST && selectedCards.length === REQUIRED_CARDS ? { scale: 1.01 } : {}}
        whileTap={!isSubmitting && tokenBalance >= TAROT_COST && selectedCards.length === REQUIRED_CARDS ? { scale: 0.99 } : {}}
        animate={
          selectedCards.length === REQUIRED_CARDS && !isSubmitting
            ? { boxShadow: ["0 0 0 rgba(139,92,246,0.0)", "0 0 28px rgba(139,92,246,0.3)", "0 0 0 rgba(139,92,246,0.0)"] }
            : {}
        }
        transition={{ duration: 2.4, repeat: Infinity }}
        className="w-full rounded-[1.75rem] py-5 text-lg font-bold text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: "linear-gradient(135deg, #f5b933 0%, #8b5cf6 100%)",
        }}
      >
        {isSubmitting ? "Kartların Yorumu Hazırlanıyor..." : selectedCards.length === REQUIRED_CARDS ? "Tarot Açılımını Başlat" : "Önce 3 Kart Seç"}
      </motion.button>
    </motion.div>
  );
}
