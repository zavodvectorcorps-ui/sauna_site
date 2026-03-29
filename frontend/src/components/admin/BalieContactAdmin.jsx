import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export const BalieContactAdmin = ({ authHeader, showMessage }) => {
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/settings/balie-contact`).then(r => r.json()).then(d => setData(d)).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/admin/settings/balie-contact`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: authHeader },
        body: JSON.stringify(data),
      });
      if (res.ok) showMessage('success', 'Контакты купелей сохранены');
      else showMessage('error', 'Ошибка сохранения');
    } catch { showMessage('error', 'Ошибка сохранения'); }
    setSaving(false);
  };

  if (!data) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#C6A87C]" /></div>;

  return (
    <div data-testid="balie-contact-admin">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#1A1A1A]">Контакты (Купели)</h2>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060] disabled:opacity-50" data-testid="save-balie-contact">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Сохранить
        </button>
      </div>
      <div className="space-y-4 bg-white border border-black/5 p-6">
        <div>
          <label className="block text-xs font-medium text-[#8C8C8C] mb-1">Заголовок</label>
          <input type="text" value={data.title || ''} onChange={e => setData(p => ({ ...p, title: e.target.value }))}
            className="w-full p-2.5 border border-black/10 text-sm" data-testid="balie-contact-title" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8C8C8C] mb-1">Подзаголовок</label>
          <input type="text" value={data.subtitle || ''} onChange={e => setData(p => ({ ...p, subtitle: e.target.value }))}
            className="w-full p-2.5 border border-black/10 text-sm" data-testid="balie-contact-subtitle" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#8C8C8C] mb-1">Телефон</label>
            <input type="text" value={data.phone || ''} onChange={e => setData(p => ({ ...p, phone: e.target.value }))}
              className="w-full p-2.5 border border-black/10 text-sm" data-testid="balie-contact-phone-input" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8C8C8C] mb-1">Email</label>
            <input type="email" value={data.email || ''} onChange={e => setData(p => ({ ...p, email: e.target.value }))}
              className="w-full p-2.5 border border-black/10 text-sm" data-testid="balie-contact-email-input" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8C8C8C] mb-1">Адрес</label>
            <input type="text" value={data.address || ''} onChange={e => setData(p => ({ ...p, address: e.target.value }))}
              className="w-full p-2.5 border border-black/10 text-sm" data-testid="balie-contact-address-input" />
          </div>
        </div>
      </div>
    </div>
  );
};
