import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, GripVertical, Upload } from 'lucide-react';
import { Truck, TreePine, ShieldCheck, Headphones, Flame, Droplets, Wrench, Clock, Award, Star, Heart, Zap } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const ICON_OPTIONS = [
  { value: 'Truck', label: 'Доставка', Icon: Truck },
  { value: 'TreePine', label: 'Дерево', Icon: TreePine },
  { value: 'ShieldCheck', label: 'Гарантия', Icon: ShieldCheck },
  { value: 'Headphones', label: 'Поддержка', Icon: Headphones },
  { value: 'Flame', label: 'Огонь', Icon: Flame },
  { value: 'Droplets', label: 'Вода', Icon: Droplets },
  { value: 'Wrench', label: 'Сервис', Icon: Wrench },
  { value: 'Clock', label: 'Время', Icon: Clock },
  { value: 'Award', label: 'Награда', Icon: Award },
  { value: 'Star', label: 'Звезда', Icon: Star },
  { value: 'Heart', label: 'Сердце', Icon: Heart },
  { value: 'Zap', label: 'Молния', Icon: Zap },
];

export const SaunaPromoFeaturesAdmin = ({ authHeader, showMessage }) => {
  const [settings, setSettings] = useState({ items: [] });
  const [loading, setLoading] = useState(true);

  const fetchWithAuth = (url, opts = {}) => fetch(url, { ...opts, headers: { ...opts.headers, 'Authorization': authHeader, 'Content-Type': 'application/json' } });

  useEffect(() => {
    fetch(`${API}/api/settings/promo-features`)
      .then(r => r.json())
      .then(d => setSettings(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    try {
      await fetchWithAuth(`${API}/api/admin/settings/promo-features`, { method: 'PUT', body: JSON.stringify(settings) });
      showMessage('success', 'Сохранено');
    } catch { showMessage('error', 'Ошибка сохранения'); }
  };

  const addItem = () => {
    setSettings(prev => ({
      ...prev,
      items: [...prev.items, { id: `pf_${Date.now()}`, icon: 'Star', title_pl: '', title_en: '', desc_pl: '', desc_en: '' }]
    }));
  };

  const updateItem = (idx, field, value) => {
    setSettings(prev => ({
      ...prev,
      items: prev.items.map((it, i) => i === idx ? { ...it, [field]: value } : it)
    }));
  };

  const removeItem = (idx) => {
    setSettings(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Загрузка...</div>;

  return (
    <div data-testid="promo-features-admin">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#1A1A1A]">Преимущества (Dlaczego WM-Sauna)</h2>
        <button onClick={save} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]" data-testid="promo-features-save">
          <Save size={16} /> Сохранить
        </button>
      </div>

      <div className="space-y-4">
        {settings.items.map((item, idx) => {
          const IconComp = ICON_OPTIONS.find(o => o.value === item.icon)?.Icon || Star;
          return (
            <div key={item.id} className="border border-black/5 p-5 bg-[#F9F9F7]" data-testid={`promo-feature-${idx}`}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 bg-[#C6A87C]/10 flex items-center justify-center flex-shrink-0">
                  <IconComp size={20} className="text-[#C6A87C]" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-400 mb-1">Иконка</label>
                      <select value={item.icon} onChange={e => updateItem(idx, 'icon', e.target.value)} className="w-full p-2 border border-black/10 text-sm bg-white">
                        {ICON_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Заголовок (PL)</label>
                      <input type="text" value={item.title_pl} onChange={e => updateItem(idx, 'title_pl', e.target.value)} className="w-full p-2 border border-black/10 text-sm" placeholder="Gotowa sauna w 5-10 dni" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Заголовок (EN)</label>
                      <input type="text" value={item.title_en || ''} onChange={e => updateItem(idx, 'title_en', e.target.value)} className="w-full p-2 border border-black/10 text-sm" placeholder="Ready sauna in 5-10 days" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Описание (PL)</label>
                      <textarea value={item.desc_pl} onChange={e => updateItem(idx, 'desc_pl', e.target.value)} className="w-full p-2 border border-black/10 text-sm" rows={2} placeholder="Nie musisz nic montowac..." />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Описание (EN)</label>
                      <textarea value={item.desc_en || ''} onChange={e => updateItem(idx, 'desc_en', e.target.value)} className="w-full p-2 border border-black/10 text-sm" rows={2} placeholder="No assembly required..." />
                    </div>
                  </div>
                </div>
                <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 flex-shrink-0 mt-1" data-testid={`promo-feature-delete-${idx}`}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={addItem} className="mt-4 flex items-center gap-2 px-4 py-2 border border-dashed border-black/15 text-sm text-gray-500 hover:bg-gray-50 w-full justify-center" data-testid="promo-features-add">
        <Plus size={14} /> Добавить преимущество
      </button>
    </div>
  );
};
