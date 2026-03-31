import React from 'react';
import { motion } from 'framer-motion';
import { Factory, TreePine, Shield, Truck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { optimizedImg } from '../lib/utils';

export const About = () => {
  const { language, t } = useLanguage();
  const { aboutSettings } = useSettings();

  const getText = (key) => {
    if (!aboutSettings) return t(`about.${key}`);
    const langKey = `${key}_${language}`;
    return aboutSettings[langKey] || aboutSettings[`${key}_pl`] || t(`about.${key}`);
  };

  const features = [
    {
      icon: Factory,
      title: t('about.feature1'),
      description: 'Własna produkcja w Polsce',
    },
    {
      icon: TreePine,
      title: t('about.feature2'),
      description: 'Suszone w komorach',
    },
    {
      icon: Shield,
      title: t('about.feature3'),
      description: 'Pełna obsługa posprzedażowa',
    },
    {
      icon: Truck,
      title: t('about.feature4'),
      description: 'Transport w całej Polsce',
    },
  ];

  const aboutImage = aboutSettings?.image || 
    'https://images.unsplash.com/photo-1627750673372-ceabdbeb768c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzV8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB3b29kZW4lMjBzYXVuYSUyMGNhYmluJTIwZXh0ZXJpb3IlMjBnYXJkZW58ZW58MHx8fHwxNzcwODQzMzIzfDA&ixlib=rb-4.1.0&q=85';
  
  const yearsExperience = aboutSettings?.years_experience || 10;

  return (
    <section
      id="about"
      data-testid="about-section"
      className="section-spacing bg-[#1A1A1A] text-white relative overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container-main relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Gold line */}
            <div className="gold-line mb-6" />

            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              data-testid="about-title"
            >
              {t('about.title')}
            </h2>
            <p className="text-[#C6A87C] font-medium mb-8">
              {t('about.subtitle')}
            </p>

            <div className="space-y-6 text-white/80">
              <p className="leading-relaxed">{getText('text1')}</p>
              <p className="leading-relaxed">{getText('text2')}</p>
              <p className="leading-relaxed">{getText('text3')}</p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-6 mt-10">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-12 h-12 bg-[#C6A87C] flex items-center justify-center flex-shrink-0">
                    <feature.icon size={24} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">
                      {feature.title}
                    </h4>
                    <p className="text-white/60 text-xs mt-1">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src={optimizedImg(aboutImage, { w: 600, q: 80 })}
                alt="WM-Sauna production"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-6 -left-6 bg-[#C6A87C] p-6 text-center">
              <span className="block text-4xl font-bold text-white">{yearsExperience}+</span>
              <span className="text-sm text-white/80">lat doświadczenia</span>
            </div>

            {/* Border decoration */}
            <div className="absolute -top-4 -right-4 w-full h-full border-2 border-[#C6A87C]/30 -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
