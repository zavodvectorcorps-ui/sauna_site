import { useState, useEffect } from 'react';
import { Save, Loader2, Eye, EyeOff, X, Plus } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

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
  });
  const [exclusions, setExclusions] = useState({});
  const [products, setProducts] = useState([]);
  const [apiCategories, setApiCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingExcl, setSavingExcl] = useState(false);
  const [activeExclModel, setActiveExclModel] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/balia/content`).then(r => r.json()).catch(() => ({})),
      fetch(`${API}/api/balia/option-exclusions`).then(r => r.json()).catch(() => ({ exclusions: {} })),
      fetch(`${API}/api/balia/products`).then(r => r.json()).catch(() => []),
      fetch(`${API}/api/balia/calculator/prices`).then(r => r.json()).catch(() => ({ categories: [] })),
    ]).then(([data, exclData, prods, api]) => {
      if (data?.hero) {
        setContent(prev => ({
          hero: {
            badge: data.hero?.badge || prev.hero.badge,
            headline: data.hero?.headline || prev.hero.headline,
            subheadline: data.hero?.subheadline || prev.hero.subheadline,
            cta_primary: data.hero?.cta_primary || prev.hero.cta_primary,
            cta_secondary: data.hero?.cta_secondary || prev.hero.cta_secondary,
            stats: data.hero?.stats?.length >= 3 ? data.hero.stats : prev.hero.stats,
          },
          promo_blocks: data.promo_blocks || prev.promo_blocks,
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
    if (res.ok) showMessage('success', 'Kontент сохранён');
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
    else showMessage('error', 'Ошибка сохранения');
    setSavingExcl(false);
  };

  const updateHero = (field, value) => setContent(p => ({ ...p, hero: { ...p.hero, [field]: value } }));
  const updateStat = (idx, field, value) => setContent(p => {
    const stats = [...p.hero.stats];
    stats[idx] = { ...stats[idx], [field]: value };
    return { ...p, hero: { ...p.hero, stats } };
  });

  const updatePromoBlock = (blockId, field, value) => {
    setContent(p => ({
      ...p,
      promo_blocks: {
        ...p.promo_blocks,
        [blockId]: { ...(p.promo_blocks?.[blockId] || {}), [field]: value },
      },
    }));
  };

  const toggleExclusion = (modelId, optionId) => {
    setExclusions(prev => {
      const modelExcl = [...(prev[modelId] || [])];
      const idx = modelExcl.indexOf(optionId);
      if (idx >= 0) modelExcl.splice(idx, 1);
      else modelExcl.push(optionId);
      return { ...prev, [modelId]: modelExcl };
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

  const modelsWithApi = products.filter(p => p.api_model_id);
  const allOptions = apiCategories.flatMap(c => (c.options || []).map(o => ({ ...o, catName: c.name, catId: c.id })));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Контент страницы купелей</h3>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-[#C6A87C] text-white text-sm font-medium hover:bg-[#B09060] disabled:opacity-50" data-testid="balia-content-save">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Сохранить
        </button>
      </div>

      <div className="space-y-6">
        {/* Hero Section */}
        <div className="p-5 border border-gray-100 bg-[#F9F9F7]">
          <h4 className="font-semibold mb-4">Hero секция</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Badge (бейдж сверху)</label>
              <input value={content.hero.badge} onChange={e => updateHero('badge', e.target.value)} placeholder="Recznie robione w Polsce" className="w-full p-2.5 border border-gray-200 text-sm focus:border-[#C6A87C] outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Заголовок</label>
              <input value={content.hero.headline} onChange={e => updateHero('headline', e.target.value)} placeholder="Luksus w Twoim Ogrodzie" className="w-full p-2.5 border border-gray-200 text-sm focus:border-[#C6A87C] outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Подзаголовок</label>
              <textarea value={content.hero.subheadline} onChange={e => updateHero('subheadline', e.target.value)} rows={2} className="w-full p-2.5 border border-gray-200 text-sm focus:border-[#C6A87C] outline-none resize-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Кнопка 1 (основная)</label>
              <input value={content.hero.cta_primary} onChange={e => updateHero('cta_primary', e.target.value)} placeholder="Zaprojektuj swoja balie" className="w-full p-2.5 border border-gray-200 text-sm focus:border-[#C6A87C] outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Кнопка 2 (дополнительная)</label>
              <input value={content.hero.cta_secondary} onChange={e => updateHero('cta_secondary', e.target.value)} placeholder="Zobacz produkty" className="w-full p-2.5 border border-gray-200 text-sm focus:border-[#C6A87C] outline-none" />
            </div>
          </div>
          <h5 className="font-medium text-sm mt-6 mb-3">Статистика (3 блока)</h5>
          <div className="grid grid-cols-3 gap-4">
            {content.hero.stats.map((stat, i) => (
              <div key={i} className="space-y-2">
                <input value={stat.value} onChange={e => updateStat(i, 'value', e.target.value)} placeholder="500+" className="w-full p-2 border border-gray-200 text-sm focus:border-[#C6A87C] outline-none text-center font-bold" />
                <input value={stat.label} onChange={e => updateStat(i, 'label', e.target.value)} placeholder="Klientow" className="w-full p-2 border border-gray-200 text-xs focus:border-[#C6A87C] outline-none text-center" />
              </div>
            ))}
          </div>
        </div>

        {/* Promo Blocks Management */}
        <div className="p-5 border border-gray-100 bg-[#F9F9F7]">
          <h4 className="font-semibold mb-4">Промо-блоки (вкл/выкл + заголовки)</h4>
          <div className="space-y-3">
            {promoBlocks.map(block => {
              const b = content.promo_blocks?.[block.id] || { enabled: true };
              return (
                <div key={block.id} className="flex items-start gap-3 p-3 bg-white border border-gray-100" data-testid={`promo-block-${block.id}`}>
                  <button
                    onClick={() => updatePromoBlock(block.id, 'enabled', !b.enabled)}
                    className={`mt-1 flex-shrink-0 ${b.enabled ? 'text-green-600' : 'text-gray-300'}`}
                    data-testid={`promo-toggle-${block.id}`}
                  >
                    {b.enabled ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium mb-2">{block.label}</p>
                    {block.id !== 'about' && (
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={b.title || ''}
                          onChange={e => updatePromoBlock(block.id, 'title', e.target.value)}
                          placeholder="Заголовок (пусто = по умолчанию)"
                          className="p-2 border border-gray-200 text-xs focus:border-[#C6A87C] outline-none"
                        />
                        <input
                          value={b.subtitle || ''}
                          onChange={e => updatePromoBlock(block.id, 'subtitle', e.target.value)}
                          placeholder="Подзаголовок"
                          className="p-2 border border-gray-200 text-xs focus:border-[#C6A87C] outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Option Exclusions */}
        <div className="p-5 border border-gray-100 bg-[#F9F9F7]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Исключения опций по моделям</h4>
            <button onClick={handleSaveExclusions} disabled={savingExcl} className="flex items-center gap-2 px-4 py-1.5 bg-[#C6A87C] text-white text-xs font-medium hover:bg-[#B09060] disabled:opacity-50" data-testid="save-exclusions-btn">
              {savingExcl ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Сохранить
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-3">Отметьте опции, которые НЕ должны показываться для конкретной модели купели в карточке товара.</p>

          {modelsWithApi.length === 0 ? (
            <p className="text-sm text-gray-400">Нет продуктов с привязанным API model ID.</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                {modelsWithApi.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setActiveExclModel(p.api_model_id === activeExclModel ? '' : p.api_model_id)}
                    className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                      activeExclModel === p.api_model_id
                        ? 'bg-[#C6A87C] text-white border-[#C6A87C]'
                        : 'border-gray-200 text-gray-600 hover:border-[#C6A87C]'
                    }`}
                    data-testid={`excl-model-${p.api_model_id}`}
                  >
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
                            <button
                              key={opt.id}
                              onClick={() => toggleExclusion(activeExclModel, opt.id)}
                              className={`px-2 py-1 text-[11px] border transition-colors ${
                                isExcluded
                                  ? 'bg-red-50 border-red-300 text-red-600 line-through'
                                  : 'border-gray-200 text-gray-500 hover:border-gray-300'
                              }`}
                              data-testid={`excl-opt-${opt.id}`}
                            >
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
      </div>
    </div>
  );
};
