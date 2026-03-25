import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Save, Edit2, X, Upload, Image, GripVertical, Loader2 } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export const BaliaProductsAdmin = ({ authHeader, showMessage }) => {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', description: '', image: '', api_model_id: '', tags: '', order: 0 });
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`${API}/api/balia/products`);
    setProducts(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const handleEdit = (p) => {
    setEditing(p.id);
    setForm({ name: p.name || '', price: p.price || '', description: p.description || '', image: p.image || '', api_model_id: p.api_model_id || '', tags: (p.tags || []).join(', '), order: p.order || 0 });
  };

  const handleNew = () => {
    setEditing('new');
    setForm({ name: '', price: '', description: '', image: '', api_model_id: '', tags: '', order: products.length + 1 });
  };

  const handleSave = async () => {
    const data = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean), order: Number(form.order) };
    if (editing !== 'new') data.id = editing;
    const res = await fetch(`${API}/api/balia/products`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authHeader }, body: JSON.stringify(data),
    });
    if (res.ok) { showMessage('success', 'Продукт сохранён'); setEditing(null); fetch_(); }
    else showMessage('error', 'Ошибка сохранения');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить продукт?')) return;
    await fetch(`${API}/api/balia/products/${id}`, { method: 'DELETE', headers: { 'Authorization': authHeader } });
    showMessage('success', 'Продукт удалён');
    fetch_();
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#C6A87C]" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Продукты купелей ({products.length})</h3>
        <button onClick={handleNew} className="flex items-center gap-2 px-4 py-2 bg-[#C6A87C] text-white text-sm font-medium hover:bg-[#B09060]"><Plus size={16} /> Добавить</button>
      </div>

      {editing && (
        <div className="mb-6 p-5 border border-[#C6A87C]/30 bg-[#F9F9F7]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">{editing === 'new' ? 'Новый продукт' : 'Редактирование'}</h4>
            <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Название *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full p-2.5 border border-gray-200 text-sm focus:border-[#C6A87C] outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Цена (текст)</label>
              <input value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="od 10 990 zł" className="w-full p-2.5 border border-gray-200 text-sm focus:border-[#C6A87C] outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Описание</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full p-2.5 border border-gray-200 text-sm focus:border-[#C6A87C] outline-none resize-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">URL изображения</label>
              <input value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} className="w-full p-2.5 border border-gray-200 text-sm focus:border-[#C6A87C] outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">API Model ID</label>
              <input value={form.api_model_id} onChange={e => setForm(p => ({ ...p, api_model_id: e.target.value }))} className="w-full p-2.5 border border-gray-200 text-sm focus:border-[#C6A87C] outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Теги (через запятую)</label>
              <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="Bestseller, Nowość" className="w-full p-2.5 border border-gray-200 text-sm focus:border-[#C6A87C] outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Порядок</label>
              <input type="number" value={form.order} onChange={e => setForm(p => ({ ...p, order: e.target.value }))} className="w-full p-2.5 border border-gray-200 text-sm focus:border-[#C6A87C] outline-none" />
            </div>
          </div>
          {form.image && <img src={form.image} alt="Preview" className="mt-3 h-20 object-cover border" />}
          <button onClick={handleSave} disabled={!form.name} className="mt-4 flex items-center gap-2 px-5 py-2 bg-[#1A1A1A] text-white text-sm font-medium hover:bg-black disabled:opacity-40"><Save size={14} /> Сохранить</button>
        </div>
      )}

      <div className="space-y-3">
        {products.map(p => (
          <div key={p.id} className="flex items-center gap-4 p-3 bg-white border border-gray-100 hover:border-[#C6A87C]/30">
            {p.image && <img src={p.image} alt={p.name} className="w-16 h-12 object-cover flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{p.name}</div>
              <div className="text-xs text-gray-400">{p.price} {p.tags?.length > 0 && `• ${p.tags.join(', ')}`}</div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => handleEdit(p)} className="p-2 text-gray-400 hover:text-[#C6A87C]"><Edit2 size={14} /></button>
              <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {products.length === 0 && <p className="text-sm text-gray-400 text-center py-6">Нет продуктов. Добавьте первый.</p>}
      </div>
    </div>
  );
};
