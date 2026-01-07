import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const Gallery = () => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

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
  ];

  return (
    <section id="gallery" className="section-container bg-gradient-to-b from-cloud-white to-sefed-sand/10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="section-title">{t('gallery.title')}</h2>
        <p className="section-subtitle">{t('gallery.subtitle')}</p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {images.map((image, index) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="relative aspect-square overflow-hidden rounded-xl cursor-pointer group card-glass p-0"
            onClick={() => setSelectedImage(index)}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
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

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ethiopian-earth/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-5xl max-h-full"
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
    </section>
  );
};

export default Gallery;

