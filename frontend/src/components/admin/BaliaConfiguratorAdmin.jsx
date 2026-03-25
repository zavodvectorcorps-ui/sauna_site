import { useState, useEffect, useCallback } from 'react';
import { Save, Loader2, Eye, EyeOff } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export const BaliaConfiguratorAdmin = ({ authHeader, showMessage }) => {
  const [settings, setSettings] = useState({ hiddenModels: [], hiddenCategories: [], hiddenOptions: [], categoryDescriptions: {} });
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/balia/configurator-settings`).then(r => r.json()),
      fetch(`${API}/api/balia/calculator/prices`).then(r => r.json()),
    ]).then(([s, p]) => {
      setSettings(s);
      setPriceData(p);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`${API}/api/balia/configurator-settings`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
      body: JSON.stringify(settings),
    });
    if (res.ok) showMessage('success', 'Настройки конфигуратора сохранены');
    else showMessage('error', 'Ошибка сохранения');
    setSaving(false);
  };

  const toggleModel = (id) => setSettings(p => ({
    ...p, hiddenModels: p.hiddenModels.includes(id) ? p.hiddenModels.filter(x => x !== id) : [...p.hiddenModels, id]
  }));

  const toggleCategory = (id) => setSettings(p => ({
    ...p, hiddenCategories: p.hiddenCategories.includes(id) ? p.hiddenCategories.filter(x => x !== id) : [...p.hiddenCategories, id]
  }));

  const toggleOption = (id) => setSettings(p => ({
    ...p, hiddenOptions: p.hiddenOptions.includes(id) ? p.hiddenOptions.filter(x => x !== id) : [...p.hiddenOptions, id]
  }));

  const setCatDesc = (catId, desc) => setSettings(p => ({
    ...p, categoryDescriptions: { ...p.categoryDescriptions, [catId]: desc }
  }));

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#C6A87C]" /></div>;

  const models = priceData?.models?.filter(m => m.active !== false) || [];
  const categories = priceData?.categories || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Настройки конфигуратора купелей</h3>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-[#C6A87C] text-white text-sm font-medium hover:bg-[#B09060] disabled:opacity-50">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Сохранить
        </button>
      </div>

      {/* Models */}
      <div className="mb-8">
        <h4 className="font-semibold mb-3">Модели ({models.length})</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {models.map(m => {
            const hidden = settings.hiddenModels.includes(m.id);
            return (
              <button key={m.id} onClick={() => toggleModel(m.id)}
                className={`border p-3 text-left text-sm transition-all ${hidden ? 'border-red-200 bg-red-50 opacity-50' : 'border-green-200 bg-green-50'}`}
              >
                {m.imageUrl && <img src={m.imageUrl} alt="" className="w-full aspect-[4/3] object-cover mb-2" />}
                <div className="flex items-center justify-between gap-1">
                  <span className="truncate font-medium">{m.namePl || m.name}</span>
                  {hidden ? <EyeOff size={14} className="text-red-400 flex-shrink-0" /> : <Eye size={14} className="text-green-500 flex-shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories and options */}
      <div>
        <h4 className="font-semibold mb-3">Категории опций ({categories.length})</h4>
        <div className="space-y-4">
          {categories.map(cat => {
            const catHidden = settings.hiddenCategories.includes(cat.id);
            return (
              <div key={cat.id} className={`border p-4 ${catHidden ? 'border-red-200 bg-red-50' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between mb-2">
                  <button onClick={() => toggleCategory(cat.id)} className="flex items-center gap-2 font-medium text-sm">
                    {catHidden ? <EyeOff size={14} className="text-red-400" /> : <Eye size={14} className="text-green-500" />}
                    {cat.namePl || cat.name}
                    <span className="text-gray-400 font-normal">({(cat.options || []).length} опций)</span>
                  </button>
                </div>
                <input value={settings.categoryDescriptions[cat.id] || ''} onChange={e => setCatDesc(cat.id, e.target.value)}
                  placeholder="Описание категории (hint)" className="w-full p-2 border border-gray-200 text-xs focus:border-[#C6A87C] outline-none mb-2" />
                {!catHidden && (
                  <div className="flex flex-wrap gap-2">
                    {(cat.options || []).filter(o => o.active !== false).map(opt => {
                      const optHidden = settings.hiddenOptions.includes(opt.id);
                      return (
                        <button key={opt.id} onClick={() => toggleOption(opt.id)}
                          className={`text-xs px-2 py-1 border transition-all ${optHidden ? 'border-red-200 bg-red-50 text-red-500 line-through' : 'border-gray-200 bg-white'}`}
                        >
                          {opt.namePl || opt.name} {opt.price > 0 && `(+${opt.price} zł)`}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
