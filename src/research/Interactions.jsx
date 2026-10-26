import { useEffect, useRef, useState } from 'react';
import { caseUrl, researchCases } from './data';

export function useReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let frame;
    const update = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => setProgress(Math.max(0, Math.min(1, window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight))))); };
    const observer = new ResizeObserver(update); observer.observe(document.body);
    window.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', update); update();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);
  return progress;
}

export function ReadingTicks() {
  const progress = useReadingProgress();
  return <nav className={`reading-ticks ${progress > .01 ? 'visible' : ''}`} aria-label="阅读进度"><strong>{Math.round(progress * 100)}<small>%</small></strong><div>{Array.from({ length: 24 }, (_, i) => <button key={i} className={progress * 24 >= i + 1 ? 'read' : ''} style={{ '--tick-height': `${9 + ((i * 7 + Math.round(Math.sin(i) * 6)) % 19)}px` }} onClick={() => window.scrollTo({ top: (document.documentElement.scrollHeight - window.innerHeight) * (i + 1) / 24, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })} aria-label={`跳到 ${Math.round((i + 1) / 24 * 100)}%`} />)}</div></nav>;
}

export function SectionDock() {
  const [active, setActive] = useState('directions');
  useEffect(() => {
    const update = () => {
      const sections = ['directions', 'experiments', 'protocol'];
      let current = sections[0];
      for (const id of sections) if (document.getElementById(id)?.getBoundingClientRect().top < window.innerHeight * .55) current = id;
      setActive(current);
    };
    window.addEventListener('scroll', update, { passive: true }); update();
    return () => window.removeEventListener('scroll', update);
  }, []);
  return <nav className="research-dock" aria-label="本页目录">{[['directions', '路径'], ['experiments', '子案例'], ['protocol', '方法']].map(([id, label], i) => <a href={`#${id}`} key={id} aria-current={active === id ? 'location' : undefined}><small>0{i + 1}</small>{label}</a>)}</nav>;
}

export function CaseFan({ cases }) {
  const [active, setActive] = useState(0);
  const [drag, setDrag] = useState(0);
  const [width, setWidth] = useState(700);
  const root = useRef(null);
  const gesture = useRef(null);
  const suppressClick = useRef(0);
  useEffect(() => {
    const observer = new ResizeObserver(() => setWidth(root.current.clientWidth)); observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  const choose = step => setActive(value => (value + step + cases.length) % cases.length);
  const distance = index => {
    let value = (index - active + cases.length) % cases.length;
    if (value > cases.length / 2) value -= cases.length;
    return value;
  };
  const finish = event => {
    if (!gesture.current) return;
    const delta = event.clientX - gesture.current.x;
    if (Math.abs(delta) > 12) { suppressClick.current = performance.now() + 400; if (Math.abs(delta) > 40) choose(delta < 0 ? 1 : -1); }
    gesture.current = null; setDrag(0);
  };
  return <div className={`case-fan ${drag ? 'dragging' : ''}`} ref={root} role="region" aria-label="其他研究子案例，拖动或用左右键切换" tabIndex={0} onKeyDown={event => { if (['ArrowLeft','ArrowRight'].includes(event.key)) { event.preventDefault(); choose(event.key === 'ArrowRight' ? 1 : -1); } }} onPointerDown={event => { if (event.target.closest('button')) return; gesture.current = { x: event.clientX }; }} onPointerMove={event => { if (!gesture.current) return; const delta = event.clientX - gesture.current.x; if (Math.abs(delta) > 8) { root.current.setPointerCapture(event.pointerId); setDrag(delta); } }} onPointerUp={finish} onPointerCancel={() => { gesture.current = null; setDrag(0); }} onClickCapture={event => { if (performance.now() < suppressClick.current) { event.preventDefault(); event.stopPropagation(); } }}>
    {cases.map((item, index) => { const d = distance(index); return <a className="case-fan-card" href={caseUrl(item.id)} key={item.id} tabIndex={d === 0 ? 0 : -1} aria-label={`${item.title}，${d === 0 ? '阅读子案例' : '切换到中央'}`} onClick={event => { if (d !== 0) { event.preventDefault(); setActive(index); } }} onDragStart={event => event.preventDefault()} style={{ zIndex: 10 - Math.abs(d), '--dim': d === 0 ? 0 : .45, transform: `translateX(${d * Math.min(175, width * .23) + drag * .35}px) scale(${d === 0 ? 1 : .88}) rotate(${d * 6}deg)` }}><img src={item.image} alt="" draggable="false" /><div><p>{item.stage} / {item.roman}</p><h3>{item.title}</h3><span>{item.question}</span></div></a>; })}
    <div className="case-fan-nav"><button onClick={() => choose(-1)} aria-label="上一个子案例">←</button><span className="sr-only" aria-live="polite">{cases[active].title}</span><button onClick={() => choose(1)} aria-label="下一个子案例">→</button></div>
  </div>;
}

export function ResearchDeck() {
  const [selected, setSelected] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(null);
  const stage = useRef(null), shells = useRef([]), angle = useRef(-35), root = useRef(null);
  const item = researchCases[selected];
  const current = researchCases[hovered ?? selected];
  const select = index => { const next=(index + researchCases.length) % researchCases.length; if (!expanded) angle.current=-next / researchCases.length * 360; setSelected(next); setFlipped(false); };
  const back = () => { setExpanded(false); setFlipped(false); setPaused(false); requestAnimationFrame(() => stage.current.focus({ preventScroll: true })); };
  useEffect(() => {
    let frame = 0, time = 0;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const draw = now => {
      const delta = Math.min(40, now - time); time = now;
      if (!expanded && !paused && hovered === null && !media.matches && !document.hidden) angle.current += delta * .004;
      const width = stage.current.clientWidth, height = stage.current.clientHeight;
      const radius = Math.min(width * .32, height * .36, 270);
      shells.current.forEach((shell, index) => {
        if (!shell) return;
        let transform, opacity = 1;
        if (expanded) {
          let d = (index - selected + researchCases.length) % researchCases.length;
          if (d > researchCases.length / 2) d -= researchCases.length;
          const offset = Math.min(width * .27, 245);
          transform = `translate3d(${d * offset}px, ${Math.abs(d) * 90}px, ${-Math.abs(d) * 130}px) rotate(${d * 18}deg) scale(${d === 0 ? 1 : .72})`;
          shell.style.zIndex = 20 - Math.abs(d);
          shell.style.setProperty('--card-dim', d === 0 ? 0 : .5);
        } else {
          const theta = (index / researchCases.length * 360 + angle.current) * Math.PI / 180;
          transform = `translate3d(${Math.sin(theta) * radius}px, ${-Math.cos(theta) * radius}px, 0) rotate(${Math.sin(theta) * 28}deg) scale(.58)`;
          shell.style.zIndex = 10 + Math.round(Math.sin(theta) * 3);
          shell.style.setProperty('--card-dim', 0);
        }
        shell.style.transform = transform; shell.style.opacity = opacity;
      });
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [expanded, selected, paused, hovered]);
  const expand = index => {
    select(index); setExpanded(true); setPaused(true);
    requestAnimationFrame(() => stage.current.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }));
  };
  const activate = index => {
    if (!expanded) expand(index);
    else if (index !== selected) select(index);
    else setFlipped(value => !value);
  };
  return <div className={`research-deck ${expanded ? 'expanded' : ''}`} ref={root} onKeyDown={event => {
    if (event.key === 'Escape' && expanded) { event.preventDefault(); back(); }
    if (event.key.toLowerCase() === 'f' && expanded) { event.preventDefault(); setFlipped(value => !value); }
    if (['ArrowLeft','ArrowRight'].includes(event.key)) { event.preventDefault(); select(selected + (event.key === 'ArrowRight' ? 1 : -1)); }
  }}>
    <div className="deck-stage" ref={stage} tabIndex={0} role="group" aria-label="四张研究双面牌，可使用左右键选择，点击展开">
      <div className="deck-core" aria-hidden="true"><div className="deck-moon" /><span>{expanded ? `${item.roman} / ${item.title}` : current.title}</span><small>{expanded ? 'F 翻面 / ESC 返回' : '四个子案例 / I — IV'}</small></div>
      {expanded && <button className="deck-back" onClick={back}>← 返回圆环</button>}
      {researchCases.map((researchCase, index) => <div className="deck-shell" ref={el => shells.current[index] = el} key={researchCase.id}>
        <button className={`deck-card ${expanded && index === selected && flipped ? 'flipped' : ''} ${!expanded ? 'ring-card' : ''}`} onClick={() => activate(index)} onMouseEnter={() => setHovered(index)} onMouseLeave={() => setHovered(null)} onFocus={() => setHovered(index)} onBlur={() => setHovered(null)} aria-pressed={expanded && selected === index} aria-label={expanded && selected === index ? `翻看${researchCase.title}的${flipped ? '封面' : '研究问题'}` : `展开子案例 ${researchCase.roman}：${researchCase.title}`}><span className="card-inner"><span className="card-face card-front"><img src={researchCase.image} alt="" draggable="false" /><span className="card-border" /><span className="card-number">{researchCase.roman} / RESEARCH</span><span className="card-name"><small>{researchCase.english}</small><strong>{researchCase.title}</strong><em>{researchCase.stage}</em></span></span><span className="card-face card-back"><span className="card-number">{researchCase.roman} / QUESTION</span><span className="card-geometry" aria-hidden="true">✧</span><span className="card-question">{researchCase.question}</span><small>{researchCase.tags.join(' / ')}</small></span></span></button>
      </div>)}
    </div>
    <div className="deck-controls"><button onClick={() => select(selected - 1)} aria-label="上一个研究子案例">←</button><div role="group" aria-label="定位研究子案例">{researchCases.map((researchCase, index) => <button key={researchCase.id} onClick={() => { if (!expanded) expand(index); else select(index); }} aria-pressed={selected === index} aria-label={`定位子案例 ${researchCase.roman}：${researchCase.title}`}>{researchCase.roman}</button>)}</div><button onClick={() => select(selected + 1)} aria-label="下一个研究子案例">→</button><button onClick={() => setPaused(!paused)} aria-pressed={paused} aria-label={paused ? '播放轮转' : '暂停轮转'}>{paused ? '↻' : 'Ⅱ'}</button></div>
    {expanded && <div className="deck-case-info"><div><p className="eyebrow">0{selected + 1} / 04 · {item.status}</p><h3>{item.title}</h3><p>{item.question}</p><span>{item.tags.join(' / ')}</span></div><div><button className="text-link" onClick={() => setFlipped(!flipped)}>翻到{flipped ? '封面' : '研究问题'} <span>↻</span></button><a className="text-link" href={caseUrl(item.id)}>阅读完整子案例 <span>↗</span></a></div></div>}
    <p className="deck-instructions">{expanded ? '点击中央卡牌或按 F 翻面；左右键切换，Escape 返回圆环。' : '悬停或聚焦可翻牌，点击展开。使用左右键选择子案例。'}</p>
    <p className="sr-only" aria-live="polite">{expanded ? `已展开${item.title}，当前为${flipped ? '研究问题面' : '封面'}` : '四个研究子案例围绕中心轮转'}</p>
  </div>;
}
