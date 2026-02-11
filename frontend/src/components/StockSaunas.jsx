import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Check, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const CALCULATOR_API_URL = 'https://wm-kalkulator.pl';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const StockSaunas = () => {
  const { t } = useLanguage();
  const [saunas, setSaunas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSaunas();
  }, []);

  const fetchSaunas = async () => {
    try {
      // Use backend proxy to avoid CORS issues
      const response = await fetch(`${BACKEND_URL}/api/sauna/prices`);
      const data = await response.json();

      // Take first 4 active models as "in stock"
      const stockItems = data.models
        .filter((m) => m.active)
        .slice(0, 4)
        .map((model) => ({
          id: model.id,
          name: model.name,
          image: model.imageUrl?.startsWith('http')
            ? model.imageUrl
            : `${CALCULATOR_API_URL}${model.imageUrl}`,
          price: model.basePrice,
          discount: model.discount,
          capacity: model.capacity,
          steamRoomSize: model.steamRoomSize,
          relaxRoomSize: model.relaxRoomSize,
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
            {t('stock.title')}
          </h2>
          <p className="section-subtitle mx-auto">{t('stock.subtitle')}</p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {saunas.map((sauna, index) => (
              <motion.div
                key={sauna.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card-product group"
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
                <div className="p-5">
                  <h3 className="font-semibold text-[#1A1A1A] text-lg mb-2 line-clamp-2">
                    {sauna.name}
                  </h3>

                  {/* Specs */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {sauna.capacity && (
                      <span className="inline-flex items-center gap-1 text-xs text-[#595959] bg-[#F2F2F0] px-2 py-1">
                        <Users size={12} />
                        {sauna.capacity} {t('calculator.persons')}
                      </span>
                    )}
                    {sauna.steamRoomSize && (
                      <span className="inline-flex items-center gap-1 text-xs text-[#595959] bg-[#F2F2F0] px-2 py-1">
                        Parowa: {sauna.steamRoomSize}
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-end gap-2 mb-4">
                    <span className="price-display text-2xl">
                      {calculateDiscountedPrice(
                        sauna.price,
                        sauna.discount
                      ).toLocaleString()}{' '}
                      PLN
                    </span>
                    {sauna.discount > 0 && (
                      <span className="price-original">
                        {sauna.price.toLocaleString()} PLN
                      </span>
                    )}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={scrollToCalculator}
                    className="w-full btn-secondary flex items-center justify-center gap-2 text-sm group/btn"
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
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
