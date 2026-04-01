import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Check, ArrowRight, ChevronLeft, ChevronRight, X, Send, Loader2, CheckCircle, Tag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAutoTranslate } from '../context/AutoTranslateContext';
import { useSettings } from '../context/SettingsContext';
import { optimizedImg } from '../lib/utils';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const StockSaunas = () => {
  const { t, language } = useLanguage();
  const { tr } = useAutoTranslate();
  const { getSetting, stockSaunas: contextSaunas } = useSettings();
  const [saunas, setSaunas] = useState([]);
  const [loading, setLoading] = useState(true);
  const sectionContent = getSetting('stock_settings');
  const stockCtaConfig = getSetting('stock_cta_config');
  const sliderRef = useRef(null);

  // Modal state
  const [selectedSauna, setSelectedSauna] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (contextSaunas?.length) {
      setSaunas(contextSaunas);
      setLoading(false);
    } else {
      fetchSaunas();
    }
  }, [contextSaunas]);

  const fetchSaunas = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/stock-saunas`);
      setSaunas(await res.json());
    } catch (e) {
      console.error('Error fetching stock saunas:', e);
    }
    setLoading(false);
  };

  const openModal = (sauna) => {
    setSelectedSauna(sauna);
    setCurrentImageIndex(0);
    setShowOrderForm(false);
    setSubmitted(false);
    setFormData({ name: '', phone: '', email: '', message: '' });
  };

  const closeModal = () => {
    setSelectedSauna(null);
    setShowOrderForm(false);
    setSubmitted(false);
  };

  // All images: main + gallery
  const getAllImages = (sauna) => {
    const imgs = [sauna.image];
    if (sauna.gallery?.length) imgs.push(...sauna.gallery);
    return imgs.filter(Boolean);
  };

  const nextImage = () => {
    if (!selectedSauna) return;
    const imgs = getAllImages(selectedSauna);
    setCurrentImageIndex(p => (p + 1) % imgs.length);
  };
  const prevImage = () => {
    if (!selectedSauna) return;
    const imgs = getAllImages(selectedSauna);
    setCurrentImageIndex(p => p === 0 ? imgs.length - 1 : p - 1);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          model: selectedSauna.name,
          total: selectedSauna.price,
          type: 'stock_sauna_order',
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        setFormData({ name: '', phone: '', email: '', message: '' });
      }
    } catch {}
    setSubmitting(false);
  };

  // CTA button handler
  const handleCtaClick = (sauna) => {
    const action = stockCtaConfig?.action || 'form';
    if (action === 'calculator') {
      closeModal();
      setTimeout(() => document.querySelector('#calculator')?.scrollIntoView({ behavior: 'smooth' }), 300);
    } else if (action === 'whatsapp') {
      const phone = (stockCtaConfig?.action_value || '').replace(/\s/g, '');
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(`Интересует: ${sauna.name}, ${sauna.price.toLocaleString()} PLN`)}`, '_blank');
    } else if (action === 'phone') {
      window.location.href = `tel:${(stockCtaConfig?.action_value || '').replace(/\s/g, '')}`;
    } else if (action === 'link') {
      window.open(stockCtaConfig?.action_value || '#', '_blank');
    } else {
      // Default: open order form
      setShowOrderForm(true);
    }
  };

  const ctaText = stockCtaConfig?.button_text || tr('Kup teraz');

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };

  const SaunaCard = ({ sauna, index, isMobile = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`card-product group cursor-pointer ${isMobile ? 'flex-shrink-0 w-[280px] snap-center' : ''}`}
      data-testid={`stock-card-${sauna.id}`}
      onClick={() => openModal(sauna)}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F2F2F0]">
        <img
          src={optimizedImg(sauna.image, { w: 500, q: 75 })}
          alt={sauna.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Available badge */}
        <div className="absolute top-3 left-3">
          <span className="badge-available flex items-center gap-1">
            <Check size={12} />
            {t('stock.available')}
          </span>
        </div>
        {/* Discount badge */}
        {sauna.discount > 0 && (
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2.5 py-1">
              <Tag size={12} />
              {tr('Promocja')}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <h3 className="font-semibold text-[#1A1A1A] text-base mb-2 line-clamp-2">
          {sauna.name}
        </h3>

        {/* Specs */}
        <div className="flex flex-wrap gap-2 mb-3">
          {sauna.capacity && (
            <span className="inline-flex items-center gap-1 text-xs text-[#595959] bg-[#F2F2F0] px-2 py-1">
              <Users size={12} />
              {sauna.capacity} {t('calculator.persons')}
            </span>
          )}
          {(sauna.steam_room_size || sauna.steamRoomSize) && (
            <span className="inline-flex items-center gap-1 text-xs text-[#595959] bg-[#F2F2F0] px-2 py-1">
              {sauna.steam_room_size || sauna.steamRoomSize}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-end gap-2 mb-4">
          <span className="text-xl font-bold text-[#C6A87C]">
            {sauna.price?.toLocaleString()} PLN
          </span>
        </div>

        {/* CTA */}
        <button
          onClick={(e) => { e.stopPropagation(); openModal(sauna); }}
          className="w-full btn-secondary flex items-center justify-center gap-2 text-sm group/btn py-2"
          data-testid={`stock-buy-${sauna.id}`}
        >
          {tr('Szczegóły')}
          <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform duration-200" />
        </button>
      </div>
    </motion.div>
  );

  return (
    <>
      <section id="stock" data-testid="stock-section" className="section-spacing bg-[#F9F9F7]">
        <div className="container-main">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="gold-line mx-auto mb-6" />
            <h2 className="section-title" data-testid="stock-title">
              {sectionContent ? sectionContent[`title_${language.toLowerCase()}`] : t('stock.title')}
            </h2>
            <p className="section-subtitle mx-auto">
              {sectionContent ? sectionContent[`subtitle_${language.toLowerCase()}`] : t('stock.subtitle')}
            </p>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex justify-center py-20"><div className="spinner" /></div>
          ) : (
            <>
              {/* Mobile Horizontal Slider */}
              <div className="md:hidden relative">
                <button onClick={() => scrollSlider('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 shadow-md flex items-center justify-center text-[#1A1A1A] hover:bg-[#C6A87C] hover:text-white transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={() => scrollSlider('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 shadow-md flex items-center justify-center text-[#1A1A1A] hover:bg-[#C6A87C] hover:text-white transition-colors">
                  <ChevronRight size={20} />
                </button>
                <div ref={sliderRef} className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-2 pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {saunas.map((sauna, index) => (
                    <SaunaCard key={sauna.id} sauna={sauna} index={index} isMobile={true} />
                  ))}
                </div>
              </div>

              {/* Desktop Grid */}
              <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
                {saunas.map((sauna, index) => (
                  <SaunaCard key={sauna.id} sauna={sauna} index={index} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Stock Sauna Detail Modal */}
      <AnimatePresence>
        {selectedSauna && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 overflow-y-auto p-4 pt-8 pb-8"
            onClick={closeModal}
            data-testid="stock-modal-overlay"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white max-w-4xl w-full relative"
              onClick={e => e.stopPropagation()}
              data-testid="stock-modal"
            >
              <button onClick={closeModal} className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 flex items-center justify-center hover:bg-[#C6A87C] hover:text-white transition-colors" data-testid="stock-modal-close">
                <X size={20} />
              </button>

              {/* Gallery */}
              {(() => {
                const images = getAllImages(selectedSauna);
                return (
                  <div className="relative aspect-[16/9] md:aspect-[2.2/1] bg-[#F2F2F0]">
                    <img
                      src={optimizedImg(images[currentImageIndex], { w: 1200, q: 85 })}
                      alt={selectedSauna.name}
                      className="w-full h-full object-cover"
                    />
                    {images.length > 1 && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 flex items-center justify-center hover:bg-[#C6A87C] hover:text-white transition-colors">
                          <ChevronLeft size={24} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 flex items-center justify-center hover:bg-[#C6A87C] hover:text-white transition-colors">
                          <ChevronRight size={24} />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {images.map((img, idx) => (
                            <button
                              key={idx}
                              onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                              className={`w-12 h-12 border-2 overflow-hidden ${idx === currentImageIndex ? 'border-[#C6A87C]' : 'border-white/50'}`}
                            >
                              <img src={optimizedImg(img, { w: 100, q: 60 })} alt="" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-green-600 text-white px-4 py-1.5 text-xs font-medium tracking-wide uppercase flex items-center gap-1">
                        <Check size={14} /> {tr('Dostępna od ręki')}
                      </span>
                      {selectedSauna.discount > 0 && (
                        <span className="bg-red-500 text-white px-4 py-1.5 text-xs font-bold flex items-center gap-1">
                          <Tag size={14} /> {tr('Promocja')} -{selectedSauna.discount}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Content */}
              <div className="p-6 md:p-8">
                {/* Title + Price */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-[#1A1A1A] mb-1" data-testid="stock-modal-title">{selectedSauna.name}</h2>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="text-2xl font-bold text-[#C6A87C]" data-testid="stock-modal-price">
                      {selectedSauna.price?.toLocaleString()} PLN
                    </span>
                    <p className="text-[10px] text-[#8C8C8C] mt-1">{tr('Cena brutto. Gotowa sauna.')}</p>
                  </div>
                </div>

                {/* Description */}
                {selectedSauna.description && (
                  <div className="mb-6 p-4 bg-[#F9F9F7] border-l-4 border-[#C6A87C]">
                    <p className="text-[#595959] leading-relaxed whitespace-pre-line">{tr(selectedSauna.description)}</p>
                  </div>
                )}

                {/* Specs grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 p-4 bg-[#F9F9F7] border border-black/5">
                  {selectedSauna.capacity && (
                    <div className="text-center">
                      <div className="text-xs text-[#8C8C8C] mb-1">{tr('Pojemność')}</div>
                      <div className="font-semibold flex items-center justify-center gap-1">
                        <Users size={16} className="text-[#C6A87C]" /> {selectedSauna.capacity} {tr('os.')}
                      </div>
                    </div>
                  )}
                  {(selectedSauna.steam_room_size || selectedSauna.steamRoomSize) && (
                    <div className="text-center">
                      <div className="text-xs text-[#8C8C8C] mb-1">{tr('Sauna parowa')}</div>
                      <div className="font-semibold">{selectedSauna.steam_room_size || selectedSauna.steamRoomSize}</div>
                    </div>
                  )}
                  {(selectedSauna.relax_room_size || selectedSauna.relaxRoomSize) && (
                    <div className="text-center">
                      <div className="text-xs text-[#8C8C8C] mb-1">{tr('Strefa relaksu')}</div>
                      <div className="font-semibold">{selectedSauna.relax_room_size || selectedSauna.relaxRoomSize}</div>
                    </div>
                  )}
                </div>

                {/* Features */}
                {selectedSauna.features?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">{tr('W zestawie')}:</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedSauna.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-[#595959]">
                          <Check size={14} className="text-[#C6A87C] flex-shrink-0" /> {tr(f)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA / Order Form */}
                {!showOrderForm ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => handleCtaClick(selectedSauna)}
                      className="py-4 bg-[#C6A87C] text-white font-semibold hover:bg-[#B09060] transition-colors flex items-center justify-center gap-2"
                      data-testid="stock-modal-cta"
                    >
                      {ctaText}
                    </button>
                    <button
                      onClick={() => {
                        closeModal();
                        setTimeout(() => document.querySelector('#calculator')?.scrollIntoView({ behavior: 'smooth' }), 300);
                      }}
                      className="py-4 bg-[#1A1A1A] text-white font-semibold hover:bg-black transition-colors"
                      data-testid="stock-modal-configure"
                    >
                      {tr('Skonfiguruj saunę')}
                    </button>
                  </div>
                ) : (
                  <div className="border border-black/10 p-6" data-testid="stock-order-form">
                    {submitted ? (
                      <div className="text-center py-8">
                        <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">{tr('Dziękujemy!')}</h3>
                        <p className="text-[#595959]">{tr('Nasz doradca skontaktuje się z Tobą wkrótce.')}</p>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold mb-4">{tr('Zamów')}: {selectedSauna.name}</h3>
                        <form onSubmit={handleSubmitOrder} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder={tr("Imię i nazwisko *")} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="p-3 border border-black/10 focus:border-[#C6A87C] outline-none" data-testid="stock-order-name" />
                            <input type="tel" placeholder={tr("Telefon *")} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required className="p-3 border border-black/10 focus:border-[#C6A87C] outline-none" data-testid="stock-order-phone" />
                          </div>
                          <input type="email" placeholder="Email *" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required className="w-full p-3 border border-black/10 focus:border-[#C6A87C] outline-none" data-testid="stock-order-email" />
                          <textarea placeholder={tr("Dodatkowe uwagi")} value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} rows={3} className="w-full p-3 border border-black/10 focus:border-[#C6A87C] outline-none resize-none" />
                          <div className="flex gap-4">
                            <button type="button" onClick={() => setShowOrderForm(false)} className="flex-1 py-3 border border-black/10 font-medium hover:bg-[#F9F9F7]">{tr('Anuluj')}</button>
                            <button type="submit" disabled={submitting} className="flex-1 py-3 bg-[#C6A87C] text-white font-medium hover:bg-[#B09060] disabled:opacity-50 flex items-center justify-center gap-2" data-testid="stock-order-submit">
                              {submitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />} {tr('Wyślij zamówienie')}
                            </button>
                          </div>
                        </form>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
