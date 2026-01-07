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

      {/* Golden glow effect */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>

      <div className="section-container relative z-10 pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[80vh]">
          {/* Left Side - Cover Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="relative order-2 lg:order-1 flex items-center justify-center"
          >
            <div className="relative w-full max-w-lg">
              {/* White circular background glow */}
              <div className="absolute inset-0 bg-cloud-white rounded-full blur-3xl opacity-20 transform scale-125 -z-10"></div>
              
              {/* Image container with glow */}
              <div className="relative z-10">
                <img 
                  src="/images/sefed cover.jpg" 
                  alt="Safed Injera - Premium Quality Teff Injera"
                  className="w-full h-auto rounded-3xl shadow-2xl transform hover:scale-[1.02] transition-transform duration-500"
                  style={{ 
                    boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 80px rgba(255, 215, 0, 0.4), inset 0 0 40px rgba(255, 215, 0, 0.1)' 
                  }}
                />
                
                {/* Golden glow overlay */}
                <div 
                  className="absolute inset-0 rounded-3xl pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.25) 0%, transparent 70%)'
                  }}
                ></div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-cloud-white order-1 lg:order-2 space-y-6 sm:space-y-8"
          >
            {/* Logo/Brand Name */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <img 
                src="/images/logo 1.png" 
                alt="Safed Injera Logo"
                className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto mb-4 sm:mb-6"
              />
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
            >
              {t('hero.title')}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-xl sm:text-2xl md:text-3xl text-sefed-sand font-semibold"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              {t('hero.subtitle')}
            </motion.p>

            {/* Description */}
            <motion.p
              className="text-base sm:text-lg md:text-xl text-cloud-white/90 leading-relaxed font-light max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              {t('hero.description')}
            </motion.p>

            {/* Contact Information */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <button
                onClick={() => scrollToSection('contact')}
                className="btn-primary text-base sm:text-lg"
              >
                {t('hero.cta1')}
              </button>
              <button
                onClick={() => scrollToSection('products')}
                className="btn-outline text-base sm:text-lg"
              >
                {t('hero.cta2')}
              </button>
            </motion.div>

            {/* Phone Numbers */}
            <motion.div
              className="flex items-center gap-4 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <div className="w-12 h-12 rounded-full bg-cloud-white/20 backdrop-blur-sm flex items-center justify-center border border-cloud-white/30">
                <svg className="w-6 h-6 text-cloud-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="flex flex-col gap-1">
                <a href="tel:+251922212161" className="text-cloud-white hover:text-sefed-sand transition-colors text-sm sm:text-base font-medium">
                  +251 92 221 2161
                </a>
                <a href="tel:+251953866041" className="text-cloud-white hover:text-sefed-sand transition-colors text-sm sm:text-base font-medium">
                  +251 95 386 6041
                </a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Decorative gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-48 bg-gradient-to-t from-cloud-white via-cloud-white/80 to-transparent" />
    </section>
  );
};

export default Hero;

