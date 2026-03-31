import { useState, useEffect } from 'react';
import { Send, CheckCircle, MapPin, Phone, Mail, FileDown } from 'lucide-react';
import { useAutoTranslate } from '../../context/AutoTranslateContext';
import { useSettings } from '../../context/SettingsContext';
import { trackEvent } from '../../lib/analytics';

const API = process.env.REACT_APP_BACKEND_URL;

export const BalieContact = () => {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [catalogAvailable, setCatalogAvailable] = useState(false);
  const { tr } = useAutoTranslate();
  const { getSetting } = useSettings();
  const contactData = getSetting('balie_contact');

  useEffect(() => {
    fetch(`${API}/api/catalog/info`).then(r => r.json()).then(d => setCatalogAvailable(d?.available)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(`${API}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type: 'balia_contact' }),
      });
      setSubmitted(true);
      trackEvent('generate_lead', { type: 'balia_contact' });
    } catch (err) { console.error(err); }
    setSubmitting(false);
  };

  return (
    <section id="kontakt-balie" className="py-20 bg-[#0F1218]" data-testid="balie-contact">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            {tr(contactData?.title || 'Skontaktuj się z')} <span className="text-[#D4AF37]">{contactData?.title ? '' : tr('nami')}</span>
          </h2>
          <p className="text-white/50 text-sm">{tr(contactData?.subtitle || 'Chętnie odpowiemy na każde pytanie')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Info */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Phone size={20} className="text-[#D4AF37] flex-shrink-0 mt-1" />
              <div><div className="text-white font-medium">{tr('Telefon')}</div><div className="text-white/40 text-sm">{contactData?.phone || '+48 515 995 190'}</div></div>
            </div>
            <div className="flex items-start gap-4">
              <Mail size={20} className="text-[#D4AF37] flex-shrink-0 mt-1" />
              <div><div className="text-white font-medium">Email</div><div className="text-white/40 text-sm">{contactData?.email || 'kontakt@wm-balia.pl'}</div></div>
            </div>
            <div className="flex items-start gap-4">
              <MapPin size={20} className="text-[#D4AF37] flex-shrink-0 mt-1" />
              <div><div className="text-white font-medium">{tr('Adres')}</div><div className="text-white/40 text-sm">{contactData?.address || tr('ul. Boryny 3, Warszawa, Polska')}</div></div>
            </div>
          </div>

          {/* Form */}
          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">{tr('Dziękujemy!')}</h3>
              <p className="text-white/50 mb-4">{tr('Skontaktujemy się z Tobą wkrótce.')}</p>
              {catalogAvailable && (
                <a
                  href={`${API}/api/catalog/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4AF37] text-[#0F1218] font-semibold hover:bg-[#C5A028] transition-colors"
                  data-testid="balie-contact-download-catalog"
                >
                  <FileDown size={16} /> {tr('Pobierz katalog PDF')}
                </a>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder={tr("Imię i nazwisko *")} required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full p-3 bg-[#1A1E27] border border-white/10 text-white text-sm focus:border-[#D4AF37] outline-none placeholder-white/30" data-testid="balie-contact-name" />
              <input type="tel" placeholder={tr("Telefon *")} required value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                className="w-full p-3 bg-[#1A1E27] border border-white/10 text-white text-sm focus:border-[#D4AF37] outline-none placeholder-white/30" data-testid="balie-contact-phone" />
              <input type="email" placeholder="Email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full p-3 bg-[#1A1E27] border border-white/10 text-white text-sm focus:border-[#D4AF37] outline-none placeholder-white/30" />
              <textarea placeholder={tr("Wiadomość")} rows={3} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                className="w-full p-3 bg-[#1A1E27] border border-white/10 text-white text-sm focus:border-[#D4AF37] outline-none placeholder-white/30 resize-none" />
              <button type="submit" disabled={submitting} className="w-full py-3 bg-[#D4AF37] text-[#0F1218] font-semibold hover:bg-[#C5A028] transition-colors disabled:opacity-50 flex items-center justify-center gap-2" data-testid="balie-contact-submit">
                <Send size={16} /> {submitting ? tr('Wysyłanie...') : tr('Wyślij wiadomość')}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
