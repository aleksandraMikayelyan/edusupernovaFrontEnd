/**
 * hooks/useInView.js — IntersectionObserver hook
 *
 * SRP: only responsible for detecting when an element enters the viewport.
 * Reused by Home, FeedbackPage, UserInterface for scroll animations.
 *
 * Usage:
 *   const [ref, inView] = useInView(0.2);
 *   <div ref={ref} style={{ opacity: inView ? 1 : 0 }}>...</div>
 */

import { useEffect, useRef, useState } from "react";

const useInView = (threshold = 0.15) => {
  const ref    = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    const el = ref.current;
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, inView];
};

export default useInView;