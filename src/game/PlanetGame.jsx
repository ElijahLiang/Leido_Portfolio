import { useEffect, useMemo, useRef, useState } from 'react';
import avatar from '../assets/avatar.webp';
import { Astronaut, ContactSheet, Decor, FarThing, PlanetBody, Profile, Sparkle, SpotArt } from './Art';
import StageCard from './StageCard';
import { stages } from './stages';
import useModal from './useModal';
import { achievements, cabinetIds, decor, demoIds, farScenery, R, rad, scripts, spots, stars, wrap, XP_PER_LEVEL, xpOf, zoneAt, zones } from './world';
import { play, setMuted, unlockAudio } from './sfx';
import './game.css';

const STORE = 'leido-planet-v1';
const SESSION = 'leido-planet-session';
const GRAVITY = 2600, LOW_GRAVITY = 900, JUMP = 1080, WALK = 560, AUTO = 980, REACH = 95;
const KONAMI = 'ArrowUp,ArrowUp,ArrowDown,ArrowDown,ArrowLeft,ArrowRight,ArrowLeft,ArrowRight,b,a';
const blank = { stars: [], achievements: [], seen: [], muted: false };
const stageDemo = spot => stages[spot.project?.number]?.minigame;

// Storage can be missing or throw (private mode, previews); the game must run without it.
function read(area, key) {
  try { return JSON.parse(window[area].getItem(key)); } catch { return null; }
}
function write(area, key, value) {
  try { window[area].setItem(key, JSON.stringify(value)); } catch { /* progress just won't persist */ }
}

function startingPoint() {
  const hash = window.location.hash.slice(1);
  const zone = hash === 'about' ? 3 : zones.findIndex(z => z.id === hash);
  if (zone >= 0) return { phase: 'play', theta: rad(zones[zone].angle), back: true };
  const session = read('sessionStorage', SESSION);
  if (Number.isFinite(session?.theta)) return { phase: 'play', theta: session.theta, back: true };
  return { phase: 'title', theta: rad(-50), back: false };
}

function useMedia(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const change = () => setMatches(media.matches);
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, [query]);
  return matches;
}

export default function PlanetGame() {
  const initial = useMemo(startingPoint, []);
  const reduced = useMedia('(prefers-reduced-motion: reduce)');
  const coarse = useMedia('(hover: none), (pointer: coarse)');
  const [touched, setTouched] = useState(false);
  const touch = coarse || touched;

  const [phase, setPhase] = useState(initial.phase);
  const [zone, setZone] = useState(() => initial.phase === 'title' ? 0 : zoneAt(initial.theta));
  const [near, setNear] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [card, setCard] = useState(null);
  const [menu, setMenu] = useState(null);
  const [cutscene, setCutscene] = useState(null);
  const [inserting, setInserting] = useState(null);
  const [banner, setBanner] = useState(null);
  const [speech, setSpeech] = useState(null);
  const [toasts, setToasts] = useState([]);
  const progressRef = useRef(null);
  if (!progressRef.current) progressRef.current = { ...blank, ...read('localStorage', STORE) };
  const [progress, setProgress] = useState(progressRef.current);

  const freshStars = useRef(new Set());
  const stageRef = useRef(null), worldRef = useRef(null), farRef = useRef(null), playerRef = useRef(null), markerRef = useRef(null);
  const game = useRef(null);
  if (!game.current) game.current = { theta: initial.theta, v: 0, h: initial.back ? 260 : 0, vy: 0, facing: 1, left: 0, right: 0, holdJump: false, target: null, arrive: null, min: initial.theta, max: initial.theta, walk: 0, pose: 'idle', lowGravity: false, keys: [], near: null, zone: initial.phase === 'title' ? 0 : zoneAt(initial.theta) };

  const overlay = Boolean(dialog || card || menu || inserting);
  const ui = useRef({});
  ui.current = { phase, overlay, cutscene, reduced, touch };

  const level = 1 + Math.floor(xpOf(progress) / XP_PER_LEVEL);
  const levelRef = useRef(level);
  const timers = useRef(new Set());
  const later = (fn, ms) => { const id = setTimeout(() => { timers.current.delete(id); fn(); }, ms); timers.current.add(id); };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // ---------- progress, toasts, speech ----------
  const update = change => {
    const next = change(progressRef.current);
    progressRef.current = next;
    setProgress(next);
    write('localStorage', STORE, next);
  };
  const toast = item => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(list => [...list.slice(-2), { ...item, id }]);
    later(() => setToasts(list => list.filter(entry => entry.id !== id)), 3400);
  };
  const say = (text, ms = 2600) => {
    const id = Math.random();
    setSpeech({ text, id });
    later(() => setSpeech(current => current?.id === id ? null : current), ms);
  };
  const showBanner = index => {
    const id = Math.random();
    setBanner({ index, id });
    later(() => setBanner(current => current?.id === id ? null : current), 2600);
  };
  const award = id => {
    if (progressRef.current.achievements.includes(id)) return;
    update(p => ({ ...p, achievements: [...p.achievements, id] }));
    const item = achievements.find(a => a.id === id);
    toast({ kind: 'trophy', title: item.title, text: item.text });
    play('achieve');
  };
  const markSeen = id => {
    if (progressRef.current.seen.includes(id)) return;
    update(p => ({ ...p, seen: [...p.seen, id] }));
    if (cabinetIds.every(c => progressRef.current.seen.includes(c))) award('arcade');
  };
  const collect = star => {
    if (progressRef.current.stars.includes(star.id)) return;
    play('star');
    freshStars.current.add(star.id);
    update(p => ({ ...p, stars: [...p.stars, star.id] }));
    const count = progressRef.current.stars.length;
    if (count === 1) award('star');
    if (count === stars.length) { award('stars'); later(() => setDialog({ key: 'allStars' }), 900); }
  };
  const toggleMute = () => {
    const muted = !progressRef.current.muted;
    setMuted(muted);
    update(p => ({ ...p, muted }));
  };
  useEffect(() => { setMuted(progress.muted); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (level > levelRef.current) { toast({ kind: 'level', title: 'LEVEL UP!', text: `探索等级提升到 LV.${level}` }); play('level'); }
    levelRef.current = level;
  }, [level]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- world palette follows the zone the astronaut stands in ----------
  useEffect(() => {
    document.documentElement.dataset.world = phase === 'title' ? 'cosmos' : zones[zone].world;
  }, [zone, phase]);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('is-game');
    return () => root.classList.remove('is-game');
  }, []);

  // ---------- actions ----------
  const openDialog = key => setDialog({ key, id: Math.random() });
  const interact = spot => {
    markSeen(spot.id);
    if (spot.kind === 'cabinet') {
      // The coin drops into the slot, the screen flashes, then the briefing opens.
      play('coin');
      setInserting(spot.id);
      later(() => { setInserting(null); setCard({ type: 'project', spot }); }, ui.current.reduced ? 0 : 650);
      return;
    }
    play('open');
    if (spot.kind === 'frame') setCard({ type: 'project', spot });
    else if (spot.kind === 'scope') setCard({ type: 'profile' });
    else if (spot.kind === 'mailbox') { setCard({ type: 'contact' }); award('mail'); }
    else if (spot.kind === 'npc') { openDialog('npc'); award('npc'); }
    else openDialog(spot.id === 'rocket' ? 'rocket' : spot.id);
  };
  const interactNear = () => {
    const spot = spots.find(s => s.id === game.current.near);
    if (spot) { face(spot); interact(spot); }
    else { play('bonk'); say('这里好像什么也没有……', 1600); }
  };
  const face = spot => {
    const direction = Math.sign(wrap(rad(spot.angle) - game.current.theta));
    if (direction && playerRef.current) { game.current.facing = direction; playerRef.current.dataset.facing = direction; }
  };
  const goTo = (spot, andInteract = true) => {
    const { phase: current, overlay: busy, cutscene: scene } = ui.current;
    if (current !== 'play' || busy || scene) return;
    const g = game.current;
    const arrive = () => { face(spot); if (andInteract) interact(spot); };
    if (g.near === spot.id && andInteract) { g.target = null; arrive(); return; }
    const side = wrap(rad(spot.angle) - g.theta) > 0 ? -1 : 1;
    const distance = wrap(rad(spot.angle + side * (spot.stand ?? 0)) - g.theta);
    if (ui.current.reduced) { g.theta += distance; arrive(); return; }
    g.target = g.theta + distance;
    g.arrive = arrive;
  };
  const jump = () => {
    const g = game.current;
    g.holdJump = true;
    if (g.h > 0 || ui.current.overlay || ui.current.cutscene || ui.current.phase !== 'play') return;
    g.vy = g.lowGravity ? 760 : JUMP;
    g.h = .01;
    play('jump');
    playerRef.current?.querySelector('.astronaut')?.animate?.([{ transform: 'scale(.82, 1.2)' }, { transform: 'scale(1)' }], { duration: 220, easing: 'ease-out' });
  };
  const start = () => {
    if (ui.current.phase !== 'title' || ui.current.starting) return;
    ui.current.starting = true;
    unlockAudio();
    play('start');
    setPhase('landing');
    later(() => {
      const g = game.current;
      g.h = 760; g.vy = 0; g.min = g.max = g.theta;
      setPhase('play');
      showBanner(0);
      award('start');
      later(() => say(touch ? '用 ◀ ▶ 到处走走看吧！' : '用 ← → 到处走走看吧！'), 900);
    }, ui.current.reduced ? 60 : 1500);
  };
  const launch = () => {
    setDialog(null);
    setCutscene('launch');
    play('rocket');
    const quick = ui.current.reduced;
    later(() => setCutscene('warp'), quick ? 0 : 1500);
    later(() => {
      const g = game.current;
      g.theta = Math.round(g.theta / (Math.PI * 2)) * Math.PI * 2;
      g.h = 760; g.vy = 0; g.v = 0; g.target = null;
      g.min = g.max = g.theta;
      setCutscene(null);
      award('rocket');
    }, quick ? 120 : 1900);
  };
  const toggleLowGravity = () => {
    const g = game.current;
    g.lowGravity = !g.lowGravity;
    award('konami');
    say(g.lowGravity ? '身体变轻了！（低重力模式）' : '重力恢复正常。');
  };
  const copy = async (text, what) => {
    try { await navigator.clipboard.writeText(text); toast({ kind: 'info', title: '已复制', text: `${what}：${text}` }); }
    catch { toast({ kind: 'info', title: what, text }); }
  };
  const resetProgress = () => {
    update(() => ({ ...blank, muted: progressRef.current.muted }));
    levelRef.current = 1;
    setMenu(null);
    toast({ kind: 'info', title: '进度已重置', text: '星星和成就都回到了原处。' });
  };
  const actions = useRef({});
  actions.current = { start, jump, interactNear, goTo, collect, award, toggleMute, toggleLowGravity, say, landed: impact => {
    if (impact < 380) return;
    play('land');
    const body = playerRef.current?.querySelector('.astronaut');
    body?.animate?.([{ transform: 'scale(1.22, .78)' }, { transform: 'scale(1)' }], { duration: 240, easing: 'ease-out' });
    const feet = playerRef.current?.querySelector('.player-body');
    if (!feet || ui.current.reduced) return;
    for (let i = 0; i < 6; i++) {
      const puff = document.createElement('i');
      puff.className = 'dust';
      feet.append(puff);
      const side = i % 2 ? 1 : -1;
      puff.animate([{ transform: 'translate(-50%, 0) scale(1)', opacity: .9 }, { transform: `translate(calc(-50% + ${side * (30 + i * 12)}px), ${-10 - i * 4}px) scale(.3)`, opacity: 0 }], { duration: 420 + i * 40, easing: 'ease-out' }).onfinish = () => puff.remove();
    }
  }, zone: index => {
    setZone(index);
    if (ui.current.phase !== 'play') return;
    showBanner(index);
    play('zone');
  }, near: id => setNear(id) };

  // ---------- layout: fit the planet to the viewport ----------
  useEffect(() => {
    const stage = stageRef.current;
    const layout = () => {
      const width = stage.clientWidth, height = stage.clientHeight;
      const narrow = width < 760;
      const radius = Math.max(narrow ? 520 : 440, Math.min(width * .72, height * 1.2, 1100));
      const ground = height * (narrow ? .62 : .68);
      const fit = Math.min(width * .94, height * (narrow ? .6 : .66)) / ((R + 340) * 2);
      stage.style.setProperty('--k', radius / R);
      stage.style.setProperty('--cy', `${ground + radius}px`);
      stage.style.setProperty('--k-title', fit);
      stage.style.setProperty('--cy-title', `${height * (narrow ? .64 : .67)}px`);
    };
    const observer = new ResizeObserver(layout);
    observer.observe(stage);
    layout();
    return () => observer.disconnect();
  }, []);

  // ---------- the game loop ----------
  useEffect(() => {
    const g = game.current;
    let frame = 0, last = performance.now();
    const render = () => {
      worldRef.current.style.transform = `rotate(${-g.theta}rad)`;
      farRef.current.style.transform = `rotate(${-g.theta * .35}rad)`;
      playerRef.current.style.setProperty('--h', `${-g.h}px`);
      playerRef.current.style.setProperty('--shadow', Math.max(.2, 1 - g.h / 420));
      if (markerRef.current) markerRef.current.style.transform = `rotate(${g.theta}rad)`;
    };
    const tick = now => {
      frame = requestAnimationFrame(tick);
      const dt = Math.min(.05, (now - last) / 1000);
      last = now;
      if (document.hidden) return;
      const state = ui.current;
      if (state.phase === 'title') { if (!state.reduced) g.theta += dt * .09; render(); return; }
      if (state.phase === 'landing') { g.theta += wrap(-g.theta) * Math.min(1, dt * 2.8); render(); return; }
      const locked = state.overlay || state.cutscene;
      let input = locked ? 0 : g.right - g.left;
      if (input) { g.target = null; g.arrive = null; }
      if (g.target !== null && !locked) {
        const distance = g.target - g.theta;
        if (Math.abs(distance) * R < 3) {
          g.theta = g.target; g.v = 0; g.target = null;
          const arrive = g.arrive; g.arrive = null; arrive?.();
        } else g.v = Math.sign(distance) * Math.min(AUTO, Math.abs(distance) * R * 5 + 40);
      } else {
        const rate = (input ? 3200 : 2800) * dt;
        g.v += Math.max(-rate, Math.min(rate, input * WALK - g.v));
      }
      g.theta += g.v / R * dt;
      if (Math.abs(g.v) > 8 && Math.sign(g.v) !== g.facing) { g.facing = Math.sign(g.v); playerRef.current.dataset.facing = g.facing; }

      if (g.h > 0 || g.vy > 0) {
        const gravity = g.lowGravity ? LOW_GRAVITY : GRAVITY;
        g.vy -= gravity * dt * (g.vy > 0 && !g.holdJump ? 2.4 : 1);
        g.h += g.vy * dt;
        if (g.h <= 0) { const impact = -g.vy; g.h = 0; g.vy = 0; actions.current.landed(impact); }
      }

      g.min = Math.min(g.min, g.theta); g.max = Math.max(g.max, g.theta);
      if (g.max - g.min >= Math.PI * 2) { g.min = g.max = g.theta; actions.current.award('lap'); }

      for (const star of stars) {
        if (progressRef.current.stars.includes(star.id)) continue;
        const dx = wrap(rad(star.angle) - g.theta) * R, dy = star.h + 30 - (g.h + 54);
        if (Math.abs(dx) < 56 && Math.abs(dy) < 80) actions.current.collect(star);
      }

      let best = null, bestDistance = REACH;
      for (const spot of spots) {
        const distance = Math.abs(wrap(rad(spot.angle) - g.theta)) * R - (spot.stand ? R * rad(spot.stand) * .6 : 0);
        if (distance < bestDistance) { best = spot.id; bestDistance = distance; }
      }
      if (best !== g.near) { g.near = best; actions.current.near(best); }
      const zoneIndex = zoneAt(g.theta);
      if (zoneIndex !== g.zone) { g.zone = zoneIndex; actions.current.zone(zoneIndex); }

      g.walk += Math.abs(g.v) * dt;
      const pose = g.h > 0 ? 'jump' : Math.abs(g.v) > 30 && Math.floor(g.walk / 70) % 2 ? 'walk' : 'idle';
      if (pose !== g.pose) { g.pose = pose; playerRef.current.dataset.pose = pose; }
      render();
    };
    frame = requestAnimationFrame(tick);
    const save = () => write('sessionStorage', SESSION, { theta: g.theta });
    window.addEventListener('pagehide', save);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('pagehide', save); };
  }, []);

  // ---------- keyboard ----------
  useEffect(() => {
    const g = game.current;
    const down = event => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (ui.current.phase === 'play') unlockAudio();
      g.keys = [...g.keys, key].slice(-10);
      if (g.keys.join() === KONAMI) { g.keys = []; actions.current.toggleLowGravity(); }
      const state = ui.current;
      const onControl = event.target.closest?.('a, button, input');
      if (state.phase === 'title') {
        // Enter/Space on a focused control click it; any other key presses START.
        const native = onControl && (['Enter', ' '].includes(event.key) || !event.target.closest?.('.press-start'));
        if (!native && !event.repeat && !['Tab', 'Shift', 'Escape'].includes(event.key)) { event.preventDefault(); actions.current.start(); }
        return;
      }
      if (state.phase !== 'play' || state.overlay || state.cutscene) return;
      if (key === 'ArrowLeft' || key === 'a') { event.preventDefault(); g.left = 1; }
      else if (key === 'ArrowRight' || key === 'd') { event.preventDefault(); g.right = 1; }
      else if (key === 'ArrowUp' || key === 'w' || (key === ' ' && !onControl)) { event.preventDefault(); if (!event.repeat) actions.current.jump(); }
      else if ((key === 'e' || key === 'Enter') && !onControl) { event.preventDefault(); actions.current.interactNear(); }
      else if (key === 'Escape' || key === 'p') { event.preventDefault(); setMenu('main'); }
      else if (key === 'm') actions.current.toggleMute();
    };
    const up = event => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (key === 'ArrowLeft' || key === 'a') g.left = 0;
      if (key === 'ArrowRight' || key === 'd') g.right = 0;
      if (key === 'ArrowUp' || key === 'w' || key === ' ') g.holdJump = false;
    };
    const release = () => { g.left = g.right = 0; g.holdJump = false; };
    const firstGesture = () => { if (ui.current.phase === 'play') unlockAudio(); };
    const firstTouch = () => setTouched(true);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', release);
    window.addEventListener('pointerdown', firstGesture);
    window.addEventListener('touchstart', firstTouch, { once: true, passive: true });
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', release);
      window.removeEventListener('pointerdown', firstGesture);
      window.removeEventListener('touchstart', firstTouch);
    };
  }, []);

  useEffect(() => {
    if (window.location.hash) history.replaceState(null, '', window.location.pathname + window.location.search);
    if (initial.back) actions.current.say('欢迎回来！');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const hold = (direction, value) => event => {
    event.preventDefault();
    if (value && event.pointerId !== undefined) event.currentTarget.setPointerCapture?.(event.pointerId);
    game.current[direction] = value;
  };

  const starCount = progress.stars.length;
  const clearCount = demoIds.filter(id => progress.achievements.includes(id)).length;
  const xp = xpOf(progress);
  const nearSpot = spots.find(spot => spot.id === near);
  const currentZone = zones[zone];
  const closeDialog = () => { play('close'); setDialog(null); };
  const choose = choice => {
    play('select');
    if (choice.next) openDialog(choice.next);
    else if (choice.action === 'launch') launch();
    else if (choice.close) closeDialog();
  };

  return <div className="planet-game" ref={stageRef} data-phase={phase} data-near={near ?? undefined} data-cutscene={cutscene ?? undefined} data-touch={touch || undefined} data-banner={banner ? '' : undefined} data-overlay={card || menu ? '' : undefined} data-starry={starCount === stars.length || undefined}>
    <a className="skip-link" href="/games">跳过游戏，直接浏览作品列表</a>
    <div className="game-scene" inert={overlay || phase !== 'play' || undefined}>
      <div className="world-backdrop" aria-hidden="true"><span className="backdrop-cosmos" /><span className="backdrop-arcade" /><span className="backdrop-museum" /><span className="backdrop-orbit" /></div>
      <div className="camera">
        <div className="far-layer" ref={farRef} aria-hidden="true">{farScenery.map(item => <FarThing key={item.angle} item={item} />)}</div>
        <div className="world-layer" ref={worldRef}>
          <PlanetBody />
          {decor.map(item => <div key={`${item.kind}-${item.angle}`} className={`slot decor decor-${item.kind}`} style={{ '--a': `${item.angle}deg` }} aria-hidden="true"><div><Decor item={item} starCount={starCount} starTotal={stars.length} clearCount={clearCount} clearTotal={demoIds.length} /></div></div>)}
          {spots.map(spot => <div key={spot.id} className={`slot spot spot-${spot.kind}${near === spot.id ? ' is-near' : ''}${progress.seen.includes(spot.id) ? ' is-seen' : ''}${inserting === spot.id ? ' is-inserting' : ''}`} style={{ '--a': `${spot.angle}deg` }}>
            <div>
              <SpotArt spot={spot} active={near === spot.id} cleared={spot.project && progress.achievements.includes(stageDemo(spot))} />
              <span className="prompt" aria-hidden="true"><kbd>{touch ? 'B' : 'E'}</kbd>{spot.verb}</span>
              <button className="spot-hit" aria-label={`${spot.verb}：${spot.label}`} onPointerDown={event => event.preventDefault()} onClick={() => actions.current.goTo(spot)} onFocus={event => { if (event.target.matches(':focus-visible')) actions.current.goTo(spot, false); }} />
            </div>
          </div>)}
          {stars.map(star => <div key={star.id} className={`slot star${progress.stars.includes(star.id) ? freshStars.current.has(star.id) ? ' got' : ' gone' : ''}`} style={{ '--a': `${star.angle}deg`, '--lift': `${star.h}px` }} aria-hidden="true"><div><Sparkle /></div></div>)}
        </div>
        <div className="slot player" ref={playerRef} data-pose="idle" data-facing="1" aria-hidden="true">
          <div className="player-shadow" />
          <div className="player-body">
            <Astronaut />
            <span className="vision-tag player-tag">visitor · astronaut 0.98</span>
            {speech && <span className="speech" key={speech.id}>{speech.text}</span>}
          </div>
        </div>
      </div>
      <div className="warp" aria-hidden="true" />
    </div>

    {phase !== 'play' && <TitleScreen onStart={start} leaving={phase === 'landing'} touch={touch} />}

    {phase !== 'title' && <Hud
      progress={progress} level={level} xp={xp} zone={currentZone} zoneIndex={zone} touch={touch}
      near={nearSpot} markerRef={markerRef} inert={overlay}
      onMenu={() => { play('open'); setMenu('main'); }} onTrophies={() => { play('open'); setMenu('trophies'); }} onMute={toggleMute}
      onTravel={spot => actions.current.goTo(spot, false)}
    />}

    {banner && phase === 'play' && <div className="zone-banner" key={banner.id} aria-hidden="true">
      <small>WORLD 0{banner.index + 1}</small><b>{zones[banner.index].name}</b><span>{zones[banner.index].label}</span>
    </div>}

    {touch && phase === 'play' && <div className="touch-pad" aria-hidden="true" inert={overlay || undefined} onContextMenu={event => event.preventDefault()}>
      <div>
        <button tabIndex={-1} onPointerDown={hold('left', 1)} onPointerUp={hold('left', 0)} onPointerCancel={hold('left', 0)}>◀</button>
        <button tabIndex={-1} onPointerDown={hold('right', 1)} onPointerUp={hold('right', 0)} onPointerCancel={hold('right', 0)}>▶</button>
      </div>
      <div>
        <button tabIndex={-1} className={nearSpot ? 'ready' : ''} onPointerDown={event => { event.preventDefault(); actions.current.interactNear(); }}>B<small>{nearSpot?.verb ?? '互动'}</small></button>
        <button tabIndex={-1} onPointerDown={event => { event.preventDefault(); actions.current.jump(); }} onPointerUp={() => { game.current.holdJump = false; }} onPointerCancel={() => { game.current.holdJump = false; }}>A<small>跳跃</small></button>
      </div>
    </div>}

    <div className="toasts" role="status" aria-live="polite">
      {toasts.map(item => <div key={item.id} className={`toast toast-${item.kind}`}><i aria-hidden="true">{item.kind === 'trophy' ? '🏆' : item.kind === 'level' ? '⬆' : '✦'}</i><div><b>{item.kind === 'trophy' ? `成就解锁 · ${item.title}` : item.title}</b><span>{item.text}</span></div></div>)}
    </div>

    {dialog && <DialogBox key={dialog.id ?? dialog.key} script={scripts[dialog.key]} touch={touch} reduced={reduced} onChoose={choose} onClose={closeDialog} />}
    {card?.type === 'project' && <StageCard project={card.spot.project} cleared={progress.achievements.includes(stageDemo(card.spot))} onClose={() => { play('close'); setCard(null); }} onWin={award} />}
    {card && card.type !== 'project' && <Card card={card} onClose={() => { play('close'); setCard(null); }} onCopy={copy} />}
    {menu && <PauseMenu view={menu} setView={setMenu} progress={progress} level={level} onClose={() => { play('close'); setMenu(null); }} onMute={toggleMute} onReset={resetProgress} onTravel={spot => { setMenu(null); requestAnimationFrame(() => actions.current.goTo(spot, false)); }} />}
  </div>;
}

function TitleScreen({ onStart, leaving, touch }) {
  const startRef = useRef(null);
  useEffect(() => { startRef.current?.focus({ preventScroll: true }); }, []);
  return <div className={`title-screen${leaving ? ' leaving' : ''}`} inert={leaving || undefined}>
    <div className="title-top"><span>✳ Leido.</span><span>1 PLAYER · © 2026</span></div>
    <a className="title-skip" href="/games">只想快速看作品？<b>列表模式 ↗</b></a>
    <div className="title-logo">
      <p>GAME DESIGNER &amp; <em>creative developer</em></p>
      <h1>LEIDO<span>.</span></h1>
      <p className="title-tagline">把一个念头，变成可以玩的世界。</p>
    </div>
    <button className="press-start" ref={startRef} onClick={onStart}><span>▶ PRESS START</span><small>{touch ? '轻点开始' : '按任意键 / 点击开始'}</small></button>
  </div>;
}

function Hud({ progress, level, xp, zone, zoneIndex, touch, near, markerRef, inert, onMenu, onTrophies, onMute, onTravel }) {
  const inLevel = (xp % XP_PER_LEVEL) / XP_PER_LEVEL;
  return <div className="hud" inert={inert || undefined}>
    <div className="hud-player">
      <img src={avatar} alt="" />
      <div><b>LEIDO <span>LV.{level}</span></b><span className="xp" role="meter" aria-label="探索经验" aria-valuemin={0} aria-valuemax={XP_PER_LEVEL} aria-valuenow={xp % XP_PER_LEVEL}><i style={{ width: `${inLevel * 100}%` }} /></span></div>
    </div>
    <div className="hud-zone"><small>WORLD 0{zoneIndex + 1}</small><b>{zone.name}</b><span>{zone.label}</span></div>
    <div className="hud-right">
      <span className="hud-count" role="img" aria-label={`已收集星星 ${progress.stars.length} / ${stars.length}`}><Sparkle /><span className="bump" key={progress.stars.length}>{String(progress.stars.length).padStart(2, '0')}</span><small>/{stars.length}</small></span>
      <button className="hud-count" onClick={onTrophies} aria-label={`成就 ${progress.achievements.length} / ${achievements.length}`}>🏆 <span className="bump" key={progress.achievements.length}>{progress.achievements.length}</span><small>/{achievements.length}</small></button>
      <button className="hud-icon" onClick={onMute} aria-label={progress.muted ? '打开音效' : '关闭音效'} aria-pressed={!progress.muted}>{progress.muted ? '🔇' : '🔊'}</button>
      <button className="hud-button" onClick={onMenu}>MENU</button>
      <a className="hud-link" href="/games">作品列表 ↗</a>
    </div>
    <p className="hud-hint" aria-live="polite">
      {near ? <><kbd>{touch ? 'B' : 'E'}</kbd>{near.verb} · {near.label}</> : touch ? '◀ ▶ 移动 · A 跳跃 · 点击星球上的东西直接前往' : <><kbd>←</kbd><kbd>→</kbd>移动 <kbd>空格</kbd>跳跃 <kbd>E</kbd>互动 <kbd>Esc</kbd>菜单</>}
    </p>
    {!touch && <svg className="minimap" viewBox="-64 -64 128 128" aria-hidden="true">
      <circle r="60" className="mm-back" />
      {zones.map(z => <path key={z.id} d={arc(z.angle - 44, z.angle + 44, 46)} className={`mm-zone mm-${z.world}`} />)}
      {stars.filter(star => !progress.stars.includes(star.id)).map(star => <circle key={star.id} r="1.8" cx={Math.sin(rad(star.angle)) * 38} cy={-Math.cos(rad(star.angle)) * 38} className="mm-star" />)}
      {spots.map(spot => <circle key={spot.id} r="3.6" cx={Math.sin(rad(spot.angle)) * 46} cy={-Math.cos(rad(spot.angle)) * 46} className={`mm-spot${progress.seen.includes(spot.id) ? ' seen' : ''}`} onClick={() => onTravel(spot)}><title>{spot.label}</title></circle>)}
      <g ref={markerRef}><path d="M0 -58 L5 -49 L-5 -49 Z" className="mm-player" /></g>
    </svg>}
  </div>;
}

function arc(start, end, r) {
  const point = angle => `${(Math.sin(rad(angle)) * r).toFixed(2)} ${(-Math.cos(rad(angle)) * r).toFixed(2)}`;
  return `M${point(start)} A${r} ${r} 0 0 1 ${point(end)}`;
}

function DialogBox({ script, touch, reduced, onChoose, onClose }) {
  const lines = (touch && script.touchLines) || script.lines;
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(reduced ? Infinity : 0);
  const line = lines[index];
  const done = count >= line.length;
  const last = index === lines.length - 1;
  const showChoices = done && last && script.choices;
  const boxRef = useRef(null);
  const advance = () => {
    if (!done) setCount(line.length);
    else if (!last) { play('select'); setIndex(index + 1); setCount(reduced ? Infinity : 0); }
    else if (!script.choices) onClose();
  };
  useEffect(() => {
    if (done) return;
    const timer = setTimeout(() => { setCount(count + 1); if (count % 2 === 0) play('type'); }, 30);
    return () => clearTimeout(timer);
  }, [count, done]);
  useEffect(() => { if (showChoices) boxRef.current.querySelector('.choices > *')?.focus(); }, [showChoices]);
  useEffect(() => {
    const keydown = event => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return; }
      if (event.target.closest?.('.choices')) {
        if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
          event.preventDefault();
          const items = [...boxRef.current.querySelectorAll('.choices > *')];
          const next = items.indexOf(document.activeElement) + (event.key === 'ArrowDown' ? 1 : -1);
          items[(next + items.length) % items.length]?.focus();
          play('select');
        }
        return;
      }
      if ([' ', 'Enter', 'e', 'E'].includes(event.key)) { event.preventDefault(); advance(); }
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  });
  return <div className="dialog-box" ref={boxRef} role="dialog" aria-label={script.speaker} onClick={event => { if (!event.target.closest?.('.choices')) advance(); }}>
    <span className="dialog-name">{script.speaker}</span>
    <p aria-hidden="true">{line.slice(0, count)}<span className="dialog-ghost">{line.slice(count)}</span></p>
    <p className="sr-only" aria-live="polite">{line}</p>
    {done && !showChoices && <span className="dialog-next" aria-hidden="true">▼</span>}
    {showChoices && <div className="choices">{script.choices.map(choice => choice.href
      ? <a key={choice.label} href={choice.href} onClick={() => play('select')}>▶ {choice.label} ↗</a>
      : <button key={choice.label} onClick={() => onChoose(choice)}>▶ {choice.label}</button>)}</div>}
    {!showChoices && <button className="sr-only" onClick={advance}>继续</button>}
  </div>;
}

function Card({ card, onClose, onCopy }) {
  const ref = useModal(onClose);
  const heading = card.type === 'profile' ? '玩家档案' : '通讯终端';
  return <div className="modal-backdrop" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className={`game-card card-${card.type}`} ref={ref} role="dialog" aria-modal="true" aria-label={heading}>
      {card.type === 'profile' && <>
        <p className="card-kicker"><span>PLAYER</span>望远镜里，是一个熟悉的身影</p>
        <h2>玩家档案</h2>
        <Profile />
        <div className="card-actions"><button className="game-button" onClick={onClose}>返回星球 <small>Esc</small></button></div>
      </>}
      {card.type === 'contact' && <>
        <p className="card-kicker"><span>MAIL</span>WORLD 04 · ORBIT</p>
        <h2>LET’S <em>PLAY.</em></h2>
        <p className="card-text">我是 Leido，探索游戏机制、交互叙事与 AI 角色。下一个有趣的世界，也许从一次对话开始。</p>
        <ContactSheet onCopy={onCopy} />
        <div className="card-actions"><button className="game-button" onClick={onClose}>返回星球 <small>Esc</small></button></div>
      </>}
    </div>
  </div>;
}

function PauseMenu({ view, setView, progress, level, onClose, onMute, onReset, onTravel }) {
  const back = () => (view === 'main' ? onClose() : setView('main'));
  const ref = useModal(back, view);
  const explored = Math.round((progress.seen.length + progress.stars.length + progress.achievements.length) / (spots.length + stars.length + achievements.length) * 100);
  return <div className="modal-backdrop pause" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="pause-menu" ref={ref} role="dialog" aria-modal="true" aria-label="暂停菜单" data-arrows="" key={view}>
      {view === 'main' && <>
        <h2>PAUSED<small>LV.{level} · 探索度 {explored}%</small></h2>
        <nav>
          <button onClick={onClose}>继续游戏</button>
          <button onClick={() => setView('travel')}>快速传送</button>
          <button onClick={() => setView('trophies')}>成就 <small>{progress.achievements.length}/{achievements.length}</small></button>
          <a href="/games">完整作品列表 ↗</a>
          <a href="/ai-agent-game.html">AI 叙事玩法研究 ↗</a>
          <button onClick={onMute}>音效：{progress.muted ? '关' : '开'}</button>
          <button onClick={onReset}>重置进度</button>
        </nav>
      </>}
      {view === 'travel' && <>
        <h2>快速传送<small>选择目的地，宇航员会走过去</small></h2>
        <nav className="travel-list">{zones.map((zone, index) => <div key={zone.id}><p>WORLD 0{index + 1} · {zone.name} · {zone.label}</p>{spots.filter(spot => zoneAt(rad(spot.angle)) === index).map(spot => <button key={spot.id} onClick={() => onTravel(spot)}>{spot.label}{progress.seen.includes(spot.id) ? <small>✓</small> : <small>NEW</small>}</button>)}</div>)}<button onClick={() => setView('main')}>← 返回</button></nav>
      </>}
      {view === 'trophies' && <>
        <h2>成就<small>{progress.achievements.length} / {achievements.length} 已解锁</small></h2>
        <ul className="trophy-list">{achievements.map(item => {
          const got = progress.achievements.includes(item.id);
          return <li key={item.id} className={got ? 'got' : ''}><i aria-hidden="true">{got ? '🏆' : '🔒'}</i><div><b>{got || !item.secret ? item.title : '？？？'}</b><span>{got || !item.secret ? item.text : '隐藏成就'}</span></div></li>;
        })}</ul>
        <nav><button onClick={() => setView('main')}>← 返回</button></nav>
      </>}
    </div>
  </div>;
}
