import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface FormData {
  name: string;
  email: string;
  phone: string;
  businessType: string;
  product: string;
  quantity: number;
  message: string;
}

const Contact = () => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // API call simulation
      await new Promise(resolve => setTimeout(resolve, 1500));
      // const response = await fetch(`${API_URL}/orders`, ...); 

      setSubmitStatus('success');
      reset();
    } catch (error) {
      console.error('Order submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative section-container py-24 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-tr from-sefed-sand/10 via-white to-injera-maroon/5 night-mode:from-transparent night-mode:via-transparent night-mode:to-transparent pointer-events-none -z-10 transition-colors duration-300" />
      
      {/* Pattern overlays - Using actual PNG images as overlays */}
      {/* Decorative corner patterns */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] opacity-20 pointer-events-none pattern-contact-corner-light night-mode:hidden -z-5" 
           style={{ 
             backgroundImage: 'url(/images 2/pattern white.png.png)', 
             backgroundRepeat: 'no-repeat', 
             backgroundSize: 'contain',
             mixBlendMode: 'multiply'
           }} />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] opacity-20 pointer-events-none pattern-contact-corner-dark hidden night-mode:block -z-5" 
           style={{ 
             backgroundImage: 'url(/images 2/pattern brown.png)', 
             backgroundRepeat: 'no-repeat', 
             backgroundSize: 'contain',
             mixBlendMode: 'overlay'
           }} />
      
      {/* Repeated background */}
      <div className="absolute inset-0 opacity-12 pointer-events-none pattern-contact-bg-light night-mode:hidden -z-5" 
           style={{ 
             backgroundImage: 'url(/images 2/pattern white.png.png)', 
             backgroundRepeat: 'repeat', 
             backgroundSize: '300px',
             mixBlendMode: 'soft-light'
           }} />
      <div className="absolute inset-0 opacity-15 pointer-events-none pattern-contact-bg-dark hidden night-mode:block -z-5" 
           style={{ 
             backgroundImage: 'url(/images 2/pattern brown.png)', 
             backgroundRepeat: 'repeat', 
             backgroundSize: '300px',
             mixBlendMode: 'soft-light'
           }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="text-center mb-16 relative z-10"
      >
        <span className="text-amber-glow font-bold tracking-widest text-sm uppercase mb-2 block">Get in Touch</span>
        <h2 className="section-title text-4xl md:text-5xl font-black text-ethiopian-earth mb-4">{t('contact.title')}</h2>
        <p className="text-lg text-coffee-brown/80 max-w-xl mx-auto font-light">{t('contact.subtitle')}</p>
      </motion.div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-5 gap-12 items-start">
        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="md:col-span-3 bg-white/70 backdrop-blur-xl border border-white/60 p-8 sm:p-10 rounded-3xl shadow-xl relative z-10"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-semibold text-ethiopian-earth ml-1">{t('contact.name')}</label>
                <input
                  id="name"
                  type="text"
                  {...register('name', { required: true })}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-glow/50 focus:border-amber-glow/50 transition-all"
                  placeholder="John Doe"
                />
                {errors.name && <p className="text-red-500 text-xs ml-1">Required</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-ethiopian-earth ml-1">{t('contact.email')}</label>
                <input
                  id="email"
                  type="email"
                  {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-glow/50 focus:border-amber-glow/50 transition-all"
                  placeholder="john@example.com"
                />
                {errors.email && <p className="text-red-500 text-xs ml-1">Valid email required</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-semibold text-ethiopian-earth ml-1">{t('contact.phone')}</label>
              <input
                id="phone"
                type="tel"
                {...register('phone')}
                className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-glow/50 focus:border-amber-glow/50 transition-all"
                placeholder="+251 ..."
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="businessType" className="text-sm font-semibold text-ethiopian-earth ml-1">{t('contact.businessType')}</label>
                <select
                  id="businessType"
                  {...register('businessType', { required: true })}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-glow/50 focus:border-amber-glow/50 transition-all"
                >
                  <option value="">{t('contact.businessTypePlaceholder')}</option>
                  <option value="hotel">{t('contact.hotel')}</option>
                  <option value="supermarket">{t('contact.supermarket')}</option>
                  <option value="retailer">{t('contact.retailer')}</option>
                  <option value="international">{t('contact.international')}</option>
                  <option value="other">{t('contact.other')}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="quantity" className="text-sm font-semibold text-ethiopian-earth ml-1">{t('contact.quantity')}</label>
                <input
                  id="quantity"
                  type="number"
                  min="1"
                  defaultValue={1}
                  {...register('quantity', { min: 1 })}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-glow/50 focus:border-amber-glow/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-semibold text-ethiopian-earth ml-1">{t('contact.message')}</label>
              <textarea
                id="message"
                rows={4}
                {...register('message')}
                className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-glow/50 focus:border-amber-glow/50 transition-all resize-none"
                placeholder={t('contact.messagePlaceholder')}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-ethiopian-earth to-injera-maroon text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t('contact.submitting')}
                </span>
              ) : t('contact.submit')}
            </button>

            {submitStatus === 'success' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 flex items-center gap-3">
                <span className="text-xl">✅</span> {t('contact.success')}
              </motion.div>
            )}
            {submitStatus === 'error' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-3">
                <span className="text-xl">⚠️</span> {t('contact.error')}
              </motion.div>
            )}
          </form>
        </motion.div>

        {/* Contact Info Card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="md:col-span-2 space-y-8 relative z-10"
        >
          <div className="bg-gradient-to-br from-ethiopian-earth to-injera-maroon text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
            {/* Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-glow/20 rounded-full blur-2xl -ml-10 -mb-10" />

            <h3 className="text-2xl font-bold mb-8">{t('contact.title')}</h3>

            <div className="space-y-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl shrink-0">📍</div>
                <div>
                  <h4 className="font-semibold text-white/90 text-sm uppercase tracking-wide mb-1">{t('contact.location')}</h4>
                  <p className="text-white/80 font-light">{t('contact.locationText')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl shrink-0">📧</div>
                <div>
                  <h4 className="font-semibold text-white/90 text-sm uppercase tracking-wide mb-1">{t('contact.emailLabel')}</h4>
                  <p className="text-white/80 font-light">info@safedinjera.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl shrink-0">📞</div>
                <div>
                  <h4 className="font-semibold text-white/90 text-sm uppercase tracking-wide mb-1">{t('contact.phone')}</h4>
                  <div className="space-y-1">
                    <a href="tel:+251922212161" className="block text-white/80 hover:text-white transition-colors">+251 92 221 2161</a>
                    <a href="tel:+251953866041" className="block text-white/80 hover:text-white transition-colors">+251 95 386 6041</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
