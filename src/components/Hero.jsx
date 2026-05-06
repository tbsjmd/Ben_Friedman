import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -200]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Abstract Background Elements - Subtle glass bubbles */}
      <motion.div 
        className="absolute top-0 right-0 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-white/10 rounded-full blur-[60px] md:blur-[80px] pointer-events-none opacity-40"
        animate={{
          x: [0, 50, 0],
          y: [0, -50, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        style={{ y: y1 }}
      />
      <motion.div 
        className="absolute bottom-0 left-0 w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-white/5 rounded-full blur-[60px] md:blur-[100px] pointer-events-none opacity-40"
        animate={{
          x: [0, -50, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        style={{ y: y2 }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ opacity }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-4 text-slate-900 leading-tight drop-shadow-sm">
            Ben Friedman
          </h1>
          <p className="text-lg md:text-xl text-slate-800 mb-10 max-w-2xl mx-auto leading-relaxed font-semibold">
            16 year old Graphic Designer
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#work" className="group relative px-8 py-3.5 bg-slate-900 text-white rounded-full font-bold overflow-hidden transition-transform hover:scale-105 shadow-lg">
              <span className="relative z-10 flex items-center gap-2">
                View My Work
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </a>
            
            <a href="#order" className="px-8 py-3.5 rounded-full font-bold text-slate-900 glass hover:bg-white/40 transition-colors border border-slate-400 shadow-sm">
              Order a Design
            </a>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        style={{ opacity }}
      >
        <span className="text-[10px] uppercase tracking-widest text-slate-800 font-bold">Scroll</span>
        <motion.div 
          className="w-px h-12 bg-gradient-to-b from-slate-600 to-transparent origin-top"
          animate={{ scaleY: [0, 1, 0], translateY: [0, 0, 20] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
