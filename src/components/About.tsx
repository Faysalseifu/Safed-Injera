import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const TeamSection = () => {
  const team = [
    {
      name: 'Sead Nurahmed',
      role: 'CEO',
      image: '/images/team/team1.jpg?v=2',
      bio: '"Visionary leader driving Safed Injera\'s mission to globalize Ethiopian cuisine."',
    },
    {
      name: 'Yenus Ahmed',
      role: 'Marketing Manager',
      image: '/images/team/team2.jpg?v=2',
      bio: '"Expert strategist connecting our premium products with businesses worldwide."',
    },
    {
      name: 'Suhayb Murad',
      role: 'Technical Team & QA',
      image: '/images/team/team3.jpg?v=2',
      bio: '"Ensuring excellence in production technology and rigorous quality standards."',
    },
  ];

  return (
    <div className="mt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <span className="text-amber-600 font-semibold tracking-wider uppercase text-sm">The Minds Behind Safed</span>
        <h2 className="text-4xl md:text-5xl font-extrabold text-injera-maroon mt-2 mb-6 drop-shadow-sm">
          Meet Our Team
        </h2>
        <div className="w-24 h-1.5 bg-gradient-to-r from-amber-500 to-injera-maroon mx-auto rounded-full"></div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 px-4 md:px-8 max-w-7xl mx-auto">
        {team.map((member, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className="group relative h-[450px] w-full perspective-1000"
          >
            <div className="relative h-full w-full overflow-hidden rounded-3xl shadow-xl transition-all duration-500 hover:shadow-2xl bg-gray-900 leading-none">
              {/* Image Background */}
              <img
                src={member.image}
                alt={member.name}
                className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100"
              />

              {/* Gradient Overlay - Always visible but gets darker on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>

              {/* Content Container */}
              <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end h-full translate-y-[30%] group-hover:translate-y-0 transition-transform duration-500 ease-out">

                {/* Name and Role - Always visible (shifted up by translate-y) */}
                <div className="mb-4">
                  <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-lg leading-tight">{member.name}</h3>
                  <p className="text-amber-400 font-medium tracking-wide text-lg uppercase">{member.role}</p>
                </div>

                {/* Bio and Socials - Hidden initially (by translate-y) */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  <p className="text-gray-200 text-sm leading-relaxed mb-6 font-light">
                    {member.bio}
                  </p>

                  <div className="flex space-x-4">
                    {/* Social Icon 1 (Generic Link) */}
                    <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-amber-500 hover:text-white text-gray-300 transition-colors backdrop-blur-sm border border-white/20">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                    </a>
                    {/* Social Icon 2 (Generic Twitter/X) */}
                    <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-amber-500 hover:text-white text-gray-300 transition-colors backdrop-blur-sm border border-white/20">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Glow Effect on Hover */}
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-purple-600 rounded-3xl opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-500 -z-10"></div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const About = () => {
  const { t } = useTranslation();

  // Restore emojis for icons
  const features = [
    {
      title: t('about.mission'),
      text: t('about.missionText'),
      icon: '🎯',
    },
    {
      title: t('about.quality'),
      text: t('about.qualityText'),
      icon: '⭐',
    },
    {
      title: t('about.heritage'),
      text: t('about.heritageText'),
      icon: '🏛️',
    },
  ];

  return (
    <section id="about" className="section-container bg-injera-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="section-title text-injera-maroon drop-shadow-lg font-extrabold">{t('about.title')}</h2>
        <p className="section-subtitle text-coffee-brown font-medium">{t('about.subtitle')}</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-12">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="card-modern group bg-injera-white border border-accent-gray rounded-2xl shadow-lg p-6 hover:scale-105 hover:shadow-amber-glow transition-all duration-300"
          >
            <div className="text-5xl sm:text-6xl mb-4 sm:mb-6 transform group-hover:scale-110 transition-transform duration-300">
              {feature.icon}
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-injera-maroon mb-3 sm:mb-4 drop-shadow">
              {feature.title}
            </h3>
            <p className="text-coffee-brown leading-relaxed text-sm sm:text-base">{feature.text}</p>
          </motion.div>
        ))}
      </div>

      <TeamSection />
    </section>
  );
};

export default About;
