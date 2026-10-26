import { useEffect, useRef } from 'react';

export default function OrbitWorld({ active }) {
  const canvasRef = useRef(null);
  const activeRef = useRef(active);
  useEffect(() => { activeRef.current = active; }, [active]);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let width = 0, height = 0, frame = 0, rotation = 0, tilt = -.3, dragging = false, lastX = 0, lastY = 0, previousTime = 0;
    const points = Array.from({ length: 1100 }, (_, index) => {
      const y = 1 - index / 1099 * 2;
      const radius = Math.sqrt(1 - y * y);
      const angle = index * 2.39996323;
      return [Math.cos(angle) * radius, y, Math.sin(angle) * radius, false];
    });
    for (let i = 0; i < 1300; i++) {
      const angle = i * 2.39996323;
      const radius = 1.3 + ((i * 37) % 100) / 100 * .6;
      points.push([Math.cos(angle) * radius, 0, Math.sin(angle) * radius, true]);
    }
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width; height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr; canvas.height = height * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = time => {
      frame = requestAnimationFrame(draw);
      const elapsed = Math.min(40, time - previousTime); previousTime = time;
      if (!activeRef.current || document.hidden) return;
      if (!dragging && !media.matches) rotation += elapsed * .000045;
      context.clearRect(0, 0, width, height);
      const radius = Math.min(width * .26, height * .4);
      const projected = points.map(([px, py, pz, ring]) => {
        const x = px * Math.cos(rotation) + pz * Math.sin(rotation);
        const z = -px * Math.sin(rotation) + pz * Math.cos(rotation);
        const y = py * Math.cos(tilt) - z * Math.sin(tilt);
        const depth = py * Math.sin(tilt) + z * Math.cos(tilt);
        const perspective = 4 / (4 + depth);
        return { x: width * .57 + x * radius * perspective, y: height * .47 + y * radius * perspective, depth, ring, size: perspective * (ring ? .7 : 1.15) };
      }).sort((a,b) => b.depth - a.depth);
      for (const p of projected) {
        context.fillStyle = p.ring ? `rgba(228,255,58,${.20 + (2 - p.depth) * .13})` : `rgba(255,255,255,${.18 + (1 - p.depth) * .28})`;
        context.beginPath(); context.arc(p.x, p.y, p.size, 0, Math.PI * 2); context.fill();
      }
    };
    const down = event => { dragging = true; lastX = event.clientX; lastY = event.clientY; canvas.setPointerCapture(event.pointerId); };
    const move = event => { if (!dragging) return; rotation += (event.clientX - lastX) * .008; tilt = Math.max(-1.2, Math.min(1.2, tilt + (event.clientY - lastY) * .004)); lastX = event.clientX; lastY = event.clientY; };
    const up = () => { dragging = false; };
    const keys = event => {
      if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) {
        event.preventDefault(); event.stopPropagation();
        if (event.key === 'ArrowLeft') rotation -= .15;
        if (event.key === 'ArrowRight') rotation += .15;
        if (event.key === 'ArrowUp') tilt -= .1;
        if (event.key === 'ArrowDown') tilt += .1;
      }
    };
    const observer = new ResizeObserver(resize); observer.observe(canvas); resize();
    canvas.addEventListener('pointerdown', down); canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up); canvas.addEventListener('lostpointercapture', up); canvas.addEventListener('keydown', keys);
    frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); canvas.removeEventListener('pointerdown', down); canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerup', up); canvas.removeEventListener('pointercancel', up); canvas.removeEventListener('lostpointercapture', up); canvas.removeEventListener('keydown', keys); };
  }, []);
  return <canvas ref={canvasRef} className="orbit-world" tabIndex={0} aria-label="可交互粒子星球，拖动或使用方向键旋转" role="img" />;
}
