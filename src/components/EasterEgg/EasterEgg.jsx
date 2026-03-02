import './EasterEgg.css';

export default function EasterEgg({ onClick }) {
  return (
    <div className="easter-egg-container floating-letter">
      <button className="letter-wrapper small-letter" onClick={onClick} title="Design Manifesto" aria-label="Open Design Manifesto">
        <div className="envelope">
          <div className="envelope-flap"></div>
          <div className="envelope-front">
            <div className="wax-seal">💌</div>
          </div>
          <div className="envelope-paper">
            <h4>Manifesto</h4>
            <p>Torch of Light</p>
          </div>
        </div>
        <p className="letter-hint">Tap to read</p>
      </button>
    </div>
  );
}
