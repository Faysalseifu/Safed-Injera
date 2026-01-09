import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const Clients = () => {
  const { t } = useTranslation();

  const clientTypes = [
    {
      title: t('clients.hotels'),
      description: t('clients.hotelsDesc'),
      icon: '🏨',
      color: 'bg-ethiopian-earth',
    },
    {
      title: t('clients.supermarkets'),
      description: t('clients.supermarketsDesc'),
      icon: '🛒',
      color: 'bg-sefed-sand',
    },
    {
      title: t('clients.b2b'),
      description: t('clients.b2bDesc'),
      icon: '🤝',
      color: 'bg-ethiopian-earth',
    },
    {
      title: t('clients.international'),
      description: t('clients.internationalDesc'),
      icon: '🌍',
      color: 'bg-sefed-sand',
    },
  ];

  return (
    <section id="clients" className="section-container bg-cloud-white night-mode:bg-transparent transition-colors duration-800">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="section-title">{t('clients.title')}</h2>
        <p className="section-subtitle">{t('clients.subtitle')}</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
        {clientTypes.map((client, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`${client.color} rounded-2xl p-6 sm:p-8 text-cloud-white hover:shadow-[0_30px_80px_rgba(78,24,21,0.4)] transition-all duration-500 transform hover:-translate-y-3 group backdrop-blur-sm`}
            style={{ boxShadow: '0 20px 60px rgba(78, 24, 21, 0.2)' }}
          >
            <div className="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-6 transform group-hover:scale-110 transition-transform duration-300">
              {client.icon}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{client.title}</h3>
            <p className="text-cloud-white/90 leading-relaxed text-sm sm:text-base">
              {client.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Clients;

