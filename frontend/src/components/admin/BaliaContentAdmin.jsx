import { useState, useEffect, useCallback } from 'react';
import { Save, Loader2, Eye, EyeOff, Monitor, ChevronUp, ChevronDown, Plus, Trash2, GripVertical, Upload, Image, X, Video } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const ICON_LIST = ['ShieldCheck','Hammer','Leaf','Truck','Wrench','Award','Flag','Waves','Wind','Lightbulb','ThermometerSun'];

const DEFAULT_SCHEMATIC = {
  title: 'Budowa Balii',
  subtitle: 'Kazdy element jest starannie zaprojektowany i wykonany z najwyzszej jakosci materialow',
  image: null,
  parts: [
    { id: 'bowl', label: 'Gleboka misa — 100 cm', desc: 'Idealny rozmiar dla osob wyzszych.' },
    { id: 'frame', label: 'Metalowy stelaz', desc: 'Odporny na wilgoc, korozje i odksztalcenia.' },
    { id: 'cladding', label: 'Termodrewno i ukryte mocowania', desc: 'Odpornosc na pekanie i wysychanie.' },
    { id: 'stove', label: 'Mocne piece z podwojnym obiegiem', desc: 'Nagrzewanie w 1-2h, nawet przy -20°C.' },
    { id: 'warranty', label: '10 lat gwarancji + 25 lat trwalosci', desc: 'Budowane na pokolenia.' },
  ],
};

const DEFAULT_STOVE = {
  title: 'Jak dziala piec?',
  subtitle: 'Oferujemy dwa typy piecow na drewno ze stali nierdzewnej V4A.',
  types: [
    { id: 'internal', title: 'Piec wewnetrzny', subtitle: 'Zintegrowany w balii', image: null, features: ['Montaz wewnatrz misy balii','Bezposredni kontakt z woda','Kompaktowa konstrukcja','Idealny dla mniejszych przestrzeni'], pros: ['Szybsze nagrzewanie','Mniej miejsca na zewnatrz'], cons: ['Mniejsza przestrzen kapielowa'] },
    { id: 'external', title: 'Piec zewnetrzny', subtitle: 'Z podwojnym obiegiem wody', image: null, features: ['Montaz poza misa balii','Podwojny obieg wody','Pelna przestrzen kapielowa','Latwiejszy dostep do palenia'], pros: ['Wieksza przestrzen w balii','Wygodniejsze dolozenie drewna'], cons: ['Wymaga wiecej miejsca na zewnatrz'] },
  ],
};

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
    schematic: DEFAULT_SCHEMATIC,
    stove_scheme: DEFAULT_STOVE,
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
          schematic: data.schematic ? { ...prev.schematic, ...data.schematic } : prev.schematic,
          stove_scheme: data.stove_scheme ? { ...prev.stove_scheme, ...data.stove_scheme, types: data.stove_scheme.types?.length ? data.stove_scheme.types.map((t,i) => ({...(prev.stove_scheme.types[i] || {}), ...t})) : prev.stove_scheme.types } : prev.stove_scheme,
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

  const [videoUploading, setVideoUploading] = useState(false);
  const handleHeroImageUpload = async (file, callback) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${API}/api/admin/upload`, { method: 'POST', body: formData, headers: { 'Authorization': authHeader } });
      const data = await res.json();
      callback(`${API}${data.url}`);
      showMessage('success', 'Фото загружено');
    } catch { showMessage('error', 'Ошибка загрузки'); }
  };
  const handleHeroVideoUpload = async (file, callback) => {
    const formData = new FormData();
    formData.append('file', file);
    setVideoUploading(true);
    try {
      const res = await fetch(`${API}/api/admin/upload-video`, { method: 'POST', body: formData, headers: { 'Authorization': authHeader } });
      const data = await res.json();
      callback(`${API}${data.url}`);
      showMessage('success', 'Видео загружено');
    } catch { showMessage('error', 'Ошибка загрузки видео'); }
    setVideoUploading(false);
  };
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

  // Schematic helpers
  const updateSchematic = (field, value) => setContent(p => ({ ...p, schematic: { ...p.schematic, [field]: value } }));
  const updateSchematicPart = (idx, field, value) => {
    setContent(p => {
      const parts = [...(p.schematic.parts || [])];
      parts[idx] = { ...parts[idx], [field]: value };
      return { ...p, schematic: { ...p.schematic, parts } };
    });
  };
  const addSchematicPart = () => {
    setContent(p => ({
      ...p, schematic: { ...p.schematic, parts: [...(p.schematic.parts || []), { id: `part_${Date.now()}`, label: '', desc: '' }] },
    }));
  };
  const removeSchematicPart = (idx) => {
    setContent(p => ({ ...p, schematic: { ...p.schematic, parts: p.schematic.parts.filter((_, i) => i !== idx) } }));
  };

  // Stove scheme helpers
  const updateStoveScheme = (field, value) => setContent(p => ({ ...p, stove_scheme: { ...p.stove_scheme, [field]: value } }));
  const updateStoveType = (idx, field, value) => {
    setContent(p => {
      const types = [...(p.stove_scheme.types || [])];
      types[idx] = { ...types[idx], [field]: value };
      return { ...p, stove_scheme: { ...p.stove_scheme, types } };
    });
  };
  const updateStoveFeature = (typeIdx, featureIdx, value) => {
    setContent(p => {
      const types = [...(p.stove_scheme.types || [])];
      const features = [...(types[typeIdx].features || [])];
      features[featureIdx] = value;
      types[typeIdx] = { ...types[typeIdx], features };
      return { ...p, stove_scheme: { ...p.stove_scheme, types } };
    });
  };
  const addStoveFeature = (typeIdx) => {
    setContent(p => {
      const types = [...(p.stove_scheme.types || [])];
      types[typeIdx] = { ...types[typeIdx], features: [...(types[typeIdx].features || []), ''] };
      return { ...p, stove_scheme: { ...p.stove_scheme, types } };
    });
  };
  const removeStoveFeature = (typeIdx, featureIdx) => {
    setContent(p => {
      const types = [...(p.stove_scheme.types || [])];
      types[typeIdx] = { ...types[typeIdx], features: types[typeIdx].features.filter((_, i) => i !== featureIdx) };
      return { ...p, stove_scheme: { ...p.stove_scheme, types } };
    });
  };

  // Image upload to Cloudinary
  const [uploading, setUploading] = useState(null);
  const handleImageUpload = async (file, target) => {
    setUploading(target);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${API}/api/balia/schematic/upload`, {
        method: 'POST', headers: { 'Authorization': authHeader }, body: formData,
      });
      const data = await res.json();
      if (data.url) {
        if (target === 'schematic') {
          updateSchematic('image', data.url);
        } else if (target.startsWith('stove_')) {
          const idx = parseInt(target.split('_')[1]);
          updateStoveType(idx, 'image', data.url);
        }
        showMessage('success', 'Фото загружено');
      }
    } catch {
      showMessage('error', 'Ошибка загрузки');
    }
    setUploading(null);
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
    { id: 'schemes', label: 'Схемы (купель + печь)' },
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
          {/* Background settings */}
          <div className="p-5 border border-gray-100 bg-[#F9F9F7]">
            <h4 className="font-semibold mb-4">Фон Hero</h4>
            {/* Mode selector */}
            <div className="flex gap-3 mb-4">
              <button type="button" onClick={() => updateHero('bg_mode', 'photo')}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border transition-all ${(content.hero.bg_mode || 'photo') === 'photo' ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]' : 'border-gray-200 text-gray-400 hover:border-[#D4AF37]/50'}`}
                data-testid="balia-hero-bg-mode-photo">
                <Image size={15} /> Фото
              </button>
              <button type="button" onClick={() => updateHero('bg_mode', 'video')}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border transition-all ${content.hero.bg_mode === 'video' ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]' : 'border-gray-200 text-gray-400 hover:border-[#D4AF37]/50'}`}
                data-testid="balia-hero-bg-mode-video">
                <Video size={15} /> Видео
              </button>
            </div>
            {/* Background image */}
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-1">Фоновое фото {content.hero.bg_mode === 'video' && <span className="text-gray-400">(заглушка пока грузится видео)</span>}</label>
              <div className="flex gap-2">
                <input type="url" value={content.hero.background_image || ''} onChange={e => updateHero('background_image', e.target.value)} placeholder="URL фото" className="flex-1 p-2 border border-gray-200 text-sm" data-testid="balia-hero-bg-image-url" />
                <label className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-white text-sm cursor-pointer hover:bg-black flex-shrink-0">
                  <Upload size={14} />
                  <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleHeroImageUpload(e.target.files[0], url => updateHero('background_image', url))} />
                </label>
                {content.hero.background_image && <button onClick={() => updateHero('background_image', '')} className="p-2 text-red-400 hover:text-red-600"><X size={14} /></button>}
              </div>
              {content.hero.background_image && <img src={content.hero.background_image} alt="Preview" className="mt-2 h-24 object-cover border border-gray-200" />}
            </div>
            {/* Background video */}
            <div className={content.hero.bg_mode !== 'video' ? 'opacity-40 pointer-events-none' : ''}>
              <label className="block text-xs text-gray-500 mb-1">Фоновое видео (MP4) — автоплей, без звука, зацикленное</label>
              <div className="flex gap-2">
                <input type="url" value={content.hero.background_video || ''} onChange={e => updateHero('background_video', e.target.value)} placeholder="URL видео (mp4)" className="flex-1 p-2 border border-gray-200 text-sm" data-testid="balia-hero-bg-video-url" />
                <label className={`flex items-center gap-2 px-4 py-2 text-white text-sm cursor-pointer flex-shrink-0 ${videoUploading ? 'bg-gray-400' : 'bg-[#1A1A1A] hover:bg-black'}`}>
                  <Upload size={14} /> {videoUploading ? 'Загрузка...' : 'Загрузить'}
                  <input type="file" accept="video/mp4" className="hidden" disabled={videoUploading} onChange={e => e.target.files?.[0] && handleHeroVideoUpload(e.target.files[0], url => updateHero('background_video', url))} />
                </label>
                {content.hero.background_video && <button onClick={() => updateHero('background_video', '')} className="p-2 text-red-400 hover:text-red-600"><X size={14} /></button>}
              </div>
              {content.hero.background_video && (
                <video src={content.hero.background_video} muted loop className="mt-2 h-24 object-cover border border-gray-200" onMouseEnter={e => e.target.play()} onMouseLeave={e => { e.target.pause(); e.target.currentTime = 0; }} />
              )}
            </div>
          </div>

          <div className="p-5 border border-gray-100 bg-[#F9F9F7]">
            <h4 className="font-semibold mb-4">Hero секция — тексты</h4>
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


      {/* Schemes Tab */}
      {activeTab === 'schemes' && (
        <div className="space-y-6">
          {/* Schematic (Budowa Balii) */}
          <div className="p-5 border border-gray-100 bg-[#F9F9F7]">
            <h4 className="font-semibold mb-4">Схема купели (Budowa Balii)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Заголовок</label>
                <input value={content.schematic.title} onChange={e => updateSchematic('title', e.target.value)} className="w-full p-2.5 border border-gray-200 text-sm focus:border-[#C6A87C] outline-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Подзаголовок</label>
                <input value={content.schematic.subtitle} onChange={e => updateSchematic('subtitle', e.target.value)} className="w-full p-2.5 border border-gray-200 text-sm focus:border-[#C6A87C] outline-none" />
              </div>
            </div>

            {/* Image: SVG style selector + custom upload */}
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-2">Изображение схемы</label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[
                  { id: 'default', label: 'Классическая' },
                  { id: 'minimal', label: 'Минимализм' },
                  { id: 'blueprint', label: 'Чертёж' },
                ].map(style => (
                  <button key={style.id} onClick={() => { updateSchematic('svg_style', style.id); updateSchematic('image', null); }}
                    className={`p-2 border text-xs font-medium transition-colors ${
                      !content.schematic.image && (content.schematic.svg_style || 'default') === style.id
                        ? 'bg-[#C6A87C] text-white border-[#C6A87C]'
                        : 'border-gray-200 text-gray-500 hover:border-[#C6A87C]'
                    }`} data-testid={`schematic-style-${style.id}`}>
                    {style.label}
                  </button>
                ))}
                <label className={`p-2 border text-xs font-medium transition-colors cursor-pointer text-center ${
                  content.schematic.image ? 'bg-[#C6A87C] text-white border-[#C6A87C]' : 'border-gray-200 text-gray-500 hover:border-[#C6A87C]'
                }`} data-testid="schematic-upload-btn">
                  {uploading === 'schematic' ? <Loader2 size={14} className="animate-spin inline" /> : <Upload size={14} className="inline mr-1" />}
                  Своё фото
                  <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && handleImageUpload(e.target.files[0], 'schematic')} />
                </label>
              </div>
              {content.schematic.image && (
                <div className="relative w-40 h-28 border border-gray-200 overflow-hidden bg-[#1A1E27] inline-block">
                  <img src={content.schematic.image} alt="schema" className="w-full h-full object-contain" />
                  <button onClick={() => updateSchematic('image', null)} className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full" data-testid="schematic-remove-image">
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>

            {/* Parts */}
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-sm">Пункты описания</h5>
              <button onClick={addSchematicPart} className="flex items-center gap-1 text-xs text-[#C6A87C] hover:underline"><Plus size={12} /> Добавить</button>
            </div>
            <div className="space-y-2">
              {(content.schematic.parts || []).map((part, i) => (
                <div key={part.id || i} className="flex items-start gap-2 p-2.5 bg-white border border-gray-100" data-testid={`schematic-part-${i}`}>
                  <span className="w-6 h-6 bg-[#C6A87C] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">{i+1}</span>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input value={part.label} onChange={e => updateSchematicPart(i, 'label', e.target.value)} placeholder="Заголовок"
                      className="p-2 border border-gray-200 text-xs focus:border-[#C6A87C] outline-none" />
                    <input value={part.desc} onChange={e => updateSchematicPart(i, 'desc', e.target.value)} placeholder="Описание"
                      className="p-2 border border-gray-200 text-xs focus:border-[#C6A87C] outline-none" />
                  </div>
                  <button onClick={() => removeSchematicPart(i)} className="text-red-300 hover:text-red-500 mt-1"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Stove Scheme */}
          <div className="p-5 border border-gray-100 bg-[#F9F9F7]">
            <h4 className="font-semibold mb-4">Схема печи (Jak działa piec?)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Заголовок секции</label>
                <input value={content.stove_scheme.title} onChange={e => updateStoveScheme('title', e.target.value)} className="w-full p-2.5 border border-gray-200 text-sm focus:border-[#C6A87C] outline-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Подзаголовок</label>
                <input value={content.stove_scheme.subtitle} onChange={e => updateStoveScheme('subtitle', e.target.value)} className="w-full p-2.5 border border-gray-200 text-sm focus:border-[#C6A87C] outline-none" />
              </div>
            </div>

            {(content.stove_scheme.types || []).map((stove, si) => (
              <div key={stove.id} className="p-4 mb-4 bg-white border border-gray-100" data-testid={`stove-type-edit-${stove.id}`}>
                <h5 className="font-medium text-sm mb-3">{stove.id === 'internal' ? 'Внутренний пием' : 'Внешний пием'}</h5>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Заголовок</label>
                    <input value={stove.title} onChange={e => updateStoveType(si, 'title', e.target.value)} className="w-full p-2 border border-gray-200 text-xs focus:border-[#C6A87C] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Подзаголовок</label>
                    <input value={stove.subtitle} onChange={e => updateStoveType(si, 'subtitle', e.target.value)} className="w-full p-2 border border-gray-200 text-xs focus:border-[#C6A87C] outline-none" />
                  </div>
                </div>

                {/* Image: SVG style + upload */}
                <div className="mb-3">
                  <label className="block text-xs text-gray-500 mb-2">Изображение</label>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {[
                      { id: 'default', label: 'Классическая' },
                      { id: 'minimal', label: 'Минимализм' },
                      { id: 'detailed', label: 'Детальная' },
                    ].map(style => (
                      <button key={style.id} onClick={() => { updateStoveType(si, 'svg_style', style.id); updateStoveType(si, 'image', null); }}
                        className={`px-2 py-1 border text-[11px] font-medium transition-colors ${
                          !stove.image && (stove.svg_style || 'default') === style.id
                            ? 'bg-[#C6A87C] text-white border-[#C6A87C]'
                            : 'border-gray-200 text-gray-500 hover:border-[#C6A87C]'
                        }`} data-testid={`stove-style-${stove.id}-${style.id}`}>
                        {style.label}
                      </button>
                    ))}
                    <label className={`px-2 py-1 border text-[11px] font-medium transition-colors cursor-pointer ${
                      stove.image ? 'bg-[#C6A87C] text-white border-[#C6A87C]' : 'border-gray-200 text-gray-500 hover:border-[#C6A87C]'
                    }`} data-testid={`stove-upload-${stove.id}`}>
                      {uploading === `stove_${si}` ? <Loader2 size={10} className="animate-spin inline" /> : <Upload size={10} className="inline mr-1" />}
                      Фото
                      <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && handleImageUpload(e.target.files[0], `stove_${si}`)} />
                    </label>
                  </div>
                  {stove.image && (
                    <div className="relative w-36 h-24 border border-gray-200 overflow-hidden bg-[#1A1E27] inline-block">
                      <img src={stove.image} alt={stove.title} className="w-full h-full object-contain" />
                      <button onClick={() => updateStoveType(si, 'image', null)} className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full"><X size={12} /></button>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-gray-500 font-medium">Характеристики</label>
                    <button onClick={() => addStoveFeature(si)} className="text-[10px] text-[#C6A87C] hover:underline flex items-center gap-0.5"><Plus size={10} /> Добавить</button>
                  </div>
                  <div className="space-y-1.5">
                    {(stove.features || []).map((f, fi) => (
                      <div key={fi} className="flex items-center gap-2">
                        <input value={f} onChange={e => updateStoveFeature(si, fi, e.target.value)}
                          className="flex-1 p-1.5 border border-gray-200 text-xs focus:border-[#C6A87C] outline-none" />
                        <button onClick={() => removeStoveFeature(si, fi)} className="text-red-300 hover:text-red-500"><Trash2 size={12} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pros & Cons */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Преимущества (через запятую)</label>
                    <textarea value={(stove.pros || []).join(', ')} onChange={e => updateStoveType(si, 'pros', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                      rows={2} className="w-full p-2 border border-gray-200 text-xs focus:border-[#C6A87C] outline-none resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Недостатки (через запятую)</label>
                    <textarea value={(stove.cons || []).join(', ')} onChange={e => updateStoveType(si, 'cons', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                      rows={2} className="w-full p-2 border border-gray-200 text-xs focus:border-[#C6A87C] outline-none resize-none" />
                  </div>
                </div>
              </div>
            ))}
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
