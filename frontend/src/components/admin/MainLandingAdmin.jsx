import { useState, useEffect, useCallback } from 'react';
import { Save, Upload, X, Image, Move, Video } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const POSITION_OPTIONS = [
  { value: 'center', label: 'Центр' },
  { value: 'top', label: 'Верх' },
  { value: 'bottom', label: 'Низ' },
  { value: 'left', label: 'Лево' },
  { value: 'right', label: 'Право' },
  { value: 'top left', label: 'Верх-лево' },
  { value: 'top right', label: 'Верх-право' },
  { value: 'bottom left', label: 'Низ-лево' },
  { value: 'bottom right', label: 'Низ-право' },
  { value: '50% 30%', label: 'Верхняя треть' },
  { value: '50% 70%', label: 'Нижняя треть' },
  { value: '30% 50%', label: 'Левая треть' },
  { value: '70% 50%', label: 'Правая треть' },
];

export const MainLandingAdmin = ({ authHeader, showMessage }) => {
  const [settings, setSettings] = useState({ sauna_image: '', balia_image: '', sauna_image_position: 'center', balia_image_position: 'center', sauna_video: '', balia_video: '' });
  const [loading, setLoading] = useState(true);
  const [videoUploading, setVideoUploading] = useState(null);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const response = await fetch(url, { ...options, headers: { ...options.headers, 'Authorization': authHeader } });
    if (response.status === 401) throw new Error('Unauthorized');
    return response;
  }, [authHeader]);

  useEffect(() => {
    fetch(`${API}/api/settings/main-landing`)
      .then(r => r.json())
      .then(d => setSettings({
        sauna_image: d.sauna_image || '',
        balia_image: d.balia_image || '',
        sauna_image_position: d.sauna_image_position || 'center',
        balia_image_position: d.balia_image_position || 'center',
        sauna_video: d.sauna_video || '',
        balia_video: d.balia_video || '',
      }))
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
      showMessage('success', 'Фото загружено');
    } catch { showMessage('error', 'Ошибка загрузки'); }
  };

  const handleVideoUpload = async (file, field) => {
    const formData = new FormData();
    formData.append('file', file);
    setVideoUploading(field);
    try {
      const res = await fetchWithAuth(`${API}/api/admin/upload-video`, { method: 'POST', body: formData });
      const data = await res.json();
      setSettings(prev => ({ ...prev, [field]: data.url.startsWith('http') ? data.url : `${API}${data.url}` }));
      const msg = data.original_kb && data.compressed_kb
        ? `Видео загружено и сжато: ${data.original_kb} КБ → ${data.compressed_kb} КБ`
        : 'Видео загружено';
      showMessage('success', msg);
    } catch { showMessage('error', 'Ошибка загрузки видео'); }
    setVideoUploading(null);
  };

  const saveSettings = async () => {
    try {
      await fetchWithAuth(`${API}/api/admin/settings/main-landing`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'main_landing_settings', ...settings }),
      });
      showMessage('success', 'Настройки главной страницы сохранены');
    } catch { showMessage('error', 'Ошибка сохранения'); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-[#C6A87C] border-t-transparent rounded-full animate-spin" /></div>;

  const renderField = (label, imageField, posField, videoField, hint) => {
    const imgSrc = settings[imageField];
    const pos = settings[posField];
    const videoSrc = settings[videoField];
    return (
      <div className="border border-black/5 p-6" data-testid={`main-landing-${imageField}`}>
        <h3 className="font-semibold text-lg mb-1">{label}</h3>
        <p className="text-sm text-[#8C8C8C] mb-4">{hint}</p>
        <div className="flex gap-3 items-start mb-3">
          <input
            type="url"
            placeholder="URL фото"
            value={imgSrc}
            onChange={e => setSettings(prev => ({ ...prev, [imageField]: e.target.value }))}
            className="flex-1 p-2 border border-black/10 text-sm"
            data-testid={`main-landing-${imageField}-url`}
          />
          <label className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-white text-sm cursor-pointer hover:bg-black flex-shrink-0">
            <Upload size={14} /> Загрузить
            <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0], imageField)} />
          </label>
          {imgSrc && (
            <button onClick={() => setSettings(prev => ({ ...prev, [imageField]: '' }))} className="p-2 text-red-400 hover:text-red-600"><X size={16} /></button>
          )}
        </div>
        {/* Position selector */}
        <div className="flex items-center gap-3 mb-4">
          <Move size={14} className="text-[#8C8C8C]" />
          <span className="text-xs text-[#8C8C8C]">Позиция:</span>
          <select
            value={pos}
            onChange={e => setSettings(prev => ({ ...prev, [posField]: e.target.value }))}
            className="p-1.5 border border-black/10 text-sm bg-white"
            data-testid={`main-landing-${posField}`}
          >
            {POSITION_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <input
            type="text"
            placeholder="или своё: 50% 40%"
            value={POSITION_OPTIONS.find(o => o.value === pos) ? '' : pos}
            onChange={e => { if (e.target.value) setSettings(prev => ({ ...prev, [posField]: e.target.value })); }}
            className="p-1.5 border border-black/10 text-sm w-32"
          />
        </div>
        {/* Video upload */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Video size={14} className="text-[#8C8C8C]" />
            <span className="text-sm font-medium text-[#1A1A1A]">Видео при наведении</span>
            <span className="text-xs text-[#8C8C8C]">(MP4, автоплей без звука)</span>
          </div>
          <div className="flex gap-3 items-start">
            <input
              type="url"
              placeholder="URL видео (mp4)"
              value={videoSrc}
              onChange={e => setSettings(prev => ({ ...prev, [videoField]: e.target.value }))}
              className="flex-1 p-2 border border-black/10 text-sm"
              data-testid={`main-landing-${videoField}-url`}
            />
            <label className={`flex items-center gap-2 px-4 py-2 text-white text-sm cursor-pointer flex-shrink-0 ${videoUploading === videoField ? 'bg-gray-400' : 'bg-[#1A1A1A] hover:bg-black'}`}>
              <Upload size={14} /> {videoUploading === videoField ? 'Загрузка...' : 'Загрузить'}
              <input type="file" accept="video/mp4" className="hidden" disabled={videoUploading === videoField} onChange={e => e.target.files?.[0] && handleVideoUpload(e.target.files[0], videoField)} />
            </label>
            {videoSrc && (
              <button onClick={() => setSettings(prev => ({ ...prev, [videoField]: '' }))} className="p-2 text-red-400 hover:text-red-600"><X size={16} /></button>
            )}
          </div>
        </div>
        {/* Preview */}
        <div className="flex gap-4">
          {imgSrc ? (
            <div className="flex-1">
              <p className="text-xs text-[#8C8C8C] mb-1">Фото</p>
              <div className="aspect-[16/9] bg-[#0C0C0C] border border-black/5 overflow-hidden relative">
                <img src={imgSrc} alt="Preview" className="w-full h-full object-cover" style={{ objectPosition: pos }} />
                <div className="absolute bottom-2 right-2 bg-black/60 text-white/60 text-[10px] px-2 py-0.5">{pos}</div>
              </div>
            </div>
          ) : (
            <div className="flex-1">
              <p className="text-xs text-[#8C8C8C] mb-1">Фото</p>
              <div className="aspect-[16/9] bg-[#F9F9F7] border border-black/5 flex items-center justify-center">
                <div className="text-center"><Image size={32} className="mx-auto text-[#8C8C8C] mb-2" /><p className="text-xs text-[#8C8C8C]">Фото по умолчанию</p></div>
              </div>
            </div>
          )}
          {videoSrc && (
            <div className="flex-1">
              <p className="text-xs text-[#8C8C8C] mb-1">Видео (hover)</p>
              <div className="aspect-[16/9] bg-[#0C0C0C] border border-black/5 overflow-hidden">
                <video src={videoSrc} muted loop className="w-full h-full object-cover" onMouseEnter={e => e.target.play()} onMouseLeave={e => { e.target.pause(); e.target.currentTime = 0; }} />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#1A1A1A]">Главная страница — Фоновые фото</h2>
          <p className="text-sm text-[#8C8C8C] mt-1">Фоны карточек саун и купелей. При наведении показывается анимация (пар / пузырьки).</p>
        </div>
        <button onClick={saveSettings} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]" data-testid="main-landing-save-btn">
          <Save size={16} /> Сохранить
        </button>
      </div>
      <div className="space-y-6">
        {renderField('Фон карточки саун', 'sauna_image', 'sauna_image_position', 'sauna_video', 'Рекомендуемый размер: 800x600+. Отображается на карточке "Sauny ogrodowe".')}
        {renderField('Фон карточки купелей', 'balia_image', 'balia_image_position', 'balia_video', 'Рекомендуемый размер: 800x600+. Отображается на карточке "Balie i jacuzzi".')}
      </div>
    </div>
  );
};
