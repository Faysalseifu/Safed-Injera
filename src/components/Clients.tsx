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
    <section id="clients" className="section-container bg-cloud-white dark:bg-transparent transition-colors duration-300 relative overflow-hidden">
      {/* Pattern overlays - Using actual PNG images as overlays */}
      {/* Side accent patterns */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[450px] h-[450px] opacity-18 pointer-events-none pattern-clients-side-light dark:hidden" 
           style={{ 
             backgroundImage: 'url(/images 2/pattern white.png.png)', 
             backgroundRepeat: 'no-repeat', 
             backgroundSize: 'contain',
             transform: 'rotate(-90deg)',
             transformOrigin: 'center',
             mixBlendMode: 'multiply'
           }} />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[450px] h-[450px] opacity-18 pointer-events-none pattern-clients-side-dark hidden dark:block" 
           style={{ 
             backgroundImage: 'url(/images 2/pattern brown.png)', 
             backgroundRepeat: 'no-repeat', 
             backgroundSize: 'contain',
             transform: 'rotate(90deg)',
             transformOrigin: 'center',
             mixBlendMode: 'overlay'
           }} />
      
      {/* Repeated background */}
      <div className="absolute inset-0 opacity-12 pointer-events-none pattern-clients-bg-light dark:hidden" 
           style={{ 
             backgroundImage: 'url(/images 2/pattern white.png.png)', 
             backgroundRepeat: 'repeat', 
             backgroundSize: '280px',
             mixBlendMode: 'soft-light'
           }} />
      <div className="absolute inset-0 opacity-15 pointer-events-none pattern-clients-bg-dark hidden dark:block" 
           style={{ 
             backgroundImage: 'url(/images 2/pattern brown.png)', 
             backgroundRepeat: 'repeat', 
             backgroundSize: '280px',
             mixBlendMode: 'soft-light'
           }} />
      <div className="section-inner relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="text-center mb-12 relative z-10"
      >
        <h2 className="section-title dark:text-injera-white">{t('clients.title')}</h2>
        <p className="section-subtitle text-coffee-brown/80 dark:text-injera-white/80">{t('clients.subtitle')}</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 relative z-10">
        {clientTypes.map((client, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="group relative rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-xl p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-amber-glow dark:bg-white/10 dark:border-white/10"
          >
            {/* Accent bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-ethiopian-earth via-amber-glow to-injera-maroon opacity-70" />

            <div className="flex items-start gap-5">
              <div
                className={`shrink-0 w-14 h-14 rounded-2xl ${client.color} flex items-center justify-center text-3xl shadow-inner ${
                  client.color === 'bg-sefed-sand' ? 'text-ethiopian-earth' : 'text-cloud-white'
                }`}
              >
                {client.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-extrabold text-ethiopian-earth dark:text-injera-white mb-2">
                  {client.title}
                </h3>
                <p className="text-coffee-brown/80 dark:text-injera-white/80 leading-relaxed text-sm sm:text-base">
                  {client.description}
                </p>
              </div>
            </div>

            {/* Ambient hover glow */}
            <div className="absolute -inset-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-sefed-sand/20 via-amber-glow/10 to-injera-maroon/10 blur-3xl" />
            </div>
          </motion.div>
        ))}
      </div>
      </div>
    </section>
  );
};

export default Clients;

