import { useEffect, useRef, useState } from 'react';
import { projects } from './projects';
import { Header, Menu } from './components/SiteNavigation';
import PlanetGame from './game/PlanetGame';
import StageCard from './game/StageCard';
import { stages } from './game/stages';
import { play, unlockAudio } from './game/sfx';
import WorldCursor from './components/WorldCursor';
import { ArtDefs, Sprig } from './game/Art';
import './App.css';

const tickerWords = ['A story made with AI', '天空岛', 'Sky Studio', '丢失的光明', 'Lost Light', '上岸', 'Tide Echo', '智械驯服专家', 'AI 叙事', 'the end?'];

function useWorld(world) {
  useEffect(() => { document.documentElement.dataset.world = world; }, [world]);
}

function Ticker() {
  const row = tickerWords.map(word => <span key={word}>{word}<i>❀</i></span>);
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
    <div className="cartridge-screen"><img src={project.image} alt={`${project.title}游戏画面`} loading="lazy" /><span className="cartridge-slot">No.{project.number}</span>{stages[project.number]?.minigame && <span className="cartridge-demo">可试玩</span>}</div>
    <div className="cartridge-label"><p>{project.tags}</p><h3>{project.title}</h3><span>{project.category}{project.caseCount ? ` · ${project.caseCount} 个子案例` : ''}<b>↗</b></span></div>
  </a>;
}

function Gallery({ onOpen }) {
  const [filter, setFilter] = useState('全部作品');
  const filtered = projects.filter(project => filter === '全部作品' || filter === project.category);
  return <main className="gallery-page" id="main-content">
    <header className="gallery-intro">
      <p className="eyebrow">Selected games · a picture book by Leido</p>
      <h1>把想法，<br />做成<em>可以玩</em>的世界。</h1>
      <p>这是一本用 AI 辅助创作的故事。<br />四个游戏作品，外加一本记着四次实验的研究笔记。<br />翻开每一页看画面与玩法，四款游戏都能直接试玩。</p>
      <a href="/#works" className="text-link">← 回到小星球，边走边看</a>
      <Sprig />
    </header>
    <Ticker />
    <section className="section works-section" aria-label="游戏作品列表">
      <div className="filter-row"><div className="filters" role="group" aria-label="筛选游戏作品">{['全部作品', '游戏作品', '研究项目'].map(label => <button key={label} onClick={() => setFilter(label)} aria-pressed={filter === label} className={filter === label ? 'selected' : ''}>{label}</button>)}</div><span className="work-count" aria-live="polite">{filtered.length} 个故事</span></div>
      <div className="cartridge-grid">{filtered.map((project, index) => <Cartridge key={project.number} project={project} index={index} onOpen={onOpen} />)}</div>
      <div className="game-index"><p className="game-index-title">Contents · 目录</p>{filtered.map(project => <a key={project.number} href={project.link}><span>{project.number}</span><h3>{project.title}</h3><p>{project.subtitle}</p><b>↗</b></a>)}</div>
      <a className="research-link" href="/ai-agent-game.html"><span>LLM 技术如何成为游戏机制</span><span>阅读研究与开发过程 ↗</span></a>
    </section>
    <footer className="site-footer"><a href="/">Leido.</a><span>stay curious, keep playing.</span><a href="/#contact">联系我 ↗</a></footer>
  </main>;
}

export default function App() {
  const path = window.location.pathname.replace(/\/$/, '');
  // The planet is the homepage; /planet stays as an alias for old links.
  const Page = path === '/games' ? PortfolioGallery : PlanetGame;
  return <><Page /><WorldCursor /></>;
}

function PortfolioGallery() {
  useWorld('fair');
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
    <ArtDefs /><div inert={menuOpen || stage || undefined}><Header onMenu={() => setMenuOpen(true)} /><Gallery onOpen={openStage} /></div>
    {menuOpen && <Menu close={close} navigate={() => setMenuOpen(false)} />}
    {stage && <StageCard project={stage} onClose={() => { play('close'); setStage(null); }} />}
  </>;
}
