import React, { useState } from 'react'

const ContactUs: React.FC = () => {
  const [form, setForm] = useState({
    names: '',
    email: '',
    phone: '',
    message: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFeedback('')

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      })

      if (response.ok) {
        setFeedback('Your message has been sent successfully.')
        setForm({ names: '', email: '', phone: '', message: '' })
      } else {
        setFeedback('Sending failed. Please try again.')
      }
    } catch {
      setFeedback('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-gray-900 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-4">Contact Us</h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
          Have questions or need assistance? Send us a message. We're here to help.
        </p>

        <form
          onSubmit={handleSubmit}
          className="max-w-xl mx-auto space-y-5 text-left"
        >
          <input
            type="text"
            name="names"
            value={form.names}
            onChange={handleChange}
            placeholder="Your full name"
            required
            className="w-full px-5 py-4 rounded-lg text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
          />

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email address"
            required
            className="w-full px-5 py-4 rounded-lg text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
          />

          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone number (optional)"
            className="w-full px-5 py-4 rounded-lg text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
          />

          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Your message"
            required
            rows={5}
            className="w-full px-5 py-4 rounded-lg text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>

        {feedback && (
          <p
            className={`mt-6 text-lg ${
              feedback.includes('successfully') ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {feedback}
          </p>
        )}
      </div>
    </div>
  )
}

export default ContactUs
