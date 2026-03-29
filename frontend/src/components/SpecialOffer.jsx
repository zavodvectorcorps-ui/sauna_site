import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Lightbulb, DoorOpen, Bath, ArrowRight, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAutoScroll } from '../hooks/useAutoScroll';
import { useAutoTranslate } from '../context/AutoTranslateContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const defaultGifts = [
  {
    icon: 'Bath',
    title: 'Balia do schładzania w prezencie',
    subtitle: 'przy saunie od 3 metrów',
    value: '3 980',
    desc: 'Idealna do schładzania po seansie w saunie. Dodajemy przy zamówieniu sauny od 3 metrów.',
    image: '',
  },
  {
    icon: 'Lightbulb',
    title: 'Oświetlenie LED wewnątrz sauny',
    subtitle: 'bez dopłaty',
    value: '1 160',
    desc: 'Oświetlenie LED w łaźni i przebieralni. Lepsza atmosfera i komfort wieczorem.',
    image: '',
  },
  {
    icon: 'DoorOpen',
    title: 'Drzwi ze szkła hartowanego',
    subtitle: 'w standardzie',
    value: '530',
    desc: 'Szklane drzwi hartowane 8mm w standardzie. Więcej światła i nowoczesny wygląd.',
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
  const { tr } = useAutoTranslate();

  const { scrollRef, currentIndex, scrollDir, onTouchStart, onTouchEnd } = useAutoScroll({ itemCount: gifts.length, intervalMs: 4500 });

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
            <span className="text-[#C6A87C] text-xs font-semibold tracking-wider uppercase">{tr('Specjalna oferta')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] mb-3">
            {tr('Przy zamówieniu sauny otrzymujesz dodatki')}<br className="hidden sm:block" />
            <span className="text-[#C6A87C]">{tr('o realnej wartości')}</span>
          </h2>
          <p className="text-sm sm:text-base text-[#595959] max-w-xl mx-auto">
            {tr('Które zwiększają komfort korzystania z sauny. Oferta obowiązuje do końca miesiąca.')}
          </p>
        </motion.div>

        {/* Mobile: horizontal scroll with peek */}
        <div className="md:hidden relative mb-12" data-testid="special-offer-mobile-scroll">
          <div
            ref={scrollRef}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 scroll-pl-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {gifts.map((gift, i) => {
              const IconComp = iconMap[gift.icon] || Gift;
              return (
                <div
                  key={i}
                  className="w-[72vw] flex-shrink-0 snap-start bg-white border border-black/8 shadow-md overflow-hidden rounded-lg"
                  data-testid={`special-offer-card-${i}`}
                >
                  {gift.image && (
                    <div className="aspect-[16/10] overflow-hidden bg-[#F2F2F0]">
                      <img src={gift.image} alt={gift.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      {!gift.image && (
                        <div className="w-10 h-10 bg-[#C6A87C]/10 flex items-center justify-center flex-shrink-0">
                          <IconComp size={20} className="text-[#C6A87C]" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#1A1A1A] text-sm mb-0.5">{tr(gift.title)}</h3>
                        <span className="text-xs text-[#C6A87C] font-medium">{tr(gift.subtitle)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-[#595959] mb-3 leading-relaxed">{tr(gift.desc)}</p>
                    <div className="pt-3 border-t border-black/5">
                      <span className="text-[10px] text-[#8C8C8C] uppercase tracking-wider">{tr('Wartość katalogowa')}</span>
                      <p className="text-lg font-bold text-[#1A1A1A]">{gift.value} <span className="text-sm font-normal text-[#8C8C8C]">PLN</span></p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {gifts.length > 1 && (
            <div className="flex justify-center items-center gap-2 mt-3">
              <button onClick={() => scrollDir('left')} className="w-9 h-9 flex items-center justify-center bg-white border border-black/5 hover:bg-[#C6A87C]/10 transition-colors" data-testid="special-scroll-left">
                <ChevronLeft size={18} className="text-[#595959]" />
              </button>
              {gifts.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === currentIndex ? 'bg-[#C6A87C]' : 'bg-[#D4D4D4]'}`} />
              ))}
              <button onClick={() => scrollDir('right')} className="w-9 h-9 flex items-center justify-center bg-white border border-black/5 hover:bg-[#C6A87C]/10 transition-colors" data-testid="special-scroll-right">
                <ChevronRight size={18} className="text-[#595959]" />
              </button>
            </div>
          )}
        </div>

        {/* Desktop: grid */}
        <div className="hidden md:grid grid-cols-3 gap-6 mb-12">
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
                    <img src={gift.image} alt={tr(gift.title)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
                      <h3 className="font-semibold text-[#1A1A1A] text-sm sm:text-base mb-0.5">{tr(gift.title)}</h3>
                      <span className="text-xs text-[#C6A87C] font-medium">{tr(gift.subtitle)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-[#595959] mb-4 leading-relaxed">{tr(gift.desc)}</p>
                  <div className="pt-3 border-t border-black/5">
                    <span className="text-[10px] text-[#8C8C8C] uppercase tracking-wider">{tr('Wartość katalogowa')}</span>
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
              {tr('Sprawdź koszt sauny')}
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-[#1A1A1A] text-white px-8 py-4 font-semibold hover:bg-black transition-colors"
              data-testid="special-offer-contact-btn"
            >
              {tr('Zachowaj ofertę — zostaw kontakt')}
            </button>
          </div>
          <p className="text-[10px] text-[#8C8C8C] mt-4 max-w-md mx-auto">
            {tr('Oferta dotyczy nowych zamówień. Balia dodawana jest przy długości sauny od 3 metrów. Oferta obowiązuje do końca miesiąca lub do wyczerpania puli.')}
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
                <h3 className="text-lg font-semibold mb-2">{tr('Dziękujemy!')}</h3>
                <p className="text-sm text-[#595959]">{tr('Nasz doradca wkrótce się z Tobą skontaktuje, aby omówić szczegóły oferty specjalnej.')}</p>
                <button onClick={() => setShowForm(false)} className="mt-4 px-6 py-2 bg-[#1A1A1A] text-white text-sm hover:bg-black">{tr('Zamknij')}</button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-1">{tr('Zachowaj aktualną ofertę')}</h3>
                <p className="text-sm text-[#595959] mb-5">{tr('Zostaw dane, a doradca przygotuje wycenę z aktualnymi gratisami.')}</p>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="text" placeholder={tr("Imię *")} required value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    className="w-full p-3 border border-black/10 text-sm focus:border-[#C6A87C] outline-none"
                    data-testid="special-offer-name"
                  />
                  <input
                    type="tel" placeholder={tr("Numer telefonu *")} required value={formData.phone}
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
                    <option value="">{tr('Jaka długość sauny?')}</option>
                    <option value="2-3m">{tr('około 2-3 metry')}</option>
                    <option value="3-4m">{tr('3-4 metry')}</option>
                    <option value="4m+">{tr('powyżej 4 metrów')}</option>
                    <option value="nie wiem">{tr('jeszcze nie wiem')}</option>
                  </select>
                  <textarea
                    placeholder={tr("Wiadomość (opcjonalnie)")} value={formData.message}
                    onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                    rows={2} className="w-full p-3 border border-black/10 text-sm focus:border-[#C6A87C] outline-none resize-none"
                  />
                  <button
                    type="submit" disabled={submitting}
                    className="w-full py-3 bg-[#C6A87C] text-white font-semibold hover:bg-[#B09060] transition-colors disabled:opacity-50"
                    data-testid="special-offer-submit"
                  >
                    {submitting ? tr('Wysyłanie...') : tr('Sprawdź koszt i zarezerwuj ofertę')}
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
