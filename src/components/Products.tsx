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
    <section
      id="products"
      className="section-container relative overflow-hidden bg-injera-white dark:bg-transparent transition-colors duration-300"
    >
      {/* Content first (DOM order); backgrounds are absolutely positioned behind */}
      <div className="section-inner relative z-10">
        <div
          className="rounded-[2rem] border border-ethiopian-earth/10 bg-gradient-to-br from-ethiopian-earth/[0.12] via-white/55 to-sefed-sand/25 px-5 py-10 shadow-[0_28px_90px_rgba(78,24,21,0.14)] ring-1 ring-inset ring-white/40 backdrop-blur-2xl dark:border-white/10 dark:from-ethiopian-earth/35 dark:via-[#2A0E0C]/55 dark:to-injera-maroon/30 dark:ring-amber-glow/10 sm:px-7 sm:py-12 md:px-10 md:py-16"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative z-10 mb-12 flex flex-col items-center text-center sm:mb-14"
          >
            <div className="relative mb-4 inline-flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-amber-500/25 blur-2xl opacity-80 dark:bg-amber-500/15" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/35 bg-white/25 shadow-[0_0_40px_rgba(245,158,11,0.35)] backdrop-blur-md dark:border-amber-glow/25 dark:bg-ethiopian-earth/40">
                <span className="text-3xl">🍽️</span>
              </div>
            </div>
            <h2 className="section-title text-3xl font-extrabold text-injera-maroon drop-shadow-sm dark:text-[#FFF2DB] sm:text-4xl md:text-5xl">
              {t('products.title')}
            </h2>
            <p className="section-subtitle mt-3 max-w-2xl font-medium text-coffee-brown dark:text-injera-white/85">
              {t('products.subtitle')}
            </p>

            <div className="mt-6 inline-flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-amber-700/90 dark:text-amber-glow/85">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-amber-600/70 dark:to-amber-glow/70" />
              <span>{t('products.badge')}</span>
              <span className="h-px w-8 bg-gradient-to-l from-transparent to-amber-600/70 dark:to-amber-glow/70" />
            </div>
          </motion.div>

          <div className="relative z-10 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-7 lg:grid-cols-4 lg:gap-8">
            {products.map((product, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-3xl border border-white/45 bg-white/35 p-6 shadow-[0_20px_60px_rgba(78,24,21,0.12)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_32px_100px_rgba(78,24,21,0.22)] dark:border-white/12 dark:bg-ethiopian-earth/25 dark:shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:p-8"
              >
                <div className="pointer-events-none absolute -inset-0.5 rounded-[1.75rem] bg-gradient-to-br from-white/50 via-white/15 to-transparent opacity-0 mix-blend-screen transition-opacity duration-500 group-hover:opacity-100 dark:from-amber-glow/15 dark:via-transparent" />

                <div className="relative mb-4 flex items-center justify-between gap-4 sm:mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-2xl bg-amber-500/35 opacity-70 blur-xl transition-opacity duration-500 group-hover:opacity-100 dark:bg-amber-glow/25" />
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300/85 via-amber-500/75 to-amber-800/80 text-2xl shadow-[0_0_28px_rgba(245,158,11,0.55)] sm:h-14 sm:w-14">
                      <span>{product.icon}</span>
                    </div>
                  </div>
                  <div className="flex-1 text-right">
                    <h3 className="text-lg font-semibold text-injera-maroon drop-shadow dark:text-injera-white sm:text-xl">
                      {product.title}
                    </h3>
                    <p className="mt-1 text-[0.65rem] uppercase tracking-[0.25em] text-amber-900/75 dark:text-amber-200/80 sm:text-xs">
                      Safed Quality • Teff Based
                    </p>
                  </div>
                </div>

                <p className="relative mb-4 text-sm leading-relaxed text-coffee-brown dark:text-injera-white/85 sm:text-base">
                  {product.description}
                </p>
                <button
                  type="button"
                  className="relative inline-flex items-center gap-2 text-sm font-semibold text-injera-maroon transition-colors hover:text-amber-glow dark:text-injera-white dark:hover:text-amber-glow"
                >
                  <span>{t('products.cta')}</span>
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/25 text-[0.65rem] text-amber-800 dark:bg-amber-glow/20 dark:text-amber-200">
                    ➜
                  </span>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-cloud-white via-injera-white to-sefed-sand/10 transition-colors duration-300 dark:from-transparent dark:via-transparent dark:to-transparent" />

      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-10 dark:hidden"
        style={{
          backgroundImage: 'url(/images 2/pattern white.png.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '280px',
          mixBlendMode: 'soft-light',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 hidden opacity-12 dark:block"
        style={{
          backgroundImage: 'url(/images 2/pattern brown.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '280px',
          mixBlendMode: 'soft-light',
        }}
      />
    </section>
  );
};

export default Products;
