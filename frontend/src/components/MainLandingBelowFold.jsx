import { useState } from 'react';
import { MapPin, ShieldCheck, Leaf, Heart, Phone, Mail, Send, CheckCircle } from 'lucide-react';
import { useAutoTranslate } from '../context/AutoTranslateContext';
import { useSettings } from '../context/SettingsContext';

const API = process.env.REACT_APP_BACKEND_URL;

const MainLandingBelowFold = () => {
  const { tr } = useAutoTranslate();
  const { siteSettings } = useSettings();
  const phone = siteSettings?.phone || '+48 732 099 201';
  const email = siteSettings?.email || 'wmsauna@gmail.com';
  const address = siteSettings?.address || 'Warszawa, Polska';
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(`${API}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type: 'main_landing' }),
      });
      setSubmitted(true);
    } catch {}
    setSubmitting(false);
  };

  const values = [
    { icon: Heart, title: tr('Z troską o zdrowie i odpoczynek'), desc: tr('Sauna i balia to nie tylko luksus — to zdrowie, regeneracja i chwile spokoju dla całej rodziny.') },
    { icon: Leaf, title: tr('Naturalne, ekologiczne materiały'), desc: tr('Używamy wyłącznie drewna z certyfikowanych, zrównoważonych źródeł. Bez plastiku, bez kompromisów.') },
    { icon: ShieldCheck, title: tr('Bezpieczeństwo i komfort klienta'), desc: tr('Każdy produkt spełnia normy bezpieczeństwa. 24 miesiące gwarancji i dedykowany serwis posprzedażowy.') },
  ];

  return (
    <>
      {/* About Section */}
      <section className="relative py-20 border-t border-white/5" data-testid="about-section" style={{ minHeight: '400px' }}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={16} className="text-[#C6A87C]" />
                <span className="text-[#C6A87C] text-xs font-semibold tracking-[0.15em] uppercase">Warszawa, Polska</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 leading-tight">
                {tr('Polski producent saun i balii')}<br />
                <span className="text-[#C6A87C]">{tr('od 2015 roku')}</span>
              </h2>
              <div className="space-y-4 text-white/50 text-sm leading-relaxed">
                <p>{tr('WM Group to polska firma z siedzibą w Warszawie, specjalizująca się w produkcji premium saun ogrodowych i drewnianych balii. Tworzymy produkty, które zmieniają Twój ogród w prywatną strefę relaksu i zdrowia.')}</p>
                <p>{tr('Każdy nasz produkt powstaje z najlepszych, naturalnych materiałów — skandynawskiego drewna iglastego klasy A+, suszonego komorowo. Dbamy o każdy detal, bo wierzymy, że Twój odpoczynek zasługuje na najwyższą jakość.')}</p>
                <p>{tr('Wszystkie nasze sauny i balie spełniają rygorystyczne normy bezpasieczeństwa i komfortu. Przed wysyłką każdy produkt przechodzi kontrolę w ponad 30 punktach — dostajesz gotowe, w pełni zmontowane rozwiązanie, gotowe do użycia od pierwszego dnia.')}</p>
              </div>
            </div>
            <div className="space-y-5 md:pt-12">
              {values.map((v, i) => (
                <div key={i} className="flex gap-4 p-5 border border-white/5 hover:border-[#C6A87C]/20 transition-colors">
                  <div className="w-10 h-10 flex items-center justify-center border border-[#C6A87C]/30 flex-shrink-0"><v.icon size={20} className="text-[#C6A87C]" /></div>
                  <div><h3 className="text-white font-semibold text-sm mb-1">{v.title}</h3><p className="text-white/40 text-xs leading-relaxed">{v.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 border-t border-white/5" data-testid="contact-section" style={{ minHeight: '500px' }}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{tr('Masz pytania?')} <span className="text-[#C6A87C]">{tr('Napisz do nas')}</span></h2>
            <p className="text-white/40 text-sm max-w-md mx-auto">{tr('Nasz doradca odpowie na każde pytanie dotyczące saun, balii lub konfiguracji zamówienia.')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-start gap-4"><Phone size={18} className="text-[#C6A87C] mt-0.5 flex-shrink-0" /><div><div className="text-white font-medium text-sm">{tr('Telefon')}</div><a href={`tel:${phone.replace(/\s/g, '')}`} className="text-white/50 text-sm hover:text-[#C6A87C] transition-colors">{phone}</a></div></div>
              <div className="flex items-start gap-4"><Mail size={18} className="text-[#C6A87C] mt-0.5 flex-shrink-0" /><div><div className="text-white font-medium text-sm">Email</div><a href={`mailto:${email}`} className="text-white/50 text-sm hover:text-[#C6A87C] transition-colors">{email}</a></div></div>
              <div className="flex items-start gap-4"><MapPin size={18} className="text-[#C6A87C] mt-0.5 flex-shrink-0" /><div><div className="text-white font-medium text-sm">{tr('Adres')}</div><p className="text-white/50 text-sm">{tr(address)}</p></div></div>
            </div>
            <div className="md:col-span-3">
              {submitted ? (
                <div className="text-center py-10 border border-white/5">
                  <CheckCircle size={40} className="mx-auto text-green-400 mb-3" />
                  <h3 className="text-white text-lg font-semibold mb-2">{tr('Dziękujemy!')}</h3>
                  <p className="text-white/50 text-sm">{tr('Nasz doradca skontaktuje się z Tobą wkrótce.')}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" placeholder={tr("Imię *")} required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full p-3 bg-white/5 border border-white/10 text-white text-sm focus:border-[#C6A87C] outline-none placeholder-white/25" data-testid="landing-contact-name" />
                    <input type="tel" placeholder={tr("Telefon *")} required value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full p-3 bg-white/5 border border-white/10 text-white text-sm focus:border-[#C6A87C] outline-none placeholder-white/25" data-testid="landing-contact-phone" />
                  </div>
                  <input type="email" placeholder="Email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full p-3 bg-white/5 border border-white/10 text-white text-sm focus:border-[#C6A87C] outline-none placeholder-white/25" />
                  <textarea placeholder={tr("Twoja wiadomość")} rows={4} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} className="w-full p-3 bg-white/5 border border-white/10 text-white text-sm focus:border-[#C6A87C] outline-none placeholder-white/25 resize-none" />
                  <button type="submit" disabled={submitting} className="w-full py-3 bg-[#C6A87C] text-white font-semibold hover:bg-[#B09060] transition-colors disabled:opacity-50 flex items-center justify-center gap-2" data-testid="landing-contact-submit">
                    <Send size={16} /> {submitting ? tr('Wysyłanie...') : tr('Wyślij wiadomość')}
                  </button>
                </form>
              )}
            </div>
          </div>
          {/* Map — lazy iframe */}
          <div className="mt-12" style={{ minHeight: '350px', aspectRatio: '16/6' }}>
            <iframe
              title="WM Group Location"
              src={siteSettings?.map_embed_url || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2446.237789917054!2d20.94916221172422!3d52.184550271858335!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47193321efe2d2cd%3A0xe02bd55a82f8973!2sW.M.%20Group%20%E2%80%93%20Sauny%2C%20Balie%2C%20Jacuzzi%20Ogrodowe%20od%20producenta%20Wm-sauna.pl!5e0!3m2!1sru!2spl!4v1774963768524!5m2!1sru!2spl"}
              width="100%"
              height="350"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              data-testid="main-landing-map"
            />
          </div>
        </div>
      </section>

      {/* Footer — inside BelowFold to prevent CLS (no element shifts below) */}
      <footer className="py-8 text-center border-t border-white/5">
        <p className="text-white/20 text-xs">{tr('© 2025 WM Group. Polski producent saun i balii premium. Warszawa.')}</p>
      </footer>
    </>
  );
};

export default MainLandingBelowFold;
