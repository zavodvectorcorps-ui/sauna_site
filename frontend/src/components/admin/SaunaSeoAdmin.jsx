import { useState, useEffect, useCallback } from 'react';
import { Save, Upload } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export const SaunaSeoAdmin = ({ authHeader, showMessage }) => {
  const [seoSettings, setSeoSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const response = await fetch(url, { ...options, headers: { ...options.headers, 'Authorization': authHeader } });
    if (response.status === 401) throw new Error('Unauthorized');
    return response;
  }, [authHeader]);

  useEffect(() => {
    (async () => {
      try { const res = await fetch(`${API}/api/settings/seo`); setSeoSettings(await res.json()); } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const saveSeoSettings = async () => {
    try { await fetchWithAuth(`${API}/api/admin/settings/seo`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(seoSettings) }); showMessage('success', 'SEO настройки сохранены'); } catch { showMessage('error', 'Ошибка сохранения'); }
  };

  const handleImageUpload = async (file, field) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetchWithAuth(`${API}/api/admin/upload`, { method: 'POST', body: formData });
      const data = await response.json();
      // Use functional update to avoid stale closure overwriting user's text edits
      setSeoSettings(prev => ({ ...prev, [field]: data.url }));
      showMessage('success', 'Фото загружено');
    } catch { showMessage('error', 'Ошибка загрузки'); }
  };

  if (loading || !seoSettings) return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-[#C6A87C] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#1A1A1A]">SEO-оптимизация</h2>
        <button onClick={saveSeoSettings} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]"><Save size={16} /> Сохранить</button>
      </div>
      <p className="text-sm text-[#8C8C8C] mb-6">Настройте мета-теги для поисковых систем.</p>
      <div className="space-y-6">
        <div className="border border-black/5 p-6">
          <h3 className="font-semibold mb-4">Title (заголовок страницы)</h3>
          <p className="text-xs text-[#8C8C8C] mb-3">Рекомендуется до 60 символов.</p>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs text-[#8C8C8C] mb-1">Title (PL)</label><input type="text" value={seoSettings.title_pl} onChange={(e) => setSeoSettings(prev => ({ ...prev, title_pl: e.target.value }))} className="w-full p-2 border border-black/10 text-sm" /><span className="text-[10px] text-[#8C8C8C]">{seoSettings.title_pl?.length || 0}/60</span></div>
            <div><label className="block text-xs text-[#8C8C8C] mb-1">Title (EN)</label><input type="text" value={seoSettings.title_en} onChange={(e) => setSeoSettings(prev => ({ ...prev, title_en: e.target.value }))} className="w-full p-2 border border-black/10 text-sm" /><span className="text-[10px] text-[#8C8C8C]">{seoSettings.title_en?.length || 0}/60</span></div>
          </div>
        </div>
        <div className="border border-black/5 p-6">
          <h3 className="font-semibold mb-4">Meta Description</h3>
          <p className="text-xs text-[#8C8C8C] mb-3">Рекомендуется 120-160 символов.</p>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs text-[#8C8C8C] mb-1">Description (PL)</label><textarea value={seoSettings.description_pl} onChange={(e) => setSeoSettings(prev => ({ ...prev, description_pl: e.target.value }))} className="w-full p-2 border border-black/10 text-sm h-20" /><span className="text-[10px] text-[#8C8C8C]">{seoSettings.description_pl?.length || 0}/160</span></div>
            <div><label className="block text-xs text-[#8C8C8C] mb-1">Description (EN)</label><textarea value={seoSettings.description_en} onChange={(e) => setSeoSettings(prev => ({ ...prev, description_en: e.target.value }))} className="w-full p-2 border border-black/10 text-sm h-20" /><span className="text-[10px] text-[#8C8C8C]">{seoSettings.description_en?.length || 0}/160</span></div>
          </div>
        </div>
        <div className="border border-black/5 p-6">
          <h3 className="font-semibold mb-4">Keywords</h3>
          <p className="text-xs text-[#8C8C8C] mb-3">Через запятую.</p>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs text-[#8C8C8C] mb-1">Keywords (PL)</label><textarea value={seoSettings.keywords_pl} onChange={(e) => setSeoSettings(prev => ({ ...prev, keywords_pl: e.target.value }))} className="w-full p-2 border border-black/10 text-sm h-16" /></div>
            <div><label className="block text-xs text-[#8C8C8C] mb-1">Keywords (EN)</label><textarea value={seoSettings.keywords_en} onChange={(e) => setSeoSettings(prev => ({ ...prev, keywords_en: e.target.value }))} className="w-full p-2 border border-black/10 text-sm h-16" /></div>
          </div>
        </div>
        <div className="border border-black/5 p-6">
          <h3 className="font-semibold mb-4">Open Graph и прочее</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-[#8C8C8C] mb-1">OG Image (превью при шеринге)</label>
              <div className="flex gap-2">
                <input type="text" value={seoSettings.og_image} onChange={(e) => setSeoSettings(prev => ({ ...prev, og_image: e.target.value }))} className="flex-1 p-2 border border-black/10 text-sm" placeholder="/api/images/... или https://example.com/image.jpg" />
                <label className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-white cursor-pointer hover:bg-black text-sm"><Upload size={14} /><input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files[0], 'og_image')} /></label>
              </div>
              {seoSettings.og_image && <img src={seoSettings.og_image.startsWith('/') ? `${API}${seoSettings.og_image}` : seoSettings.og_image} alt="OG Preview" className="mt-2 h-24 object-cover border" />}
            </div>
            <div>
              <label className="block text-xs text-[#8C8C8C] mb-1">Canonical URL</label>
              <input type="text" value={seoSettings.canonical_url} onChange={(e) => setSeoSettings(prev => ({ ...prev, canonical_url: e.target.value }))} className="w-full p-2 border border-black/10 text-sm" placeholder="https://wm-sauna.pl" />
              <p className="text-[10px] text-[#8C8C8C] mt-1">Основной URL сайта для поисковых систем</p>
            </div>
          </div>
        </div>
        <div className="border border-black/5 p-6">
          <h3 className="font-semibold mb-4">Предпросмотр в поиске Google</h3>
          <div className="bg-white p-4 border border-black/10 max-w-lg">
            <p className="text-[#1a0dab] text-lg leading-tight mb-1 truncate" style={{ fontFamily: 'Arial' }}>{seoSettings.title_pl || 'Заголовок страницы'}</p>
            <p className="text-[#006621] text-sm mb-1 truncate" style={{ fontFamily: 'Arial' }}>{seoSettings.canonical_url || 'https://wm-sauna.pl'}</p>
            <p className="text-[#545454] text-sm line-clamp-2" style={{ fontFamily: 'Arial' }}>{seoSettings.description_pl || 'Описание страницы...'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
