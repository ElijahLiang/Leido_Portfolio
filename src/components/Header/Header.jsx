import ShuffleText from '../ShuffleText/ShuffleText';
import './Header.css';

const buttons = [
  { key: 'game', label: ' .𖥔 ݁ ˖🛸Game Design.✦ ' },
  { key: 'digital', label: ' 𖥔 ݁ ˖🪐Digital Media Art✦ ' },
  { key: 'product', label: ' 𖥔 ݁ ˖🌕🌑Product Design✦ ' },
  { key: 'embodied', label: ' 𖥔 ݁ ˖🧠Embodied AI✦ ' },
];

export default function Header({ activeKey, onSelect }) {
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
      <div className="topbar">
        {buttons.map(b => (
          <button
            key={b.key}
            type="button"
            className={activeKey === b.key ? 'active' : ''}
            onClick={() => onSelect(b.key)}
          >
            {b.label}
          </button>
        ))}
      </div>
    </header>
  );
}
