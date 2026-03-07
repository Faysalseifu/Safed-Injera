import { useTranslation } from 'react-i18next';

type LanguageSwitcherProps = {
  className?: string;
};

const LanguageSwitcher = ({ className = '' }: LanguageSwitcherProps) => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'am' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className={
        [
          'inline-flex items-center justify-center',
          'px-3 py-2 rounded-xl border',
          'border-sefed-sand/30 bg-white/20 backdrop-blur-md',
          'text-ethiopian-earth/90 hover:text-amber-glow',
          'hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-glow',
          'dark:border-amber-glow/25 dark:bg-ethiopian-earth/25 dark:text-injera-white/90 dark:hover:bg-ethiopian-earth/35',
          'transition-colors duration-200 font-medium',
          className,
        ].join(' ')
      }
      aria-label="Switch language"
    >
      {i18n.language === 'en' ? 'አማ' : 'EN'}
    </button>
  );
};

export default LanguageSwitcher;



