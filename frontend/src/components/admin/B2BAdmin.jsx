import { useState, useEffect, useRef } from 'react';
import { Save, Plus, Trash2, Upload } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export const B2BAdmin = ({ authHeader, showMessage }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const imgRef = useRef(null);

  const fetchData = () => {
    fetch(`${API}/api/admin/settings/b2b`, { headers: { Authorization: authHeader } })
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => showMessage('error', 'Ошибка загрузки'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, []);

  const save = async () => {
    try {
      const res = await fetch(`${API}/api/admin/settings/b2b`, {
        method: 'PUT',
        headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) showMessage('success', 'Сохранено');
      else showMessage('error', 'Ошибка сохранения');
    } catch { showMessage('error', 'Ошибка сохранения'); }
  };

  const uploadImage = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch(`${API}/api/admin/upload`, { method: 'POST', headers: { Authorization: authHeader }, body: fd });
      const d = await res.json();
      if (d.url) {
        setData(prev => ({ ...prev, hero_image: `${API}${d.url}` }));
        showMessage('success', 'Изображение загружено');
      }
    } catch { showMessage('error', 'Ошибка загрузки'); }
  };

  const addBenefit = () => {
    const id = 'b_' + Date.now();
    setData(prev => ({
      ...prev,
      benefits: [...(prev.benefits || []), { id, icon: 'Star', title: '', desc: '' }],
    }));
  };

  const updateBenefit = (idx, field, value) => {
    setData(prev => ({
      ...prev,
      benefits: prev.benefits.map((b, i) => i === idx ? { ...b, [field]: value } : b),
    }));
  };

  const removeBenefit = (idx) => {
    setData(prev => ({ ...prev, benefits: prev.benefits.filter((_, i) => i !== idx) }));
  };

  const addGalleryItem = () => {
    const id = 'g_' + Date.now();
    setData(prev => ({
      ...prev,
      gallery: [...(prev.gallery || []), { id, type: 'image', url: '', title: '', desc: '' }],
    }));
  };

  const updateGalleryItem = (idx, field, value) => {
    setData(prev => ({
      ...prev,
      gallery: prev.gallery.map((g, i) => i === idx ? { ...g, [field]: value } : g),
    }));
  };

  const removeGalleryItem = (idx) => {
    setData(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== idx) }));
  };

  if (loading) return <div className="py-8 text-center text-gray-400">Загрузка...</div>;
  if (!data) return null;

  return (
    <div data-testid="b2b-admin">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#1A1A1A]">Настройки B2B</h2>
        <button onClick={save} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]" data-testid="b2b-save">
          <Save size={16} /> Сохранить
        </button>
      </div>

      <div className="space-y-4 mb-8">
        <h3 className="text-sm font-semibold text-[#1A1A1A] border-b border-black/5 pb-2">Hero-секция</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Заголовок</label>
            <input type="text" value={data.hero_title || ''} onChange={e => setData(prev => ({ ...prev, hero_title: e.target.value }))} className="w-full p-2 border border-black/10 text-sm" data-testid="b2b-hero-title" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Подзаголовок</label>
            <input type="text" value={data.hero_subtitle || ''} onChange={e => setData(prev => ({ ...prev, hero_subtitle: e.target.value }))} className="w-full p-2 border border-black/10 text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Фоновое изображение</label>
          <div className="flex items-start gap-3">
            {data.hero_image && <img src={data.hero_image} alt="" className="w-32 h-20 object-cover border" />}
            <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} />
            <button onClick={() => imgRef.current?.click()} className="px-3 py-1.5 border border-black/10 text-xs text-gray-500 hover:bg-gray-50">
              <Upload size={12} className="inline mr-1" />Загрузить
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#1A1A1A] border-b border-black/5 pb-2 flex-1">Преимущества ({(data.benefits || []).length})</h3>
          <button onClick={addBenefit} className="flex items-center gap-1 text-sm text-[#C6A87C] hover:text-[#B09060]" data-testid="b2b-add-benefit">
            <Plus size={14} /> Добавить
          </button>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Заголовок блока преимуществ</label>
          <input type="text" value={data.benefits_title || ''} onChange={e => setData(prev => ({ ...prev, benefits_title: e.target.value }))} className="w-full p-2 border border-black/10 text-sm" />
        </div>
        {(data.benefits || []).map((b, idx) => (
          <div key={b.id || idx} className="p-4 border border-black/5 bg-[#F9F9F7]" data-testid={`b2b-benefit-${idx}`}>
            <div className="grid grid-cols-3 gap-3 mb-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Иконка (Lucide)</label>
                <input type="text" value={b.icon} onChange={e => updateBenefit(idx, 'icon', e.target.value)} className="w-full p-2 border border-black/10 text-sm" />
              </div>
              <div className="col-span-2 flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 mb-1">Заголовок</label>
                  <input type="text" value={b.title} onChange={e => updateBenefit(idx, 'title', e.target.value)} className="w-full p-2 border border-black/10 text-sm" />
                </div>
                <button onClick={() => removeBenefit(idx)} className="self-end p-2 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Описание</label>
              <textarea value={b.desc} onChange={e => updateBenefit(idx, 'desc', e.target.value)} className="w-full p-2 border border-black/10 text-sm" rows={2} />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-[#1A1A1A] border-b border-black/5 pb-2">CTA-секция</h3>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Заголовок CTA</label>
          <input type="text" value={data.cta_title || ''} onChange={e => setData(prev => ({ ...prev, cta_title: e.target.value }))} className="w-full p-2 border border-black/10 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Описание CTA</label>
          <textarea value={data.cta_description || ''} onChange={e => setData(prev => ({ ...prev, cta_description: e.target.value }))} className="w-full p-2 border border-black/10 text-sm" rows={2} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Телефон</label>
            <input type="text" value={data.cta_phone || ''} onChange={e => setData(prev => ({ ...prev, cta_phone: e.target.value }))} className="w-full p-2 border border-black/10 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Email</label>
            <input type="text" value={data.cta_email || ''} onChange={e => setData(prev => ({ ...prev, cta_email: e.target.value }))} className="w-full p-2 border border-black/10 text-sm" />
          </div>
        </div>
      </div>

      <div className="space-y-4 mt-8">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#1A1A1A] border-b border-black/5 pb-2 flex-1">Галерея ({(data.gallery || []).length})</h3>
          <button onClick={addGalleryItem} className="flex items-center gap-1 text-sm text-[#C6A87C] hover:text-[#B09060]" data-testid="b2b-add-gallery">
            <Plus size={14} /> Добавить
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Заголовок галереи</label>
            <input type="text" value={data.gallery_title || ''} onChange={e => setData(prev => ({ ...prev, gallery_title: e.target.value }))} className="w-full p-2 border border-black/10 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Подзаголовок галереи</label>
            <input type="text" value={data.gallery_subtitle || ''} onChange={e => setData(prev => ({ ...prev, gallery_subtitle: e.target.value }))} className="w-full p-2 border border-black/10 text-sm" />
          </div>
        </div>
        {(data.gallery || []).map((g, idx) => (
          <div key={g.id || idx} className="p-4 border border-black/5 bg-[#F9F9F7]" data-testid={`b2b-gallery-admin-${idx}`}>
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-2">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Тип</label>
                    <select value={g.type || 'image'} onChange={e => updateGalleryItem(idx, 'type', e.target.value)} className="w-full p-2 border border-black/10 text-sm">
                      <option value="image">Фото</option>
                      <option value="video">Видео (YouTube)</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-400 mb-1">{g.type === 'video' ? 'YouTube URL' : 'URL изображения'}</label>
                    <input type="text" value={g.url || ''} onChange={e => updateGalleryItem(idx, 'url', e.target.value)} className="w-full p-2 border border-black/10 text-sm" placeholder={g.type === 'video' ? 'https://youtube.com/watch?v=...' : 'https://...'} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Заголовок</label>
                    <input type="text" value={g.title || ''} onChange={e => updateGalleryItem(idx, 'title', e.target.value)} className="w-full p-2 border border-black/10 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Описание</label>
                    <input type="text" value={g.desc || ''} onChange={e => updateGalleryItem(idx, 'desc', e.target.value)} className="w-full p-2 border border-black/10 text-sm" />
                  </div>
                </div>
                {g.url && g.type !== 'video' && <img src={g.url} alt="" className="h-16 object-cover border mt-1" />}
              </div>
              <button onClick={() => removeGalleryItem(idx)} className="p-1.5 text-gray-400 hover:text-red-500 flex-shrink-0 mt-6"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
