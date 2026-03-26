import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Lightbulb, DoorOpen, Bath, ArrowRight, X } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const defaultGifts = [
  {
    icon: 'Bath',
    title: 'Balia do schladzania w prezencie',
    subtitle: 'przy saunie od 3 metrow',
    value: '3 980',
    desc: 'Idealna do schladzania po seansie w saunie. Dodajemy przy zamowieniu sauny od 3 metrow.',
    image: '',
  },
  {
    icon: 'Lightbulb',
    title: 'Oswietlenie LED wewnatrz sauny',
    subtitle: 'bez doplaty',
    value: '1 160',
    desc: 'Oswietlenie LED w lazni i przebieralni. Lepsza atmosfera i komfort wieczorem.',
    image: '',
  },
  {
    icon: 'DoorOpen',
    title: 'Drzwi ze szkla hartowanego',
    subtitle: 'w standardzie',
    value: '530',
    desc: 'Szklane drzwi hartowane 8mm w standardzie. Wiecej swiatla i nowoczesny wyglad.',
    image: '',
  },
];

const iconMap = { Bath, Lightbulb, DoorOpen, Gift };

export const SpecialOffer = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', size: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [gifts, setGifts] = useState(defaultGifts);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/settings/special-offer`)
      .then(r => r.json())
      .then(d => {
        if (d.cards?.length > 0) setGifts(d.cards);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(`${BACKEND_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          message: `Specjalna oferta. Dlugosc sauny: ${formData.size}. ${formData.message}`,
          type: 'special_offer',
        }),
      });
      setSubmitted(true);
    } catch (err) { console.error(err); }
    setSubmitting(false);
  };

  const scrollToCalc = () => {
    document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-[#F9F9F7] py-16 sm:py-20" data-testid="special-offer">
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#C6A87C]" />

      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-[#C6A87C]/10 border border-[#C6A87C]/20 px-4 py-1.5 mb-5">
            <Gift size={14} className="text-[#C6A87C]" />
            <span className="text-[#C6A87C] text-xs font-semibold tracking-wider uppercase">Specjalna oferta</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-3">
            Przy zamowieniu sauny otrzymujesz dodatki<br className="hidden sm:block" />
            <span className="text-[#C6A87C]">o realnej wartosci</span>
          </h2>
          <p className="text-sm sm:text-base text-[#595959] max-w-xl mx-auto">
            Ktore zwiekszaja komfort korzystania z sauny. Oferta obowiazuje do konca miesiaca.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {gifts.map((gift, i) => {
            const IconComp = iconMap[gift.icon] || Gift;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-black/5 overflow-hidden hover:shadow-md transition-shadow group"
                data-testid={`special-offer-card-${i}`}
              >
                {gift.image && (
                  <div className="aspect-[16/10] overflow-hidden bg-[#F2F2F0]">
                    <img src={gift.image} alt={gift.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    {!gift.image && (
                      <div className="w-12 h-12 bg-[#C6A87C]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#C6A87C]/20 transition-colors">
                        <IconComp size={24} className="text-[#C6A87C]" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#1A1A1A] text-sm sm:text-base mb-0.5">{gift.title}</h3>
                      <span className="text-xs text-[#C6A87C] font-medium">{gift.subtitle}</span>
                    </div>
                  </div>
                  <p className="text-sm text-[#595959] mb-4 leading-relaxed">{gift.desc}</p>
                  <div className="pt-3 border-t border-black/5">
                    <span className="text-[10px] text-[#8C8C8C] uppercase tracking-wider">Wartosc katalogowa</span>
                    <p className="text-lg font-bold text-[#1A1A1A]">{gift.value} <span className="text-sm font-normal text-[#8C8C8C]">PLN</span></p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={scrollToCalc}
              className="flex items-center gap-2 bg-[#C6A87C] text-white px-8 py-4 font-semibold hover:bg-[#B09060] transition-colors"
              data-testid="special-offer-calc-btn"
            >
              Sprawdz koszt sauny
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-[#1A1A1A] text-white px-8 py-4 font-semibold hover:bg-black transition-colors"
              data-testid="special-offer-contact-btn"
            >
              Zachowaj oferte — zostaw kontakt
            </button>
          </div>
          <p className="text-[10px] text-[#8C8C8C] mt-4 max-w-md mx-auto">
            Oferta dotyczy nowych zamowien. Balia dodawana jest przy dlugosci sauny od 3 metrow.
            Oferta obowiazuje do konca miesiaca lub do wyczerpania puli.
          </p>
        </motion.div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white max-w-md w-full p-6 relative"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setShowForm(false)} className="absolute top-3 right-3 text-[#8C8C8C] hover:text-[#1A1A1A]"><X size={20} /></button>

            {submitted ? (
              <div className="text-center py-6">
                <Gift size={40} className="mx-auto text-[#C6A87C] mb-3" />
                <h3 className="text-lg font-semibold mb-2">Dziekujemy!</h3>
                <p className="text-sm text-[#595959]">Nasz doradca wkrotce sie z Toba skontaktuje, aby omowic szczegoly oferty specjalnej.</p>
                <button onClick={() => setShowForm(false)} className="mt-4 px-6 py-2 bg-[#1A1A1A] text-white text-sm hover:bg-black">Zamknij</button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-1">Zachowaj aktualna oferte</h3>
                <p className="text-sm text-[#595959] mb-5">Zostaw dane, a doradca przygotuje wycene z aktualnymi gratisami.</p>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="text" placeholder="Imie *" required value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    className="w-full p-3 border border-black/10 text-sm focus:border-[#C6A87C] outline-none"
                    data-testid="special-offer-name"
                  />
                  <input
                    type="tel" placeholder="Numer telefonu *" required value={formData.phone}
                    onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                    className="w-full p-3 border border-black/10 text-sm focus:border-[#C6A87C] outline-none"
                    data-testid="special-offer-phone"
                  />
                  <select
                    value={formData.size}
                    onChange={e => setFormData(p => ({ ...p, size: e.target.value }))}
                    className="w-full p-3 border border-black/10 text-sm focus:border-[#C6A87C] outline-none text-[#595959]"
                    data-testid="special-offer-size"
                  >
                    <option value="">Jaka dlugosc sauny?</option>
                    <option value="2-3m">okolo 2-3 metry</option>
                    <option value="3-4m">3-4 metry</option>
                    <option value="4m+">powyzej 4 metrow</option>
                    <option value="nie wiem">jeszcze nie wiem</option>
                  </select>
                  <textarea
                    placeholder="Wiadomosc (opcjonalnie)" value={formData.message}
                    onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                    rows={2} className="w-full p-3 border border-black/10 text-sm focus:border-[#C6A87C] outline-none resize-none"
                  />
                  <button
                    type="submit" disabled={submitting}
                    className="w-full py-3 bg-[#C6A87C] text-white font-semibold hover:bg-[#B09060] transition-colors disabled:opacity-50"
                    data-testid="special-offer-submit"
                  >
                    {submitting ? 'Wysylanie...' : 'Sprawdz koszt i zarezerwuj oferte'}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </section>
  );
};
