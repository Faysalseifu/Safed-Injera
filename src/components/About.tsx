import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const About = () => {
  const { t } = useTranslation();

  // Restore emojis for icons
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
    <section id="about" className="section-container bg-injera-white night-mode:bg-transparent transition-colors duration-300 relative overflow-hidden">
      {/* Pattern overlays - Using actual PNG images as overlays */}
      {/* Large decorative pattern */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] opacity-20 pointer-events-none pattern-about-decor-light night-mode:hidden" 
           style={{ 
             backgroundImage: 'url(/images 2/pattern white.png.png)', 
             backgroundRepeat: 'no-repeat', 
             backgroundSize: 'contain',
             backgroundPosition: 'top right',
             mixBlendMode: 'multiply'
           }} />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] opacity-25 pointer-events-none pattern-about-decor-dark hidden night-mode:block" 
           style={{ 
             backgroundImage: 'url(/images 2/pattern brown.png)', 
             backgroundRepeat: 'no-repeat', 
             backgroundSize: 'contain',
             backgroundPosition: 'top right',
             mixBlendMode: 'overlay'
           }} />
      
      {/* Repeated background pattern */}
      <div className="absolute inset-0 opacity-15 pointer-events-none pattern-about-bg-light night-mode:hidden" 
           style={{ 
             backgroundImage: 'url(/images 2/pattern white.png.png)', 
             backgroundRepeat: 'repeat', 
             backgroundSize: '300px',
             mixBlendMode: 'soft-light'
           }} />
      <div className="absolute inset-0 opacity-18 pointer-events-none pattern-about-bg-dark hidden night-mode:block" 
           style={{ 
             backgroundImage: 'url(/images 2/pattern brown.png)', 
             backgroundRepeat: 'repeat', 
             backgroundSize: '300px',
             mixBlendMode: 'soft-light'
           }} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="text-center mb-12 relative z-10"
      >
        <h2 className="section-title text-injera-maroon drop-shadow-lg font-extrabold">{t('about.title')}</h2>
        <p className="section-subtitle text-coffee-brown font-medium">{t('about.subtitle')}</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-12 relative z-10">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="card-modern group bg-injera-white border border-accent-gray rounded-2xl shadow-lg p-6 hover:scale-[1.02] hover:shadow-amber-glow transition-all duration-300"
          >
            <div className="text-5xl sm:text-6xl mb-4 sm:mb-6 transform group-hover:scale-110 transition-transform duration-300">
              {feature.icon}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-injera-maroon mb-3 sm:mb-4 drop-shadow">
              {feature.title}
            </h3>
            <p className="text-coffee-brown leading-relaxed text-sm sm:text-base">{feature.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default About;

