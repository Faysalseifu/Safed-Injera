import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const Distribution = () => {
  const { t } = useTranslation();

  const services = [
    {
      title: t('distribution.massProduction'),
      description: t('distribution.massProductionDesc'),
      icon: '🏭',
      color: "from-gray-700 to-gray-900"
    },
    {
      title: t('distribution.delivery'),
      description: t('distribution.deliveryDesc'),
      icon: '🚛',
      color: "from-blue-600 to-blue-800"
    },
    {
      title: t('distribution.packaging'),
      description: t('distribution.packagingDesc'),
      icon: '📋',
      color: "from-amber-600 to-orange-700"
    },
    {
      title: t('distribution.scalability'),
      description: t('distribution.scalabilityDesc'),
      icon: '📈',
      color: "from-green-600 to-emerald-800"
    },
  ];

  return (
    <section id="distribution" className="section-container relative py-24 overflow-hidden bg-ethiopian-earth/5 night-mode:bg-transparent transition-colors duration-300">
      {/* World Map Background Simulation */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg')] bg-center bg-no-repeat bg-cover -z-10 mix-blend-multiply" />
      
      {/* Pattern overlays - Using actual PNG images as overlays */}
      {/* Corner patterns */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] opacity-18 pointer-events-none pattern-distribution-corner-light night-mode:hidden -z-5" 
           style={{ 
             backgroundImage: 'url(/images 2/pattern white.png.png)', 
             backgroundRepeat: 'no-repeat', 
             backgroundSize: 'contain',
             transform: 'rotate(-30deg)',
             transformOrigin: 'top left',
             mixBlendMode: 'multiply'
           }} />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] opacity-18 pointer-events-none pattern-distribution-corner-dark hidden night-mode:block -z-5" 
           style={{ 
             backgroundImage: 'url(/images 2/pattern brown.png)', 
             backgroundRepeat: 'no-repeat', 
             backgroundSize: 'contain',
             transform: 'rotate(30deg)',
             transformOrigin: 'bottom right',
             mixBlendMode: 'overlay'
           }} />
      
      {/* Repeated background */}
      <div className="absolute inset-0 opacity-12 pointer-events-none pattern-distribution-bg-light night-mode:hidden -z-5" 
           style={{ 
             backgroundImage: 'url(/images 2/pattern white.png.png)', 
             backgroundRepeat: 'repeat', 
             backgroundSize: '350px',
             mixBlendMode: 'soft-light'
           }} />
      <div className="absolute inset-0 opacity-15 pointer-events-none pattern-distribution-bg-dark hidden night-mode:block -z-5" 
           style={{ 
             backgroundImage: 'url(/images 2/pattern brown.png)', 
             backgroundRepeat: 'repeat', 
             backgroundSize: '350px',
             mixBlendMode: 'soft-light'
           }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="text-center mb-16 relative z-10"
      >
        <span className="text-amber-glow font-bold tracking-widest text-sm uppercase mb-2 block">Global Reach</span>
        <h2 className="section-title text-4xl md:text-5xl font-black text-ethiopian-earth mb-4">{t('distribution.title')}</h2>
        <p className="text-lg text-coffee-brown/80 max-w-2xl mx-auto font-light">{t('distribution.subtitle')}</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-6 md:gap-8 lg:gap-12 px-4 relative z-10">
        {services.map((service, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            whileHover={{ y: -5 }}
            className="group relative bg-white night-mode:bg-white/10 night-mode:backdrop-blur-xl rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden night-mode:border night-mode:border-white/10"
          >
            {/* Top Border Gradient */}
            <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${service.color}`} />

            <div className="flex items-start gap-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                {service.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-ethiopian-earth mb-3 group-hover:text-amber-glow transition-colors">
                  {service.title}
                </h3>
                <p className="text-coffee-brown/80 leading-relaxed font-light">
                  {service.description}
                </p>
              </div>
            </div>

            {/* Hover Background Effect */}
            <div className={`absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 rounded-full blur-xl transform translate-x-1/2 translate-y-1/2 transition-opacity duration-300`} />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Distribution;

