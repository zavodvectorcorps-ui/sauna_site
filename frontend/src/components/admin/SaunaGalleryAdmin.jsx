import { useState, useEffect, useCallback } from 'react';
import { Plus, Save, Upload, Eye, EyeOff, Check, Trash2, Image } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;
const CALCULATOR_API_URL = 'https://wm-kalkulator.pl';

const GalleryEditorSimple = ({ image, onSave, onDelete, onImageUpload }) => {
  const [data, setData] = useState(image);
  return (
    <div className="border border-black/5 p-2">
      <div className="aspect-square bg-[#F2F2F0] mb-2 relative overflow-hidden">
        {data.url ? <img src={data.url} alt={data.alt} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-[#8C8C8C]"><Image size={32} /></div>}
        <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 cursor-pointer transition-opacity">
          <Upload size={24} className="text-white" />
          <input type="file" accept="image/*" className="hidden" onChange={(e) => { onImageUpload(e.target.files[0], (url) => { const newData = { ...data, url }; setData(newData); onSave(newData); }); }} />
        </label>
      </div>
      <input value={data.alt} onChange={(e) => setData({ ...data, alt: e.target.value })} placeholder="Описание" className="w-full p-1 border border-black/10 text-xs mb-2" />
      <div className="flex gap-1">
        <button onClick={() => onSave(data)} className="flex-1 p-1 bg-[#C6A87C] text-white text-xs"><Check size={12} className="mx-auto" /></button>
        <button onClick={onDelete} className="p-1 bg-red-500 text-white text-xs"><Trash2 size={12} /></button>
      </div>
    </div>
  );
};

export const SaunaGalleryAdmin = ({ authHeader, showMessage, activeSubTab }) => {
  const [galleryConfig, setGalleryConfig] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [apiImages, setApiImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const response = await fetch(url, { ...options, headers: { ...options.headers, 'Authorization': authHeader } });
    if (response.status === 401) throw new Error('Unauthorized');
    return response;
  }, [authHeader]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [galleryRes, galleryConfigRes, apiRes] = await Promise.all([
        fetchWithAuth(`${API}/api/admin/gallery`),
        fetch(`${API}/api/settings/gallery`),
        fetch(`${API}/api/sauna/prices`),
      ]);
      setGallery(await galleryRes.json());
      setGalleryConfig(await galleryConfigRes.json());
      const apiDataJson = await apiRes.json();
      const extracted = [];
      apiDataJson.models?.forEach((model) => {
        if (model.imageUrl) {
          const imageUrl = model.imageUrl.startsWith('http') ? model.imageUrl : `${CALCULATOR_API_URL}${model.imageUrl}`;
          extracted.push({ url: imageUrl, name: model.name, type: 'model' });
        }
        model.galleryImages?.forEach((img) => {
          const imgUrl = img.startsWith('http') ? img : `${CALCULATOR_API_URL}${img}`;
          extracted.push({ url: imgUrl, name: `${model.name} (галерея)`, type: 'gallery' });
        });
      });
      apiDataJson.categories?.forEach((category) => {
        category.options?.forEach((option) => {
          if (option.imageUrl) {
            const imgUrl = option.imageUrl.startsWith('http') ? option.imageUrl : `${CALCULATOR_API_URL}${option.imageUrl}`;
            extracted.push({ url: imgUrl, name: option.namePl || option.name, type: 'option' });
          }
        });
      });
      setApiImages(extracted);
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
      callback(data.url.startsWith('http') ? data.url : `${API}${data.url}`);
      showMessage('success', 'Фото загружено');
    } catch { showMessage('error', 'Ошибка загрузки'); }
  };

  const addGalleryImage = async () => {
    const newImage = { id: `img_${Date.now()}`, url: '', alt: 'Новое фото', category: 'all', source: 'custom', active: true, sort_order: gallery.length };
    try {
      await fetchWithAuth(`${API}/api/admin/gallery`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newImage) });
      showMessage('success', 'Фото добавлено');
      fetchData();
    } catch { showMessage('error', 'Ошибка добавления'); }
  };

  const saveGalleryImage = async (image) => {
    try {
      await fetchWithAuth(`${API}/api/admin/gallery/${image.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(image) });
      showMessage('success', 'Фото сохранено');
    } catch { showMessage('error', 'Ошибка сохранения'); }
  };

  const deleteGalleryImage = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить это фото?')) return;
    try {
      await fetchWithAuth(`${API}/api/admin/gallery/${id}`, { method: 'DELETE' });
      showMessage('success', 'Фото удалено');
      fetchData();
    } catch { showMessage('error', 'Ошибка удаления'); }
  };

  const saveGalleryConfig = async () => {
    try {
      await fetchWithAuth(`${API}/api/admin/settings/gallery`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(galleryConfig) });
      showMessage('success', 'Настройки галереи сохранены');
    } catch { showMessage('error', 'Ошибка сохранения'); }
  };

  const toggleApiImage = (imageUrl) => {
    const hidden = galleryConfig.hidden_api_images || [];
    if (hidden.includes(imageUrl)) {
      setGalleryConfig({ ...galleryConfig, hidden_api_images: hidden.filter(url => url !== imageUrl) });
    } else {
      setGalleryConfig({ ...galleryConfig, hidden_api_images: [...hidden, imageUrl] });
    }
  };

  if (loading || !galleryConfig) return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-[#C6A87C] border-t-transparent rounded-full animate-spin" /></div>;

  if (activeSubTab === 'gallery') {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#1A1A1A]">Галерея</h2>
          <div className="flex gap-2">
            <label className="flex items-center gap-2 bg-[#1A1A1A] text-white px-4 py-2 cursor-pointer hover:bg-black">
              <Upload size={16} /> Массовая загрузка
              <input type="file" accept="image/*" multiple className="hidden" onChange={async (e) => {
                const files = Array.from(e.target.files);
                for (const file of files) {
                  await handleImageUpload(file, async (url) => {
                    const newImage = { id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, url, alt: file.name.replace(/\.[^/.]+$/, ''), category: 'all', active: true, sort_order: gallery.length };
                    await fetchWithAuth(`${API}/api/admin/gallery`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newImage) });
                  });
                }
                showMessage('success', `Загружено ${files.length} фото`);
                fetchData();
              }} />
            </label>
            <button onClick={addGalleryImage} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]"><Plus size={16} /> Добавить фото</button>
          </div>
        </div>
        <div className="mb-6 p-4 bg-[#F9F9F7] border border-black/5">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={galleryConfig.show_api_images} onChange={(e) => {
              const newConfig = { ...galleryConfig, show_api_images: e.target.checked };
              setGalleryConfig(newConfig);
              fetchWithAuth(`${API}/api/admin/settings/gallery`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newConfig) }).then(() => showMessage('success', 'Настройка сохранена'));
            }} className="w-5 h-5 accent-[#C6A87C]" />
            <div><span className="font-medium">Показывать фото из API калькулятора</span><p className="text-sm text-[#8C8C8C]">Автоматически добавлять фото моделей саун из внешнего API</p></div>
          </label>
        </div>
        {gallery.length === 0 && !galleryConfig.show_api_images ? (
          <div className="text-center py-12 text-[#8C8C8C] border border-dashed border-black/10"><p>Галерея пуста</p><p className="text-sm mt-2">Загрузите фото или включите фото из API</p></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {gallery.map((img) => <GalleryEditorSimple key={img.id} image={img} onSave={saveGalleryImage} onDelete={() => deleteGalleryImage(img.id)} onImageUpload={handleImageUpload} />)}
          </div>
        )}
      </div>
    );
  }

  if (activeSubTab === 'api_images') {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#1A1A1A]">Фото из API</h2>
          <button onClick={saveGalleryConfig} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]"><Save size={16} /> Сохранить</button>
        </div>
        <div className="mb-6 p-4 bg-[#F9F9F7] border border-black/5">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={galleryConfig.show_api_images} onChange={(e) => setGalleryConfig({ ...galleryConfig, show_api_images: e.target.checked })} className="w-5 h-5 accent-[#C6A87C]" />
            <div><span className="font-medium">Показывать фото из API</span><p className="text-sm text-[#8C8C8C]">Включите, чтобы отображать фото из внешнего API калькулятора в галерее</p></div>
          </label>
        </div>
        {galleryConfig.show_api_images && (
          <>
            <p className="text-sm text-[#8C8C8C] mb-4">Выберите, какие фото показывать в галерее. Кликните на фото чтобы скрыть/показать.<br /><span className="text-[#C6A87C]">Найдено фото: {apiImages.length}</span></p>
            {apiImages.length === 0 ? (
              <div className="text-center py-12 text-[#8C8C8C]"><p>Не удалось загрузить фото из API.</p><p className="text-sm mt-2">Внешний сервис временно недоступен.</p></div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {apiImages.map((img, index) => {
                  const isHidden = galleryConfig.hidden_api_images?.includes(img.url);
                  return (
                    <div key={`${img.url}-${index}`} className={`border p-2 cursor-pointer transition-all ${isHidden ? 'border-red-300 bg-red-50 opacity-60' : 'border-green-300 bg-green-50'}`} onClick={() => toggleApiImage(img.url)}>
                      <div className="aspect-square mb-2 overflow-hidden bg-[#F2F2F0] relative">
                        <img src={img.url} alt={img.name} className="w-full h-full object-cover" loading="lazy" />
                        <div className={`absolute top-1 right-1 w-6 h-6 flex items-center justify-center ${isHidden ? 'bg-red-500' : 'bg-green-500'} text-white`}>{isHidden ? <EyeOff size={14} /> : <Eye size={14} />}</div>
                      </div>
                      <p className="text-xs font-medium truncate">{img.name}</p>
                      <p className="text-[10px] text-[#8C8C8C]">{img.type === 'model' ? 'Модель' : img.type === 'gallery' ? 'Галерея' : 'Опция'}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return null;
};
