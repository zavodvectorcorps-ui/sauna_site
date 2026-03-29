import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const extractYouTubeId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return match ? match[1] : null;
};

const VideoCard = ({ item, index, isMobile }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [playing, setPlaying] = useState(false);
  const videoId = extractYouTubeId(item.youtube_url);

  if (!videoId) return null;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: isMobile ? 0 : index * 0.1 }}
      className={`group ${isMobile ? 'min-w-[85%] snap-center flex-shrink-0' : ''}`}
      data-testid={`video-review-${index}`}
    >
      <div className="relative aspect-video bg-[#1A1A1A] overflow-hidden">
        {playing ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title={item.title || 'Video review'}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            className="absolute inset-0 w-full h-full cursor-pointer"
            data-testid={`video-play-${index}`}
          >
            <img
              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
              alt={item.title || 'Video thumbnail'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`; }}
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-[#C6A87C] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl">
                <Play size={28} className="text-white ml-1" fill="white" />
              </div>
            </div>
          </button>
        )}
      </div>
      {(item.title || item.description) && (
        <div className="pt-4">
          {item.title && <h3 className="text-[#1A1A1A] font-semibold text-sm sm:text-base mb-1">{item.title}</h3>}
          {item.description && <p className="text-[#8C8C8C] text-xs sm:text-sm leading-relaxed">{item.description}</p>}
        </div>
      )}
    </motion.div>
  );
};

export const SaunaVideoReviews = () => {
  const [data, setData] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    fetch(`${API}/api/settings/video-reviews`)
      .then(r => r.json())
      .then(d => { if (d?.items?.length) setData(d); })
      .catch(() => {});
  }, []);

  if (!data) return null;

  const sortedItems = [...data.items].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    const w = scrollRef.current.offsetWidth * 0.87;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -w : w, behavior: 'smooth' });
  };

  return (
    <section className="py-6 sm:py-8 bg-white overflow-hidden" data-testid="sauna-video-reviews">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-5">
          <p className="text-[#C6A87C] text-xs sm:text-sm tracking-widest uppercase mb-2">Wideo</p>
          <h2 className="text-[#1A1A1A] text-2xl sm:text-3xl font-bold leading-tight mb-2">
            {data.title}
          </h2>
          {data.subtitle && (
            <p className="text-[#8C8C8C] text-sm max-w-2xl mx-auto">{data.subtitle}</p>
          )}
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="md:hidden relative" data-testid="video-reviews-mobile-scroll">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {sortedItems.map((item, i) => (
              <VideoCard key={item.id || i} item={item} index={i} isMobile />
            ))}
          </div>
          {sortedItems.length > 1 && (
            <div className="flex justify-center gap-3 mt-3">
              <button onClick={() => scroll('left')} className="w-9 h-9 flex items-center justify-center bg-[#F2F2F0] hover:bg-[#C6A87C]/20 transition-colors" data-testid="video-scroll-left">
                <ChevronLeft size={18} className="text-[#595959]" />
              </button>
              <button onClick={() => scroll('right')} className="w-9 h-9 flex items-center justify-center bg-[#F2F2F0] hover:bg-[#C6A87C]/20 transition-colors" data-testid="video-scroll-right">
                <ChevronRight size={18} className="text-[#595959]" />
              </button>
            </div>
          )}
        </div>

        {/* Desktop: grid */}
        <div className={`hidden md:grid gap-6 sm:gap-8 ${
          sortedItems.length === 1 ? 'max-w-2xl mx-auto' :
          sortedItems.length === 2 ? 'grid-cols-2' :
          'grid-cols-3'
        }`}>
          {sortedItems.map((item, i) => (
            <VideoCard key={item.id || i} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};
