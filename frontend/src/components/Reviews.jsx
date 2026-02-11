import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const reviewsData = {
  pl: [
    {
      id: 1,
      name: 'Marek Kowalski',
      location: 'Warszawa',
      rating: 5,
      text: 'Sauna przekroczyła moje oczekiwania. Jakość wykonania jest niesamowita, a cały proces zamówienia był prosty i przejrzysty. Polecam każdemu!',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      sauna: 'Sauna Beczka 3m',
    },
    {
      id: 2,
      name: 'Anna Nowak',
      location: 'Kraków',
      rating: 5,
      text: 'Świetna obsługa klienta i profesjonalne podejście. Sauna została dostarczona w terminie i wygląda przepięknie w naszym ogrodzie.',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
      sauna: 'Sauna Kwadro 4m',
    },
    {
      id: 3,
      name: 'Piotr Wiśniewski',
      location: 'Gdańsk',
      rating: 5,
      text: 'Już trzeci sezon korzystamy z sauny i jest jak nowa. Drewno skandynawskie naprawdę robi różnicę. Gorąco polecam WM-Sauna!',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      sauna: 'Sauna Beczka 4m',
    },
    {
      id: 4,
      name: 'Katarzyna Lewandowska',
      location: 'Poznań',
      rating: 5,
      text: 'Najlepsza inwestycja w zdrowie i relaks. Montaż był szybki, a sauna działa bezproblemowo. Dziękuję za wspaniałą obsługę!',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      sauna: 'Sauna Kwadro 3.5m',
    },
  ],
  en: [
    {
      id: 1,
      name: 'Marek Kowalski',
      location: 'Warsaw',
      rating: 5,
      text: 'The sauna exceeded my expectations. The build quality is amazing, and the entire ordering process was simple and transparent. Highly recommend!',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      sauna: 'Barrel Sauna 3m',
    },
    {
      id: 2,
      name: 'Anna Nowak',
      location: 'Krakow',
      rating: 5,
      text: 'Great customer service and professional approach. The sauna was delivered on time and looks beautiful in our garden.',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
      sauna: 'Kwadro Sauna 4m',
    },
    {
      id: 3,
      name: 'Piotr Wiśniewski',
      location: 'Gdansk',
      rating: 5,
      text: "This is our third season using the sauna and it's still like new. Scandinavian wood really makes a difference. Highly recommend WM-Sauna!",
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      sauna: 'Barrel Sauna 4m',
    },
    {
      id: 4,
      name: 'Katarzyna Lewandowska',
      location: 'Poznan',
      rating: 5,
      text: 'Best investment in health and relaxation. Installation was quick, and the sauna works flawlessly. Thank you for the wonderful service!',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      sauna: 'Kwadro Sauna 3.5m',
    },
  ],
  ru: [
    {
      id: 1,
      name: 'Марек Ковальский',
      location: 'Варшава',
      rating: 5,
      text: 'Сауна превзошла мои ожидания. Качество изготовления потрясающее, а весь процесс заказа был простым и понятным. Рекомендую всем!',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      sauna: 'Сауна Бочка 3м',
    },
    {
      id: 2,
      name: 'Анна Новак',
      location: 'Краков',
      rating: 5,
      text: 'Отличное обслуживание клиентов и профессиональный подход. Сауна была доставлена вовремя и прекрасно смотрится в нашем саду.',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
      sauna: 'Сауна Квадро 4м',
    },
    {
      id: 3,
      name: 'Пётр Вишневский',
      location: 'Гданьск',
      rating: 5,
      text: 'Уже третий сезон пользуемся сауной, и она как новая. Скандинавская древесина действительно имеет значение. Горячо рекомендую WM-Sauna!',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      sauna: 'Сауна Бочка 4м',
    },
    {
      id: 4,
      name: 'Катажина Левандовская',
      location: 'Познань',
      rating: 5,
      text: 'Лучшая инвестиция в здоровье и отдых. Монтаж был быстрым, а сауна работает безупречно. Спасибо за прекрасное обслуживание!',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      sauna: 'Сауна Квадро 3.5м',
    },
  ],
};

export const Reviews = () => {
  const { language, t } = useLanguage();
  const reviews = reviewsData[language] || reviewsData.pl;

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
                "{review.text}"
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
