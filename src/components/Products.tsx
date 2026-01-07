import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const Products = () => {
  const { t } = useTranslation();

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
    <section id="products" className="section-container bg-gradient-to-b from-cloud-white to-sefed-sand/10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="section-title">{t('products.title')}</h2>
        <p className="section-subtitle">{t('products.subtitle')}</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {products.map((product, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="card-modern group"
          >
            <div className="text-5xl sm:text-6xl mb-4 sm:mb-6 transform group-hover:scale-110 transition-transform duration-300">
              {product.icon}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-ethiopian-earth mb-3 sm:mb-4">
              {product.title}
            </h3>
            <p className="text-sefed-sand leading-relaxed text-sm sm:text-base mb-4">
              {product.description}
            </p>
            <button className="text-ethiopian-earth font-semibold text-sm hover:text-sefed-sand transition-colors">
              Learn more →
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Products;

