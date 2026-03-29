import { useState, useEffect } from 'react';
import { Save, Loader2, Plus, Trash2 } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export const BalieInstallmentAdmin = ({ authHeader, showMessage }) => {
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/settings/balie-installment`).then(r => r.json()).then(d => setData(d)).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/admin/settings/balie-installment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: authHeader },
        body: JSON.stringify(data),
      });
      if (res.ok) showMessage('success', 'Рассрочка купелей сохранена');
      else showMessage('error', 'Ошибка сохранения');
    } catch { showMessage('error', 'Ошибка сохранения'); }
    setSaving(false);
  };

  const updateItem = (index, field, value) => {
    setData(p => {
      const items = [...(p.items || [])];
      items[index] = { ...items[index], [field]: value };
      return { ...p, items };
    });
  };

  const addItem = () => {
    setData(p => ({ ...p, items: [...(p.items || []), { icon: 'CreditCard', title: '', desc: '' }] }));
  };

  const removeItem = (index) => {
    setData(p => ({ ...p, items: (p.items || []).filter((_, i) => i !== index) }));
  };

  if (!data) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#C6A87C]" /></div>;

  return (
    <div data-testid="balie-installment-admin">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#1A1A1A]">Рассрочка (Купели)</h2>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060] disabled:opacity-50" data-testid="save-balie-installment">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Сохранить
        </button>
      </div>
      <div className="space-y-4 bg-white border border-black/5 p-6">
        <div>
          <label className="block text-xs font-medium text-[#8C8C8C] mb-1">Заголовок</label>
          <input type="text" value={data.title || ''} onChange={e => setData(p => ({ ...p, title: e.target.value }))}
            className="w-full p-2.5 border border-black/10 text-sm" data-testid="balie-installment-title" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8C8C8C] mb-1">Подзаголовок</label>
          <input type="text" value={data.subtitle || ''} onChange={e => setData(p => ({ ...p, subtitle: e.target.value }))}
            className="w-full p-2.5 border border-black/10 text-sm" data-testid="balie-installment-subtitle" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-[#1A1A1A]">Карточки</label>
            <button onClick={addItem} className="text-xs text-[#C6A87C] hover:underline flex items-center gap-1" data-testid="balie-installment-add">
              <Plus size={14} /> Добавить
            </button>
          </div>
          <div className="space-y-3">
            {(data.items || []).map((item, i) => (
              <div key={i} className="flex gap-2 items-start p-3 bg-[#F9F9F7] border border-black/5">
                <select value={item.icon || 'CreditCard'} onChange={e => updateItem(i, 'icon', e.target.value)} className="p-2 border border-black/10 text-xs">
                  <option value="CreditCard">CreditCard</option>
                  <option value="Calendar">Calendar</option>
                  <option value="Percent">Percent</option>
                  <option value="Truck">Truck</option>
                </select>
                <input type="text" placeholder="Заголовок" value={item.title || ''} onChange={e => updateItem(i, 'title', e.target.value)} className="flex-1 p-2 border border-black/10 text-sm" />
                <input type="text" placeholder="Описание" value={item.desc || ''} onChange={e => updateItem(i, 'desc', e.target.value)} className="flex-1 p-2 border border-black/10 text-sm" />
                <button onClick={() => removeItem(i)} className="p-2 text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
