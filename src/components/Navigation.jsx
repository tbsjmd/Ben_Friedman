import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);

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
    </motion.header>
  );
}
