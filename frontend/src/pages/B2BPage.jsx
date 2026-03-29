import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Truck, Users, ShieldCheck, Star, Phone, Mail, Send, CheckCircle, Building2 } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const ICON_MAP = { TrendingUp, Truck, Users, ShieldCheck, Star, Phone, Mail, Building2 };

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
      {/* Header */}
      <header className="py-6 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="text-white/40 hover:text-white transition-colors" data-testid="b2b-back">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-bold tracking-[0.2em] text-white uppercase">WM Group</h1>
          </div>
          <nav className="flex gap-4">
            <button onClick={() => navigate('/sauny')} className="text-white/50 hover:text-[#C6A87C] text-sm transition-colors">Sauny</button>
            <button onClick={() => navigate('/balie')} className="text-white/50 hover:text-[#D4AF37] text-sm transition-colors">Balie</button>
            <button onClick={() => navigate('/blog')} className="text-white/50 hover:text-white text-sm transition-colors">Blog</button>
          </nav>
        </div>
      </header>

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
