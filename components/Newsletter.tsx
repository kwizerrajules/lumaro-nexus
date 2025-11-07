import React, { useState } from 'react';

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage('Thank you for subscribing!');
        setEmail('');
      } else {
        setMessage('Subscription failed. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-900 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-4">Don't Miss Out!</h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
          Sign up now to get the latest updates, exclusive offers, and new house plan releases delivered to your inbox.
        </p>
        
        <form onSubmit={handleSubmit} className="max-w-md mx-auto flex gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            className="flex-1 px-6 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isSubmitting ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        {message && (
          <p className={`mt-6 text-lg ${message.includes('Thank you') ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Newsletter;