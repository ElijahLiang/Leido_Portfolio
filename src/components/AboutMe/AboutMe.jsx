import { useRef, useState } from 'react';
import SkillCloud from '../SkillCloud/SkillCloud';
import selfie from '../../assets/selfie.png';
import './AboutMe.css';

export default function AboutMe() {
  const sectionRef = useRef(null);
  const [showContactBubble, setShowContactBubble] = useState(false);

  return (
    <section className="fallen-section" ref={sectionRef}>
      <div className="fallen-floor-line" />
      <div className="fallen-inner">
        <button
          type="button"
          className="fallen-photo-wrap"
          onClick={() => setShowContactBubble((visible) => !visible)}
          aria-expanded={showContactBubble}
          aria-label="显示联系方式"
        >
          <img src={selfie} alt="Leido" className="fallen-photo" />
          {showContactBubble && (
            <div className="contact-bubble">
              <p>可以从以下方式联系我</p>
              <span>Email：erioleiono@gmail.com</span>
              <span>WeChat：Leidododo</span>
              <span>Instagram：@leido_liang</span>
            </div>
          )}
        </button>

        <div className="fallen-content">
          <SkillCloud />
        </div>
      </div>
    </section>
  );
}
