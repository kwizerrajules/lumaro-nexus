import React, { useState } from 'react';

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 🤚 POST endpoint to subscribe to newsletter
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
    <div className="bg-green-600 text-white py-12">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Don't Miss Out!</h2>
        <p className="text-green-100 mb-8 text-lg">
          Sign up now to get the latest updates and offers
        </p>
        
        <form onSubmit={handleSubmit} className="max-w-md mx-auto flex gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="flex-1 px-4 py-3 rounded-lg text-green-900 placeholder-green-400 focus:outline-none focus:ring-2 focus:ring-green-300"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-nude-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-nude-600 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        {message && (
          <p className={`mt-4 ${message.includes('Thank you') ? 'text-green-200' : 'text-red-200'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Newsletter;