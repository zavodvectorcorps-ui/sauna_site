import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const CALCULATOR_API_URL = 'https://wm-kalkulator.pl';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const Gallery = () => {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('all');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const filters = [
    { id: 'all', label: t('gallery.filter_all') },
    { id: 'kwadro', label: t('gallery.filter_kwadro') },
    { id: 'beczka', label: t('gallery.filter_barrel') },
  ];

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const fetchGalleryImages = async () => {
    try {
      // Use backend proxy to avoid CORS issues
      const response = await fetch(`${BACKEND_URL}/api/sauna/prices`);
      const data = await response.json();

      const galleryImages = [];
      data.models.forEach((model) => {
        if (model.imageUrl) {
          const imageUrl = model.imageUrl.startsWith('http')
            ? model.imageUrl
            : `${CALCULATOR_API_URL}${model.imageUrl}`;
          galleryImages.push({
            url: imageUrl,
            alt: model.name,
            category: model.id.includes('kwadro') ? 'kwadro' : 'beczka',
          });
        }
        if (model.galleryImages) {
          model.galleryImages.forEach((img) => {
            const imgUrl = img.startsWith('http') ? img : `${CALCULATOR_API_URL}${img}`;
            galleryImages.push({
              url: imgUrl,
              alt: model.name,
              category: model.id.includes('kwadro') ? 'kwadro' : 'beczka',
            });
          });
        }
      });

      // Add some options images
      data.categories.forEach((category) => {
        category.options.forEach((option) => {
          if (option.imageUrl) {
            const imgUrl = option.imageUrl.startsWith('http')
              ? option.imageUrl
              : `${CALCULATOR_API_URL}${option.imageUrl}`;
            galleryImages.push({
              url: imgUrl,
              alt: option.name || option.namePl,
              category: 'all',
            });
          }
        });
      });

      // Add design guideline images
      const designImages = [
        {
          url: 'https://images.unsplash.com/photo-1757937176646-d943553b5f09?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwzfHxvdXRkb29yJTIwYmFycmVsJTIwc2F1bmElMjBnYXJkZW4lMjBtb2Rlcm4lMjBhcmNoaXRlY3R1cmV8ZW58MHx8fHwxNzcwODQzMjk1fDA&ixlib=rb-4.1.0&q=85',
          alt: 'Modern glass-front outdoor sauna',
          category: 'kwadro',
        },
        {
          url: 'https://images.unsplash.com/photo-1734594709667-adf24e06091a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwyfHxvdXRkb29yJTIwYmFycmVsJTIwc2F1bmElMjBnYXJkZW4lMjBtb2Rlcm4lMjBhcmNoaXRlY3R1cmV8ZW58MHx8fHwxNzcwODQzMjk1fDA&ixlib=rb-4.1.0&q=85',
          alt: 'Traditional barrel sauna in garden',
          category: 'beczka',
        },
        {
          url: 'https://images.unsplash.com/photo-1759300208443-e2450c3cac36?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1MDV8MHwxfHNlYXJjaHwyfHxsdXh1cnklMjBtb2Rlcm4lMjB3b29kZW4lMjBzYXVuYSUyMGludGVyaW9yJTIwcGFub3JhbWljJTIwd2luZG93JTIwbmF0dXJlJTIwdmlld3xlbnwwfHx8fDE3NzA4NDMyODh8MA&ixlib=rb-4.1.0&q=85',
          alt: 'Sauna interior with round window',
          category: 'kwadro',
        },
      ];

      setImages([...designImages, ...galleryImages.slice(0, 12)]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching gallery:', error);
      setLoading(false);
    }
  };

  const filteredImages =
    activeFilter === 'all'
      ? images
      : images.filter((img) => img.category === activeFilter);

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === filteredImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? filteredImages.length - 1 : prev - 1
    );
  };

  return (
    <section
      id="gallery"
      data-testid="gallery-section"
      className="section-spacing bg-white"
    >
      <div className="container-main">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="gold-line mx-auto mb-6" />
          <h2 className="section-title" data-testid="gallery-title">
            {t('gallery.title')}
          </h2>
          <p className="section-subtitle mx-auto">{t('gallery.subtitle')}</p>
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-2 mb-10">
          {filters.map((filter) => (
            <button
              key={filter.id}
              data-testid={`gallery-filter-${filter.id}`}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-6 py-3 text-sm font-medium transition-all duration-200 ${
                activeFilter === filter.id
                  ? 'bg-[#1A1A1A] text-white'
                  : 'bg-transparent border border-black/10 text-[#595959] hover:border-[#C6A87C] hover:text-[#C6A87C]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner" />
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredImages.map((image, index) => (
                <motion.div
                  key={`${image.url}-${index}`}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className={`group cursor-pointer overflow-hidden ${
                    index === 0 ? 'md:col-span-2 md:row-span-2' : ''
                  }`}
                  onClick={() => openLightbox(index)}
                  data-testid={`gallery-image-${index}`}
                >
                  <div
                    className={`relative overflow-hidden bg-[#F2F2F0] ${
                      index === 0 ? 'aspect-[4/3]' : 'aspect-square'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white text-sm font-medium truncate">
                        {image.alt}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && filteredImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
            onClick={closeLightbox}
            data-testid="gallery-lightbox"
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors duration-200 z-10"
            >
              <X size={32} />
            </button>

            {/* Navigation */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors duration-200 p-2"
            >
              <ChevronLeft size={40} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors duration-200 p-2"
            >
              <ChevronRight size={40} />
            </button>

            {/* Image */}
            <motion.img
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              src={filteredImages[currentImageIndex]?.url}
              alt={filteredImages[currentImageIndex]?.alt}
              className="max-w-[90vw] max-h-[85vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm">
              {currentImageIndex + 1} / {filteredImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
