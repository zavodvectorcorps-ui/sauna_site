import { useState, useEffect, useCallback } from 'react';
import { Save, GripVertical, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export const SaunaCatalogSectionsAdmin = ({ authHeader, showMessage, activeSubTab }) => {
  const [catalogInfo, setCatalogInfo] = useState(null);
  const [catalogUploading, setCatalogUploading] = useState(false);
  const [sectionOrder, setSectionOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const response = await fetch(url, { ...options, headers: { ...options.headers, 'Authorization': authHeader } });
    if (response.status === 401) throw new Error('Unauthorized');
    return response;
  }, [authHeader]);

  useEffect(() => {
    (async () => {
      try {
        const [catRes, secRes] = await Promise.all([
          fetch(`${API}/api/catalog/info`),
          fetch(`${API}/api/settings/sections`),
        ]);
        if (catRes.ok) setCatalogInfo(await catRes.json());
        setSectionOrder(await secRes.json());
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const handleCatalogUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) { showMessage('error', 'Только PDF-файлы'); return; }
    setCatalogUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API}/api/admin/catalog/upload`, { method: 'POST', headers: { 'Authorization': authHeader }, body: formData });
      if (res.ok) {
        showMessage('success', 'Каталог загружен');
        const infoRes = await fetch(`${API}/api/catalog/info`);
        if (infoRes.ok) setCatalogInfo(await infoRes.json());
      } else { const data = await res.json(); showMessage('error', data.detail || 'Ошибка загрузки'); }
    } catch { showMessage('error', 'Ошибка загрузки каталога'); }
    setCatalogUploading(false);
    e.target.value = '';
  };

  const deleteCatalog = async () => {
    try { const res = await fetchWithAuth(`${API}/api/admin/catalog`, { method: 'DELETE' }); if (res.ok) { showMessage('success', 'Каталог удалён'); setCatalogInfo({ available: false }); } } catch { showMessage('error', 'Ошибка удаления'); }
  };

  const saveSectionOrder = async () => {
    try { await fetchWithAuth(`${API}/api/admin/settings/sections`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sectionOrder) }); showMessage('success', 'Порядок секций сохранён'); } catch { showMessage('error', 'Ошибка сохранения'); }
  };

  const moveSection = (index, direction) => {
    const newSections = [...sectionOrder.sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newSections.length) return;
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    setSectionOrder({ ...sectionOrder, sections: newSections });
  };

  const sectionNames = { hero: 'Hero (Главный экран)', models: 'Модели саун', calculator: 'Калькулятор', gallery: 'Галерея', stock: 'Сауны в наличии', reviews: 'Отзывы', faq: 'FAQ', about: 'О компании', contact: 'Контакты' };

  if (loading) return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-[#C6A87C] border-t-transparent rounded-full animate-spin" /></div>;

  if (activeSubTab === 'catalog') {
    return (
      <div>
        <h2 className="text-xl font-bold text-[#1A1A1A] mb-6">Каталог PDF</h2>
        <p className="text-sm text-[#595959] mb-6">Загрузите PDF-каталог. Кнопка "Pobierz katalog" автоматически появится в блоке Hero, в sticky-панели и в формах обратной связи после отправки.</p>
        <div className="bg-white border border-black/5 p-6">
          {catalogInfo?.available ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#F9F9F7] border border-black/5">
                <div><p className="font-medium text-[#1A1A1A]">{catalogInfo.filename || 'catalog.pdf'}</p><p className="text-xs text-[#8C8C8C]">{catalogInfo.size ? `${(catalogInfo.size / 1024 / 1024).toFixed(1)} МБ` : ''}</p></div>
                <div className="flex gap-2">
                  <a href={`${API}/api/catalog/download`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-sm border border-[#339DC7] text-[#339DC7] hover:bg-[#339DC7]/5" data-testid="admin-catalog-preview">Просмотр</a>
                  <button onClick={deleteCatalog} className="px-4 py-2 text-sm border border-red-300 text-red-500 hover:bg-red-50" data-testid="admin-catalog-delete">Удалить</button>
                </div>
              </div>
              <div><label className="block text-xs text-[#8C8C8C] mb-2">Заменить каталог</label><input type="file" accept=".pdf" onChange={handleCatalogUpload} disabled={catalogUploading} className="text-sm" data-testid="admin-catalog-replace" /></div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-[#595959] mb-4">Каталог ещё не загружен</p>
              <label className="inline-flex items-center gap-2 px-6 py-3 bg-[#C6A87C] text-white text-sm font-medium cursor-pointer hover:bg-[#B09060] transition-colors">
                {catalogUploading ? <Loader2 size={16} className="animate-spin" /> : null}{catalogUploading ? 'Загрузка...' : 'Загрузить PDF-каталог'}
                <input type="file" accept=".pdf" onChange={handleCatalogUpload} disabled={catalogUploading} className="hidden" data-testid="admin-catalog-upload" />
              </label>
              <p className="text-xs text-[#8C8C8C] mt-2">Максимум 50 МБ, только PDF</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (activeSubTab === 'sections' && sectionOrder) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#1A1A1A]">Порядок секций</h2>
          <button onClick={saveSectionOrder} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]"><Save size={16} /> Сохранить</button>
        </div>
        <div className="space-y-2">
          {sectionOrder.sections.map((section, index) => (
            <div key={section} className="flex items-center gap-4 p-4 bg-[#F9F9F7] border border-black/5">
              <GripVertical size={20} className="text-[#8C8C8C]" />
              <span className="flex-1 font-medium">{sectionNames[section] || section}</span>
              <div className="flex gap-1">
                <button onClick={() => moveSection(index, 'up')} disabled={index === 0} className="p-1 hover:bg-white disabled:opacity-30"><ChevronUp size={20} /></button>
                <button onClick={() => moveSection(index, 'down')} disabled={index === sectionOrder.sections.length - 1} className="p-1 hover:bg-white disabled:opacity-30"><ChevronDown size={20} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};
