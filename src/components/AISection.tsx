import { motion } from 'framer-motion';

const AISection = () => {
    return (
        <section className="relative py-20 overflow-hidden bg-gradient-to-b from-gray-900 to-coffee-brown text-white">
            {/* Background Elements */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-amber-500 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-amber-700 rounded-full blur-[120px]" />
            </div>

            <div className="section-container relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="space-y-6"
                    >
                        <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 font-semibold text-sm tracking-wide">
                            Future of Injera
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                            Preserving Quality with <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Smart Technology</span>
                        </h2>

                        <p className="text-lg text-gray-300 leading-relaxed">
                            At Safed Injera, we protect the tradition behind real teff injera while producing at scale. Smart sensors track fermentation temperature and timing to keep the starter culture stable, so every injera comes out with the same aroma, softness, and signature “eyes”.
                        </p>

                        <div className="space-y-4 pt-4">
                            {[
                                "Automated Fermentation Temperature Control",
                                "Real-time Fermentation Timing & Stability",
                                "Consistent Taste, Texture, and 'Eyes'",
                            ].map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 + (index * 0.1) }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-gray-200 font-medium">{item}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Visual/Image Side */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="relative z-10 rounded-2xl overflow-hidden glass-panel p-2 bg-white/5 border border-white/10 backdrop-blur-sm">
                            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center relative overflow-hidden group">
                                {/* Abstract tech visualization since we might not have a specific image */}
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:scale-105 transition-transform duration-700"></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>

                                <div className="relative z-20 text-center p-6">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-amber-500/20 backdrop-blur-md flex items-center justify-center border border-amber-500/40">
                                        <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                        </svg>
                                    </div>
                                    <div className="text-2xl font-bold text-white mb-1">Smart Analytics</div>
                                    <div className="text-amber-400 font-mono text-sm">Real-time Monitoring Active</div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative circles */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/30 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl delay-1000 animate-pulse" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default AISection;
