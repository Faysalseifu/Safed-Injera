import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const SocialIcon = ({ path, href }: { path: string; href: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-amber-glow hover:text-white transition-all duration-300 group"
  >
    <svg className="w-5 h-5 fill-current text-white/70 group-hover:text-white" viewBox="0 0 24 24">
      <path d={path} />
    </svg>
  </a>
);

const FooterLink = ({ to, children, onClick }: { to?: string; children: React.ReactNode; onClick?: () => void }) => {
  const className = "text-white/70 hover:text-amber-glow transition-colors duration-300 flex items-center gap-2 group w-fit";
  const content = (
    <>
      <span className="w-1.5 h-1.5 rounded-full bg-amber-glow opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <span className="group-hover:translate-x-1 transition-transform duration-300">{children}</span>
    </>
  );

  if (onClick) {
    return <button onClick={onClick} className={className}>{content}</button>;
  }
  return <Link to={to!} className={className}>{content}</Link>;
};

const Footer = () => {
  const { t } = useTranslation();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { key: 'about', path: '/about' },
    { key: 'products', id: 'products' },
    { key: 'pricing', path: '/pricing' },
    { key: 'gallery', path: '/gallery' },
    { key: 'contact', path: '/contact' },
  ];

  return (
    <footer className="relative bg-injera-maroon text-injera-white overflow-hidden pt-20 pb-10">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-gradient-to-br from-amber-glow/10 to-transparent rounded-full blur-[120px]" />
        <div className="absolute bottom-[0%] right-[0%] w-[40%] h-[40%] bg-gradient-to-tl from-coffee-brown/40 to-transparent rounded-full blur-[100px]" />
      </div>

      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">

          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <Link to="/" className="block">
              <img
                src="/images/logo 1.png"
                alt="Safed Injera Logo"
                className="h-16 w-auto brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
              />
            </Link>
            <p className="text-white/60 leading-relaxed text-sm">
              {t('footer.description')}
            </p>
            <div className="flex gap-4 pt-2">
              <SocialIcon
                // Facebook
                path="M12 2C6.489 2 2 6.489 2 12s4.489 10 10 10 10-4.489 10-10S17.511 2 12 2zm0 2c4.43 0 8 3.57 8 8 0 1.94-.7 3.72-1.85 5.12-.29-.46-.66-.96-1.07-1.46-.35-.42-.72-.85-1.09-1.27-.08-.09-.16-.18-.24-.28-.15-.17-.3-.34-.45-.51-.31-.35-.61-.7-.91-1.05-.62-.71-1.22-1.41-1.81-2.09-.04-.05-.09-.1-.13-.15s-.08-.1-.13-.15c-.56-.66-1.12-1.32-1.65-1.99-.02-.03-.05-.06-.07-.09l-.15-.19c-.04-.05-.08-.1-.12-.15-.22-.29-.44-.57-.65-.85-.43-.56-.84-1.11-1.25-1.63-.4-.52-.79-1.03-1.16-1.52-.37-.48-.72-.94-1.06-1.38-.66-.88-1.29-1.69-1.85-2.42l-.12-.16c-.05-.07-.1-.14-.15-.21l-.06-.09c-.53-.78-1.02-1.49-1.46-2.11-.43-.62-.83-1.17-1.17-1.64-.17-.23-.32-.45-.48-.66l-.08-.11c-1.31 1.76-2.09 3.93-2.09 6.27 0 5.51 4.49 10 10 10s10-4.49 10-10c0-2.34-.78-4.51-2.09-6.27z"
                href="#"
              />
              <SocialIcon
                // Simple dot for placeholder or generic social
                path="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                href="#"
              />
              <SocialIcon
                // Instagram
                path="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                href="#"
              />
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-lg font-semibold mb-6 text-white tracking-wide relative inline-block">
              {t('footer.quickLinks')}
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-amber-glow rounded-full"></span>
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.key}>
                  {link.path ? (
                    <FooterLink to={link.path}>
                      {t(`nav.${link.key}`)}
                    </FooterLink>
                  ) : (
                    <FooterLink onClick={() => scrollToSection(link.id!)}>
                      {t(`nav.${link.key}`)}
                    </FooterLink>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h4 className="text-lg font-semibold mb-6 text-white tracking-wide relative inline-block">
              {t('footer.contact')}
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-amber-glow rounded-full"></span>
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-4 text-white/70">
                <svg className="w-5 h-5 text-amber-glow mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{t('contact.locationText')}</span>
              </li>
              <li className="flex items-center gap-4 text-white/70">
                <svg className="w-5 h-5 text-amber-glow flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>info@safedinjera.com</span>
              </li>
              <li className="flex items-center gap-4 text-white/70">
                <svg className="w-5 h-5 text-amber-glow flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div className="flex flex-col">
                  <a href="tel:+251922212161" className="hover:text-amber-glow transition-colors">+251 92 221 2161</a>
                  <a href="tel:+251953866041" className="hover:text-amber-glow transition-colors">+251 95 386 6041</a>
                </div>
              </li>
            </ul>
          </motion.div>

          {/* Newsletter (New) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h4 className="text-lg font-semibold mb-6 text-white tracking-wide relative inline-block">
              Stay Updated
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-amber-glow rounded-full"></span>
            </h4>
            <p className="text-white/60 text-sm mb-4">
              Subscribe to our newsletter for the latest updates and offers.
            </p>
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-amber-glow/50 focus:ring-1 focus:ring-amber-glow/50 transition-all font-light"
              />
              <button className="absolute right-1 top-1 bottom-1 bg-amber-glow text-white px-4 rounded-md hover:bg-amber-glow/80 transition-colors text-sm font-medium">
                Join
              </button>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
          <p>&copy; {new Date().getFullYear()} Safed Injera. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-amber-glow transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-amber-glow transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

