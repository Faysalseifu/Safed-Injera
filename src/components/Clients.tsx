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
    <section id="clients" className="section-container bg-cloud-white night-mode:bg-transparent transition-colors duration-300 relative overflow-hidden">
      {/* Pattern overlays - Using actual PNG images as overlays */}
      {/* Side accent patterns */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[450px] h-[450px] opacity-18 pointer-events-none pattern-clients-side-light night-mode:hidden" 
           style={{ 
             backgroundImage: 'url(/images 2/pattern white.png.png)', 
             backgroundRepeat: 'no-repeat', 
             backgroundSize: 'contain',
             transform: 'rotate(-90deg)',
             transformOrigin: 'center',
             mixBlendMode: 'multiply'
           }} />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[450px] h-[450px] opacity-18 pointer-events-none pattern-clients-side-dark hidden night-mode:block" 
           style={{ 
             backgroundImage: 'url(/images 2/pattern brown.png)', 
             backgroundRepeat: 'no-repeat', 
             backgroundSize: 'contain',
             transform: 'rotate(90deg)',
             transformOrigin: 'center',
             mixBlendMode: 'overlay'
           }} />
      
      {/* Repeated background */}
      <div className="absolute inset-0 opacity-12 pointer-events-none pattern-clients-bg-light night-mode:hidden" 
           style={{ 
             backgroundImage: 'url(/images 2/pattern white.png.png)', 
             backgroundRepeat: 'repeat', 
             backgroundSize: '280px',
             mixBlendMode: 'soft-light'
           }} />
      <div className="absolute inset-0 opacity-15 pointer-events-none pattern-clients-bg-dark hidden night-mode:block" 
           style={{ 
             backgroundImage: 'url(/images 2/pattern brown.png)', 
             backgroundRepeat: 'repeat', 
             backgroundSize: '280px',
             mixBlendMode: 'soft-light'
           }} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="text-center mb-12 relative z-10"
      >
        <h2 className="section-title">{t('clients.title')}</h2>
        <p className="section-subtitle">{t('clients.subtitle')}</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 relative z-10">
        {clientTypes.map((client, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className={`${client.color} rounded-2xl p-6 sm:p-8 text-cloud-white hover:shadow-[0_30px_80px_rgba(78,24,21,0.4)] transition-all duration-300 transform hover:-translate-y-2 group backdrop-blur-sm`}
            style={{ boxShadow: '0 20px 60px rgba(78, 24, 21, 0.2)' }}
          >
            <div className="text-5xl sm:text-6xl md:text-7xl mb-4 sm:mb-6 transform group-hover:scale-105 transition-transform duration-300">
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

