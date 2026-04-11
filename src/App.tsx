import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import About from './components/About';
import Products from './components/Products';
import Process from './components/Process';
import Distribution from './components/Distribution';
import Clients from './components/Clients';
import Gallery from './components/Gallery';
import Contact from './components/Contact';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import GalleryPage from './pages/GalleryPage';
import PricingPage from './pages/PricingPage';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/globals.css';
import './styles/nightmode.css';

import { useEffect, useState } from 'react';

function App() {
  // Detect night mode from localStorage
  const [nightMode, setNightMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sefedinjera-night-mode') === 'true';
    }
    return false;
  });

  useEffect(() => {
    const handler = () => {
      setNightMode(localStorage.getItem('sefedinjera-night-mode') === 'true');
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <div className={`min-h-screen w-full flex flex-col transition-colors duration-500 ${nightMode ? 'night-mode' : ''}`}>
          <Header />
          <main className="flex-grow w-full min-w-0">
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <Hero />
                    <div className="home-mid-shell">
                      <div className="home-mid-bg" aria-hidden="true">
                        <div className="home-mid-bg-light dark:hidden" />
                        <div className="home-mid-bg-dark hidden dark:block" />
                      </div>
                      <About />
                      <Products />
                      <Process />
                      <Distribution />
                      <Clients />
                    </div>
                    <Gallery />
                    <Contact />
                  </>
                }
              />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/pricing" element={<PricingPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

