import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';

export const Reviews = () => {
  const { language, t } = useLanguage();
  const { reviews } = useSettings();

  const getReviewText = (review) => {
    const key = `text_${language}`;
    return review[key] || review.text_pl || '';
  };

  return (
    <section
      id="reviews"
      data-testid="reviews-section"
      className="section-spacing bg-white"
    >
      <div className="container-main">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="gold-line mx-auto mb-6" />
          <h2 className="section-title" data-testid="reviews-title">
            {t('reviews.title')}
          </h2>
          <p className="section-subtitle mx-auto">{t('reviews.subtitle')}</p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="review-card"
              data-testid={`review-card-${review.id}`}
            >
              {/* Quote icon */}
              <Quote
                size={32}
                className="text-[#C6A87C]/30 mb-4"
                fill="currentColor"
              />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={
                      i < review.rating
                        ? 'text-[#D4AF37] fill-current'
                        : 'text-[#E5E5E5]'
                    }
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-[#595959] text-lg leading-relaxed mb-6 font-accent italic">
                "{getReviewText(review)}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <img
                  src={review.image}
                  alt={review.name}
                  className="w-12 h-12 object-cover"
                />
                <div>
                  <p className="font-semibold text-[#1A1A1A]">{review.name}</p>
                  <p className="text-sm text-[#8C8C8C]">
                    {review.location} • {review.sauna}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* See More */}
        <div className="text-center mt-10">
          <a
            href="https://www.google.com/maps/place/WM+Group"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary inline-flex items-center gap-2"
            data-testid="reviews-see-more"
          >
            {t('reviews.see_more')}
          </a>
        </div>
      </div>
    </section>
  );
};
