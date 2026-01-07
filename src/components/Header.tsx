import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    // For page routes, navigation is handled by React Router
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'glass-card shadow-2xl'
          : 'glass backdrop-blur-xl'
      }`}
    >
      <nav className="section-container py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <img 
              src="/images/logo 1.png" 
              alt="Safed Injera Logo" 
              className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.key}
                to={link.path}
                onClick={() => handleNavClick(link.path)}
                className="text-ethiopian-earth hover:text-sefed-sand transition-colors font-medium text-sm lg:text-base"
              >
                {t(`nav.${link.key}`)}
              </Link>
            ))}
            <LanguageSwitcher />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-ethiopian-earth"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pb-4 border-t border-sefed-sand/20 pt-4"
            >
              <div className="flex flex-col gap-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.key}
                    to={link.path}
                    onClick={() => handleNavClick(link.path)}
                    className="text-left text-ethiopian-earth hover:text-sefed-sand transition-colors font-medium py-2"
                  >
                    {t(`nav.${link.key}`)}
                  </Link>
                ))}
                <div className="pt-2">
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

