import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Upload, X } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export const BaliaFaqAdmin = ({ authHeader, showMessage }) => {
  const [faqSettings, setFaqSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWithAuth = (url, opts = {}) => fetch(url, { ...opts, headers: { ...opts.headers, 'Authorization': authHeader } });

  useEffect(() => {
    fetch(`${API}/api/settings/balia-faq`)
      .then(r => r.json())
      .then(d => setFaqSettings(d))
      .finally(() => setLoading(false));
  }, []);

  const saveFaq = async () => {
    try {
      await fetchWithAuth(`${API}/api/admin/settings/balia-faq`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faqSettings)
      });
      showMessage('success', 'FAQ купелей сохранены');
    } catch { showMessage('error', 'Ошибка сохранения FAQ'); }
  };

  const handleImageUpload = async (file, idx) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetchWithAuth(`${API}/api/admin/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      const url = `${API}${data.url}`;
      setFaqSettings(prev => ({
        ...prev,
        items: prev.items.map((it, i) => i === idx ? { ...it, image_url: url } : it)
      }));
      showMessage('success', 'Фото загружено');
    } catch { showMessage('error', 'Ошибка загрузки фото'); }
  };

  const addItem = () => {
    const newItem = {
      id: `faq_${Date.now()}`,
      question_pl: '', question_en: '',
      answer_pl: '', answer_en: '',
      image_url: '', active: true,
      sort_order: (faqSettings.items?.length || 0)
    };
    setFaqSettings(prev => ({ ...prev, items: [...(prev.items || []), newItem] }));
  };

  const updateItem = (idx, field, value) => {
    setFaqSettings(prev => ({
      ...prev,
      items: prev.items.map((it, i) => i === idx ? { ...it, [field]: value } : it)
    }));
  };

  const removeItem = (idx) => {
    setFaqSettings(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  if (loading || !faqSettings) return <div className="p-8 text-center text-gray-400">Загрузка...</div>;

  return (
    <div data-testid="balia-faq-admin">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#1A1A1A]">FAQ купелей</h2>
        <button onClick={saveFaq} className="flex items-center gap-2 bg-[#D4AF37] text-white px-4 py-2 hover:bg-[#B8942E]" data-testid="balia-faq-save">
          <Save size={16} /> Сохранить
        </button>
      </div>

      <div className="border border-black/5 p-5 bg-[#F9F9F7] mb-4 space-y-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Заголовок (PL)</label>
          <input type="text" value={faqSettings.title_pl || ''} onChange={e => setFaqSettings(prev => ({ ...prev, title_pl: e.target.value }))} className="w-full p-2 border border-black/10 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Подзаголовок (PL)</label>
          <input type="text" value={faqSettings.subtitle_pl || ''} onChange={e => setFaqSettings(prev => ({ ...prev, subtitle_pl: e.target.value }))} className="w-full p-2 border border-black/10 text-sm" />
        </div>
      </div>

      <div className="space-y-3">
        {faqSettings.items?.map((item, idx) => (
          <div key={item.id} className="border border-black/5 p-4 bg-[#F9F9F7]" data-testid={`balia-faq-item-admin-${idx}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-[#1A1A1A]">{item.question_pl || `Вопрос ${idx + 1}`}</span>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={item.active !== false} onChange={e => updateItem(idx, 'active', e.target.checked)} className="rounded" />
                  <span className="text-xs text-gray-400">Активен</span>
                </label>
                <button onClick={() => removeItem(idx)} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Вопрос (PL)</label>
                <input type="text" value={item.question_pl} onChange={e => updateItem(idx, 'question_pl', e.target.value)} className="w-full p-2 border border-black/10 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Ответ (PL)</label>
                <textarea value={item.answer_pl} onChange={e => updateItem(idx, 'answer_pl', e.target.value)} className="w-full p-2 border border-black/10 text-sm" rows={3} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Фото (необязательно)</label>
                <div className="flex items-center gap-2">
                  {item.image_url && (
                    <div className="relative">
                      <img src={item.image_url} alt="" className="w-16 h-12 object-cover border border-black/5" />
                      <button onClick={() => updateItem(idx, 'image_url', '')} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X size={10} /></button>
                    </div>
                  )}
                  <label className="flex items-center gap-1 px-3 py-1.5 border border-black/10 text-xs text-gray-500 cursor-pointer hover:bg-gray-50">
                    <Upload size={12} /> Загрузить
                    <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], idx)} />
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={addItem} className="mt-4 flex items-center gap-2 px-4 py-2 border border-dashed border-black/15 text-sm text-gray-500 hover:bg-gray-50 w-full justify-center" data-testid="balia-faq-add">
        <Plus size={14} /> Добавить вопрос
      </button>
    </div>
  );
};
