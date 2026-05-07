import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function AdditionalPayment() {
  const [orderNumber, setOrderNumber] = useState('');
  const [price, setPrice] = useState(0);
  const [details, setDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [squareUrl, setSquareUrl] = useState('');
  const [step, setStep] = useState(1);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [confirmingOrder, setConfirmingOrder] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pOrder = urlParams.get('payment_order');
    const pPrice = urlParams.get('price');
    const pDetails = urlParams.get('details');
    const success = urlParams.get('additional_success');

    if (pOrder) setOrderNumber(pOrder);
    if (pPrice) setPrice(parseFloat(pPrice));
    if (pDetails) setDetails(decodeURIComponent(pDetails));

    if (success === 'true' && pOrder) {
      setStep(3);
      setConfirmingOrder(true);
      
      // Clean up URL without reloading
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Notify Apps Script to confirm additional order
      fetch('https://script.google.com/macros/s/AKfycby3MnATGGFyTlFWpk2uMXkjGpWGbZOym-6mvEQZm7Fcp3aQB97JJPDefV1-pS9Qfivr/exec', {
        method: 'POST',
        body: JSON.stringify({ action: 'confirm_additional', orderNumber: pOrder, amount: pPrice }),
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

  const handleGenerateCheckout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycby3MnATGGFyTlFWpk2uMXkjGpWGbZOym-6mvEQZm7Fcp3aQB97JJPDefV1-pS9Qfivr/exec', {
        method: 'POST',
        body: JSON.stringify({
          action: 'create_additional_checkout',
          redirectUrl: window.location.origin + window.location.pathname + '?payment_order=' + orderNumber + '&price=' + price,
          orderNumber,
          total: price,
          details
        }),
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        }
      });
      
      const result = await response.json();
      if (result.squareUrl) {
        setSquareUrl(result.squareUrl);
        setStep(2);
      } else {
        alert("Error generating payment link: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      alert("Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 px-6">
      <div className="max-w-2xl w-full mx-auto glass rounded-3xl p-8 md:p-12 border border-slate-300/30">
        
        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 drop-shadow-sm">Additional Payment</h2>
            <p className="text-xl text-slate-700 mb-2">Order #{orderNumber}</p>
            <div className="text-5xl font-black text-blue-600 mb-8">${price.toFixed(2)}</div>
            
            <div className="bg-white/50 rounded-2xl p-6 text-left mb-8 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-2">Details:</h3>
              <p className="text-slate-700 whitespace-pre-wrap">{details}</p>
            </div>

            <button 
              onClick={handleGenerateCheckout}
              disabled={isLoading}
              className={`w-full py-4 rounded-full font-bold text-lg transition-all shadow-lg ${
                isLoading ? 'bg-slate-300 text-slate-500' : 'bg-slate-900 text-white hover:scale-105 hover:bg-slate-800 cursor-pointer'
              }`}
            >
              {isLoading ? 'Preparing Checkout...' : 'Pay with Square'}
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Complete Your Payment</h3>
            <a
              href={squareUrl}
              className="px-12 py-4 rounded-full font-bold text-lg bg-[#006aff] text-white hover:scale-105 hover:shadow-xl transition-all shadow-lg"
            >
              Pay ${price.toFixed(2)} with Square →
            </a>
            <button onClick={() => setStep(1)} className="mt-8 text-slate-500 hover:text-slate-800 font-bold underline text-sm">
              ← Back
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-8 text-center">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-4xl font-black text-slate-900 mb-4">Payment Successful!</h3>
            
            {confirmingOrder ? (
              <p className="text-slate-600 font-medium">Finalizing your payment...</p>
            ) : orderConfirmed ? (
              <p className="text-lg text-slate-700 font-medium max-w-md mx-auto">
                Thank you! Your additional payment for Order #{orderNumber} has been received. You will receive a confirmation email shortly.
              </p>
            ) : (
              <p className="text-slate-600 font-medium mt-4">Something went wrong finalizing, but your payment was received. Ben will contact you shortly.</p>
            )}
            
            <a href="/" className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-full font-bold shadow-lg hover:scale-105 transition-transform inline-block">
              Return Home
            </a>
          </motion.div>
        )}

      </div>
    </div>
  );
}
