import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const Distribution = () => {
  const { t } = useTranslation();

  const services = [
    {
      title: t('distribution.massProduction'),
      description: t('distribution.massProductionDesc'),
      icon: '🏭',
    },
    {
      title: t('distribution.delivery'),
      description: t('distribution.deliveryDesc'),
      icon: '🚛',
    },
    {
      title: t('distribution.packaging'),
      description: t('distribution.packagingDesc'),
      icon: '📋',
    },
    {
      title: t('distribution.scalability'),
      description: t('distribution.scalabilityDesc'),
      icon: '📈',
    },
  ];

  return (
    <section id="distribution" className="section-container bg-gradient-to-b from-sefed-sand/10 to-cloud-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="section-title">{t('distribution.title')}</h2>
        <p className="section-subtitle">{t('distribution.subtitle')}</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-12">
        {services.map((service, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            className="card-modern border-l-4 border-ethiopian-earth group"
          >
            <div className="flex items-start gap-4 sm:gap-6">
              <div className="text-5xl sm:text-6xl flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300">
                {service.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-ethiopian-earth mb-3 sm:mb-4">
                  {service.title}
                </h3>
                <p className="text-sefed-sand leading-relaxed text-sm sm:text-base">
                  {service.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Distribution;

