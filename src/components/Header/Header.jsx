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
      <div className="slide-left">
        <span className="scrolling-text">🛸 Welcome to Welcome to</span>
      </div>
      <div className="slide-right">
        <span className="scrolling-texto">🛸  Leido'PlayGround✦ </span>
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
