import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

import { useAutoTranslate } from '../context/AutoTranslateContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AnimatedCounter = ({ value }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  // Parse value: extract prefix, number, suffix
  const s = String(value).trim();
  let prefix = '', num = 0, suffix = '';

  const rangeMatch = s.match(/^(\d+)\s*[-–]\s*(\d+)(.*)$/);
  const stdMatch = s.match(/^([^\d]*)(\d+)(.*)$/);

  if (rangeMatch) {
    prefix = rangeMatch[1] + ' - ';
    num = parseInt(rangeMatch[2]);
    suffix = rangeMatch[3].trim();
  } else if (stdMatch) {
    prefix = stdMatch[1];
    num = parseInt(stdMatch[2]);
    suffix = stdMatch[3];
  }

  useEffect(() => {
    if (!isInView || !num) return;
    const duration = 2000;
    const steps = 60;
    const increment = num / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= num) {
        setCount(num);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, num]);

  if (!num) return <span ref={ref}>{value}</span>;
  return <span ref={ref}>{prefix}{count}{suffix}</span>;
};

export const SocialProof = () => {
  const { language } = useLanguage();
  const { tr } = useAutoTranslate();
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
                {item[`label_${lang}`] || tr(item.label_pl)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
