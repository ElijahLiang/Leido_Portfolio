import { useRef } from 'react';
import SkillCloud from '../SkillCloud/SkillCloud';
import selfie from '../../assets/selfie.png';
import './AboutMe.css';

export default function AboutMe() {
  const sectionRef = useRef(null);

  return (
    <section className="fallen-section" ref={sectionRef}>
      <div className="fallen-floor-line" />
      <div className="fallen-inner">
        <div className="fallen-photo-wrap">
          <img src={selfie} alt="Leido" className="fallen-photo" />
        </div>

        <div className="fallen-content">
          <SkillCloud />

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
