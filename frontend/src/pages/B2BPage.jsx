import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Truck, Users, ShieldCheck, Star, Phone, Mail, Send, CheckCircle, Building2, DollarSign, CalendarRange, BarChart3, Sparkles, Wrench, Leaf, Film, Package, Play, X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { GlobalHeader } from '../components/GlobalHeader';

const API = process.env.REACT_APP_BACKEND_URL;

const ICON_MAP = { TrendingUp, Truck, Users, ShieldCheck, Star, Phone, Mail, Building2, DollarSign, CalendarRange, BarChart3, Sparkles, Wrench, Leaf, Film, Package };

const extractYouTubeId = (url) => {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
};

const GallerySection = ({ gallery, title, subtitle }) => {
  const [lightbox, setLightbox] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);

  const items = gallery.filter(g => g.url);

  const openLightbox = (idx) => setLightbox(idx);
  const closeLightbox = () => { setLightbox(null); setPlayingVideo(null); };
  const prev = () => setLightbox(i => (i - 1 + items.length) % items.length);
  const next = () => setLightbox(i => (i + 1) % items.length);

  if (!items.length) return null;

  return (
    <section className="py-16 sm:py-20 border-t border-white/5" data-testid="b2b-gallery">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-3">
            <ImageIcon size={16} className="text-[#C6A87C]" />
            <span className="text-[#C6A87C] text-xs tracking-[0.15em] uppercase font-semibold">Portfolio</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{title || 'Nasze realizacje'}</h2>
          {subtitle && <p className="text-white/40 text-sm max-w-xl mx-auto">{subtitle}</p>}
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {items.map((item, i) => {
            const isVideo = item.type === 'video';
            const ytId = isVideo ? extractYouTubeId(item.url) : null;
            const thumb = isVideo && ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : item.url;

            return (
              <motion.div
                key={item.id || i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative aspect-[4/3] overflow-hidden cursor-pointer bg-[#1A1A1A]"
                onClick={() => openLightbox(i)}
                data-testid={`b2b-gallery-item-${i}`}
              >
                <img
                  src={thumb}
                  alt={item.title || ''}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-[#C6A87C]/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play size={20} className="text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  {item.title && <p className="text-white text-xs font-medium truncate">{item.title}</p>}
                  {item.desc && <p className="text-white/50 text-[10px] truncate">{item.desc}</p>}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
            data-testid="b2b-lightbox"
          >
            <button onClick={closeLightbox} className="absolute top-4 right-4 text-white/60 hover:text-white z-10 p-2" data-testid="lightbox-close">
              <X size={24} />
            </button>
            {items.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white z-10 p-2">
                  <ChevronLeft size={32} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white z-10 p-2">
                  <ChevronRight size={32} />
                </button>
              </>
            )}
            <div className="max-w-4xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
              {items[lightbox]?.type === 'video' ? (
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${extractYouTubeId(items[lightbox].url)}?autoplay=1&rel=0`}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                </div>
              ) : (
                <img
                  src={items[lightbox]?.url}
                  alt={items[lightbox]?.title || ''}
                  className="w-full max-h-[80vh] object-contain"
                />
              )}
              {items[lightbox]?.title && (
                <div className="text-center mt-4">
                  <p className="text-white text-sm font-medium">{items[lightbox].title}</p>
                  {items[lightbox].desc && <p className="text-white/40 text-xs mt-1">{items[lightbox].desc}</p>}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default function B2BPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ company: '', name: '', phone: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/api/settings/b2b`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(`${API}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type: 'b2b' }),
      });
      setSubmitted(true);
    } catch {}
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0C0C0C] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#C6A87C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#0C0C0C]" data-testid="b2b-page">
      <GlobalHeader />

      {/* Hero */}
      <section className="relative py-20 sm:py-28 overflow-hidden" data-testid="b2b-hero">
        {data.hero_image && (
          <div className="absolute inset-0">
            <img src={data.hero_image} alt="" className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0C0C0C] via-transparent to-[#0C0C0C]" />
          </div>
        )}
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center justify-center gap-2 mb-6">
              <Building2 size={20} className="text-[#C6A87C]" />
              <span className="text-[#C6A87C] text-xs font-semibold tracking-[0.2em] uppercase">Dla firm i partnerów</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4" data-testid="b2b-title">
              {data.hero_title}
            </h1>
            <p className="text-white/50 text-base sm:text-lg max-w-2xl mx-auto">
              {data.hero_subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-20 border-t border-white/5" data-testid="b2b-benefits">
        <div className="max-w-5xl mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-bold text-white text-center mb-12"
          >
            {data.benefits_title}
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {(data.benefits || []).map((b, i) => {
              const IconComp = ICON_MAP[b.icon] || Star;
              return (
                <motion.div
                  key={b.id || i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 p-6 border border-white/5 hover:border-[#C6A87C]/30 transition-colors"
                  data-testid={`b2b-benefit-${i}`}
                >
                  <div className="w-12 h-12 flex items-center justify-center border border-[#C6A87C]/30 flex-shrink-0">
                    <IconComp size={22} className="text-[#C6A87C]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm sm:text-base mb-1">{b.title}</h3>
                    <p className="text-white/40 text-xs sm:text-sm leading-relaxed">{b.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery / Realizacje */}
      {(data.gallery || []).length > 0 && (
        <GallerySection gallery={data.gallery} title={data.gallery_title} subtitle={data.gallery_subtitle} />
      )}

      {/* Financial Benefits */}
      <section className="py-16 sm:py-20 border-t border-white/5" data-testid="b2b-financial">
        <div className="max-w-5xl mx-auto px-4">
          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-2xl sm:text-3xl font-bold text-white text-center mb-4">
            Korzyści finansowe — ile można zarobić?
          </motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-white/40 text-sm text-center max-w-2xl mx-auto mb-12">
            Inwestycja w saunę to nie koszt — to źródło nowego przychodu dla Twojego obiektu.
          </motion.p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { value: '+100–150 zł', label: 'za dobę', desc: 'Średni wzrost ceny noclegu z dostępem do sauny' },
              { value: '85–90%', label: 'obłożenie', desc: 'W sezonie z sauną vs 70% bez sauny' },
              { value: '12–18', label: 'miesięcy', desc: 'Średni czas zwrotu inwestycji' },
              { value: '+3000 zł', label: 'miesięcznie', desc: 'Dodatkowy przychód z wynajmu sauny' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center p-6 border border-white/5">
                <div className="text-[#C6A87C] text-2xl sm:text-3xl font-bold mb-1">{s.value}</div>
                <div className="text-white text-sm font-medium mb-2">{s.label}</div>
                <p className="text-white/30 text-xs">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Financing */}
      <section className="py-16 sm:py-20 border-t border-white/5" data-testid="b2b-financing">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Finansowanie — leasing</h2>
              <p className="text-white/40 text-sm leading-relaxed mb-6">
                Właściciele obiektów wypoczynkowych mogą sfinansować zakup sauny za pomocą leasingu. Pozwala on rozłożyć koszt na dogodne raty, minimalizując jednorazowy wydatek.
              </p>
              <div className="p-5 border border-[#C6A87C]/20 bg-[#C6A87C]/5">
                <p className="text-white text-sm mb-2 font-medium">Przykładowa kalkulacja:</p>
                <p className="text-white/40 text-sm">Inwestycja: <span className="text-white">60 000 zł</span></p>
                <p className="text-white/40 text-sm">Rata leasingowa: <span className="text-white">ok. 1 500–2 000 zł/mies.</span></p>
                <p className="text-white/40 text-sm">Dodatkowy przychód: <span className="text-[#C6A87C]">+3 000–4 500 zł/mies.</span></p>
                <p className="text-xs text-[#C6A87C] mt-3 font-medium">Inwestycja zwraca się od pierwszego miesiąca.</p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Dlaczego WM Group?</h2>
              <ul className="space-y-3">
                {[
                  'Sauny z termodrewna — żywotność min. 25 lat',
                  'Kontrola jakości w ponad 30 punktach',
                  'Kompleksowa dostawa i montaż na miejscu',
                  'Materiały marketingowe i wsparcie sprzedażowe',
                  'Gwarancja 24 miesiące na wszystkie produkty',
                  'Profesjonalny film promocyjny przy zakupie >70 tys. zł',
                  'Serwis posprzedażowy i szybki czas reakcji',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <CheckCircle size={16} className="text-[#C6A87C] mt-0.5 flex-shrink-0" />
                    <span className="text-white/60">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA + Contact Form */}
      <section className="py-16 sm:py-20 border-t border-white/5" data-testid="b2b-contact">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{data.cta_title}</h2>
            <p className="text-white/40 text-sm max-w-lg mx-auto">{data.cta_description}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
            <div className="md:col-span-2 space-y-6">
              <div className="flex items-start gap-4">
                <Phone size={18} className="text-[#C6A87C] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-white font-medium text-sm">Telefon</div>
                  <a href={`tel:${(data.cta_phone || '').replace(/\s/g, '')}`} className="text-white/50 text-sm hover:text-[#C6A87C] transition-colors">{data.cta_phone}</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail size={18} className="text-[#C6A87C] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-white font-medium text-sm">Email B2B</div>
                  <a href={`mailto:${data.cta_email}`} className="text-white/50 text-sm hover:text-[#C6A87C] transition-colors">{data.cta_email}</a>
                </div>
              </div>
            </div>

            <div className="md:col-span-3">
              {submitted ? (
                <div className="text-center py-10 border border-white/5">
                  <CheckCircle size={40} className="mx-auto text-green-400 mb-3" />
                  <h3 className="text-white text-lg font-semibold mb-2">Dziękujemy za zainteresowanie!</h3>
                  <p className="text-white/50 text-sm">Nasz dział B2B skontaktuje się z Tobą w ciągu 24 godzin.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" data-testid="b2b-form">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" placeholder="Nazwa firmy *" required value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} className="w-full p-3 bg-white/5 border border-white/10 text-white text-sm focus:border-[#C6A87C] outline-none placeholder-white/25" data-testid="b2b-company" />
                    <input type="text" placeholder="Imię i nazwisko *" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full p-3 bg-white/5 border border-white/10 text-white text-sm focus:border-[#C6A87C] outline-none placeholder-white/25" data-testid="b2b-name" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="tel" placeholder="Telefon *" required value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full p-3 bg-white/5 border border-white/10 text-white text-sm focus:border-[#C6A87C] outline-none placeholder-white/25" data-testid="b2b-phone" />
                    <input type="email" placeholder="Email *" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full p-3 bg-white/5 border border-white/10 text-white text-sm focus:border-[#C6A87C] outline-none placeholder-white/25" data-testid="b2b-email" />
                  </div>
                  <textarea placeholder="Opisz swoje potrzeby" rows={4} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} className="w-full p-3 bg-white/5 border border-white/10 text-white text-sm focus:border-[#C6A87C] outline-none placeholder-white/25 resize-none" />
                  <button type="submit" disabled={submitting} className="w-full py-3 bg-[#C6A87C] text-white font-semibold hover:bg-[#B09060] transition-colors disabled:opacity-50 flex items-center justify-center gap-2" data-testid="b2b-submit">
                    <Send size={16} /> {submitting ? 'Wysyłanie...' : 'Wyślij zapytanie B2B'}
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
}
