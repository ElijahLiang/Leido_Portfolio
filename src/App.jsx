import { useRef, useState, useCallback } from 'react';
import Particles from './components/Particles/Particles';
import Header from './components/Header/Header';
import CardSwap, { Card } from './components/CardSwap/CardSwap';
import AboutMe from './components/AboutMe/AboutMe';
import EasterEgg from './components/EasterEgg/EasterEgg';
import ManifestoModal from './components/ManifestoModal/ManifestoModal';
import './App.css';

import coverGame from './assets/cards/game-cover.png';
import coverProduct from './assets/cards/product-cover.png';

const cards = [
  {
    key: 'game',
    icon: '🪐',
    title: 'Game Design',
    desc: 'AI Agents, Dialogue Games, and Open Theatre Theory',
    href: 'ai-agent-game.html',
    img: coverGame,
  },
  {
    key: 'digital',
    icon: '🌕',
    title: 'Digital Media Art',
    desc: 'GLSL Shaders, Audio-Reactive, and Generative Art',
    href: 'digital-creature.html',
    img: 'https://img.youtube.com/vi/y2LnREOkP_Y/hqdefault.jpg',
  },
  {
    key: 'product',
    icon: '🌏',
    title: 'Product Design',
    desc: 'Sustainable Design — Re:Cycle',
    href: 'sustainable-design.html',
    img: coverProduct,
  },
  {
    key: 'embodied',
    icon: '🧠',
    title: 'Embodied AI',
    desc: 'VLM-Driven Perception-Cognition Framework',
    href: 'embodied-intelligence.html',
    img: 'https://img.youtube.com/vi/SgXNTRx8tP0/hqdefault.jpg',
  },
];

export default function App() {
  const [activeKey, setActiveKey] = useState(null);
  const [showManifesto, setShowManifesto] = useState(false);
  const swapRef = useRef(null);

  const handleSelect = useCallback((key) => {
    setActiveKey(key);
    const idx = cards.findIndex(c => c.key === key);
    if (idx !== -1) {
      swapRef.current?.goTo(idx);
    }
  }, []);

  const handleCardClick = useCallback((i) => {
    window.location.href = cards[i].href;
  }, []);

  return (
    <>
      <Particles count={100} />

      <div className="app-layer">
        <Header activeKey={activeKey} onSelect={handleSelect} />

        <main className="app-container">
          <section className="cardswap-section">
            <CardSwap
              ref={swapRef}
              width={460}
              height={320}
              cardDistance={50}
              verticalDistance={55}
              delay={4000}
              pauseOnHover
              skewAmount={4}
              easing="elastic"
              onCardClick={handleCardClick}
            >
              {cards.map(c => (
                <Card key={c.key} customClass="project-card">
                  <img src={c.img} alt={c.title} className="project-card-img" />
                  <div className="project-card-overlay">
                    <span className="project-card-icon">{c.icon}</span>
                    <h3 className="project-card-title">{c.title}</h3>
                    <p className="project-card-desc">{c.desc}</p>
                    <span className="project-card-cta">Click to explore →</span>
                  </div>
                </Card>
              ))}
            </CardSwap>
          </section>

          <AboutMe />
        </main>

        <div className="escape-center">
          <button className="escape-btn" onClick={() => alert("Bye！Earth！🌍Bye！Human！🔥")}>
            Click me to escape💨escape💨escape💨
          </button>
        </div>
      </div>

      <EasterEgg onClick={() => setShowManifesto(true)} />
      <ManifestoModal open={showManifesto} onClose={() => setShowManifesto(false)} />
    </>
  );
}
