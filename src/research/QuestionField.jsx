import { useEffect, useRef } from 'react';
import { researchCases } from './data';

export default function QuestionField() {
  const canvasRef = useRef(null), target = useRef(0);
  useEffect(() => {
    const canvas = canvasRef.current, context = canvas.getContext('2d');
    if (!context) return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    let width = 0, height = 0, frame = 0, angle = 0, previous = 0, pointer = 0;
    const resize = () => { const box = canvas.getBoundingClientRect(); width = box.width; height = box.height; const dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = width * dpr; canvas.height = height * dpr; context.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const draw = time => {
      frame = requestAnimationFrame(draw);
      const dt = Math.min(40, time - previous); previous = time;
      if (document.hidden) return;
      if (!media.matches) angle += dt * .000035;
      pointer += (target.current - pointer) * .035;
      context.clearRect(0,0,width,height);
      const centerX = width * .53, centerY = height * .52, radius = Math.min(width * .44, height * .36), length = height * .45;
      const point = (theta, distance, side) => {
        const a = theta + angle + pointer * .25;
        return [centerX + Math.cos(a) * radius * distance, centerY + side * length * distance + Math.sin(a) * radius * distance * .25];
      };
      context.lineWidth = .6;
      for (const side of [-1, 1]) {
        for (let ring = 1; ring <= 10; ring++) {
          const distance = ring / 10; context.strokeStyle = `rgba(205,212,196,${.04 + distance * .06})`; context.beginPath();
          for (let i = 0; i <= 100; i++) { const p = point(i / 100 * Math.PI * 2,distance,side); i ? context.lineTo(...p) : context.moveTo(...p); } context.stroke();
        }
        for (let line = 0; line < 48; line++) {
          const theta = line / 48 * Math.PI * 2, end = point(theta,1,side); context.strokeStyle='rgba(205,212,196,.085)'; context.beginPath(); context.moveTo(centerX,centerY); context.lineTo(...end); context.stroke();
          for (let step = 1; step < 15; step++) { const distance = ((step * 37 + line * 13) % 100) / 100, p = point(theta,distance,side); context.fillStyle=`rgba(216,220,210,${.12 + distance * .24})`; context.fillRect(p[0],p[1],1.1,1.1); }
        }
      }
      context.fillStyle='#eeeee8'; context.fillRect(centerX-2,centerY-2,4,4);
      context.font='9px monospace'; context.fillStyle='#c4cbbd'; context.fillText('NOW / 此刻',centerX+14,centerY+3);
    };
    const observer = new ResizeObserver(resize); observer.observe(canvas); resize(); frame=requestAnimationFrame(draw);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, []);
  return <div className="question-field" onPointerMove={event => { const box=event.currentTarget.getBoundingClientRect(); target.current=(event.clientX-box.left)/box.width-.5; }} onPointerLeave={() => target.current=0}><canvas ref={canvasRef} aria-hidden="true" /><span className="field-axis top">UNKNOWN / 未知</span><span className="field-axis bottom">KNOWN / 已知</span><div className="field-questions">{researchCases.map((item,index) => <p style={{ '--index':index }} key={item.id}>{item.question}</p>)}</div></div>;
}
