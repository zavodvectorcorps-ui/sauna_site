import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const CALCULATOR_API_URL = 'https://wm-kalkulator.pl';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const Gallery = () => {
  const { t, language } = useLanguage();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [galleryConfig, setGalleryConfig] = useState({ hidden_api_images: [], show_api_images: true });
  const [sectionContent, setSectionContent] = useState(null);
  const sliderRef = useRef(null);

  useEffect(() => {
    fetchGalleryData();
  }, []);

  const fetchGalleryData = async () => {
    try {
      // Fetch gallery config, custom images and section content
      const [configRes, customRes, contentRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/settings/gallery`),
        fetch(`${BACKEND_URL}/api/gallery`),
        fetch(`${BACKEND_URL}/api/settings/gallery-content`)
      ]);
      
      const config = await configRes.json();
      const customImages = await customRes.json();
      const content = await contentRes.json();
      setGalleryConfig(config);
      setSectionContent(content);

      // Start with custom images
      const allImages = customImages.map(img => ({
        url: img.url,
        alt: img.alt,
        category: img.category || 'all',
        source: 'custom'
      }));

      // Only fetch API images if enabled
      if (config.show_api_images) {
        try {
          const response = await fetch(`${BACKEND_URL}/api/sauna/prices`);
          const data = await response.json();

          const apiImages = [];
          
          // Get images from models
          data.models?.forEach((model) => {
            if (model.imageUrl) {
              const imageUrl = model.imageUrl.startsWith('http')
                ? model.imageUrl
                : `${CALCULATOR_API_URL}${model.imageUrl}`;
              
              // Check if image is hidden
              if (!config.hidden_api_images?.includes(imageUrl)) {
                apiImages.push({
                  url: imageUrl,
                  alt: model.name,
                  category: model.id.includes('kwadro') ? 'kwadro' : 'beczka',
                  source: 'api'
                });
              }
            }
            
            // Gallery images from model
            model.galleryImages?.forEach((img) => {
              const imgUrl = img.startsWith('http') ? img : `${CALCULATOR_API_URL}${img}`;
              if (!config.hidden_api_images?.includes(imgUrl)) {
                apiImages.push({
                  url: imgUrl,
                  alt: model.name,
                  category: model.id.includes('kwadro') ? 'kwadro' : 'beczka',
                  source: 'api'
                });
              }
            });
          });

          // Get images from options
          data.categories?.forEach((category) => {
            category.options?.forEach((option) => {
              if (option.imageUrl) {
                const imgUrl = option.imageUrl.startsWith('http')
                  ? option.imageUrl
                  : `${CALCULATOR_API_URL}${option.imageUrl}`;
                if (!config.hidden_api_images?.includes(imgUrl)) {
                  apiImages.push({
                    url: imgUrl,
                    alt: option.name || option.namePl,
                    category: 'all',
                    source: 'api'
                  });
                }
              }
            });
          });

          allImages.push(...apiImages.slice(0, 15)); // Limit API images
        } catch (error) {
          console.error('Error fetching API images:', error);
        }
      }

      setImages(allImages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching gallery:', error);
      setLoading(false);
    }
  };

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
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
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
            {sectionContent ? sectionContent[`title_${language.toLowerCase()}`] : t('gallery.title')}
          </h2>
          <p className="section-subtitle mx-auto">
            {sectionContent ? sectionContent[`subtitle_${language.toLowerCase()}`] : t('gallery.subtitle')}
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner" />
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20 text-[#8C8C8C]">
            <p>Галерея пуста</p>
          </div>
        ) : (
          <>
            {/* Horizontal Slider for all screen sizes */}
            <div className="relative">
              {/* Navigation buttons */}
              <button
                onClick={() => scrollSlider('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-white/90 shadow-md flex items-center justify-center text-[#1A1A1A] hover:bg-[#C6A87C] hover:text-white transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={() => scrollSlider('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 md:w-12 md:h-12 bg-white/90 shadow-md flex items-center justify-center text-[#1A1A1A] hover:bg-[#C6A87C] hover:text-white transition-colors"
              >
                <ChevronRight size={24} />
              </button>

              {/* Slider container */}
              <div
                ref={sliderRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-4 md:px-14 pb-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {images.map((image, index) => (
                  <div
                    key={`${image.url}-${index}`}
                    className="flex-shrink-0 w-[280px] md:w-[350px] lg:w-[400px] snap-center cursor-pointer group"
                    onClick={() => openLightbox(index)}
                    data-testid={`gallery-image-${index}`}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#F2F2F0]">
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                      <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <p className="text-white text-sm font-medium truncate bg-black/50 px-3 py-1.5 inline-block">
                          {image.alt}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Scroll indicator */}
              <div className="flex justify-center items-center gap-2 mt-4">
                <span className="text-sm text-[#8C8C8C]">
                  {images.length} zdjęć
                </span>
                <span className="text-[#C6A87C]">•</span>
                <span className="text-sm text-[#8C8C8C]">
                  Przewiń, aby zobaczyć więcej
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && images.length > 0 && (
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
              className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors duration-200 p-2 bg-black/30 hover:bg-black/50"
            >
              <ChevronLeft size={32} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors duration-200 p-2 bg-black/30 hover:bg-black/50"
            >
              <ChevronRight size={32} />
            </button>

            {/* Image */}
            <motion.img
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              src={images[currentImageIndex]?.url}
              alt={images[currentImageIndex]?.alt}
              className="max-w-[90vw] max-h-[85vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm bg-black/50 px-4 py-2">
              {currentImageIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
