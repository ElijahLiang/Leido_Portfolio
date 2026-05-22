import './EasterEgg.css';

export default function EasterEgg({ onClick }) {
  return (
    <div className="easter-egg-container floating-letter">
      <button className="letter-wrapper small-letter" onClick={onClick} title="设计宣言" aria-label="打开设计宣言">
        <div className="envelope">
          <div className="envelope-flap"></div>
          <div className="envelope-front">
            <div className="wax-seal">💌</div>
          </div>
          <div className="envelope-paper">
            <h4>宣言</h4>
            <p>涌现的故事</p>
          </div>
        </div>
        <p className="letter-hint">点击阅读</p>
      </button>
    </div>
  );
}
