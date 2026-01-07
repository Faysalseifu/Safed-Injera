import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const About = () => {
  const { t } = useTranslation();

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
    <section id="about" className="section-container bg-cloud-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="section-title">{t('about.title')}</h2>
        <p className="section-subtitle">{t('about.subtitle')}</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-12">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="card-modern group"
          >
            <div className="text-5xl sm:text-6xl mb-4 sm:mb-6 transform group-hover:scale-110 transition-transform duration-300">
              {feature.icon}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-ethiopian-earth mb-3 sm:mb-4">
              {feature.title}
            </h3>
            <p className="text-sefed-sand leading-relaxed text-sm sm:text-base">{feature.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default About;

