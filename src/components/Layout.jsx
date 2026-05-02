import { useEffect } from 'react';
import Lenis from 'lenis';
import Navigation from './Navigation';

export default function Layout({ children }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    // Handle smooth anchor scrolling
    const handleAnchorClick = (e) => {
      const target = e.currentTarget.getAttribute('href');
      if (target && target.startsWith('#')) {
        e.preventDefault();
        lenis.scrollTo(target);
      }
    };

    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(anchor => {
      anchor.addEventListener('click', handleAnchorClick);
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      anchors.forEach(anchor => {
        anchor.removeEventListener('click', handleAnchorClick);
      });
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <Navigation />
      <main className="relative w-full min-h-screen selection:bg-blue-200/50 selection:text-blue-900">
        {children}
      </main>
    </>
  );
}
