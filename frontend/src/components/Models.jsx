import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ChevronLeft, ChevronRight, X, Send, Loader2, CheckCircle, GitCompareArrows, Ruler, Maximize2, Download, Flame, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SaunaInstallment } from './SaunaInstallment';

const CALCULATOR_API_URL = 'https://wm-kalkulator.pl';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const resolveImg = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${CALCULATOR_API_URL}${url}`;
};

const getModelType = (model) => {
  const id = (model.id || '').toLowerCase();
  if (id.includes('wiking')) return 'wiking';
  if (id.includes('kwadro')) return 'kwadro';
  if (id.includes('beczka') && !id.includes('kwadro')) return 'beczka';
  return 'other';
};

export const Models = () => {
  const { language } = useLanguage();
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
  const [activeVariantIdx, setActiveVariantIdx] = useState(0);
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [hasCatalog, setHasCatalog] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [heaterPrices, setHeaterPrices] = useState({ electric: 2600, wood: 3600 });
  const [showAll, setShowAll] = useState(false);
  const INITIAL_COUNT = 3;

  const lang = language.toLowerCase();

  useEffect(() => {
    fetchModels();
    fetchHeaterPrices();
    fetch(`${BACKEND_URL}/api/catalog/info`).then(r => r.json()).then(d => setHasCatalog(d.available)).catch(() => {});
  }, []);

  const fetchHeaterPrices = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/sauna/prices`);
      const data = await res.json();
      const heaterCat = (data.categories || []).find(c => c.name === 'Piece');
      if (heaterCat) {
        let minElectric = Infinity, minWood = Infinity;
        for (const opt of heaterCat.options) {
          const id = (opt.id || '').toLowerCase();
          const price = opt.price || 0;
          if (price <= 0) continue;
          if (id.includes('elektr')) minElectric = Math.min(minElectric, price);
          if (id.includes('drewno') || id.includes('drew')) minWood = Math.min(minWood, price);
        }
        setHeaterPrices({
          electric: minElectric === Infinity ? 2600 : minElectric,
          wood: minWood === Infinity ? 3600 : minWood,
        });
      }
    } catch (e) { /* keep defaults */ }
  };

  const fetchModels = async () => {
    try {
      const [publicRes, configRes, contentRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/sauna/public-models?lang=${lang}`),
        fetch(`${BACKEND_URL}/api/settings/models`),
        fetch(`${BACKEND_URL}/api/settings/models-content`)
      ]);
      const publicData = await publicRes.json();
      const config = await configRes.json();
      const content = await contentRes.json();
      setModelsConfig(config);
      setSectionContent(content);

      let apiModels = publicData.models || [];
      if (config.enabled_models?.length > 0) {
        apiModels = apiModels.filter(m => config.enabled_models.includes(m.id));
      }

      const processedModels = apiModels.map(model => ({
        ...model,
        mainImage: resolveImg(model.imageUrl),
        galleryImages: [
          resolveImg(model.imageUrl),
          ...(model.galleryImages || []).map(resolveImg)
        ].filter(Boolean),
        adminDesc_pl: config.descriptions?.[model.id]?.description_pl || '',
        adminDesc_en: config.descriptions?.[model.id]?.description_en || '',
        modelType: getModelType(model),
      }));

      setModels(processedModels);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching models:', error);
      setLoading(false);
    }
  };

  const openModelCard = (model) => {
    setSelectedModel(model);
    setCurrentImageIndex(0);
    setActiveVariantIdx(0);
    setShowInquiryForm(false);
    setSubmitted(false);
    document.body.style.overflow = 'hidden';
  };

  const closeModelCard = () => { setSelectedModel(null); document.body.style.overflow = ''; };
  const nextImage = () => { if (selectedModel) setCurrentImageIndex(p => (p + 1) % selectedModel.galleryImages.length); };
  const prevImage = () => { if (selectedModel) setCurrentImageIndex(p => p === 0 ? selectedModel.galleryImages.length - 1 : p - 1); };

  const handleConfigureClick = () => {
    closeModelCard();
    const calc = document.getElementById('calculator');
    if (calc) {
      calc.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => window.dispatchEvent(new CustomEvent('selectModel', { detail: { modelId: selectedModel.id } })), 500);
    }
  };

  const handleSubmitInquiry = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, model: selectedModel.name, total: selectedModel.basePrice, type: 'model_inquiry' }),
      });
      if (res.ok) { setSubmitted(true); setFormData({ name: '', phone: '', email: '', message: '' }); }
    } catch (err) { console.error(err); }
    setSubmitting(false);
  };

  const toggleCompare = (model, e) => {
    e.stopPropagation();
    setCompareList(prev => {
      if (prev.find(m => m.id === model.id)) return prev.filter(m => m.id !== model.id);
      if (prev.length >= 3) return prev;
      return [...prev, model];
    });
  };
  const isInCompare = (id) => compareList.some(m => m.id === id);

  const getDescription = (model) => {
    const adminDesc = lang === 'en' ? model.adminDesc_en : model.adminDesc_pl;
    if (adminDesc) return adminDesc;
    return model.description || '';
  };

  // Filtered models
  const filteredModels = activeFilter === 'all' ? models : models.filter(m => m.modelType === activeFilter);

  // Check if filter categories exist in data
  const hasType = (type) => models.some(m => m.modelType === type);

  // Labels
  const l = lang === 'en' ? {
    compare: 'Compare', compareModels: 'Model comparison', addToCompare: 'Compare', inCompare: 'In comparison',
    price: 'Price', capacity: 'Capacity', steamRoom: 'Steam room', relaxRoom: 'Relax room',
    variants: 'Variants', configure: 'Configure', details: 'See details', configSauna: 'Configure this sauna',
    orderStd: 'Order standard version', cancel: 'Cancel', sendOrder: 'Send order', thanks: 'Thank you!',
    contactSoon: 'We will contact you soon.', basePrice: 'Base price', order: 'Order', photos: 'photos',
    terrace: 'Terrace', entrance: 'Entrance', selectVariant: 'Available layouts',
    from: 'from', persons: 'persons', length: 'Length', foundation: 'Foundation',
    withElectric: 'with electric heater', withWood: 'with wood heater',
    priceInclVat: 'Price includes VAT', readySauna: 'Ready-made, fully assembled',
    priceForReady: 'Price for ready sauna with heater',
    all: 'All', barrels: 'Barrels', quadro: 'Quadro', viking: 'Viking',
    showMore: 'See all models',
  } : {
    compare: 'Porównaj', compareModels: 'Porównanie modeli', addToCompare: 'Porównaj', inCompare: 'W porównaniu',
    price: 'Cena', capacity: 'Pojemność', steamRoom: 'Łaźnia parowa', relaxRoom: 'Pokój wypoczynkowy',
    variants: 'Warianty', configure: 'Skonfiguruj', details: 'Zobacz szczegóły', configSauna: 'Skonfiguruj tę saunę',
    orderStd: 'Zamów standardową wersję', cancel: 'Anuluj', sendOrder: 'Wyślij zamówienie', thanks: 'Dziękujemy!',
    contactSoon: 'Skontaktujemy się z Tobą wkrótce.', basePrice: 'Cena bazowa', order: 'Zamów', photos: 'zdjęć',
    terrace: 'Taras', entrance: 'Wejście', selectVariant: 'Dostępne układy',
    from: 'od', persons: 'os.', length: 'Długość', foundation: 'Fundament',
    withElectric: 'z piecem elektrycznym', withWood: 'z piecem na drewno',
    priceInclVat: 'Cena zawiera VAT', readySauna: 'Gotowa, zmontowana sauna',
    priceForReady: 'Cena za gotową saunę z piecem',
    all: 'Wszystkie', barrels: 'Beczki', quadro: 'Kwadro', viking: 'Wiking',
    showMore: 'Zobacz wszystkie modele',
  };

  const filters = [
    { key: 'all', label: l.all },
    ...(hasType('beczka') ? [{ key: 'beczka', label: l.barrels }] : []),
    ...(hasType('kwadro') ? [{ key: 'kwadro', label: l.quadro }] : []),
    ...(hasType('wiking') ? [{ key: 'wiking', label: l.viking }] : []),
  ];

  // Price helpers
  const priceElectric = (base) => base + heaterPrices.electric;
  const priceWood = (base) => base + heaterPrices.wood;

  if (!modelsConfig?.show_section) return null;
  if (loading) return <section className="section-spacing bg-[#F9F9F7]"><div className="container-main flex justify-center py-20"><div className="w-10 h-10 border-2 border-[#C6A87C] border-t-transparent rounded-full animate-spin" /></div></section>;
  if (models.length === 0) return null;

  return (
    <>
      <section id="models" data-testid="models-section" className="section-spacing bg-[#F9F9F7]">
        <div className="container-main">
          <div className="text-center mb-8">
            <div className="gold-line mx-auto mb-6" />
            <h2 className="section-title" data-testid="models-title">
              {sectionContent ? (sectionContent[`title_${lang}`] || sectionContent.title_pl) : 'Nasze modele saun'}
            </h2>
            <p className="section-subtitle mx-auto">
              {sectionContent ? (sectionContent[`subtitle_${lang}`] || sectionContent.subtitle_pl) : ''}
            </p>
          </div>

          {/* Filter tabs */}
          {filters.length > 2 && (
            <div className="flex justify-center gap-2 mb-8 flex-wrap" data-testid="models-filter">
              {filters.map(f => (
                <button
                  key={f.key}
                  onClick={() => { setActiveFilter(f.key); setShowAll(false); }}
                  className={`px-5 py-2 text-sm font-medium transition-colors border ${
                    activeFilter === f.key
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                      : 'bg-white text-[#595959] border-black/10 hover:border-[#C6A87C] hover:text-[#C6A87C]'
                  }`}
                  data-testid={`filter-${f.key}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(showAll ? filteredModels : filteredModels.slice(0, INITIAL_COUNT)).map((model) => {
              const desc = getDescription(model);
              return (
                <motion.div
                  key={model.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  layout
                  className="bg-white border border-black/5 overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow flex flex-col"
                  onClick={() => openModelCard(model)}
                  data-testid={`model-card-${model.id}`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={model.mainImage} alt={model.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    {/* Ready sauna badge */}
                    <div className="absolute top-4 left-4 bg-[#1A1A1A]/85 text-white px-3 py-1 text-[10px] font-medium tracking-wide uppercase">
                      {l.readySauna}
                    </div>
                    {model.galleryImages.length > 1 && <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 text-xs">+{model.galleryImages.length - 1} {l.photos}</div>}
                    <button onClick={(e) => toggleCompare(model, e)} className={`absolute top-4 right-4 px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-all ${isInCompare(model.id) ? 'bg-[#C6A87C] text-white' : 'bg-white/90 text-[#1A1A1A] hover:bg-[#C6A87C] hover:text-white'}`} data-testid={`compare-toggle-${model.id}`}>
                      <GitCompareArrows size={14} />
                      {isInCompare(model.id) ? l.inCompare : l.addToCompare}
                    </button>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">{model.name}</h3>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#595959] mb-3">
                      {model.capacity && <span className="flex items-center gap-1"><Users size={14} className="text-[#C6A87C]" /> {model.capacity} {l.persons}</span>}
                      {model.layoutSize && <span className="flex items-center gap-1"><Ruler size={14} className="text-[#C6A87C]" /> {model.layoutSize}</span>}
                      {model.variants?.length > 1 && <span className="flex items-center gap-1"><Maximize2 size={14} className="text-[#C6A87C]" /> {model.variants.length} {l.variants.toLowerCase()}</span>}
                    </div>

                    {desc && <p className="text-sm text-[#8C8C8C] mb-4 line-clamp-2">{desc}</p>}

                    <div className="mt-auto">
                      {/* Two prices: electric + wood heater */}
                      <div className="mb-3 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Zap size={14} className="text-amber-500 flex-shrink-0" />
                          <span className="text-base font-bold text-[#1A1A1A]">{l.from} {priceElectric(model.basePrice).toLocaleString()} PLN</span>
                          <span className="text-[10px] text-[#8C8C8C]">{l.withElectric}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Flame size={14} className="text-orange-600 flex-shrink-0" />
                          <span className="text-base font-bold text-[#1A1A1A]">{l.from} {priceWood(model.basePrice).toLocaleString()} PLN</span>
                          <span className="text-[10px] text-[#8C8C8C]">{l.withWood}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-[#8C8C8C] mb-3">{l.priceForReady}. {l.priceInclVat}.</p>
                      <div className="mb-3 bg-[#F5F0EB] border border-[#C6A87C]/20 p-2.5" data-testid={`model-installment-${model.id}`}>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#C6A87C] text-xs font-semibold">Raty od 500 zl/mc</span>
                        </div>
                        <p className="text-gray-500 text-[10px]">Od 4 do 20 miesiecy, 0% nadplaty</p>
                      </div>
                      <button className="w-full py-3 bg-[#1A1A1A] text-white font-medium hover:bg-[#C6A87C] transition-colors">{l.details}</button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {!showAll && filteredModels.length > INITIAL_COUNT && (
            <div className="text-center mt-8">
              <button
                onClick={() => setShowAll(true)}
                className="px-8 py-3 border border-[#C6A87C] text-[#C6A87C] font-medium hover:bg-[#C6A87C] hover:text-white transition-colors"
                data-testid="models-show-more"
              >
                {l.showMore || 'Zobacz wszystkie modele'} ({filteredModels.length - INITIAL_COUNT})
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Floating Compare Bar */}
      <AnimatePresence>
        {compareList.length > 0 && !showCompare && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-[#C6A87C] shadow-2xl py-3 px-4" data-testid="compare-bar">
            <div className="container-main flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 overflow-x-auto">
                {compareList.map(m => (
                  <div key={m.id} className="flex items-center gap-2 bg-[#F9F9F7] border border-black/5 pl-1 pr-2 py-1 flex-shrink-0">
                    <img src={m.mainImage} alt={m.name} className="w-10 h-10 object-cover" />
                    <span className="text-xs font-medium whitespace-nowrap max-w-[120px] truncate">{m.name}</span>
                    <button onClick={() => setCompareList(prev => prev.filter(x => x.id !== m.id))} className="text-[#8C8C8C] hover:text-red-500"><X size={14} /></button>
                  </div>
                ))}
                <span className="text-xs text-[#8C8C8C] flex-shrink-0">{compareList.length}/3</span>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => setCompareList([])} className="px-4 py-2.5 border border-black/10 text-sm font-medium hover:bg-[#F9F9F7]"><X size={16} /></button>
                <button onClick={() => { setShowCompare(true); document.body.style.overflow = 'hidden'; }} disabled={compareList.length < 2}
                  className="px-5 py-2.5 bg-[#C6A87C] text-white text-sm font-semibold hover:bg-[#B09060] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2" data-testid="compare-open-btn">
                  <GitCompareArrows size={16} /> {l.compare} ({compareList.length})
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compare Modal */}
      <AnimatePresence>
        {showCompare && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 flex items-start justify-center overflow-y-auto p-4 pt-12"
            onClick={() => { setShowCompare(false); document.body.style.overflow = ''; }}>
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }} className="bg-white w-full max-w-5xl my-4" onClick={e => e.stopPropagation()} data-testid="compare-modal">
              <div className="flex items-center justify-between p-6 border-b border-black/5">
                <h2 className="text-xl font-bold text-[#1A1A1A] flex items-center gap-2"><GitCompareArrows size={22} className="text-[#C6A87C]" /> {l.compareModels}</h2>
                <button onClick={() => { setShowCompare(false); document.body.style.overflow = ''; }} className="w-10 h-10 flex items-center justify-center hover:bg-[#F9F9F7]"><X size={20} /></button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr>
                      <th className="p-4 text-left text-sm text-[#8C8C8C] font-medium w-[140px]"></th>
                      {compareList.map(m => (<th key={m.id} className="p-4 text-center"><img src={m.mainImage} alt={m.name} className="w-full aspect-[4/3] object-cover mb-3" /><p className="font-semibold text-[#1A1A1A] text-sm">{m.name}</p></th>))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: `${l.price} (${l.withElectric})`, render: m => <span className="text-lg font-bold text-[#C6A87C]">{l.from} {priceElectric(m.basePrice).toLocaleString()} PLN</span> },
                      { label: `${l.price} (${l.withWood})`, render: m => <span className="text-lg font-bold text-[#C6A87C]">{l.from} {priceWood(m.basePrice).toLocaleString()} PLN</span> },
                      { label: l.capacity, render: m => `${m.capacity || '—'} ${l.persons}` },
                      { label: l.length, render: m => m.layoutSize || '—' },
                      { label: l.steamRoom, render: m => m.steamRoomSize || '—' },
                      { label: l.relaxRoom, render: m => m.relaxRoomSize || '—' },
                      { label: l.variants, render: m => m.variants?.length || 1 },
                    ].map((row, i) => (
                      <tr key={i} className={`border-t border-black/5 ${i % 2 ? 'bg-[#F9F9F7]' : ''}`}>
                        <td className="p-4 text-sm text-[#8C8C8C] font-medium">{row.label}</td>
                        {compareList.map(m => (<td key={m.id} className="p-4 text-center font-medium">{row.render(m)}</td>))}
                      </tr>
                    ))}
                    <tr className="border-t border-black/5 bg-[#F9F9F7]">
                      <td className="p-4"></td>
                      {compareList.map(m => (<td key={m.id} className="p-4 text-center">
                        <button onClick={() => { setShowCompare(false); document.body.style.overflow = ''; setTimeout(() => { document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' }); setTimeout(() => window.dispatchEvent(new CustomEvent('selectModel', { detail: { modelId: m.id } })), 500); }, 100); }}
                          className="w-full py-2.5 bg-[#C6A87C] text-white text-sm font-semibold hover:bg-[#B09060]">{l.configure}</button>
                      </td>))}
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 overflow-y-auto p-4 pt-8 pb-8" onClick={closeModelCard}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white max-w-5xl w-full relative" onClick={e => e.stopPropagation()}>
              <button onClick={closeModelCard} className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 flex items-center justify-center hover:bg-[#C6A87C] hover:text-white transition-colors"><X size={20} /></button>

              {/* Gallery */}
              <div className="relative aspect-[16/9] md:aspect-[2.2/1] bg-[#F2F2F0]">
                <img src={selectedModel.galleryImages[currentImageIndex]} alt={selectedModel.name} className="w-full h-full object-cover" />
                {selectedModel.galleryImages.length > 1 && (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 flex items-center justify-center hover:bg-[#C6A87C] hover:text-white transition-colors"><ChevronLeft size={24} /></button>
                    <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 flex items-center justify-center hover:bg-[#C6A87C] hover:text-white transition-colors"><ChevronRight size={24} /></button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {selectedModel.galleryImages.map((img, idx) => (
                        <button key={idx} onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }} className={`w-12 h-12 border-2 overflow-hidden ${idx === currentImageIndex ? 'border-[#C6A87C]' : 'border-white/50'}`}>
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {/* Ready sauna badge on modal */}
                <div className="absolute top-4 left-4 bg-[#1A1A1A]/85 text-white px-4 py-1.5 text-xs font-medium tracking-wide uppercase">
                  {l.readySauna}
                </div>
              </div>

              <div className="p-6 md:p-8">
                {/* Title + Prices */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-[#1A1A1A] mb-1">{selectedModel.name}</h2>
                    {selectedModel.layoutSize && <span className="text-sm text-[#8C8C8C]">{l.length}: {selectedModel.layoutSize}</span>}
                  </div>
                  <div className="flex-shrink-0">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Zap size={16} className="text-amber-500" />
                        <span className="text-xl font-bold text-[#1A1A1A]">{l.from} {priceElectric(selectedModel.basePrice).toLocaleString()} PLN</span>
                        <span className="text-xs text-[#8C8C8C]">{l.withElectric}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Flame size={16} className="text-orange-600" />
                        <span className="text-xl font-bold text-[#1A1A1A]">{l.from} {priceWood(selectedModel.basePrice).toLocaleString()} PLN</span>
                        <span className="text-xs text-[#8C8C8C]">{l.withWood}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-[#8C8C8C] mt-1">{l.priceForReady}. {l.priceInclVat}.</p>
                  </div>
                </div>

                {/* Description */}
                {getDescription(selectedModel) && (
                  <div className="mb-6 p-4 bg-[#F9F9F7] border-l-4 border-[#C6A87C]">
                    <p className="text-[#595959] leading-relaxed whitespace-pre-line">{getDescription(selectedModel)}</p>
                  </div>
                )}

                {/* Specs grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 p-4 bg-[#F9F9F7] border border-black/5">
                  {selectedModel.capacity && (
                    <div className="text-center"><div className="text-xs text-[#8C8C8C] mb-1">{l.capacity}</div><div className="font-semibold flex items-center justify-center gap-1"><Users size={16} className="text-[#C6A87C]" /> {selectedModel.capacity} {l.persons}</div></div>
                  )}
                  {selectedModel.steamRoomSize && (
                    <div className="text-center"><div className="text-xs text-[#8C8C8C] mb-1">{l.steamRoom}</div><div className="font-semibold">{selectedModel.steamRoomSize}</div></div>
                  )}
                  {selectedModel.relaxRoomSize && (
                    <div className="text-center"><div className="text-xs text-[#8C8C8C] mb-1">{l.relaxRoom}</div><div className="font-semibold">{selectedModel.relaxRoomSize}</div></div>
                  )}
                  {selectedModel.foundationPrice > 0 && (
                    <div className="text-center"><div className="text-xs text-[#8C8C8C] mb-1">{l.foundation}</div><div className="font-semibold">{selectedModel.foundationPrice} PLN/m</div></div>
                  )}
                </div>

                {/* Variants section */}
                {selectedModel.variants?.length > 1 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">{l.selectVariant}</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedModel.variants.map((v, idx) => (
                        <button
                          key={v.id}
                          onClick={() => setActiveVariantIdx(idx)}
                          className={`px-4 py-2 text-sm border transition-colors ${
                            activeVariantIdx === idx ? 'border-[#C6A87C] bg-[#C6A87C]/10 text-[#C6A87C] font-medium' : 'border-black/10 hover:border-[#C6A87C]/50'
                          }`}
                        >
                          {v.name || `Wariant ${idx + 1}`}
                        </button>
                      ))}
                    </div>
                    {(() => {
                      const v = selectedModel.variants[activeVariantIdx];
                      if (!v) return null;
                      const variantImg = resolveImg(v.imageUrl);
                      return (
                        <div className="border border-black/5 p-4 bg-[#F9F9F7]">
                          <div className="flex flex-col md:flex-row gap-4">
                            {variantImg && (
                              <div className="md:w-1/3 flex-shrink-0">
                                <img src={variantImg} alt={v.name} className="w-full object-contain bg-white border border-black/5" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h4 className="font-semibold mb-2">{v.name || `Wariant ${activeVariantIdx + 1}`}</h4>
                              {v.description && <p className="text-sm text-[#595959] mb-3 whitespace-pre-line">{v.description}</p>}
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                {v.capacity && <div><span className="text-[#8C8C8C]">{l.capacity}:</span> <span className="font-medium">{v.capacity} {l.persons}</span></div>}
                                {v.steamRoomSize && <div><span className="text-[#8C8C8C]">{l.steamRoom}:</span> <span className="font-medium">{v.steamRoomSize}</span></div>}
                                {v.relaxRoomSize && <div><span className="text-[#8C8C8C]">{l.relaxRoom}:</span> <span className="font-medium">{v.relaxRoomSize}</span></div>}
                                {v.terraceSize && v.terraceSize !== '-' && <div><span className="text-[#8C8C8C]">{l.terrace}:</span> <span className="font-medium">{v.terraceSize}</span></div>}
                                {v.entranceSide && <div><span className="text-[#8C8C8C]">{l.entrance}:</span> <span className="font-medium">{v.entranceSide}</span></div>}
                                {v.price > 0 && <div><span className="text-[#8C8C8C]">{l.price}:</span> <span className="font-medium text-[#C6A87C]">+{v.price.toLocaleString()} PLN</span></div>}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {selectedModel.comparisonTable?.rows?.length > 1 && (
                      <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-sm border border-black/5">
                          <thead>
                            <tr className="bg-[#1A1A1A] text-white">
                              {selectedModel.comparisonTable.headers.map((h, i) => (
                                <th key={i} className="p-3 text-center font-medium whitespace-nowrap">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {selectedModel.comparisonTable.rows.map((row, idx) => (
                              <tr key={idx} className={`border-t border-black/5 cursor-pointer transition-colors ${idx === activeVariantIdx ? 'bg-[#C6A87C]/10' : idx % 2 ? 'bg-[#F9F9F7]' : 'hover:bg-[#F9F9F7]'}`}
                                onClick={() => setActiveVariantIdx(idx)}>
                                <td className="p-3 font-medium">{row.name}</td>
                                <td className="p-3 text-center">{row.capacity || '—'}</td>
                                <td className="p-3 text-center">{row.relaxRoomSize || '—'}</td>
                                <td className="p-3 text-center">{row.steamRoomSize || '—'}</td>
                                <td className="p-3 text-center">{row.terraceSize && row.terraceSize !== '-' ? row.terraceSize : '—'}</td>
                                <td className="p-3 text-center">{row.entranceSide || '—'}</td>
                                <td className="p-3 text-center font-medium text-[#C6A87C]">{row.price > 0 ? `+${row.price.toLocaleString()} PLN` : '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {selectedModel.variants?.length === 1 && selectedModel.variants[0].description && (
                  <div className="mb-6 p-4 bg-[#F9F9F7] border border-black/5">
                    <p className="text-sm text-[#595959] whitespace-pre-line">{selectedModel.variants[0].description}</p>
                  </div>
                )}

                {/* Installment compact */}
                <div className="mb-6">
                  <SaunaInstallment variant="compact" />
                </div>

                {/* CTA */}
                {!showInquiryForm ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={handleConfigureClick} className="py-4 bg-[#C6A87C] text-white font-semibold hover:bg-[#B09060] transition-colors">{l.configSauna}</button>
                    <button onClick={() => setShowInquiryForm(true)} className="py-4 bg-[#1A1A1A] text-white font-semibold hover:bg-black transition-colors">{l.orderStd}</button>
                  </div>
                ) : (
                  <div className="border border-black/10 p-6">
                    {submitted ? (
                      <div className="text-center py-8">
                        <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">{l.thanks}</h3>
                        <p className="text-[#595959]">{l.contactSoon}</p>
                        {hasCatalog && (
                          <a href={`${BACKEND_URL}/api/catalog/download`} target="_blank" rel="noopener noreferrer" data-testid="model-catalog-btn"
                            className="mt-4 inline-flex items-center gap-2 bg-[#1A1A1A] text-white px-5 py-2.5 text-sm font-medium hover:bg-black transition-colors">
                            <Download size={14} /> Pobierz katalog
                          </a>
                        )}
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold mb-4">{l.order} {selectedModel.name}</h3>
                        <form onSubmit={handleSubmitInquiry} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Imię i nazwisko *" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="p-3 border border-black/10 focus:border-[#C6A87C] outline-none" />
                            <input type="tel" placeholder="Telefon *" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required className="p-3 border border-black/10 focus:border-[#C6A87C] outline-none" />
                          </div>
                          <input type="email" placeholder="Email *" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required className="w-full p-3 border border-black/10 focus:border-[#C6A87C] outline-none" />
                          <textarea placeholder="Dodatkowe uwagi" value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} rows={3} className="w-full p-3 border border-black/10 focus:border-[#C6A87C] outline-none resize-none" />
                          <div className="flex gap-4">
                            <button type="button" onClick={() => setShowInquiryForm(false)} className="flex-1 py-3 border border-black/10 font-medium hover:bg-[#F9F9F7]">{l.cancel}</button>
                            <button type="submit" disabled={submitting} className="flex-1 py-3 bg-[#C6A87C] text-white font-medium hover:bg-[#B09060] disabled:opacity-50 flex items-center justify-center gap-2">
                              {submitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />} {l.sendOrder}
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
