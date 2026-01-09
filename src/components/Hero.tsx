import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const Hero = () => {
  const { t } = useTranslation();

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

      {/* Golden glow fx - Enhanced */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[100px] pointer-events-none"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", delay: 1 }}
        className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-red-900/20 rounded-full blur-[120px] pointer-events-none"
      />

      <div className="section-container relative z-10 pt-20 sm:pt-24 pb-12 sm:pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[calc(100vh-100px)]">
          {/* Left Side - Cover Image */}
          <motion.div
            initial={{ opacity: 0, x: -100, rotate: -5 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ type: "spring", stiffness: 50, damping: 20, duration: 1.2 }}
            className="relative order-2 lg:order-1 flex items-center justify-center perspective-1000"
          >
            <div className="relative w-full max-w-lg group">
              {/* White circular background glow */}
              <div className="absolute inset-0 bg-white/5 rounded-full blur-3xl transform scale-125 -z-10 group-hover:bg-white/10 transition-colors duration-700"></div>

              {/* Image container with glow */}
              <motion.div
                className="relative z-10 transform-style-3d"
                whileHover={{ scale: 1.05, rotateY: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <img
                  src="/images/sefed cover.jpg"
                  alt="Safed Injera - Premium Quality Teff Injera"
                  className="w-full h-auto rounded-[2rem] shadow-2xl"
                  style={{
                    boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 80px rgba(255, 215, 0, 0.2), inset 0 0 40px rgba(255, 215, 0, 0.1)'
                  }}
                />

                {/* Golden glow overlay */}
                <div
                  className="absolute inset-0 rounded-[2rem] pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.1) 0%, transparent 70%)'
                  }}
                ></div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Side - Text Content */}
          <div className="text-cloud-white order-1 lg:order-2 space-y-8 flex flex-col justify-center">

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            >
              <h1
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight mb-2"
                style={{ textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}
              >
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-sefed-sand to-white bg-300% animate-gradient">
                  {t('hero.title')}
                </span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              className="text-2xl sm:text-3xl md:text-4xl text-amber-500/90 font-bold"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
            >
              {t('hero.subtitle')}
            </motion.p>

            {/* Description */}
            <motion.p
              className="text-lg sm:text-xl text-gray-300 leading-relaxed font-light max-w-xl backdrop-blur-sm p-4 rounded-xl bg-black/10 border-l-4 border-amber-600"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              {t('hero.description')}
            </motion.p>

            {/* Contact Information */}
            <motion.div
              className="flex flex-col sm:flex-row gap-5 pt-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
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
              transition={{ delay: 1.1, duration: 0.8 }}
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

