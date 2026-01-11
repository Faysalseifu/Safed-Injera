import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import Team from '../components/Team';

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

  return (
    <div className="min-h-screen pt-20 overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none -z-50">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-injera-maroon/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Hero Section */}
      <section className="relative gradient-hero py-20 sm:py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 pattern-overlay opacity-20" />
        
        {/* Pattern overlays - Using actual PNG images as overlays */}
        {/* Large centered pattern */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-25 pointer-events-none pattern-aboutpage-center-light night-mode:hidden" 
             style={{ 
               backgroundImage: 'url(/images 2/pattern white.png.png)', 
               backgroundRepeat: 'no-repeat', 
               backgroundSize: 'contain',
               backgroundPosition: 'center',
               mixBlendMode: 'overlay'
             }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] opacity-30 pointer-events-none pattern-aboutpage-center-dark hidden night-mode:block" 
             style={{ 
               backgroundImage: 'url(/images 2/pattern brown.png)', 
               backgroundRepeat: 'no-repeat', 
               backgroundSize: 'contain',
               backgroundPosition: 'center',
               mixBlendMode: 'overlay'
             }} />
        
        {/* Repeated background */}
        <div className="absolute inset-0 opacity-15 pointer-events-none pattern-aboutpage-bg-light night-mode:hidden" 
             style={{ 
               backgroundImage: 'url(/images 2/pattern white.png.png)', 
               backgroundRepeat: 'repeat', 
               backgroundSize: '300px',
               mixBlendMode: 'soft-light'
             }} />
        <div className="absolute inset-0 opacity-18 pointer-events-none pattern-aboutpage-bg-dark hidden night-mode:block" 
             style={{ 
               backgroundImage: 'url(/images 2/pattern brown.png)', 
               backgroundRepeat: 'repeat', 
               backgroundSize: '300px',
               mixBlendMode: 'soft-light'
             }} />
        <div className="section-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center text-cloud-white relative z-10"
          >
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-block py-1 px-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sefed-sand text-sm font-medium tracking-widest uppercase mb-4"
            >
              Building the Future of Injera
            </motion.span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black mb-6 tracking-tight">
              {t('about.title')}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-sefed-sand/90 max-w-3xl mx-auto font-light leading-relaxed">
              {t('about.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-container -mt-16 relative z-20">
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
      </section>

      {/* Our Team Section */}
      <Team />
    </div>
  );
};

export default AboutPage;

