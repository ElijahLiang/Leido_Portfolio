import { useRef, useState, useEffect } from 'react';
import Matter from 'matter-js';
import './SkillCloud.css';

const SKILLS = [
  { label: '系统设计',        color: '#4ff8f5' },
  { label: 'vibe coding',     color: '#a8ffae' },
  { label: 'machine learning',color: '#4ff8f5' },
  { label: 'shader',          color: '#ffb347' },
  { label: 'processing',      color: '#a8ffae' },
  { label: 'unity',           color: '#c8b4f8' },
  { label: 'python',          color: '#4ff8f5' },
  { label: '集成设计',        color: '#ffb347' },
  { label: '架构设计',        color: '#c8b4f8' },
];

export default function SkillCloud() {
  const containerRef      = useRef(null);
  const chipsRef          = useRef(null);
  const canvasContainerRef = useRef(null);
  const engineRef         = useRef(null);
  const runnerRef         = useRef(null);
  const renderRef         = useRef(null);
  const rafRef            = useRef(null);
  const [started, setStarted] = useState(false);

  /* Trigger on scroll */
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  /* Physics setup */
  useEffect(() => {
    if (!started) return;

    const { Engine, Render, World, Bodies, Runner, Mouse, MouseConstraint } = Matter;

    const containerRect = containerRef.current.getBoundingClientRect();
    const width  = containerRect.width;
    const height = containerRect.height;
    if (width <= 0 || height <= 0) return;

    const engine = Engine.create();
    engine.world.gravity.y = 1.2;
    engineRef.current = engine;

    /* Transparent canvas — just carries the mouse constraint */
    const render = Render.create({
      element: canvasContainerRef.current,
      engine,
      options: { width, height, background: 'transparent', wireframes: false },
    });
    renderRef.current = render;

    const wall = { isStatic: true, render: { fillStyle: 'transparent' } };
    const floor     = Bodies.rectangle(width / 2, height + 25, width,  50, wall);
    const leftWall  = Bodies.rectangle(-25,        height / 2, 50,  height, wall);
    const rightWall = Bodies.rectangle(width + 25, height / 2, 50,  height, wall);

    /* Create one body per chip, measured from their initial DOM position */
    const chipSpans = chipsRef.current.querySelectorAll('.skill-chip');
    const chipBodies = [...chipSpans].map(elem => {
      const rect = elem.getBoundingClientRect();
      const x = rect.left - containerRect.left + rect.width  / 2;
      const y = rect.top  - containerRect.top  + rect.height / 2;

      const body = Bodies.rectangle(x, y, rect.width, rect.height, {
        render:     { fillStyle: 'transparent' },
        restitution: 0.35,
        frictionAir: 0.025,
        friction:    0.15,
        chamfer:     { radius: 14 },
      });
      Matter.Body.setVelocity(body,        { x: (Math.random() - 0.5) * 3, y: 0 });
      Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.06);
      return { elem, body };
    });

    /* Switch chips to absolute positioning at their current location */
    chipBodies.forEach(({ elem, body }) => {
      elem.style.position  = 'absolute';
      elem.style.left      = `${body.position.x}px`;
      elem.style.top       = `${body.position.y}px`;
      elem.style.transform = 'translate(-50%, -50%)';
    });

    const mouse = Mouse.create(containerRef.current);
    const mc    = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.2, render: { visible: false } },
    });
    render.mouse = mouse;

    World.add(engine.world, [floor, leftWall, rightWall, mc, ...chipBodies.map(cb => cb.body)]);

    const runner = Runner.create();
    runnerRef.current = runner;
    Runner.run(runner, engine);
    Render.run(render);

    const loop = () => {
      chipBodies.forEach(({ body, elem }) => {
        elem.style.left      = `${body.position.x}px`;
        elem.style.top       = `${body.position.y}px`;
        elem.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`;
      });
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(rafRef.current);
      Render.stop(render);
      Runner.stop(runner);
      if (render.canvas && canvasContainerRef.current?.contains(render.canvas)) {
        canvasContainerRef.current.removeChild(render.canvas);
      }
      World.clear(engine.world);
      Engine.clear(engine);
    };
  }, [started]);

  return (
    <div ref={containerRef} className="skill-cloud-container">
      <div ref={chipsRef} className="skill-chips-layer">
        {SKILLS.map(({ label, color }) => (
          <span key={label} className="skill-chip" style={{ '--chip-color': color }}>
            {label}
          </span>
        ))}
      </div>
      <div ref={canvasContainerRef} className="skill-cloud-canvas" />
    </div>
  );
}
