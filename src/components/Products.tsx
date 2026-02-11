import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const Products = () => {
  const { t } = useTranslation();

  // Restore emojis for icons
  const products = [
    {
      title: t('products.pureTeff'),
      description: t('products.pureTeffDesc'),
      icon: '🌾',
    },
    {
      title: t('products.quality'),
      description: t('products.qualityDesc'),
      icon: '✅',
    },
    {
      title: t('products.packaging'),
      description: t('products.packagingDesc'),
      icon: '📦',
    },
    {
      title: t('products.certifications'),
      description: t('products.certificationsDesc'),
      icon: '🏆',
    },
  ];

  return (
    <section id="products" className="section-container bg-injera-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="section-title text-injera-maroon drop-shadow-lg font-extrabold">{t('products.title')}</h2>
        <p className="section-subtitle text-coffee-brown font-medium">{t('products.subtitle')}</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {products.map((product, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="card-modern group bg-injera-white border border-accent-gray rounded-2xl shadow-lg p-6 hover:scale-105 hover:shadow-amber-glow transition-all duration-300"
          >
            <div className="text-5xl sm:text-6xl mb-4 sm:mb-6 transform group-hover:scale-110 transition-transform duration-300">
              {product.icon}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-injera-maroon mb-3 sm:mb-4 drop-shadow">
              {product.title}
            </h3>
            <p className="text-coffee-brown leading-relaxed text-sm sm:text-base mb-4">
              {product.description}
            </p>
            <button className="text-injera-maroon font-semibold text-sm hover:text-amber-glow transition-colors">
              Learn more
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Products;

