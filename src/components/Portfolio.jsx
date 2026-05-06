import { motion } from 'framer-motion';

const images = [
  "/images/1.jpg",
  "/images/2.jpg",
  "/images/3.jpg",
  "/images/4.jpg",
  "/images/5.jpg",
  "/images/6.jpg"
];

export default function Portfolio() {
  return (
    <section id="work" className="relative py-16 md:py-32 px-4 md:px-6 z-10 glass mt-10 rounded-3xl md:rounded-[3rem] mx-4 md:mx-10 border border-slate-300/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 drop-shadow-sm">Featured Work</h2>
          <p className="text-slate-800 text-lg font-medium">A selection of my recent designs.</p>
        </motion.div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {images.map((src, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index % 3 * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="relative group rounded-2xl overflow-hidden glass shadow-sm break-inside-avoid border border-slate-100"
            >
              <img
                src={src}
                alt={`Portfolio piece ${index + 1}`}
                loading="lazy"
                className="w-full h-auto object-cover opacity-95 group-hover:opacity-100 transition-opacity duration-500"
              />
              {/* Permanent Watermark Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none opacity-40">
                <div className="text-white font-black tracking-[0.3em] uppercase text-2xl md:text-3xl -rotate-45 whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] mix-blend-overlay">
                  BF GRAPHIX • BEN FRIEDMAN • BF GRAPHIX • BEN FRIEDMAN
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
