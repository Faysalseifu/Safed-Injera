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
    <section id="process" className="relative section-container py-24 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-0 w-[600px] h-[600px] bg-sefed-sand/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-injera-maroon/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-20"
      >
        <span className="text-amber-glow font-bold tracking-widest text-sm uppercase mb-2 block">Our Craft</span>
        <h2 className="section-title text-5xl md:text-6xl text-injera-maroon font-black mb-4">
          {t('process.title')}
        </h2>
        <p className="text-lg text-coffee-brown/80 max-w-2xl mx-auto font-light">
          {t('process.subtitle')}
        </p>
      </motion.div>

      <div className="relative max-w-5xl mx-auto">
        {/* Timeline Line */}
        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-amber-glow/50 to-transparent" />

        <div className="space-y-24">
          {steps.map((step, index) => (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className={`flex flex-col md:flex-row items-center gap-12 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
            >
              {/* Step number and icon */}
              <div className="relative flex-shrink-0 z-10">
                <div className="w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center text-4xl border-4 border-white relative z-10 group hover:scale-110 transition-transform duration-500">
                  <span className="transform group-hover:rotate-12 transition-transform duration-300">{step.icon}</span>
                  <div className="absolute inset-0 rounded-full border border-amber-glow/20 animate-ping opacity-20" />
                </div>
                {/* Connector Dot */}
                <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-0.5 bg-amber-glow/20 -z-10"
                  style={{
                    width: '180px',
                    left: index % 2 === 0 ? '50%' : 'auto',
                    right: index % 2 === 1 ? '50%' : 'auto'
                  }}
                />
              </div>

              {/* Content Card */}
              <div
                className={`flex-1 w-full md:w-auto ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'
                  }`}
              >
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:border-amber-glow/30 transition-all duration-300"
                >
                  <div className={`flex items-center gap-4 mb-4 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    <span className="text-4xl font-black text-ethiopian-earth/10">0{index + 1}</span>
                    <h3 className="text-2xl font-bold text-ethiopian-earth">
                      {t(`process.${step.key}`)}
                    </h3>
                  </div>
                  <p className="text-coffee-brown/80 leading-relaxed font-light text-lg">
                    {t(`process.${step.key}Desc`)}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;

