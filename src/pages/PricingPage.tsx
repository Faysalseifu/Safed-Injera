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
      <section className="relative gradient-hero pattern-overlay py-12 sm:py-16 md:py-20">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
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
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className={`card-modern ${
                pkg.highlight
                  ? 'ring-4 ring-ethiopian-earth scale-105 sm:scale-110'
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
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
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

