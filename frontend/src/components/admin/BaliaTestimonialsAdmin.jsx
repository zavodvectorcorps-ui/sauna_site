import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Save, Edit2, X, Star, Loader2 } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export const BaliaTestimonialsAdmin = ({ authHeader, showMessage }) => {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ author_name: '', author_location: '', product_name: '', text: '', rating: 5, order: 0 });
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`${API}/api/balia/testimonials`);
    setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const handleEdit = (t) => {
    setEditing(t.id);
    setForm({ author_name: t.author_name || '', author_location: t.author_location || '', product_name: t.product_name || '', text: t.text || '', rating: t.rating || 5, order: t.order || 0 });
  };

  const handleNew = () => {
    setEditing('new');
    setForm({ author_name: '', author_location: '', product_name: '', text: '', rating: 5, order: items.length + 1 });
  };

  const handleSave = async () => {
    const data = { ...form, rating: Number(form.rating), order: Number(form.order) };
    if (editing !== 'new') data.id = editing;
    const res = await fetch(`${API}/api/balia/testimonials`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authHeader }, body: JSON.stringify(data),
    });
    if (res.ok) { showMessage('success', 'Отзыв сохранён'); setEditing(null); fetch_(); }
    else showMessage('error', 'Ошибка сохранения');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить отзыв?')) return;
    await fetch(`${API}/api/balia/testimonials/${id}`, { method: 'DELETE', headers: { 'Authorization': authHeader } });
    showMessage('success', 'Отзыв удалён');
    fetch_();
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#C6A87C]" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Отзывы о купелях ({items.length})</h3>
        <button onClick={handleNew} className="flex items-center gap-2 px-4 py-2 bg-[#C6A87C] text-white text-sm font-medium hover:bg-[#B09060]"><Plus size={16} /> Добавить</button>
      </div>

      {editing && (
        <div className="mb-6 p-5 border border-[#C6A87C]/30 bg-[#F9F9F7]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">{editing === 'new' ? 'Новый отзыв' : 'Редактирование'}</h4>
            <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Имя автора *</label>
              <input value={form.author_name} onChange={e => setForm(p => ({ ...p, author_name: e.target.value }))} className="w-full p-2.5 border border-gray-200 text-sm focus:border-[#C6A87C] outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Город</label>
              <input value={form.author_location} onChange={e => setForm(p => ({ ...p, author_location: e.target.value }))} className="w-full p-2.5 border border-gray-200 text-sm focus:border-[#C6A87C] outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Продукт</label>
              <input value={form.product_name} onChange={e => setForm(p => ({ ...p, product_name: e.target.value }))} className="w-full p-2.5 border border-gray-200 text-sm focus:border-[#C6A87C] outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Рейтинг (1-5)</label>
              <div className="flex items-center gap-1 mt-1">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setForm(p => ({ ...p, rating: n }))} className={`p-1 ${n <= form.rating ? 'text-yellow-500' : 'text-gray-300'}`}><Star size={20} fill={n <= form.rating ? 'currentColor' : 'none'} /></button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Текст отзыва *</label>
              <textarea value={form.text} onChange={e => setForm(p => ({ ...p, text: e.target.value }))} rows={3} className="w-full p-2.5 border border-gray-200 text-sm focus:border-[#C6A87C] outline-none resize-none" />
            </div>
          </div>
          <button onClick={handleSave} disabled={!form.author_name || !form.text} className="mt-4 flex items-center gap-2 px-5 py-2 bg-[#1A1A1A] text-white text-sm font-medium hover:bg-black disabled:opacity-40"><Save size={14} /> Сохранить</button>
        </div>
      )}

      <div className="space-y-3">
        {items.map(t => (
          <div key={t.id} className="flex items-center gap-4 p-3 bg-white border border-gray-100 hover:border-[#C6A87C]/30">
            <div className="w-10 h-10 bg-[#C6A87C] flex items-center justify-center text-white font-bold flex-shrink-0">{t.author_name.charAt(0)}</div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{t.author_name} <span className="text-gray-400 font-normal">— {t.author_location}</span></div>
              <div className="text-xs text-gray-400 line-clamp-1">{t.text}</div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {[...Array(t.rating || 0)].map((_, i) => <Star key={i} size={12} className="fill-yellow-500 text-yellow-500" />)}
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => handleEdit(t)} className="p-2 text-gray-400 hover:text-[#C6A87C]"><Edit2 size={14} /></button>
              <button onClick={() => handleDelete(t.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-400 text-center py-6">Нет отзывов. Добавьте первый.</p>}
      </div>
    </div>
  );
};
