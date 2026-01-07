import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

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
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative gradient-hero pattern-overlay py-16 sm:py-20 md:py-24">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-cloud-white"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6">
              {t('about.title')}
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-sefed-sand max-w-3xl mx-auto">
              {t('about.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-container">
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="card-modern"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl sm:text-2xl font-bold text-ethiopian-earth mb-4">
                {feature.title}
              </h3>
              <p className="text-sefed-sand leading-relaxed">{feature.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Additional Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 sm:mt-16 md:mt-20"
        >
          <div className="card-glass text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-ethiopian-earth mb-6">
              Our Commitment
            </h2>
            <p className="text-lg text-sefed-sand max-w-4xl mx-auto leading-relaxed">
              At Safed Injera, we are committed to producing the highest quality injera 
              using only pure teff flour. Our traditional methods combined with modern 
              quality control ensure that every piece meets our exacting standards. 
              We take pride in preserving Ethiopian culinary heritage while serving 
              businesses across Ethiopia and the world.
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default AboutPage;

