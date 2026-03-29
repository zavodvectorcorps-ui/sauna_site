import { useState, useEffect, useCallback } from 'react';
import { Save, GripVertical, ChevronUp, ChevronDown, Loader2, Monitor, Smartphone } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const ALL_SAUNA_SECTIONS = [
  'hero', 'specialoffer', 'socialproof', 'models', 'promofeatures', 'advantages',
  'videoreviews', 'promobanner', 'installment', 'calculator', 'gallery', 'stock',
  'reviews', 'faq', 'orderprocess', 'about', 'contact'
];

const sectionNames = {
  hero: 'Hero (Главный экран)',
  specialoffer: 'Спецпредложение',
  socialproof: 'Социальное доказательство',
  models: 'Модели саун',
  promofeatures: 'Промо-преимущества',
  advantages: '7 фактов / Преимущества',
  videoreviews: 'Видео-обзоры',
  promobanner: 'Промо-баннер',
  installment: 'Рассрочка',
  calculator: 'Калькулятор',
  gallery: 'Галерея',
  stock: 'Сауны в наличии',
  reviews: 'Отзывы',
  faq: 'FAQ',
  orderprocess: 'Процесс заказа',
  about: 'О компании',
  contact: 'Контакты',
};

export const SaunaCatalogSectionsAdmin = ({ authHeader, showMessage, activeSubTab }) => {
  const [catalogInfo, setCatalogInfo] = useState(null);
  const [catalogUploading, setCatalogUploading] = useState(false);
  const [sectionOrder, setSectionOrder] = useState(null);
  const [visibility, setVisibility] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const response = await fetch(url, { ...options, headers: { ...options.headers, 'Authorization': authHeader } });
    if (response.status === 401) throw new Error('Unauthorized');
    return response;
  }, [authHeader]);

  useEffect(() => {
    (async () => {
      try {
        const [catRes, secRes, visRes] = await Promise.all([
          fetch(`${API}/api/catalog/info`),
          fetch(`${API}/api/settings/sections`),
          fetch(`${API}/api/settings/visibility`),
        ]);
        if (catRes.ok) setCatalogInfo(await catRes.json());
        const secData = await secRes.json();
        const existing = secData.sections || [];
        const orderSections = ['hero', 'models', 'calculator', 'gallery', 'stock', 'reviews', 'faq', 'orderprocess', 'about', 'contact'];
        const missing = orderSections.filter(s => !existing.includes(s));
        setSectionOrder({ ...secData, sections: [...existing, ...missing] });
        const visData = await visRes.json();
        setVisibility(visData.sauna || {});
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

  const toggleVis = (section, device) => {
    setVisibility(prev => {
      const current = prev[section] || { desktop: true, mobile: true };
      return { ...prev, [section]: { ...current, [device]: !current[device] } };
    });
  };

  const saveVisibility = async () => {
    try {
      const visRes = await fetch(`${API}/api/settings/visibility`);
      const visData = await visRes.json();
      await fetchWithAuth(`${API}/api/admin/settings/visibility`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...visData, sauna: visibility }),
      });
      showMessage('success', 'Видимость секций сохранена');
    } catch { showMessage('error', 'Ошибка сохранения видимости'); }
  };

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
          <button onClick={saveSectionOrder} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]" data-testid="save-section-order"><Save size={16} /> Сохранить</button>
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

  if (activeSubTab === 'visibility') {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Видимость секций (Сауны)</h2>
            <p className="text-sm text-[#8C8C8C] mt-1">Управляйте видимостью каждого блока на десктопе и мобильных устройствах</p>
          </div>
          <button onClick={saveVisibility} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]" data-testid="save-sauna-visibility"><Save size={16} /> Сохранить</button>
        </div>
        <div className="bg-white border border-black/5 overflow-hidden">
          <div className="grid grid-cols-[1fr_80px_80px] gap-0 p-4 border-b border-black/5 bg-[#F9F9F7] text-xs font-semibold text-[#8C8C8C] uppercase tracking-wider">
            <span>Секция</span>
            <span className="text-center flex items-center justify-center gap-1"><Monitor size={14} /> ПК</span>
            <span className="text-center flex items-center justify-center gap-1"><Smartphone size={14} /> Моб.</span>
          </div>
          {ALL_SAUNA_SECTIONS.map(section => {
            const v = visibility[section] || { desktop: true, mobile: true };
            const dOn = v.desktop !== false;
            const mOn = v.mobile !== false;
            return (
              <div key={section} className="grid grid-cols-[1fr_80px_80px] gap-0 p-4 border-b border-black/5 last:border-b-0 items-center" data-testid={`vis-sauna-${section}`}>
                <span className="text-sm font-medium text-[#1A1A1A]">{sectionNames[section] || section}</span>
                <div className="flex justify-center">
                  <button
                    onClick={() => toggleVis(section, 'desktop')}
                    className={`w-10 h-6 rounded-full relative transition-colors ${dOn ? 'bg-[#C6A87C]' : 'bg-[#D4D4D4]'}`}
                    data-testid={`vis-sauna-${section}-desktop`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${dOn ? 'left-[18px]' : 'left-0.5'}`} />
                  </button>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => toggleVis(section, 'mobile')}
                    className={`w-10 h-6 rounded-full relative transition-colors ${mOn ? 'bg-[#C6A87C]' : 'bg-[#D4D4D4]'}`}
                    data-testid={`vis-sauna-${section}-mobile`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${mOn ? 'left-[18px]' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
};
