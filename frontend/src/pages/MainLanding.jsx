import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Flame, Droplets, MapPin, ShieldCheck, Leaf, Heart, Phone, Mail, Send, CheckCircle } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const DEFAULT_SAUNA_IMG = 'https://images.unsplash.com/photo-1759302354886-f2c37dd3dd8c?auto=format&fit=crop&w=800&q=80';
const DEFAULT_BALIA_IMG = 'https://images.unsplash.com/photo-1668461363398-1fd41bf2ca79?auto=format&fit=crop&w=800&q=80';

const MainLanding = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saunaImg, setSaunaImg] = useState(DEFAULT_SAUNA_IMG);
  const [baliaImg, setBaliaImg] = useState(DEFAULT_BALIA_IMG);
  const [saunaPos, setSaunaPos] = useState('center');
  const [baliaPos, setBaliaPos] = useState('center');

  useEffect(() => {
    fetch(`${API}/api/settings/main-landing`)
      .then(r => r.json())
      .then(d => {
        if (d.sauna_image) setSaunaImg(d.sauna_image);
        if (d.balia_image) setBaliaImg(d.balia_image);
        if (d.sauna_image_position) setSaunaPos(d.sauna_image_position);
        if (d.balia_image_position) setBaliaPos(d.balia_image_position);
      })
      .catch(() => {});
  }, []);

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

  return (
    <div className="min-h-screen bg-[#0C0C0C]" data-testid="main-landing">
      {/* Header */}
      <header className="py-8 px-6 text-center">
        <h1 className="text-xl font-bold tracking-[0.3em] text-white uppercase">WM Group</h1>
        <p className="text-white/30 text-xs tracking-widest mt-1">SAUNY &bull; BALIE &bull; SPA</p>
      </header>

      {/* Product cards */}
      <section className="px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Sauny */}
          <motion.div
            initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            onClick={() => navigate('/sauny')}
            className="group relative overflow-hidden cursor-pointer min-h-[400px] md:min-h-[480px] flex flex-col justify-end"
            data-testid="card-sauny"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 z-10" />
            <img src={saunaImg} alt="Sauny" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" style={{ objectPosition: saunaPos }} />
            <div className="relative z-20 p-8">
              <div className="flex items-center gap-2 mb-3"><Flame size={18} className="text-[#C6A87C]" /><span className="text-[#C6A87C] text-xs font-semibold tracking-[0.2em] uppercase">WM-Sauna</span></div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Sauny ogrodowe</h2>
              <p className="text-white/60 text-sm mb-6 max-w-sm">Gotowe, zmontowane sauny beczki, kwadro i wiking. Skandynawskie drewno klasy A+. Dostawa w 5–10 dni.</p>
              <div className="flex items-center gap-2 text-white font-medium group-hover:text-[#C6A87C] transition-colors">Zobacz sauny <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" /></div>
            </div>
          </motion.div>

          {/* Balie */}
          <motion.div
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}
            onClick={() => navigate('/balie')}
            className="group relative overflow-hidden cursor-pointer min-h-[400px] md:min-h-[480px] flex flex-col justify-end"
            data-testid="card-balie"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 z-10" />
            <img src={baliaImg} alt="Balie" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" style={{ objectPosition: baliaPos }} />
            <div className="relative z-20 p-8">
              <div className="flex items-center gap-2 mb-3"><Droplets size={18} className="text-[#D4AF37]" /><span className="text-[#D4AF37] text-xs font-semibold tracking-[0.2em] uppercase">WM-Balia</span></div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Balie i jacuzzi</h2>
              <p className="text-white/60 text-sm mb-6 max-w-sm">Ręcznie robione drewniane balie, jacuzzi i akcesoria SPA. Naturalne drewno, najwyższa jakość.</p>
              <div className="flex items-center gap-2 text-white font-medium group-hover:text-[#D4AF37] transition-colors">Zobacz balie <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" /></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="relative py-20 border-t border-white/5" data-testid="about-section">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={16} className="text-[#C6A87C]" />
                <span className="text-[#C6A87C] text-xs font-semibold tracking-[0.15em] uppercase">Warszawa, Polska</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 leading-tight">
                Polski producent saun i kupieli<br />
                <span className="text-[#C6A87C]">od 2015 roku</span>
              </h2>
              <div className="space-y-4 text-white/50 text-sm leading-relaxed">
                <p>WM Group to polska firma z siedzibą w Warszawie, specjalizująca się w produkcji premium saun ogrodowych i drewnianych balii. Tworzymy produkty, które zmieniają Twój ogród w prywatną strefę relaksu i zdrowia.</p>
                <p>Każdy nasz produkt powstaje z najlepszych, naturalnych materiałów — skandynawskiego drewna iglastego klasy A+, suszonego komorowo. Dbamy o każdy detal, bo wierzymy, że Twój odpoczynek zasługuje na najwyższą jakość.</p>
                <p>Wszystkie nasze sauny i balie spełniają rygorystyczne normy bezpasieczeństwa i komfortu. Przed wysyłką każdy produkt przechodzi kontrolę w ponad 30 punktach — dostajesz gotowe, w pełni zmontowane rozwiązanie, gotowe do użycia od pierwszego dnia.</p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }} className="space-y-5 md:pt-12">
              {[
                { icon: Heart, title: 'Z troską o zdrowie i odpoczynek', desc: 'Sauna i balia to nie tylko luksus — to zdrowie, regeneracja i chwile spokoju dla całej rodziny.' },
                { icon: Leaf, title: 'Naturalne, ekologiczne materiały', desc: 'Używamy wyłącznie drewna z certyfikowanych, zrównoważonych źródeł. Bez plastiku, bez kompromisów.' },
                { icon: ShieldCheck, title: 'Bezpieczeństwo i komfort klienta', desc: 'Każdy produkt spełnia normy bezpieczeństwa. 12 miesięcy gwarancji i dedykowany serwis posprzedażowy.' },
              ].map((v, i) => (
                <div key={i} className="flex gap-4 p-5 border border-white/5 hover:border-[#C6A87C]/20 transition-colors">
                  <div className="w-10 h-10 flex items-center justify-center border border-[#C6A87C]/30 flex-shrink-0"><v.icon size={20} className="text-[#C6A87C]" /></div>
                  <div><h4 className="text-white font-semibold text-sm mb-1">{v.title}</h4><p className="text-white/40 text-xs leading-relaxed">{v.desc}</p></div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 border-t border-white/5" data-testid="contact-section">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Masz pytania? <span className="text-[#C6A87C]">Napisz do nas</span></h2>
            <p className="text-white/40 text-sm max-w-md mx-auto">Nasz doradca odpowie na każde pytanie dotyczące saun, balii lub konfiguracji zamówienia.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-start gap-4"><Phone size={18} className="text-[#C6A87C] mt-0.5 flex-shrink-0" /><div><div className="text-white font-medium text-sm">Telefon</div><a href="tel:+48732099201" className="text-white/50 text-sm hover:text-[#C6A87C] transition-colors">+48 732 099 201</a></div></div>
              <div className="flex items-start gap-4"><Mail size={18} className="text-[#C6A87C] mt-0.5 flex-shrink-0" /><div><div className="text-white font-medium text-sm">Email</div><a href="mailto:kontakt@wm-sauna.pl" className="text-white/50 text-sm hover:text-[#C6A87C] transition-colors">kontakt@wm-sauna.pl</a></div></div>
              <div className="flex items-start gap-4"><MapPin size={18} className="text-[#C6A87C] mt-0.5 flex-shrink-0" /><div><div className="text-white font-medium text-sm">Adres</div><p className="text-white/50 text-sm">Warszawa, Polska</p></div></div>
            </div>
            <div className="md:col-span-3">
              {submitted ? (
                <div className="text-center py-10 border border-white/5">
                  <CheckCircle size={40} className="mx-auto text-green-400 mb-3" />
                  <h3 className="text-white text-lg font-semibold mb-2">Dziękujemy!</h3>
                  <p className="text-white/50 text-sm">Nasz doradca skontaktuje się z Tobą wkrótce.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" placeholder="Imię *" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full p-3 bg-white/5 border border-white/10 text-white text-sm focus:border-[#C6A87C] outline-none placeholder-white/25" data-testid="landing-contact-name" />
                    <input type="tel" placeholder="Telefon *" required value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full p-3 bg-white/5 border border-white/10 text-white text-sm focus:border-[#C6A87C] outline-none placeholder-white/25" data-testid="landing-contact-phone" />
                  </div>
                  <input type="email" placeholder="Email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full p-3 bg-white/5 border border-white/10 text-white text-sm focus:border-[#C6A87C] outline-none placeholder-white/25" />
                  <textarea placeholder="Twoja wiadomość" rows={4} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} className="w-full p-3 bg-white/5 border border-white/10 text-white text-sm focus:border-[#C6A87C] outline-none placeholder-white/25 resize-none" />
                  <button type="submit" disabled={submitting} className="w-full py-3 bg-[#C6A87C] text-white font-semibold hover:bg-[#B09060] transition-colors disabled:opacity-50 flex items-center justify-center gap-2" data-testid="landing-contact-submit">
                    <Send size={16} /> {submitting ? 'Wysyłanie...' : 'Wyślij wiadomość'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-white/5">
        <p className="text-white/20 text-xs">© 2025 WM Group. Polski producent saun i balii premium. Warszawa.</p>
      </footer>
    </div>
  );
};

export default MainLanding;
