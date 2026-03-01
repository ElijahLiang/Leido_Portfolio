import ShuffleText from '../ShuffleText/ShuffleText';
import './Header.css';

export default function Header() {
  return (
    <header className="hero">
      <div className="hero-title-row">
        <span className="hero-small-text">
          <ShuffleText text="🛸 Welcome to Welcome to" speed={25} delay={200} />
        </span>
      </div>
      <div className="hero-title-row">
        <span className="hero-big-text">
          <ShuffleText text="Leido'PlayGround ✦" speed={35} delay={800} className="hero-shuffle-big" />
        </span>
      </div>
    </header>
  );
}
