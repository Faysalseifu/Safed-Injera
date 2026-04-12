import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import SplitHero from '../components/SplitHero';

const GalleryPage = () => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Using actual images from public/images
  const images = [
    { id: 1, src: '/images/sefed cover.jpg', alt: 'Safed Injera Cover' },
    { id: 2, src: '/images/sefed A3 promo.jpg', alt: 'Safed Injera Promo' },
    { id: 3, src: '/images/sefed graduation.jpg', alt: 'Safed Injera Graduation' },
    { id: 4, src: '/images/sefed restaurant.jpg', alt: 'Safed Injera Restaurant' },
    { id: 5, src: '/images/sefed service.jpg', alt: 'Safed Injera Service' },
    { id: 6, src: '/images/sefed cloth.jpg', alt: 'Safed Injera Cloth' },
    { id: 7, src: '/images/safed packaged.jpg', alt: 'Safed Injera Packaged' },
    { id: 8, src: '/images/safed in cup.jpg', alt: 'Safed Injera in Cup' },
    { id: 9, src: '/images/safed rollup.jpg', alt: 'Safed Injera Rollup' },
  ];

  const heroImages = [
    { src: '/images/sefed A3 promo.jpg', alt: 'Safed Injera promo' },
    { src: '/images/safed rollup.jpg', alt: 'Safed Injera rollup' },
    { src: '/images/safed in cup.jpg', alt: 'Safed Injera in cup' },
    { src: '/images/sefed cloth.jpg', alt: 'Safed Injera cloth' },
    { src: '/images/safed packaged.jpg', alt: 'Safed Injera packaged' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative gradient-hero pattern-overlay pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 overflow-hidden">
        {/* Pattern overlays - Using actual PNG images as overlays */}
        {/* Corner accent patterns */}
        <div className="absolute top-0 left-0 w-[400px] h-[400px] opacity-18 pointer-events-none pattern-gallery-corner-light dark:hidden" 
             style={{ 
               backgroundImage: 'url(/images 2/pattern white.png.png)', 
               backgroundRepeat: 'no-repeat', 
               backgroundSize: 'contain',
               mixBlendMode: 'multiply'
             }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] opacity-18 pointer-events-none pattern-gallery-corner-dark hidden dark:block" 
             style={{ 
               backgroundImage: 'url(/images 2/pattern brown.png)', 
               backgroundRepeat: 'no-repeat', 
               backgroundSize: 'contain',
               mixBlendMode: 'overlay'
             }} />
        
        {/* Repeated background */}
        <div className="absolute inset-0 opacity-12 pointer-events-none pattern-gallery-bg-light dark:hidden" 
             style={{ 
               backgroundImage: 'url(/images 2/pattern white.png.png)', 
               backgroundRepeat: 'repeat', 
               backgroundSize: '280px',
               mixBlendMode: 'soft-light'
             }} />
        <div className="absolute inset-0 opacity-15 pointer-events-none pattern-gallery-bg-dark hidden dark:block" 
             style={{ 
               backgroundImage: 'url(/images 2/pattern brown.png)', 
               backgroundRepeat: 'repeat', 
               backgroundSize: '280px',
               mixBlendMode: 'soft-light'
             }} />
        <div className="section-inner relative z-10">
          <SplitHero
            title={t('gallery.title')}
            subtitle={t('gallery.subtitle')}
            images={heroImages}
            initialIndex={2}
          />
        </div>

        {/* Hero to content transition */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-14 w-[120%] h-28 rounded-full bg-black/35 blur-3xl opacity-45 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none">
          <svg viewBox="0 0 1440 180" className="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0,96 C220,190 470,0 720,84 C980,174 1220,46 1440,112 L1440,180 L0,180 Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="section-container relative -mt-10 sm:-mt-12 z-20 bg-gradient-to-b from-[#fcf7f2] via-white to-white rounded-t-[2rem] shadow-[0_-22px_60px_rgba(35,18,14,0.14)]">
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/80 to-transparent pointer-events-none" />
        <div className="section-inner relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.03 }}
              className="relative aspect-[4/3] overflow-hidden rounded-2xl cursor-pointer group card-modern p-0"
              onClick={() => setSelectedImage(index)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-ethiopian-earth/0 group-hover:bg-ethiopian-earth/30 transition-colors duration-300 flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 text-cloud-white font-semibold transition-opacity text-sm sm:text-base">
                  {t('gallery.viewImage')}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ethiopian-earth/95 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-5xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images[selectedImage].src}
                alt={images[selectedImage].alt}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 text-cloud-white text-3xl sm:text-4xl font-bold hover:text-sefed-sand transition-colors bg-ethiopian-earth/50 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center"
                aria-label="Close"
              >
                ×
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryPage;

