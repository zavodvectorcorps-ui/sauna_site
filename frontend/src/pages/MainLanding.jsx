import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Flame, Droplets, MapPin, ShieldCheck, Leaf, Heart, Phone, Mail, Send, CheckCircle } from 'lucide-react';
import { resolveMediaUrl } from '../lib/utils';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

const API = process.env.REACT_APP_BACKEND_URL;

const DEFAULT_SAUNA_IMG = 'https://images.unsplash.com/photo-1759302354886-f2c37dd3dd8c?auto=format&fit=crop&w=800&q=80';
const DEFAULT_BALIA_IMG = 'https://images.unsplash.com/photo-1668461363398-1fd41bf2ca79?auto=format&fit=crop&w=800&q=80';

/* Parallax card with all effects */
const ProductCard = ({ img, imgPos, video, accentColor, icon: Icon, brand, title, desc, cta, onClick, direction, testId }) => {
  const cardRef = useRef(null);
  const videoRef = useRef(null);
  const [transform, setTransform] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const touchStartRef = useRef({ x: 0, y: 0 });

  const playVideo = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const stopVideo = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setTransform({ x: x * -12, y: y * -8 });
  }, []);

  const handleMouseEnter = useCallback(() => {
    setHovered(true);
    playVideo();
  }, [playVideo]);

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    setTransform({ x: 0, y: 0 });
    stopVideo();
  }, [stopVideo]);

  // Touch events for mobile
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    setHovered(true);
    playVideo();
  }, [playVideo]);

  const handleTouchMove = useCallback((e) => {
    if (!cardRef.current) return;
    const touch = e.touches[0];
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((touch.clientY - rect.top) / rect.height - 0.5) * 2;
    setTransform({ x: x * -12, y: y * -8 });
  }, []);

  const handleTouchEnd = useCallback((e) => {
    setHovered(false);
    setTransform({ x: 0, y: 0 });
    stopVideo();
    // Only navigate if not a drag (small movement)
    const touch = e.changedTouches[0];
    const dx = Math.abs(touch.clientX - touchStartRef.current.x);
    const dy = Math.abs(touch.clientY - touchStartRef.current.y);
    if (dx < 10 && dy < 10) onClick();
  }, [stopVideo, onClick]);

  const isSauna = testId === 'card-sauny';
  const glowColor = isSauna ? 'rgba(198,168,124' : 'rgba(212,175,55';

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, x: direction === 'left' ? -30 : 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: direction === 'left' ? 0.2 : 0.35 }}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="group relative overflow-hidden cursor-pointer min-h-[400px] md:min-h-[480px] flex flex-col justify-end"
      data-testid={testId}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 z-10 group-hover:to-black/80 transition-all duration-700" />
      {/* Parallax image */}
      <img
        src={img}
        alt={title}
        className={`absolute inset-[-16px] w-[calc(100%+32px)] h-[calc(100%+32px)] object-cover transition-all duration-[1.2s] ease-out ${video ? (hovered ? 'opacity-0' : 'opacity-100') : 'group-hover:scale-110'}`}
        style={{
          objectPosition: imgPos,
          transform: !video && hovered ? `translate(${transform.x}px, ${transform.y}px) scale(1.1)` : 'translate(0,0) scale(1)',
        }}
      />
      {/* Video */}
      {video && (
        <video
          ref={videoRef}
          src={video}
          muted
          loop
          playsInline
          preload="auto"
          className={`absolute inset-[-16px] w-[calc(100%+32px)] h-[calc(100%+32px)] object-cover transition-opacity duration-700 ${hovered ? 'opacity-100' : 'opacity-0'}`}
          style={{
            transform: hovered ? `translate(${transform.x}px, ${transform.y}px) scale(1.05)` : 'translate(0,0) scale(1)',
            transition: 'transform 1.2s ease-out, opacity 0.7s ease',
          }}
        />
      )}
      {/* Golden glow */}
      <div className="absolute inset-0 z-[11] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: `inset 0 0 40px ${glowColor},0.15), inset 0 0 80px ${glowColor},0.05)` }} />
      {/* Light streak */}
      <div className="absolute inset-0 z-[12] pointer-events-none overflow-hidden">
        <div className="card-streak absolute -top-full -left-1/2 w-[200%] h-[200%]" style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 55%, transparent 60%)' }} />
      </div>
      {/* Vignette */}
      <div className="absolute inset-0 z-[11] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)' }} />
      {/* Content */}
      <div className="relative z-20 p-8 transition-transform duration-500 ease-out group-hover:-translate-y-2">
        <div className="flex items-center gap-2 mb-3">
          <Icon size={18} style={{ color: accentColor }} />
          <span style={{ color: accentColor }} className="text-xs font-semibold tracking-[0.2em] uppercase">{brand}</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{title}</h2>
        <p className="text-white/60 text-sm mb-6 max-w-sm transition-opacity duration-500 group-hover:text-white/80">{desc}</p>
        <div className="flex items-center gap-2 text-white font-medium transition-all duration-300" style={{ '--hover-color': accentColor }}>
          <span className="group-hover:text-[--hover-color] transition-colors duration-300">{cta}</span>
          <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-2" />
        </div>
      </div>
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] z-20 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" style={{ background: accentColor }} />
    </motion.div>
  );
};

const MainLanding = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saunaImg, setSaunaImg] = useState('');
  const [baliaImg, setBaliaImg] = useState('');
  const [saunaPos, setSaunaPos] = useState('center');
  const [baliaPos, setBaliaPos] = useState('center');
  const [saunaVideo, setSaunaVideo] = useState('');
  const [baliaVideo, setBaliaVideo] = useState('');
  const [imagesReady, setImagesReady] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/settings/main-landing`)
      .then(r => r.json())
      .then(d => {
        setSaunaImg(resolveMediaUrl(d.sauna_image) || DEFAULT_SAUNA_IMG);
        setBaliaImg(resolveMediaUrl(d.balia_image) || DEFAULT_BALIA_IMG);
        if (d.sauna_image_position) setSaunaPos(d.sauna_image_position);
        if (d.balia_image_position) setBaliaPos(d.balia_image_position);
        if (d.sauna_video) setSaunaVideo(resolveMediaUrl(d.sauna_video));
        if (d.balia_video) setBaliaVideo(resolveMediaUrl(d.balia_video));
      })
      .catch(() => {
        setSaunaImg(DEFAULT_SAUNA_IMG);
        setBaliaImg(DEFAULT_BALIA_IMG);
      })
      .finally(() => setImagesReady(true));
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
      <header className="py-8 px-6" data-testid="main-landing-header">
        <div className="flex items-center justify-between max-w-5xl mx-auto mb-4">
          <div />
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-[0.3em] text-white uppercase">WM Group</h1>
            <p className="text-white/30 text-xs tracking-widest mt-1">SAUNY &bull; BALIE &bull; SPA</p>
          </div>
          <LanguageSwitcher variant="dark" />
        </div>
        <nav className="flex justify-center gap-6">
          <button onClick={() => navigate('/sauny')} className="text-white/50 hover:text-[#C6A87C] text-sm transition-colors">Sauny</button>
          <button onClick={() => navigate('/balie')} className="text-white/50 hover:text-[#D4AF37] text-sm transition-colors">Balie</button>
          <button onClick={() => navigate('/blog')} className="text-white/50 hover:text-white text-sm transition-colors">Blog</button>
          <button onClick={() => navigate('/b2b')} className="text-[#34D399] hover:text-[#6EE7B7] text-sm font-semibold transition-colors" data-testid="nav-b2b">B2B <span className="text-[#34D399]/60">(Dla hoteli i pensjonatów)</span></button>
        </nav>
      </header>

      {/* Product cards */}
      <section className="px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {imagesReady && (
            <>
              <ProductCard
                img={saunaImg} imgPos={saunaPos} video={saunaVideo} accentColor="#C6A87C"
                icon={Flame} brand="WM-Sauna" title="Sauny ogrodowe"
                desc="Gotowe, zmontowane sauny beczki, kwadro i wiking. Skandynawskie drewno klasy A+. Dostawa w 5-10 dni."
                cta="Zobacz sauny" onClick={() => navigate('/sauny')}
                direction="left" testId="card-sauny"
              />
              <ProductCard
                img={baliaImg} imgPos={baliaPos} video={baliaVideo} accentColor="#D4AF37"
                icon={Droplets} brand="WM-Balia" title="Balie i jacuzzi"
                desc="Ręcznie robione drewniane balie, jacuzzi i akcesoria SPA. Naturalne drewno, najwyższa jakość."
                cta="Zobacz balie" onClick={() => navigate('/balie')}
                direction="right" testId="card-balie"
              />
            </>
          )}
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
                Polski producent saun i balii<br />
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
                { icon: ShieldCheck, title: 'Bezpieczeństwo i komfort klienta', desc: 'Każdy produkt spełnia normy bezpieczeństwa. 24 miesiące gwarancji i dedykowany serwis posprzedażowy.' },
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
