import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const HERO_SLIDE_INTERVAL_MS = 5000;

const HERO_SLIDES = [
  { src: `/images/${encodeURIComponent('hero-chef 1.png')}`, altKey: 'slide1' as const },
  { src: `/images/${encodeURIComponent('hero-chef 2.png')}`, altKey: 'slide2' as const },
  { src: `/images/${encodeURIComponent('hero-chef 3.png')}`, altKey: 'slide3' as const },
];

const Hero = () => {
  const { t } = useTranslation();
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSlideIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, HERO_SLIDE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #3A120F 0%, #4E1815 50%, #3A120F 100%)' }}>
      {/* Textured background pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(168, 150, 136, 0.1) 10px, rgba(168, 150, 136, 0.1) 20px),
            radial-gradient(circle at 20% 50%, rgba(168, 150, 136, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(168, 150, 136, 0.1) 0%, transparent 50%)
          `
        }}
      />

      {/* Golden glow fx - Optimized with CSS */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[80px] pointer-events-none opacity-60 hero-glow-1" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-red-900/20 rounded-full blur-[100px] pointer-events-none opacity-50 hero-glow-2" />
      
      {/* Pattern overlays - Using actual PNG images as overlays */}
      {/* Large centered pattern - Hero style */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-30 pointer-events-none pattern-hero-center-light dark:hidden" 
           style={{ 
             backgroundImage: 'url(/images 2/pattern white.png.png)', 
             backgroundRepeat: 'no-repeat', 
             backgroundSize: 'contain',
             backgroundPosition: 'center',
             mixBlendMode: 'overlay'
           }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-35 pointer-events-none pattern-hero-center-dark hidden dark:block" 
           style={{ 
             backgroundImage: 'url(/images 2/pattern brown.png)', 
             backgroundRepeat: 'no-repeat', 
             backgroundSize: 'contain',
             backgroundPosition: 'center',
             mixBlendMode: 'overlay'
           }} />
      
      {/* Repeated pattern overlay - Full background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none pattern-hero-repeat-light dark:hidden" 
           style={{ 
             backgroundImage: 'url(/images 2/pattern white.png.png)', 
             backgroundRepeat: 'repeat', 
             backgroundSize: '400px',
             mixBlendMode: 'soft-light'
           }} />
      <div className="absolute inset-0 opacity-25 pointer-events-none pattern-hero-repeat-dark hidden dark:block" 
           style={{ 
             backgroundImage: 'url(/images 2/pattern brown.png)', 
             backgroundRepeat: 'repeat', 
             backgroundSize: '400px',
             mixBlendMode: 'soft-light'
           }} />
      
      {/* Corner accent patterns */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] opacity-15 pointer-events-none pattern-hero-corner-light dark:hidden" 
           style={{ 
             backgroundImage: 'url(/images 2/pattern white.png.png)', 
             backgroundRepeat: 'no-repeat', 
             backgroundSize: 'contain',
             transform: 'rotate(-45deg)',
             transformOrigin: 'top left',
             mixBlendMode: 'multiply'
           }} />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] opacity-15 pointer-events-none pattern-hero-corner-dark hidden dark:block" 
           style={{ 
             backgroundImage: 'url(/images 2/pattern brown.png)', 
             backgroundRepeat: 'no-repeat', 
             backgroundSize: 'contain',
             transform: 'rotate(45deg)',
             transformOrigin: 'bottom right',
             mixBlendMode: 'overlay'
           }} />

      <div className="section-inner relative z-10 pt-20 sm:pt-24 pb-12 sm:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: 'easeOut' }}
          className="max-w-4xl mx-auto text-center mb-8 sm:mb-10"
        >
          <h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight"
            style={{ textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}
          >
            <span className="block text-white">
              {t('hero.title')}
            </span>
          </h1>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[calc(100vh-180px)]">
          {/* Left Side - Brand Showcase */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="relative order-2 lg:order-1 flex items-center justify-center"
          >
            <div className="relative w-full max-w-lg group">
              {/* Outer ambient glow */}
              <div className="absolute -inset-6 bg-amber-500/15 rounded-[3rem] blur-3xl -z-10 animate-pulse" style={{ animationDuration: '3s' }} />

              {/* Main glass card */}
              <motion.div
                className="relative z-10 rounded-[2rem] overflow-hidden"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,190,30,0.06) 50%, rgba(100,20,10,0.10) 100%)',
                  border: '1px solid rgba(255,200,80,0.25)',
                  boxShadow: '0 30px 80px rgba(0,0,0,0.55), 0 0 60px rgba(255,180,20,0.18), inset 0 1px 0 rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(24px)',
                }}
              >
                {/* Inner gradient gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-red-900/20 pointer-events-none" />

                {/* Scanning / shimmer line */}
                <div
                  className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2rem]"
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent"
                    style={{ animation: 'shimmerLine 3s ease-in-out infinite' }}
                  />
                </div>

                <div className="relative z-10 w-full min-h-[320px] sm:min-h-[400px]">
                  <div className="relative aspect-[4/5] sm:aspect-auto sm:min-h-[400px] w-full">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.img
                        key={HERO_SLIDES[slideIndex].src}
                        src={HERO_SLIDES[slideIndex].src}
                        alt={t(`hero.${HERO_SLIDES[slideIndex].altKey}`)}
                        className="absolute inset-0 w-full h-full object-cover object-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: 'easeInOut' }}
                        draggable={false}
                      />
                    </AnimatePresence>
                  </div>
                  <div
                    className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20 pointer-events-none"
                    aria-hidden
                  >
                    {HERO_SLIDES.map((_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i === slideIndex ? 'w-6 bg-amber-400/90' : 'w-1.5 bg-white/35'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Corner glow accents */}
                <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
                <div className="absolute bottom-4 left-4 w-20 h-20 rounded-full bg-red-800/15 blur-2xl pointer-events-none" />
              </motion.div>
            </div>
          </motion.div>

          {/* Right Side - Text Content */}
          <div className="text-cloud-white order-1 lg:order-2 space-y-8 flex flex-col justify-center">
            {/* Subtitle */}
            <motion.p
              className="text-2xl sm:text-3xl md:text-4xl text-amber-500/90 font-bold"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
            >
              {t('hero.subtitle')}
            </motion.p>

            {/* Description */}
            <motion.p
              className="text-lg sm:text-xl text-gray-300 leading-relaxed font-light max-w-xl backdrop-blur-sm p-4 rounded-xl bg-black/10 border-l-4 border-amber-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
            >
              {t('hero.description')}
            </motion.p>

            {/* Contact Information */}
            <motion.div
              className="flex flex-col sm:flex-row gap-5 pt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
            >
              <button
                onClick={() => scrollToSection('contact')}
                className="btn-primary text-lg px-8 py-4 bg-gradient-to-r from-amber-600 to-red-800 hover:from-amber-500 hover:to-red-700 shadow-lg shadow-amber-900/40 border-none ring-2 ring-white/10"
              >
                {t('hero.cta1')}
              </button>
              <button
                onClick={() => scrollToSection('products')}
                className="btn-outline text-lg px-8 py-4 backdrop-blur-md bg-white/5 hover:bg-white/10 hover:border-amber-500 hover:text-amber-500"
              >
                {t('hero.cta2')}
              </button>
            </motion.div>

            {/* Phone Numbers - Enhanced */}
            <motion.div
              className="flex items-center gap-5 pt-8 border-t border-white/10 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.5 }}
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner group cursor-pointer hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-400 uppercase tracking-widest">Order Now</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a href="tel:+251922212161" className="text-white hover:text-amber-400 transition-colors text-lg font-mono tracking-wide">
                    +251 92 221 2161
                  </a>
                  <span className="hidden sm:inline text-white/20">|</span>
                  <a href="tel:+251953866041" className="text-white hover:text-amber-400 transition-colors text-lg font-mono tracking-wide">
                    +251 95 386 6041
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Decorative gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent pointer-events-none" />
    </section>
  );
};

export default Hero;

