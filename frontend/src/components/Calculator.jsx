import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Check, FileText, Send, Loader2, ChevronDown, Download, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';

const CALCULATOR_API_URL = 'https://wm-kalkulator.pl';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const Calculator = () => {
  const { t, language } = useLanguage();
  const { calculatorConfig } = useSettings();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [sectionContent, setSectionContent] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [hasCatalog, setHasCatalog] = useState(false);

  useEffect(() => {
    fetchData();
    fetchSectionContent();
    fetch(`${BACKEND_URL}/api/catalog/info`).then(r => r.json()).then(d => setHasCatalog(d.available)).catch(() => {});
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/sauna/prices`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
        if (result.models?.length > 0) {
          const first = result.models[0];
          setSelectedModel(first);
          if (first.variants?.length > 0) setSelectedVariant(first.variants[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching calculator data:', error);
    }
    setLoading(false);
  };

  const fetchSectionContent = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/content/calculator`);
      if (res.ok) setSectionContent(await res.json());
    } catch {}
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${CALCULATOR_API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const handleModelSelect = (model) => {
    setSelectedModel(model);
    setSelectedVariant(model.variants?.length > 0 ? model.variants[0] : null);
    setSelectedOptions({});
    setExpandedCategories({});
  };

  const handleOptionSelect = (categoryId, option, inputType) => {
    setSelectedOptions((prev) => {
      if (inputType === 'radio') {
        if (prev[categoryId]?.id === option.id) {
          const next = { ...prev };
          delete next[categoryId];
          return next;
        }
        return { ...prev, [categoryId]: option };
      }
      if (prev[categoryId]?.id === option.id) {
        const next = { ...prev };
        delete next[categoryId];
        return next;
      }
      return { ...prev, [categoryId]: option };
    });
  };

  const calculateOptionsTotal = () => Object.values(selectedOptions).reduce((sum, opt) => sum + (opt.price || 0), 0);

  const calculateTotal = () => {
    if (!selectedModel) return 0;
    let total = selectedModel.basePrice + (selectedVariant?.price || 0) + calculateOptionsTotal();
    if (selectedModel.discount > 0) total = Math.round(total * (1 - selectedModel.discount / 100));
    return total;
  };

  const getFilteredModels = () => {
    if (!data?.models) return [];
    const enabled = calculatorConfig?.enabled_models;
    if (!enabled || enabled.length === 0) return data.models;
    return data.models.filter((m) => enabled.includes(String(m.id)) || enabled.includes(m.id));
  };

  const getFilteredCategories = () => {
    if (!data?.categories) return [];
    const enabled = calculatorConfig?.enabled_categories;
    if (!enabled || enabled.length === 0) return data.categories;
    return data.categories.filter((c) => enabled.includes(String(c.id)) || enabled.includes(c.id));
  };

  const handleSubmitInquiry = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(`${BACKEND_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          model: selectedModel?.name,
          variant: selectedVariant?.namePl,
          options: Object.values(selectedOptions).map((o) => o.name || o.namePl),
          total: calculateTotal(),
          type: 'calculator_order',
        }),
      });
      setSubmitted(true);
      setFormData({ name: '', phone: '', email: '', message: '' });
    } catch (error) {
      console.error('Error submitting inquiry:', error);
    }
    setSubmitting(false);
  };

  const toggleCategory = (catId) => {
    setExpandedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  if (loading) {
    return (
      <section id="calculator" className="section-spacing bg-[#F9F9F7]">
        <div className="container-main">
          <div className="flex items-center justify-center py-20"><div className="spinner" /></div>
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section id="calculator" className="section-spacing bg-[#F9F9F7]">
        <div className="container-main">
          <div className="text-center py-20 text-[#595959]">Error loading calculator data. Please refresh the page.</div>
        </div>
      </section>
    );
  }

  const models = getFilteredModels();
  const categories = getFilteredCategories();

  return (
    <section id="calculator" data-testid="calculator-section" className="section-spacing bg-[#F9F9F7] relative">
      <div className="container-main">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="gold-line mx-auto mb-4" />
          <h2 className="section-title" data-testid="calculator-title">
            {sectionContent ? sectionContent[`title_${language.toLowerCase()}`] : t('calculator.title')}
          </h2>
          <p className="section-subtitle mx-auto">
            {sectionContent ? sectionContent[`subtitle_${language.toLowerCase()}`] : t('calculator.subtitle')}
          </p>
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-0 bg-white border border-black/5">
          
          {/* LEFT COLUMN — Model selector + photo */}
          <div className="lg:w-[380px] xl:w-[420px] flex-shrink-0 border-r border-black/5">
            {/* Model dropdown */}
            <div className="border-b border-black/5">
              <div className="p-3 bg-[#F9F9F7]">
                <h3 className="text-xs font-semibold text-[#8C8C8C] uppercase tracking-wider">
                  {t('calculator.step_model')}
                </h3>
              </div>
              <div className="p-3">
                <select
                  data-testid="model-select"
                  value={selectedModel?.id || ''}
                  onChange={(e) => {
                    const m = models.find(x => String(x.id) === e.target.value);
                    if (m) handleModelSelect(m);
                  }}
                  className="w-full p-2.5 border border-black/10 text-sm bg-white appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238C8C8C' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
                >
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} — {model.basePrice.toLocaleString()} PLN{model.discount > 0 ? ` (-${model.discount}%)` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected model photo */}
            {selectedModel && (
              <div className="p-3">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedModel.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {selectedModel.imageUrl && (
                      <div className="aspect-[4/3] overflow-hidden bg-[#F2F2F0] mb-3">
                        <img
                          src={getImageUrl(selectedVariant?.imageUrl || selectedModel.imageUrl)}
                          alt={selectedModel.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <h3 className="text-base font-semibold text-[#1A1A1A]">{selectedModel.name}</h3>
                    {selectedVariant && (
                      <p className="text-sm text-[#595959] mt-0.5">{selectedVariant.namePl || selectedVariant.name}</p>
                    )}
                    
                    {/* Price summary — always visible below photo */}
                    <div className="mt-3 pt-3 border-t border-black/5">
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#8C8C8C]">{t('calculator.base_price')}</span>
                          <span className="text-[#1A1A1A]">{selectedModel.basePrice.toLocaleString()} PLN</span>
                        </div>
                        {selectedVariant?.price > 0 && (
                          <div className="flex justify-between">
                            <span className="text-[#8C8C8C]">Wariant</span>
                            <span className="text-[#1A1A1A]">+{selectedVariant.price.toLocaleString()} PLN</span>
                          </div>
                        )}
                        {calculateOptionsTotal() > 0 && (
                          <div className="flex justify-between">
                            <span className="text-[#8C8C8C]">{t('calculator.options_price')}</span>
                            <span className="text-[#1A1A1A]">+{calculateOptionsTotal().toLocaleString()} PLN</span>
                          </div>
                        )}
                        {selectedModel.discount > 0 && (
                          <div className="flex justify-between text-[#4A6741]">
                            <span>{t('calculator.discount')} ({selectedModel.discount}%)</span>
                            <span>-{Math.round((selectedModel.basePrice + (selectedVariant?.price || 0) + calculateOptionsTotal()) * (selectedModel.discount / 100)).toLocaleString()} PLN</span>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-black/5">
                        <span className="text-sm font-semibold text-[#1A1A1A]">{t('calculator.total')}</span>
                        <span className="text-xl font-bold text-[#C6A87C]" data-testid="calculator-total-price">
                          {calculateTotal().toLocaleString()} PLN
                        </span>
                      </div>
                      <button
                        data-testid="send-inquiry-btn"
                        onClick={() => { setShowInquiryForm(true); setSubmitted(false); }}
                        className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 text-sm mt-3"
                      >
                        <Send size={14} />
                        {t('calculator.send_inquiry')}
                      </button>
                      <button
                        data-testid="download-pdf-btn"
                        onClick={async () => {
                          try {
                            const optionsPayload = Object.entries(selectedOptions).map(([catId, opt]) => {
                              const cat = categories.find(c => String(c.id) === String(catId));
                              return {
                                name: opt.namePl || opt.name || '',
                                price: opt.price || 0,
                                category: cat?.name || '',
                              };
                            });
                            const res = await fetch(`${BACKEND_URL}/api/sauna/generate-pdf`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                modelName: selectedModel?.name || '',
                                variantName: selectedVariant?.namePl || selectedVariant?.name || '',
                                basePrice: selectedModel?.basePrice || 0,
                                variantPrice: selectedVariant?.price || 0,
                                discountPercent: selectedModel?.discount || 0,
                                options: optionsPayload,
                                totalPrice: calculateTotal(),
                              }),
                            });
                            if (res.ok) {
                              const blob = await res.blob();
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `WM-Sauna-${selectedModel?.name || 'config'}.pdf`;
                              a.click();
                              window.URL.revokeObjectURL(url);
                            }
                          } catch (err) {
                            console.error('PDF generation error:', err);
                          }
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm mt-2 border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors"
                      >
                        <Download size={14} />
                        {language === 'EN' ? 'Download PDF' : 'Pobierz PDF'}
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN — Variants + Options */}
          <div className="flex-1 min-w-0">
            <div className="overflow-y-auto max-h-[80vh] lg:max-h-[700px]">
              
              {/* Variants (if available) */}
              {selectedModel?.variants?.length > 0 && (
                <div className="border-b border-black/5">
                  <div className="p-3 bg-[#F9F9F7]">
                    <h3 className="text-xs font-semibold text-[#8C8C8C] uppercase tracking-wider">
                      {t('calculator.step_variant')}
                    </h3>
                  </div>
                  <div className="p-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {selectedModel.variants.map((variant) => (
                        <div
                          key={variant.id}
                          data-testid={`variant-card-${variant.id}`}
                          onClick={() => setSelectedVariant(variant)}
                          className={`calc-option p-2 cursor-pointer ${selectedVariant?.id === variant.id ? 'selected' : ''}`}
                        >
                          {variant.imageUrl && (
                            <div className="aspect-[4/3] mb-1.5 overflow-hidden bg-[#F2F2F0]">
                              <img src={getImageUrl(variant.imageUrl)} alt={variant.namePl || variant.name} className="w-full h-full object-cover" loading="lazy" />
                            </div>
                          )}
                          <h4 className="font-medium text-[#1A1A1A] text-xs leading-tight line-clamp-2 mb-0.5">
                            {variant.namePl || variant.name || 'Wariant'}
                          </h4>
                          {variant.price !== 0 && (
                            <p className="text-xs font-medium text-[#C6A87C]">
                              {variant.price > 0 ? '+' : ''}{variant.price.toLocaleString()} PLN
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Options — each category is collapsible */}
              {categories.map((category) => {
                const isExpanded = expandedCategories[category.id] !== false; // default open
                const selectedInCat = selectedOptions[category.id];
                return (
                  <div key={category.id} className="border-b border-black/5 last:border-b-0">
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="w-full flex items-center justify-between p-3 bg-[#F9F9F7] hover:bg-[#F2F2F0] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-[#8C8C8C] uppercase tracking-wider">{category.name}</h4>
                        {selectedInCat && (
                          <span className="text-[10px] bg-[#C6A87C]/10 text-[#C6A87C] px-1.5 py-0.5">
                            {selectedInCat.namePl || selectedInCat.name}
                          </span>
                        )}
                      </div>
                      <ChevronDown size={14} className={`text-[#8C8C8C] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    {isExpanded && (
                      <div className="p-3">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                          {category.options.map((option) => (
                            <div
                              key={option.id}
                              data-testid={`option-${option.id}`}
                              onClick={() => handleOptionSelect(category.id, option, category.inputType)}
                              className={`calc-option p-2 cursor-pointer ${selectedOptions[category.id]?.id === option.id ? 'selected' : ''}`}
                            >
                              {option.imageUrl && (
                                <div className="aspect-[4/3] mb-1.5 overflow-hidden bg-[#F2F2F0]">
                                  <img src={getImageUrl(option.imageUrl)} alt={option.name || option.namePl} className="w-full h-full object-cover" loading="lazy" />
                                </div>
                              )}
                              <h5 className="text-[11px] font-medium text-[#1A1A1A] leading-tight line-clamp-2">{option.namePl || option.name}</h5>
                              <p className="text-xs text-[#C6A87C] font-medium mt-0.5">
                                {option.price > 0 ? `+${option.price.toLocaleString()} PLN` : t('calculator.included')}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Inquiry Form Modal */}
      <AnimatePresence>
        {showInquiryForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowInquiryForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-6 max-w-md w-full"
            >
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">{t('calculator.send_inquiry')}</h3>
              {submitted ? (
                <div className="text-center py-6">
                  <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{language === 'EN' ? 'Thank you!' : 'Dziękujemy!'}</h3>
                  <p className="text-[#595959] mb-4">{language === 'EN' ? 'We will contact you shortly.' : 'Skontaktujemy się wkrótce.'}</p>
                  {hasCatalog && (
                    <a
                      href={`${BACKEND_URL}/api/catalog/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="calc-catalog-btn"
                      className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white px-5 py-2.5 text-sm font-medium hover:bg-black transition-colors"
                    >
                      <Download size={14} />
                      {language === 'EN' ? 'Download our catalog' : 'Pobierz nasz katalog'}
                    </a>
                  )}
                  <div className="mt-4">
                    <button onClick={() => { setShowInquiryForm(false); setSubmitted(false); }} className="text-sm text-[#8C8C8C] hover:text-[#1A1A1A]">
                      {language === 'EN' ? 'Close' : 'Zamknij'}
                    </button>
                  </div>
                </div>
              ) : (
              <form onSubmit={handleSubmitInquiry} className="space-y-3">
                <input type="text" placeholder={t('contact.form_name')} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-custom" required />
                <input type="tel" placeholder={t('contact.form_phone')} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input-custom" required />
                <input type="email" placeholder={t('contact.form_email')} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-custom" />
                <textarea placeholder={t('contact.form_message')} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={3} className="input-custom resize-none" />
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowInquiryForm(false)} className="btn-secondary flex-1 py-2 text-sm">{t('calculator.back')}</button>
                  <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2 py-2 text-sm">
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {t('contact.form_submit')}
                  </button>
                </div>
              </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
