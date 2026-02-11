import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Users, Check, FileText, Send, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const API_URL = 'https://wm-kalkulator.pl';

export const Calculator = () => {
  const { t } = useLanguage();
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
      const response = await fetch(`${API_URL}/api/sauna/prices`);
      const json = await response.json();
      setData(json);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching calculator data:', error);
      setLoading(false);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  const calculateTotal = () => {
    if (!selectedModel) return 0;
    let total = selectedModel.basePrice;

    if (selectedVariant?.price) {
      total += selectedVariant.price;
    }

    Object.values(selectedOptions).forEach((opt) => {
      if (opt?.price) total += opt.price;
    });

    const discount = selectedModel.discount || 0;
    if (discount > 0) {
      total = total * (1 - discount / 100);
    }

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
      setSelectedOptions((prev) => ({
        ...prev,
        [categoryId]: option,
      }));
    } else {
      setSelectedOptions((prev) => {
        const current = prev[categoryId];
        if (current?.id === option.id) {
          const newOptions = { ...prev };
          delete newOptions[categoryId];
          return newOptions;
        }
        return {
          ...prev,
          [categoryId]: option,
        };
      });
    }
  };

  const handleSubmitInquiry = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      await fetch(`${backendUrl}/api/contact`, {
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
      // Skip variant step if no variants
      if (step === 0 && (!selectedModel?.variants || selectedModel.variants.length === 0)) {
        setStep(2);
      } else {
        setStep(step + 1);
      }
    }
  };

  const prevStep = () => {
    if (step > 0) {
      // Skip variant step if no variants
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
        <div className="text-center mb-12">
          <div className="gold-line mx-auto mb-6" />
          <h2 className="section-title" data-testid="calculator-title">
            {t('calculator.title')}
          </h2>
          <p className="section-subtitle mx-auto">{t('calculator.subtitle')}</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-12">
          {steps.map((s, index) => (
            <React.Fragment key={s.key}>
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 flex items-center justify-center text-sm font-medium transition-colors duration-200 ${
                    index <= step
                      ? 'bg-[#C6A87C] text-white'
                      : 'bg-[#E5E5E5] text-[#8C8C8C]'
                  }`}
                >
                  {index < step ? <Check size={16} /> : index + 1}
                </div>
                <span
                  className={`hidden sm:block text-sm font-medium ${
                    index <= step ? 'text-[#1A1A1A]' : 'text-[#8C8C8C]'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-8 sm:w-16 h-0.5 ${
                    index < step ? 'bg-[#C6A87C]' : 'bg-[#E5E5E5]'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Calculator Content */}
        <div className="bg-white border border-black/5 p-6 md:p-10">
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
                <h3 className="text-xl font-semibold text-[#1A1A1A] mb-6">
                  {t('calculator.step_model')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.models
                    .filter((m) => m.active)
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((model) => (
                      <div
                        key={model.id}
                        data-testid={`model-card-${model.id}`}
                        onClick={() => handleModelSelect(model)}
                        className={`calc-option relative ${
                          selectedModel?.id === model.id ? 'selected' : ''
                        }`}
                      >
                        {model.imageUrl && (
                          <div className="aspect-[4/3] mb-3 overflow-hidden bg-[#F2F2F0]">
                            <img
                              src={getImageUrl(model.imageUrl)}
                              alt={model.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <h4 className="font-semibold text-[#1A1A1A] text-sm mb-1">
                          {model.name}
                        </h4>
                        <p className="text-lg font-bold text-[#C6A87C]">
                          {model.basePrice.toLocaleString()} PLN
                        </p>
                        {model.capacity && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-[#595959]">
                            <Users size={12} />
                            <span>{model.capacity} {t('calculator.persons')}</span>
                          </div>
                        )}
                        {model.discount > 0 && (
                          <span className="absolute top-2 right-2 discount-badge">
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
                <h3 className="text-xl font-semibold text-[#1A1A1A] mb-6">
                  {t('calculator.step_variant')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedModel.variants.map((variant) => (
                    <div
                      key={variant.id}
                      data-testid={`variant-card-${variant.id}`}
                      onClick={() => setSelectedVariant(variant)}
                      className={`calc-option ${
                        selectedVariant?.id === variant.id ? 'selected' : ''
                      }`}
                    >
                      {variant.imageUrl && (
                        <div className="aspect-[4/3] mb-3 overflow-hidden bg-[#F2F2F0]">
                          <img
                            src={getImageUrl(variant.imageUrl)}
                            alt={variant.namePl || variant.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <h4 className="font-semibold text-[#1A1A1A] text-sm mb-1">
                        {variant.namePl || variant.name || 'Wariant'}
                      </h4>
                      {variant.hintPl && (
                        <p className="text-xs text-[#595959] mb-2">
                          {variant.hintPl}
                        </p>
                      )}
                      {variant.price !== 0 && (
                        <p className="text-sm font-medium text-[#C6A87C]">
                          {variant.price > 0 ? '+' : ''}
                          {variant.price.toLocaleString()} PLN
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
                <h3 className="text-xl font-semibold text-[#1A1A1A] mb-6">
                  {t('calculator.step_options')}
                </h3>
                <div className="space-y-8 max-h-[600px] overflow-y-auto pr-2">
                  {data.categories.slice(0, 8).map((category) => (
                    <div key={category.id}>
                      <h4 className="font-semibold text-[#1A1A1A] mb-3 pb-2 border-b border-black/5">
                        {category.name}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {category.options.slice(0, 6).map((option) => (
                          <div
                            key={option.id}
                            data-testid={`option-${option.id}`}
                            onClick={() =>
                              handleOptionSelect(
                                category.id,
                                option,
                                category.inputType
                              )
                            }
                            className={`calc-option p-3 ${
                              selectedOptions[category.id]?.id === option.id
                                ? 'selected'
                                : ''
                            }`}
                          >
                            {option.imageUrl && (
                              <div className="aspect-[3/2] mb-2 overflow-hidden bg-[#F2F2F0]">
                                <img
                                  src={getImageUrl(option.imageUrl)}
                                  alt={option.name || option.namePl}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              </div>
                            )}
                            <h5 className="text-sm font-medium text-[#1A1A1A] mb-1">
                              {option.namePl || option.name}
                            </h5>
                            <p className="text-sm text-[#C6A87C] font-medium">
                              {option.price > 0
                                ? `+${option.price.toLocaleString()} PLN`
                                : t('calculator.included')}
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
                <h3 className="text-xl font-semibold text-[#1A1A1A] mb-6">
                  {t('calculator.step_summary')}
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Selected Configuration */}
                  <div>
                    {selectedModel && (
                      <div className="mb-6">
                        {selectedModel.imageUrl && (
                          <div className="aspect-[16/9] mb-4 overflow-hidden bg-[#F2F2F0]">
                            <img
                              src={getImageUrl(selectedModel.imageUrl)}
                              alt={selectedModel.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <h4 className="text-lg font-semibold text-[#1A1A1A]">
                          {selectedModel.name}
                        </h4>
                        {selectedVariant && (
                          <p className="text-sm text-[#595959] mt-1">
                            {selectedVariant.namePl || selectedVariant.name}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Selected Options List */}
                    {Object.keys(selectedOptions).length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold text-[#1A1A1A] mb-3">
                          {t('calculator.options_price')}:
                        </h5>
                        <ul className="space-y-2">
                          {Object.entries(selectedOptions).map(
                            ([categoryId, option]) => (
                              <li
                                key={categoryId}
                                className="flex justify-between text-sm"
                              >
                                <span className="text-[#595959]">
                                  {option.namePl || option.name}
                                </span>
                                <span className="text-[#1A1A1A] font-medium">
                                  {option.price > 0
                                    ? `+${option.price.toLocaleString()} PLN`
                                    : t('calculator.included')}
                                </span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Price Breakdown */}
                  <div className="bg-[#F9F9F7] p-6">
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between">
                        <span className="text-[#595959]">
                          {t('calculator.base_price')}
                        </span>
                        <span className="font-medium text-[#1A1A1A]">
                          {selectedModel?.basePrice.toLocaleString()} PLN
                        </span>
                      </div>
                      {selectedVariant?.price > 0 && (
                        <div className="flex justify-between">
                          <span className="text-[#595959]">Wariant</span>
                          <span className="font-medium text-[#1A1A1A]">
                            +{selectedVariant.price.toLocaleString()} PLN
                          </span>
                        </div>
                      )}
                      {calculateOptionsTotal() > 0 && (
                        <div className="flex justify-between">
                          <span className="text-[#595959]">
                            {t('calculator.options_price')}
                          </span>
                          <span className="font-medium text-[#1A1A1A]">
                            +{calculateOptionsTotal().toLocaleString()} PLN
                          </span>
                        </div>
                      )}
                      {selectedModel?.discount > 0 && (
                        <div className="flex justify-between text-[#4A6741]">
                          <span>{t('calculator.discount')} ({selectedModel.discount}%)</span>
                          <span className="font-medium">
                            -
                            {Math.round(
                              (selectedModel.basePrice +
                                (selectedVariant?.price || 0) +
                                calculateOptionsTotal()) *
                                (selectedModel.discount / 100)
                            ).toLocaleString()}{' '}
                            PLN
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-black/10 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-[#1A1A1A]">
                          {t('calculator.total')}
                        </span>
                        <span
                          className="price-display"
                          data-testid="calculator-total-price"
                        >
                          {calculateTotal().toLocaleString()} PLN
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 space-y-3">
                      <button
                        data-testid="send-inquiry-btn"
                        onClick={() => setShowInquiryForm(true)}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                      >
                        <Send size={18} />
                        {t('calculator.send_inquiry')}
                      </button>
                      <button
                        data-testid="download-pdf-btn"
                        className="btn-secondary w-full flex items-center justify-center gap-2"
                        onClick={() => {
                          window.open(`${API_URL}/api/sauna/generate-pdf`, '_blank');
                        }}
                      >
                        <FileText size={18} />
                        {t('calculator.download_pdf')}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-black/5">
            <button
              data-testid="calc-prev-btn"
              onClick={prevStep}
              disabled={step === 0}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors duration-200 ${
                step === 0
                  ? 'text-[#8C8C8C] cursor-not-allowed'
                  : 'text-[#1A1A1A] hover:text-[#C6A87C]'
              }`}
            >
              <ChevronLeft size={18} />
              {t('calculator.back')}
            </button>

            {step < steps.length - 1 && (
              <button
                data-testid="calc-next-btn"
                onClick={nextStep}
                disabled={!canProceed()}
                className={`flex items-center gap-2 px-8 py-3 font-medium transition-all duration-200 ${
                  canProceed()
                    ? 'btn-primary'
                    : 'bg-[#E5E5E5] text-[#8C8C8C] cursor-not-allowed'
                }`}
              >
                {t('calculator.next')}
                <ChevronRight size={18} />
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
              className="bg-white p-8 max-w-md w-full"
            >
              <h3 className="text-xl font-semibold text-[#1A1A1A] mb-6">
                {t('calculator.send_inquiry')}
              </h3>
              <form onSubmit={handleSubmitInquiry} className="space-y-4">
                <input
                  type="text"
                  placeholder={t('contact.form_name')}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input-custom"
                  required
                />
                <input
                  type="tel"
                  placeholder={t('contact.form_phone')}
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="input-custom"
                  required
                />
                <input
                  type="email"
                  placeholder={t('contact.form_email')}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="input-custom"
                />
                <textarea
                  placeholder={t('contact.form_message')}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  rows={3}
                  className="input-custom resize-none"
                />
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowInquiryForm(false)}
                    className="btn-secondary flex-1"
                  >
                    {t('calculator.back')}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
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
