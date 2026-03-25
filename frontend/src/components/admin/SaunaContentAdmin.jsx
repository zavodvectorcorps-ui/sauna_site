import { useState, useEffect, useCallback } from 'react';
import { Save, Upload } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export const SaunaContentAdmin = ({ authHeader, showMessage, activeSubTab }) => {
  const [gallerySettings, setGallerySettings] = useState(null);
  const [calculatorSettings, setCalculatorSettings] = useState(null);
  const [stockSettings, setStockSettings] = useState(null);
  const [reviewsSettings, setReviewsSettings] = useState(null);
  const [contactSettings, setContactSettings] = useState(null);
  const [footerSettings, setFooterSettings] = useState(null);
  const [heroSettings, setHeroSettings] = useState(null);
  const [aboutSettings, setAboutSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: { ...options.headers, 'Authorization': authHeader },
    });
    if (response.status === 401) throw new Error('Unauthorized');
    return response;
  }, [authHeader]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [gsRes, csRes, ssRes, rsRes, coRes, ftRes, hRes, aRes] = await Promise.all([
        fetch(`${API}/api/settings/gallery-content`),
        fetch(`${API}/api/settings/calculator-content`),
        fetch(`${API}/api/settings/stock`),
        fetch(`${API}/api/settings/reviews-content`),
        fetch(`${API}/api/settings/contact`),
        fetch(`${API}/api/settings/footer`),
        fetch(`${API}/api/settings/hero`),
        fetch(`${API}/api/settings/about`),
      ]);
      setGallerySettings(await gsRes.json());
      setCalculatorSettings(await csRes.json());
      setStockSettings(await ssRes.json());
      setReviewsSettings(await rsRes.json());
      setContactSettings(await coRes.json());
      setFooterSettings(await ftRes.json());
      setHeroSettings(await hRes.json());
      setAboutSettings(await aRes.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const saveSectionContent = async (endpoint, data, name) => {
    try {
      await fetchWithAuth(`${API}/api/admin/settings/${endpoint}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      });
      showMessage('success', `${name} сохранены`);
    } catch { showMessage('error', 'Ошибка сохранения'); }
  };

  const saveHeroSettings = async () => {
    try {
      await fetchWithAuth(`${API}/api/admin/settings/hero`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(heroSettings),
      });
      showMessage('success', 'Настройки Hero сохранены');
    } catch { showMessage('error', 'Ошибка сохранения'); }
  };

  const saveAboutSettings = async () => {
    try {
      await fetchWithAuth(`${API}/api/admin/settings/about`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(aboutSettings),
      });
      showMessage('success', 'Настройки "О компании" сохранены');
    } catch { showMessage('error', 'Ошибка сохранения'); }
  };

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

  if (loading) return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-[#C6A87C] border-t-transparent rounded-full animate-spin" /></div>;

  // Content texts tab
  if (activeSubTab === 'content' && gallerySettings && calculatorSettings && stockSettings && reviewsSettings && contactSettings && footerSettings) {
    const sections = [
      { key: 'gallery', label: 'Галерея (Nasze realizacje)', endpoint: 'gallery-content', data: gallerySettings, setData: setGallerySettings, fields: ['title', 'subtitle'] },
      { key: 'calculator', label: 'Калькулятор', endpoint: 'calculator-content', data: calculatorSettings, setData: setCalculatorSettings, fields: ['title', 'subtitle'] },
      { key: 'stock', label: 'Сауны в наличии', endpoint: 'stock', data: stockSettings, setData: setStockSettings, fields: ['title', 'subtitle'] },
      { key: 'reviews', label: 'Отзывы', endpoint: 'reviews-content', data: reviewsSettings, setData: setReviewsSettings, fields: ['title', 'subtitle'] },
    ];

    return (
      <div>
        <h2 className="text-xl font-bold text-[#1A1A1A] mb-6">Тексты разделов</h2>
        <p className="text-sm text-[#8C8C8C] mb-6">Редактируйте заголовки и описания всех секций сайта</p>
        <div className="space-y-8">
          {sections.map(({ key, label, endpoint, data, setData, fields }) => (
            <div key={key} className="border border-black/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">{label}</h3>
                <button onClick={() => saveSectionContent(endpoint, data, `Настройки ${label}`)} className="flex items-center gap-2 bg-[#C6A87C] text-white px-3 py-1 text-sm hover:bg-[#B09060]">
                  <Save size={14} /> Сохранить
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {fields.includes('title') && (
                  <>
                    <div>
                      <label className="block text-xs text-[#8C8C8C] mb-1">Заголовок (PL)</label>
                      <input type="text" value={data.title_pl} onChange={(e) => setData({ ...data, title_pl: e.target.value })} className="w-full p-2 border border-black/10 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8C8C8C] mb-1">Заголовок (EN)</label>
                      <input type="text" value={data.title_en} onChange={(e) => setData({ ...data, title_en: e.target.value })} className="w-full p-2 border border-black/10 text-sm" />
                    </div>
                  </>
                )}
                {fields.includes('subtitle') && (
                  <>
                    <div>
                      <label className="block text-xs text-[#8C8C8C] mb-1">Подзаголовок (PL)</label>
                      <textarea value={data.subtitle_pl} onChange={(e) => setData({ ...data, subtitle_pl: e.target.value })} className="w-full p-2 border border-black/10 text-sm h-16" />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8C8C8C] mb-1">Подзаголовок (EN)</label>
                      <textarea value={data.subtitle_en} onChange={(e) => setData({ ...data, subtitle_en: e.target.value })} className="w-full p-2 border border-black/10 text-sm h-16" />
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}

          {/* Contact Section */}
          <div className="border border-black/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Контакты</h3>
              <button onClick={() => saveSectionContent('contact', contactSettings, 'Настройки контактов')} className="flex items-center gap-2 bg-[#C6A87C] text-white px-3 py-1 text-sm hover:bg-[#B09060]">
                <Save size={14} /> Сохранить
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs text-[#8C8C8C] mb-1">Заголовок (PL)</label><input type="text" value={contactSettings.title_pl} onChange={(e) => setContactSettings({ ...contactSettings, title_pl: e.target.value })} className="w-full p-2 border border-black/10 text-sm" /></div>
              <div><label className="block text-xs text-[#8C8C8C] mb-1">Заголовок (EN)</label><input type="text" value={contactSettings.title_en} onChange={(e) => setContactSettings({ ...contactSettings, title_en: e.target.value })} className="w-full p-2 border border-black/10 text-sm" /></div>
              <div><label className="block text-xs text-[#8C8C8C] mb-1">Подзаголовок (PL)</label><textarea value={contactSettings.subtitle_pl} onChange={(e) => setContactSettings({ ...contactSettings, subtitle_pl: e.target.value })} className="w-full p-2 border border-black/10 text-sm h-16" /></div>
              <div><label className="block text-xs text-[#8C8C8C] mb-1">Подзаголовок (EN)</label><textarea value={contactSettings.subtitle_en} onChange={(e) => setContactSettings({ ...contactSettings, subtitle_en: e.target.value })} className="w-full p-2 border border-black/10 text-sm h-16" /></div>
              <div><label className="block text-xs text-[#8C8C8C] mb-1">Заголовок формы (PL)</label><input type="text" value={contactSettings.form_title_pl} onChange={(e) => setContactSettings({ ...contactSettings, form_title_pl: e.target.value })} className="w-full p-2 border border-black/10 text-sm" /></div>
              <div><label className="block text-xs text-[#8C8C8C] mb-1">Заголовок формы (EN)</label><input type="text" value={contactSettings.form_title_en} onChange={(e) => setContactSettings({ ...contactSettings, form_title_en: e.target.value })} className="w-full p-2 border border-black/10 text-sm" /></div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="border border-black/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Подвал (Footer)</h3>
              <button onClick={() => saveSectionContent('footer', footerSettings, 'Настройки подвала')} className="flex items-center gap-2 bg-[#C6A87C] text-white px-3 py-1 text-sm hover:bg-[#B09060]">
                <Save size={14} /> Сохранить
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs text-[#8C8C8C] mb-1">Слоган (PL)</label><input type="text" value={footerSettings.tagline_pl} onChange={(e) => setFooterSettings({ ...footerSettings, tagline_pl: e.target.value })} className="w-full p-2 border border-black/10 text-sm" /></div>
              <div><label className="block text-xs text-[#8C8C8C] mb-1">Слоган (EN)</label><input type="text" value={footerSettings.tagline_en} onChange={(e) => setFooterSettings({ ...footerSettings, tagline_en: e.target.value })} className="w-full p-2 border border-black/10 text-sm" /></div>
              <div><label className="block text-xs text-[#8C8C8C] mb-1">Копирайт (PL)</label><input type="text" value={footerSettings.copyright_pl} onChange={(e) => setFooterSettings({ ...footerSettings, copyright_pl: e.target.value })} className="w-full p-2 border border-black/10 text-sm" /></div>
              <div><label className="block text-xs text-[#8C8C8C] mb-1">Копирайт (EN)</label><input type="text" value={footerSettings.copyright_en} onChange={(e) => setFooterSettings({ ...footerSettings, copyright_en: e.target.value })} className="w-full p-2 border border-black/10 text-sm" /></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Hero tab
  if (activeSubTab === 'hero' && heroSettings) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#1A1A1A]">Настройки Hero</h2>
          <button onClick={saveHeroSettings} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]">
            <Save size={16} /> Сохранить
          </button>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Фоновое изображение</label>
            <div className="flex gap-2">
              <input type="url" value={heroSettings.background_image} onChange={(e) => setHeroSettings({ ...heroSettings, background_image: e.target.value })} className="flex-1 p-2 border border-black/10" />
              <label className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-white cursor-pointer hover:bg-black">
                <Upload size={16} />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files[0], (url) => setHeroSettings({ ...heroSettings, background_image: url }))} />
              </label>
            </div>
            {heroSettings.background_image && <img src={heroSettings.background_image} alt="Preview" className="mt-2 h-32 object-cover" />}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Прозрачность наложения: {heroSettings.overlay_opacity ?? 80}%</label>
            <p className="text-xs text-[#8C8C8C] mb-2">0% — фото без наложения, 100% — полностью белый фон</p>
            <input type="range" min="0" max="100" step="5" value={heroSettings.overlay_opacity ?? 80} onChange={(e) => setHeroSettings({ ...heroSettings, overlay_opacity: parseInt(e.target.value) })} className="w-full accent-[#C6A87C]" />
            <div className="flex justify-between text-xs text-[#8C8C8C] mt-1"><span>Фото видно</span><span>Белый фон</span></div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Расположение фона</label>
            <div className="grid grid-cols-3 gap-2">
              {[{ value: 'top', label: 'Верх' }, { value: 'center', label: 'Центр' }, { value: 'bottom', label: 'Низ' }, { value: 'left', label: 'Лево' }, { value: 'right', label: 'Право' }, { value: 'top left', label: 'Верх-лево' }, { value: 'top right', label: 'Верх-право' }, { value: 'bottom left', label: 'Низ-лево' }, { value: 'bottom right', label: 'Низ-право' }].map((opt) => (
                <button key={opt.value} type="button" onClick={() => setHeroSettings({ ...heroSettings, bg_position: opt.value })} className={`py-2 px-3 text-sm border transition-colors ${(heroSettings.bg_position || 'center') === opt.value ? 'border-[#C6A87C] bg-[#C6A87C]/10 text-[#C6A87C] font-medium' : 'border-black/10 hover:border-[#C6A87C]/50'}`}>{opt.label}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Цвет текста</label>
            <div className="flex flex-wrap gap-2">
              {[{ value: '#1A1A1A', label: 'Тёмный', preview: 'bg-[#1A1A1A]' }, { value: '#FFFFFF', label: 'Белый', preview: 'bg-white border border-black/20' }, { value: '#C6A87C', label: 'Золотой', preview: 'bg-[#C6A87C]' }, { value: '#F9F9F7', label: 'Кремовый', preview: 'bg-[#F9F9F7] border border-black/10' }].map((opt) => (
                <button key={opt.value} type="button" onClick={() => setHeroSettings({ ...heroSettings, text_color: opt.value })} className={`flex items-center gap-2 py-2 px-4 text-sm border transition-colors ${(heroSettings.text_color || '#1A1A1A') === opt.value ? 'border-[#C6A87C] bg-[#C6A87C]/10 font-medium' : 'border-black/10 hover:border-[#C6A87C]/50'}`}>
                  <span className={`w-5 h-5 rounded-full ${opt.preview}`} />{opt.label}
                </button>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <label className="text-xs text-[#8C8C8C]">Свой цвет:</label>
              <input type="color" value={heroSettings.text_color || '#1A1A1A'} onChange={(e) => setHeroSettings({ ...heroSettings, text_color: e.target.value })} className="w-8 h-8 border border-black/10 cursor-pointer" />
              <span className="text-xs text-[#8C8C8C]">{heroSettings.text_color || '#1A1A1A'}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div><label className="block text-sm font-medium mb-1">Заголовок (PL)</label><input type="text" value={heroSettings.title_pl} onChange={(e) => setHeroSettings({ ...heroSettings, title_pl: e.target.value })} className="w-full p-2 border border-black/10" /></div>
            <div><label className="block text-sm font-medium mb-1">Заголовок (EN)</label><input type="text" value={heroSettings.title_en} onChange={(e) => setHeroSettings({ ...heroSettings, title_en: e.target.value })} className="w-full p-2 border border-black/10" /></div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div><label className="block text-sm font-medium mb-1">Подзаголовок (PL)</label><textarea value={heroSettings.subtitle_pl} onChange={(e) => setHeroSettings({ ...heroSettings, subtitle_pl: e.target.value })} className="w-full p-2 border border-black/10 h-20" /></div>
            <div><label className="block text-sm font-medium mb-1">Подзаголовок (EN)</label><textarea value={heroSettings.subtitle_en} onChange={(e) => setHeroSettings({ ...heroSettings, subtitle_en: e.target.value })} className="w-full p-2 border border-black/10 h-20" /></div>
          </div>
        </div>
      </div>
    );
  }

  // About tab
  if (activeSubTab === 'about' && aboutSettings) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#1A1A1A]">Настройки "О компании"</h2>
          <button onClick={saveAboutSettings} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]">
            <Save size={16} /> Сохранить
          </button>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Изображение</label>
            <div className="flex gap-2">
              <input type="url" value={aboutSettings.image} onChange={(e) => setAboutSettings({ ...aboutSettings, image: e.target.value })} className="flex-1 p-2 border border-black/10" />
              <label className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-white cursor-pointer hover:bg-black">
                <Upload size={16} />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files[0], (url) => setAboutSettings({ ...aboutSettings, image: url }))} />
              </label>
            </div>
            {aboutSettings.image && <img src={aboutSettings.image} alt="Preview" className="mt-2 h-32 object-cover" />}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Лет опыта</label>
            <input type="number" value={aboutSettings.years_experience} onChange={(e) => setAboutSettings({ ...aboutSettings, years_experience: parseInt(e.target.value) })} className="w-32 p-2 border border-black/10" />
          </div>
          {['text1', 'text2', 'text3'].map((textKey) => (
            <div key={textKey} className="border border-black/5 p-4">
              <h4 className="font-medium mb-3">Параграф {textKey.slice(-1)}</h4>
              <div className="space-y-2">
                <div><label className="text-xs text-[#8C8C8C]">PL</label><textarea value={aboutSettings[`${textKey}_pl`]} onChange={(e) => setAboutSettings({ ...aboutSettings, [`${textKey}_pl`]: e.target.value })} className="w-full p-2 border border-black/10 h-16 text-sm" /></div>
                <div><label className="text-xs text-[#8C8C8C]">EN</label><textarea value={aboutSettings[`${textKey}_en`]} onChange={(e) => setAboutSettings({ ...aboutSettings, [`${textKey}_en`]: e.target.value })} className="w-full p-2 border border-black/10 h-16 text-sm" /></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};
