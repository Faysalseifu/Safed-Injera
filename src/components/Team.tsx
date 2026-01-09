import { motion } from 'framer-motion';

const Team = () => {
    const team = [
        {
            name: "Sead Nurahmed",
            role: "CEO",
            description: "Visionary leader driving Safed Injera's mission to globalize Ethiopian cuisine.",
            image: "https://ui-avatars.com/api/?name=Sead+Nurahmed&background=5A0F12&color=fff&size=200", // Placeholder
            color: "from-injera-maroon to-ethiopian-earth"
        },
        {
            name: "Yenus Ahmed",
            role: "Marketing Manager",
            description: "expert strategist connecting our premium products with businesses worldwide.",
            image: "https://ui-avatars.com/api/?name=Yenus+Ahmed&background=B56A3A&color=fff&size=200",
            color: "from-amber-glow to-sefed-sand"
        },
        {
            name: "Suhayb Murad",
            role: "Technical Team & QA",
            description: "Ensuring excellence in production technology and rigorous quality standards.",
            image: "https://ui-avatars.com/api/?name=Suhayb+Murad&background=2C3E50&color=fff&size=200",
            color: "from-slate-700 to-slate-900"
        }
    ];

    return (
        <section className="section-container py-20">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
            >
                <span className="text-amber-glow font-bold tracking-widest text-sm uppercase mb-2 block">The Minds Behind Safed</span>
                <h2 className="section-title text-4xl md:text-5xl font-black text-ethiopian-earth">Meet Our Team</h2>
                <p className="text-sefed-sand text-lg max-w-2xl mx-auto mt-4">
                    Dedicated professionals working together to deliver the best authentic injera to your table.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 px-4">
                {team.map((member, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: index * 0.2 }}
                        className="group relative h-[400px] w-full perspective-1000"
                    >
                        <div className="relative w-full h-full transition-all duration-500 transform-style-3d group-hover:rotate-y-180">
                            {/* Front Side */}
                            <div className="absolute inset-0 w-full h-full bg-white rounded-2xl shadow-xl overflow-hidden backface-hidden flex flex-col items-center justify-center p-6 border border-gray-100">
                                <div className={`absolute top-0 w-full h-32 bg-gradient-to-br ${member.color} opacity-10`}></div>
                                <div className="relative z-10 w-32 h-32 rounded-full p-1 bg-gradient-to-br from-amber-glow to-transparent mb-6">
                                    <img
                                        src={member.image}
                                        alt={member.name}
                                        className="w-full h-full rounded-full object-cover border-4 border-white shadow-md"
                                    />
                                </div>
                                <h3 className="text-2xl font-bold text-ethiopian-earth mb-2">{member.name}</h3>
                                <p className="text-amber-glow font-medium uppercase tracking-wide text-sm">{member.role}</p>

                                <div className="absolute bottom-6 opacity-0 group-hover:opacity-0 transition-opacity">
                                    <span className="text-xs text-gray-400">Hover to learn more</span>
                                </div>
                            </div>

                            {/* Back Side */}
                            <div className={`absolute inset-0 w-full h-full bg-gradient-to-br ${member.color} rounded-2xl shadow-xl overflow-hidden backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8 text-white text-center`}>
                                <h3 className="text-2xl font-bold mb-2">{member.name}</h3>
                                <p className="text-white/80 font-medium mb-6 uppercase text-sm border-b border-white/20 pb-2">{member.role}</p>
                                <p className="text-lg leading-relaxed font-light">
                                    "{member.description}"
                                </p>

                                <div className="mt-8 flex gap-4 justify-center">
                                    <motion.div whileHover={{ scale: 1.2 }} className="cursor-pointer bg-white/20 p-2 rounded-full backdrop-blur-sm">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                                    </motion.div>
                                    <motion.div whileHover={{ scale: 1.2 }} className="cursor-pointer bg-white/20 p-2 rounded-full backdrop-blur-sm">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default Team;
