import { useState, useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';

const API = process.env.REACT_APP_BACKEND_URL;

const ADVANTAGES = [
  {
    num: 1,
    title: 'Skandynawskie drewno suszone w komorach, najwyższej jakości',
    desc: 'Drewno bez kieszeni żywicznych utrzymuje stabilny kształt i nie wysycha z czasem',
    side: 'left',
  },
  {
    num: 2,
    title: 'Profilowane drewno i stalowe obręcze z nierdzewki',
    desc: 'Montaż na mocnych wkrętach sprawia, że łączenia trzymają kształt bez przewiewów i szczelin',
    side: 'left',
  },
  {
    num: 3,
    title: 'Piec o dobranej mocy z ochroną przed przegrzaniem drewna',
    desc: 'Sauna nagrzewa się szybko, a rodzina ma pełne bezpieczeństwo',
    badge: 'Kamienie gratis',
    side: 'right',
  },
  {
    num: 4,
    title: 'Wybór wyposażenia i wygodna ergonomia wnętrza',
    desc: 'Możesz wybrać układ pomieszczeń, a wewnątrz masz równą podłogę, wygodne półki i praktyczne kratki',
    side: 'right',
  },
  {
    num: 5,
    title: 'Przemyślana wentylacja nawiewna i wywiewna',
    desc: 'Sprawia, że para w saunie jest świeża bez duszności i zbędnego kondensatu',
    side: 'right',
  },
  {
    num: 6,
    title: 'Montujemy saunę w naszej pracowni i sprawdzamy ją w ponad 30 punktach',
    desc: 'Przed wysyłką robimy pełną kontrolę. Gwarancja to 12 miesięcy i zapewniamy serwis',
    side: 'left',
  },
  {
    num: 7,
    title: 'Dwie warstwy impregnatu na zewnątrz chronią przed wilgocią i szkodnikami',
    desc: 'Silikonowe uszczelnienie zabezpiecza fronty ścian. Malujemy saunę na produkcji',
    badge: 'Malowanie w wybranym kolorze',
    side: 'left',
  },
];

const AdvantageItem = ({ item, index, isRight }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isRight ? 30 : -30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={`flex gap-3 ${isRight ? 'text-left' : 'text-right flex-row-reverse'} items-start`}
      data-testid={`sauna-advantage-${item.num}`}
    >
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#C6A87C] flex items-center justify-center mt-0.5">
        <span className="text-white font-bold text-sm">{item.num}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[#1A1A1A] font-semibold text-sm leading-snug mb-1">{item.title}</h4>
        <p className="text-[#8C8C8C] text-xs leading-relaxed">{item.desc}</p>
        {item.badge && (
          <span className="inline-block mt-2 px-3 py-1 bg-[#C6A87C]/10 text-[#C6A87C] text-xs font-semibold rounded-full">
            {item.badge}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export const SaunaAdvantages = () => {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: '-60px' });

  const leftItems = ADVANTAGES.filter(a => a.side === 'left');
  const rightItems = ADVANTAGES.filter(a => a.side === 'right');

  return (
    <section
      ref={sectionRef}
      className="py-16 sm:py-20 bg-[#F9F9F7] overflow-hidden"
      data-testid="sauna-advantages"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14"
        >
          <p className="text-[#8C8C8C] text-sm mb-3 tracking-wide">
            Pokazujemy na schemacie, abyś dokładnie widział, za co płacisz
          </p>
          <h2 className="text-[#1A1A1A] text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-4 max-w-3xl mx-auto">
            Siedem faktów, dzięki którym nasze sauny służą{' '}
            <span className="text-[#C6A87C]">znacznie dłużej</span>
          </h2>
          <p className="text-[#8C8C8C] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Suche skandynawskie drewno klasy A+, montaż w naszej pracowni, precyzyjne łączenia na wkręty, bezpieczny piec, trzy poziomy ochrony przed wilgocią i wygodne dopracowane wnętrze
          </p>
        </motion.div>

        {/* Desktop: 3-column layout (left items | image | right items) */}
        <div className="hidden lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-8 lg:items-center">
          {/* Left column */}
          <div className="space-y-8">
            {leftItems.map((item, i) => (
              <AdvantageItem key={item.num} item={item} index={i} isRight={false} />
            ))}
          </div>

          {/* Center image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="w-[380px] xl:w-[440px] flex-shrink-0"
          >
            <img
              src={`${API}/api/images/sauna-cutaway-7facts`}
              alt="Sauna w przekroju — schemat budowy"
              className="w-full h-auto object-contain drop-shadow-xl"
              loading="lazy"
            />
          </motion.div>

          {/* Right column */}
          <div className="space-y-8">
            {rightItems.map((item, i) => (
              <AdvantageItem key={item.num} item={item} index={i + leftItems.length} isRight={true} />
            ))}
          </div>
        </div>

        {/* Mobile/Tablet: Image on top, then list */}
        <div className="lg:hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="max-w-sm mx-auto mb-10"
          >
            <img
              src={`${API}/api/images/sauna-cutaway-7facts`}
              alt="Sauna w przekroju — schemat budowy"
              className="w-full h-auto object-contain drop-shadow-lg"
              loading="lazy"
            />
          </motion.div>

          <div className="space-y-6 max-w-lg mx-auto">
            {ADVANTAGES.map((item, i) => (
              <motion.div
                key={item.num}
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="flex gap-3 items-start"
                data-testid={`sauna-advantage-mobile-${item.num}`}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#C6A87C] flex items-center justify-center mt-0.5">
                  <span className="text-white font-bold text-xs">{item.num}</span>
                </div>
                <div>
                  <h4 className="text-[#1A1A1A] font-semibold text-sm leading-snug mb-0.5">{item.title}</h4>
                  <p className="text-[#8C8C8C] text-xs leading-relaxed">{item.desc}</p>
                  {item.badge && (
                    <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-[#C6A87C]/10 text-[#C6A87C] text-xs font-semibold rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
