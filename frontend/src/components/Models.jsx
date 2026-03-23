import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ChevronLeft, ChevronRight, X, Send, Loader2, CheckCircle, GitCompareArrows } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const CALCULATOR_API_URL = 'https://wm-kalkulator.pl';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const Models = () => {
  const { t, language } = useLanguage();
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sectionContent, setSectionContent] = useState(null);
  const [modelsConfig, setModelsConfig] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  // Compare state
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => { fetchModels(); }, []);

  const fetchModels = async () => {
    try {
      const [pricesRes, configRes, contentRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/sauna/prices`),
        fetch(`${BACKEND_URL}/api/settings/models`),
        fetch(`${BACKEND_URL}/api/settings/models-content`)
      ]);
      const data = await pricesRes.json();
      const config = await configRes.json();
      const content = await contentRes.json();
      setModelsConfig(config);
      setSectionContent(content);

      let filteredModels = data.models.filter(m => m.active);
      if (config.enabled_models && config.enabled_models.length > 0) {
        filteredModels = filteredModels.filter(m => config.enabled_models.includes(m.id));
      }

      const processedModels = filteredModels.map(model => ({
        id: model.id,
        name: model.name,
        description: model.description || model.name,
        basePrice: model.basePrice,
        discount: model.discount,
        capacity: model.capacity,
        steamRoomSize: model.steamRoomSize,
        relaxRoomSize: model.relaxRoomSize,
        mainImage: model.imageUrl?.startsWith('http') ? model.imageUrl : `${CALCULATOR_API_URL}${model.imageUrl}`,
        galleryImages: [
          model.imageUrl?.startsWith('http') ? model.imageUrl : `${CALCULATOR_API_URL}${model.imageUrl}`,
          ...(model.galleryImages || []).map(img => img.startsWith('http') ? img : `${CALCULATOR_API_URL}${img}`)
        ].filter(Boolean),
        variants: model.variants || [],
      }));

      setModels(processedModels);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching models:', error);
      setLoading(false);
    }
  };

  const calcPrice = (price, discount) => discount ? Math.round(price * (1 - discount / 100)) : price;

  const openModelCard = (model) => {
    setSelectedModel(model);
    setCurrentImageIndex(0);
    setShowInquiryForm(false);
    setSubmitted(false);
    document.body.style.overflow = 'hidden';
  };

  const closeModelCard = () => {
    setSelectedModel(null);
    document.body.style.overflow = '';
  };

  const nextImage = () => {
    if (selectedModel) setCurrentImageIndex(p => p === selectedModel.galleryImages.length - 1 ? 0 : p + 1);
  };
  const prevImage = () => {
    if (selectedModel) setCurrentImageIndex(p => p === 0 ? selectedModel.galleryImages.length - 1 : p - 1);
  };

  const handleConfigureClick = () => {
    closeModelCard();
    const calc = document.getElementById('calculator');
    if (calc) {
      calc.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('selectModel', { detail: { modelId: selectedModel.id } }));
      }, 500);
    }
  };

  const handleSubmitInquiry = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          model: selectedModel.name,
          total: calcPrice(selectedModel.basePrice, selectedModel.discount),
          type: 'model_inquiry',
        }),
      });
      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', phone: '', email: '', message: '' });
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
    }
    setSubmitting(false);
  };

  // Compare functions
  const toggleCompare = (model, e) => {
    e.stopPropagation();
    setCompareList(prev => {
      if (prev.find(m => m.id === model.id)) return prev.filter(m => m.id !== model.id);
      if (prev.length >= 3) return prev;
      return [...prev, model];
    });
  };

  const isInCompare = (id) => compareList.some(m => m.id === id);

  const lang = language.toLowerCase();
  const labels = {
    pl: {
      compare: 'Porównaj',
      compareModels: 'Porównanie modeli',
      addToCompare: 'Porównaj',
      inCompare: 'W porównaniu',
      model: 'Model',
      price: 'Cena',
      capacity: 'Pojemność',
      steamRoom: 'Parowa',
      relaxRoom: 'Relaks',
      variants: 'Warianty',
      configure: 'Skonfiguruj',
      max3: 'Maks. 3 modele',
      details: 'Zobacz szczegóły',
      configSauna: 'Skonfiguruj tę saunę',
      orderStd: 'Zamów standardową wersję',
      cancel: 'Anuluj',
      sendOrder: 'Wyślij zamówienie',
      thanks: 'Dziękujemy!',
      contactSoon: 'Skontaktujemy się z Tobą wkrótce.',
      basePrice: 'Cena bazowa',
      order: 'Zamów',
      photos: 'zdjęć',
    },
    en: {
      compare: 'Compare',
      compareModels: 'Model comparison',
      addToCompare: 'Compare',
      inCompare: 'In comparison',
      model: 'Model',
      price: 'Price',
      capacity: 'Capacity',
      steamRoom: 'Steam room',
      relaxRoom: 'Relax room',
      variants: 'Variants',
      configure: 'Configure',
      max3: 'Max 3 models',
      details: 'See details',
      configSauna: 'Configure this sauna',
      orderStd: 'Order standard version',
      cancel: 'Cancel',
      sendOrder: 'Send order',
      thanks: 'Thank you!',
      contactSoon: 'We will contact you soon.',
      basePrice: 'Base price',
      order: 'Order',
      photos: 'photos',
    },
  };
  const l = labels[lang] || labels.pl;

  if (!modelsConfig?.show_section) return null;
  if (loading) {
    return (
      <section className="section-spacing bg-[#F9F9F7]">
        <div className="container-main flex justify-center py-20">
          <div className="spinner" />
        </div>
      </section>
    );
  }
  if (models.length === 0) return null;

  return (
    <>
      <section id="models" data-testid="models-section" className="section-spacing bg-[#F9F9F7]">
        <div className="container-main">
          <div className="text-center mb-12">
            <div className="gold-line mx-auto mb-6" />
            <h2 className="section-title" data-testid="models-title">
              {sectionContent ? sectionContent[`title_${lang}`] : 'Nasze modele saun'}
            </h2>
            <p className="section-subtitle mx-auto">
              {sectionContent ? sectionContent[`subtitle_${lang}`] : ''}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model) => (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white border border-black/5 overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => openModelCard(model)}
                data-testid={`model-card-${model.id}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={model.mainImage} alt={model.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  {model.discount > 0 && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 text-sm font-semibold">-{model.discount}%</div>
                  )}
                  {model.galleryImages.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 text-xs">+{model.galleryImages.length - 1} {l.photos}</div>
                  )}
                  {/* Compare checkbox */}
                  <button
                    onClick={(e) => toggleCompare(model, e)}
                    className={`absolute top-4 right-4 px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-all ${
                      isInCompare(model.id)
                        ? 'bg-[#C6A87C] text-white'
                        : 'bg-white/90 text-[#1A1A1A] hover:bg-[#C6A87C] hover:text-white'
                    }`}
                    data-testid={`compare-toggle-${model.id}`}
                  >
                    <GitCompareArrows size={14} />
                    {isInCompare(model.id) ? l.inCompare : l.addToCompare}
                  </button>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">{model.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-[#595959] mb-4">
                    {model.capacity && <span className="flex items-center gap-1"><Users size={14} />{model.capacity}</span>}
                    {model.steamRoomSize && <span>Parowa: {model.steamRoomSize}m²</span>}
                  </div>
                  <div>
                    {model.discount > 0 ? (
                      <>
                        <span className="text-sm text-[#8C8C8C] line-through mr-2">{model.basePrice?.toLocaleString()} PLN</span>
                        <span className="text-xl font-bold text-[#C6A87C]">{calcPrice(model.basePrice, model.discount).toLocaleString()} PLN</span>
                      </>
                    ) : (
                      <span className="text-xl font-bold text-[#C6A87C]">od {model.basePrice?.toLocaleString()} PLN</span>
                    )}
                  </div>
                  <button className="w-full mt-4 py-3 bg-[#1A1A1A] text-white font-medium hover:bg-[#C6A87C] transition-colors">
                    {l.details}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Compare Bar */}
      <AnimatePresence>
        {compareList.length > 0 && !showCompare && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-[#C6A87C] shadow-2xl py-3 px-4"
            data-testid="compare-bar"
          >
            <div className="container-main flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 overflow-x-auto">
                {compareList.map(m => (
                  <div key={m.id} className="flex items-center gap-2 bg-[#F9F9F7] border border-black/5 pl-1 pr-2 py-1 flex-shrink-0">
                    <img src={m.mainImage} alt={m.name} className="w-10 h-10 object-cover" />
                    <span className="text-xs font-medium whitespace-nowrap max-w-[120px] truncate">{m.name}</span>
                    <button onClick={() => setCompareList(prev => prev.filter(x => x.id !== m.id))} className="text-[#8C8C8C] hover:text-red-500">
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <span className="text-xs text-[#8C8C8C] flex-shrink-0">{compareList.length}/3</span>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setCompareList([])}
                  className="px-4 py-2.5 border border-black/10 text-sm font-medium hover:bg-[#F9F9F7] transition-colors"
                >
                  <X size={16} />
                </button>
                <button
                  onClick={() => { setShowCompare(true); document.body.style.overflow = 'hidden'; }}
                  disabled={compareList.length < 2}
                  className="px-5 py-2.5 bg-[#C6A87C] text-white text-sm font-semibold hover:bg-[#B09060] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  data-testid="compare-open-btn"
                >
                  <GitCompareArrows size={16} />
                  {l.compare} ({compareList.length})
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compare Modal */}
      <AnimatePresence>
        {showCompare && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-start justify-center overflow-y-auto p-4 pt-12"
            onClick={() => { setShowCompare(false); document.body.style.overflow = ''; }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="bg-white w-full max-w-5xl my-4"
              onClick={e => e.stopPropagation()}
              data-testid="compare-modal"
            >
              <div className="flex items-center justify-between p-6 border-b border-black/5">
                <h2 className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
                  <GitCompareArrows size={22} className="text-[#C6A87C]" />
                  {l.compareModels}
                </h2>
                <button onClick={() => { setShowCompare(false); document.body.style.overflow = ''; }}
                  className="w-10 h-10 flex items-center justify-center hover:bg-[#F9F9F7] transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr>
                      <th className="p-4 text-left text-sm text-[#8C8C8C] font-medium w-[140px]"></th>
                      {compareList.map(m => (
                        <th key={m.id} className="p-4 text-center" style={{ width: `${100 / (compareList.length + 1)}%` }}>
                          <img src={m.mainImage} alt={m.name} className="w-full aspect-[4/3] object-cover mb-3" />
                          <p className="font-semibold text-[#1A1A1A] text-sm">{m.name}</p>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-black/5">
                      <td className="p-4 text-sm text-[#8C8C8C] font-medium">{l.price}</td>
                      {compareList.map(m => (
                        <td key={m.id} className="p-4 text-center">
                          {m.discount > 0 && <div className="text-xs text-[#8C8C8C] line-through">{m.basePrice?.toLocaleString()} PLN</div>}
                          <div className="text-lg font-bold text-[#C6A87C]">{calcPrice(m.basePrice, m.discount).toLocaleString()} PLN</div>
                          {m.discount > 0 && <div className="text-xs text-red-500 font-semibold">-{m.discount}%</div>}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-black/5 bg-[#F9F9F7]">
                      <td className="p-4 text-sm text-[#8C8C8C] font-medium">{l.capacity}</td>
                      {compareList.map(m => (
                        <td key={m.id} className="p-4 text-center font-medium">{m.capacity || '—'} os.</td>
                      ))}
                    </tr>
                    <tr className="border-t border-black/5">
                      <td className="p-4 text-sm text-[#8C8C8C] font-medium">{l.steamRoom}</td>
                      {compareList.map(m => (
                        <td key={m.id} className="p-4 text-center font-medium">{m.steamRoomSize ? `${m.steamRoomSize} m²` : '—'}</td>
                      ))}
                    </tr>
                    <tr className="border-t border-black/5 bg-[#F9F9F7]">
                      <td className="p-4 text-sm text-[#8C8C8C] font-medium">{l.relaxRoom}</td>
                      {compareList.map(m => (
                        <td key={m.id} className="p-4 text-center font-medium">{m.relaxRoomSize ? `${m.relaxRoomSize} m²` : '—'}</td>
                      ))}
                    </tr>
                    <tr className="border-t border-black/5">
                      <td className="p-4 text-sm text-[#8C8C8C] font-medium">{l.variants}</td>
                      {compareList.map(m => (
                        <td key={m.id} className="p-4 text-center font-medium">{m.variants?.length || 1}</td>
                      ))}
                    </tr>
                    <tr className="border-t border-black/5 bg-[#F9F9F7]">
                      <td className="p-4"></td>
                      {compareList.map(m => (
                        <td key={m.id} className="p-4 text-center">
                          <button
                            onClick={() => {
                              setShowCompare(false);
                              document.body.style.overflow = '';
                              setTimeout(() => {
                                document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
                                setTimeout(() => window.dispatchEvent(new CustomEvent('selectModel', { detail: { modelId: m.id } })), 500);
                              }, 100);
                            }}
                            className="w-full py-2.5 bg-[#C6A87C] text-white text-sm font-semibold hover:bg-[#B09060] transition-colors"
                          >
                            {l.configure}
                          </button>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Model Detail Modal */}
      <AnimatePresence>
        {selectedModel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={closeModelCard}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={closeModelCard} className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 flex items-center justify-center hover:bg-[#C6A87C] hover:text-white transition-colors">
                <X size={20} />
              </button>

              <div className="relative aspect-[16/9] bg-[#F2F2F0]">
                <img src={selectedModel.galleryImages[currentImageIndex]} alt={selectedModel.name} className="w-full h-full object-cover" />
                {selectedModel.galleryImages.length > 1 && (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 flex items-center justify-center hover:bg-[#C6A87C] hover:text-white transition-colors">
                      <ChevronLeft size={24} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 flex items-center justify-center hover:bg-[#C6A87C] hover:text-white transition-colors">
                      <ChevronRight size={24} />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {selectedModel.galleryImages.map((img, idx) => (
                        <button key={idx} onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                          className={`w-12 h-12 border-2 overflow-hidden ${idx === currentImageIndex ? 'border-[#C6A87C]' : 'border-white/50'}`}>
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {selectedModel.discount > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 text-lg font-semibold">-{selectedModel.discount}%</div>
                )}
              </div>

              <div className="p-8">
                <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">{selectedModel.name}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-[#F9F9F7]">
                  {selectedModel.capacity && (
                    <div className="text-center"><div className="text-sm text-[#8C8C8C]">{l.capacity}</div><div className="font-semibold flex items-center justify-center gap-1"><Users size={16} /> {selectedModel.capacity} os.</div></div>
                  )}
                  {selectedModel.steamRoomSize && (
                    <div className="text-center"><div className="text-sm text-[#8C8C8C]">{l.steamRoom}</div><div className="font-semibold">{selectedModel.steamRoomSize} m²</div></div>
                  )}
                  {selectedModel.relaxRoomSize && (
                    <div className="text-center"><div className="text-sm text-[#8C8C8C]">{l.relaxRoom}</div><div className="font-semibold">{selectedModel.relaxRoomSize} m²</div></div>
                  )}
                  <div className="text-center"><div className="text-sm text-[#8C8C8C]">{l.variants}</div><div className="font-semibold">{selectedModel.variants?.length || 1}</div></div>
                </div>

                <div className="mb-6">
                  <div className="text-sm text-[#8C8C8C] mb-1">{l.basePrice}</div>
                  {selectedModel.discount > 0 ? (
                    <div className="flex items-center gap-3">
                      <span className="text-lg text-[#8C8C8C] line-through">{selectedModel.basePrice?.toLocaleString()} PLN</span>
                      <span className="text-3xl font-bold text-[#C6A87C]">{calcPrice(selectedModel.basePrice, selectedModel.discount).toLocaleString()} PLN</span>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-[#C6A87C]">od {selectedModel.basePrice?.toLocaleString()} PLN</span>
                  )}
                </div>

                {!showInquiryForm ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={handleConfigureClick} className="py-4 bg-[#C6A87C] text-white font-semibold hover:bg-[#B09060] transition-colors">
                      {l.configSauna}
                    </button>
                    <button onClick={() => setShowInquiryForm(true)} className="py-4 bg-[#1A1A1A] text-white font-semibold hover:bg-black transition-colors">
                      {l.orderStd}
                    </button>
                  </div>
                ) : (
                  <div className="border border-black/10 p-6">
                    {submitted ? (
                      <div className="text-center py-8">
                        <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">{l.thanks}</h3>
                        <p className="text-[#595959]">{l.contactSoon}</p>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold mb-4">{l.order} {selectedModel.name}</h3>
                        <form onSubmit={handleSubmitInquiry} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Imię i nazwisko *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="p-3 border border-black/10 focus:border-[#C6A87C] outline-none" />
                            <input type="tel" placeholder="Telefon *" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required className="p-3 border border-black/10 focus:border-[#C6A87C] outline-none" />
                          </div>
                          <input type="email" placeholder="Email *" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="w-full p-3 border border-black/10 focus:border-[#C6A87C] outline-none" />
                          <textarea placeholder="Dodatkowe uwagi" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={3} className="w-full p-3 border border-black/10 focus:border-[#C6A87C] outline-none resize-none" />
                          <div className="flex gap-4">
                            <button type="button" onClick={() => setShowInquiryForm(false)} className="flex-1 py-3 border border-black/10 font-medium hover:bg-[#F9F9F7] transition-colors">{l.cancel}</button>
                            <button type="submit" disabled={submitting} className="flex-1 py-3 bg-[#C6A87C] text-white font-medium hover:bg-[#B09060] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                              {submitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                              {l.sendOrder}
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
