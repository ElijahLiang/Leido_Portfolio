import { useEffect, useRef, useState } from 'react';
import FallingText from '../FallingText/FallingText';
import selfie from '../../assets/selfie.png';
import './AboutMe.css';

const lines = [
  '✦ Try to make the world a better place ✦',
  '🛸 Exploring the boundaries of AI and game 🪐',
  '👽 Trying to give technique emotional value 👽',
];

export default function AboutMe() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="fallen-section" ref={sectionRef}>
      <div className="fallen-floor-line" />
      <div className="fallen-inner">
        <div className="fallen-photo-wrap">
          <img src={selfie} alt="Leido" className="fallen-photo" />
        </div>

        <div className="fallen-content">
          <div className="fallen-lines">
            {lines.map((line, i) => (
              <div key={i} className="fallen-line">
                {visible ? (
                  <FallingText text={line} delay={i * 0.55} stagger={0.025} />
                ) : (
                  <span style={{ opacity: 0 }}>{line}</span>
                )}
              </div>
            ))}
          </div>

          <div className="fallen-contact">
            <span>Email：<a href="mailto:erioleiono@gmail.com">erioleiono@gmail.com</a></span>
            <span>WeChat：Leidododo</span>
            <span>
              Instagram：<a href="https://www.instagram.com/leido_liang" target="_blank" rel="noopener noreferrer">@leido_liang</a>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
