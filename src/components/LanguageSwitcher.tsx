import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'am' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-4 py-2 rounded-lg border border-sefed-sand text-ethiopian-earth hover:bg-sefed-sand/10 transition-colors duration-200 font-medium"
      aria-label="Switch language"
    >
      {i18n.language === 'en' ? 'አማ' : 'EN'}
    </button>
  );
};

export default LanguageSwitcher;


