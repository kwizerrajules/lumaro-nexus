'use client';
import React, { useState } from 'react';
import {
  EnvelopeSimple,
  Phone,
  MapPin,
  Clock,
} from '@phosphor-icons/react';

const ContactUs: React.FC = () => {
  const [form, setForm] = useState({
    names: '',
    email: '',
    subject: '',
    phone: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback('');

    const messageBody = form.subject
      ? `Subject: ${form.subject}\n\n${form.message}`
      : form.message;

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          names: form.names,
          email: form.email,
          phone: form.phone || undefined,
          message: messageBody,
        }),
      });

      if (response.ok) {
        setFeedback('Your message has been sent successfully.');
        setForm({ names: '', email: '', subject: '', phone: '', message: '' });
      } else {
        setFeedback('Sending failed. Please try again.');
      }
    } catch {
      setFeedback('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactCards = [
    {
      label: 'Email',
      value: 'info@lumaronexus.com',
      href: 'mailto:info@lumaronexus.com',
      icon: EnvelopeSimple,
    },
    {
      label: 'Phone',
      value: '+250 791 756 343',
      href: 'https://wa.me/250791756343',
      icon: Phone,
    },
    {
      label: 'Location',
      value: 'Kigali, Rwanda',
      href: undefined,
      icon: MapPin,
    },
    {
      label: 'Availability',
      value: 'Mon–Fri, 9:00 AM – 4:00 PM GMT+3',
      href: undefined,
      icon: Clock,
    },
  ];

  const inputClass =
    'w-full rounded-lg bg-[#0d0d0d] border border-white/10 px-4 py-3.5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-600/60 focus:border-amber-600/40 transition';

  return (
    <section
      id="contact-form"
      className="relative overflow-hidden bg-[#050505] text-white py-20"
    >
      {/* Ambient brand glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 20% 40%, rgba(180, 83, 9, 0.18), transparent 55%), radial-gradient(ellipse 50% 40% at 85% 70%, rgba(234, 88, 12, 0.12), transparent 50%)',
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-5xl font-semibold mb-3 tracking-tight">
            Contact Us
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto leading-relaxed">
            Have questions about a house plan or a custom design? Send us a message — we&apos;re here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {/* Form panel */}
          <div className="lg:col-span-3 rounded-2xl bg-[#141414] border border-white/5 p-6 md:p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="contact-names"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Your Name
                  </label>
                  <input
                    id="contact-names"
                    type="text"
                    name="names"
                    value={form.names}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Your Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Subject
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Project Inquiry"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Tell us about your project..."
                  required
                  rows={6}
                  className={`${inputClass} resize-y min-h-[140px]`}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-amber-700 hover:bg-amber-600 text-white font-semibold py-3.5 px-6 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>

              {feedback && (
                <p
                  className={`text-sm text-center ${
                    feedback.includes('successfully')
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  }`}
                  role="status"
                >
                  {feedback}
                </p>
              )}
            </form>
          </div>

          {/* Info cards */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {contactCards.map((card) => {
              const Icon = card.icon;
              const content = (
                <>
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-amber-700/90 flex items-center justify-center shadow-lg shadow-amber-900/30">
                    <Icon size={22} weight="fill" className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-widest text-amber-500/90 uppercase mb-1">
                      {card.label}
                    </p>
                    <p className="text-white font-medium text-sm md:text-base break-words">
                      {card.value}
                    </p>
                  </div>
                </>
              );

              const className =
                'flex items-center gap-4 rounded-2xl bg-[#141414] border border-white/5 p-5 hover:border-amber-700/40 transition-colors';

              return card.href ? (
                <a
                  key={card.label}
                  href={card.href}
                  target={card.href.startsWith('http') ? '_blank' : undefined}
                  rel={card.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className={className}
                >
                  {content}
                </a>
              ) : (
                <div key={card.label} className={className}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
