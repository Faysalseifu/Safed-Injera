import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SplitHero from '../components/SplitHero';

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

  const heroImages = [
    { src: '/images/safed packaged.jpg', alt: 'Safed Injera packaged' },
    { src: '/images/sefed A3 promo.jpg', alt: 'Safed Injera promo' },
    { src: '/images/safed in cup.jpg', alt: 'Safed Injera in cup' },
    { src: '/images/sefed cloth.jpg', alt: 'Safed Injera cloth' },
    { src: '/images/safed rollup.jpg', alt: 'Safed Injera rollup' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative gradient-hero pattern-overlay pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 overflow-hidden">
        {/* Pattern overlays - Using actual PNG images as overlays */}
        {/* Centered large pattern */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] opacity-22 pointer-events-none pattern-pricing-center-light dark:hidden"
          style={{
            backgroundImage: 'url(/images 2/pattern white.png.png)',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            mixBlendMode: 'multiply'
          }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] opacity-28 pointer-events-none pattern-pricing-center-dark hidden dark:block"
          style={{
            backgroundImage: 'url(/images 2/pattern brown.png)',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            mixBlendMode: 'overlay'
          }} />

        {/* Repeated background */}
        <div className="absolute inset-0 opacity-12 pointer-events-none pattern-pricing-bg-light dark:hidden"
          style={{
            backgroundImage: 'url(/images 2/pattern white.png.png)',
            backgroundRepeat: 'repeat',
            backgroundSize: '300px',
            mixBlendMode: 'soft-light'
          }} />
        <div className="absolute inset-0 opacity-15 pointer-events-none pattern-pricing-bg-dark hidden dark:block"
          style={{
            backgroundImage: 'url(/images 2/pattern brown.png)',
            backgroundRepeat: 'repeat',
            backgroundSize: '300px',
            mixBlendMode: 'soft-light'
          }} />
        <div className="section-inner relative z-10">
          <SplitHero
            title={t('pricing.title')}
            subtitle={t('pricing.subtitle')}
            images={heroImages}
            initialIndex={1}
          />
        </div>

        {/* Hero to content transition */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-14 w-[120%] h-28 rounded-full bg-black/35 blur-3xl opacity-45 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none">
          <svg viewBox="0 0 1440 180" className="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0,96 C220,190 470,0 720,84 C980,174 1220,46 1440,112 L1440,180 L0,180 Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="section-container relative -mt-10 sm:-mt-12 z-20 bg-gradient-to-b from-[#fcf7f2] via-white to-white rounded-t-[2rem] shadow-[0_-22px_60px_rgba(35,18,14,0.14)]">
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/80 to-transparent pointer-events-none" />
        <div className="section-inner relative">
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`card-modern ${pkg.highlight
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
                {(t(`pricing.packages.${pkg.key}.features`, { returnObjects: true }) as string[]).map(
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
        </div>
      </section>
    </div>
  );
};

export default PricingPage;

