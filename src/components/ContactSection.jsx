import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import ReCAPTCHA from 'react-google-recaptcha';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyP_AbMlC7iFRIIHJUTpGCbEXJnB34KXkeocJxhfzRzTWrpHv2OZQ-DqZrPQLW5cya5Rw/exec';

export default function ContactSection() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef();

  const isFormValid = name.trim() !== '' && email.trim() !== '' && message.trim() !== '' && recaptchaToken !== null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSending(true);
    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          type: 'contact',
          name,
          email,
          message,
          recaptchaToken
        }),
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        }
      });
      setSent(true);
      setName('');
      setEmail('');
      setMessage('');
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setRecaptchaToken(null);
    } catch (error) {
      console.error('Contact form error:', error);
      alert('Something went wrong. Please try emailing directly.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section id="contact" className="relative py-32 px-6 z-10 mt-10">
      <div className="max-w-2xl mx-auto glass rounded-3xl p-8 md:p-12 border border-slate-300/30">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 drop-shadow-sm">Contact Me</h2>
        </div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="text-5xl mb-4">✉️</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h3>
            <p className="text-slate-700 font-medium mb-6">I'll get back to you as soon as possible.</p>
            <button
              onClick={() => setSent(false)}
              className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold hover:scale-105 transition-transform shadow-lg hover:bg-blue-700"
            >
              Send Another
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSend} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-800">Name</label>
              <input
                required
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-white/60 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-800">Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-white/60 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-800">Message</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full bg-white/60 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
                placeholder="What's on your mind?"
              ></textarea>
            </div>

            <div className="flex justify-center pt-2">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey="6LerxNUsAAAAAHGPNmM4yqluTLCzVQA-VXlerVer"
                onChange={token => setRecaptchaToken(token)}
                onExpired={() => setRecaptchaToken(null)}
              />
            </div>

            <div className="text-center pt-4 space-y-3">
              <button
                type="submit"
                disabled={!isFormValid || isSending}
                className={`px-12 py-4 rounded-full font-bold text-lg transition-all shadow-lg ${
                  isFormValid && !isSending
                    ? 'bg-blue-600 text-white hover:scale-105 hover:shadow-xl hover:bg-blue-700 cursor-pointer'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                }`}
              >
                {isSending ? 'Sending...' : 'Send'}
              </button>
              <p className="text-slate-600 text-sm font-medium">
                Or email <a href="mailto:benfriedman30@gmail.com" className="text-slate-900 font-bold hover:underline">benfriedman30@gmail.com</a>
              </p>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
