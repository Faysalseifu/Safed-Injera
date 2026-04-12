import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import Team from '../components/Team';
import SplitHero from '../components/SplitHero';

const AboutPage = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      title: t('about.mission'),
      text: t('about.missionText'),
      icon: '🎯',
    },
    {
      title: t('about.quality'),
      text: t('about.qualityText'),
      icon: '⭐',
    },
    {
      title: t('about.heritage'),
      text: t('about.heritageText'),
      icon: '🏛️',
    },
  ];

  const heroImages = [
    { src: '/images/safed in cup.jpg', alt: 'Safed Injera in cup' },
    { src: '/images/safed packaged.jpg', alt: 'Safed Injera packaged' },
    { src: '/images/sefed A3 promo.jpg', alt: 'Safed Injera promo' },
    { src: '/images/sefed cloth.jpg', alt: 'Safed Injera cloth' },
    { src: '/images/safed rollup.jpg', alt: 'Safed Injera rollup' },
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none -z-50">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-injera-maroon/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Hero Section */}
      <section className="relative gradient-hero pt-24 sm:pt-28 md:pt-32 pb-20 sm:pb-24 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 pattern-overlay opacity-20" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[720px] rounded-full bg-gradient-to-b from-amber-300/20 via-transparent to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 right-0 w-[420px] h-[420px] rounded-full bg-injera-maroon/30 blur-[120px] pointer-events-none" />
        
        {/* Pattern overlays - Using actual PNG images as overlays */}
        {/* Large centered pattern */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-25 pointer-events-none pattern-aboutpage-center-light dark:hidden" 
             style={{ 
               backgroundImage: 'url(/images 2/pattern white.png.png)', 
               backgroundRepeat: 'no-repeat', 
               backgroundSize: 'contain',
               backgroundPosition: 'center',
               mixBlendMode: 'overlay'
             }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-30 pointer-events-none pattern-aboutpage-center-dark hidden dark:block" 
             style={{ 
               backgroundImage: 'url(/images 2/pattern brown.png)', 
               backgroundRepeat: 'no-repeat', 
               backgroundSize: 'contain',
               backgroundPosition: 'center',
               mixBlendMode: 'overlay'
             }} />
        
        {/* Repeated background */}
        <div className="absolute inset-0 opacity-15 pointer-events-none pattern-aboutpage-bg-light dark:hidden" 
             style={{ 
               backgroundImage: 'url(/images 2/pattern white.png.png)', 
               backgroundRepeat: 'repeat', 
               backgroundSize: '300px',
               mixBlendMode: 'soft-light'
             }} />
        <div className="absolute inset-0 opacity-18 pointer-events-none pattern-aboutpage-bg-dark hidden dark:block" 
             style={{ 
               backgroundImage: 'url(/images 2/pattern brown.png)', 
               backgroundRepeat: 'repeat', 
               backgroundSize: '300px',
               mixBlendMode: 'soft-light'
             }} />
        <div className="section-inner relative z-10">
          <SplitHero
            eyebrow="Building the Future of Injera"
            title={t('about.title')}
            subtitle={t('about.subtitle')}
            images={heroImages}
            initialIndex={0}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 grid lg:grid-cols-[1.4fr_1fr] gap-4 sm:gap-6"
          >
            <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-5 sm:p-7 text-cloud-white shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
              <p className="text-sm uppercase tracking-[0.2em] text-sefed-sand/90 mb-3">
                Why Safed Injera
              </p>
              <p className="text-base sm:text-lg text-cloud-white/90 leading-relaxed">
                We started with one simple promise: bring authentic, nutritious injera to every table without compromising tradition.
                From hand-selected teff flour to carefully controlled fermentation, every batch is crafted for flavor, consistency, and pride.
              </p>
            </div>

            <div className="rounded-2xl bg-ethiopian-earth/35 backdrop-blur-md border border-white/15 p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
              <p className="text-sm uppercase tracking-[0.2em] text-amber-200 mb-4">
                What Defines Us
              </p>
              <div className="flex flex-wrap gap-2.5">
                <span className="px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-sm text-cloud-white">100% Teff Focus</span>
                <span className="px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-sm text-cloud-white">Modern Quality Controls</span>
                <span className="px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-sm text-cloud-white">Rooted in Ethiopian Heritage</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Hero to content transition */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-14 w-[120%] h-28 rounded-full bg-black/35 blur-3xl opacity-45 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none">
          <svg viewBox="0 0 1440 180" className="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0,96 C220,190 470,0 720,84 C980,174 1220,46 1440,112 L1440,180 L0,180 Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-container -mt-10 sm:-mt-12 relative z-20 bg-gradient-to-b from-[#fcf7f2] via-white to-white rounded-t-[2rem] shadow-[0_-22px_60px_rgba(35,18,14,0.14)]">
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/80 to-transparent pointer-events-none" />
        <div className="section-inner">
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="card-modern bg-white/80 backdrop-blur-xl border-white/40"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-ethiopian-earth/5 to-injera-maroon/10 flex items-center justify-center text-4xl mb-6 shadow-sm border border-white">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-ethiopian-earth mb-4">
                {feature.title}
              </h3>
              <p className="text-coffee-brown/80 leading-relaxed font-light">{feature.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Commitment Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-20 sm:mt-24 md:mt-32 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-ethiopian-earth to-injera-maroon transform -skew-y-2 rounded-3xl -z-10 shadow-2xl skew-origin-left opacity-90" />
          <div className="card-glass text-center p-12 md:p-16 border-none bg-white/10 text-white backdrop-blur-md rounded-2xl">
            <h2 className="text-3xl sm:text-4xl font-black mb-8">
              Our Commitment
            </h2>
            <p className="text-xl sm:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed font-light">
              "At Safed Injera, we are committed to producing the highest quality injera
              using only pure teff flour. Our traditional methods combined with modern
              quality control ensure that every piece meets our exacting standards."
            </p>
            <div className="mt-8">
              <span className="font-signature text-3xl text-amber-glow">- The Safed Team</span>
            </div>
          </div>
        </motion.div>
        </div>
      </section>

      {/* Our Team Section */}
      <Team />
    </div>
  );
};

export default AboutPage;

