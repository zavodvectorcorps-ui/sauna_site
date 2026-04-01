import { useState, useEffect, useRef } from 'react';
import { Save, Plus, Trash2, Upload, Eye, EyeOff, Pencil, X } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;
const CATEGORIES = [
  { id: 'sauny', label: 'Sauny' },
  { id: 'balie', label: 'Balie' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'b2b', label: 'B2B' },
];

export const BlogAdmin = ({ authHeader, showMessage }) => {
  const [articles, setArticles] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const coverRef = useRef(null);

  const fetchWithAuth = (url, opts = {}) => {
    const headers = { ...opts.headers, Authorization: authHeader };
    if (!(opts.body instanceof FormData)) headers['Content-Type'] = 'application/json';
    return fetch(url, { ...opts, headers });
  };

  const loadArticles = () => {
    fetchWithAuth(`${API}/api/admin/blog/articles`)
      .then(r => r.json())
      .then(setArticles)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(loadArticles, []);

  const saveArticle = async () => {
    if (!editing) return;
    try {
      const isNew = !editing._existing;
      const slug = editing.slug || slugify(editing.title);
      const data = { ...editing, slug };
      delete data._existing;

      if (isNew) {
        await fetchWithAuth(`${API}/api/admin/blog/articles`, { method: 'POST', body: JSON.stringify(data) });
      } else {
        await fetchWithAuth(`${API}/api/admin/blog/articles/${slug}`, { method: 'PUT', body: JSON.stringify(data) });
      }
      showMessage('success', 'Статья сохранена');
      setEditing(null);
      loadArticles();
    } catch { showMessage('error', 'Ошибка сохранения'); }
  };

  const deleteArticle = async (slug) => {
    if (!window.confirm('Удалить статью?')) return;
    try {
      await fetchWithAuth(`${API}/api/admin/blog/articles/${slug}`, { method: 'DELETE' });
      showMessage('success', 'Статья удалена');
      loadArticles();
    } catch { showMessage('error', 'Ошибка удаления'); }
  };

  const uploadCover = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch(`${API}/api/admin/upload`, { method: 'POST', headers: { Authorization: authHeader }, body: fd });
      const data = await res.json();
      if (data.url) {
        setEditing(prev => ({ ...prev, cover_image: data.url.startsWith('http') ? data.url : `${API}${data.url}` }));
        showMessage('success', 'Обложка загружена');
      }
    } catch { showMessage('error', 'Ошибка загрузки обложки'); }
  };

  const slugify = (text) => {
    let s = text.toLowerCase().trim();
    const rep = {'ą':'a','ć':'c','ę':'e','ł':'l','ń':'n','ó':'o','ś':'s','ź':'z','ż':'z'};
    Object.entries(rep).forEach(([k, v]) => { s = s.replaceAll(k, v); });
    return s.replace(/[^a-z0-9\s-]/g, '').replace(/[\s]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  };

  if (editing) {
    return (
      <div data-testid="blog-admin-editor">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#1A1A1A]">{editing._existing ? 'Редактирование' : 'Новая статья'}</h2>
          <div className="flex gap-2">
            <button onClick={() => setEditing(null)} className="px-4 py-2 border border-black/10 text-sm text-gray-500 hover:bg-gray-50"><X size={14} className="inline mr-1" />Отмена</button>
            <button onClick={saveArticle} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]" data-testid="blog-save"><Save size={16} /> Сохранить</button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Заголовок *</label>
              <input type="text" value={editing.title || ''} onChange={e => setEditing(prev => ({ ...prev, title: e.target.value }))} className="w-full p-2 border border-black/10 text-sm" data-testid="blog-title-input" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Slug (URL)</label>
              <input type="text" value={editing.slug || ''} onChange={e => setEditing(prev => ({ ...prev, slug: e.target.value }))} className="w-full p-2 border border-black/10 text-sm" placeholder="авто из заголовка" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Категория</label>
              <select value={editing.category || 'sauny'} onChange={e => setEditing(prev => ({ ...prev, category: e.target.value }))} className="w-full p-2 border border-black/10 text-sm bg-white">
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Теги (через запятую)</label>
              <input type="text" value={(editing.tags || []).join(', ')} onChange={e => setEditing(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))} className="w-full p-2 border border-black/10 text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Meta Description (SEO)</label>
            <input type="text" value={editing.meta_description || ''} onChange={e => setEditing(prev => ({ ...prev, meta_description: e.target.value }))} className="w-full p-2 border border-black/10 text-sm" />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Краткое описание</label>
            <textarea value={editing.excerpt || ''} onChange={e => setEditing(prev => ({ ...prev, excerpt: e.target.value }))} className="w-full p-2 border border-black/10 text-sm" rows={2} />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Обложка</label>
            <div className="flex items-start gap-3">
              {editing.cover_image && <img src={editing.cover_image} alt="" className="w-32 h-20 object-cover border" />}
              <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadCover(e.target.files[0])} />
              <button onClick={() => coverRef.current?.click()} className="px-3 py-1.5 border border-black/10 text-xs text-gray-500 hover:bg-gray-50"><Upload size={12} className="inline mr-1" />Загрузить</button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Контент (Markdown)</label>
            <textarea value={editing.content || ''} onChange={e => setEditing(prev => ({ ...prev, content: e.target.value }))} className="w-full p-2 border border-black/10 text-sm font-mono" rows={20} data-testid="blog-content-input" />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={editing.published || false} onChange={e => setEditing(prev => ({ ...prev, published: e.target.checked }))} className="rounded" />
            <span className="text-sm text-gray-600">Опубликовать</span>
          </label>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="blog-admin">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#1A1A1A]">Блог ({articles.length})</h2>
        <button onClick={() => setEditing({ title: '', category: 'sauny', published: false, tags: [], content: '' })} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]" data-testid="blog-add">
          <Plus size={16} /> Новая статья
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-gray-400">Загрузка...</div>
      ) : (
        <div className="space-y-2">
          {articles.map(article => (
            <div key={article.slug} className="flex items-center gap-4 p-4 border border-black/5 bg-[#F9F9F7]" data-testid={`blog-item-${article.slug}`}>
              {article.cover_image ? (
                <img src={article.cover_image} alt="" className="w-16 h-10 object-cover flex-shrink-0 border" />
              ) : (
                <div className="w-16 h-10 bg-[#1A1A1A] flex items-center justify-center flex-shrink-0"><span className="text-[#C6A87C] text-xs">WM</span></div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs text-[#C6A87C] uppercase font-medium">{article.category}</span>
                  {article.published ? <Eye size={12} className="text-green-500" /> : <EyeOff size={12} className="text-gray-300" />}
                </div>
                <p className="text-sm font-medium text-[#1A1A1A] truncate">{article.title}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => setEditing({ ...article, _existing: true })} className="p-1.5 text-gray-400 hover:text-[#C6A87C]"><Pencil size={14} /></button>
                <button onClick={() => deleteArticle(article.slug)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
