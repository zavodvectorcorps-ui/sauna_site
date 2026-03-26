import { useState, useEffect, useCallback } from 'react';
import { Save, Loader2, Eye, EyeOff, Monitor, ChevronUp, ChevronDown, Plus, Trash2, GripVertical } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const ICON_LIST = ['ShieldCheck','Hammer','Leaf','Truck','Wrench','Award','Flag','Waves','Wind','Lightbulb','ThermometerSun'];

const DEFAULT_FEATURES = [
  { icon: 'ShieldCheck', title: '2 Lata Gwarancji', desc: 'Pelne bezpieczenstwo i wsparcie serwisowe.', active: true },
  { icon: 'Hammer', title: 'Reczna Produkcja', desc: 'Kazdy detal dopracowany przez rzemieslnikow.', active: true },
  { icon: 'Leaf', title: 'Eko Materialy', desc: 'Modrzew syberyjski z certyfikowanych zrodel.', active: true },
];
const DEFAULT_OPTIONS = [
  { icon: 'Waves', title: 'Hydromasaz', desc: 'System dysz masujacych', active: true },
  { icon: 'Wind', title: 'Aeromasaz', desc: 'Delikatne babelki powietrza', active: true },
  { icon: 'Lightbulb', title: 'Oswietlenie LED', desc: 'Nastrojowe swiatla', active: true },
  { icon: 'ThermometerSun', title: 'Pokrywa termiczna', desc: 'Utrzymuje temperature', active: true },
];
const DEFAULT_BADGES = [
  { icon: 'Truck', title: 'Dostawa w calej Polsce', active: true },
  { icon: 'Wrench', title: 'Montaz w cenie', active: true },
  { icon: 'Award', title: 'Certyfikat FSC', active: true },
  { icon: 'Flag', title: 'Made in Poland', active: true },
];

const DEFAULT_SECTIONS = [
  { id: 'hero', label: 'Hero' },
  { id: 'features', label: 'Dlaczego WM-Balia?' },
  { id: 'products', label: 'Produkty' },
  { id: 'installment', label: 'Raty / Рассрочка' },
  { id: 'colors', label: 'Kolory i Materialy' },
  { id: 'options', label: 'Opcje i Akcesoria' },
  { id: 'schematic', label: 'Budowa Balii' },
  { id: 'stove', label: 'Schemat Pieca' },
  { id: 'about', label: 'O nas' },
  { id: 'gallery', label: 'Galeria' },
  { id: 'configurator', label: 'Konfigurator CTA' },
  { id: 'testimonials', label: 'Opinie' },
  { id: 'contact', label: 'Kontakt' },
];

export const BaliaContentAdmin = ({ authHeader, showMessage }) => {
  const [content, setContent] = useState({
    hero: { badge: '', headline: '', subheadline: '', cta_primary: '', cta_secondary: '', stats: [{ value: '', label: '' }, { value: '', label: '' }, { value: '', label: '' }] },
    promo_blocks: {
      features: { enabled: true, title: '', subtitle: '' },
      installment: { enabled: true, title: '', subtitle: '' },
      schematic: { enabled: true, title: '', subtitle: '' },
      stove: { enabled: true, title: '', subtitle: '' },
      about: { enabled: true },
    },
    promo_features: DEFAULT_FEATURES,
    promo_options: DEFAULT_OPTIONS,
    promo_badges: DEFAULT_BADGES,
    section_order: DEFAULT_SECTIONS.map(s => s.id),
  });
  const [exclusions, setExclusions] = useState({});
  const [products, setProducts] = useState([]);
  const [apiCategories, setApiCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingExcl, setSavingExcl] = useState(false);
  const [activeExclModel, setActiveExclModel] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/balia/content`).then(r => r.json()).catch(() => ({})),
      fetch(`${API}/api/balia/option-exclusions`).then(r => r.json()).catch(() => ({ exclusions: {} })),
      fetch(`${API}/api/balia/products`).then(r => r.json()).catch(() => []),
      fetch(`${API}/api/balia/calculator/prices`).then(r => r.json()).catch(() => ({ categories: [] })),
    ]).then(([data, exclData, prods, api]) => {
      if (data && Object.keys(data).length > 0) {
        setContent(prev => ({
          hero: { ...prev.hero, ...data.hero },
          promo_blocks: { ...prev.promo_blocks, ...data.promo_blocks },
          promo_features: data.promo_features?.length ? data.promo_features : prev.promo_features,
          promo_options: data.promo_options?.length ? data.promo_options : prev.promo_options,
          promo_badges: data.promo_badges?.length ? data.promo_badges : prev.promo_badges,
          section_order: data.section_order?.length ? data.section_order : prev.section_order,
        }));
      }
      setExclusions(exclData.exclusions || {});
      setProducts(prods);
      setApiCategories((api.categories || []).filter(c => !['fiberglass_color', 'acrylic_color', 'bowl_material'].includes(c.id)));
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`${API}/api/balia/content`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
      body: JSON.stringify(content),
    });
    if (res.ok) showMessage('success', 'Сохранено');
    else showMessage('error', 'Ошибка сохранения');
    setSaving(false);
  };

  const handleSaveExclusions = async () => {
    setSavingExcl(true);
    const res = await fetch(`${API}/api/balia/option-exclusions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
      body: JSON.stringify({ exclusions }),
    });
    if (res.ok) showMessage('success', 'Исключения сохранены');
    else showMessage('error', 'Ошибка');
    setSavingExcl(false);
  };

  const updateHero = (f, v) => setContent(p => ({ ...p, hero: { ...p.hero, [f]: v } }));
  const updateStat = (i, f, v) => setContent(p => {
    const stats = [...p.hero.stats]; stats[i] = { ...stats[i], [f]: v };
    return { ...p, hero: { ...p.hero, stats } };
  });
  const updatePromoBlock = (id, f, v) => setContent(p => ({
    ...p, promo_blocks: { ...p.promo_blocks, [id]: { ...(p.promo_blocks?.[id] || {}), [f]: v } },
  }));

  // Features/Options/Badges CRUD
  const updateItem = (listKey, idx, field, value) => {
    setContent(p => {
      const list = [...(p[listKey] || [])];
      list[idx] = { ...list[idx], [field]: value };
      return { ...p, [listKey]: list };
    });
  };
  const removeItem = (listKey, idx) => {
    setContent(p => ({ ...p, [listKey]: p[listKey].filter((_, i) => i !== idx) }));
  };
  const addItem = (listKey, template) => {
    setContent(p => ({ ...p, [listKey]: [...(p[listKey] || []), template] }));
  };

  // Section ordering
  const moveSection = (idx, dir) => {
    setContent(p => {
      const order = [...(p.section_order || [])];
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= order.length) return p;
      [order[idx], order[newIdx]] = [order[newIdx], order[idx]];
      return { ...p, section_order: order };
    });
  };

  const toggleExclusion = (productId, optionId) => {
    setExclusions(prev => {
      const excl = [...(prev[productId] || [])];
      const idx = excl.indexOf(optionId);
      if (idx >= 0) excl.splice(idx, 1);
      else excl.push(optionId);
      return { ...prev, [productId]: excl };
    });
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#C6A87C]" /></div>;

  const promoBlocks = [
    { id: 'features', label: 'Преимущества (Cechy)' },
    { id: 'installment', label: 'Рассрочка (Raty)' },
    { id: 'schematic', label: 'Схема купели (Budowa)' },
    { id: 'stove', label: 'Схема печи (Piec)' },
    { id: 'about', label: 'О нас (O nas)' },
  ];

  const sectionLabels = Object.fromEntries(DEFAULT_SECTIONS.map(s => [s.id, s.label]));
  const allOptions = apiCategories.flatMap(c => (c.options || []).map(o => ({ ...o, catName: c.name, catId: c.id })));

  const tabs = [
    { id: 'hero', label: 'Hero' },
    { id: 'features_edit', label: 'Карточки «Dlaczego»' },
    { id: 'promo_blocks', label: 'Промо-блоки' },
    { id: 'section_order', label: 'Порядок блоков' },
    { id: 'exclusions', label: 'Исключения опций' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Контент купелей</h3>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-[#C6A87C] text-white text-sm font-medium hover:bg-[#B09060] disabled:opacity-50" data-testid="balia-content-save">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Сохранить
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 mb-5 border-b border-gray-100 pb-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${activeTab === t.id ? 'bg-[#C6A87C] text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            data-testid={`balia-content-tab-${t.id}`}
          >{t.label}</button>
        ))}
      </div>

      {/* Hero Tab */}
      {activeTab === 'hero' && (
        <div className="space-y-4">
          <div className="p-5 border border-gray-100 bg-[#F9F9F7]">
            <h4 className="font-semibold mb-4">Hero секция</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Badge</label>
                <input value={content.hero.badge} onChange={e => updateHero('badge', e.target.value)} className="w-full p-2.5 border border-gray-200 text-sm focus:border-[#C6A87C] outline-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Заголовок</label>
                <input value={content.hero.headline} onChange={e => updateHero('headline', e.target.value)} className="w-full p-2.5 border border-gray-200 text-sm focus:border-[#C6A87C] outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Подзаголовок</label>
                <textarea value={content.hero.subheadline} onChange={e => updateHero('subheadline', e.target.value)} rows={2} className="w-full p-2.5 border border-gray-200 text-sm focus:border-[#C6A87C] outline-none resize-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Кнопка 1</label>
                <input value={content.hero.cta_primary} onChange={e => updateHero('cta_primary', e.target.value)} className="w-full p-2.5 border border-gray-200 text-sm focus:border-[#C6A87C] outline-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Кнопка 2</label>
                <input value={content.hero.cta_secondary} onChange={e => updateHero('cta_secondary', e.target.value)} className="w-full p-2.5 border border-gray-200 text-sm focus:border-[#C6A87C] outline-none" />
              </div>
            </div>
            <h5 className="font-medium text-sm mt-5 mb-3">Статистика</h5>
            <div className="grid grid-cols-3 gap-4">
              {content.hero.stats.map((stat, i) => (
                <div key={i} className="space-y-2">
                  <input value={stat.value} onChange={e => updateStat(i, 'value', e.target.value)} placeholder="500+" className="w-full p-2 border border-gray-200 text-sm text-center font-bold focus:border-[#C6A87C] outline-none" />
                  <input value={stat.label} onChange={e => updateStat(i, 'label', e.target.value)} placeholder="Klientow" className="w-full p-2 border border-gray-200 text-xs text-center focus:border-[#C6A87C] outline-none" />
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="text-center">
            <button onClick={() => setShowPreview(!showPreview)} className="inline-flex items-center gap-2 px-5 py-2 bg-[#1A1A1A] text-white text-sm hover:bg-black transition-colors" data-testid="preview-toggle-btn">
              <Monitor size={14} /> {showPreview ? 'Скрыть предпросмотр' : 'Предпросмотр'}
            </button>
          </div>
          {showPreview && (
            <div className="border border-gray-200 overflow-hidden" data-testid="balia-preview-panel">
              <div className="bg-gray-800 text-white/60 text-[10px] px-3 py-1.5 flex items-center gap-2">
                <div className="flex gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-400" /><span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /><span className="w-2.5 h-2.5 rounded-full bg-green-400" /></div>
                wm-balia.pl
              </div>
              <div className="bg-[#0F1218] p-6 space-y-4">
                <div className="py-8 px-6 bg-gradient-to-b from-[#0F1218] to-[#1A1E27] text-center">
                  {content.hero.badge && <span className="inline-block text-[#D4AF37] text-[10px] tracking-[0.2em] uppercase mb-2 border border-[#D4AF37]/20 px-3 py-1">{content.hero.badge}</span>}
                  <h2 className="text-white text-2xl font-bold mb-2">{content.hero.headline || 'Luksus w Twoim Ogrodzie'}</h2>
                  <p className="text-white/40 text-sm mb-4">{content.hero.subheadline || '...'}</p>
                  <div className="flex justify-center gap-3">
                    <span className="px-4 py-2 bg-[#D4AF37] text-[#0F1218] text-xs font-semibold">{content.hero.cta_primary || 'CTA 1'}</span>
                    <span className="px-4 py-2 border border-white/20 text-white/60 text-xs">{content.hero.cta_secondary || 'CTA 2'}</span>
                  </div>
                  {content.hero.stats?.length >= 3 && (
                    <div className="flex justify-center gap-6 mt-4">
                      {content.hero.stats.map((s, i) => (
                        <div key={i}><div className="text-[#D4AF37] font-bold text-lg">{s.value || '—'}</div><div className="text-white/30 text-[10px]">{s.label}</div></div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Features Edit Tab */}
      {activeTab === 'features_edit' && (
        <div className="space-y-6">
          {/* Main features (3 large cards) */}
          <div className="p-5 border border-gray-100 bg-[#F9F9F7]">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Основные карточки (3 больших)</h4>
              <button onClick={() => addItem('promo_features', { icon: 'ShieldCheck', title: '', desc: '', active: true })}
                className="flex items-center gap-1 text-xs text-[#C6A87C] hover:underline"><Plus size={12} /> Добавить</button>
            </div>
            <div className="space-y-3">
              {(content.promo_features || []).map((f, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-white border border-gray-100" data-testid={`feature-card-${i}`}>
                  <button onClick={() => updateItem('promo_features', i, 'active', !f.active)}
                    className={`mt-1 flex-shrink-0 ${f.active ? 'text-green-600' : 'text-gray-300'}`}>
                    {f.active ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <div className="flex-1 grid grid-cols-[80px_1fr_1fr] gap-2">
                    <select value={f.icon} onChange={e => updateItem('promo_features', i, 'icon', e.target.value)}
                      className="p-1.5 border border-gray-200 text-xs focus:border-[#C6A87C] outline-none">
                      {ICON_LIST.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                    </select>
                    <input value={f.title} onChange={e => updateItem('promo_features', i, 'title', e.target.value)} placeholder="Заголовок"
                      className="p-1.5 border border-gray-200 text-xs focus:border-[#C6A87C] outline-none" />
                    <input value={f.desc} onChange={e => updateItem('promo_features', i, 'desc', e.target.value)} placeholder="Описание"
                      className="p-1.5 border border-gray-200 text-xs focus:border-[#C6A87C] outline-none" />
                  </div>
                  <button onClick={() => removeItem('promo_features', i)} className="text-red-300 hover:text-red-500 mt-1"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Optional features (4 small cards) */}
          <div className="p-5 border border-gray-100 bg-[#F9F9F7]">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Доп. опции (маленькие карточки)</h4>
              <button onClick={() => addItem('promo_options', { icon: 'Waves', title: '', desc: '', active: true })}
                className="flex items-center gap-1 text-xs text-[#C6A87C] hover:underline"><Plus size={12} /> Добавить</button>
            </div>
            <div className="space-y-3">
              {(content.promo_options || []).map((o, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-white border border-gray-100" data-testid={`option-card-${i}`}>
                  <button onClick={() => updateItem('promo_options', i, 'active', !o.active)}
                    className={`mt-1 flex-shrink-0 ${o.active ? 'text-green-600' : 'text-gray-300'}`}>
                    {o.active ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <div className="flex-1 grid grid-cols-[80px_1fr_1fr] gap-2">
                    <select value={o.icon} onChange={e => updateItem('promo_options', i, 'icon', e.target.value)}
                      className="p-1.5 border border-gray-200 text-xs focus:border-[#C6A87C] outline-none">
                      {ICON_LIST.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                    </select>
                    <input value={o.title} onChange={e => updateItem('promo_options', i, 'title', e.target.value)} placeholder="Заголовок"
                      className="p-1.5 border border-gray-200 text-xs focus:border-[#C6A87C] outline-none" />
                    <input value={o.desc} onChange={e => updateItem('promo_options', i, 'desc', e.target.value)} placeholder="Описание"
                      className="p-1.5 border border-gray-200 text-xs focus:border-[#C6A87C] outline-none" />
                  </div>
                  <button onClick={() => removeItem('promo_options', i)} className="text-red-300 hover:text-red-500 mt-1"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Badges row */}
          <div className="p-5 border border-gray-100 bg-[#F9F9F7]">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Бейджи (нижний ряд)</h4>
              <button onClick={() => addItem('promo_badges', { icon: 'Flag', title: '', active: true })}
                className="flex items-center gap-1 text-xs text-[#C6A87C] hover:underline"><Plus size={12} /> Добавить</button>
            </div>
            <div className="space-y-2">
              {(content.promo_badges || []).map((b, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 bg-white border border-gray-100" data-testid={`badge-card-${i}`}>
                  <button onClick={() => updateItem('promo_badges', i, 'active', !b.active)}
                    className={`flex-shrink-0 ${b.active ? 'text-green-600' : 'text-gray-300'}`}>
                    {b.active ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <select value={b.icon} onChange={e => updateItem('promo_badges', i, 'icon', e.target.value)}
                    className="p-1.5 border border-gray-200 text-xs focus:border-[#C6A87C] outline-none w-28">
                    {ICON_LIST.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                  </select>
                  <input value={b.title} onChange={e => updateItem('promo_badges', i, 'title', e.target.value)} placeholder="Текст бейджа"
                    className="flex-1 p-1.5 border border-gray-200 text-xs focus:border-[#C6A87C] outline-none" />
                  <button onClick={() => removeItem('promo_badges', i)} className="text-red-300 hover:text-red-500"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Promo Blocks Tab */}
      {activeTab === 'promo_blocks' && (
        <div className="p-5 border border-gray-100 bg-[#F9F9F7]">
          <h4 className="font-semibold mb-4">Промо-блоки (вкл/выкл + заголовки)</h4>
          <div className="space-y-3">
            {promoBlocks.map(block => {
              const b = content.promo_blocks?.[block.id] || { enabled: true };
              return (
                <div key={block.id} className="flex items-start gap-3 p-3 bg-white border border-gray-100" data-testid={`promo-block-${block.id}`}>
                  <button onClick={() => updatePromoBlock(block.id, 'enabled', !b.enabled)}
                    className={`mt-1 flex-shrink-0 ${b.enabled !== false ? 'text-green-600' : 'text-gray-300'}`}
                    data-testid={`promo-toggle-${block.id}`}>
                    {b.enabled !== false ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium mb-2">{block.label}</p>
                    {block.id !== 'about' && (
                      <div className="grid grid-cols-2 gap-2">
                        <input value={b.title || ''} onChange={e => updatePromoBlock(block.id, 'title', e.target.value)}
                          placeholder="Заголовок" className="p-2 border border-gray-200 text-xs focus:border-[#C6A87C] outline-none" />
                        <input value={b.subtitle || ''} onChange={e => updatePromoBlock(block.id, 'subtitle', e.target.value)}
                          placeholder="Подзаголовок" className="p-2 border border-gray-200 text-xs focus:border-[#C6A87C] outline-none" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section Order Tab */}
      {activeTab === 'section_order' && (
        <div className="p-5 border border-gray-100 bg-[#F9F9F7]">
          <h4 className="font-semibold mb-2">Порядок блоков на странице</h4>
          <p className="text-xs text-gray-500 mb-4">Перемещайте блоки стрелками. Hero всегда первый, Контакт всегда последний.</p>
          <div className="space-y-1.5">
            {(content.section_order || []).map((sectionId, idx) => {
              const isFixed = sectionId === 'hero' || sectionId === 'contact';
              return (
                <div key={sectionId} className={`flex items-center gap-3 p-3 border transition-colors ${isFixed ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-100 hover:border-[#C6A87C]/30'}`}
                  data-testid={`section-order-${sectionId}`}>
                  <GripVertical size={14} className="text-gray-300" />
                  <span className="flex-1 text-sm font-medium">{sectionLabels[sectionId] || sectionId}</span>
                  {!isFixed && (
                    <div className="flex gap-1">
                      <button onClick={() => moveSection(idx, -1)} disabled={idx === 0}
                        className="p-1 text-gray-400 hover:text-[#C6A87C] disabled:opacity-30" data-testid={`section-up-${sectionId}`}>
                        <ChevronUp size={16} />
                      </button>
                      <button onClick={() => moveSection(idx, 1)} disabled={idx === (content.section_order?.length || 0) - 1}
                        className="p-1 text-gray-400 hover:text-[#C6A87C] disabled:opacity-30" data-testid={`section-down-${sectionId}`}>
                        <ChevronDown size={16} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Exclusions Tab */}
      {activeTab === 'exclusions' && (
        <div className="p-5 border border-gray-100 bg-[#F9F9F7]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Исключения опций по моделям</h4>
            <button onClick={handleSaveExclusions} disabled={savingExcl}
              className="flex items-center gap-2 px-4 py-1.5 bg-[#C6A87C] text-white text-xs font-medium hover:bg-[#B09060] disabled:opacity-50"
              data-testid="save-exclusions-btn">
              {savingExcl ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Сохранить
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-3">Отметьте опции, которые НЕ показываются для конкретной модели.</p>

          {products.length === 0 ? (
            <p className="text-sm text-gray-400">Нет продуктов.</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                {products.map(p => (
                  <button key={p.id} onClick={() => setActiveExclModel(p.id === activeExclModel ? '' : p.id)}
                    className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                      activeExclModel === p.id ? 'bg-[#C6A87C] text-white border-[#C6A87C]' : 'border-gray-200 text-gray-600 hover:border-[#C6A87C]'
                    }`} data-testid={`excl-model-${p.id}`}>
                    {p.name}
                  </button>
                ))}
              </div>

              {activeExclModel && (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {apiCategories.filter(c => c.options?.length > 0).map(cat => (
                    <div key={cat.id} className="bg-white p-3 border border-gray-100">
                      <p className="text-xs font-semibold text-gray-600 mb-2">{cat.name}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.options.map(opt => {
                          const isExcluded = (exclusions[activeExclModel] || []).includes(opt.id);
                          return (
                            <button key={opt.id} onClick={() => toggleExclusion(activeExclModel, opt.id)}
                              className={`px-2 py-1 text-[11px] border transition-colors ${
                                isExcluded ? 'bg-red-50 border-red-300 text-red-600 line-through' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                              }`} data-testid={`excl-opt-${opt.id}`}>
                              {opt.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
