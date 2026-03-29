import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export const PromoBannerAdmin = ({ authHeader, showMessage }) => {
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/settings/promo-banner`).then(r => r.json()).then(d => setData(d)).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/admin/settings/promo-banner`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: authHeader },
        body: JSON.stringify(data),
      });
      if (res.ok) showMessage('success', 'Промо-баннер сохранён');
      else showMessage('error', 'Ошибка сохранения');
    } catch { showMessage('error', 'Ошибка сохранения'); }
    setSaving(false);
  };

  if (!data) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#C6A87C]" /></div>;

  return (
    <div data-testid="promo-banner-admin">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#1A1A1A]">Промо-баннер</h2>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060] disabled:opacity-50" data-testid="save-promo-banner">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Сохранить
        </button>
      </div>
      <div className="space-y-4 bg-white border border-black/5 p-6">
        <div>
          <label className="block text-xs font-medium text-[#8C8C8C] mb-1">Бейдж (метка)</label>
          <input type="text" value={data.badge || ''} onChange={e => setData(p => ({ ...p, badge: e.target.value }))}
            className="w-full p-2.5 border border-black/10 text-sm" data-testid="promo-banner-badge" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8C8C8C] mb-1">Заголовок (строка 1)</label>
          <input type="text" value={data.title_line1 || ''} onChange={e => setData(p => ({ ...p, title_line1: e.target.value }))}
            className="w-full p-2.5 border border-black/10 text-sm" data-testid="promo-banner-title1" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8C8C8C] mb-1">Заголовок (строка 2 — золотой цвет)</label>
          <input type="text" value={data.title_line2 || ''} onChange={e => setData(p => ({ ...p, title_line2: e.target.value }))}
            className="w-full p-2.5 border border-black/10 text-sm" data-testid="promo-banner-title2" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8C8C8C] mb-1">Описание</label>
          <textarea rows={3} value={data.description || ''} onChange={e => setData(p => ({ ...p, description: e.target.value }))}
            className="w-full p-2.5 border border-black/10 text-sm resize-none" data-testid="promo-banner-desc" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8C8C8C] mb-1">Текст кнопки</label>
          <input type="text" value={data.button_text || ''} onChange={e => setData(p => ({ ...p, button_text: e.target.value }))}
            className="w-full p-2.5 border border-black/10 text-sm" data-testid="promo-banner-btn" />
        </div>
      </div>
    </div>
  );
};
