import { useState, useEffect, useCallback } from 'react';
import { Save, Settings } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export const SaunaDesignAdmin = ({ authHeader, showMessage, activeSubTab }) => {
  const [siteSettings, setSiteSettings] = useState(null);
  const [layoutSettings, setLayoutSettings] = useState(null);
  const [buttonConfig, setButtonConfig] = useState(null);
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
      const [siteRes, layoutRes, buttonsRes] = await Promise.all([
        fetch(`${API}/api/settings/site`),
        fetch(`${API}/api/settings/layout`),
        fetch(`${API}/api/settings/buttons`),
      ]);
      setSiteSettings(await siteRes.json());
      setLayoutSettings(await layoutRes.json());
      setButtonConfig(await buttonsRes.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const saveSiteSettings = async () => {
    try {
      await fetchWithAuth(`${API}/api/admin/settings/site`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(siteSettings),
      });
      showMessage('success', 'Настройки сохранены');
    } catch { showMessage('error', 'Ошибка сохранения'); }
  };

  const saveLayoutSettings = async () => {
    try {
      await fetchWithAuth(`${API}/api/admin/settings/layout`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(layoutSettings),
      });
      showMessage('success', 'Настройки отступов сохранены');
    } catch { showMessage('error', 'Ошибка сохранения'); }
  };

  const saveButtonConfig = async () => {
    try {
      await fetchWithAuth(`${API}/api/admin/settings/buttons`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(buttonConfig),
      });
      showMessage('success', 'Настройки кнопок сохранены');
    } catch { showMessage('error', 'Ошибка сохранения'); }
  };

  const updateButton = (buttonId, field, value) => {
    setButtonConfig({
      ...buttonConfig,
      buttons: { ...buttonConfig.buttons, [buttonId]: { ...buttonConfig.buttons[buttonId], [field]: value } },
    });
  };

  if (loading || !siteSettings || !layoutSettings || !buttonConfig) {
    return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-[#C6A87C] border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (activeSubTab === 'site') {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#1A1A1A]">Настройки сайта</h2>
          <button onClick={saveSiteSettings} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]">
            <Save size={16} /> Сохранить
          </button>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {[
            { key: 'company_name', label: 'Название компании', type: 'text' },
            { key: 'phone', label: 'Телефон', type: 'text' },
            { key: 'email', label: 'Email', type: 'email' },
            { key: 'address', label: 'Адрес', type: 'text' },
            { key: 'nip', label: 'NIP', type: 'text' },
            { key: 'regon', label: 'REGON', type: 'text' },
            { key: 'working_hours', label: 'Часы работы', type: 'text' },
            { key: 'facebook_url', label: 'Facebook URL', type: 'url' },
            { key: 'instagram_url', label: 'Instagram URL', type: 'url' },
            { key: 'youtube_url', label: 'YouTube URL', type: 'url' },
          ].map(({ key, label, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1">{label}</label>
              <input
                type={type}
                value={siteSettings[key]}
                onChange={(e) => setSiteSettings({ ...siteSettings, [key]: e.target.value })}
                className="w-full p-2 border border-black/10"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeSubTab === 'layout') {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#1A1A1A]">Оформление</h2>
          <button onClick={saveLayoutSettings} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]">
            <Save size={16} /> Сохранить
          </button>
        </div>
        <div className="space-y-6">
          <div className="border border-black/5 p-6">
            <h3 className="font-semibold mb-4">Расстояние между блоками</h3>
            <p className="text-sm text-[#8C8C8C] mb-4">Выберите размер отступов между секциями сайта</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: 'small', label: 'Маленькое', desc: '40px' },
                { value: 'medium', label: 'Среднее', desc: '60px' },
                { value: 'large', label: 'Большое', desc: '80px' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex flex-col items-center p-4 border cursor-pointer transition-all ${
                    layoutSettings.section_spacing === option.value ? 'border-[#C6A87C] bg-[#C6A87C]/10' : 'border-black/10 hover:border-[#C6A87C]'
                  }`}
                >
                  <input type="radio" name="section_spacing" value={option.value} checked={layoutSettings.section_spacing === option.value} onChange={(e) => setLayoutSettings({ ...layoutSettings, section_spacing: e.target.value })} className="sr-only" />
                  <span className="font-medium">{option.label}</span>
                  <span className="text-xs text-[#8C8C8C]">{option.desc}</span>
                </label>
              ))}
            </div>
            <div className="mt-6">
              <h4 className="font-medium mb-3">Точная настройка (в пикселях)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#8C8C8C] mb-1">Отступ сверху</label>
                  <input type="number" value={layoutSettings.section_padding_top} onChange={(e) => setLayoutSettings({ ...layoutSettings, section_padding_top: parseInt(e.target.value) || 0 })} className="w-full p-2 border border-black/10" min="0" max="200" />
                </div>
                <div>
                  <label className="block text-xs text-[#8C8C8C] mb-1">Отступ снизу</label>
                  <input type="number" value={layoutSettings.section_padding_bottom} onChange={(e) => setLayoutSettings({ ...layoutSettings, section_padding_bottom: parseInt(e.target.value) || 0 })} className="w-full p-2 border border-black/10" min="0" max="200" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeSubTab === 'buttons') {
    const buttonLabels = {
      hero_primary: 'Главная кнопка (Hero)',
      hero_secondary: 'Вторая кнопка (Hero)',
      calculator_submit: 'Отправить запрос (Калькулятор)',
      stock_cta: 'Кнопка карточки (В наличии)',
      contact_submit: 'Отправить (Контакты)',
    };

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#1A1A1A]">Настройка кнопок</h2>
          <button onClick={saveButtonConfig} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]">
            <Save size={16} /> Сохранить
          </button>
        </div>
        <p className="text-sm text-[#8C8C8C] mb-6">Настройте действия и тексты кнопок на сайте</p>
        <div className="space-y-6">
          {Object.entries(buttonConfig.buttons || {}).map(([buttonId, button]) => (
            <div key={buttonId} className="border border-black/5 p-6">
              <h3 className="font-semibold mb-4">{buttonLabels[buttonId] || buttonId}</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-[#8C8C8C] mb-1">Текст (PL)</label>
                  <input type="text" value={button.text_pl || ''} onChange={(e) => updateButton(buttonId, 'text_pl', e.target.value)} className="w-full p-2 border border-black/10 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-[#8C8C8C] mb-1">Текст (EN)</label>
                  <input type="text" value={button.text_en || ''} onChange={(e) => updateButton(buttonId, 'text_en', e.target.value)} className="w-full p-2 border border-black/10 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#8C8C8C] mb-1">Действие</label>
                  <select value={button.action || 'anchor'} onChange={(e) => updateButton(buttonId, 'action', e.target.value)} className="w-full p-2 border border-black/10 text-sm">
                    <option value="anchor">Прокрутка к разделу</option>
                    <option value="link">Внешняя ссылка</option>
                    <option value="form">Открыть форму</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#8C8C8C] mb-1">
                    {button.action === 'anchor' ? 'Раздел (якорь)' : button.action === 'link' ? 'URL ссылки' : 'Форма'}
                  </label>
                  {button.action === 'anchor' ? (
                    <select value={button.target || '#calculator'} onChange={(e) => updateButton(buttonId, 'target', e.target.value)} className="w-full p-2 border border-black/10 text-sm">
                      <option value="#hero">Hero (Главный экран)</option>
                      <option value="#models">Модели саун</option>
                      <option value="#calculator">Калькулятор</option>
                      <option value="#gallery">Галерея</option>
                      <option value="#stock">Сауны в наличии</option>
                      <option value="#reviews">Отзывы</option>
                      <option value="#faq">FAQ</option>
                      <option value="#about">О компании</option>
                      <option value="#contact">Контакты</option>
                    </select>
                  ) : button.action === 'form' ? (
                    <select value={button.target || 'contact'} onChange={(e) => updateButton(buttonId, 'target', e.target.value)} className="w-full p-2 border border-black/10 text-sm">
                      <option value="contact">Форма контактов</option>
                      <option value="inquiry">Форма заказа</option>
                    </select>
                  ) : (
                    <input type="url" value={button.target || ''} onChange={(e) => updateButton(buttonId, 'target', e.target.value)} className="w-full p-2 border border-black/10 text-sm" placeholder="https://..." />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};
