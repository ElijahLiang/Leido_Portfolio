import { useEffect, useRef, useState } from 'react';
import portrait from './assets/selfie.png';
import { projects } from './projects';
import { chapters, KineticTitle, useScrollStory } from './components/ScrollStory/useScrollStory';
import OrbitWorld from './components/ScrollStory/OrbitWorld';
import { Header, Menu } from './components/SiteNavigation';
import WorldCursor from './components/WorldCursor';
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import './App.css';

// Each chapter is its own visual world; CSS reads the active one from <html data-world>.
const worlds = ['cosmos', 'arcade', 'museum', 'orbit'];
const tickerWords = ['INSERT COIN', 'LOST LIGHT', '丢失的光明', 'TIDE ECHO', '上岸', '节奏战斗', 'AI 叙事', 'PRESS START'];

function useWorld(world) {
  useEffect(() => { document.documentElement.dataset.world = world; }, [world]);
}

function Ticker() {
  const row = tickerWords.map(word => <span key={word}>{word}<i>✦</i></span>);
  return <div className="arcade-ticker" aria-hidden="true"><div>{row}{row}</div></div>;
}

function Cartridge({ project, index }) {
  return <a className="cartridge" href={project.link} style={{ '--order': index }}>
    <div className="cartridge-screen"><img src={project.image} alt={`${project.title}游戏画面`} loading="lazy" /><span className="cartridge-slot">{project.number}</span></div>
    <div className="cartridge-label"><p>{project.tags}</p><h3>{project.title}</h3><span>{project.category}{project.caseCount ? ` · ${project.caseCount} 个子案例` : ''}<b>↗</b></span></div>
  </a>;
}

function Gallery() {
  const [filter, setFilter] = useState('全部作品');
  const filtered = projects.filter(project => filter === '全部作品' || filter === project.category);
  return <main className="gallery-page" id="main-content">
    <header className="gallery-intro">
      <p className="eyebrow">SELECTED GAMES / LEIDO</p>
      <h1>把想法，<br />做成<em>可以玩</em>的世界。</h1>
      <p>互动叙事、海岛生活、节奏战斗与 AI 对话。<br />三个游戏作品，一项包含四个子案例的研究。</p>
      <a href="/#works" className="text-link">← 返回交互首页</a>
    </header>
    <Ticker />
    <section className="section works-section" aria-label="游戏作品列表">
      <div className="filter-row"><div className="filters" role="group" aria-label="筛选游戏作品">{['全部作品', '游戏作品', '研究项目'].map(label => <button key={label} onClick={() => setFilter(label)} aria-pressed={filter === label} className={filter === label ? 'selected' : ''}>{label}</button>)}</div><span className="work-count" aria-live="polite">0{filtered.length} PROJECTS</span></div>
      <div className="cartridge-grid">{filtered.map((project, index) => <Cartridge key={project.number} project={project} index={index} />)}</div>
      <div className="game-index">{filtered.map(project => <a key={project.number} href={project.link}><span>{project.number}</span><h3>{project.title}</h3><p>{project.subtitle}</p><b>↗</b></a>)}</div>
      <a className="research-link" href="/ai-agent-game.html"><span>LLM 技术如何成为游戏机制</span><span>阅读研究与开发过程 ↗</span></a>
    </section>
    <footer className="site-footer"><a href="/">✳ Leido.</a><span>STAY CURIOUS. KEEP PLAYING.</span><a href="/#contact">联系我 ↗</a></footer>
  </main>;
}

export default function App() {
  const isGallery = window.location.pathname.replace(/\/$/, '') === '/games';
  return <>{isGallery ? <PortfolioGallery /> : <PortfolioStory />}<WorldCursor /></>;
}

function PortfolioGallery() {
  useWorld('arcade');
  useEffect(() => { document.title = '游戏作品 — Leido'; }, []);
  const [menuOpen, setMenuOpen] = useState(false);
  const close = useRef(() => setMenuOpen(false)).current;
  return <><div inert={menuOpen || undefined}><Header onMenu={() => setMenuOpen(true)} /><Gallery /></div>{menuOpen && <Menu close={close} navigate={() => setMenuOpen(false)} />}</>;
}

function PortfolioStory() {
  const { containerRef, stageRef, active, goTo } = useScrollStory();
  useWorld(worlds[active]);
  const [menuOpen, setMenuOpen] = useState(false);
  const close = useRef(() => setMenuOpen(false)).current;
  const navigate = (event, index) => {
    event.preventDefault();
    setMenuOpen(false);
    history.replaceState(null, '', `#${chapters[index].id}`);
    // Let the menu release its scroll lock before moving the document.
    requestAnimationFrame(() => goTo(index));
  };
  const panel = (index, className = '') => ({ className: `story-panel ${className}`, 'data-panel': index, 'aria-label': chapters[index].label });
  return <>
    <div inert={menuOpen || undefined}>
      <a className="skip-link" href="#story-controls">跳到章节导航</a>
      <Header onMenu={() => setMenuOpen(true)} navigate={navigate} />
      <main id="main-content">
        <section className="story-scroll" ref={containerRef} aria-label="滚动探索 Leido 的作品集">
          <div className="story-stage" ref={stageRef}>
            <div className="world-backdrop" aria-hidden="true"><span className="backdrop-cosmos" /><span className="backdrop-arcade" /><span className="backdrop-museum" /><span className="backdrop-orbit" /></div>

            <article {...panel(0, 'story-intro')}>
              <div className="story-portrait" data-portrait><img src={portrait} alt="Leido 的宇航员形象，伸手触碰星星" fetchPriority="high" /></div>
              <div className="orbit-badge" aria-hidden="true" data-content><svg viewBox="0 0 200 200"><defs><path id="badge-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" /></defs><text><textPath href="#badge-circle">GAME DESIGNER ✦ CREATIVE DEVELOPER ✦ AI PLAY ✦ </textPath></text><path className="badge-star" d="M100 82 L104 96 L118 100 L104 104 L100 118 L96 104 L82 100 L96 96 Z" /></svg></div>
              <div className="scene-top"><span>WORLD 01 · COSMOS<br />一个私人的游乐场</span><span>LEIDO / 01</span></div>
              <div className="intro-heading"><p>你好，我是</p><h1 className="sr-only">LEIDO. game designer & creative developer</h1><KineticTitle scene={0} lines={['LEIDO.']} /></div>
              <div className="intro-content" data-content><h2>game designer<br /><em>&amp; creative developer</em></h2><p>探索玩法、叙事与 AI。<br />把一个念头，变成可以玩的世界。</p><a className="text-link" href="#works" onClick={event => navigate(event, 1)}>进入下一个世界 <span>↗</span></a></div>
            </article>

            <article {...panel(1, 'story-games')}>
              <div className="scene-top"><span>WORLD 02 · ARCADE<br />游戏作品与研究</span><span>LEIDO / 02</span></div>
              <h2 className="sr-only">游戏作品 GAME. PLAY. MAKE.</h2>
              <KineticTitle scene={1} lines={['GAME.', 'PLAY.', 'MAKE.']} />
              <div className="arcade-copy" data-content><p className="arcade-score">HI-SCORE <b>{String(projects.length).padStart(3, '0')}</b> / PLAYER 1</p><p>互动叙事、海岛生活、节奏战斗与 AI 叙事。<br />每一个原型，都是一次可以玩的提问。</p><a className="text-link" href="/games">查看完整游戏作品集 <span>↗</span></a></div>
              <div className="cartridge-stack" data-content>{projects.map((project, index) => <Cartridge key={project.number} project={project} index={index} />)}</div>
              <div className="ticker-wrap" data-content><Ticker /></div>
            </article>

            <article {...panel(2, 'story-npc')}>
              <div className="scene-top"><span>WORLD 03 · MUSEUM<br />虚拟人</span><span>LEIDO / 03</span></div>
              <h2 className="sr-only">鸿山博物馆虚拟讲解员 NPC. SEE. TALK.</h2>
              <KineticTitle scene={2} lines={['NPC.', 'See.', 'Talk.']} />
              <a className="exhibit" href="/embodied-intelligence.html" data-content>
                <figure className="exhibit-frame">
                  <img src="/video-covers/SgXNTRx8tP0.jpg" alt="鸿山博物馆虚拟展厅中的虚拟讲解员" loading="lazy" />
                  <span className="vision-box box-npc"><i>npc · guide 0.97</i></span>
                  <span className="vision-box box-exhibit"><i>exhibit · bronze vessel 0.91</i></span>
                  <span className="vision-box box-relic"><i>exhibit · relic 0.86</i></span>
                  <span className="vision-scan" />
                </figure>
                <div className="placard"><span>No. 03</span><h3>鸿山博物馆 · 虚拟讲解员</h3><p>VLM × LLM / Interactive Space</p><b>查看项目 ↗</b></div>
              </a>
              <div className="museum-copy" data-content><p className="eyebrow">VIRTUAL HUMAN / 虚拟讲解员</p><p>看见展品、理解问题、自主导航。<br />让虚拟角色真正回应它所在的空间。</p></div>
            </article>

            <article {...panel(3, 'story-contact')}>
              <div className="scene-top"><span>WORLD 04 · ORBIT<br />保持好奇，继续创造</span><span>LEIDO / 04</span></div>
              <OrbitWorld active={active === 3} />
              <span className="orbit-hint" data-content>DRAG TO ROTATE / 拖动星球</span>
              <div className="scene-bottom contact-content" data-content><div><p className="about-line">我是 Leido，探索游戏机制、交互叙事与 AI 角色。</p><h2>LET’S <em>PLAY.</em></h2><p>下一个有趣的世界，也许从一次对话开始。</p></div><div className="contact-actions"><a className="text-link" href="mailto:erioleiono@gmail.com">联系我 <span>↗</span></a><a href="mailto:erioleiono@gmail.com">erioleiono@gmail.com ↗</a><span>WeChat / Leidododo</span><a href="https://github.com/ElijahLiang" target="_blank" rel="noopener noreferrer">GitHub ↗</a></div></div>
            </article>

            <nav className="story-chapters" id="story-controls" aria-label="介绍章节">{chapters.map((chapter, index) => <button key={chapter.id} onClick={event => navigate(event, index)} className={active === index ? 'active' : ''} aria-label={`${index + 1} ${chapter.label}`} aria-current={active === index ? 'step' : undefined}><span className="chapter-label">{chapter.label}</span><span>0{index + 1}</span></button>)}</nav>
            <div className="story-progress"><div><span>0{active + 1} / 04</span><span>{chapters[active].label}</span></div><div className="progress-track"><span /></div><button onClick={() => goTo(active === 3 ? 0 : active + 1)} aria-label={active === 3 ? '回到第一章' : '下一章'}>{active === 3 ? 'BACK TO START ↑' : 'SCROLL ↓'}</button></div>
            <p className="sr-only" aria-live="polite">第 {active + 1} 段：{chapters[active].label}</p>
          </div>
        </section>
      </main>
    </div>
    {menuOpen && <Menu close={close} navigate={navigate} />}
  </>;
}
