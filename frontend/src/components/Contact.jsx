import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, Loader2, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Contact = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        alert(t('contact.form_error'));
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(t('contact.form_error'));
    } finally {
      setSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      label: t('contact.address'),
      value: 'ul. Boryny 3, 02-257 Warszawa',
      href: 'https://maps.google.com/?q=ul.+Boryny+3,+02-257+Warszawa',
    },
    {
      icon: Phone,
      label: t('contact.phone'),
      value: '+48 732 099 201',
      href: 'tel:+48732099201',
    },
    {
      icon: Mail,
      label: t('contact.email'),
      value: 'wmsauna@gmail.com',
      href: 'mailto:wmsauna@gmail.com',
    },
    {
      icon: Clock,
      label: t('contact.hours'),
      value: t('contact.hours_value'),
      href: null,
    },
  ];

  return (
    <section
      id="contact"
      data-testid="contact-section"
      className="section-spacing bg-[#F9F9F7]"
    >
      <div className="container-main">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="gold-line mx-auto mb-6" />
          <h2 className="section-title" data-testid="contact-title">
            {t('contact.title')}
          </h2>
          <p className="section-subtitle mx-auto">{t('contact.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white p-8 border border-black/5"
          >
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle size={64} className="text-[#4A6741] mb-4" />
                <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">
                  {t('contact.form_success')}
                </h3>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                    {t('contact.form_name')} *
                  </label>
                  <input
                    type="text"
                    data-testid="contact-name-input"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="input-custom"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                      {t('contact.form_email')} *
                    </label>
                    <input
                      type="email"
                      data-testid="contact-email-input"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="input-custom"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                      {t('contact.form_phone')} *
                    </label>
                    <input
                      type="tel"
                      data-testid="contact-phone-input"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="input-custom"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                    {t('contact.form_message')}
                  </label>
                  <textarea
                    data-testid="contact-message-input"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    rows={5}
                    className="input-custom resize-none"
                  />
                </div>

                <button
                  type="submit"
                  data-testid="contact-submit-btn"
                  disabled={submitting}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                  {t('contact.form_submit')}
                </button>
              </form>
            )}
          </motion.div>

          {/* Contact Info & Map */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Contact Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contactInfo.map((item, index) => (
                <div
                  key={index}
                  className="bg-white p-6 border border-black/5 hover:border-[#C6A87C]/30 transition-colors duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#C6A87C]/10 flex items-center justify-center flex-shrink-0">
                      <item.icon size={20} className="text-[#C6A87C]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#8C8C8C] uppercase tracking-wider mb-1">
                        {item.label}
                      </p>
                      {item.href ? (
                        <a
                          href={item.href}
                          target={item.href.startsWith('http') ? '_blank' : undefined}
                          rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="text-sm font-medium text-[#1A1A1A] hover:text-[#C6A87C] transition-colors duration-200"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-[#1A1A1A]">
                          {item.value}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Map */}
            <div className="bg-[#F2F2F0] aspect-[4/3] overflow-hidden">
              <iframe
                title="WM-Sauna Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2444.5!2d20.95!3d52.2!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTLCsDEyJzAwLjAiTiAyMMKwNTcnMDAuMCJF!5e0!3m2!1spl!2spl!4v1700000000000!5m2!1spl!2spl"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                data-testid="contact-map"
              />
            </div>

            {/* Company Info */}
            <div className="bg-white p-6 border border-black/5">
              <h4 className="font-semibold text-[#1A1A1A] mb-3">
                W.M. GROUP Sp. z o.o.
              </h4>
              <p className="text-sm text-[#595959] space-y-1">
                <span className="block">NIP: 9512561195</span>
                <span className="block">REGON: 52438914000000</span>
                <span className="block">ul. Boryny 3, 02-257 Warszawa</span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
