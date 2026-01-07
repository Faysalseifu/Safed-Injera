import React from 'react';
import './AISection.css';

// Placeholder for AI character PNG. Replace with your actual asset.
// Use public path for image to avoid Vite import error
const aiCharacter = '/images/ai-character.png';

const AISection: React.FC = () => {
  return (
    <section className="ai-section bg-injera-white py-16 px-4 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Floating decorative accent */}
      <div className="floating-accent" />
      <div className="floating-accent2" />
      <div className="floating-gradient" />
      <div className="ai-content max-w-3xl w-full text-center z-10">
        <h2 className="text-4xl font-bold mb-4 text-injera-maroon drop-shadow-lg">Premium AI Experience</h2>
        <p className="text-lg mb-8 text-coffee-brown font-medium">
          Discover the future of security and automation with Sefed Injera’s AI-powered solutions. Our technology blends tradition and innovation for a truly premium experience.
        </p>
        <div className="ai-visual-container flex flex-col items-center">
          <img
            src={aiCharacter}
            alt="AI Character"
            className="ai-character-img shadow-xl hover:scale-105 hover:shadow-amber-glow transition-all duration-300"
            style={{ width: 180, height: 'auto' }}
          />
          <div className="mt-6">
            <button className="ai-cta-btn bg-injera-maroon text-injera-white px-8 py-3 rounded-lg font-semibold shadow-md hover:scale-105 hover:shadow-amber-glow transition-all duration-300">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AISection;
