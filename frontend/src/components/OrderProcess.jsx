import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Phone, ArrowRight } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const StepCard = ({ step, index, total, dark = false, accent = '#C6A87C' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-30px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      className="relative flex flex-col items-center text-center group"
      data-testid={`order-step-${index}`}
    >
      {/* Connector line */}
      {index < total - 1 && (
        <div className="hidden lg:block absolute top-8 left-[calc(50%+32px)] w-[calc(100%-64px)] h-[1px]">
          <div className="w-full h-full" style={{ background: `linear-gradient(to right, ${accent}66, ${accent}1A)` }} />
          <ArrowRight size={12} className="absolute -right-1.5 -top-[5px]" style={{ color: `${accent}66` }} />
        </div>
      )}

      {/* Number circle */}
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300"
        style={{ border: `2px solid ${accent}4D` }}
      >
        <span className="text-xl font-bold" style={{ color: accent }}>{step.number || index + 1}</span>
      </div>

      {/* Content */}
      <h3 className={`font-semibold text-sm sm:text-base mb-2 leading-snug ${dark ? 'text-white' : 'text-[#1A1A1A]'}`}>
        {step.title}
      </h3>
      <p className={`text-xs sm:text-sm leading-relaxed max-w-[220px] ${dark ? 'text-white/40' : 'text-[#8C8C8C]'}`}>
        {step.desc}
      </p>
    </motion.div>
  );
};

export const OrderProcess = ({ type = 'sauna' }) => {
  const [data, setData] = useState(null);
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-40px' });
  const dark = type === 'balia';

  const endpoint = type === 'balia' ? 'balia-order-process' : 'order-process';

  useEffect(() => {
    fetch(`${API}/api/settings/${endpoint}`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {});
  }, [endpoint]);

  if (!data) return null;
  if (type === 'sauna' && data.show_on_sauny === false) return null;
  if (type === 'balia' && data.show_on_balie === false) return null;

  const steps = data.steps || [];
  if (!steps.length) return null;

  const accent = dark ? '#D4AF37' : '#C6A87C';

  return (
    <section className={`py-14 sm:py-20 overflow-hidden ${dark ? 'bg-[#0F1218]' : 'bg-[#FAFAF8]'}`} data-testid={`order-process-${type}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <p className={`text-xs sm:text-sm tracking-widest uppercase mb-3 font-semibold`} style={{ color: accent }}>Proces zamówienia</p>
          <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-3 ${dark ? 'text-white' : 'text-[#1A1A1A]'}`}>
            {data.title}
          </h2>
          {data.subtitle && (
            <p className={`text-sm sm:text-base max-w-2xl mx-auto ${dark ? 'text-white/40' : 'text-[#8C8C8C]'}`}>{data.subtitle}</p>
          )}
        </motion.div>

        {/* Steps Grid */}
        <div className={`grid gap-8 sm:gap-6 ${
          steps.length <= 3 ? 'grid-cols-1 sm:grid-cols-3' :
          steps.length === 4 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' :
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5'
        }`}>
          {steps.map((step, i) => (
            <StepCard key={step.id || i} step={step} index={i} total={steps.length} dark={dark} accent={accent} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12 sm:mt-16"
        >
          <a
            href="tel:+48732099201"
            className="inline-flex items-center gap-3 text-white px-8 py-3.5 font-semibold text-sm hover:opacity-90 transition-opacity"
            style={{ backgroundColor: accent }}
            data-testid={`order-process-cta-${type}`}
          >
            <Phone size={18} />
            Zadzwoń i zamów: +48 732 099 201
          </a>
          <p className={`text-xs mt-3 ${dark ? 'text-white/30' : 'text-[#8C8C8C]'}`}>Lub wypełnij formularz kontaktowy poniżej</p>
        </motion.div>
      </div>
    </section>
  );
};
