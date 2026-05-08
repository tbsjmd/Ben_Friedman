import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReCAPTCHA from 'react-google-recaptcha';

const TIERS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 15,
    desc: 'Quick & Simple Designs',
    features: ['Single design', '3-5 revisions', '24-hour delivery', 'Designed on procreate; PSD files available upon request'],
    popular: false
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 20,
    desc: 'Professional Logos & Designs',
    features: ['Single design', 'Unlimited revisions', '3-day delivery', 'Designed on procreate; PSD files available upon request'],
    popular: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 30,
    desc: 'Premium Quality Designs',
    features: ['3 designs', 'Unlimited revisions', '5-day delivery', 'Designed on procreate; PSD files available upon request'],
    popular: false
  }
];

export default function OrderSection() {
  const [step, setStep] = useState(1);
  const [selectedTier, setSelectedTier] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [details, setDetails] = useState('');
  
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0); // in percentage
  const [promoMessage, setPromoMessage] = useState('');
  const [showSnake, setShowSnake] = useState(false);
  const [showRickroll, setShowRickroll] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validPromoCodes, setValidPromoCodes] = useState([]);
  const [isLoadingPromos, setIsLoadingPromos] = useState(true);
  const [squareUrl, setSquareUrl] = useState('');
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [confirmingOrder, setConfirmingOrder] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef();

  // Developer Panel State
  const [showDevAuth, setShowDevAuth] = useState(false);
  const [devAuthPassword, setDevAuthPassword] = useState('');
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [devOrderNumber, setDevOrderNumber] = useState('');
  const [devPrice, setDevPrice] = useState('');
  const [devDetails, setDevDetails] = useState('');
  const [devGeneratedLink, setDevGeneratedLink] = useState('');
  
  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbyP_AbMlC7iFRIIHJUTpGCbEXJnB34KXkeocJxhfzRzTWrpHv2OZQ-DqZrPQLW5cya5Rw/exec');
        const data = await response.json();
        if (data.codes) {
          setValidPromoCodes(data.codes);
        }
      } catch (error) {
        console.error('Failed to fetch promo codes', error);
      } finally {
        setIsLoadingPromos(false);
      }
    };
    fetchPromos();
  }, []);

  // Check for Square redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('order_success');
    const orderId = urlParams.get('order_id');

    if (success === 'true' && orderId) {
      setStep(3);
      setConfirmingOrder(true);
      
      // Clean up URL without reloading
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Notify Apps Script to confirm order
      fetch('https://script.google.com/macros/s/AKfycbyP_AbMlC7iFRIIHJUTpGCbEXJnB34KXkeocJxhfzRzTWrpHv2OZQ-DqZrPQLW5cya5Rw/exec', {
        method: 'POST',
        body: JSON.stringify({ action: 'confirm_order', orderNumber: orderId }),
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        }
      })
      .then(res => res.json())
      .then(data => {
        setConfirmingOrder(false);
        setOrderConfirmed(true);
      })
      .catch(err => {
        console.error("Confirmation error:", err);
        setConfirmingOrder(false);
        setOrderConfirmed(true); // Still show success since Square paid
      });
    }
  }, []);

  const basePrice = selectedTier ? TIERS.find(t => t.id === selectedTier).price : 0;
  const finalPrice = basePrice * (1 - discount / 100);

  const applyPromoCode = () => {
    const code = promoCode.toUpperCase().trim();
    const lowerCode = code.toLowerCase();
    
    if (lowerCode === 'test') {
      setDiscount(100);
      setPromoMessage('Test code applied! 100% off.');
    } else if (lowerCode === 'teddyben123') {
      setShowDevAuth(true);
      setPromoCode('');
      setPromoMessage('');
    } else if (lowerCode === 'docmoms') {
      setDiscount(40);
      setPromoMessage('Docmoms code applied! 40% off.');
    } else if (lowerCode === 'rickroll') {
      setShowRickroll(true);
      setTimeout(() => setShowRickroll(false), 3000);
      setPromoCode('');
    } else if (lowerCode === 'snake') {
      setShowSnake(true);
      setPromoCode('');
    } else if (validPromoCodes.includes(code)) {
      setDiscount(20);
      setPromoMessage('Valid code applied! 20% off.');
    } else {
      setDiscount(0);
      setPromoMessage('Invalid or expired promo code.');
    }
  };

  const isFormValid = selectedTier && name.trim() !== '' && email.trim() !== '' && details.trim() !== '' && agreedToPolicy && recaptchaToken !== null;

  const handleNext = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      alert("Please fill in all details and select a package.");
      return;
    }

    setIsSubmitting(true);
    const orderData = {
      action: 'create_checkout',
      redirectUrl: window.location.origin + window.location.pathname,
      name,
      email,
      package: TIERS.find(t => t.id === selectedTier)?.name || 'Unknown',
      details,
      promoCode,
      total: finalPrice,
      recaptchaToken
    };

    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbyP_AbMlC7iFRIIHJUTpGCbEXJnB34KXkeocJxhfzRzTWrpHv2OZQ-DqZrPQLW5cya5Rw/exec', {
        method: 'POST',
        body: JSON.stringify(orderData),
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        }
      });
      
      const result = await response.json();
      console.log("Apps Script Response:", result);
      
      if (result.squareUrl) {
        setSquareUrl(result.squareUrl);
      }
      
      setStep(2);
    } catch (error) {
      console.error('Fetch Error:', error);
      setStep(2);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="order" className="relative py-16 md:py-32 px-4 md:px-6 z-10 mt-10">
      <div className="max-w-4xl mx-auto glass rounded-2xl md:rounded-3xl p-6 md:p-12 border border-slate-300/30">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 drop-shadow-sm">Order a Design</h2>
        </div>

        {step === 1 ? (
          <form onSubmit={handleNext} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800">Your Name</label>
                <input 
                  required 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-white/60 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors shadow-inner" 
                  placeholder="John Doe" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800">Your Email</label>
                <input 
                  required 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-white/60 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors shadow-inner" 
                  placeholder="john@example.com" 
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-800">Select Your Package</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {TIERS.map(tier => (
                  <div 
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`relative cursor-pointer rounded-2xl p-5 md:p-6 transition-all duration-300 border ${
                      selectedTier === tier.id 
                        ? 'bg-blue-50 border-blue-400 shadow-md scale-100 md:scale-105' 
                        : 'bg-white/50 border-slate-200 hover:border-slate-300 hover:bg-white/80'
                    }`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-3 right-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                        POPULAR
                      </div>
                    )}
                    <h3 className="text-xl font-bold mb-2 text-slate-900">{tier.name}</h3>
                    <div className="text-2xl font-black text-blue-700 mb-4 drop-shadow-sm">${tier.price}</div>
                    <ul className="space-y-2">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="text-xs text-slate-700 flex items-center gap-2 font-medium">
                          <span className="text-blue-600">✓</span> {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-800">Project Details</label>
              <textarea 
                required 
                rows={4} 
                value={details}
                onChange={e => setDetails(e.target.value)}
                className="w-full bg-white/60 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors shadow-inner" 
                placeholder="Tell me about your project..."
              ></textarea>
            </div>

            <div className="flex flex-col md:flex-row items-end gap-4 bg-white/40 p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex-1 space-y-2 w-full">
                <label className="text-sm font-semibold text-slate-800">Promo Code</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-blue-500 shadow-inner" 
                  />
                  <button type="button" onClick={applyPromoCode} disabled={isLoadingPromos} className="px-6 py-3 bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-colors font-bold shadow-md disabled:opacity-50">
                    {isLoadingPromos ? 'Loading...' : 'Apply'}
                  </button>
                </div>
                {promoMessage && <p className="text-sm text-blue-700 font-bold">{promoMessage}</p>}
              </div>
              
              <div className="flex-1 text-right w-full">
                <div className="text-sm text-slate-600 mb-1 font-semibold">Total</div>
                <div className="text-4xl font-black text-slate-900 drop-shadow-sm">
                  {discount > 0 && <span className="text-xl line-through text-slate-400 mr-3">${basePrice.toFixed(2)}</span>}
                  <span>${finalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Policy Checkbox + Dropdown */}
            <div className="space-y-3 pt-2">
              {/* View Policies Dropdown */}
              <div className="rounded-2xl border border-slate-200 bg-white/40 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setPolicyOpen(o => !o)}
                  className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-white/60 transition-colors"
                >
                  <span>View Policies</span>
                  <span className={`transition-transform duration-300 ${policyOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {policyOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-700 space-y-4 leading-relaxed border-t border-slate-200">
                    <div>
                      <p className="font-bold text-slate-900 mb-1">Delivery Policy</p>
                      <p>While I strive for 24-hour delivery on Basic packages, there may be circumstances where this isn't possible. In such cases, I will notify you as soon as possible, and you will have the option for a full refund if I haven't started the work. Once work begins, all sales are final as per my standard policy.</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 mb-1">Digital Delivery</p>
                      <p>All designs will be delivered to your attached email. If you don't receive any documents within the specified delivery timeframe, please check your junk mail. If you still haven't received anything then contact me at <a href="mailto:contact@bfgraphix.com" className="text-blue-600 font-semibold hover:underline">contact@bfgraphix.com</a>.</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 mb-1">Refund Policy</p>
                      <p>All sales are final once the design process has been started. In other words, refunds will be unavailable once your design has been started.</p>
                      <p className="mt-2">You can always contact me with any questions at <a href="mailto:contact@bfgraphix.com" className="text-blue-600 font-semibold hover:underline">contact@bfgraphix.com</a>. If you made a mistake while purchasing contact me and I will do my best to help.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Agreement Checkbox — Custom Animated */}
              <div
                className="flex items-center gap-4 cursor-pointer select-none group"
                onClick={() => setAgreedToPolicy(v => !v)}
              >
                {/* The custom checkbox box */}
                <motion.div
                  className="relative flex-shrink-0 w-7 h-7 rounded-lg border-2 transition-colors duration-200"
                  animate={{
                    borderColor: agreedToPolicy ? '#2563eb' : '#94a3b8',
                    backgroundColor: agreedToPolicy ? '#2563eb' : 'rgba(255,255,255,0.6)',
                    scale: agreedToPolicy ? [1, 1.2, 1] : 1,
                  }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  {/* Animated checkmark SVG */}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="absolute inset-0 w-full h-full p-1"
                  >
                    <motion.path
                      d="M5 13l4 4L19 7"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={agreedToPolicy
                        ? { pathLength: 1, opacity: 1 }
                        : { pathLength: 0, opacity: 0 }
                      }
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    />
                  </svg>
                </motion.div>

                <motion.span
                  animate={{ color: agreedToPolicy ? '#1e293b' : '#64748b' }}
                  transition={{ duration: 0.2 }}
                  className="text-sm font-semibold leading-snug"
                >
                  I have read and agree to the policies above
                </motion.span>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey="6LerxNUsAAAAAHGPNmM4yqluTLCzVQA-VXlerVer"
                onChange={token => setRecaptchaToken(token)}
                onExpired={() => setRecaptchaToken(null)}
              />
            </div>

            <div className="text-center pt-4">
              <button 
                type="submit" 
                disabled={!isFormValid || isSubmitting}
                className={`px-12 py-4 rounded-full font-bold text-lg transition-all shadow-lg ${
                  isFormValid && !isSubmitting
                    ? 'bg-blue-600 text-white hover:scale-105 hover:shadow-xl hover:bg-blue-700 cursor-pointer' 
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                }`}
              >
                {isSubmitting ? 'Processing...' : 'Continue'}
              </button>
            </div>
          </form>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col justify-center items-center py-12"
          >
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Complete Your Order</h3>
            <p className="text-slate-700 mb-8 font-semibold">Total: ${finalPrice.toFixed(2)}</p>
            
            {finalPrice === 0 ? (
              <button onClick={() => alert('Free order submitted!')} className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold shadow-lg hover:scale-105 transition-transform hover:bg-blue-700">
                Complete Free Order
              </button>
            ) : squareUrl ? (
              <div className="flex flex-col items-center gap-4">
                <a
                  href={squareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-12 py-4 rounded-full font-bold text-lg bg-[#006aff] text-white hover:scale-105 hover:shadow-xl transition-all shadow-lg"
                >
                  Pay ${finalPrice.toFixed(2)} with Square →
                </a>
                <p className="text-slate-500 text-xs font-medium">Secure checkout powered by Square</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-600 font-medium text-sm">Generating your checkout link...</p>
              </div>
            )}
            
            <button onClick={() => setStep(1)} className="mt-8 text-slate-500 hover:text-slate-800 font-bold underline text-sm">
              ← Back to Details
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col justify-center items-center py-16 text-center"
          >
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-4xl font-black text-slate-900 mb-4 drop-shadow-sm">Payment Successful!</h3>
            
            {confirmingOrder ? (
              <div className="flex flex-col items-center gap-3 mt-4">
                <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-600 font-medium">Finalizing your order...</p>
              </div>
            ) : orderConfirmed ? (
              <div className="space-y-4 mt-2">
                <p className="text-lg text-slate-700 font-medium max-w-md mx-auto">
                  Your order is confirmed and I've received your payment. 
                  Check your email for your confirmation and next steps!
                </p>
                <div className="pt-6">
                  <button 
                    onClick={() => {
                      setStep(1);
                      setOrderConfirmed(false);
                      setName('');
                      setEmail('');
                      setDetails('');
                      setSelectedTier(null);
                      setPromoCode('');
                      setDiscount(0);
                      setAgreedToPolicy(false);
                    }}
                    className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-all hover:scale-105 shadow-lg"
                  >
                    Start a New Project
                  </button>
                </div>
              </div>
            ) : (
               <p className="text-slate-600 font-medium mt-4">Something went wrong finalizing, but your payment was received. I will contact you shortly.</p>
            )}
          </motion.div>
        )}
      </div>

      {/* Rickroll Overlay */}
      <AnimatePresence>
        {showRickroll && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black flex items-center justify-center"
          >
            <h1 className="text-6xl text-red-500 font-black animate-pulse">bro really thought 💀</h1>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Snake Overlay Placeholder */}
      <AnimatePresence>
        {showSnake && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] glass flex items-center justify-center flex-col text-slate-900"
          >
            <h2 className="text-2xl font-bold mb-4 text-slate-900">Snake Game Disabled</h2>
            <p className="mb-6 font-semibold">But here's 50% off anyway!</p>
            <button 
              onClick={() => {
                setDiscount(50);
                setShowSnake(false);
                setPromoMessage('Snake code applied! 50% off.');
              }} 
              className="px-6 py-3 bg-blue-600 text-white rounded-full font-bold shadow-lg hover:bg-blue-700 transition-colors"
            >
              Claim Discount
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dev Auth Overlay */}
      <AnimatePresence>
        {showDevAuth && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] glass flex items-center justify-center flex-col text-slate-900"
          >
            <div className="bg-white/80 p-8 rounded-3xl shadow-2xl max-w-sm w-full border border-slate-300">
              <h2 className="text-2xl font-bold mb-4">Developer Access</h2>
              <input 
                type="password" 
                value={devAuthPassword}
                onChange={e => setDevAuthPassword(e.target.value)}
                placeholder="Enter Password"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:border-blue-500"
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    if (devAuthPassword === 'waiter2026') {
                      setShowDevPanel(true);
                      setShowDevAuth(false);
                      setDevAuthPassword('');
                    } else {
                      alert('Incorrect password');
                    }
                  }} 
                  className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800"
                >
                  Unlock
                </button>
                <button onClick={() => setShowDevAuth(false)} className="flex-1 py-3 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dev Panel Overlay */}
      <AnimatePresence>
        {showDevPanel && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] glass flex items-center justify-center text-slate-900 px-4 overflow-y-auto"
          >
            <div className="bg-white/90 p-8 rounded-3xl shadow-2xl max-w-md w-full border border-slate-300 my-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-700">Custom Payment Link</h2>
                <button onClick={() => { setShowDevPanel(false); setDevGeneratedLink(''); }} className="text-slate-400 hover:text-slate-900 text-xl font-bold">✕</button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold">Order Number</label>
                  <input type="text" value={devOrderNumber} onChange={e => setDevOrderNumber(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 mt-1" />
                </div>
                <div>
                  <label className="text-sm font-semibold">Additional Price ($)</label>
                  <input type="number" value={devPrice} onChange={e => setDevPrice(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 mt-1" />
                </div>
                <div>
                  <label className="text-sm font-semibold">Details / Reason</label>
                  <textarea rows={3} value={devDetails} onChange={e => setDevDetails(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 mt-1"></textarea>
                </div>
                
                <button 
                  onClick={() => {
                    if (!devOrderNumber || !devPrice || !devDetails) return alert('Fill all fields');
                    const link = `${window.location.origin}${window.location.pathname}?payment_order=${encodeURIComponent(devOrderNumber)}&price=${encodeURIComponent(devPrice)}&details=${encodeURIComponent(devDetails)}`;
                    setDevGeneratedLink(link);
                  }}
                  className="w-full py-3 mt-2 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700"
                >
                  Generate Link
                </button>
                
                {devGeneratedLink && (
                  <div className="mt-6 p-4 bg-slate-100 rounded-xl border border-slate-200">
                    <p className="text-xs font-semibold mb-2 text-slate-600">Generated Link:</p>
                    <input type="text" readOnly value={devGeneratedLink} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm mb-3" />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(devGeneratedLink);
                        alert('Copied to clipboard!');
                      }}
                      className="w-full py-2 bg-slate-900 text-white rounded-lg text-sm font-bold"
                    >
                      Copy Link
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
