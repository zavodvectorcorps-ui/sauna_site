import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Upload, X } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export const SaunaFaqAdmin = ({ authHeader, showMessage }) => {
  const [faqSettings, setFaqSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWithAuth = (url, opts = {}) => fetch(url, { ...opts, headers: { ...opts.headers, 'Authorization': authHeader } });

  useEffect(() => {
    fetch(`${API}/api/settings/faq`)
      .then(r => r.json())
      .then(d => setFaqSettings(d))
      .finally(() => setLoading(false));
  }, []);

  const saveFaq = async () => {
    try {
      await fetchWithAuth(`${API}/api/admin/settings/faq`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faqSettings)
      });
      showMessage('success', 'FAQ сохранены');
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
    } catch { showMessage('error', 'Ошибка загрузки'); }
  };

  const updateItem = (idx, field, value) => {
    setFaqSettings(prev => ({
      ...prev,
      items: prev.items.map((it, i) => i === idx ? { ...it, [field]: value } : it)
    }));
  };

  if (loading || !faqSettings) return <div className="p-8 text-center text-gray-400">Загрузка...</div>;

  return (
    <div data-testid="faq-admin">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#1A1A1A]">Управление FAQ</h2>
        <button onClick={saveFaq} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]" data-testid="faq-save">
          <Save size={16} /> Сохранить
        </button>
      </div>

      <div className="border border-black/5 p-5 bg-[#F9F9F7] mb-6">
        <h3 className="font-semibold mb-3">Заголовок секции</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Заголовок (PL)</label>
            <input type="text" value={faqSettings.title_pl || ''} onChange={e => setFaqSettings(prev => ({ ...prev, title_pl: e.target.value }))} className="w-full p-2 border border-black/10 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Заголовок (EN)</label>
            <input type="text" value={faqSettings.title_en || ''} onChange={e => setFaqSettings(prev => ({ ...prev, title_en: e.target.value }))} className="w-full p-2 border border-black/10 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Подзаголовок (PL)</label>
            <input type="text" value={faqSettings.subtitle_pl || ''} onChange={e => setFaqSettings(prev => ({ ...prev, subtitle_pl: e.target.value }))} className="w-full p-2 border border-black/10 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Подзаголовок (EN)</label>
            <input type="text" value={faqSettings.subtitle_en || ''} onChange={e => setFaqSettings(prev => ({ ...prev, subtitle_en: e.target.value }))} className="w-full p-2 border border-black/10 text-sm" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {faqSettings.items.map((item, idx) => (
          <div key={item.id} className="border border-black/5 p-5 bg-[#F9F9F7]" data-testid={`faq-item-${idx}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Вопрос (PL)</label>
                    <input type="text" value={item.question_pl} onChange={e => updateItem(idx, 'question_pl', e.target.value)} className="w-full p-2 border border-black/10 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Вопрос (EN)</label>
                    <input type="text" value={item.question_en || ''} onChange={e => updateItem(idx, 'question_en', e.target.value)} className="w-full p-2 border border-black/10 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Ответ (PL)</label>
                    <textarea value={item.answer_pl} onChange={e => updateItem(idx, 'answer_pl', e.target.value)} className="w-full p-2 border border-black/10 text-sm" rows={3} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Ответ (EN)</label>
                    <textarea value={item.answer_en || ''} onChange={e => updateItem(idx, 'answer_en', e.target.value)} className="w-full p-2 border border-black/10 text-sm" rows={3} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Фото (показывается при раскрытии ответа)</label>
                  <div className="flex gap-2 items-center">
                    <input type="url" value={item.image_url || ''} onChange={e => updateItem(idx, 'image_url', e.target.value)} placeholder="URL фото" className="flex-1 p-2 border border-black/10 text-sm" data-testid={`faq-image-url-${idx}`} />
                    <label className="flex items-center gap-1.5 px-3 py-2 bg-[#1A1A1A] text-white text-xs cursor-pointer hover:bg-black flex-shrink-0">
                      <Upload size={12} /> Загрузить
                      <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], idx)} />
                    </label>
                    {item.image_url && (
                      <button onClick={() => updateItem(idx, 'image_url', '')} className="p-1.5 text-red-400 hover:text-red-600"><X size={14} /></button>
                    )}
                  </div>
                  {item.image_url && <img src={item.image_url} alt="FAQ" className="mt-2 h-20 object-cover border border-black/5" />}
                </div>
              </div>
              <button onClick={() => setFaqSettings(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }))} className="text-red-400 hover:text-red-600 flex-shrink-0" data-testid={`faq-delete-${idx}`}>
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => setFaqSettings(prev => ({ ...prev, items: [...prev.items, { id: `faq_${Date.now()}`, question_pl: '', question_en: '', answer_pl: '', answer_en: '', image_url: '', sort_order: prev.items.length, active: true }] }))} className="mt-4 flex items-center gap-2 px-4 py-2 border border-dashed border-black/15 text-sm text-gray-500 hover:bg-gray-50 w-full justify-center" data-testid="faq-add">
        <Plus size={14} /> Добавить вопрос
      </button>
    </div>
  );
};
