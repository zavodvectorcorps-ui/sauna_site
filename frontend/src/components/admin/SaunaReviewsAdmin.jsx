import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Save, Upload, ChevronDown, ChevronUp, Star } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const ReviewEditor = ({ review, onSave, onDelete, onImageUpload }) => {
  const [data, setData] = useState(review);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-black/5 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img src={data.image} alt={data.name} className="w-12 h-12 object-cover" />
          <div>
            <h4 className="font-medium">{data.name}</h4>
            <p className="text-sm text-[#8C8C8C]">{data.location}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setExpanded(!expanded)} className="p-2 hover:bg-[#F9F9F7]">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button onClick={() => onSave(data)} className="p-2 text-[#C6A87C] hover:bg-[#F9F9F7]"><Save size={16} /></button>
          <button onClick={onDelete} className="p-2 text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
        </div>
      </div>
      {expanded && (
        <div className="space-y-4 mt-4 pt-4 border-t border-black/5">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs text-[#8C8C8C]">Имя</label><input value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} className="w-full p-2 border border-black/10 text-sm" /></div>
            <div><label className="text-xs text-[#8C8C8C]">Город</label><input value={data.location} onChange={(e) => setData({ ...data, location: e.target.value })} className="w-full p-2 border border-black/10 text-sm" /></div>
            <div><label className="text-xs text-[#8C8C8C]">Сауна</label><input value={data.sauna} onChange={(e) => setData({ ...data, sauna: e.target.value })} className="w-full p-2 border border-black/10 text-sm" /></div>
            <div><label className="text-xs text-[#8C8C8C]">Оценка</label><select value={data.rating} onChange={(e) => setData({ ...data, rating: parseInt(e.target.value) })} className="w-full p-2 border border-black/10 text-sm">{[5,4,3,2,1].map(r => <option key={r} value={r}>{r} ★</option>)}</select></div>
          </div>
          <div>
            <label className="text-xs text-[#8C8C8C]">URL фото</label>
            <div className="flex gap-2">
              <input value={data.image} onChange={(e) => setData({ ...data, image: e.target.value })} className="flex-1 p-2 border border-black/10 text-sm" />
              <label className="flex items-center gap-1 px-3 py-2 bg-[#1A1A1A] text-white text-sm cursor-pointer">
                <Upload size={14} /><input type="file" accept="image/*" className="hidden" onChange={(e) => onImageUpload(e.target.files[0], (url) => setData({ ...data, image: url }))} />
              </label>
            </div>
          </div>
          <div><label className="text-xs text-[#8C8C8C]">Отзыв (PL)</label><textarea value={data.text_pl} onChange={(e) => setData({ ...data, text_pl: e.target.value })} className="w-full p-2 border border-black/10 text-sm h-16" /></div>
          <div><label className="text-xs text-[#8C8C8C]">Отзыв (EN)</label><textarea value={data.text_en} onChange={(e) => setData({ ...data, text_en: e.target.value })} className="w-full p-2 border border-black/10 text-sm h-16" /></div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={data.active} onChange={(e) => setData({ ...data, active: e.target.checked })} className="accent-[#C6A87C]" /><span className="text-sm">Активен</span></label>
        </div>
      )}
    </div>
  );
};

export const SaunaReviewsAdmin = ({ authHeader, showMessage }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const response = await fetch(url, { ...options, headers: { ...options.headers, 'Authorization': authHeader } });
    if (response.status === 401) throw new Error('Unauthorized');
    return response;
  }, [authHeader]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${API}/api/admin/reviews`);
      setReviews(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [fetchWithAuth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleImageUpload = async (file, callback) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetchWithAuth(`${API}/api/admin/upload`, { method: 'POST', body: formData });
      const data = await response.json();
      callback(`${API}${data.url}`);
      showMessage('success', 'Фото загружено');
    } catch { showMessage('error', 'Ошибка загрузки'); }
  };

  const saveReview = async (review) => {
    try {
      await fetchWithAuth(`${API}/api/admin/reviews/${review.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(review) });
      showMessage('success', 'Отзыв сохранён');
      fetchData();
    } catch { showMessage('error', 'Ошибка сохранения'); }
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот отзыв?')) return;
    try {
      await fetchWithAuth(`${API}/api/admin/reviews/${id}`, { method: 'DELETE' });
      showMessage('success', 'Отзыв удалён');
      fetchData();
    } catch { showMessage('error', 'Ошибка удаления'); }
  };

  const addNewReview = async () => {
    const newReview = { id: `review_${Date.now()}`, name: 'Новый клиент', location: 'Варшава', rating: 5, text_pl: 'Treść opinii...', text_en: 'Review text...', text_ru: 'Текст отзыва...', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', sauna: 'Sauna', active: true };
    try {
      await fetchWithAuth(`${API}/api/admin/reviews`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newReview) });
      showMessage('success', 'Отзыв добавлен');
      fetchData();
    } catch { showMessage('error', 'Ошибка добавления'); }
  };

  if (loading) return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-[#C6A87C] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#1A1A1A]">Отзывы клиентов</h2>
        <button onClick={addNewReview} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]">
          <Plus size={16} /> Добавить отзыв
        </button>
      </div>
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewEditor key={review.id} review={review} onSave={saveReview} onDelete={() => deleteReview(review.id)} onImageUpload={handleImageUpload} />
        ))}
      </div>
    </div>
  );
};
