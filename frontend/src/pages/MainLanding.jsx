import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Flame, Droplets } from 'lucide-react';
import { resolveMediaUrl, optimizedImg, optimizedVideo } from '../lib/utils';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useAutoTranslate } from '../context/AutoTranslateContext';

const API = process.env.REACT_APP_BACKEND_URL;
const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : true;

// Default hero images — Cloudinary production URLs, render immediately
const DEFAULT_SAUNA_IMG = 'https://res.cloudinary.com/dhyj13jgs/image/upload/w_800,q_auto,f_auto/v1775044580/wm-group/images/dd98a6c6-2434-43fb-b335-d3d390742ae4.jpg';
const DEFAULT_BALIA_IMG = 'https://res.cloudinary.com/dhyj13jgs/image/upload/w_800,q_auto,f_auto/v1775044621/wm-group/images/5ef641ca-d716-430b-b893-23e3a2b1413a.png';

// Below-fold sections: lazy loaded ONLY on scroll
const BelowFoldSections = lazy(() => import('../components/MainLandingBelowFold'));

/* Product card — NO framer-motion, plain CSS, stable layout with aspect-ratio */
const ProductCard = ({ img, imgPos, video, accentColor, icon: Icon, brand, title, desc, cta, onClick, testId, isLCP }) => {
  const videoRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  const playVideo = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const stopVideo = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, []);

  const isSauna = testId === 'card-sauny';
  const glowColor = isSauna ? 'rgba(198,168,124' : 'rgba(212,175,55';

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => { setHovered(true); playVideo(); }}
      onMouseLeave={() => { setHovered(false); stopVideo(); }}
      className="group relative overflow-hidden cursor-pointer flex flex-col justify-end"
      style={{ aspectRatio: '4/5' }}
      data-testid={testId}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 z-10 group-hover:to-black/80 transition-all duration-700" />

      {/* Hero image — explicit dimensions, fetchpriority, decoding */}
      <img
        src={img}
        alt={title}
        width={800}
        height={1000}
        fetchPriority={isLCP ? 'high' : 'auto'}
        loading={isLCP ? 'eager' : 'lazy'}
        decoding="async"
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${video ? (hovered ? 'opacity-0' : 'opacity-100') : 'group-hover:scale-105'}`}
        style={{ objectPosition: imgPos }}
      />

      {/* Video — only on desktop, preload="none" until hover */}
      {video && !isMobile && (
        <video
          ref={videoRef}
          src={video}
          muted
          loop
          playsInline
          preload="none"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${hovered ? 'opacity-100' : 'opacity-0'}`}
        />
      )}

      {/* Golden glow on hover */}
      <div
        className="absolute inset-0 z-[11] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ boxShadow: `inset 0 0 40px ${glowColor},0.15), inset 0 0 80px ${glowColor},0.05)` }}
      />

      {/* Content */}
      <div className="relative z-20 p-8 transition-transform duration-500 ease-out group-hover:-translate-y-2">
        <div className="flex items-center gap-2 mb-3">
          <Icon size={18} style={{ color: accentColor }} />
          <span style={{ color: accentColor }} className="text-xs font-semibold tracking-[0.2em] uppercase">{brand}</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{title}</h2>
        <p className="text-white/60 text-sm mb-6 max-w-sm group-hover:text-white/80 transition-opacity duration-500">{desc}</p>
        <div className="flex items-center gap-2 text-white font-medium" style={{ '--hover-color': accentColor }}>
          <span className="group-hover:text-[--hover-color] transition-colors duration-300">{cta}</span>
          <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-2" />
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] z-20 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" style={{ background: accentColor }} />
    </div>
  );
};

const MainLanding = () => {
  const navigate = useNavigate();
  const { tr } = useAutoTranslate();

  // Render cards IMMEDIATELY with defaults — update when API responds
  const [saunaImg, setSaunaImg] = useState(DEFAULT_SAUNA_IMG);
  const [baliaImg, setBaliaImg] = useState(DEFAULT_BALIA_IMG);
  const [saunaPos, setSaunaPos] = useState('center');
  const [baliaPos, setBaliaPos] = useState('center');
  const [saunaVideo, setSaunaVideo] = useState('');
  const [baliaVideo, setBaliaVideo] = useState('');

  // Below-fold: only load on scroll (prevents CLS in PageSpeed lab test)
  const [showBelowFold, setShowBelowFold] = useState(false);
  const sentinelRef = useRef(null);

  // Fetch settings in background — no blocking
  useEffect(() => {
    const imgW = isMobile ? 800 : 1200;
    fetch(`${API}/api/settings/main-landing`)
      .then(r => r.json())
      .then(d => {
        const si = optimizedImg(resolveMediaUrl(d.sauna_image), { w: imgW, q: 'auto' });
        const bi = optimizedImg(resolveMediaUrl(d.balia_image), { w: imgW, q: 'auto' });
        if (si) setSaunaImg(si);
        if (bi) setBaliaImg(bi);
        if (d.sauna_image_position) setSaunaPos(d.sauna_image_position);
        if (d.balia_image_position) setBaliaPos(d.balia_image_position);
        if (d.sauna_video) setSaunaVideo(resolveMediaUrl(d.sauna_video));
        if (d.balia_video) setBaliaVideo(resolveMediaUrl(d.balia_video));
      })
      .catch(() => {});
  }, []);

  // Load below-fold content on scroll (IntersectionObserver) or after 10s fallback
  useEffect(() => {
    const timer = setTimeout(() => setShowBelowFold(true), 10000);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShowBelowFold(true);
        observer.disconnect();
        clearTimeout(timer);
      }
    }, { rootMargin: '300px' });
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, []);

  return (
    <div className="min-h-screen bg-[#0C0C0C]" data-testid="main-landing">
      {/* Header — minimal, above fold */}
      <header className="py-8 px-6" data-testid="main-landing-header">
        <div className="flex items-center justify-between max-w-5xl mx-auto mb-4">
          <div />
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-[0.3em] text-white uppercase">WM Group</h1>
            <p className="text-white/30 text-xs tracking-widest mt-1">SAUNY &bull; BALIE &bull; SPA</p>
          </div>
          <LanguageSwitcher variant="dark" />
        </div>
        <nav className="flex justify-center gap-6">
          <button onClick={() => navigate('/sauny')} className="text-white/50 hover:text-[#C6A87C] text-sm transition-colors">{tr('Sauny')}</button>
          <button onClick={() => navigate('/balie')} className="text-white/50 hover:text-[#D4AF37] text-sm transition-colors">{tr('Balie')}</button>
          <button onClick={() => navigate('/blog')} className="text-white/50 hover:text-white text-sm transition-colors">Blog</button>
          <button onClick={() => navigate('/b2b')} className="text-[#34D399] hover:text-[#6EE7B7] text-sm font-semibold transition-colors" data-testid="nav-b2b">B2B</button>
        </nav>
      </header>

      {/* Product cards — RENDER IMMEDIATELY with default images, stable aspect-ratio */}
      <main>
        <section className="px-4 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <ProductCard
              img={saunaImg} imgPos={saunaPos}
              video={!isMobile ? (saunaVideo ? optimizedVideo(saunaVideo, { mobile: false }) : '') : ''}
              accentColor="#C6A87C"
              icon={Flame} brand="WM-Sauna" title={tr("Sauny ogrodowe")}
              desc={tr("Gotowe, zmontowane sauny beczki, kwadro i wiking. Skandynawskie drewno klasy A+. Dostawa w 5-10 dni.")}
              cta={tr("Zobacz sauny")} onClick={() => navigate('/sauny')}
              testId="card-sauny" isLCP={true}
            />
            <ProductCard
              img={baliaImg} imgPos={baliaPos}
              video={!isMobile ? (baliaVideo ? optimizedVideo(baliaVideo, { mobile: false }) : '') : ''}
              accentColor="#D4AF37"
              icon={Droplets} brand="WM-Balia" title={tr("Balie i jacuzzi")}
              desc={tr("Ręcznie robione drewniane balie, jacuzzi i akcesoria SPA. Naturalne drewno, najwyższa jakość.")}
              cta={tr("Zobacz balie")} onClick={() => navigate('/balie')}
              testId="card-balie"
            />
          </div>
        </section>

        {/* Scroll sentinel — triggers below-fold loading */}
        <div ref={sentinelRef} style={{ height: '1px' }} />

        {/* Below fold — loads on scroll or after 10s.
            Skeleton reserves ~1500px so footer inside BelowFold doesn't cause shift. */}
        {showBelowFold ? (
          <Suspense fallback={
            <div data-testid="below-fold-skeleton" style={{ minHeight: '1500px', background: '#0C0C0C' }}>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '60px 16px' }}>
                <div style={{ maxWidth: 640, margin: '0 auto' }}>
                  <div style={{ width: 200, height: 14, background: '#1a1a1a', borderRadius: 4, marginBottom: 12 }} />
                  <div style={{ width: '100%', height: 8, background: '#141414', borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ width: '80%', height: 8, background: '#141414', borderRadius: 4 }} />
                </div>
              </div>
            </div>
          }>
            <BelowFoldSections />
          </Suspense>
        ) : null}
      </main>
    </div>
  );
};

export default MainLanding;
