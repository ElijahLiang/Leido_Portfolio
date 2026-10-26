import { useEffect, useRef } from 'react';

// A pointer companion whose shape is set per world in CSS. Fine pointers only.
export default function WorldCursor() {
  const ref = useRef(null);
  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!fine.matches || reduced.matches) return;
    const node = ref.current;
    let x = -100, y = -100, cx = -100, cy = -100, frame = 0;
    const draw = () => {
      cx += (x - cx) * .22; cy += (y - cy) * .22;
      node.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      frame = Math.abs(x - cx) + Math.abs(y - cy) > .3 ? requestAnimationFrame(draw) : 0;
    };
    const move = event => {
      x = event.clientX; y = event.clientY;
      node.dataset.hover = String(Boolean(event.target.closest?.('a, button, canvas')));
      node.dataset.visible = 'true';
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const leave = () => { node.dataset.visible = 'false'; };
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('pointermove', move); document.documentElement.removeEventListener('pointerleave', leave); };
  }, []);
  return <div className="world-cursor" ref={ref} aria-hidden="true"><span /></div>;
}
