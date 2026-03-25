import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Check, ChevronDown, ShieldCheck, Truck, Phone, Loader2, Info, X, ArrowLeft, Droplets } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const SelectOption = ({ label, options, value, onChange, hint }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find(o => o.id === value);
  return (
    <div className="mb-6">
      <label className="block text-white/60 text-sm mb-2">{label}</label>
      {hint && <p className="text-white/30 text-xs mb-2">{hint}</p>}
      <div className="relative">
        <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between bg-[#1E2229] border border-white/10 px-4 py-3 text-left hover:border-[#D4AF37]/50 transition-colors">
          <div className="flex items-center gap-3">
            {selected?.imageUrl && <img src={selected.imageUrl} alt="" className="w-8 h-8 object-cover rounded" />}
            <span className="text-white">{selected?.namePl || selected?.name || 'Wybierz...'}</span>
          </div>
          <div className="flex items-center gap-3">
            {selected?.price > 0 && <span className="text-[#D4AF37] text-sm font-medium">+{selected.price.toLocaleString()} zł</span>}
            <ChevronDown size={16} className={`text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>
        {isOpen && (
          <div className="absolute z-20 w-full mt-1 bg-[#1E2229] border border-white/10 max-h-64 overflow-y-auto">
            {options.map(opt => (
              <button key={opt.id} type="button" onClick={() => { onChange(opt.id); setIsOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 ${value === opt.id ? 'bg-[#D4AF37]/10' : ''}`}>
                <div className="flex items-center gap-3">
                  {opt.imageUrl && <img src={opt.imageUrl} alt="" className="w-8 h-8 object-cover rounded" />}
                  <span className="text-white text-sm">{opt.namePl || opt.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {opt.price > 0 && <span className="text-[#D4AF37] text-xs">+{opt.price.toLocaleString()} zł</span>}
                  {value === opt.id && <Check size={14} className="text-[#D4AF37]" />}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const BalieConfigurator = () => {
  const [searchParams] = useSearchParams();
  const preselectedModel = searchParams.get('model');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priceData, setPriceData] = useState(null);
  const [settings, setSettings] = useState({ hiddenModels: [], hiddenCategories: [], hiddenOptions: [], categoryDescriptions: {} });
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedHeater, setSelectedHeater] = useState('external');
  const [selectedOptions, setSelectedOptions] = useState({});
  const [contactForm, setContactForm] = useState({ name: '', phone: '', comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/balia/calculator/prices`);
        if (!res.ok) throw new Error('Nie udało się pobrać danych');
        const data = await res.json();
        setPriceData(data);
        try { const sr = await fetch(`${API}/api/balia/configurator-settings`); if (sr.ok) setSettings(await sr.json()); } catch {}
        const models = data.models?.filter(m => m.active !== false) || [];
        if (preselectedModel && models.find(m => m.id === preselectedModel)) {
          const m = models.find(m2 => m2.id === preselectedModel);
          setSelectedModel(preselectedModel);
          if (m.availableHeaterTypes?.length > 0) setSelectedHeater(m.availableHeaterTypes[0]);
        } else if (models.length > 0) {
          setSelectedModel(models[0].id);
          if (models[0].availableHeaterTypes?.length > 0) setSelectedHeater(models[0].availableHeaterTypes[0]);
        }
      } catch (e) { setError(e.message); }
      setLoading(false);
    })();
  }, [preselectedModel]);

  const currentModel = useMemo(() => priceData?.models?.find(m => m.id === selectedModel), [priceData, selectedModel]);
  const currentVariant = useMemo(() => currentModel?.heaterVariants?.find(v => v.type === selectedHeater), [currentModel, selectedHeater]);

  const totalPrice = useMemo(() => {
    let total = currentVariant?.price || 0;
    Object.entries(selectedOptions).forEach(([catId, optId]) => {
      const cat = priceData?.categories?.find(c => c.id === catId);
      const opt = cat?.options?.find(o => o.id === optId);
      if (opt?.price) total += opt.price;
    });
    return total;
  }, [currentVariant, selectedOptions, priceData]);

  const handleModelChange = (id) => {
    setSelectedModel(id);
    const m = priceData?.models?.find(x => x.id === id);
    if (m?.availableHeaterTypes?.length > 0) setSelectedHeater(m.availableHeaterTypes[0]);
    setSelectedOptions({});
  };

  const activeModels = useMemo(() => (priceData?.models?.filter(m => m.active !== false) || []).filter(m => !settings.hiddenModels?.includes(m.id)), [priceData, settings]);

  const displayCategories = useMemo(() => {
    if (!priceData?.categories) return [];
    return priceData.categories.filter(cat => {
      if (settings.hiddenCategories?.includes(cat.id)) return false;
      if (cat.dependsOn && cat.dependsOnValue && selectedOptions[cat.dependsOn] !== cat.dependsOnValue) return false;
      return (cat.options?.filter(o => o.active !== false && !settings.hiddenOptions?.includes(o.id)) || []).length > 0;
    });
  }, [priceData, selectedOptions, settings]);

  const getVisibleOptions = (cat) => cat.options?.filter(o => o.active !== false && !settings.hiddenOptions?.includes(o.id)) || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetch(`${API}/api/balia/calculator/generate-pdf`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: { ...currentModel, heaterType: selectedHeater, price: currentVariant?.price }, selectedOptions: Object.entries(selectedOptions).map(([catId, optId]) => { const cat = priceData?.categories?.find(c => c.id === catId); const opt = cat?.options?.find(o => o.id === optId); return { categoryId: catId, categoryName: cat?.namePl || cat?.name, optionId: optId, optionName: opt?.namePl || opt?.name, price: opt?.price }; }), clientInfo: contactForm, totalPrice, language: 'pl' })
      }).then(r => r.ok && r.blob()).then(blob => {
        if (blob) { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `oferta-balia.pdf`; a.click(); URL.revokeObjectURL(url); }
      });
    } catch {}
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0F1218] flex items-center justify-center">
      <div className="text-center"><Loader2 size={32} className="animate-spin text-[#D4AF37] mx-auto mb-3" /><p className="text-white/50 text-sm">Ładowanie konfiguratora...</p></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#0F1218] flex items-center justify-center">
      <div className="text-center"><p className="text-red-400 mb-4">{error}</p><button onClick={() => window.location.reload()} className="px-6 py-2 bg-[#D4AF37] text-black font-medium">Spróbuj ponownie</button></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F1218]" data-testid="balie-configurator">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F1218]/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/balie')} className="text-white/40 hover:text-white"><ArrowLeft size={20} /></button>
            <div className="flex items-center gap-2"><Droplets size={18} className="text-[#D4AF37]" /><span className="text-white font-bold">Konfigurator</span></div>
          </div>
          <a href="tel:+48123456789" className="text-[#D4AF37] text-sm flex items-center gap-2"><Phone size={16} /></a>
        </div>
      </nav>

      <div className="pt-24 pb-32 max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Skonfiguruj Swoją Balię</h1>
          <p className="text-white/50 text-sm">Wybierz model i dostosuj opcje</p>
        </div>

        {/* Models */}
        {!preselectedModel && (
          <div className="mb-10">
            <h3 className="text-white font-semibold mb-4">Wybierz model</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {activeModels.map(m => (
                <button key={m.id} onClick={() => handleModelChange(m.id)}
                  className={`border-2 overflow-hidden text-left transition-all ${selectedModel === m.id ? 'border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.15)]' : 'border-white/10 hover:border-white/30'}`}>
                  <img src={m.imageUrl} alt={m.namePl} className="w-full aspect-[4/3] object-cover" />
                  <div className="p-3"><div className="text-white text-sm font-medium">{m.namePl || m.name}</div><div className="text-[#D4AF37] text-xs mt-1">od {(m.heaterVariants?.[0]?.price || m.basePrice)?.toLocaleString()} zł</div></div>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentModel && (
          <>
            {/* Heater */}
            {currentModel.availableHeaterTypes?.length > 1 && (
              <div className="mb-10">
                <h3 className="text-white font-semibold mb-4">Typ pieca</h3>
                <div className="grid grid-cols-2 gap-4">
                  {currentModel.heaterVariants?.map(v => (
                    <button key={v.type} onClick={() => setSelectedHeater(v.type)}
                      className={`p-4 border-2 text-left transition-all ${selectedHeater === v.type ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-white/10 hover:border-white/30'}`}>
                      <div className="text-white font-medium text-sm">{v.type === 'integrated' ? 'Piec zintegrowany' : 'Piec zewnętrzny'}</div>
                      <div className="text-[#D4AF37] text-sm mt-1">{v.price?.toLocaleString()} zł</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Options */}
            <div className="mb-10">
              <h3 className="text-white font-semibold mb-4">Konfiguracja</h3>
              {displayCategories.map(cat => (
                <SelectOption
                  key={cat.id}
                  label={cat.namePl || cat.name}
                  options={getVisibleOptions(cat)}
                  value={selectedOptions[cat.id]}
                  onChange={(optId) => setSelectedOptions(p => ({ ...p, [cat.id]: optId }))}
                  hint={settings.categoryDescriptions?.[cat.id] || cat.hintPl}
                />
              ))}
            </div>

            {/* Contact */}
            <div className="mb-10">
              <h3 className="text-white font-semibold mb-4">Twoje dane</h3>
              {isSubmitted ? (
                <div className="text-center py-8 bg-[#1A1E27] border border-white/5">
                  <Check size={48} className="mx-auto text-green-400 mb-3" />
                  <h4 className="text-white text-xl font-semibold mb-2">Dziękujemy!</h4>
                  <p className="text-white/50 text-sm">Skontaktujemy się w ciągu 24 godzin.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input type="text" placeholder="Imię i nazwisko *" required value={contactForm.name} onChange={e => setContactForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full p-3 bg-[#1E2229] border border-white/10 text-white text-sm focus:border-[#D4AF37] outline-none placeholder-white/30" />
                  <input type="tel" placeholder="Telefon *" required value={contactForm.phone} onChange={e => setContactForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full p-3 bg-[#1E2229] border border-white/10 text-white text-sm focus:border-[#D4AF37] outline-none placeholder-white/30" />
                  <textarea placeholder="Komentarz" rows={3} value={contactForm.comment} onChange={e => setContactForm(p => ({ ...p, comment: e.target.value }))}
                    className="w-full p-3 bg-[#1E2229] border border-white/10 text-white text-sm focus:border-[#D4AF37] outline-none placeholder-white/30 resize-none" />
                  <button type="submit" disabled={isSubmitting}
                    className="w-full py-4 bg-[#D4AF37] text-[#0F1218] font-semibold hover:bg-[#C5A028] transition-colors disabled:opacity-50">
                    {isSubmitting ? 'Wysyłanie...' : `Wyślij zamówienie — ${totalPrice.toLocaleString()} zł`}
                  </button>
                </form>
              )}
            </div>
          </>
        )}
      </div>

      {/* Sticky price bar */}
      {currentModel && !isSubmitted && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0D12] border-t border-white/10 py-3 px-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={currentModel.imageUrl} alt="" className="w-10 h-10 object-cover rounded hidden sm:block" />
              <div><div className="text-white text-sm font-medium">{currentModel.namePl || currentModel.name}</div><div className="text-white/30 text-xs">{selectedHeater === 'integrated' ? 'Piec zintegrowany' : 'Piec zewnętrzny'}</div></div>
            </div>
            <div className="text-right">
              <div className="text-[#D4AF37] text-xl font-bold">{totalPrice.toLocaleString()} zł</div>
              <div className="text-white/30 text-xs">z VAT</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
