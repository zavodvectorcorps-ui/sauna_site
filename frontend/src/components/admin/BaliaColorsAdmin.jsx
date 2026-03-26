import { useState, useEffect, useCallback } from 'react';
import { Save, Plus, Trash2, Upload, Loader2, Image } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const CATEGORIES = [
  { id: 'spruce', label: 'Drewno Świerkowe' },
  { id: 'thermo', label: 'Drewno Termiczne' },
  { id: 'wpc', label: 'Kompozyt WPC' },
  { id: 'fiberglass', label: 'Fiberglass' },
  { id: 'acrylic', label: 'Akrylowe' },
];

export const BaliaColorsAdmin = ({ authHeader, showMessage }) => {
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);
  const [activeCategory, setActiveCategory] = useState('spruce');

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const response = await fetch(url, { ...options, headers: { ...options.headers, 'Authorization': authHeader } });
    if (response.status === 401) throw new Error('Unauthorized');
    return response;
  }, [authHeader]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/balia/colors`);
      setColors(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const uploadImage = async (file, colorId) => {
    setUploading(colorId);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${API}/api/balia/colors/upload?category=${activeCategory}`, {
        method: 'POST', headers: { 'Authorization': authHeader }, body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        const updated = colors.map(c => c.id === colorId ? { ...c, image: data.url, public_id: data.public_id } : c);
        setColors(updated);
        const color = updated.find(c => c.id === colorId);
        await fetchWithAuth(`${API}/api/balia/colors`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(color),
        });
        showMessage('success', 'Фото загружено');
      }
    } catch { showMessage('error', 'Ошибка загрузки'); }
    setUploading(null);
  };

  const addColor = async () => {
    const newColor = {
      id: `color_${Date.now()}`,
      name: 'Nowy kolor',
      category: activeCategory,
      image: '',
      public_id: '',
      order: filtered.length,
    };
    const updated = [...colors, newColor];
    setColors(updated);
    await fetchWithAuth(`${API}/api/balia/colors`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newColor),
    });
    showMessage('success', 'Цвет добавлен');
  };

  const saveName = async (id, name) => {
    const updated = colors.map(c => c.id === id ? { ...c, name } : c);
    setColors(updated);
    const color = updated.find(c => c.id === id);
    await fetchWithAuth(`${API}/api/balia/colors`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(color),
    });
  };

  const deleteColor = async (id) => {
    if (!window.confirm('Удалить этот цвет?')) return;
    await fetchWithAuth(`${API}/api/balia/colors/${id}`, { method: 'DELETE' });
    setColors(colors.filter(c => c.id !== id));
    showMessage('success', 'Цвет удалён');
  };

  const filtered = colors.filter(c => c.category === activeCategory);

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="animate-spin text-[#C6A87C]" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#1A1A1A]">Цвета купелей</h2>
        <button onClick={addColor} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 text-sm hover:bg-[#B09060]">
          <Plus size={16} /> Добавить цвет
        </button>
      </div>
      <p className="text-sm text-[#8C8C8C] mb-6">Загрузите фото образцов дерева и цветов для каждой категории. Они будут отображаться на сайте купелей в секции «Kolory i materiały».</p>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeCategory === cat.id ? 'bg-[#C6A87C] text-white' : 'bg-[#F9F9F7] text-[#595959] hover:bg-[#C6A87C]/10'}`}
            data-testid={`admin-balia-color-tab-${cat.id}`}
          >
            {cat.label} ({colors.filter(c => c.category === cat.id).length})
          </button>
        ))}
      </div>

      {/* Color swatches grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-[#8C8C8C] border border-dashed border-black/10">
          <p>Нет цветов в этой категории</p>
          <p className="text-sm mt-2">Нажмите «Добавить цвет» чтобы загрузить первый образец</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filtered.map(color => (
            <div key={color.id} className="border border-black/5 p-2 group" data-testid={`admin-balia-color-${color.id}`}>
              <div className="aspect-square bg-[#F2F2F0] relative overflow-hidden mb-2">
                {color.image ? (
                  <img src={color.image} alt={color.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#8C8C8C]"><Image size={24} /></div>
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  {uploading === color.id ? (
                    <Loader2 size={24} className="text-white animate-spin" />
                  ) : (
                    <Upload size={24} className="text-white" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading === color.id}
                    onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0], color.id)}
                  />
                </label>
              </div>
              <input
                value={color.name}
                onChange={(e) => setColors(colors.map(c => c.id === color.id ? { ...c, name: e.target.value } : c))}
                onBlur={(e) => saveName(color.id, e.target.value)}
                className="w-full p-1 border border-black/10 text-xs text-center"
                placeholder="Nazwa koloru"
              />
              <button onClick={() => deleteColor(color.id)} className="w-full mt-1 p-1 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center gap-1">
                <Trash2 size={12} /> Удалить
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
