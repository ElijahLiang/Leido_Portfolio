import { useState } from 'react';
import Particles from './components/Particles/Particles';
import Header from './components/Header/Header';
import InfiniteMenu from './components/InfiniteMenu/InfiniteMenu';
import AboutMe from './components/AboutMe/AboutMe';
import EasterEgg from './components/EasterEgg/EasterEgg';
import ManifestoModal from './components/ManifestoModal/ManifestoModal';
import './App.css';

import coverGame from './assets/cards/game-cover.png';
import coverProduct from './assets/cards/product-cover.png';

const menuItems = [
  {
    image: coverGame,
    link: 'ai-agent-game.html',
    title: 'LLM 技术游戏玩法研究',
    description: 'AI 对话、智能 NPC 与开放剧场理论',
  },
  {
    image: '/video-covers/y2LnREOkP_Y.jpg',
    link: 'digital-creature.html',
    title: '互动媒体艺术作品',
    description: 'GLSL 着色器、声音交互与生成艺术',
  },
  {
    image: coverProduct,
    link: 'sustainable-design.html',
    title: '可持续产品设计',
    description: 'Re:Cycle：面向共生未来的生态系统',
  },
  {
    image: '/video-covers/SgXNTRx8tP0.jpg',
    link: 'embodied-intelligence.html',
    title: '智能 NPC 研究之旅',
    description: 'VLM 驱动的感知、认知与行动框架',
  },
  {
    image: '/video-covers/rhythm-game-cover.svg',
    link: 'rhythm-game-demo.html',
    title: '智械驯服专家 · 音游 Demo',
    description: '音乐节奏 × 战斗输出的玩法实验',
  },
];

export default function App() {
  const [showManifesto, setShowManifesto] = useState(false);

  return (
    <>
      <Particles count={80} />

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

