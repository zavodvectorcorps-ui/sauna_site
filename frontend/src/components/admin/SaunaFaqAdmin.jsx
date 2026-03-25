import { useState, useEffect, useCallback } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export const SaunaFaqAdmin = ({ authHeader, showMessage }) => {
  const [faqSettings, setFaqSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const response = await fetch(url, { ...options, headers: { ...options.headers, 'Authorization': authHeader } });
    if (response.status === 401) throw new Error('Unauthorized');
    return response;
  }, [authHeader]);

  useEffect(() => {
    (async () => {
      try { const res = await fetch(`${API}/api/settings/faq`); setFaqSettings(await res.json()); } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const saveFaqSettings = async () => {
    try { await fetchWithAuth(`${API}/api/admin/settings/faq`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(faqSettings) }); showMessage('success', 'FAQ сохранено'); } catch { showMessage('error', 'Ошибка сохранения'); }
  };

  const addFaqItem = () => {
    setFaqSettings({ ...faqSettings, items: [...faqSettings.items, { id: `faq_${Date.now()}`, question_pl: '', question_en: '', answer_pl: '', answer_en: '', sort_order: faqSettings.items.length, active: true }] });
  };

  const updateFaqItem = (id, field, value) => {
    setFaqSettings({ ...faqSettings, items: faqSettings.items.map(item => item.id === id ? { ...item, [field]: value } : item) });
  };

  const removeFaqItem = (id) => {
    setFaqSettings({ ...faqSettings, items: faqSettings.items.filter(item => item.id !== id) });
  };

  if (loading || !faqSettings) return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-[#C6A87C] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#1A1A1A]">FAQ — Частые вопросы</h2>
        <div className="flex gap-2">
          <button onClick={addFaqItem} className="flex items-center gap-2 bg-[#1A1A1A] text-white px-4 py-2 hover:bg-black text-sm"><Plus size={16} /> Добавить вопрос</button>
          <button onClick={saveFaqSettings} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060] text-sm"><Save size={16} /> Сохранить</button>
        </div>
      </div>
      <div className="border border-black/5 p-6 mb-6">
        <h3 className="font-semibold mb-4">Тексты блока</h3>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-xs text-[#8C8C8C] mb-1">Заголовок (PL)</label><input type="text" value={faqSettings.title_pl} onChange={(e) => setFaqSettings({ ...faqSettings, title_pl: e.target.value })} className="w-full p-2 border border-black/10 text-sm" /></div>
          <div><label className="block text-xs text-[#8C8C8C] mb-1">Заголовок (EN)</label><input type="text" value={faqSettings.title_en} onChange={(e) => setFaqSettings({ ...faqSettings, title_en: e.target.value })} className="w-full p-2 border border-black/10 text-sm" /></div>
          <div><label className="block text-xs text-[#8C8C8C] mb-1">Подзаголовок (PL)</label><input type="text" value={faqSettings.subtitle_pl} onChange={(e) => setFaqSettings({ ...faqSettings, subtitle_pl: e.target.value })} className="w-full p-2 border border-black/10 text-sm" /></div>
          <div><label className="block text-xs text-[#8C8C8C] mb-1">Подзаголовок (EN)</label><input type="text" value={faqSettings.subtitle_en} onChange={(e) => setFaqSettings({ ...faqSettings, subtitle_en: e.target.value })} className="w-full p-2 border border-black/10 text-sm" /></div>
        </div>
      </div>
      <div className="space-y-4">
        {faqSettings.items.map((item, index) => (
          <div key={item.id} className={`border p-5 ${item.active ? 'border-black/5' : 'border-red-200 bg-red-50/30'}`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-[#8C8C8C]">Вопрос #{index + 1}</span>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={item.active} onChange={(e) => updateFaqItem(item.id, 'active', e.target.checked)} className="accent-[#C6A87C]" />{item.active ? 'Активен' : 'Скрыт'}</label>
                <button onClick={() => removeFaqItem(item.id)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div><label className="block text-xs text-[#8C8C8C] mb-1">Вопрос (PL)</label><input type="text" value={item.question_pl} onChange={(e) => updateFaqItem(item.id, 'question_pl', e.target.value)} className="w-full p-2 border border-black/10 text-sm" /></div>
              <div><label className="block text-xs text-[#8C8C8C] mb-1">Вопрос (EN)</label><input type="text" value={item.question_en} onChange={(e) => updateFaqItem(item.id, 'question_en', e.target.value)} className="w-full p-2 border border-black/10 text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs text-[#8C8C8C] mb-1">Ответ (PL)</label><textarea value={item.answer_pl} onChange={(e) => updateFaqItem(item.id, 'answer_pl', e.target.value)} className="w-full p-2 border border-black/10 text-sm h-20" /></div>
              <div><label className="block text-xs text-[#8C8C8C] mb-1">Ответ (EN)</label><textarea value={item.answer_en} onChange={(e) => updateFaqItem(item.id, 'answer_en', e.target.value)} className="w-full p-2 border border-black/10 text-sm h-20" /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
