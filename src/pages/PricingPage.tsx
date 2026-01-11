import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const PricingPage = () => {
  const { t } = useTranslation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const packages = [
    {
      key: 'starter',
      highlight: false,
    },
    {
      key: 'business',
      highlight: true,
    },
    {
      key: 'enterprise',
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative gradient-hero pattern-overlay py-12 sm:py-16 md:py-20 overflow-hidden">
        {/* Pattern overlays - Using actual PNG images as overlays */}
        {/* Centered large pattern */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] opacity-22 pointer-events-none pattern-pricing-center-light night-mode:hidden" 
             style={{ 
               backgroundImage: 'url(/images 2/pattern white.png.png)', 
               backgroundRepeat: 'no-repeat', 
               backgroundSize: 'contain',
               backgroundPosition: 'center',
               mixBlendMode: 'multiply'
             }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] opacity-28 pointer-events-none pattern-pricing-center-dark hidden night-mode:block" 
             style={{ 
               backgroundImage: 'url(/images 2/pattern brown.png)', 
               backgroundRepeat: 'no-repeat', 
               backgroundSize: 'contain',
               backgroundPosition: 'center',
               mixBlendMode: 'overlay'
             }} />
        
        {/* Repeated background */}
        <div className="absolute inset-0 opacity-12 pointer-events-none pattern-pricing-bg-light night-mode:hidden" 
             style={{ 
               backgroundImage: 'url(/images 2/pattern white.png.png)', 
               backgroundRepeat: 'repeat', 
               backgroundSize: '300px',
               mixBlendMode: 'soft-light'
             }} />
        <div className="absolute inset-0 opacity-15 pointer-events-none pattern-pricing-bg-dark hidden night-mode:block" 
             style={{ 
               backgroundImage: 'url(/images 2/pattern brown.png)', 
               backgroundRepeat: 'repeat', 
               backgroundSize: '300px',
               mixBlendMode: 'soft-light'
             }} />
        <div className="section-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center text-cloud-white"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              {t('pricing.title')}
            </h1>
            <p className="text-lg sm:text-xl text-sefed-sand max-w-2xl mx-auto">
              {t('pricing.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="section-container">
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`card-modern ${
                pkg.highlight
                  ? 'ring-4 ring-ethiopian-earth scale-[1.02] sm:scale-[1.05]'
                  : ''
              }`}
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl sm:text-3xl font-bold text-ethiopian-earth mb-2">
                  {t(`pricing.packages.${pkg.key}.name`)}
                </h3>
                <p className="text-sefed-sand text-sm sm:text-base mb-4">
                  {t(`pricing.packages.${pkg.key}.description`)}
                </p>
                <div className="text-3xl sm:text-4xl font-bold text-ethiopian-earth mb-2">
                  {t(`pricing.packages.${pkg.key}.price`)}
                </div>
                <p className="text-sm text-sefed-sand">
                  {t(`pricing.packages.${pkg.key}.quantity`)}
                </p>
              </div>

              <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {t(`pricing.packages.${pkg.key}.features`, { returnObjects: true }).map(
                  (feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 sm:gap-3">
                      <span className="text-green-600 text-lg sm:text-xl mt-0.5">✓</span>
                      <span className="text-sefed-sand text-sm sm:text-base">{feature}</span>
                    </li>
                  )
                )}
              </ul>

              <Link
                to="/contact"
                className="btn-primary w-full text-center block text-sm sm:text-base"
              >
                {t('pricing.contactForQuote')}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-12 sm:mt-16"
        >
          <div className="card-modern text-center">
            <p className="text-lg sm:text-xl text-sefed-sand max-w-4xl mx-auto leading-relaxed">
              {t('pricing.note')}
            </p>
            <p className="mt-4 text-base sm:text-lg font-semibold text-ethiopian-earth">
              {t('pricing.bulkDiscounts')}
            </p>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default PricingPage;

