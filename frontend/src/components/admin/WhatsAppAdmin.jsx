import { useState, useEffect } from 'react';
import { Save, MessageCircle } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export const WhatsAppAdmin = ({ authHeader, showMessage }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/admin/settings/whatsapp`, { headers: { Authorization: authHeader } })
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => showMessage('error', 'Ошибка загрузки'))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    try {
      const res = await fetch(`${API}/api/admin/settings/whatsapp`, {
        method: 'PUT',
        headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) showMessage('success', 'Сохранено');
      else showMessage('error', 'Ошибка сохранения');
    } catch { showMessage('error', 'Ошибка сохранения'); }
  };

  if (loading) return <div className="py-8 text-center text-gray-400">Загрузка...</div>;
  if (!data) return null;

  return (
    <div data-testid="whatsapp-admin">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#25D366] flex items-center justify-center">
            <MessageCircle size={20} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-[#1A1A1A]">Настройки WhatsApp</h2>
        </div>
        <button onClick={save} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 hover:bg-[#B09060]" data-testid="whatsapp-save">
          <Save size={16} /> Сохранить
        </button>
      </div>

      <div className="space-y-4">
        <label className="flex items-center gap-3 cursor-pointer p-3 border border-black/5 bg-[#F9F9F7]">
          <input type="checkbox" checked={data.enabled} onChange={e => setData(prev => ({ ...prev, enabled: e.target.checked }))} className="rounded" />
          <div>
            <span className="text-sm font-medium text-[#1A1A1A]">Включить кнопку WhatsApp</span>
            <p className="text-xs text-gray-400">Плавающая кнопка WhatsApp будет отображаться на всех страницах сайта</p>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer p-3 border border-black/5 bg-[#F9F9F7]">
          <input type="checkbox" checked={data.show_on_all_pages} onChange={e => setData(prev => ({ ...prev, show_on_all_pages: e.target.checked }))} className="rounded" />
          <div>
            <span className="text-sm font-medium text-[#1A1A1A]">Показывать на всех страницах</span>
            <p className="text-xs text-gray-400">Если выключено, кнопка будет только на страницах саун и купелей</p>
          </div>
        </label>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Номер телефона WhatsApp</label>
          <input type="text" value={data.phone_number || ''} onChange={e => setData(prev => ({ ...prev, phone_number: e.target.value }))} className="w-full p-2 border border-black/10 text-sm" placeholder="+48732099201" data-testid="whatsapp-phone" />
          <p className="text-xs text-gray-400 mt-1">Формат: +48XXXXXXXXX (без пробелов)</p>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Сообщение по умолчанию (PL)</label>
          <textarea value={data.default_message_pl || ''} onChange={e => setData(prev => ({ ...prev, default_message_pl: e.target.value }))} className="w-full p-2 border border-black/10 text-sm" rows={2} />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Сообщение по умолчанию (EN)</label>
          <textarea value={data.default_message_en || ''} onChange={e => setData(prev => ({ ...prev, default_message_en: e.target.value }))} className="w-full p-2 border border-black/10 text-sm" rows={2} />
        </div>
      </div>

      {data.enabled && (
        <div className="mt-6 p-4 border border-dashed border-[#25D366] bg-[#25D366]/5">
          <p className="text-xs text-gray-500 mb-2">Превью кнопки:</p>
          <div className="flex items-center gap-2">
            <div className="w-14 h-14 bg-[#25D366] flex items-center justify-center shadow-lg">
              <MessageCircle size={28} className="text-white" />
            </div>
            <span className="text-sm text-gray-500">WhatsApp: {data.phone_number}</span>
          </div>
        </div>
      )}
    </div>
  );
};
