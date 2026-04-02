import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const Process = () => {
  const { t } = useTranslation();

  // Restore emojis for icons
  const steps = [
    { key: 'step1', icon: '🌾' },
    { key: 'step2', icon: '🫖' },
    { key: 'step3', icon: '🔥' },
    { key: 'step4', icon: '🔍' },
    { key: 'step5', icon: '📦' },
    { key: 'step6', icon: '🚚' },
  ];

  return (
    <section
      id="process"
      className="section-container process-shell relative overflow-hidden bg-injera-white dark:bg-transparent transition-colors duration-300"
    >
      {/* Background ambience */}
      <div className="process-ambience absolute inset-0 bg-gradient-to-b from-cloud-white via-injera-white to-sefed-sand/10 dark:from-transparent dark:via-transparent dark:to-transparent pointer-events-none -z-10 transition-colors duration-300" />

      {/* Pattern overlays */}
      <div
        className="process-pattern-light absolute inset-0 opacity-10 pointer-events-none dark:hidden"
        style={{
          backgroundImage: 'url(/images 2/pattern white.png.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '320px',
          mixBlendMode: 'soft-light',
        }}
      />
      <div
        className="process-pattern-dark absolute inset-0 opacity-12 pointer-events-none hidden dark:block"
        style={{
          backgroundImage: 'url(/images 2/pattern brown.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '320px',
          mixBlendMode: 'soft-light',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16 relative z-10"
      >
        <h2 className="section-title text-injera-maroon dark:text-injera-white drop-shadow-lg font-extrabold">
          {t('process.title')}
        </h2>
        <p className="section-subtitle text-coffee-brown dark:text-injera-white/80 font-medium">
          {t('process.subtitle')}
        </p>
      </motion.div>

      <div className="relative z-10">
        {/* Timeline line */}
        <div className="process-line hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-accent-gray/30 dark:bg-white/10" />

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
              <div className="process-icon flex-shrink-0 w-24 h-24 rounded-full bg-white/80 backdrop-blur-md border border-white/70 text-4xl flex items-center justify-center shadow-lg relative z-10 hover:scale-105 hover:shadow-amber-glow transition-all duration-300 dark:bg-white/10 dark:border-white/10">
                {step.icon}
              </div>

              {/* Content */}
              <div
                className={`process-card flex-1 card-modern ${
                  index % 2 === 0 ? 'md:text-left' : 'md:text-right'
                } rounded-3xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-xl p-6 sm:p-8 dark:bg-white/10 dark:border-white/10`}
              >
                <h3 className="text-xl sm:text-2xl font-bold text-injera-maroon dark:text-injera-white mb-3 sm:mb-4 drop-shadow">
                  {t(`process.${step.key}`)}
                </h3>
                <p className="text-coffee-brown dark:text-injera-white/80 leading-relaxed text-sm sm:text-base">
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

