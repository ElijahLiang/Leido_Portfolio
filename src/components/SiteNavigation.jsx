import { useEffect, useRef } from 'react';
import { chapters } from './ScrollStory/useScrollStory';

export function Menu({ close, navigate }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current.querySelector('button').focus();
    const keydown = event => {
      if (event.key === 'Escape') { event.preventDefault(); close(); }
      if (event.key === 'Tab') {
        const items = [...dialogRef.current.querySelectorAll('a, button')];
        const first = items[0], last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', keydown); previous?.focus(); };
  }, [close]);
  return <div className="menu-overlay" id="site-menu" role="dialog" aria-modal="true" aria-label="网站导航" ref={dialogRef}>
    <div className="menu-header"><a className="wordmark" href="/">✳ Leido.</a><button onClick={close} className="menu-toggle">CLOSE −</button></div>
    <nav>{chapters.map((chapter, i) => <a key={chapter.id} href={`/#${chapter.id}`} style={{ '--order': i }} onClick={event => navigate(event, i)}><small>0{i + 1}</small><span>{chapter.label}</span><b>↗</b></a>)}<a href="/games" style={{ '--order': 4 }}><small>05</small><span>完整游戏作品集</span><b>↗</b></a></nav>
    <a className="menu-research" href="/ai-agent-game.html">AI 叙事玩法研究 · 四个子案例 ↗</a><a className="menu-email" href="mailto:erioleiono@gmail.com">erioleiono@gmail.com ↗</a>
  </div>;
}


export function Header({ onMenu, navigate }) {
  return <header className="site-header"><a className="wordmark" href="/" aria-label="Leido 首页">✳ Leido.</a><nav className="desktop-nav" aria-label="主导航">{chapters.slice(1).map((chapter, i) => <a key={chapter.id} href={`/#${chapter.id}`} onClick={navigate ? event => navigate(event, i + 1) : undefined}>{chapter.label} <span>↗</span></a>)}<a href="/ai-agent-game.html">研究项目 <span>↗</span></a><a href="/games">完整作品集 <span>↗</span></a></nav><button className="menu-toggle" onClick={onMenu} aria-haspopup="dialog" aria-controls="site-menu">MENU +</button></header>;
}

