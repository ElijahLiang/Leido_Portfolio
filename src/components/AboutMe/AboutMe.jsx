import { useEffect, useRef, useState } from 'react';
import SplitText from '../SplitText/SplitText';
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
      { threshold: 0.2 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="bottom-section" ref={sectionRef}>
      <div className="intro-container">
        <h2 className="intro-title">About Me</h2>
        <div className="intro-grid">
          <div className="intro-photo-stack">
            <div className="intro-photo-wrapper">
              <img src={selfie} alt="宇航员手持星光的插画肖像" className="intro-photo" />
            </div>
            <p className="intro-text">
              Email：<a href="mailto:erioleiono@gmail.com">erioleiono@gmail.com</a><br />
              WeChat：Leidododo<br />
              Instagram：<a href="https://www.instagram.com/leido_liang" target="_blank" rel="noopener noreferrer">@leido_liang</a>
            </p>
          </div>
          <div className="intro-noise-panel">
            <div className="noise-section">
              {lines.map((line, i) => (
                <div key={i} className="noise-row">
                  <span className="scrolling-text">
                    {visible ? (
                      <SplitText text={line} delay={i * 0.4} stagger={0.025} />
                    ) : (
                      <span style={{ opacity: 0 }}>{line}</span>
                    )}
                  </span>
                </div>
              ))}
              <div className="noise-row">
                <span className="scrolling-text noise-divider">── ── ── ── ── ── ── ── ── ── ──</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
