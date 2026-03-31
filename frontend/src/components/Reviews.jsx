import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { useAutoScroll } from '../hooks/useAutoScroll';

export const Reviews = () => {
  const { language, t } = useLanguage();
  const { reviews, getSetting } = useSettings();
  const sectionContent = getSetting('reviews_settings');
  const { scrollRef, currentIndex, scrollDir, onTouchStart, onTouchEnd } = useAutoScroll({ itemCount: reviews?.length || 0, intervalMs: 5000 });

  const getReviewText = (review) => {
    const key = `text_${language}`;
    return review[key] || review.text_pl || '';
  };

  const ReviewCard = ({ review, index, isMobile }) => (
    <motion.div
      key={review.id}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: isMobile ? 0 : index * 0.1 }}
      className={`review-card ${isMobile ? 'w-[72vw] flex-shrink-0 snap-start shadow-md rounded-lg' : ''}`}
      data-testid={`review-card-${review.id}`}
    >
      <Quote size={32} className="text-[#C6A87C]/30 mb-4" fill="currentColor" />
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={16} className={i < review.rating ? 'text-[#D4AF37] fill-current' : 'text-[#E5E5E5]'} />
        ))}
      </div>
      <p className={`text-[#595959] leading-relaxed mb-6 font-accent italic ${isMobile ? 'text-sm line-clamp-4' : 'text-lg'}`}>
        "{getReviewText(review)}"
      </p>
      <div className="flex items-center gap-4">
        <img src={review.image} alt={review.name} className="w-12 h-12 object-cover" />
        <div>
          <p className="font-semibold text-[#1A1A1A]">{review.name}</p>
          <p className="text-sm text-[#8C8C8C]">{review.location} • {review.sauna}</p>
        </div>
      </div>
    </motion.div>
  );

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
            {sectionContent ? sectionContent[`title_${language.toLowerCase()}`] : t('reviews.title')}
          </h2>
          <p className="section-subtitle mx-auto">
            {sectionContent ? sectionContent[`subtitle_${language.toLowerCase()}`] : t('reviews.subtitle')}
          </p>
        </div>

        {/* Mobile: horizontal scroll with peek */}
        <div className="md:hidden relative" data-testid="reviews-mobile-scroll">
          <div
            ref={scrollRef}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 scroll-pl-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {reviews.map((review, index) => (
              <ReviewCard key={review.id} review={review} index={index} isMobile />
            ))}
          </div>
          {reviews.length > 1 && (
            <div className="flex justify-center items-center gap-2 mt-3">
              <button onClick={() => scrollDir('left')} className="w-9 h-9 flex items-center justify-center bg-[#F2F2F0] hover:bg-[#C6A87C]/20 transition-colors" data-testid="reviews-scroll-left">
                <ChevronLeft size={18} className="text-[#595959]" />
              </button>
              {reviews.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === currentIndex ? 'bg-[#C6A87C]' : 'bg-[#D4D4D4]'}`} />
              ))}
              <button onClick={() => scrollDir('right')} className="w-9 h-9 flex items-center justify-center bg-[#F2F2F0] hover:bg-[#C6A87C]/20 transition-colors" data-testid="reviews-scroll-right">
                <ChevronRight size={18} className="text-[#595959]" />
              </button>
            </div>
          )}
        </div>

        {/* Desktop: grid */}
        <div className="hidden md:grid grid-cols-2 gap-6">
          {reviews.map((review, index) => (
            <ReviewCard key={review.id} review={review} index={index} />
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
