import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks: Array<{ key: string; path?: string; id?: string }> = [
    { key: 'about', path: '/about' },
    { key: 'products', id: 'products' },
    { key: 'pricing', path: '/pricing' },
    { key: 'gallery', path: '/gallery' },
    { key: 'contact', path: '/contact' },
  ];

  return (
    <footer className="relative z-10 mt-6 sm:mt-10 px-3 sm:px-4 md:px-6 pb-4 sm:pb-6">
      <div
        className={
          [
            'relative mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] sm:rounded-[2rem]',
            'border border-white/20 dark:border-amber-glow/15',
            'bg-ethiopian-earth/75 dark:bg-injera-maroon/80',
            'backdrop-blur-2xl backdrop-saturate-150',
            'shadow-[0_24px_80px_-12px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)]',
            'text-cloud-white dark:text-injera-white',
            'transition-colors duration-300',
          ].join(' ')
        }
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          aria-hidden
          style={{
            background:
              'linear-gradient(165deg, rgba(255,255,255,0.12) 0%, transparent 42%, rgba(0,0,0,0.12) 100%)',
          }}
        />
        <div className="section-inner relative py-10 sm:py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <img
              src="/images/logo 1.png"
              alt="Safed Injera Logo"
              className="h-12 sm:h-16 md:h-20 w-auto mb-3 sm:mb-4 dark:hidden"
            />
            <img
              src="/images/logo dark mode.png"
              alt="Safed Injera Logo"
              className="hidden h-12 sm:h-16 md:h-20 w-auto mb-3 sm:mb-4 dark:block"
            />
            <p className="text-cloud-white/80 dark:text-injera-white/80 leading-relaxed text-sm sm:text-base transition-colors duration-300">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.key}>
                  {link.path ? (
                    <Link
                      to={link.path}
                      className="text-cloud-white/80 dark:text-injera-white/80 hover:text-cloud-white dark:hover:text-amber-glow transition-colors text-sm sm:text-base"
                    >
                      {t(`nav.${link.key}`)}
                    </Link>
                  ) : (
                    <button
                      onClick={() => scrollToSection(link.id!)}
                      className="text-cloud-white/80 dark:text-injera-white/80 hover:text-cloud-white dark:hover:text-amber-glow transition-colors text-sm sm:text-base"
                    >
                      {t(`nav.${link.key}`)}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">{t('footer.contact')}</h4>
            <ul className="space-y-2 text-cloud-white/80 dark:text-injera-white/80 text-sm sm:text-base transition-colors duration-300">
              <li>📍 {t('contact.locationText')}</li>
              <li>📧 info@safedinjera.com</li>
              <li>📞 <a href="tel:+251922212161" className="hover:text-sefed-sand dark:hover:text-amber-glow transition-colors">+251 92 221 2161</a></li>
              <li>📞 <a href="tel:+251953866041" className="hover:text-sefed-sand dark:hover:text-amber-glow transition-colors">+251 95 386 6041</a></li>
            </ul>
          </div>
          </div>

          <div className="border-t border-cloud-white/25 dark:border-injera-white/15 pt-8 text-center text-cloud-white/65 dark:text-injera-white/65 transition-colors duration-300">
            <p>&copy; {new Date().getFullYear()} Safed Injera. {t('footer.rights')}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

