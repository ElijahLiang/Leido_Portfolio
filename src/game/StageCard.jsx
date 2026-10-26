import { useEffect, useRef, useState } from 'react';
import MiniGame from './MiniGames';
import { stages } from './stages';
import { play } from './sfx';
import useModal from './useModal';

// The briefing screen behind every arcade cabinet (and every cartridge on /games).
export default function StageCard({ project, cleared = false, onClose, onWin, startPlaying = false }) {
  const stage = stages[project.number];
  const [mode, setMode] = useState(startPlaying && stage.minigame ? 'play' : 'media');
  const [index, setIndex] = useState(0);
  const [justCleared, setJustCleared] = useState(false);
  const ref = useModal(mode === 'play' ? () => { play('close'); setMode('media'); } : onClose);
  const playButton = useRef(null);
  const crt = useRef(null);
  const previousMode = useRef(mode);
  // Coming back from a demo, put focus where the player left it.
  useEffect(() => {
    if (previousMode.current === 'play' && mode === 'media') playButton.current?.focus({ preventScroll: true });
    if (previousMode.current === 'media' && mode === 'play') crt.current?.scrollIntoView({ block: 'nearest', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    previousMode.current = mode;
  }, [mode]);
  const media = stage.media;
  const item = media[index];
  const step = direction => { play('select'); setIndex((index + direction + media.length) % media.length); };

  useEffect(() => {
    if (mode !== 'media') return;
    const keydown = event => {
      if (event.target.closest?.('video, iframe') || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  });

  const win = () => { setJustCleared(true); onWin?.(stage.minigame); };
  const isResearch = Boolean(stage.cases);
  return <div className="modal-backdrop stage-backdrop" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="stage-card" ref={ref} role="dialog" aria-modal="true" aria-label={`STAGE ${project.number} ${project.title}`} style={{ '--stage': stage.color }}>
      <header className="stage-top">
        <span className="stage-badge">STAGE {project.number}</span>
        <span>{project.category}{project.caseCount ? ` · ${project.caseCount} 个子案例` : ''}</span>
        {(cleared || justCleared) && <span className="stage-clear">★ CLEAR</span>}
        <button className="stage-close" onClick={onClose} aria-label="关闭，返回">✕<small>Esc</small></button>
      </header>

      <div className="stage-grid">
        <section className="stage-media" aria-label={mode === 'play' ? '试玩' : '画面'}>
          <div className={`crt${mode === 'play' ? ' playing' : ''}`} ref={crt}>
            {mode === 'play'
              ? <MiniGame kind={stage.minigame} onWin={win} />
              : <MediaItem item={item} key={item.src} title={project.title} />}
          </div>
          {mode === 'media' ? <>
            <div className="crt-bar">
              <button onClick={() => step(-1)} aria-label="上一张" disabled={media.length < 2}>◀</button>
              <p>{item.caption}</p>
              <span>{index + 1}/{media.length}</span>
              <button onClick={() => step(1)} aria-label="下一张" disabled={media.length < 2}>▶</button>
            </div>
            {media.length > 1 && <div className="crt-thumbs">{media.map((entry, i) => <button key={entry.src} className={i === index ? 'on' : ''} onClick={() => { play('select'); setIndex(i); }} aria-label={entry.caption} aria-current={i === index || undefined}>
              <img src={entry.thumb} alt="" loading="lazy" />{entry.type !== 'image' && <i>▶</i>}
            </button>)}</div>}
          </> : <div className="crt-bar"><p>Esc 返回画面 · 试玩只是机制切片，完整体验在关卡页里</p></div>}
          {isResearch && <><h3>子关卡 · SUB-STAGES</h3><ol className="stage-cases">{stage.cases.map(entry => <li key={entry.id}><a href={entry.link}>
            <img src={entry.thumb} alt="" loading="lazy" />
            <span><small>{entry.roman} · {entry.stage} · {entry.date}</small><b>{entry.title}</b><em>{entry.question}</em></span>
          </a></li>)}</ol></>}
        </section>

        <section className="stage-info">
          <h2>{project.title}</h2>
          <p className="stage-en">{stage.english}</p>
          <p className="stage-hook">{stage.hook}</p>
          <dl className="stage-stats">{stage.info.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
          {!isResearch && <><h3>核心玩法 · MOVES</h3><ul className="stage-moves">{stage.moves.map(([name, text]) => <li key={name}><b>{name}</b><span>{text}</span></li>)}</ul></>}
          <div className="stage-actions">
            {stage.minigame && <button className="game-button stage-play" ref={playButton} data-autofocus="" onClick={() => { play(mode === 'play' ? 'close' : 'coin'); setMode(mode === 'play' ? 'media' : 'play'); }} aria-pressed={mode === 'play'}>
              {mode === 'play' ? '■ 结束试玩' : `▶ 试玩 · ${stage.play}`}
            </button>}
            <a className="game-button primary" href={project.link} data-autofocus={stage.minigame ? undefined : ''}>{isResearch ? '阅读研究 ↗' : '进入关卡 ↗'}</a>
            {stage.links?.map(link => <a key={link.href} className="game-button" href={link.href} target="_blank" rel="noopener noreferrer">{link.label} ↗</a>)}
          </div>
        </section>
      </div>
    </div>
  </div>;
}

function MediaItem({ item, title }) {
  if (item.type === 'video') return <video src={item.src} poster={item.poster} controls preload="none" playsInline aria-label={item.caption} />;
  if (item.type === 'embed') return <iframe src={item.src} title={`${title} · ${item.caption}`} allowFullScreen referrerPolicy="no-referrer" loading="lazy" />;
  return <div className="crt-image" style={{ backgroundImage: `url("${item.thumb}")` }}><img src={item.src} alt={item.caption} onLoad={event => event.currentTarget.classList.add('loaded')} /></div>;
}
