import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import './CircularGallery.css';

const RADIUS = 420;
const CARD_W = 340;
const CARD_H = 255;

export default function CircularGallery({ cards, onCardClick }) {
  const ringRef = useRef(null);
  const rotRef = useRef(0);
  const drag = useRef({ active: false, lastX: 0 });

  useEffect(() => {
    const SPEED = 0.07;
    const tick = () => {
      if (!drag.current.active) {
        rotRef.current += SPEED;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `rotateY(${rotRef.current}deg)`;
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  const onMouseDown = useCallback((e) => {
    drag.current = { active: true, lastX: e.clientX };
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.lastX;
    rotRef.current += dx * 0.45;
    drag.current.lastX = e.clientX;
  }, []);

  const onMouseUp = useCallback(() => {
    drag.current.active = false;
  }, []);

  const onTouchStart = useCallback((e) => {
    drag.current = { active: true, lastX: e.touches[0].clientX };
  }, []);

  const onTouchMove = useCallback((e) => {
    if (!drag.current.active) return;
    const dx = e.touches[0].clientX - drag.current.lastX;
    rotRef.current += dx * 0.45;
    drag.current.lastX = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback(() => {
    drag.current.active = false;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  const angleStep = 360 / cards.length;

  return (
    <div
      className="cg-scene"
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="cg-ring" ref={ringRef}>
        {cards.map((card, i) => (
          <div
            key={card.key}
            className="cg-card"
            style={{
              width: CARD_W,
              height: CARD_H,
              marginLeft: -CARD_W / 2,
              marginTop: -CARD_H / 2,
              transform: `rotateY(${i * angleStep}deg) translateZ(${RADIUS}px)`,
            }}
            onClick={() => onCardClick?.(i)}
          >
            <img src={card.img} alt={card.title} className="cg-card-img" />
            <div className="cg-card-overlay">
              <span className="cg-card-icon">{card.icon}</span>
              <h3 className="cg-card-title">{card.title}</h3>
              <p className="cg-card-desc">{card.desc}</p>
              <span className="cg-card-cta">Click to explore →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
