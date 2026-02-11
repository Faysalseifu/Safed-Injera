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
    <section id="about" className="section-container bg-injera-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="section-title text-injera-maroon drop-shadow-lg font-extrabold">{t('about.title')}</h2>
        <p className="section-subtitle text-coffee-brown font-medium">{t('about.subtitle')}</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-12">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="card-modern group bg-injera-white border border-accent-gray rounded-2xl shadow-lg p-6 hover:scale-105 hover:shadow-amber-glow transition-all duration-300"
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

