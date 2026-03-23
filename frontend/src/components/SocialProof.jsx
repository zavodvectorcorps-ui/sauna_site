import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AnimatedCounter = ({ value, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const numericValue = parseInt(value.replace(/[^0-9]/g, ''));
  const hasPlus = value.includes('+');

  useEffect(() => {
    if (!isInView || isNaN(numericValue)) return;
    const duration = 2000;
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setCount(numericValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, numericValue]);

  if (isNaN(numericValue)) return <span>{value}</span>;
  return <span ref={ref}>{count}{hasPlus ? '+' : ''}{suffix}</span>;
};

export const SocialProof = () => {
  const { language } = useLanguage();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/settings/social-proof`)
      .then(r => r.json())
      .then(setSettings)
      .catch(console.error);
  }, []);

  if (!settings?.show_section) return null;

  const lang = language.toLowerCase();

  return (
    <div data-testid="social-proof" className="bg-[#1A1A1A] py-10 md:py-14">
      <div className="container-main">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {settings.items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#C6A87C] mb-2">
                <AnimatedCounter value={item.value} />
              </div>
              <div className="text-sm md:text-base text-white/70">
                {item[`label_${lang}`] || item.label_pl}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
