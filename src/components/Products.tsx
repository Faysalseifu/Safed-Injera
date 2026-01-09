import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const Products = () => {
  const { t } = useTranslation();

  const products = [
    {
      title: t('products.pureTeff'),
      description: t('products.pureTeffDesc'),
      icon: '🌾',
      color: 'from-amber-400 to-orange-500',
    },
    {
      title: t('products.quality'),
      description: t('products.qualityDesc'),
      icon: '✅',
      color: 'from-green-400 to-emerald-600',
    },
    {
      title: t('products.packaging'),
      description: t('products.packagingDesc'),
      icon: '📦',
      color: 'from-blue-400 to-indigo-600',
    },
    {
      title: t('products.certifications'),
      description: t('products.certificationsDesc'),
      icon: '🏆',
      color: 'from-yellow-400 to-amber-600',
    },
  ];

  return (
    <section id="products" className="relative section-container py-20 overflow-hidden transition-colors duration-800">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-injera-white night-mode:bg-transparent pointer-events-none -z-20 transition-colors duration-800" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sefed-sand/5 night-mode:bg-amber-glow/10 rounded-full blur-3xl -z-10 transition-colors duration-800" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-injera-maroon/5 night-mode:bg-injera-maroon/15 rounded-full blur-3xl -z-10 transition-colors duration-800" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <span className="text-amber-glow font-bold tracking-widest text-sm uppercase mb-2 block">Our Promise</span>
        <h2 className="section-title text-5xl md:text-6xl text-injera-maroon drop-shadow-sm font-black mb-4">
          {t('products.title')}
        </h2>
        <p className="section-subtitle text-coffee-brown font-light text-xl max-w-2xl mx-auto">
          {t('products.subtitle')}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 px-4">
        {products.map((product, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -10 }}
            className="group relative bg-white night-mode:bg-white/10 night-mode:backdrop-blur-xl rounded-[2rem] p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-transparent night-mode:border-white/10 hover:border-amber-glow/20 overflow-hidden"
          >
            {/* Hover Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${product.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

            {/* Icon Circle */}
            <div className="relative w-20 h-20 mb-8 mx-auto md:mx-0">
              <div className={`absolute inset-0 bg-gradient-to-br ${product.color} opacity-10 rounded-2xl rotate-3 group-hover:rotate-12 transition-transform duration-500`} />
              <div className="absolute inset-0 bg-white rounded-2xl shadow-sm flex items-center justify-center text-4xl border border-gray-100 group-hover:scale-110 transition-transform duration-500">
                {product.icon}
              </div>
            </div>

            <h3 className="text-2xl font-bold text-ethiopian-earth mb-4 group-hover:text-injera-maroon transition-colors">
              {product.title}
            </h3>

            <p className="text-coffee-brown/80 leading-relaxed mb-8 font-light text-lg">
              {product.description}
            </p>

            <div className="flex items-center text-amber-glow font-semibold group-hover:gap-2 transition-all duration-300 cursor-pointer">
              <span>Learn more</span>
              <svg
                className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Products;

