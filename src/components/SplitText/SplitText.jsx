import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './SplitText.css';

export default function SplitText({ text, className = '', delay = 0, stagger = 0.03 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const chars = containerRef.current.querySelectorAll('.split-char');
    gsap.set(chars, { opacity: 0, y: 20, rotateX: -90 });
    gsap.to(chars, {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: 0.6,
      stagger,
      delay,
      ease: 'back.out(1.7)',
    });
  }, [text, delay, stagger]);

  return (
    <span ref={containerRef} className={`split-text-container ${className}`}>
      {text.split('').map((char, i) => (
        <span key={i} className="split-char">
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}
