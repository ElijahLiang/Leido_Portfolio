import { useState } from 'react';
import Particles from './components/Particles/Particles';
import Header from './components/Header/Header';
import InfiniteMenu from './components/InfiniteMenu/InfiniteMenu';
import AboutMe from './components/AboutMe/AboutMe';
import EasterEgg from './components/EasterEgg/EasterEgg';
import ManifestoModal from './components/ManifestoModal/ManifestoModal';
import PixelTrail from './components/PixelTrail/PixelTrail';
import './App.css';

import coverGame from './assets/cards/game-cover.png';
import coverProduct from './assets/cards/product-cover.png';

const menuItems = [
  {
    image: coverGame,
    link: 'ai-agent-game.html',
    title: 'Game Design',
    description: 'AI Agents, Dialogue Games, and Open Theatre Theory',
  },
  {
    image: 'https://img.youtube.com/vi/y2LnREOkP_Y/hqdefault.jpg',
    link: 'digital-creature.html',
    title: 'Digital Media Art',
    description: 'GLSL Shaders, Audio-Reactive, and Generative Art',
  },
  {
    image: coverProduct,
    link: 'sustainable-design.html',
    title: 'Product Design',
    description: 'Sustainable Design — Re:Cycle',
  },
  {
    image: 'https://img.youtube.com/vi/SgXNTRx8tP0/hqdefault.jpg',
    link: 'embodied-intelligence.html',
    title: 'Embodied AI',
    description: 'VLM-Driven Perception-Cognition Framework',
  },
];

export default function App() {
  const [showManifesto, setShowManifesto] = useState(false);

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <PixelTrail
          gridSize={20}
          trailSize={0.1}
          maxAge={700}
          interpolate={3.3}
          color="#4ff8f5"
          gooeyFilter={{ id: 'custom-goo-filter', strength: 2 }}
          gooeyEnabled
          gooStrength={2}
        />
      </div>

      <Particles count={100} />

      <div className="app-layer">
        <Header />

        <section className="menu-section">
          <InfiniteMenu items={menuItems} />
        </section>

        <AboutMe />
      </div>

      <EasterEgg onClick={() => setShowManifesto(true)} />
      <ManifestoModal open={showManifesto} onClose={() => setShowManifesto(false)} />
    </>
  );
}
