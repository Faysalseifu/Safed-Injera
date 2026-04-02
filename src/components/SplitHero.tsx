import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type HeroImage = {
  src: string;
  alt: string;
};

interface SplitHeroProps {
  eyebrow?: string;
  title: string;
  subtitle: string;
  images: HeroImage[];
  initialIndex?: number;
}

const SplitHero = ({
  eyebrow,
  title,
  subtitle,
  images,
  initialIndex = 0,
}: SplitHeroProps) => {
  const safeInitial = images.length ? initialIndex % images.length : 0;
  const [activeIndex, setActiveIndex] = useState(safeInitial);

  useEffect(() => {
    if (!images.length) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [images.length]);

  return (
    <div className="grid md:grid-cols-2 gap-10 lg:gap-14 items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-cloud-white"
      >
        {eyebrow ? (
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sefed-sand text-xs sm:text-sm font-medium tracking-widest uppercase mb-4"
          >
            {eyebrow}
          </motion.span>
        ) : null}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight">
          {title}
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl text-sefed-sand/90 max-w-xl font-light leading-relaxed">
          {subtitle}
        </p>
      </motion.div>

      <div className="relative">
        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/20 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
          <AnimatePresence mode="wait">
            {images.length ? (
              <motion.img
                key={images[activeIndex].src}
                src={images[activeIndex].src}
                alt={images[activeIndex].alt}
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.5 }}
              />
            ) : null}
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-tr from-ethiopian-earth/40 via-transparent to-amber-glow/25" />
        </div>

        {images.length > 1 ? (
          <div className="mt-4 flex items-center gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 w-2.5 rounded-full transition-all ${
                  index === activeIndex
                    ? 'bg-amber-glow scale-110'
                    : 'bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Show hero image ${index + 1}`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SplitHero;
