import { motion } from 'framer-motion';
import { Truck, ShieldCheck, TreePine, Headphones } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Gotowa sauna w 5–10 dni',
    desc: 'Nie musisz nic montować. Sauna przyjeżdża w pełni zmontowana i gotowa do użytku.',
  },
  {
    icon: TreePine,
    title: 'Skandynawskie drewno klasy A+',
    desc: 'Suszone komorowo drewno bez kieszeni żywicznych. Stabilne i trwałe przez lata.',
  },
  {
    icon: ShieldCheck,
    title: 'Gwarancja i serwis',
    desc: 'Kontrola w ponad 30 punktach przed wysyłką. 12 miesięcy gwarancji i serwis posprzedażowy.',
  },
  {
    icon: Headphones,
    title: 'Doradca pomoże dobrać',
    desc: 'Pomagamy dobrać model do przestrzeni i stylu domu. Wycena bezpłatna.',
  },
];

export const PromoFeatures = () => {
  return (
    <section className="bg-[#1A1A1A] py-16" data-testid="promo-features">
      <div className="container-main">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-14 h-14 mx-auto mb-4 border border-[#C6A87C]/30 flex items-center justify-center">
                <f.icon size={26} className="text-[#C6A87C]" />
              </div>
              <h3 className="text-white font-semibold mb-2 text-sm">{f.title}</h3>
              <p className="text-white/50 text-xs leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
