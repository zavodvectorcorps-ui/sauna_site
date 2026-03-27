import { useState, useEffect, useRef } from 'react';
import { Save, Plus, Trash2, Upload, Image, ArrowUp, ArrowDown } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export const SaunaAdvantagesAdmin = ({ authHeader, showMessage }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const fetchWithAuth = (url, opts = {}) =>
    fetch(url, { ...opts, headers: { ...opts.headers, Authorization: authHeader, 'Content-Type': 'application/json' } });

  useEffect(() => {
    fetch(`${API}/api/settings/sauna-advantages`)
      .then(r => r.json())
      .then(d => setSettings(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    try {
      await fetchWithAuth(`${API}/api/admin/settings/sauna-advantages`, { method: 'PUT', body: JSON.stringify(settings) });
      showMessage('success', 'Сохранено');
    } catch {
      showMessage('error', 'Ошибка сохранения');
    }
  };

  const uploadImage = async (file) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API}/api/admin/upload`, {
        method: 'POST',
        headers: { Authorization: authHeader },
        body: fd,
      });
      const data = await res.json();
      if (data.url) {
        setSettings(prev => ({ ...prev, image_url: data.url }));
        showMessage('success', 'Фото загружено');
      }
    } catch {
      showMessage('error', 'Ошибка загрузки фото');
    }
    setUploading(false);
  };

  const addItem = () => {
    const num = (settings.items?.length || 0) + 1;
    setSettings(prev => ({
      ...prev,
      items: [
        ...(prev.items || []),
        { id: `adv_${Date.now()}`, num, title: '', desc: '', badge: '', side: num % 2 === 0 ? 'right' : 'left' },
      ],
    }));
  };

  const updateItem = (idx, field, value) => {
    setSettings(prev => ({
      ...prev,
      items: prev.items.map((it, i) => (i === idx ? { ...it, [field]: value } : it)),
    }));
  };

  const removeItem = (idx) => {
    setSettings(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx).map((it, i) => ({ ...it, num: i + 1 })),
    }));
  };

  const moveItem = (idx, dir) => {
    setSettings(prev => {
      const items = [...prev.items];
      const target = idx + dir;
      if (target < 0 || target >= items.length) return prev;
      [items[idx], items[target]] = [items[target], items[idx]];
      return { ...prev, items: items.map((it, i) => ({ ...it, num: i + 1 })) };
    });
  };

  if (loading || !settings) return <div className="p-8 text-center text-gray-400">Загрузка...</div>;

  return (
    <div data-testid="sauna-advantages-admin">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#1A1A1A]">7 фактов (Преимущества сауны)</h2>
        <button onClick={save} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]" data-testid="advantages-save">
          <Save size={16} /> Сохранить
        </button>
      </div>

      {/* Header texts */}
      <div className="border border-black/5 p-5 bg-[#F9F9F7] mb-4 space-y-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Надзаголовок</label>
          <input
            type="text"
            value={settings.subtitle || ''}
            onChange={e => setSettings(prev => ({ ...prev, subtitle: e.target.value }))}
            className="w-full p-2 border border-black/10 text-sm"
            placeholder="Pokazujemy na schemacie..."
            data-testid="advantages-subtitle"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Заголовок</label>
          <input
            type="text"
            value={settings.title || ''}
            onChange={e => setSettings(prev => ({ ...prev, title: e.target.value }))}
            className="w-full p-2 border border-black/10 text-sm"
            placeholder="Siedem faktów..."
            data-testid="advantages-title"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Описание</label>
          <textarea
            value={settings.description || ''}
            onChange={e => setSettings(prev => ({ ...prev, description: e.target.value }))}
            className="w-full p-2 border border-black/10 text-sm"
            rows={2}
            placeholder="Suche skandynawskie drewno..."
            data-testid="advantages-description"
          />
        </div>
      </div>

      {/* Image upload */}
      <div className="border border-black/5 p-5 bg-[#F9F9F7] mb-4">
        <label className="block text-xs text-gray-400 mb-2">Фото схемы сауны</label>
        <div className="flex items-start gap-4">
          {settings.image_url && (
            <img
              src={settings.image_url.startsWith('/') ? `${API}${settings.image_url}` : settings.image_url}
              alt="Схема"
              className="w-40 h-28 object-contain bg-white border border-black/5 rounded"
              data-testid="advantages-image-preview"
            />
          )}
          <div className="flex-1 space-y-2">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 border border-black/10 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              data-testid="advantages-upload-btn"
            >
              {uploading ? 'Загрузка...' : <><Upload size={14} /> Загрузить фото</>}
            </button>
            <p className="text-xs text-gray-400">Рекомендуется: фото сауны в разрезе на прозрачном/белом фоне (PNG/WebP)</p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {settings.items?.map((item, idx) => (
          <div key={item.id} className="border border-black/5 p-4 bg-[#F9F9F7]" data-testid={`advantage-item-${idx}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#C6A87C] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs">{item.num}</span>
              </div>
              <div className="flex-1 text-sm font-semibold text-[#1A1A1A] truncate">{item.title || `Пункт ${item.num}`}</div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => moveItem(idx, -1)} disabled={idx === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30">
                  <ArrowUp size={14} />
                </button>
                <button onClick={() => moveItem(idx, 1)} disabled={idx === settings.items.length - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30">
                  <ArrowDown size={14} />
                </button>
                <button onClick={() => removeItem(idx)} className="p-1 text-red-400 hover:text-red-600" data-testid={`advantage-delete-${idx}`}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Заголовок</label>
                <input
                  type="text"
                  value={item.title}
                  onChange={e => updateItem(idx, 'title', e.target.value)}
                  className="w-full p-2 border border-black/10 text-sm"
                  data-testid={`advantage-title-${idx}`}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Описание</label>
                <textarea
                  value={item.desc}
                  onChange={e => updateItem(idx, 'desc', e.target.value)}
                  className="w-full p-2 border border-black/10 text-sm"
                  rows={2}
                  data-testid={`advantage-desc-${idx}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Бейдж (необязательно)</label>
                  <input
                    type="text"
                    value={item.badge || ''}
                    onChange={e => updateItem(idx, 'badge', e.target.value)}
                    className="w-full p-2 border border-black/10 text-sm"
                    placeholder="напр. Kamienie gratis"
                    data-testid={`advantage-badge-${idx}`}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Сторона (desktop)</label>
                  <select
                    value={item.side || 'left'}
                    onChange={e => updateItem(idx, 'side', e.target.value)}
                    className="w-full p-2 border border-black/10 text-sm bg-white"
                    data-testid={`advantage-side-${idx}`}
                  >
                    <option value="left">Слева</option>
                    <option value="right">Справа</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={addItem} className="mt-4 flex items-center gap-2 px-4 py-2 border border-dashed border-black/15 text-sm text-gray-500 hover:bg-gray-50 w-full justify-center" data-testid="advantage-add">
        <Plus size={14} /> Добавить пункт
      </button>
    </div>
  );
};
