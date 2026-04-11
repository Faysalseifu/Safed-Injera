import { useState, useEffect } from 'react';
import useNightMode from './useNightMode';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [nightMode, setNightMode] = useNightMode();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { key: 'home', path: '/' },
    { key: 'about', path: '/about' },
    { key: 'products', path: '/#products' },
    { key: 'pricing', path: '/pricing' },
    { key: 'gallery', path: '/gallery' },
    { key: 'contact', path: '/contact' },
  ];

  const handleNavClick = (path: string, e?: React.MouseEvent) => {
    setIsMobileMenuOpen(false);
    if (path === '/') {
      // Home: if we're on another route, navigate first then scroll to top
      e?.preventDefault();
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (path.startsWith('/#')) {
      // In-page section on the landing page (e.g. products)
      e?.preventDefault();
      const id = path.substring(2);

      const scrollToId = () => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      };

      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(scrollToId, 150);
      } else {
        scrollToId();
      }
    }
    // For other page routes, navigation is handled by React Router
  };

  return (
    <header
      className="fixed top-2 left-0 right-0 z-50 px-3 sm:px-4"
    >
      <nav className="mx-auto max-w-7xl">
        <div
          className={
            [
              'relative overflow-hidden rounded-2xl border',
              'backdrop-blur-xl transition-all duration-300',
              'hover:shadow-amber-glow focus-within:shadow-amber-glow',
              isScrolled
                ? [
                    'bg-white/75 border-white/35 shadow-2xl',
                    'dark:bg-ethiopian-earth/70 dark:border-amber-glow/25',
                  ].join(' ')
                : [
                    'bg-white/20 border-white/25',
                    'dark:bg-ethiopian-earth/35 dark:border-amber-glow/20',
                  ].join(' '),
            ].join(' ')
          }
        >
          <div className="flex items-center justify-between px-4 sm:px-5 py-2 sm:py-3">
            <Link to="/" onClick={(e) => handleNavClick('/', e)} className="flex items-center gap-2 sm:gap-3">
              <img
                src="/images/logo 1.png"
                alt="Safed Injera Logo"
                className="h-9 sm:h-10 md:h-12 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.key}
                  to={link.path}
                  onClick={(e) => handleNavClick(link.path, e)}
                  className={
                    [
                      'px-2.5 py-1.5 rounded-xl',
                      'text-sm font-semibold',
                      'text-ethiopian-earth/90 dark:text-injera-white/90',
                      'hover:text-amber-glow',
                      'hover:bg-white/25 dark:hover:bg-ethiopian-earth/35',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-glow',
                      'transition-colors',
                    ].join(' ')
                  }
                >
                  {t(`nav.${link.key}`)}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageSwitcher className="hidden sm:inline-flex" />

              {/* Night mode toggle */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={nightMode}
                  onChange={() => setNightMode(!nightMode)}
                  className="sr-only peer"
                  aria-label={nightMode ? 'Switch to Day Mode' : 'Switch to Night Mode'}
                />
                <div
                  className={
                    [
                      'relative w-[3.25rem] h-7 rounded-full border backdrop-blur-md',
                      'bg-white/20 border-white/30',
                      'peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-amber-glow',
                      'dark:bg-ethiopian-earth/30 dark:border-amber-glow/25',
                      'transition-colors',
                    ].join(' ')
                  }
                >
                  <div
                    className={
                      [
                          'absolute top-0.5 left-0.5 h-6 w-6 rounded-full',
                        'flex items-center justify-center shadow-lg',
                        'transition-transform duration-300',
                        nightMode
                          ? 'translate-x-[1.375rem] bg-injera-maroon text-amber-glow'
                          : 'translate-x-0 bg-injera-white text-coffee-brown',
                      ].join(' ')
                    }
                  >
                    <span className="text-sm leading-none">{nightMode ? '🌙' : '☀️'}</span>
                  </div>
                </div>
              </label>

              {/* Mobile Menu Button */}
              <button
                className={
                  [
                    'lg:hidden inline-flex items-center justify-center',
                    'h-10 w-10 rounded-xl border',
                    'border-white/25 bg-white/10 backdrop-blur-md',
                    'text-ethiopian-earth/90 hover:text-amber-glow',
                    'hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-glow',
                    'dark:border-amber-glow/25 dark:bg-ethiopian-earth/20 dark:text-injera-white/90 dark:hover:bg-ethiopian-earth/35',
                    'transition-colors',
                  ].join(' ')
                }
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden px-4 sm:px-6 pb-4"
              >
                <div className="border-t border-white/20 dark:border-amber-glow/20 pt-4">
                  <div className="flex flex-col gap-2">
                    {navLinks.map((link) => (
                      <Link
                        key={link.key}
                        to={link.path}
                        onClick={(e) => handleNavClick(link.path, e)}
                        className={
                          [
                            'px-3 py-2 rounded-xl font-semibold',
                            'text-ethiopian-earth/90 dark:text-injera-white/90',
                            'hover:text-amber-glow hover:bg-white/20 dark:hover:bg-ethiopian-earth/35',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-glow',
                            'transition-colors',
                          ].join(' ')
                        }
                      >
                        {t(`nav.${link.key}`)}
                      </Link>
                    ))}

                    <div className="pt-2 flex items-center gap-2">
                      <LanguageSwitcher />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </header>
  );
};

export default Header;

