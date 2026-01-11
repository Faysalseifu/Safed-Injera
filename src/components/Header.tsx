import { useState, useEffect } from 'react';
import useNightMode from './useNightMode';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [nightMode, setNightMode] = useNightMode();

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
    e?.preventDefault();
    setIsMobileMenuOpen(false);
    if (path === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (path.startsWith('/#')) {
      const id = path.substring(2);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isScrolled
          ? 'bg-white/80 dark:bg-ethiopian-earth/90 backdrop-blur-xl border-b border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]'
          : 'bg-transparent backdrop-blur-[2px] border-transparent shadow-none py-2'
      }`}
    >
      <nav className="section-container py-3 sm:py-4 transition-all duration-300">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <img 
                src="/images/logo 1.png" 
                alt="Safed Injera Logo" 
                className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto drop-shadow-2xl filter"
              />
            </motion.div>
          </Link>

          {/* Night mode toggle switch */}
          <div className="flex-1 flex justify-end items-center mr-4 md:mr-0 md:order-3 md:flex-none">
            <label className="relative inline-flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={nightMode}
                onChange={() => setNightMode(!nightMode)}
                className="sr-only peer"
                aria-label={nightMode ? 'Switch to Day Mode' : 'Switch to Night Mode'}
              />
              <div className="w-16 h-8 bg-white/20 backdrop-blur-lg border border-white/30 peer-focus:outline-none rounded-full transition-all duration-300 shadow-inner group-hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                <div
                  className={`absolute left-1 top-1 w-6 h-6 rounded-full transition-all duration-300 ${
                    nightMode ? 'translate-x-8 bg-gradient-to-r from-indigo-900 to-purple-900' : 'translate-x-0 bg-gradient-to-r from-amber-400 to-orange-500'
                  } shadow-lg flex items-center justify-center transform group-hover:scale-105`}
                  style={{ boxShadow: nightMode ? '0 0 10px #4F46E5' : '0 0 10px #F59E0B' }}
                >
                  <span className="text-[10px]">{nightMode ? '🌙' : '☀️'}</span>
                </div>
              </div>
            </label>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2 md:order-2 bg-white/5 backdrop-blur-sm px-6 py-2 rounded-full border border-white/10 shadow-[inner_0_0_10px_rgba(255,255,255,0.1)]">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                to={link.path}
                onClick={() => handleNavClick(link.path)}
                className="relative px-4 py-2 text-ethiopian-earth hover:text-sefed-sand font-medium text-sm lg:text-base transition-all duration-200 group overflow-hidden rounded-lg"
              >
                <span className="relative z-10 transition-colors duration-200 group-hover:text-amber-glow">{t(`nav.${link.key}`)}</span>
                <span className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-bottom-left rounded-lg"></span>
              </Link>
            ))}
            <div className="pl-2 border-l border-white/20 ml-2">
               <LanguageSwitcher />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-ethiopian-earth p-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 active:scale-95 transition-all"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <AnimatePresence mode='wait'>
                {isMobileMenuOpen ? (
                  <motion.path
                    key="close"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    exit={{ pathLength: 0 }}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <motion.path
                    key="open"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    exit={{ pathLength: 0 }}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </AnimatePresence>
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.98 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-4 rounded-2xl overflow-hidden glass-card-dark border-t border-white/20 shadow-2xl"
            >
              <div className="flex flex-col p-4 gap-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.key}
                    initial={{ x: -15, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => handleNavClick(link.path)}
                      className="block px-4 py-3 rounded-xl hover:bg-white/10 text-ethiopian-earth font-medium transition-colors"
                    >
                      {t(`nav.${link.key}`)}
                    </Link>
                  </motion.div>
                ))}
                <div className="pt-2 px-4 border-t border-white/10 mt-2">
                   <LanguageSwitcher />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

export default Header;

