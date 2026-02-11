import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Users, Check, FileText, Send, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';

const CALCULATOR_API_URL = 'https://wm-kalkulator.pl';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const Calculator = () => {
  const { t } = useLanguage();
  const { calculatorConfig } = useSettings();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [step, setStep] = useState(0);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/sauna/prices`);
      const json = await response.json();
      setData(json);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching calculator data from proxy:', error);
      try {
        const response = await fetch(`${CALCULATOR_API_URL}/api/sauna/prices`);
        const json = await response.json();
        setData(json);
      } catch (err) {
        console.error('Direct API also failed:', err);
      }
      setLoading(false);
    }
  };

  // Filter models and categories based on admin config
  const getFilteredModels = () => {
    if (!data?.models) return [];
    const enabledModels = calculatorConfig?.enabled_models || [];
    return data.models.filter(m => 
      m.active && (enabledModels.length === 0 || enabledModels.includes(m.id))
    ).sort((a, b) => a.sortOrder - b.sortOrder);
  };

  const getFilteredCategories = () => {
    if (!data?.categories) return [];
    const enabledCategories = calculatorConfig?.enabled_categories || [];
    return data.categories.filter(c => 
      enabledCategories.length === 0 || enabledCategories.includes(c.id)
    );
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${CALCULATOR_API_URL}${url}`;
  };

  const calculateTotal = () => {
    if (!selectedModel) return 0;
    let total = selectedModel.basePrice;
    if (selectedVariant?.price) total += selectedVariant.price;
    Object.values(selectedOptions).forEach((opt) => {
      if (opt?.price) total += opt.price;
    });
    const discount = selectedModel.discount || 0;
    if (discount > 0) total = total * (1 - discount / 100);
    return Math.round(total);
  };

  const calculateOptionsTotal = () => {
    let total = 0;
    Object.values(selectedOptions).forEach((opt) => {
      if (opt?.price) total += opt.price;
    });
    return total;
  };

  const handleModelSelect = (model) => {
    setSelectedModel(model);
    setSelectedVariant(model.variants?.[0] || null);
    setSelectedOptions({});
  };

  const handleOptionSelect = (categoryId, option, inputType) => {
    if (inputType === 'radio') {
      setSelectedOptions((prev) => ({ ...prev, [categoryId]: option }));
    } else {
      setSelectedOptions((prev) => {
        const current = prev[categoryId];
        if (current?.id === option.id) {
          const newOptions = { ...prev };
          delete newOptions[categoryId];
          return newOptions;
        }
        return { ...prev, [categoryId]: option };
      });
    }
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
        }),
      });
      setShowInquiryForm(false);
      setFormData({ name: '', phone: '', email: '', message: '' });
      alert(t('contact.form_success'));
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      alert(t('contact.form_error'));
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { key: 'model', label: t('calculator.step_model') },
    { key: 'variant', label: t('calculator.step_variant') },
    { key: 'options', label: t('calculator.step_options') },
    { key: 'summary', label: t('calculator.step_summary') },
  ];

  const canProceed = () => {
    if (step === 0) return selectedModel !== null;
    return true;
  };

  const nextStep = () => {
    if (step < steps.length - 1 && canProceed()) {
      if (step === 0 && (!selectedModel?.variants || selectedModel.variants.length === 0)) {
        setStep(2);
      } else {
        setStep(step + 1);
      }
    }
  };

  const prevStep = () => {
    if (step > 0) {
      if (step === 2 && (!selectedModel?.variants || selectedModel.variants.length === 0)) {
        setStep(0);
      } else {
        setStep(step - 1);
      }
    }
  };

  if (loading) {
    return (
      <section id="calculator" className="section-spacing bg-[#F9F9F7]">
        <div className="container-main">
          <div className="flex items-center justify-center py-20">
            <div className="spinner" />
          </div>
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section id="calculator" className="section-spacing bg-[#F9F9F7]">
        <div className="container-main">
          <div className="text-center py-20 text-[#595959]">
            Error loading calculator data. Please refresh the page.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="calculator"
      data-testid="calculator-section"
      className="section-spacing bg-[#F9F9F7] relative"
    >
      <div className="container-main">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="gold-line mx-auto mb-4" />
          <h2 className="section-title" data-testid="calculator-title">
            {t('calculator.title')}
          </h2>
          <p className="section-subtitle mx-auto">{t('calculator.subtitle')}</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, index) => (
            <React.Fragment key={s.key}>
              <div className="flex items-center gap-1">
                <div
                  className={`w-7 h-7 flex items-center justify-center text-xs font-medium transition-colors duration-200 ${
                    index <= step ? 'bg-[#C6A87C] text-white' : 'bg-[#E5E5E5] text-[#8C8C8C]'
                  }`}
                >
                  {index < step ? <Check size={14} /> : index + 1}
                </div>
                <span className={`hidden sm:block text-xs font-medium ${index <= step ? 'text-[#1A1A1A]' : 'text-[#8C8C8C]'}`}>
                  {s.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-6 sm:w-12 h-0.5 ${index < step ? 'bg-[#C6A87C]' : 'bg-[#E5E5E5]'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Calculator Content with fixed buttons */}
        <div className="bg-white border border-black/5">
          {/* Scrollable content area */}
          <div className="p-4 md:p-6 min-h-[60vh] max-h-[70vh] overflow-y-auto">
            <AnimatePresence mode="wait">
              {/* Step 0: Model Selection */}
              {step === 0 && (
                <motion.div
                  key="models"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
                    {t('calculator.step_model')}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {getFilteredModels().map((model) => (
                        <div
                          key={model.id}
                          data-testid={`model-card-${model.id}`}
                          onClick={() => handleModelSelect(model)}
                          className={`calc-option relative p-2 cursor-pointer ${selectedModel?.id === model.id ? 'selected' : ''}`}
                        >
                          {model.imageUrl && (
                            <div className="aspect-[4/3] mb-2 overflow-hidden bg-[#F2F2F0]">
                              <img
                                src={getImageUrl(model.imageUrl)}
                                alt={model.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          )}
                          <h4 className="font-medium text-[#1A1A1A] text-xs leading-tight line-clamp-2 mb-1">
                            {model.name}
                          </h4>
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-sm font-bold text-[#C6A87C]">
                              {model.basePrice.toLocaleString()} PLN
                            </p>
                            {model.capacity && (
                              <span className="text-[10px] text-[#595959] flex items-center gap-0.5 whitespace-nowrap">
                                <Users size={10} />
                                {model.capacity}
                              </span>
                            )}
                          </div>
                          {model.discount > 0 && (
                            <span className="absolute top-1 right-1 bg-red-600 text-white text-[9px] px-1 py-0.5 font-bold">
                              -{model.discount}%
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                </motion.div>
              )}

              {/* Step 1: Variant Selection */}
              {step === 1 && selectedModel?.variants?.length > 0 && (
                <motion.div
                  key="variants"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
                    {t('calculator.step_variant')}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {selectedModel.variants.map((variant) => (
                      <div
                        key={variant.id}
                        data-testid={`variant-card-${variant.id}`}
                        onClick={() => setSelectedVariant(variant)}
                        className={`calc-option p-2 cursor-pointer ${selectedVariant?.id === variant.id ? 'selected' : ''}`}
                      >
                        {variant.imageUrl && (
                          <div className="aspect-[4/3] mb-2 overflow-hidden bg-[#F2F2F0]">
                            <img
                              src={getImageUrl(variant.imageUrl)}
                              alt={variant.namePl || variant.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <h4 className="font-medium text-[#1A1A1A] text-xs leading-tight line-clamp-2 mb-1">
                          {variant.namePl || variant.name || 'Wariant'}
                        </h4>
                        {variant.price !== 0 && (
                          <p className="text-sm font-medium text-[#C6A87C]">
                            {variant.price > 0 ? '+' : ''}{variant.price.toLocaleString()} PLN
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Options */}
              {step === 2 && (
                <motion.div
                  key="options"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
                    {t('calculator.step_options')}
                  </h3>
                  <div className="space-y-5">
                    {getFilteredCategories().map((category) => (
                      <div key={category.id}>
                        <h4 className="font-semibold text-[#1A1A1A] text-sm mb-2 pb-1 border-b border-black/5">
                          {category.name}
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2">
                          {category.options.map((option) => (
                            <div
                              key={option.id}
                              data-testid={`option-${option.id}`}
                              onClick={() => handleOptionSelect(category.id, option, category.inputType)}
                              className={`calc-option p-2 cursor-pointer ${selectedOptions[category.id]?.id === option.id ? 'selected' : ''}`}
                            >
                              {option.imageUrl && (
                                <div className="aspect-[4/3] mb-1.5 overflow-hidden bg-[#F2F2F0]">
                                  <img
                                    src={getImageUrl(option.imageUrl)}
                                    alt={option.name || option.namePl}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                </div>
                              )}
                              <h5 className="text-[11px] font-medium text-[#1A1A1A] leading-tight line-clamp-2">
                                {option.namePl || option.name}
                              </h5>
                              <p className="text-xs text-[#C6A87C] font-medium mt-0.5">
                                {option.price > 0 ? `+${option.price.toLocaleString()} PLN` : t('calculator.included')}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Summary */}
              {step === 3 && (
                <motion.div
                  key="summary"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
                    {t('calculator.step_summary')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Selected Configuration */}
                    <div>
                      {selectedModel && (
                        <div className="mb-4">
                          {selectedModel.imageUrl && (
                            <div className="aspect-video mb-3 overflow-hidden bg-[#F2F2F0]">
                              <img
                                src={getImageUrl(selectedModel.imageUrl)}
                                alt={selectedModel.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <h4 className="text-base font-semibold text-[#1A1A1A]">{selectedModel.name}</h4>
                          {selectedVariant && (
                            <p className="text-sm text-[#595959] mt-1">{selectedVariant.namePl || selectedVariant.name}</p>
                          )}
                        </div>
                      )}
                      {Object.keys(selectedOptions).length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold text-[#1A1A1A] mb-2">{t('calculator.options_price')}:</h5>
                          <ul className="space-y-1">
                            {Object.entries(selectedOptions).map(([categoryId, option]) => (
                              <li key={categoryId} className="flex justify-between text-xs">
                                <span className="text-[#595959]">{option.namePl || option.name}</span>
                                <span className="text-[#1A1A1A] font-medium">
                                  {option.price > 0 ? `+${option.price.toLocaleString()} PLN` : t('calculator.included')}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-[#F9F9F7] p-4">
                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#595959]">{t('calculator.base_price')}</span>
                          <span className="font-medium text-[#1A1A1A]">{selectedModel?.basePrice.toLocaleString()} PLN</span>
                        </div>
                        {selectedVariant?.price > 0 && (
                          <div className="flex justify-between">
                            <span className="text-[#595959]">Wariant</span>
                            <span className="font-medium text-[#1A1A1A]">+{selectedVariant.price.toLocaleString()} PLN</span>
                          </div>
                        )}
                        {calculateOptionsTotal() > 0 && (
                          <div className="flex justify-between">
                            <span className="text-[#595959]">{t('calculator.options_price')}</span>
                            <span className="font-medium text-[#1A1A1A]">+{calculateOptionsTotal().toLocaleString()} PLN</span>
                          </div>
                        )}
                        {selectedModel?.discount > 0 && (
                          <div className="flex justify-between text-[#4A6741]">
                            <span>{t('calculator.discount')} ({selectedModel.discount}%)</span>
                            <span className="font-medium">
                              -{Math.round((selectedModel.basePrice + (selectedVariant?.price || 0) + calculateOptionsTotal()) * (selectedModel.discount / 100)).toLocaleString()} PLN
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-black/10 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-base font-semibold text-[#1A1A1A]">{t('calculator.total')}</span>
                          <span className="text-xl font-bold text-[#C6A87C]" data-testid="calculator-total-price">
                            {calculateTotal().toLocaleString()} PLN
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 space-y-2">
                        <button
                          data-testid="send-inquiry-btn"
                          onClick={() => setShowInquiryForm(true)}
                          className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm"
                        >
                          <Send size={16} />
                          {t('calculator.send_inquiry')}
                        </button>
                        <button
                          data-testid="download-pdf-btn"
                          className="btn-secondary w-full flex items-center justify-center gap-2 py-3 text-sm"
                          onClick={() => window.open(`${CALCULATOR_API_URL}/api/sauna/generate-pdf`, '_blank')}
                        >
                          <FileText size={16} />
                          {t('calculator.download_pdf')}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Fixed Navigation Buttons */}
          <div className="sticky bottom-0 bg-white border-t border-black/5 p-4 flex justify-between items-center">
            <button
              data-testid="calc-prev-btn"
              onClick={prevStep}
              disabled={step === 0}
              className={`flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                step === 0 ? 'text-[#8C8C8C] cursor-not-allowed' : 'text-[#1A1A1A] hover:text-[#C6A87C]'
              }`}
            >
              <ChevronLeft size={16} />
              {t('calculator.back')}
            </button>

            {/* Current price display */}
            {selectedModel && step < 3 && (
              <div className="text-center">
                <p className="text-xs text-[#8C8C8C]">{t('calculator.total')}</p>
                <p className="text-lg font-bold text-[#C6A87C]">{calculateTotal().toLocaleString()} PLN</p>
              </div>
            )}

            {step < steps.length - 1 && (
              <button
                data-testid="calc-next-btn"
                onClick={nextStep}
                disabled={!canProceed()}
                className={`flex items-center gap-1 px-6 py-2 text-sm font-medium transition-all duration-200 ${
                  canProceed() ? 'btn-primary' : 'bg-[#E5E5E5] text-[#8C8C8C] cursor-not-allowed'
                }`}
              >
                {t('calculator.next')}
                <ChevronRight size={16} />
              </button>
            )}

            {step === steps.length - 1 && (
              <button
                data-testid="calc-finish-btn"
                onClick={() => setShowInquiryForm(true)}
                className="btn-primary flex items-center gap-1 px-6 py-2 text-sm"
              >
                <Send size={16} />
                {t('calculator.send_inquiry')}
              </button>
            )}
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
              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
                {t('calculator.send_inquiry')}
              </h3>
              <form onSubmit={handleSubmitInquiry} className="space-y-3">
                <input
                  type="text"
                  placeholder={t('contact.form_name')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-custom"
                  required
                />
                <input
                  type="tel"
                  placeholder={t('contact.form_phone')}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-custom"
                  required
                />
                <input
                  type="email"
                  placeholder={t('contact.form_email')}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-custom"
                />
                <textarea
                  placeholder={t('contact.form_message')}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={3}
                  className="input-custom resize-none"
                />
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowInquiryForm(false)} className="btn-secondary flex-1 py-2 text-sm">
                    {t('calculator.back')}
                  </button>
                  <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2 py-2 text-sm">
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {t('contact.form_submit')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
