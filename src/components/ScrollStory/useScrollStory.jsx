import { useEffect, useRef, useState } from 'react';

export const chapters = [
  { id: 'home', label: '关于我' },
  { id: 'works', label: '游戏作品' },
  { id: 'virtual-human', label: '虚拟人' },
  { id: 'contact', label: '联系我' },
];
const clamp = (n, low = 0, high = 1) => Math.min(high, Math.max(low, n));

// The native document scroll is the timeline: no wheel interception or scroll lock.
export function useScrollStory() {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const progressRef = useRef(0);
  const [active, setActive] = useState(0);

  const goTo = (index, behavior = 'smooth') => {
    const container = containerRef.current;
    if (!container) return;
    const top = container.getBoundingClientRect().top + window.scrollY;
    const travel = container.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + travel * index / (chapters.length - 1), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : behavior });
  };

  useEffect(() => {
    const container = containerRef.current;
    const stage = stageRef.current;
    if (!container || !stage) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduced = media.matches;
    let frame = 0;
    let previous = -1;
    const panels = [...stage.querySelectorAll('[data-panel]')];
    const letters = [...stage.querySelectorAll('[data-letter]')];
    const draw = () => {
      frame = 0;
      const travel = container.offsetHeight - window.innerHeight;
      const progress = clamp(-container.getBoundingClientRect().top / Math.max(1, travel)) * (chapters.length - 1);
      progressRef.current = progress;
      const current = Math.round(progress);
      if (current !== previous) { previous = current; setActive(current); }
      stage.style.setProperty('--story-progress', progress / (chapters.length - 1));
      panels.forEach((panel, index) => {
        const distance = progress - index;
        const magnitude = Math.abs(distance);
        const phase = clamp((magnitude - .13) / .77);
        // Each world clears before the next arrives, so palettes never muddy each other.
        const opacity = reduced ? Number(current === index) : 1 - clamp((magnitude - .16) / .32);
        panel.style.opacity = opacity;
        panel.style.visibility = magnitude > 1.05 || (reduced && current !== index) ? 'hidden' : 'visible';
        panel.style.pointerEvents = current === index ? 'auto' : 'none';
        panel.inert = current !== index;
        panel.setAttribute('aria-hidden', String(current !== index));
        panel.querySelectorAll('[data-content]').forEach(content => {
          content.style.opacity = reduced ? Number(current === index) : 1 - clamp((magnitude - .08) / .26);
          content.style.transform = reduced ? '' : `translate3d(0, ${Math.sign(distance) * -phase * 65}px, 0)`;
        });
        const image = panel.querySelector('[data-portrait]');
        if (image) image.style.transform = reduced ? '' : `scale(${1 + phase * .12}) translate3d(${phase * -8}%, 0, 0)`;
      });
      letters.forEach(letter => {
        const index = Number(letter.dataset.scene);
        const position = Number(letter.dataset.letter);
        const distance = progress - index;
        const phase = clamp((Math.abs(distance) - .08) / .92);
        const sign = distance >= 0 ? 1 : -1;
        const spread = position - Number(letter.dataset.center);
        const depth = sign > 0 ? phase * 920 : -phase * 1650;
        const spin = ((position % 3) - 1) * phase;
        letter.style.transform = reduced ? '' : `translate3d(${spread * phase * 28}px, ${spin * 80}px, ${depth}px) rotateX(${spin * 48}deg) rotateY(${sign * phase * (spread * 16 + 20)}deg) rotateZ(${spin * 7}deg)`;
      });
    };
    const requestDraw = () => { if (!frame) frame = requestAnimationFrame(draw); };
    const motionChange = () => { reduced = media.matches; requestDraw(); };
    const hashChange = () => {
      const hash = window.location.hash.slice(1);
      const index = hash === 'about' ? 3 : chapters.findIndex(c => c.id === hash);
      if (index >= 0) goTo(index);
    };
    const keys = event => {
      if (document.querySelector('[aria-modal="true"]') || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.target.closest('input, textarea, select, [contenteditable], canvas')) return;
      if (event.target.closest('button, a') && event.key === ' ') return;
      const index = Math.round(progressRef.current);
      if (['ArrowDown', 'PageDown'].includes(event.key) || (event.key === ' ' && !event.shiftKey)) { event.preventDefault(); goTo(Math.min(3, index + 1)); }
      if (['ArrowUp', 'PageUp'].includes(event.key) || (event.key === ' ' && event.shiftKey)) { event.preventDefault(); goTo(Math.max(0, index - 1)); }
      if (event.key === 'Home') { event.preventDefault(); goTo(0); }
      if (event.key === 'End') { event.preventDefault(); goTo(3); }
    };
    window.addEventListener('scroll', requestDraw, { passive: true });
    window.addEventListener('resize', requestDraw);
    window.addEventListener('hashchange', hashChange);
    window.addEventListener('keydown', keys);
    media.addEventListener('change', motionChange);
    draw();
    if (window.location.hash) requestAnimationFrame(hashChange);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', requestDraw);
      window.removeEventListener('resize', requestDraw);
      window.removeEventListener('hashchange', hashChange);
      window.removeEventListener('keydown', keys);
      media.removeEventListener('change', motionChange);
    };
  }, []);
  return { containerRef, stageRef, active, goTo };
}

export function KineticTitle({ lines, scene, className = '' }) {
  return <div className={`kinetic-title ${className}`} aria-hidden="true">{lines.map((line, row) => <div className={`kinetic-line line-${row}`} key={row}>{[...line].map((character, index) => <span key={index} data-letter={index} data-scene={scene} data-center={(line.length - 1) / 2}>{character === ' ' ? '\u00a0' : character}</span>)}</div>)}</div>;
}
