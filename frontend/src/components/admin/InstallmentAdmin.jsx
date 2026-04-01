import { useState, useEffect, useCallback } from 'react';
import { Save, Upload, X, Image } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export const InstallmentAdmin = ({ authHeader, showMessage }) => {
  const [settings, setSettings] = useState({ sauna_logo_url: '', balia_logo_url: '' });
  const [loading, setLoading] = useState(true);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const response = await fetch(url, { ...options, headers: { ...options.headers, 'Authorization': authHeader } });
    if (response.status === 401) throw new Error('Unauthorized');
    return response;
  }, [authHeader]);

  useEffect(() => {
    fetch(`${API}/api/settings/installment`)
      .then(r => r.json())
      .then(d => setSettings({ sauna_logo_url: d.sauna_logo_url || '', balia_logo_url: d.balia_logo_url || '' }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (file, field) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetchWithAuth(`${API}/api/admin/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      setSettings(prev => ({ ...prev, [field]: data.url.startsWith('http') ? data.url : `${API}${data.url}` }));
      showMessage('success', 'Логотип загружен');
    } catch { showMessage('error', 'Ошибка загрузки'); }
  };

  const saveSettings = async () => {
    try {
      await fetchWithAuth(`${API}/api/admin/settings/installment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'installment_settings', ...settings }),
      });
      showMessage('success', 'Настройки рассрочки сохранены');
    } catch { showMessage('error', 'Ошибка сохранения'); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-[#C6A87C] border-t-transparent rounded-full animate-spin" /></div>;

  const renderLogoField = (label, field) => (
    <div className="border border-black/5 p-6" data-testid={`installment-${field}`}>
      <h3 className="font-semibold text-lg mb-4">{label}</h3>
      <p className="text-sm text-[#8C8C8C] mb-4">Логотип компании-партнёра по рассрочке, отображается в блоке "Komfort dostepny od razu!"</p>
      <div className="flex gap-3 items-start">
        <input
          type="url"
          placeholder="URL логотипа"
          value={settings[field]}
          onChange={e => setSettings(prev => ({ ...prev, [field]: e.target.value }))}
          className="flex-1 p-2 border border-black/10 text-sm"
          data-testid={`installment-${field}-url`}
        />
        <label className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-white text-sm cursor-pointer hover:bg-black flex-shrink-0">
          <Upload size={14} /> Загрузить
          <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], field)} />
        </label>
        {settings[field] && (
          <button
            onClick={() => setSettings(prev => ({ ...prev, [field]: '' }))}
            className="p-2 text-red-400 hover:text-red-600"
          >
            <X size={16} />
          </button>
        )}
      </div>
      {settings[field] ? (
        <div className="mt-4 p-4 bg-[#F9F9F7] border border-black/5 flex items-center justify-center">
          <img src={settings[field]} alt="Preview" className="h-16 object-contain" />
        </div>
      ) : (
        <div className="mt-4 p-4 bg-[#F9F9F7] border border-black/5 text-center">
          <Image size={32} className="mx-auto text-[#8C8C8C] mb-2" />
          <p className="text-xs text-[#8C8C8C]">Логотип не загружен</p>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#1A1A1A]">Рассрочка — Логотип партнёра</h2>
          <p className="text-sm text-[#8C8C8C] mt-1">Управление логотипами финансовых партнёров для блоков рассрочки</p>
        </div>
        <button onClick={saveSettings} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]" data-testid="installment-save-btn">
          <Save size={16} /> Сохранить
        </button>
      </div>
      <div className="space-y-6">
        {renderLogoField('Логотип для Саун', 'sauna_logo_url')}
        {renderLogoField('Логотип для Купелей', 'balia_logo_url')}
      </div>
    </div>
  );
};
