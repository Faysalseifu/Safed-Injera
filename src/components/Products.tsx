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
    <section
      id="products"
      className="section-container relative overflow-hidden bg-injera-white dark:bg-transparent transition-colors duration-300"
    >
      {/* Background ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-cloud-white via-injera-white to-sefed-sand/10 dark:from-transparent dark:via-transparent dark:to-transparent pointer-events-none -z-10 transition-colors duration-300" />

      {/* Pattern overlays */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none dark:hidden"
        style={{
          backgroundImage: 'url(/images 2/pattern white.png.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '280px',
          mixBlendMode: 'soft-light',
        }}
      />
      <div
        className="absolute inset-0 opacity-12 pointer-events-none hidden dark:block"
        style={{
          backgroundImage: 'url(/images 2/pattern brown.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '280px',
          mixBlendMode: 'soft-light',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mb-14 flex flex-col items-center text-center"
      >
        <div className="relative inline-flex items-center justify-center mb-4">
          <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-2xl opacity-70" />
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl border border-amber-400/40 bg-white/10 dark:bg-white/5 backdrop-blur-xl shadow-[0_0_40px_rgba(245,158,11,0.5)]">
            <span className="text-3xl">🍽️</span>
          </div>
        </div>
        <h2 className="section-title text-injera-maroon dark:text-injera-white drop-shadow-[0_0_30px_rgba(0,0,0,0.4)] font-extrabold text-3xl sm:text-4xl md:text-5xl">
          {t('products.title')}
        </h2>
        <p className="mt-3 max-w-2xl section-subtitle text-coffee-brown dark:text-injera-white/80 font-medium">
          {t('products.subtitle')}
        </p>

        <div className="mt-6 inline-flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-amber-400/80">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-amber-400/80" />
          <span>{t('products.badge') ?? 'OUR PRODUCTS'}</span>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-amber-400/80" />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-7 lg:gap-10 relative z-10">
        {products.map((product, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group relative rounded-3xl bg-white/10 dark:bg-white/5 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.35)] p-6 sm:p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_35px_120px_rgba(0,0,0,0.65)] overflow-hidden"
          >
            <div className="absolute -inset-0.5 rounded-[1.75rem] bg-gradient-to-br from-white/40 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-screen pointer-events-none" />

            <div className="relative mb-4 sm:mb-6 flex items-center justify-between gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-amber-500/30 blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-300/80 via-amber-500/70 to-amber-700/70 text-2xl shadow-[0_0_30px_rgba(245,158,11,0.8)]">
                  <span>{product.icon}</span>
                </div>
              </div>
              <div className="flex-1 text-right">
                <h3 className="text-lg sm:text-xl font-semibold text-injera-maroon dark:text-injera-white drop-shadow">
                  {product.title}
                </h3>
                <p className="mt-1 text-[0.65rem] sm:text-xs uppercase tracking-[0.25em] text-amber-200/80">
                  Safed Quality • Teff Based
                </p>
              </div>
            </div>

            <p className="relative text-coffee-brown dark:text-injera-white/80 leading-relaxed text-sm sm:text-base mb-4">
              {product.description}
            </p>
            <button className="relative inline-flex items-center gap-2 text-injera-maroon dark:text-injera-white font-semibold text-sm hover:text-amber-glow transition-colors">
              <span>{t('products.cta') ?? 'Learn more'}</span>
              <span className="inline-flex w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 items-center justify-center text-[0.65rem]">
                ➜
              </span>
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Products;

