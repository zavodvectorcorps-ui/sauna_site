import { useState, useEffect } from 'react';
import { X, ArrowRight, Loader2, Users, Droplets, Ruler, ChevronLeft, ChevronRight, Check, Send, Sliders, Flame, GitCompareArrows, Thermometer, Box } from 'lucide-react';
import { BalieInstallment } from './BalieInstallment';

const API = process.env.REACT_APP_BACKEND_URL;

const getHeaterVariantPrices = (apiModel) => {
  if (!apiModel) return { variants: [], single: null };
  const hvs = apiModel.heaterVariants || [];
  const available = apiModel.availableHeaterTypes || [];
  const activeVariants = hvs.filter(v => available.includes(v.type) && v.price > 0);
  if (activeVariants.length === 1) return { variants: [], single: activeVariants[0] };
  return { variants: activeVariants, single: null };
};

const formatPrice = (price) => price > 0 ? `${price.toLocaleString()} PLN` : null;

const ProductCard = ({ product, apiModel, onClick, isCompare, onToggleCompare }) => {
  const { variants, single } = getHeaterVariantPrices(apiModel);

  return (
    <div className="relative bg-[#1A1E27] border border-white/5 overflow-hidden group hover:border-[#D4AF37]/30 transition-all" data-testid={`balie-product-${product.id}`}>
      <div onClick={() => onClick(product)} className="cursor-pointer">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          {product.tags?.length > 0 && (
            <div className="absolute top-3 left-3 flex gap-1.5">
              {product.tags.slice(0, 2).map((tag, i) => (
                <span key={i} className="bg-[#D4AF37] text-[#0F1218] text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wider">{tag}</span>
              ))}
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="text-white font-semibold text-lg mb-1">{product.name}</h3>
          {variants.length >= 2 ? (
            <div className="mb-2 space-y-0.5">
              {variants.map(v => (
                <p key={v.type} className="text-[#D4AF37] text-sm font-medium">
                  <span className="text-white/40 text-xs">{v.type === 'integrated' ? 'z piecem wewn.' : 'z piecem zewn.'}</span>{' '}
                  {formatPrice(v.price)}
                </p>
              ))}
            </div>
          ) : single ? (
            <p className="text-[#D4AF37] font-bold mb-2">{formatPrice(single.price)}</p>
          ) : (
            <p className="text-[#D4AF37] font-bold mb-2">{product.price}</p>
          )}
          {product.description && <p className="text-white/40 text-sm line-clamp-2 mb-4">{product.description}</p>}
          <div className="flex items-center gap-2 text-white/60 text-sm group-hover:text-[#D4AF37] transition-colors">
            Szczegoly <ArrowRight size={14} />
          </div>
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onToggleCompare(product.id); }}
        className={`absolute top-3 right-3 z-10 px-2.5 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-all ${
          isCompare
            ? 'bg-[#D4AF37] text-[#0F1218]'
            : 'bg-black/60 text-white/70 hover:bg-black/80 hover:text-white backdrop-blur-sm'
        }`}
        data-testid={`balie-compare-toggle-${product.id}`}
      >
        <GitCompareArrows size={13} />
        {isCompare ? 'Dodano' : 'Porownaj'}
      </button>
    </div>
  );
};

const RequestForm = ({ product, selectedOptions, modelPrice, totalPrice, onClose, onSuccess }) => {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const optionsText = selectedOptions.map(o => `${o.catName}: ${o.name} (+${o.price} PLN)`).join(', ');
      const res = await fetch(`${API}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          type: 'balia_order',
          model: product.name,
          options: selectedOptions.map(o => `${o.catName}: ${o.name}`),
          total: totalPrice,
          message: `${form.message}\n\nModel: ${product.name} (${formatPrice(modelPrice) || product.price})\nOpcje: ${optionsText || 'brak'}\nSuma: ${formatPrice(totalPrice)}`,
        }),
      });
      if (res.ok) onSuccess();
    } catch {}
    setSending(false);
  };

  const optionsPrice = selectedOptions.reduce((s, o) => s + (o.price || 0), 0);

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1A1E27] max-w-md w-full p-6" onClick={e => e.stopPropagation()} data-testid="balie-request-form">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Zloz zapytanie</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button>
        </div>

        {/* Order summary */}
        <div className="bg-[#0F1218] border border-white/5 p-4 mb-4 space-y-2" data-testid="request-order-summary">
          <div className="flex items-center justify-between">
            <span className="text-white text-sm font-medium">{product.name}</span>
            <span className="text-white/70 text-sm font-medium">{formatPrice(modelPrice) || product.price}</span>
          </div>
          {selectedOptions.length > 0 && (
            <>
              <div className="border-t border-white/5 pt-2 space-y-1">
                {selectedOptions.map((o, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-white/40">{o.catName}: {o.name}</span>
                    {o.price > 0 && <span className="text-white/50">+{o.price.toLocaleString()} PLN</span>}
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="border-t border-white/10 pt-2 flex items-center justify-between">
            <span className="text-white font-semibold text-sm">Razem:</span>
            <span className="text-[#D4AF37] font-bold text-lg" data-testid="request-total-price">{formatPrice(totalPrice)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Imie i nazwisko *" required className="w-full p-3 bg-[#0F1218] border border-white/10 text-white text-sm placeholder:text-white/20 focus:border-[#D4AF37] outline-none" data-testid="request-form-name" />
          <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Telefon *" required className="w-full p-3 bg-[#0F1218] border border-white/10 text-white text-sm placeholder:text-white/20 focus:border-[#D4AF37] outline-none" data-testid="request-form-phone" />
          <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" placeholder="E-mail" className="w-full p-3 bg-[#0F1218] border border-white/10 text-white text-sm placeholder:text-white/20 focus:border-[#D4AF37] outline-none" data-testid="request-form-email" />
          <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Dodatkowe uwagi..." rows={3} className="w-full p-3 bg-[#0F1218] border border-white/10 text-white text-sm placeholder:text-white/20 focus:border-[#D4AF37] outline-none resize-none" />
          <button type="submit" disabled={sending} className="w-full py-3 bg-[#D4AF37] text-[#0F1218] font-semibold hover:bg-[#C5A028] transition-colors disabled:opacity-50 flex items-center justify-center gap-2" data-testid="request-form-submit">
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Wyslij zapytanie
          </button>
        </form>
      </div>
    </div>
  );
};

const OptionImageLightbox = ({ src, alt, onClose }) => (
  <div className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4" onClick={onClose}>
    <div className="relative max-w-2xl w-full max-h-[80vh]" onClick={e => e.stopPropagation()}>
      <button onClick={onClose} className="absolute -top-10 right-0 text-white/60 hover:text-white"><X size={24} /></button>
      <img src={src} alt={alt} className="w-full h-auto max-h-[80vh] object-contain rounded" />
    </div>
  </div>
);

const ProductModal = ({ product, apiModel, apiCategories, cardOptions, exclusions, onClose }) => {
  const [imgIdx, setImgIdx] = useState(0);
  const [selectedOpts, setSelectedOpts] = useState({});
  const [selectedHeaterType, setSelectedHeaterType] = useState(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);
  const images = [product.image, ...(product.gallery_images || [])].filter(Boolean);
  const specs = apiModel?.specs || {};

  const enabledCategories = (cardOptions?.enabled_categories || []);
  const modelExclusions = exclusions?.[product.id] || [];

  const availableCategories = apiCategories
    .filter(c => enabledCategories.includes(c.id) && c.options?.length > 0)
    .filter(c => !['fiberglass_color', 'acrylic_color', 'bowl_material', 'heater_upgrade', 'heater_extra'].includes(c.id))
    .map(c => ({ ...c, options: c.options.filter(opt => !modelExclusions.includes(opt.id)) }))
    .filter(c => c.options.length > 0);

  // Heater variants from model
  const heaterVariants = (apiModel?.heaterVariants || []).filter(v =>
    (apiModel?.availableHeaterTypes || []).includes(v.type) && v.price > 0
  );

  // Auto-select if only one variant
  const effectiveHeater = selectedHeaterType
    ? heaterVariants.find(v => v.type === selectedHeaterType)
    : (heaterVariants.length === 1 ? heaterVariants[0] : null);

  const toggleOption = (catId, option) => {
    setSelectedOpts(prev => {
      const current = prev[catId];
      if (current?.id === option.id) { const updated = { ...prev }; delete updated[catId]; return updated; }
      return { ...prev, [catId]: option };
    });
  };

  const getSelectedOptions = () => Object.entries(selectedOpts).map(([catId, opt]) => {
    const cat = apiCategories.find(c => c.id === catId);
    return { ...opt, catName: cat?.name || catId };
  });

  const totalOptionsPrice = Object.values(selectedOpts).reduce((sum, opt) => sum + (opt.price || 0), 0);

  // Model price = selected heater variant price (includes base + heater)
  const parseProductPrice = (priceStr) => {
    if (!priceStr) return 0;
    const digits = priceStr.replace(/[^\d]/g, '');
    return digits ? parseInt(digits, 10) : 0;
  };

  const modelPrice = effectiveHeater?.price || parseProductPrice(product.price);
  const totalPrice = modelPrice + totalOptionsPrice;

  // Display price labels in product card header
  const heaterLabel = effectiveHeater?.type === 'integrated' ? 'z piecem wewnetrznym' : effectiveHeater?.type === 'external' ? 'z piecem zewnetrznym' : '';

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80 flex items-start justify-center overflow-y-auto p-4 pt-8" onClick={onClose}>
        <div className="bg-[#1A1E27] max-w-5xl w-full my-4" onClick={e => e.stopPropagation()} data-testid="balie-product-modal">
          <button onClick={onClose} className="absolute top-2 right-2 w-10 h-10 bg-black/50 text-white flex items-center justify-center hover:bg-red-500 z-10 sm:hidden"><X size={20} /></button>

          <div className="flex flex-col lg:flex-row">
            {/* LEFT: Photo + Description */}
            <div className="lg:w-1/2 flex-shrink-0">
              <div className="relative aspect-[4/3] bg-[#0F1218]">
                <img src={images[imgIdx]} alt={product.name} className="w-full h-full object-cover" />
                {images.length > 1 && (
                  <>
                    <button onClick={() => setImgIdx(p => p === 0 ? images.length - 1 : p - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 text-white flex items-center justify-center hover:bg-[#D4AF37]"><ChevronLeft size={18} /></button>
                    <button onClick={() => setImgIdx(p => (p + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 text-white flex items-center justify-center hover:bg-[#D4AF37]"><ChevronRight size={18} /></button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {images.map((_, i) => <button key={i} onClick={() => setImgIdx(i)} className={`w-2 h-2 rounded-full transition-colors ${i === imgIdx ? 'bg-[#D4AF37]' : 'bg-white/30'}`} />)}
                    </div>
                  </>
                )}
                <button onClick={onClose} className="absolute top-3 right-3 w-9 h-9 bg-black/50 text-white flex items-center justify-center hover:bg-red-500 hidden sm:flex"><X size={18} /></button>
              </div>

              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-1">{product.name}</h2>
                {/* Show variant prices */}
                {heaterVariants.length >= 2 ? (
                  <div className="mb-3 space-y-0.5">
                    {heaterVariants.map(v => (
                      <p key={v.type} className="text-[#D4AF37] text-sm">
                        <span className="text-white/40 text-xs">{v.type === 'integrated' ? 'z piecem wewn.' : 'z piecem zewn.'}</span>{' '}
                        <span className="font-bold">{formatPrice(v.price)}</span>
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#D4AF37] text-lg font-bold mb-3">{formatPrice(modelPrice) || product.price}</p>
                )}

                {product.description && <p className="text-white/50 text-sm leading-relaxed mb-4">{product.description}</p>}

                {apiModel && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-[#0F1218] border border-white/5">
                    {specs.outerDiameter && <div className="text-center"><Ruler size={14} className="mx-auto text-[#D4AF37] mb-0.5" /><div className="text-white/30 text-[10px]">Srednica</div><div className="text-white font-semibold text-sm">{specs.outerDiameter} cm</div></div>}
                    {specs.depth && <div className="text-center"><Droplets size={14} className="mx-auto text-[#D4AF37] mb-0.5" /><div className="text-white/30 text-[10px]">Glebokosc</div><div className="text-white font-semibold text-sm">{specs.depth} cm</div></div>}
                    {specs.waterCapacity && <div className="text-center"><Droplets size={14} className="mx-auto text-[#D4AF37] mb-0.5" /><div className="text-white/30 text-[10px]">Pojemnosc</div><div className="text-white font-semibold text-sm">{specs.waterCapacity} L</div></div>}
                    {specs.seats > 0 && <div className="text-center"><Users size={14} className="mx-auto text-[#D4AF37] mb-0.5" /><div className="text-white/30 text-[10px]">Miejsca</div><div className="text-white font-semibold text-sm">{specs.seats} os.</div></div>}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Heater + Options + Price */}
            <div className="lg:w-1/2 border-l border-white/5 flex flex-col">
              {(heaterVariants.length > 0 || availableCategories.length > 0) ? (
                <>
                  <div className="p-6 flex-1 overflow-y-auto max-h-[60vh] lg:max-h-none">
                    {/* Heater variant selector */}
                    {heaterVariants.length >= 2 && (
                      <div className="mb-5" data-testid="balie-heater-selector">
                        <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Flame size={14} className="text-[#D4AF37]" /> Wybierz typ pieca
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                          {heaterVariants.map(v => {
                            const isSelected = selectedHeaterType === v.type;
                            return (
                              <button key={v.type} onClick={() => setSelectedHeaterType(isSelected ? null : v.type)}
                                className={`w-full flex items-center justify-between px-3 py-3 text-left text-sm transition-all ${
                                  isSelected ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/40 text-white' : 'bg-[#0F1218] border border-white/5 text-white/60 hover:border-white/15'
                                }`} data-testid={`balie-heater-opt-${v.type}`}>
                                <span className="flex items-center gap-2">
                                  <span className={`w-4 h-4 border rounded-full flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-white/20'}`}>
                                    {isSelected && <Check size={10} className="text-[#0F1218]" />}
                                  </span>
                                  <span>{v.type === 'integrated' ? 'Piec wewnetrzny' : 'Piec zewnetrzny'}</span>
                                </span>
                                <span className={`text-sm font-bold whitespace-nowrap ${isSelected ? 'text-[#D4AF37]' : 'text-white/50'}`}>
                                  {formatPrice(v.price)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {/* Single variant info */}
                    {heaterVariants.length === 1 && (
                      <div className="mb-5 p-3 bg-[#0F1218] border border-white/5" data-testid="balie-heater-single">
                        <div className="flex items-center gap-2 text-white/60 text-sm">
                          <Flame size={14} className="text-[#D4AF37]" />
                          <span>{heaterVariants[0].type === 'integrated' ? 'Piec wewnetrzny' : 'Piec zewnetrzny'}</span>
                          <span className="ml-auto text-[#D4AF37] font-bold">{formatPrice(heaterVariants[0].price)}</span>
                        </div>
                      </div>
                    )}

                    {availableCategories.length > 0 && (
                      <>
                        <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Sliders size={14} className="text-[#D4AF37]" /> Wybierz opcje
                        </h3>
                        <div className="space-y-4">
                          {availableCategories.map(cat => (
                            <div key={cat.id} data-testid={`balie-card-cat-${cat.id}`}>
                              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">{cat.name}</p>
                              <div className="space-y-1.5">
                                {cat.options?.map(opt => {
                                  const isSelected = selectedOpts[cat.id]?.id === opt.id;
                                  const hasImage = !!opt.imageUrl;
                                  return (
                                    <div key={opt.id} className="flex items-stretch gap-2">
                                      {hasImage && (
                                        <button
                                          onClick={(e) => { e.stopPropagation(); setLightboxImg({ src: opt.imageUrl, alt: opt.name || opt.namePl }); }}
                                          className="flex-shrink-0 w-14 h-14 overflow-hidden border border-white/10 hover:border-[#D4AF37]/50 transition-colors bg-[#0F1218] group/thumb"
                                          data-testid={`balie-opt-img-${opt.id}`}
                                        >
                                          <img src={opt.imageUrl} alt={opt.name || opt.namePl} className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-110" loading="lazy" />
                                        </button>
                                      )}
                                      <button onClick={() => toggleOption(cat.id, opt)}
                                        className={`flex-1 flex items-center justify-between px-3 py-2.5 text-left text-sm transition-all ${
                                          isSelected ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/40 text-white' : 'bg-[#0F1218] border border-white/5 text-white/60 hover:border-white/15'
                                        }`} data-testid={`balie-card-opt-${opt.id}`}>
                                        <span className="flex items-center gap-2">
                                          <span className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-white/20'}`}>
                                            {isSelected && <Check size={10} className="text-[#0F1218]" />}
                                          </span>
                                          {opt.namePl || opt.name}
                                        </span>
                                        {opt.price > 0 && (
                                          <span className={`text-xs font-medium whitespace-nowrap ${isSelected ? 'text-[#D4AF37]' : 'text-white/30'}`}>
                                            +{opt.price.toLocaleString()} PLN
                                          </span>
                                        )}
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Price summary + buttons */}
                  <div className="p-6 border-t border-white/5 bg-[#0F1218]">
                    <div className="mb-4 space-y-1.5">
                      {modelPrice > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-white/40 text-sm">
                            {product.name} {heaterLabel && <span className="text-white/25">({heaterLabel})</span>}
                          </span>
                          <span className="text-white/70 font-medium">{formatPrice(modelPrice)}</span>
                        </div>
                      )}
                      {totalOptionsPrice > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-white/40 text-sm">Opcje dodatkowe:</span>
                          <span className="text-white/70 font-medium">+{totalOptionsPrice.toLocaleString()} PLN</span>
                        </div>
                      )}
                      {(modelPrice > 0 || totalOptionsPrice > 0) && (
                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                          <span className="text-white font-semibold">Razem:</span>
                          <span className="text-[#D4AF37] font-bold text-xl" data-testid="balie-modal-total">{formatPrice(totalPrice)}</span>
                        </div>
                      )}
                    </div>
                    <div className="mb-3">
                      <BalieInstallment variant="compact" />
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <button onClick={() => setShowRequestForm(true)} className="py-3 bg-[#D4AF37] text-[#0F1218] font-semibold hover:bg-[#C5A028] transition-colors flex items-center justify-center gap-2" data-testid="balie-modal-request">
                        <Send size={16} /> Zloz zapytanie
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-6 flex flex-col justify-end flex-1">
                  {modelPrice > 0 && (
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                      <span className="text-white font-semibold">Cena:</span>
                      <span className="text-[#D4AF37] font-bold text-xl" data-testid="balie-modal-total">{formatPrice(modelPrice)}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-2">
                    <button onClick={() => setShowRequestForm(true)} className="py-3 bg-[#D4AF37] text-[#0F1218] font-semibold hover:bg-[#C5A028] transition-colors flex items-center justify-center gap-2" data-testid="balie-modal-request">
                      <Send size={16} /> Zloz zapytanie
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showRequestForm && (
        <RequestForm
          product={product}
          selectedOptions={getSelectedOptions()}
          modelPrice={modelPrice}
          totalPrice={totalPrice}
          onClose={() => setShowRequestForm(false)}
          onSuccess={() => { setShowRequestForm(false); setRequestSent(true); }}
        />
      )}
      {requestSent && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4" onClick={() => setRequestSent(false)}>
          <div className="bg-[#1A1E27] max-w-sm w-full p-8 text-center" onClick={e => e.stopPropagation()} data-testid="balie-request-success">
            <div className="w-16 h-16 bg-[#D4AF37] flex items-center justify-center mx-auto mb-4"><Check size={32} className="text-[#0F1218]" /></div>
            <h3 className="text-white text-xl font-bold mb-2">Dziekujemy!</h3>
            <p className="text-white/50 text-sm mb-6">Twoje zapytanie zostalo wyslane. Skontaktujemy sie z Toba w najblizszym czasie.</p>
            <button onClick={() => setRequestSent(false)} className="px-6 py-2 border border-white/10 text-white/70 hover:bg-white/5">Zamknij</button>
          </div>
        </div>
      )}
      {lightboxImg && (
        <OptionImageLightbox src={lightboxImg.src} alt={lightboxImg.alt} onClose={() => setLightboxImg(null)} />
      )}
    </>
  );
};

/* ─── Compare Modal ─── */
const CompareModal = ({ products, apiModels, onClose, onRemove }) => {
  const items = products.map(p => {
    const api = apiModels.find(m => m.id === p.api_model_id);
    const specs = api?.specs || {};
    const hvs = (api?.heaterVariants || []).filter(v => (api?.availableHeaterTypes || []).includes(v.type) && v.price > 0);
    return { product: p, specs, heaterVariants: hvs };
  });

  const rows = [
    { label: 'Srednica / wymiary', icon: Ruler, render: (it) => it.specs.outerDiameter ? `${it.specs.outerDiameter} cm` : it.specs.dimensions || '—' },
    { label: 'Glebokosc', icon: Droplets, render: (it) => it.specs.depth ? `${it.specs.depth} cm` : '—' },
    { label: 'Pojemnosc wody', icon: Droplets, render: (it) => it.specs.waterCapacity ? `${it.specs.waterCapacity} L` : '—' },
    { label: 'Wysokosc calkowita', icon: Box, render: (it) => it.specs.totalHeight ? `${it.specs.totalHeight} cm` : '—' },
    { label: 'Liczba miejsc', icon: Users, render: (it) => it.specs.seats > 0 ? `${it.specs.seats} os.` : '—' },
    { label: 'Moc pieca', icon: Thermometer, render: (it) => it.specs.heaterPower ? `${it.specs.heaterPower} kW` : '—' },
    { label: 'Piec wewnetrzny', icon: Flame, render: (it) => {
      const v = it.heaterVariants.find(h => h.type === 'integrated');
      return v ? formatPrice(v.price) : '—';
    }},
    { label: 'Piec zewnetrzny', icon: Flame, render: (it) => {
      const v = it.heaterVariants.find(h => h.type === 'external');
      return v ? formatPrice(v.price) : '—';
    }},
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-start justify-center overflow-y-auto p-4 pt-8" onClick={onClose}>
      <div className="bg-[#1A1E27] max-w-4xl w-full my-4" onClick={e => e.stopPropagation()} data-testid="balie-compare-modal">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <GitCompareArrows size={20} className="text-[#D4AF37]" /> Porownanie modeli
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            {/* Header: photos + names */}
            <thead>
              <tr className="border-b border-white/5">
                <th className="p-4 text-left text-white/30 text-xs uppercase tracking-wider w-[160px]">Model</th>
                {items.map(it => (
                  <th key={it.product.id} className="p-4 text-center">
                    <div className="relative inline-block">
                      <img src={it.product.image} alt={it.product.name} className="w-28 h-20 object-cover mx-auto mb-2 border border-white/10" />
                      <button
                        onClick={() => onRemove(it.product.id)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500/80 text-white flex items-center justify-center hover:bg-red-500 text-xs"
                        data-testid={`compare-remove-${it.product.id}`}
                      >
                        <X size={12} />
                      </button>
                    </div>
                    <div className="text-white font-semibold text-sm">{it.product.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-white/[0.02]' : ''}>
                  <td className="p-3.5 text-white/40 text-sm flex items-center gap-2">
                    <row.icon size={14} className="text-[#D4AF37] flex-shrink-0" /> {row.label}
                  </td>
                  {items.map(it => {
                    const val = row.render(it);
                    const isDash = val === '—';
                    return (
                      <td key={it.product.id} className={`p-3.5 text-center text-sm font-medium ${isDash ? 'text-white/20' : 'text-white'}`}>
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ─── Floating Compare Bar ─── */
const CompareBar = ({ count, onCompare, onClear }) => {
  if (count < 2) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#1A1E27]/95 border-t border-[#D4AF37]/30 backdrop-blur-md px-4 py-3" data-testid="balie-compare-bar">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-white text-sm">
          <span className="text-[#D4AF37] font-bold">{count}</span> modele do porownania
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onClear} className="text-white/40 text-sm hover:text-white transition-colors" data-testid="compare-clear">Wyczysc</button>
          <button onClick={onCompare} className="px-5 py-2 bg-[#D4AF37] text-[#0F1218] font-semibold text-sm hover:bg-[#C5A028] transition-colors flex items-center gap-2" data-testid="compare-open-btn">
            <GitCompareArrows size={15} /> Porownaj
          </button>
        </div>
      </div>
    </div>
  );
};

export const BalieProducts = () => {
  const [products, setProducts] = useState([]);
  const [apiModels, setApiModels] = useState([]);
  const [apiCategories, setApiCategories] = useState([]);
  const [cardOptions, setCardOptions] = useState({ enabled_categories: [] });
  const [exclusions, setExclusions] = useState({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [compareIds, setCompareIds] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/balia/products`).then(r => r.json()).catch(() => []),
      fetch(`${API}/api/balia/calculator/prices`).then(r => r.json()).catch(() => ({ models: [], categories: [] })),
      fetch(`${API}/api/balia/card-options-settings`).then(r => r.json()).catch(() => ({ enabled_categories: [] })),
      fetch(`${API}/api/balia/option-exclusions`).then(r => r.json()).catch(() => ({ exclusions: {} })),
    ]).then(([prods, api, opts, excl]) => {
      setProducts(prods);
      setApiModels(api.models || []);
      setApiCategories(api.categories || []);
      setCardOptions(opts);
      setExclusions(excl.exclusions || {});
      setLoading(false);
    });
  }, []);

  const getApiModel = (id) => apiModels.find(m => m.id === id);

  const toggleCompare = (productId) => {
    setCompareIds(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  };

  const compareProducts = products.filter(p => compareIds.includes(p.id));

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-[#D4AF37]" size={32} /></div>;
  if (products.length === 0) return null;

  return (
    <section id="produkty" className="py-20 bg-[#0F1218]" data-testid="balie-products">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Nasza <span className="text-[#D4AF37]">Kolekcja</span>
          </h2>
          <p className="text-white/50 text-sm">Wybierz idealna balie dla swojego ogrodu</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              apiModel={getApiModel(p.api_model_id)}
              onClick={setSelected}
              isCompare={compareIds.includes(p.id)}
              onToggleCompare={toggleCompare}
            />
          ))}
        </div>
      </div>

      <CompareBar count={compareIds.length} onCompare={() => setShowCompare(true)} onClear={() => setCompareIds([])} />

      {showCompare && compareProducts.length >= 2 && (
        <CompareModal
          products={compareProducts}
          apiModels={apiModels}
          onClose={() => setShowCompare(false)}
          onRemove={(id) => {
            const next = compareIds.filter(i => i !== id);
            setCompareIds(next);
            if (next.length < 2) setShowCompare(false);
          }}
        />
      )}

      {selected && (
        <ProductModal
          product={selected}
          apiModel={getApiModel(selected.api_model_id)}
          apiCategories={apiCategories}
          cardOptions={cardOptions}
          exclusions={exclusions}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
};
