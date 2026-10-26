import { useEffect, useRef, useState } from 'react';
import { projects } from './projects';
import { Header, Menu } from './components/SiteNavigation';
import PlanetGame from './game/PlanetGame';
import StageCard from './game/StageCard';
import { stages } from './game/stages';
import { play, unlockAudio } from './game/sfx';
import WorldCursor from './components/WorldCursor';
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import './App.css';

const tickerWords = ['INSERT COIN', 'LOST LIGHT', '丢失的光明', 'TIDE ECHO', '上岸', '节奏战斗', 'AI 叙事', 'PRESS START'];

function useWorld(world) {
  useEffect(() => { document.documentElement.dataset.world = world; }, [world]);
}

function Ticker() {
  const row = tickerWords.map(word => <span key={word}>{word}<i>✦</i></span>);
  return <div className="arcade-ticker" aria-hidden="true"><div>{row}{row}</div></div>;
}

// A plain click opens the stage briefing; modified clicks still open the project page.
function Cartridge({ project, index, onOpen }) {
  const open = event => {
    if (!onOpen || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onOpen(project);
  };
  return <a className="cartridge" href={project.link} style={{ '--order': index }} onClick={open} aria-haspopup={onOpen ? 'dialog' : undefined}>
    <div className="cartridge-screen"><img src={project.image} alt={`${project.title}游戏画面`} loading="lazy" /><span className="cartridge-slot">{project.number}</span>{stages[project.number]?.minigame && <span className="cartridge-demo">▶ 可试玩</span>}</div>
    <div className="cartridge-label"><p>{project.tags}</p><h3>{project.title}</h3><span>{project.category}{project.caseCount ? ` · ${project.caseCount} 个子案例` : ''}<b>↗</b></span></div>
  </a>;
}

function Gallery({ onOpen }) {
  const [filter, setFilter] = useState('全部作品');
  const filtered = projects.filter(project => filter === '全部作品' || filter === project.category);
  return <main className="gallery-page" id="main-content">
    <header className="gallery-intro">
      <p className="eyebrow">SELECTED GAMES / LEIDO</p>
      <h1>把想法，<br />做成<em>可以玩</em>的世界。</h1>
      <p>互动叙事、海岛生活、节奏战斗与 AI 对话。<br />三个游戏作品，一项包含四个子案例的研究。<br />点卡带看画面和关卡情报，三款游戏都能直接试玩。</p>
      <a href="/#works" className="text-link">← 回到小星球，边玩边看</a>
    </header>
    <Ticker />
    <section className="section works-section" aria-label="游戏作品列表">
      <div className="filter-row"><div className="filters" role="group" aria-label="筛选游戏作品">{['全部作品', '游戏作品', '研究项目'].map(label => <button key={label} onClick={() => setFilter(label)} aria-pressed={filter === label} className={filter === label ? 'selected' : ''}>{label}</button>)}</div><span className="work-count" aria-live="polite">0{filtered.length} PROJECTS</span></div>
      <div className="cartridge-grid">{filtered.map((project, index) => <Cartridge key={project.number} project={project} index={index} onOpen={onOpen} />)}</div>
      <div className="game-index">{filtered.map(project => <a key={project.number} href={project.link}><span>{project.number}</span><h3>{project.title}</h3><p>{project.subtitle}</p><b>↗</b></a>)}</div>
      <a className="research-link" href="/ai-agent-game.html"><span>LLM 技术如何成为游戏机制</span><span>阅读研究与开发过程 ↗</span></a>
    </section>
    <footer className="site-footer"><a href="/">✳ Leido.</a><span>STAY CURIOUS. KEEP PLAYING.</span><a href="/#contact">联系我 ↗</a></footer>
  </main>;
}

export default function App() {
  const isGallery = window.location.pathname.replace(/\/$/, '') === '/games';
  return <>{isGallery ? <PortfolioGallery /> : <PlanetGame />}<WorldCursor /></>;
}

function PortfolioGallery() {
  useWorld('arcade');
  useEffect(() => { document.title = '游戏作品 — Leido'; }, []);
  const [menuOpen, setMenuOpen] = useState(false);
  const [stage, setStage] = useState(null);
  const close = useRef(() => setMenuOpen(false)).current;
  const openStage = project => { unlockAudio(); play('coin'); setStage(project); };
  useEffect(() => {
    if (!stage) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflow; };
  }, [stage]);
  return <>
    <div inert={menuOpen || stage || undefined}><Header onMenu={() => setMenuOpen(true)} /><Gallery onOpen={openStage} /></div>
    {menuOpen && <Menu close={close} navigate={() => setMenuOpen(false)} />}
    {stage && <StageCard project={stage} onClose={() => { play('close'); setStage(null); }} />}
  </>;
}
