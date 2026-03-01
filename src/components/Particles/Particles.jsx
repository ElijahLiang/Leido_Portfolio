import { useEffect, useRef } from 'react';
import './Particles.css';

export default function Particles({ count = 80 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let w, h;
    let paused = false;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const mouse = { x: w / 2, y: h / 2 };
    const onMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener('mousemove', onMove);

    const onVisibility = () => {
      paused = document.hidden;
      if (!paused) animId = requestAnimationFrame(draw);
    };
    document.addEventListener('visibilitychange', onVisibility);

    const dots = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.5 + 0.2,
    }));

    // Only connect particles within this distance
    const CONNECT_DIST = 110;
    const MOUSE_DIST = 180;

    const draw = () => {
      if (paused) return;
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0) d.x = w;
        else if (d.x > w) d.x = 0;
        if (d.y < 0) d.y = h;
        else if (d.y > h) d.y = 0;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(158,203,255,${d.alpha})`;
        ctx.fill();
      }

      for (let i = 0; i < dots.length; i++) {
        const a = dots[i];
        // particle-particle lines (only check j > i to avoid duplicates)
        for (let j = i + 1; j < dots.length; j++) {
          const b = dots[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < CONNECT_DIST * CONNECT_DIST) {
            const t = 1 - distSq / (CONNECT_DIST * CONNECT_DIST);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(158,203,255,${0.15 * t})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
        // mouse lines
        const mdx = a.x - mouse.x;
        const mdy = a.y - mouse.y;
        const mDistSq = mdx * mdx + mdy * mdy;
        if (mDistSq < MOUSE_DIST * MOUSE_DIST) {
          const t = 1 - mDistSq / (MOUSE_DIST * MOUSE_DIST);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(255,251,192,${0.25 * t})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [count]);

  return <canvas ref={canvasRef} className="particles-canvas" />;
}
