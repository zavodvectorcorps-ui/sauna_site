import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ChevronLeft, ChevronRight, X, Send, Loader2, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const CALCULATOR_API_URL = 'https://wm-kalkulator.pl';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const Models = ({ onSelectModel }) => {
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

  useEffect(() => {
    fetchModels();
  }, []);

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

      // Filter models based on config
      let filteredModels = data.models.filter(m => m.active);
      if (config.enabled_models && config.enabled_models.length > 0) {
        filteredModels = filteredModels.filter(m => config.enabled_models.includes(m.id));
      }

      // Process models
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

  const calculatePrice = (price, discount) => {
    if (!discount) return price;
    return Math.round(price * (1 - discount / 100));
  };

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
    if (selectedModel) {
      setCurrentImageIndex(prev => 
        prev === selectedModel.galleryImages.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedModel) {
      setCurrentImageIndex(prev => 
        prev === 0 ? selectedModel.galleryImages.length - 1 : prev - 1
      );
    }
  };

  const handleConfigureClick = () => {
    closeModelCard();
    // Scroll to calculator and select model
    const calculator = document.getElementById('calculator');
    if (calculator) {
      calculator.scrollIntoView({ behavior: 'smooth' });
      // Dispatch custom event to select model in calculator
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
          total: calculatePrice(selectedModel.basePrice, selectedModel.discount),
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
          {/* Header */}
          <div className="text-center mb-12">
            <div className="gold-line mx-auto mb-6" />
            <h2 className="section-title" data-testid="models-title">
              {sectionContent ? sectionContent[`title_${language.toLowerCase()}`] : 'Nasze modele saun'}
            </h2>
            <p className="section-subtitle mx-auto">
              {sectionContent ? sectionContent[`subtitle_${language.toLowerCase()}`] : 'Wybierz model sauny i poznaj jej szczegóły'}
            </p>
          </div>

          {/* Models Grid */}
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
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={model.mainImage}
                    alt={model.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {model.discount > 0 && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 text-sm font-semibold">
                      -{model.discount}%
                    </div>
                  )}
                  {model.galleryImages.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 text-xs">
                      +{model.galleryImages.length - 1} zdjęć
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">{model.name}</h3>
                  
                  {/* Specs */}
                  <div className="flex items-center gap-4 text-sm text-[#595959] mb-4">
                    {model.capacity && (
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {model.capacity}
                      </span>
                    )}
                    {model.steamRoomSize && (
                      <span>Parowa: {model.steamRoomSize}m²</span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div>
                      {model.discount > 0 ? (
                        <>
                          <span className="text-sm text-[#8C8C8C] line-through mr-2">
                            {model.basePrice?.toLocaleString()} PLN
                          </span>
                          <span className="text-xl font-bold text-[#C6A87C]">
                            {calculatePrice(model.basePrice, model.discount).toLocaleString()} PLN
                          </span>
                        </>
                      ) : (
                        <span className="text-xl font-bold text-[#C6A87C]">
                          od {model.basePrice?.toLocaleString()} PLN
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CTA */}
                  <button className="w-full mt-4 py-3 bg-[#1A1A1A] text-white font-medium hover:bg-[#C6A87C] transition-colors">
                    Zobacz szczegóły
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
              className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={closeModelCard}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 flex items-center justify-center hover:bg-[#C6A87C] hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              {/* Gallery */}
              <div className="relative aspect-[16/9] bg-[#F2F2F0]">
                <img
                  src={selectedModel.galleryImages[currentImageIndex]}
                  alt={selectedModel.name}
                  className="w-full h-full object-cover"
                />
                
                {selectedModel.galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImage(); }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 flex items-center justify-center hover:bg-[#C6A87C] hover:text-white transition-colors"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 flex items-center justify-center hover:bg-[#C6A87C] hover:text-white transition-colors"
                    >
                      <ChevronRight size={24} />
                    </button>
                    
                    {/* Thumbnails */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {selectedModel.galleryImages.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                          className={`w-12 h-12 border-2 overflow-hidden ${idx === currentImageIndex ? 'border-[#C6A87C]' : 'border-white/50'}`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {selectedModel.discount > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 text-lg font-semibold">
                    -{selectedModel.discount}%
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-8">
                <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">{selectedModel.name}</h2>
                
                {/* Specs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-[#F9F9F7]">
                  {selectedModel.capacity && (
                    <div className="text-center">
                      <div className="text-sm text-[#8C8C8C]">Pojemność</div>
                      <div className="font-semibold flex items-center justify-center gap-1">
                        <Users size={16} /> {selectedModel.capacity} os.
                      </div>
                    </div>
                  )}
                  {selectedModel.steamRoomSize && (
                    <div className="text-center">
                      <div className="text-sm text-[#8C8C8C]">Parowa</div>
                      <div className="font-semibold">{selectedModel.steamRoomSize} m²</div>
                    </div>
                  )}
                  {selectedModel.relaxRoomSize && (
                    <div className="text-center">
                      <div className="text-sm text-[#8C8C8C]">Relaks</div>
                      <div className="font-semibold">{selectedModel.relaxRoomSize} m²</div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-sm text-[#8C8C8C]">Warianty</div>
                    <div className="font-semibold">{selectedModel.variants?.length || 1}</div>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="text-sm text-[#8C8C8C] mb-1">Cena bazowa</div>
                  {selectedModel.discount > 0 ? (
                    <div className="flex items-center gap-3">
                      <span className="text-lg text-[#8C8C8C] line-through">
                        {selectedModel.basePrice?.toLocaleString()} PLN
                      </span>
                      <span className="text-3xl font-bold text-[#C6A87C]">
                        {calculatePrice(selectedModel.basePrice, selectedModel.discount).toLocaleString()} PLN
                      </span>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-[#C6A87C]">
                      od {selectedModel.basePrice?.toLocaleString()} PLN
                    </span>
                  )}
                </div>

                {/* Actions */}
                {!showInquiryForm ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={handleConfigureClick}
                      className="py-4 bg-[#C6A87C] text-white font-semibold hover:bg-[#B09060] transition-colors"
                    >
                      Skonfiguruj tę saunę
                    </button>
                    <button
                      onClick={() => setShowInquiryForm(true)}
                      className="py-4 bg-[#1A1A1A] text-white font-semibold hover:bg-black transition-colors"
                    >
                      Zamów standardową wersję
                    </button>
                  </div>
                ) : (
                  <div className="border border-black/10 p-6">
                    {submitted ? (
                      <div className="text-center py-8">
                        <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Dziękujemy!</h3>
                        <p className="text-[#595959]">Skontaktujemy się z Tobą wkrótce.</p>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold mb-4">Zamów {selectedModel.name}</h3>
                        <form onSubmit={handleSubmitInquiry} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                              type="text"
                              placeholder="Imię i nazwisko *"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              required
                              className="p-3 border border-black/10 focus:border-[#C6A87C] outline-none"
                            />
                            <input
                              type="tel"
                              placeholder="Telefon *"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              required
                              className="p-3 border border-black/10 focus:border-[#C6A87C] outline-none"
                            />
                          </div>
                          <input
                            type="email"
                            placeholder="Email *"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="w-full p-3 border border-black/10 focus:border-[#C6A87C] outline-none"
                          />
                          <textarea
                            placeholder="Dodatkowe uwagi"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            rows={3}
                            className="w-full p-3 border border-black/10 focus:border-[#C6A87C] outline-none resize-none"
                          />
                          <div className="flex gap-4">
                            <button
                              type="button"
                              onClick={() => setShowInquiryForm(false)}
                              className="flex-1 py-3 border border-black/10 font-medium hover:bg-[#F9F9F7] transition-colors"
                            >
                              Anuluj
                            </button>
                            <button
                              type="submit"
                              disabled={submitting}
                              className="flex-1 py-3 bg-[#C6A87C] text-white font-medium hover:bg-[#B09060] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              {submitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                              Wyślij zamówienie
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
