import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './FallingText.css';

export default function FallingText({ text, className = '', delay = 0, stagger = 0.04 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const chars = containerRef.current.querySelectorAll('.falling-char');
    gsap.set(chars, { opacity: 0, y: -80 });
    gsap.to(chars, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      stagger,
      delay,
      ease: 'bounce.out',
    });
  }, [text, delay, stagger]);

  return (
    <span ref={containerRef} className={`falling-text-container ${className}`}>
      {text.split('').map((char, i) => (
        <span key={i} className="falling-char">
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}
