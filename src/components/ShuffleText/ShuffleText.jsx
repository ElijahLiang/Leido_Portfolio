import { useEffect, useRef, useState } from 'react';
import './ShuffleText.css';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*✦𖥔˖🛸🪐';

export default function ShuffleText({ text, className = '', speed = 30, delay = 0 }) {
  const [display, setDisplay] = useState('');
  const intervalRef = useRef(null);

  useEffect(() => {
    let iteration = 0;
    const timeout = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setDisplay(
          text
            .split('')
            .map((char, idx) => {
              if (char === ' ') return ' ';
              if (idx < iteration) return text[idx];
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            })
            .join('')
        );
        iteration += 1 / 3;
        if (iteration >= text.length) {
          clearInterval(intervalRef.current);
          setDisplay(text);
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(timeout);
      clearInterval(intervalRef.current);
    };
  }, [text, speed, delay]);

  return <span className={`shuffle-text ${className}`}>{display || text}</span>;
}
