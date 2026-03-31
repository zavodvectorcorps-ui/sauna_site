import { useState, useEffect } from 'react';
import { Save, Phone, Mail, MapPin, Clock, Globe, Building } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export const ContactAdmin = ({ authHeader }) => {
  const [site, setSite] = useState(null);
  const [contact, setContact] = useState(null);
  const [balieContact, setBalieContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/settings/site`).then(r => r.json()),
      fetch(`${API}/api/settings/contact`).then(r => r.json()),
      fetch(`${API}/api/settings/balie-contact`).then(r => r.json()),
    ]).then(([s, c, b]) => {
      setSite(s);
      setContact(c);
      setBalieContact(b);
      setLoading(false);
    });
  }, []);

  const save = async (endpoint, data, label) => {
    await fetch(`${API}/api/admin/settings/${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
      body: JSON.stringify(data),
    });
    setSaved(label);
    setTimeout(() => setSaved(''), 2000);
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Загрузка...</div>;

  return (
    <div className="space-y-8" data-testid="contact-admin">
      {saved && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 text-sm">
          {saved} сохранено
        </div>
      )}

      {/* Company & Contact Info */}
      <div className="bg-white border border-black/5 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Building size={20} className="text-[#C6A87C]" />
            <h2 className="text-lg font-bold text-[#1A1A1A]">Данные компании</h2>
          </div>
          <button onClick={() => save('site', site, 'Данные компании')} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 text-sm hover:bg-[#B09060]" data-testid="save-site-btn">
            <Save size={14} /> Сохранить
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'company_name', label: 'Название', icon: Building },
            { key: 'phone', label: 'Телефон', icon: Phone },
            { key: 'email', label: 'Email', icon: Mail },
            { key: 'address', label: 'Адрес', icon: MapPin },
            { key: 'working_hours', label: 'Часы работы', icon: Clock },
            { key: 'nip', label: 'NIP' },
            { key: 'regon', label: 'REGON' },
          ].map(({ key, label, icon: Icon }) => (
            <div key={key}>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600 mb-1">
                {Icon && <Icon size={13} className="text-[#C6A87C]" />}
                {label}
              </label>
              <input
                value={site?.[key] || ''}
                onChange={e => setSite({ ...site, [key]: e.target.value })}
                className="w-full p-2.5 border border-black/10 text-sm focus:border-[#C6A87C] outline-none"
                data-testid={`site-${key}`}
              />
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-black/5">
          <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-1.5">
            <Globe size={13} className="text-[#C6A87C]" /> Социальные сети
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { key: 'facebook_url', label: 'Facebook' },
              { key: 'instagram_url', label: 'Instagram' },
              { key: 'youtube_url', label: 'YouTube' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-sm text-gray-500 mb-1 block">{label}</label>
                <input
                  value={site?.[key] || ''}
                  onChange={e => setSite({ ...site, [key]: e.target.value })}
                  className="w-full p-2.5 border border-black/10 text-sm focus:border-[#C6A87C] outline-none"
                  placeholder="https://..."
                  data-testid={`site-${key}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sauna Contact Section */}
      <div className="bg-white border border-black/5 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Phone size={20} className="text-[#C6A87C]" />
            <h2 className="text-lg font-bold text-[#1A1A1A]">Секция «Контакт» — Сауны</h2>
          </div>
          <button onClick={() => save('contact', contact, 'Секция контактов (сауны)')} className="flex items-center gap-2 bg-[#C6A87C] text-white px-4 py-2 text-sm hover:bg-[#B09060]" data-testid="save-contact-btn">
            <Save size={14} /> Сохранить
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'title_pl', label: 'Заголовок (PL)' },
            { key: 'title_en', label: 'Заголовок (EN)' },
            { key: 'subtitle_pl', label: 'Подзаголовок (PL)' },
            { key: 'subtitle_en', label: 'Подзаголовок (EN)' },
            { key: 'form_title_pl', label: 'Заголовок формы (PL)' },
            { key: 'form_title_en', label: 'Заголовок формы (EN)' },
            { key: 'form_subtitle_pl', label: 'Подзаголовок формы (PL)' },
            { key: 'form_subtitle_en', label: 'Подзаголовок формы (EN)' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="text-sm font-medium text-gray-600 mb-1 block">{label}</label>
              <input
                value={contact?.[key] || ''}
                onChange={e => setContact({ ...contact, [key]: e.target.value })}
                className="w-full p-2.5 border border-black/10 text-sm focus:border-[#C6A87C] outline-none"
                data-testid={`contact-${key}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Balie Contact Section */}
      <div className="bg-white border border-black/5 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Phone size={20} className="text-[#339DC7]" />
            <h2 className="text-lg font-bold text-[#1A1A1A]">Секция «Контакт» — Купели</h2>
          </div>
          <button onClick={() => save('balie-contact', balieContact, 'Секция контактов (купели)')} className="flex items-center gap-2 bg-[#339DC7] text-white px-4 py-2 text-sm hover:bg-[#2B8AAD]" data-testid="save-balie-contact-btn">
            <Save size={14} /> Сохранить
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'title', label: 'Заголовок' },
            { key: 'subtitle', label: 'Подзаголовок' },
            { key: 'phone', label: 'Телефон' },
            { key: 'email', label: 'Email' },
            { key: 'address', label: 'Адрес' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="text-sm font-medium text-gray-600 mb-1 block">{label}</label>
              <input
                value={balieContact?.[key] || ''}
                onChange={e => setBalieContact({ ...balieContact, [key]: e.target.value })}
                className="w-full p-2.5 border border-black/10 text-sm focus:border-[#C6A87C] outline-none"
                data-testid={`balie-contact-${key}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
