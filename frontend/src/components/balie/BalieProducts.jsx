import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, Loader2, Users, Droplets, Ruler, ChevronLeft, ChevronRight, Check, Send, Sliders } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const ProductCard = ({ product, onClick }) => (
  <div
    onClick={() => onClick(product)}
    className="bg-[#1A1E27] border border-white/5 overflow-hidden cursor-pointer group hover:border-[#D4AF37]/30 transition-all"
    data-testid={`balie-product-${product.id}`}
  >
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
      <p className="text-[#D4AF37] font-bold mb-2">{product.price}</p>
      {product.description && <p className="text-white/40 text-sm line-clamp-2 mb-4">{product.description}</p>}
      <div className="flex items-center gap-2 text-white/60 text-sm group-hover:text-[#D4AF37] transition-colors">
        Szczegoly <ArrowRight size={14} />
      </div>
    </div>
  </div>
);

const RequestForm = ({ product, selectedOptions, totalPrice, onClose, onSuccess }) => {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch(`${API}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          type: 'balia_order',
          model: product.name,
          options: selectedOptions.map(o => `${o.catName}: ${o.name}`),
          total: totalPrice,
          message: `${form.message}\n\nModel: ${product.name}\nOpcje: ${selectedOptions.map(o => `${o.catName}: ${o.name} (+${o.price} PLN)`).join(', ')}\nSuma opcji: ${totalPrice} PLN`,
        }),
      });
      if (res.ok) {
        onSuccess();
      }
    } catch {}
    setSending(false);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1A1E27] max-w-md w-full p-6" onClick={e => e.stopPropagation()} data-testid="balie-request-form">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Zloz zapytanie</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={20} /></button>
        </div>
        <p className="text-white/40 text-sm mb-4">
          {product.name} {selectedOptions.length > 0 && `+ ${selectedOptions.length} opcji`}
          {totalPrice > 0 && <span className="text-[#D4AF37] ml-2">({totalPrice.toLocaleString()} PLN)</span>}
        </p>
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

const ProductModal = ({ product, apiModel, apiCategories, cardOptions, onClose, onConfigure }) => {
  const [imgIdx, setImgIdx] = useState(0);
  const [selectedOpts, setSelectedOpts] = useState({});
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const images = [product.image, ...(product.gallery_images || [])].filter(Boolean);
  const specs = apiModel?.specs || {};

  const enabledCategories = (cardOptions?.enabled_categories || []);
  const availableCategories = apiCategories
    .filter(c => enabledCategories.includes(c.id) && c.options?.length > 0)
    .filter(c => !['fiberglass_color', 'acrylic_color', 'bowl_material'].includes(c.id));

  const toggleOption = (catId, option) => {
    setSelectedOpts(prev => {
      const current = prev[catId];
      if (current?.id === option.id) {
        const updated = { ...prev };
        delete updated[catId];
        return updated;
      }
      return { ...prev, [catId]: option };
    });
  };

  const getSelectedOptions = () => Object.entries(selectedOpts).map(([catId, opt]) => {
    const cat = apiCategories.find(c => c.id === catId);
    return { ...opt, catName: cat?.name || catId };
  });

  const totalOptionsPrice = Object.values(selectedOpts).reduce((sum, opt) => sum + (opt.price || 0), 0);

  const basePrice = apiModel?.basePrice || 0;
  const totalPrice = basePrice + totalOptionsPrice;

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80 flex items-start justify-center overflow-y-auto p-4 pt-8" onClick={onClose}>
        <div className="bg-[#1A1E27] max-w-5xl w-full my-4" onClick={e => e.stopPropagation()} data-testid="balie-product-modal">
          {/* Close button */}
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
                      {images.map((_, i) => (
                        <button key={i} onClick={() => setImgIdx(i)} className={`w-2 h-2 rounded-full transition-colors ${i === imgIdx ? 'bg-[#D4AF37]' : 'bg-white/30'}`} />
                      ))}
                    </div>
                  </>
                )}
                <button onClick={onClose} className="absolute top-3 right-3 w-9 h-9 bg-black/50 text-white flex items-center justify-center hover:bg-red-500 hidden sm:flex"><X size={18} /></button>
              </div>

              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-1">{product.name}</h2>
                <p className="text-[#D4AF37] text-lg font-bold mb-3">{product.price}</p>

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

            {/* RIGHT: Options + Price */}
            <div className="lg:w-1/2 border-l border-white/5 flex flex-col">
              {availableCategories.length > 0 ? (
                <>
                  <div className="p-6 flex-1 overflow-y-auto max-h-[60vh] lg:max-h-none">
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
                              return (
                                <button
                                  key={opt.id}
                                  onClick={() => toggleOption(cat.id, opt)}
                                  className={`w-full flex items-center justify-between px-3 py-2.5 text-left text-sm transition-all ${
                                    isSelected
                                      ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/40 text-white'
                                      : 'bg-[#0F1218] border border-white/5 text-white/60 hover:border-white/15'
                                  }`}
                                  data-testid={`balie-card-opt-${opt.id}`}
                                >
                                  <span className="flex items-center gap-2">
                                    <span className={`w-4 h-4 border flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-white/20'}`}>
                                      {isSelected && <Check size={10} className="text-[#0F1218]" />}
                                    </span>
                                    {opt.name}
                                  </span>
                                  {opt.price > 0 && (
                                    <span className={`text-xs font-medium whitespace-nowrap ${isSelected ? 'text-[#D4AF37]' : 'text-white/30'}`}>
                                      +{opt.price.toLocaleString()} PLN
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price summary + buttons */}
                  <div className="p-6 border-t border-white/5 bg-[#0F1218]">
                    <div className="mb-4 space-y-1.5">
                      {basePrice > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-white/40 text-sm">Cena bazowa:</span>
                          <span className="text-white/70 font-medium">{basePrice.toLocaleString()} PLN</span>
                        </div>
                      )}
                      {totalOptionsPrice > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-white/40 text-sm">Opcje dodatkowe:</span>
                          <span className="text-white/70 font-medium">+{totalOptionsPrice.toLocaleString()} PLN</span>
                        </div>
                      )}
                      {(basePrice > 0 || totalOptionsPrice > 0) && (
                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                          <span className="text-white font-semibold">Razem:</span>
                          <span className="text-[#D4AF37] font-bold text-xl" data-testid="balie-modal-total">{totalPrice.toLocaleString()} PLN</span>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={() => setShowRequestForm(true)}
                        className="py-3 bg-[#D4AF37] text-[#0F1218] font-semibold hover:bg-[#C5A028] transition-colors flex items-center justify-center gap-2"
                        data-testid="balie-modal-request"
                      >
                        <Send size={16} /> Zloz zapytanie
                      </button>
                      <button
                        onClick={onConfigure}
                        className="py-3 border border-white/10 text-white/70 font-medium hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                        data-testid="balie-modal-configure"
                      >
                        <Sliders size={16} /> Skonfiguruj wlasny wariant
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-6 flex flex-col justify-end flex-1">
                  {basePrice > 0 && (
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                      <span className="text-white font-semibold">Cena:</span>
                      <span className="text-[#D4AF37] font-bold text-xl" data-testid="balie-modal-total">{basePrice.toLocaleString()} PLN</span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => setShowRequestForm(true)}
                      className="py-3 bg-[#D4AF37] text-[#0F1218] font-semibold hover:bg-[#C5A028] transition-colors flex items-center justify-center gap-2"
                      data-testid="balie-modal-request"
                    >
                      <Send size={16} /> Zloz zapytanie
                    </button>
                    <button
                      onClick={onConfigure}
                      className="py-3 border border-white/10 text-white/70 font-medium hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                      data-testid="balie-modal-configure"
                    >
                      <Sliders size={16} /> Skonfiguruj wlasny wariant
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
          totalPrice={totalOptionsPrice}
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
    </>
  );
};

export const BalieProducts = () => {
  const [products, setProducts] = useState([]);
  const [apiModels, setApiModels] = useState([]);
  const [apiCategories, setApiCategories] = useState([]);
  const [cardOptions, setCardOptions] = useState({ enabled_categories: [] });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/balia/products`).then(r => r.json()).catch(() => []),
      fetch(`${API}/api/balia/calculator/prices`).then(r => r.json()).catch(() => ({ models: [], categories: [] })),
      fetch(`${API}/api/balia/card-options-settings`).then(r => r.json()).catch(() => ({ enabled_categories: [] })),
    ]).then(([prods, api, opts]) => {
      setProducts(prods);
      setApiModels(api.models || []);
      setApiCategories(api.categories || []);
      setCardOptions(opts);
      setLoading(false);
    });
  }, []);

  const getApiModel = (id) => apiModels.find(m => m.id === id);

  const handleConfigure = (product) => {
    setSelected(null);
    navigate(product.api_model_id ? `/balie/konfigurator?model=${product.api_model_id}` : '/balie/konfigurator');
  };

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
            <ProductCard key={p.id} product={p} onClick={setSelected} />
          ))}
        </div>

        <div className="text-center mt-10">
          <button onClick={() => navigate('/balie/konfigurator')} className="px-8 py-3 border border-[#D4AF37] text-[#D4AF37] font-medium hover:bg-[#D4AF37] hover:text-[#0F1218] transition-colors" data-testid="balie-go-configurator">
            Skonfiguruj wlasna balie
          </button>
        </div>
      </div>

      {selected && (
        <ProductModal
          product={selected}
          apiModel={getApiModel(selected.api_model_id)}
          apiCategories={apiCategories}
          cardOptions={cardOptions}
          onClose={() => setSelected(null)}
          onConfigure={() => handleConfigure(selected)}
        />
      )}
    </section>
  );
};
