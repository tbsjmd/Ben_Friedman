import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'py-4' : 'py-8'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className={`flex items-center justify-between rounded-2xl px-6 py-4 transition-all duration-500 ${
          scrolled ? 'glass-dark' : 'bg-transparent'
        }`}>
          <a href="#" className="flex items-center gap-2">
            <img src="/images/tab.png" alt="BF Logo" className="w-10 h-10 object-contain rounded-lg shadow-sm" />
          </a>
          
          <button 
            className="md:hidden text-slate-800 hover:text-black transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <nav className="hidden md:block">
            <ul className="flex items-center gap-8">
              <li>
                <a href="#home" className="text-sm font-semibold text-slate-800 hover:text-black transition-colors">Home</a>
              </li>
              <li>
                <a href="#work" className="text-sm font-semibold text-slate-800 hover:text-black transition-colors">Portfolio</a>
              </li>
              <li>
                <a href="#contact" className="text-sm font-semibold text-slate-800 hover:text-black transition-colors">Contact</a>
              </li>
              <li>
                <a href="#order" className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-bold hover:scale-105 transition-transform shadow-lg">
                  Order Now
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 w-full px-6 mt-2"
          >
            <div className="glass-dark rounded-2xl p-6 flex flex-col gap-4 shadow-xl border border-white/20">
              <a href="#home" onClick={() => setMobileMenuOpen(false)} className="text-base font-semibold text-slate-800 hover:text-black transition-colors">Home</a>
              <a href="#work" onClick={() => setMobileMenuOpen(false)} className="text-base font-semibold text-slate-800 hover:text-black transition-colors">Portfolio</a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="text-base font-semibold text-slate-800 hover:text-black transition-colors">Contact</a>
              <a href="#order" onClick={() => setMobileMenuOpen(false)} className="mt-2 text-center py-3 rounded-full bg-slate-900 text-white text-sm font-bold shadow-md">
                Order Now
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
