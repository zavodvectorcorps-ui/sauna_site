import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, GripVertical, Video } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export const SaunaVideoReviewsAdmin = ({ authHeader, showMessage }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    fetch(`${API}/api/admin/settings/video-reviews`, { headers: { Authorization: authHeader } })
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => showMessage('error', 'Ошибка загрузки'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, []);

  const save = async () => {
    try {
      const res = await fetch(`${API}/api/admin/settings/video-reviews`, {
        method: 'PUT',
        headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) showMessage('success', 'Сохранено');
      else showMessage('error', 'Ошибка сохранения');
    } catch { showMessage('error', 'Ошибка сохранения'); }
  };

  const addItem = () => {
    const id = 'vr_' + Date.now();
    setData(prev => ({
      ...prev,
      items: [...(prev.items || []), { id, youtube_url: '', title: '', description: '', sort_order: (prev.items || []).length }],
    }));
  };

  const updateItem = (idx, field, value) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === idx ? { ...item, [field]: value } : item),
    }));
  };

  const removeItem = (idx) => {
    setData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  if (loading) return <div className="py-8 text-center text-gray-400">Загрузка...</div>;
  if (!data) return null;

  return (
    <div data-testid="video-reviews-admin">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#1A1A1A]">Видео-обзоры саун</h2>
        <button onClick={save} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]" data-testid="video-reviews-save">
          <Save size={16} /> Сохранить
        </button>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Заголовок секции</label>
          <input type="text" value={data.title || ''} onChange={e => setData(prev => ({ ...prev, title: e.target.value }))} className="w-full p-2 border border-black/10 text-sm" data-testid="video-reviews-title" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Подзаголовок</label>
          <input type="text" value={data.subtitle || ''} onChange={e => setData(prev => ({ ...prev, subtitle: e.target.value }))} className="w-full p-2 border border-black/10 text-sm" />
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#1A1A1A]">Видео ({(data.items || []).length})</h3>
        <button onClick={addItem} className="flex items-center gap-1 text-sm text-[#C6A87C] hover:text-[#B09060]" data-testid="video-reviews-add">
          <Plus size={14} /> Добавить видео
        </button>
      </div>

      <div className="space-y-3">
        {(data.items || []).map((item, idx) => (
          <div key={item.id || idx} className="p-4 border border-black/5 bg-[#F9F9F7]" data-testid={`video-item-${idx}`}>
            <div className="flex items-start gap-3">
              <GripVertical size={16} className="text-gray-300 mt-2 flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">YouTube URL *</label>
                    <input type="text" value={item.youtube_url} onChange={e => updateItem(idx, 'youtube_url', e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="w-full p-2 border border-black/10 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Название</label>
                    <input type="text" value={item.title} onChange={e => updateItem(idx, 'title', e.target.value)} className="w-full p-2 border border-black/10 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Описание</label>
                  <input type="text" value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} className="w-full p-2 border border-black/10 text-sm" />
                </div>
                {item.youtube_url && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Video size={12} />
                    <span>Превью: {item.youtube_url}</span>
                  </div>
                )}
              </div>
              <button onClick={() => removeItem(idx)} className="p-1.5 text-gray-400 hover:text-red-500 flex-shrink-0" data-testid={`video-delete-${idx}`}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {(data.items || []).length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200">
          Нет видео. Нажмите "Добавить видео" для начала.
        </div>
      )}
    </div>
  );
};
