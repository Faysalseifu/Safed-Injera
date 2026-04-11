import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const PROCESS_BG_ROTATE_MS = 6000;

const PROCESS_BG_IMAGES = [
  `/images/${encodeURIComponent('hero-chef 1.png')}`,
  `/images/${encodeURIComponent('hero-chef 2.png')}`,
  `/images/${encodeURIComponent('hero-chef 3.png')}`,
  '/images/safed packaged.jpg',
];

/** Strip "Step N:" / "ደረጃ N:" prefixes for compact infographic titles */
function compactStepTitle(raw: string): string {
  return raw
    .replace(/^Step\s*\d+:\s*/i, '')
    .replace(/^ደረጃ\s*\d+[:：]\s*/i, '')
    .trim();
}

type StepKey = 'step1' | 'step2' | 'step3' | 'step4' | 'step5' | 'step6';

const STEP_CONFIG: { key: StepKey; icon: ReactNode }[] = [
  {
    key: 'step1',
    icon: (
      <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 3v3M12 18v3M4.5 8.5l2.6 1.5M16.9 14l2.6 1.5M4.5 15.5l2.6-1.5M16.9 10l2.6-1.5M3 12h3M18 12h3" />
        <circle cx="12" cy="12" r="3.2" />
      </svg>
    ),
  },
  {
    key: 'step2',
    icon: (
      <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M9 3h6v4a3 3 0 01-3 3 3 3 0 01-3-3V3z" />
        <path d="M7 11h10v9a2 2 0 01-2 2H9a2 2 0 01-2-2v-9z" />
        <path d="M10 15h4" />
      </svg>
    ),
  },
  {
    key: 'step3',
    icon: (
      <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 3c-2 4-4 6.5-4 9a4 4 0 008 0c0-2.5-2-5-4-9z" />
        <path d="M10 14h4" />
        <ellipse cx="12" cy="18" rx="5" ry="2.5" />
      </svg>
    ),
  },
  {
    key: 'step4',
    icon: (
      <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="11" cy="11" r="6.5" />
        <path d="M20 20l-3.5-3.5" />
        <path d="M11 9v3l2 1.5" />
      </svg>
    ),
  },
  {
    key: 'step5',
    icon: (
      <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 8h16v10a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" />
        <path d="M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2" />
        <path d="M4 12h16" />
      </svg>
    ),
  },
  {
    key: 'step6',
    icon: (
      <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 14h2l1.5-4h9l1.8 4H21" />
        <circle cx="7.5" cy="17.5" r="1.8" />
        <circle cx="17" cy="17.5" r="1.8" />
        <path d="M5 14l2-7h8v7" />
      </svg>
    ),
  },
];

function ProcessStepRow({
  steps,
  startIndex,
}: {
  steps: Array<(typeof STEP_CONFIG)[number]>;
  startIndex: number;
}) {
  return (
    <div className="relative">
      {/* Horizontal connector (desktop) */}
      <div
        className="pointer-events-none absolute left-[12%] right-[12%] top-[3.25rem] z-0 hidden h-px bg-gradient-to-r from-transparent via-sefed-sand/45 to-transparent sm:block dark:via-amber-glow/25"
        aria-hidden
      />
      <div className="relative z-10 grid gap-12 sm:grid-cols-3 sm:gap-6 lg:gap-10">
        {steps.map((step, i) => {
          const n = startIndex + i + 1;
          return (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="process-step-node flex flex-col items-center text-center"
            >
              <div className="relative mb-5">
                <span className="absolute -right-1 -top-1 z-20 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-coffee-brown text-[11px] font-bold text-cloud-white shadow-md dark:border-injera-maroon dark:bg-amber-glow/90 dark:text-ethiopian-earth">
                  {String(n).padStart(2, '0')}
                </span>
                <div className="process-step-circle relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-ethiopian-earth via-injera-maroon to-[#3A120F] text-white shadow-[0_18px_40px_rgba(78,24,21,0.35)] ring-4 ring-white/90 dark:ring-amber-glow/15">
                  {step.icon}
                </div>
              </div>
              <ProcessStepCopy stepKey={step.key} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function ProcessStepCopy({ stepKey }: { stepKey: StepKey }) {
  const { t } = useTranslation();
  const title = compactStepTitle(t(`process.${stepKey}`));
  return (
    <>
      <h3 className="text-lg font-bold leading-snug text-ethiopian-earth dark:text-[#FFF2DB] sm:text-xl">{title}</h3>
      <p className="mt-2 max-w-[17rem] text-sm leading-relaxed text-sefed-sand dark:text-injera-white/75 sm:text-[0.9375rem]">
        {t(`process.${stepKey}Desc`)}
      </p>
    </>
  );
}

const Process = () => {
  const { t } = useTranslation();
  const rowA = STEP_CONFIG.slice(0, 3);
  const rowB = STEP_CONFIG.slice(3, 6);
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setBgIndex((i) => (i + 1) % PROCESS_BG_IMAGES.length);
    }, PROCESS_BG_ROTATE_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section
      id="process"
      className="section-container process-shell relative overflow-hidden bg-injera-white dark:bg-transparent transition-colors duration-300"
    >
      <div className="section-inner relative z-10">
        <div className="relative mx-auto mb-14 max-w-4xl text-center md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative z-10 pt-2 md:pt-4"
          >
            <p className="mb-3 text-sm font-semibold tracking-wide text-amber-glow md:text-base">
              <span className="text-sefed-sand/70 dark:text-injera-white/45">// </span>
              {t('process.subtitle')}
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-coffee-brown dark:text-injera-white/95 sm:text-4xl md:text-5xl">
              <span className="text-ethiopian-earth dark:text-[#FFF2DB]">{t('process.headlinePart1')}</span>{' '}
              <span className="bg-gradient-to-r from-ethiopian-earth to-amber-glow bg-clip-text text-transparent dark:from-amber-glow dark:to-[#F2C36B]">
                {t('process.headlineAccent')}
              </span>
            </h2>
          </motion.div>
        </div>

        <div className="space-y-16 md:space-y-20 lg:space-y-24">
          <ProcessStepRow steps={rowA} startIndex={0} />
          <ProcessStepRow steps={rowB} startIndex={3} />
        </div>
      </div>

      {/* Dynamic photo background — cycles for visual interest; scrim keeps text readable */}
      <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden" aria-hidden>
        {PROCESS_BG_IMAGES.map((src, i) => (
          <div
            key={src}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[1400ms] ease-in-out ${
              i === bgIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url(${src})` }}
          />
        ))}
      </div>
      <div
        className="pointer-events-none absolute inset-0 -z-[15] bg-gradient-to-b from-injera-white/93 via-injera-white/88 to-sefed-sand/95 dark:from-[#2A0E0C]/93 dark:via-[#2A0E0C]/88 dark:to-[#3A120F]/96"
        aria-hidden
      />

      <div className="process-ambience absolute inset-0 bg-gradient-to-b from-cloud-white/80 via-injera-white/50 to-sefed-sand/10 dark:from-transparent dark:via-transparent dark:to-transparent pointer-events-none -z-10 transition-colors duration-300" />

      <div
        className="process-pattern-light absolute inset-0 opacity-10 pointer-events-none dark:hidden -z-10"
        style={{
          backgroundImage: 'url(/images 2/pattern white.png.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '320px',
          mixBlendMode: 'soft-light',
        }}
      />
      <div
        className="process-pattern-dark absolute inset-0 opacity-12 pointer-events-none hidden dark:block -z-10"
        style={{
          backgroundImage: 'url(/images 2/pattern brown.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: '320px',
          mixBlendMode: 'soft-light',
        }}
      />
    </section>
  );
};

export default Process;
