import { useState, useEffect, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useAutoTranslate } from '../../context/AutoTranslateContext';
import { useBalieData } from '../../context/BalieContext';

export const BalieTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);
  const { tr } = useAutoTranslate();
  const { data: balieData } = useBalieData();

  useEffect(() => {
    if (balieData?.testimonials) setTestimonials(balieData.testimonials);
  }, [balieData]);

  useEffect(() => {
    if (testimonials.length > 1) {
      timerRef.current = setInterval(() => setIdx(p => (p + 1) % testimonials.length), 6000);
    }
    return () => clearInterval(timerRef.current);
  }, [testimonials.length]);

  const go = (i) => { setIdx(i); clearInterval(timerRef.current); timerRef.current = setInterval(() => setIdx(p => (p + 1) % testimonials.length), 6000); };

  if (testimonials.length === 0) return null;
  const t = testimonials[idx];

  return (
    <section id="opinie" className="py-20 bg-[#0A0D12]" data-testid="balie-testimonials">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            {tr('Co Mówią Nasi')} <span className="text-[#D4AF37]">{tr('Klienci')}</span>
          </h2>
        </div>

        <div className="relative">
          <div className="bg-[#1A1E27] border border-white/5 p-8 sm:p-10">
            <Quote size={32} className="text-[#D4AF37]/20 mb-4" />
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} size={16} className={i < t.rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-white/10'} />)}
            </div>
            <p className="text-white/80 text-lg leading-relaxed mb-6 italic">"{tr(t.text)}"</p>
            <div className="flex items-center gap-3">
              {t.author_image ? (
                <img src={t.author_image} alt={t.author_name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 bg-[#D4AF37] flex items-center justify-center text-[#0F1218] font-bold">{t.author_name.charAt(0)}</div>
              )}
              <div>
                <div className="text-white font-semibold text-sm">{t.author_name}</div>
                <div className="text-white/30 text-xs">{[t.author_location, t.product_name].filter(Boolean).join(' • ')}</div>
              </div>
            </div>
          </div>

          {testimonials.length > 1 && (
            <>
              <button onClick={() => go(idx === 0 ? testimonials.length - 1 : idx - 1)} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-[#1A1E27] border border-white/10 text-white flex items-center justify-center hover:border-[#D4AF37]"><ChevronLeft size={18} /></button>
              <button onClick={() => go((idx + 1) % testimonials.length)} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-[#1A1E27] border border-white/10 text-white flex items-center justify-center hover:border-[#D4AF37]"><ChevronRight size={18} /></button>
              <div className="flex justify-center gap-2 mt-4">
                {testimonials.map((_, i) => (
                  <button key={i} onClick={() => go(i)} className={`w-2.5 h-2.5 rounded-full transition-all ${i === idx ? 'bg-[#D4AF37] w-6' : 'bg-white/20'}`} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
