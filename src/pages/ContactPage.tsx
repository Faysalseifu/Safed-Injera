import { useState, useEffect } from 'react';
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

const ContactPage = () => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: data.name,
          email: data.email,
          phone: data.phone,
          businessType: data.businessType,
          product: data.product || 'Pure Teff Injera',
          quantity: data.quantity || 1,
          message: data.message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit order');
      }

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
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section className="relative gradient-hero pattern-overlay py-12 sm:py-16 md:py-20 overflow-hidden">
        {/* Pattern overlays - Using actual PNG images as overlays */}
        {/* Large decorative pattern */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] opacity-20 pointer-events-none pattern-contactpage-decor-light night-mode:hidden" 
             style={{ 
               backgroundImage: 'url(/images 2/pattern white.png.png)', 
               backgroundRepeat: 'no-repeat', 
               backgroundSize: 'contain',
               backgroundPosition: 'center top',
               mixBlendMode: 'overlay'
             }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] opacity-25 pointer-events-none pattern-contactpage-decor-dark hidden night-mode:block" 
             style={{ 
               backgroundImage: 'url(/images 2/pattern brown.png)', 
               backgroundRepeat: 'no-repeat', 
               backgroundSize: 'contain',
               backgroundPosition: 'center top',
               mixBlendMode: 'overlay'
             }} />
        
        {/* Repeated background */}
        <div className="absolute inset-0 opacity-12 pointer-events-none pattern-contactpage-bg-light night-mode:hidden" 
             style={{ 
               backgroundImage: 'url(/images 2/pattern white.png.png)', 
               backgroundRepeat: 'repeat', 
               backgroundSize: '280px',
               mixBlendMode: 'soft-light'
             }} />
        <div className="absolute inset-0 opacity-15 pointer-events-none pattern-contactpage-bg-dark hidden night-mode:block" 
             style={{ 
               backgroundImage: 'url(/images 2/pattern brown.png)', 
               backgroundRepeat: 'repeat', 
               backgroundSize: '280px',
               mixBlendMode: 'soft-light'
             }} />
        <div className="section-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center text-cloud-white"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              {t('contact.title')}
            </h1>
            <p className="text-lg sm:text-xl text-sefed-sand max-w-2xl mx-auto">
              {t('contact.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="section-container">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="card-modern"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-ethiopian-earth mb-6">
              Send us a Message
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="name" className="block text-ethiopian-earth font-semibold mb-2 text-sm sm:text-base">
                  {t('contact.name')}
                </label>
                <input
                  id="name"
                  type="text"
                  {...register('name', { required: true })}
                  className="w-full px-4 py-3 border-2 border-sefed-sand/30 rounded-lg focus:outline-none focus:border-ethiopian-earth transition-colors text-sm sm:text-base"
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">This field is required</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-ethiopian-earth font-semibold mb-2 text-sm sm:text-base">
                  {t('contact.email')}
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
                  className="w-full px-4 py-3 border-2 border-sefed-sand/30 rounded-lg focus:outline-none focus:border-ethiopian-earth transition-colors text-sm sm:text-base"
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1">Valid email is required</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-ethiopian-earth font-semibold mb-2 text-sm sm:text-base">
                  {t('contact.phone')}
                </label>
                <input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  placeholder="+251 9XX XXX XXXX"
                  className="w-full px-4 py-3 border-2 border-sefed-sand/30 rounded-lg focus:outline-none focus:border-ethiopian-earth transition-colors text-sm sm:text-base"
                />
              </div>

              <div>
                <label htmlFor="businessType" className="block text-ethiopian-earth font-semibold mb-2 text-sm sm:text-base">
                  {t('contact.businessType')}
                </label>
                <select
                  id="businessType"
                  {...register('businessType', { required: true })}
                  className="w-full px-4 py-3 border-2 border-sefed-sand/30 rounded-lg focus:outline-none focus:border-ethiopian-earth transition-colors text-sm sm:text-base"
                >
                  <option value="">{t('contact.businessTypePlaceholder')}</option>
                  <option value="hotel">{t('contact.hotel')}</option>
                  <option value="supermarket">{t('contact.supermarket')}</option>
                  <option value="retailer">{t('contact.retailer')}</option>
                  <option value="international">{t('contact.international')}</option>
                  <option value="other">{t('contact.other')}</option>
                </select>
                {errors.businessType && (
                  <p className="text-red-600 text-sm mt-1">Please select a business type</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="product" className="block text-ethiopian-earth font-semibold mb-2 text-sm sm:text-base">
                    {t('contact.product') || 'Product'}
                  </label>
                  <select
                    id="product"
                    {...register('product')}
                    className="w-full px-4 py-3 border-2 border-sefed-sand/30 rounded-lg focus:outline-none focus:border-ethiopian-earth transition-colors text-sm sm:text-base"
                  >
                    <option value="Pure Teff Injera">Pure Teff Injera</option>
                    <option value="Mixed Grain Injera">Mixed Grain Injera</option>
                    <option value="Premium Injera">Premium Injera</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="quantity" className="block text-ethiopian-earth font-semibold mb-2 text-sm sm:text-base">
                    {t('contact.quantity') || 'Quantity'}
                  </label>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    defaultValue={1}
                    {...register('quantity', { min: 1 })}
                    className="w-full px-4 py-3 border-2 border-sefed-sand/30 rounded-lg focus:outline-none focus:border-ethiopian-earth transition-colors text-sm sm:text-base"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-ethiopian-earth font-semibold mb-2 text-sm sm:text-base">
                  {t('contact.message')}
                </label>
                <textarea
                  id="message"
                  rows={4}
                  {...register('message')}
                  placeholder={t('contact.messagePlaceholder')}
                  className="w-full px-4 py-3 border-2 border-sefed-sand/30 rounded-lg focus:outline-none focus:border-ethiopian-earth transition-colors resize-none text-sm sm:text-base"
                />
              </div>

              {submitStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 bg-green-100 text-green-800 rounded-lg text-sm sm:text-base"
                >
                  {t('contact.success')}
                </motion.div>
              )}

              {submitStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 bg-red-100 text-red-800 rounded-lg text-sm sm:text-base"
                >
                  {t('contact.error')}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full text-base sm:text-lg py-3 sm:py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t('contact.submitting') : t('contact.submit')}
              </button>
            </form>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="gradient-primary rounded-xl p-6 sm:p-8 text-cloud-white h-fit"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">{t('contact.title')}</h2>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-base sm:text-lg">
                  <span>📍</span> {t('contact.location')}
                </h4>
                <p className="text-cloud-white/90 text-sm sm:text-base">{t('contact.locationText')}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-base sm:text-lg">
                  <span>📧</span> {t('contact.emailLabel')}
                </h4>
                <p className="text-cloud-white/90 text-sm sm:text-base">info@safedinjera.com</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-base sm:text-lg">
                  <span>📞</span> {t('contact.phone')}
                </h4>
                <div className="space-y-1">
                  <a href="tel:+251922212161" className="text-cloud-white/90 hover:text-sefed-sand transition-colors text-sm sm:text-base block">
                    +251 92 221 2161
                  </a>
                  <a href="tel:+251953866041" className="text-cloud-white/90 hover:text-sefed-sand transition-colors text-sm sm:text-base block">
                    +251 95 386 6041
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
