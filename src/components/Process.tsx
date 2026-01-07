import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const Process = () => {
  const { t } = useTranslation();

  const steps = [
    { key: 'step1', icon: '🌾' },
    { key: 'step2', icon: '🫖' },
    { key: 'step3', icon: '🔥' },
    { key: 'step4', icon: '🔍' },
    { key: 'step5', icon: '📦' },
    { key: 'step6', icon: '🚚' },
  ];

  return (
    <section id="process" className="section-container bg-cloud-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="section-title">{t('process.title')}</h2>
        <p className="section-subtitle">{t('process.subtitle')}</p>
      </motion.div>

      <div className="relative">
        {/* Timeline line */}
        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-sefed-sand/30" />

        <div className="space-y-12 md:space-y-16">
          {steps.map((step, index) => (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`flex flex-col md:flex-row items-center gap-6 md:gap-8 ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* Step number and icon */}
              <div className="flex-shrink-0 w-24 h-24 rounded-full bg-ethiopian-earth text-cloud-white flex items-center justify-center text-3xl font-bold shadow-lg relative z-10">
                <span className="text-4xl">{step.icon}</span>
              </div>

              {/* Content */}
              <div
                className={`flex-1 card-modern ${
                  index % 2 === 0 ? 'md:text-left' : 'md:text-right'
                }`}
              >
                <h3 className="text-xl sm:text-2xl font-bold text-ethiopian-earth mb-3 sm:mb-4">
                  {t(`process.${step.key}`)}
                </h3>
                <p className="text-sefed-sand leading-relaxed text-sm sm:text-base">
                  {t(`process.${step.key}Desc`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;

