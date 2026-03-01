import selfie from '../../assets/selfie.png';
import './AboutMe.css';

export default function AboutMe() {
  return (
    <section className="bottom-section">
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
              <div className="noise-row slide-left delay-1">
                <span className="scrolling-text">✦ Try to make the world a better place ✦</span>
              </div>
              <div className="noise-row slide-right delay-2">
                <span className="scrolling-text">🛸 Exploring the boundaries of AI and game 🪐</span>
              </div>
              <div className="noise-row slide-left delay-3">
                <span className="scrolling-text">👽 Trying to give technique emotional value  👽</span>
              </div>
              <div className="noise-row slide-right delay-4">
                <span className="scrolling-text">── ── ── ── ── ── ── ── ── ── ──</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
