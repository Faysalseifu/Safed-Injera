import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const About = () => {
  const { t } = useTranslation();

  const features = [
    {
      title: t('about.mission'),
      text: t('about.missionText'),
      icon: '🎯',
      accent: 'from-amber-400/40 via-amber-500/15 to-injera-maroon/20',
    },
    {
      title: t('about.quality'),
      text: t('about.qualityText'),
      icon: '⭐',
      accent: 'from-amber-300/40 via-amber-400/15 to-cloud-white/10',
    },
    {
      title: t('about.heritage'),
      text: t('about.heritageText'),
      icon: '🏛️',
      accent: 'from-injera-maroon/40 via-amber-500/10 to-ethiopian-earth/30',
    },
  ];
  return (
    <section
      id="about"
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
          backgroundSize: '300px',
          mixBlendMode: 'soft-light',
        }}
      />
      <div
        className="absolute inset-0 opacity-12 pointer-events-none hidden dark:block"
        style={{
          backgroundImage: 'url(/images 2/pattern brown.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '300px',
          mixBlendMode: 'soft-light',
        }}
      />

      <div className="section-inner relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 relative z-10"
      >
        <h2 className="section-title text-injera-maroon dark:text-injera-white drop-shadow-lg font-extrabold">
          {t('about.title')}
        </h2>
        <p className="section-subtitle text-coffee-brown dark:text-injera-white/80 font-medium">
          {t('about.subtitle')}
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-12 relative z-10">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="group relative rounded-3xl bg-white/10 dark:bg-white/5 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.35)] p-6 sm:p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_35px_120px_rgba(0,0,0,0.65)] overflow-hidden"
          >
            <div className="absolute -inset-0.5 rounded-[1.75rem] bg-gradient-to-br from-white/40 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-screen pointer-events-none" />

            {/* Floating accent gradient */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-50 group-hover:opacity-90 transition-opacity duration-500 bg-gradient-to-br ${feature.accent}`} />

            <div className="relative flex items-center gap-3 mb-4 sm:mb-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-amber-500/30 blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-300/80 via-amber-500/70 to-amber-700/70 text-2xl shadow-[0_0_30px_rgba(245,158,11,0.8)]">
                  <span>{feature.icon}</span>
                </div>
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-lg sm:text-xl font-semibold text-injera-maroon dark:text-injera-white drop-shadow">
                  {feature.title}
                </h3>
                <p className="mt-1 text-xs uppercase tracking-[0.25em] text-amber-200/80">
                  Safed Injera · Since 20XX
                </p>
              </div>
            </div>

            <p className="relative text-coffee-brown dark:text-injera-white/80 leading-relaxed text-sm sm:text-base">
              {feature.text}
            </p>

            <div className="pointer-events-none absolute -inset-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-sefed-sand/20 via-amber-glow/10 to-injera-maroon/10 blur-3xl" />
            </div>
          </motion.div>
        ))}
      </div>
      </div>
    </section>
  );
};

export default About;

