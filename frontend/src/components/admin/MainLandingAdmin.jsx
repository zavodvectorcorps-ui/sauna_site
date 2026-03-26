import { useState, useEffect, useCallback } from 'react';
import { Save, Upload, X, Image } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export const MainLandingAdmin = ({ authHeader, showMessage }) => {
  const [settings, setSettings] = useState({ sauna_image: '', balia_image: '' });
  const [loading, setLoading] = useState(true);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const response = await fetch(url, { ...options, headers: { ...options.headers, 'Authorization': authHeader } });
    if (response.status === 401) throw new Error('Unauthorized');
    return response;
  }, [authHeader]);

  useEffect(() => {
    fetch(`${API}/api/settings/main-landing`)
      .then(r => r.json())
      .then(d => setSettings({ sauna_image: d.sauna_image || '', balia_image: d.balia_image || '' }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (file, field) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetchWithAuth(`${API}/api/admin/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      setSettings(prev => ({ ...prev, [field]: `${API}${data.url}` }));
      showMessage('success', 'Фото загружено');
    } catch { showMessage('error', 'Ошибка загрузки'); }
  };

  const saveSettings = async () => {
    try {
      await fetchWithAuth(`${API}/api/admin/settings/main-landing`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'main_landing_settings', ...settings }),
      });
      showMessage('success', 'Фоны главной страницы сохранены');
    } catch { showMessage('error', 'Ошибка сохранения'); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-[#C6A87C] border-t-transparent rounded-full animate-spin" /></div>;

  const renderField = (label, field, hint) => (
    <div className="border border-black/5 p-6" data-testid={`main-landing-${field}`}>
      <h3 className="font-semibold text-lg mb-1">{label}</h3>
      <p className="text-sm text-[#8C8C8C] mb-4">{hint}</p>
      <div className="flex gap-3 items-start">
        <input
          type="url"
          placeholder="URL фото"
          value={settings[field]}
          onChange={e => setSettings(prev => ({ ...prev, [field]: e.target.value }))}
          className="flex-1 p-2 border border-black/10 text-sm"
          data-testid={`main-landing-${field}-url`}
        />
        <label className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-white text-sm cursor-pointer hover:bg-black flex-shrink-0">
          <Upload size={14} /> Загрузить
          <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], field)} />
        </label>
        {settings[field] && (
          <button onClick={() => setSettings(prev => ({ ...prev, [field]: '' }))} className="p-2 text-red-400 hover:text-red-600"><X size={16} /></button>
        )}
      </div>
      {settings[field] ? (
        <div className="mt-4 aspect-[16/9] max-w-md bg-[#F9F9F7] border border-black/5 overflow-hidden">
          <img src={settings[field]} alt="Preview" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="mt-4 aspect-[16/9] max-w-md bg-[#F9F9F7] border border-black/5 flex items-center justify-center">
          <div className="text-center"><Image size={32} className="mx-auto text-[#8C8C8C] mb-2" /><p className="text-xs text-[#8C8C8C]">Используется фото по умолчанию</p></div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#1A1A1A]">Главная страница — Фоновые фото</h2>
          <p className="text-sm text-[#8C8C8C] mt-1">Фоны карточек саун и купелей на главной странице (wm-group.pl)</p>
        </div>
        <button onClick={saveSettings} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]" data-testid="main-landing-save-btn">
          <Save size={16} /> Сохранить
        </button>
      </div>
      <div className="space-y-6">
        {renderField('Фон карточки саун', 'sauna_image', 'Рекомендуемый размер: 800x600 или больше. Отображается на карточке "Sauny ogrodowe".')}
        {renderField('Фон карточки купелей', 'balia_image', 'Рекомендуемый размер: 800x600 или больше. Отображается на карточке "Balie i jacuzzi".')}
      </div>
    </div>
  );
};
