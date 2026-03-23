import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Users, Check, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const StockSaunas = () => {
  const { t, language } = useLanguage();
  const [saunas, setSaunas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sectionContent, setSectionContent] = useState(null);
  const sliderRef = useRef(null);

  useEffect(() => {
    fetchSaunas();
  }, []);

  const fetchSaunas = async () => {
    try {
      const [saunasRes, contentRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/stock-saunas`),
        fetch(`${BACKEND_URL}/api/settings/stock`)
      ]);
      const saunasData = await saunasRes.json();
      const content = await contentRes.json();
      setSectionContent(content);

      // Map data to expected format
      const stockItems = saunasData.map((sauna) => ({
        id: sauna.id,
        name: sauna.name,
        image: sauna.image,
        price: sauna.price,
        discount: sauna.discount,
        capacity: sauna.capacity,
        steamRoomSize: sauna.steam_room_size,
        relaxRoomSize: sauna.relax_room_size,
      }));

      setSaunas(stockItems);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stock saunas:', error);
      setLoading(false);
    }
  };

  const calculateDiscountedPrice = (price, discount) => {
    if (!discount) return price;
    return Math.round(price * (1 - discount / 100));
  };

  const scrollToCalculator = () => {
    const element = document.querySelector('#calculator');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = 300;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const SaunaCard = ({ sauna, index, isMobile = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`card-product group ${isMobile ? 'flex-shrink-0 w-[280px] snap-center' : ''}`}
      data-testid={`stock-card-${sauna.id}`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F2F2F0]">
        <img
          src={sauna.image}
          alt={sauna.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Available badge */}
        <div className="absolute top-3 left-3">
          <span className="badge-available flex items-center gap-1">
            <Check size={12} />
            {t('stock.available')}
          </span>
        </div>
        {/* Discount badge */}
        {sauna.discount > 0 && (
          <div className="absolute top-3 right-3">
            <span className="discount-badge">-{sauna.discount}%</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <h3 className="font-semibold text-[#1A1A1A] text-base mb-2 line-clamp-2">
          {sauna.name}
        </h3>

        {/* Specs */}
        <div className="flex flex-wrap gap-2 mb-3">
          {sauna.capacity && (
            <span className="inline-flex items-center gap-1 text-xs text-[#595959] bg-[#F2F2F0] px-2 py-1">
              <Users size={12} />
              {sauna.capacity} {t('calculator.persons')}
            </span>
          )}
          {sauna.steamRoomSize && (
            <span className="inline-flex items-center gap-1 text-xs text-[#595959] bg-[#F2F2F0] px-2 py-1">
              {sauna.steamRoomSize}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-end gap-2 mb-4">
          <span className="text-xl font-bold text-[#C6A87C]">
            {calculateDiscountedPrice(sauna.price, sauna.discount).toLocaleString()} PLN
          </span>
          {sauna.discount > 0 && (
            <span className="text-sm text-[#8C8C8C] line-through">
              {sauna.price.toLocaleString()} PLN
            </span>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={scrollToCalculator}
          className="w-full btn-secondary flex items-center justify-center gap-2 text-sm group/btn py-2"
          data-testid={`stock-buy-${sauna.id}`}
        >
          {t('stock.buy_now')}
          <ArrowRight
            size={16}
            className="group-hover/btn:translate-x-1 transition-transform duration-200"
          />
        </button>
      </div>
    </motion.div>
  );

  return (
    <section
      id="stock"
      data-testid="stock-section"
      className="section-spacing bg-[#F9F9F7]"
    >
      <div className="container-main">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="gold-line mx-auto mb-6" />
          <h2 className="section-title" data-testid="stock-title">
            {sectionContent ? sectionContent[`title_${language.toLowerCase()}`] : t('stock.title')}
          </h2>
          <p className="section-subtitle mx-auto">
            {sectionContent ? sectionContent[`subtitle_${language.toLowerCase()}`] : t('stock.subtitle')}
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner" />
          </div>
        ) : (
          <>
            {/* Mobile Horizontal Slider */}
            <div className="md:hidden relative">
              {/* Navigation buttons */}
              <button
                onClick={() => scrollSlider('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 shadow-md flex items-center justify-center text-[#1A1A1A] hover:bg-[#C6A87C] hover:text-white transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => scrollSlider('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 shadow-md flex items-center justify-center text-[#1A1A1A] hover:bg-[#C6A87C] hover:text-white transition-colors"
              >
                <ChevronRight size={20} />
              </button>

              {/* Slider container */}
              <div
                ref={sliderRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-2 pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {saunas.map((sauna, index) => (
                  <SaunaCard key={sauna.id} sauna={sauna} index={index} isMobile={true} />
                ))}
              </div>
            </div>

            {/* Desktop Grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
              {saunas.map((sauna, index) => (
                <SaunaCard key={sauna.id} sauna={sauna} index={index} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
