import { useState, useEffect, useCallback } from 'react';
import { Save, Loader2 } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export const BaliaContentAdmin = ({ authHeader, showMessage }) => {
  const [content, setContent] = useState({
    hero: { badge: '', headline: '', subheadline: '', cta_primary: '', cta_secondary: '', stats: [{ value: '', label: '' }, { value: '', label: '' }, { value: '', label: '' }] },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/balia/content`).then(r => r.json()).then(data => {
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
        }));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`${API}/api/balia/content`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
      body: JSON.stringify(content),
    });
    if (res.ok) showMessage('success', 'Контент сохранён');
    else showMessage('error', 'Ошибка сохранения');
    setSaving(false);
  };

  const updateHero = (field, value) => setContent(p => ({ ...p, hero: { ...p.hero, [field]: value } }));
  const updateStat = (idx, field, value) => setContent(p => {
    const stats = [...p.hero.stats];
    stats[idx] = { ...stats[idx], [field]: value };
    return { ...p, hero: { ...p.hero, stats } };
  });

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#C6A87C]" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Контент страницы купелей</h3>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-[#C6A87C] text-white text-sm font-medium hover:bg-[#B09060] disabled:opacity-50">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Сохранить
        </button>
      </div>

      <div className="space-y-6">
        <div className="p-5 border border-gray-100 bg-[#F9F9F7]">
          <h4 className="font-semibold mb-4">Hero секция</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Badge (бейдж сверху)</label>
              <input value={content.hero.badge} onChange={e => updateHero('badge', e.target.value)} placeholder="Ręcznie robione w Polsce" className="w-full p-2.5 border border-gray-200 text-sm focus:border-[#C6A87C] outline-none" />
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
              <input value={content.hero.cta_primary} onChange={e => updateHero('cta_primary', e.target.value)} placeholder="Zaprojektuj swoją balię" className="w-full p-2.5 border border-gray-200 text-sm focus:border-[#C6A87C] outline-none" />
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
                <input value={stat.label} onChange={e => updateStat(i, 'label', e.target.value)} placeholder="Klientów" className="w-full p-2 border border-gray-200 text-xs focus:border-[#C6A87C] outline-none text-center" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
