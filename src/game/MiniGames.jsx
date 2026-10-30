import { useEffect, useRef, useState } from 'react';
import { C } from './Art';
import { audioOut, play } from './sfx';

// Thirty-second stall demos. Each one mirrors a mechanic from its project page
// and calls onWin once when cleared.

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function useKeys(handlers, deps) {
  useEffect(() => {
    const down = event => handlers.down?.(event);
    const up = event => handlers.up?.(event);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}

function Result({ title, text, onRetry }) {
  return <div className="mini-result" role="status">
    <b>{title}</b>
    <span>{text}</span>
    <button className="game-button" onClick={onRetry}>↻ 再玩一次</button>
  </div>;
}

// ---------- 天空岛 · 乘风 ----------

// Each vent listens to one lane of the song and the notes decide the wind: a struck note
// throws you to reach × ½ × velocity², a held note blows a column reach × velocity tall
// while it sounds. Notes are the first two bars of the game's loops; reaches are its vents'.
const SKY_BEAT = 60 / 90, SKY_BARS = 8, SKY_TOP = 30, SKY_G = 30;
const SKY_LOOPS = {
  rhythm_rain: { title: 'Rain on the Roof', sound: '沙锤 · 响板', notes: [[0, .5], [1.5, .38], [2, .28], [3, .45], [4, .28], [5.5, .38], [6, .28], [7, .45]] },
  rhythm_heartbeat: { title: 'Heartbeat', sound: '手鼓', notes: [[0, .95], [1, .55], [2.5, .7], [3, .7], [3.5, .35], [4, .95], [5, .55], [5.75, .3], [6.5, .7], [7, .7], [7.5, .35], [7.75, .25]] },
  bass_footsteps: { title: 'Footsteps', sound: '低音提琴 · 拨弦', notes: [[0, .95], [2, .7], [4, .95], [6, .7]] },
  bass_breath: { title: 'Long Breath', sound: '低音提琴与大提琴 · 拉弦', held: true, notes: [[0, .8, 4], [4, .8, 4]] },
  melody_hers: { title: 'Her Tune', sound: '钟琴，像八音盒', notes: [[0, .9], [1.5, .7], [2, .75], [3, .7], [4, .9], [5.5, .7], [6, .8]] },
  melody_answer: { title: 'Your Answer', sound: '长笛', held: true, notes: [[2, .7, 1], [3, .75, 1], [4, .85, 2], [6, .8, 1], [7, .65, 1]] },
};
const SKY_ROUNDS = [
  { place: '鼓岛石柱', lane: '节奏', color: '#e8957a', reach: 32, goal: 12, loops: ['rhythm_rain', 'rhythm_heartbeat'], intro: '这朵石花只听节奏声部。敲击的音每响一下吹一阵风，越响越高。', hint: '太轻了，换一段更响的鼓点？', done: '心跳的重拍把你送上了石柱。' },
  { place: '回家的路', lane: '低音', color: '#9a86d6', reach: 26, goal: 16, loops: ['bass_footsteps', 'bass_breath'], intro: '根岛的石花听低音声部。家，比拨弦吹起的风更高一点。', hint: '拨弦一下一阵风，落得也快。拉弦的长音会吹出一根气柱。', done: '一口长长的气，把你送回了家。' },
  { place: '钟岛', lane: '旋律', color: '#f0c05e', reach: 34, goal: 16, loops: ['melody_hers', 'melody_answer'], intro: '外婆只哼得出一句。钟岛还在更高的地方。', hint: '她的那一句不够高。用你自己的回答试试？', done: '你的回答，比她的那一句飞得更高。' },
];

// Loops play through the stall's own audio context, so the mute button covers them too.
const loopBuffers = new Map();
function loadLoop(id) {
  const out = audioOut();
  if (!out) return Promise.resolve(null);
  if (!loopBuffers.has(id)) loopBuffers.set(id, fetch(`/games/sky-studio/loops/${id}.mp3`).then(response => response.arrayBuffer()).then(data => out.context.decodeAudioData(data)).catch(() => null));
  return loopBuffers.get(id);
}

function Spirit() {
  return <svg className="art" width="46" height="74" viewBox="0 0 46 74" aria-hidden="true">
    <g className="wind-umbrella">
      <path d="M23 22V42" fill="none" />
      <path d="M1 22Q3 2 23 1Q43 2 45 22Q39 17 34 22Q28 17 23 22Q18 17 12 22Q6 17 1 22Z" fill={C.lilac} />
      <path className="thin" d="M23 1L12 22M23 1L34 22" fill="none" />
    </g>
    <path d="M16 46c3-6 12-6 15-1c6-1 10 5 7 10c4 4 1 11-5 10c-2 6-11 7-15 2c-6 2-11-4-8-9c-5-4-2-11 6-12z" fill="#efd3e6" />
    <circle className="ns" cx="19" cy="56" r="1.8" fill={C.ink} /><circle className="ns" cx="28" cy="56" r="1.8" fill={C.ink} />
  </svg>;
}

function WindRide({ onWin }) {
  const root = useRef(null);
  const flight = useRef(null);
  const timers = useRef([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState('pick');
  const [picked, setPicked] = useState(null);
  const [rings, setRings] = useState([]);
  const [message, setMessage] = useState(SKY_ROUNDS[0].intro);
  const round = SKY_ROUNDS[index];

  useEffect(() => {
    Object.keys(SKY_LOOPS).forEach(loadLoop);
    return () => { flight.current?.stop(); timers.current.forEach(clearTimeout); };
  }, []);

  const fly = (id, buffer) => {
    const loop = SKY_LOOPS[id], el = root.current, out = audioOut();
    let source, gain, clock;
    if (buffer && out?.context.state === 'running') {
      const at = out.context.currentTime + .05;
      source = out.context.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.loopEnd = 16 * SKY_BEAT;
      gain = out.context.createGain();
      source.connect(gain).connect(out.master);
      source.start(at);
      clock = () => out.context.currentTime - at;
    } else {
      const start = performance.now();
      clock = () => (performance.now() - start) / 1000;
    }
    const s = { y: 0, vy: 0, peak: 0, next: 0, done: false, last: 0, frame: 0 };
    const stop = () => {
      cancelAnimationFrame(s.frame);
      if (!gain) return;
      const now = out.context.currentTime;
      gain.gain.setTargetAtTime(0, now, .12);
      source.stop(now + .7);
      gain = null;
    };
    const finish = landed => {
      s.done = true;
      play(landed ? 'win' : 'fail');
      setPhase(landed ? 'landed' : 'fell');
      setMessage(landed ? round.done : `只吹到 ${s.peak.toFixed(1)} m。${round.hint}`);
      if (!landed) return;
      timers.current.push(setTimeout(() => {
        stop();
        if (index === SKY_ROUNDS.length - 1) { setPhase('won'); onWin(); return; }
        el.style.setProperty('--y', 0);
        setIndex(index + 1); setPhase('pick'); setPicked(null); setRings([]);
        setMessage(SKY_ROUNDS[index + 1].intro);
      }, 1800));
    };
    const step = () => {
      const t = clock(), dt = Math.min(.05, Math.max(0, t - s.last)), beat = t / SKY_BEAT;
      s.last = t;
      if (!s.done && !loop.held) {
        for (; s.next < loop.notes.length && loop.notes[s.next][0] <= beat; s.next++) {
          const apex = round.reach * .5 * loop.notes[s.next][1] ** 2;
          setRings(current => [...current.slice(-5), { id: `${id}-${s.next}`, h: apex }]);
          s.peak = Math.max(s.peak, apex);
          if (apex > s.y) s.vy = Math.max(s.vy, Math.sqrt(2 * SKY_G * (apex - s.y)));
        }
      }
      const held = !s.done && loop.held && loop.notes.find(([at, , length]) => at <= beat && beat < at + length);
      const top = held ? round.reach * held[1] : 0;
      // A column lifts you to its top and holds you there; out of the wind, the umbrella slows the fall.
      if (held && s.y < top) s.vy = Math.min(9, (top - s.y) * 2.4 + .4);
      else s.vy = Math.max(-4, s.vy - SKY_G * dt);
      s.y = Math.max(0, s.y + s.vy * dt);
      if (s.y === 0) s.vy = Math.max(0, s.vy);
      s.peak = Math.max(s.peak, s.y);
      if (!s.done && s.y >= round.goal) { s.y = round.goal; finish(true); }
      else if (!s.done && beat >= SKY_BARS) finish(false);
      el.style.setProperty('--y', (s.y / SKY_TOP).toFixed(4));
      el.style.setProperty('--col', (top / SKY_TOP).toFixed(4));
      el.dataset.glide = s.vy < -.5 && s.y > .3 && !(s.done && s.y === round.goal) ? 'true' : '';
      if (s.done && (s.y === round.goal || s.y === 0)) { if (s.y === 0) stop(); return; }
      s.frame = requestAnimationFrame(step);
    };
    s.frame = requestAnimationFrame(step);
    flight.current = { stop };
  };

  const pick = async id => {
    if (phase !== 'pick' && phase !== 'fell') return;
    play('select');
    flight.current?.stop();
    setPicked(id); setPhase('flying'); setRings([]);
    setMessage(`${SKY_LOOPS[id].title} 在${round.lane}声部里响起来了……`);
    fly(id, await loadLoop(id));
  };
  useKeys({ down: event => { if (['1', '2'].includes(event.key)) pick(round.loops[Number(event.key) - 1]); } }, [index, phase]);
  const retry = () => {
    flight.current?.stop();
    root.current.style.setProperty('--y', 0);
    setIndex(0); setPhase('pick'); setPicked(null); setRings([]); setMessage(SKY_ROUNDS[0].intro);
  };

  return <div className="mini mini-wind" ref={root} data-phase={phase} style={{ '--lane': round.color, '--goal': round.goal / SKY_TOP }}>
    <div className="mini-head"><span>乘风 · 没有音乐就没有风</span><span>{index + 1}/3 · {round.place} <b>{round.goal} m</b></span></div>
    <div className="wind-stage">
      <div className="wind-scale" aria-hidden="true">{[10, 20, 30].map(m => <i key={m} style={{ '--m': m / SKY_TOP }}>{m} m</i>)}</div>
      <div className="wind-ledge" aria-hidden="true"><span>{round.place}</span></div>
      <i className="wind-column" aria-hidden="true" />
      {rings.map(ring => <i key={ring.id} className="wind-ring" style={{ '--h': ring.h / SKY_TOP }} aria-hidden="true" />)}
      <i className="wind-vent" aria-hidden="true" />
      <div className="wind-spirit"><Spirit /></div>
    </div>
    <div className="wind-cards" role="group" aria-label={`为${round.lane}声部挑一段 loop`}>
      {round.loops.map((id, i) => {
        const loop = SKY_LOOPS[id];
        return <button key={id} className={`wind-card${picked === id ? ' on' : ''}`} onClick={() => pick(id)} disabled={phase !== 'pick' && phase !== 'fell'} aria-pressed={picked === id}>
          <b>{loop.title}</b><span>{loop.sound}</span><small>{i + 1} · {loop.held ? '持续的音 · 吹一根气柱' : '敲击的音 · 一个音一阵风'}</small>
        </button>;
      })}
    </div>
    <p className="mini-status" aria-live="polite">{message}</p>
    {phase === 'won' && <Result title="Well done!" text="三阵风，都是你挑的歌吹起来的。" onRetry={retry} />}
  </div>;
}

// ---------- 丢失的光明 · 荒地辨火 ----------

const TRUE_FIRE = [140, 160, 140, 160, 560, 520];
const FALSE_FIRES = [
  [140, 300, 520, 200, 140, 520],
  [560, 160, 140, 160, 140, 520],
  [140, 160, 140, 160, 140, 160, 360, 400],
  [300, 260, 300, 260, 300, 400],
];
function Flame() {
  return <svg className="art" width="70" height="84" viewBox="0 0 70 84" aria-hidden="true">
    <path d="M35 4C48 24 64 36 60 58C58 72 48 80 35 80C22 80 11 72 10 58C9 44 20 38 22 22C27 32 29 36 33 36C34 22 31 14 35 4Z" fill={C.clay} />
    <path d="M35 32C43 44 50 50 48 62C47 70 41 74 35 74C28 74 23 70 23 62C23 54 30 50 30 42C32 46 35 46 35 32Z" fill={C.honey} />
    <path className="thin" d="M35 52C39 57 41 60 40 65C39 68 31 68 30 65C29 61 34 59 35 52Z" fill={C.cream} />
  </svg>;
}

function dealFires() {
  const patterns = [...FALSE_FIRES].sort(() => Math.random() - .5).slice(0, 2);
  const answer = Math.floor(Math.random() * 3);
  patterns.splice(answer, 0, TRUE_FIRE);
  return { patterns, answer, id: Math.random() };
}

function FireTest({ onWin }) {
  const [deal, setDeal] = useState(dealFires);
  const [round, setRound] = useState(0);
  const [lit, setLit] = useState([false, false, false]);
  const [cold, setCold] = useState([]);
  const [right, setRight] = useState(null);
  const [message, setMessage] = useState('真火的节奏稳定：短、短、长。把鼠标移到火上能听到它的节拍。');
  const [won, setWon] = useState(false);
  const focused = useRef(null);
  const reduced = reducedMotion();

  useEffect(() => {
    if (reduced) { setLit([true, true, true]); }
    const timers = [];
    deal.patterns.forEach((pattern, index) => {
      let step = 0;
      const tick = () => {
        const on = step % 2 === 0, duration = pattern[step % pattern.length];
        if (!reduced) setLit(current => current.map((value, i) => (i === index ? on : value)));
        if (on && focused.current === index) play(duration > 300 ? 'fireLong' : 'fireShort');
        step++;
        timers.push(setTimeout(tick, duration));
      };
      timers.push(setTimeout(tick, Math.random() * 400));
    });
    return () => timers.forEach(clearTimeout);
  }, [deal, reduced]);

  const pick = index => {
    if (won || right !== null || cold.includes(index)) return;
    if (index === deal.answer) {
      play('win');
      setRight(index);
      if (round === 2) { setWon(true); setMessage('三簇真火都认出来了。天亮以前，你还能再走一步。'); onWin(); return; }
      setMessage('短、短、长。提灯稳稳地亮着，这是真火。');
      setTimeout(() => { setRound(round + 1); setDeal(dealFires()); setCold([]); setRight(null); setMessage('下一片荒地。再听一次。'); }, 1100);
    } else {
      play('fail');
      setCold([...cold, index]);
      setMessage('提灯先亮了一下，又转成冷紫。再听一次。');
    }
  };
  useKeys({ down: event => { if (['1', '2', '3'].includes(event.key)) pick(Number(event.key) - 1); } }, [deal, round, cold, right, won]);
  const retry = () => { setWon(false); setRound(0); setDeal(dealFires()); setCold([]); setRight(null); setMessage('真火的节奏稳定：短、短、长。'); };

  return <div className="mini mini-fire">
    <div className="mini-head"><span>荒地辨火</span><span>ROUND {round + 1}/3</span></div>
    <div className="fires" role="group" aria-label="三簇火，选出真火">
      {deal.patterns.map((_, index) => <button
        key={`${deal.id}-${index}`}
        className={`fire${lit[index] ? ' on' : ''}${cold.includes(index) ? ' cold' : ''}${right === index ? ' right' : ''}`}
        onClick={() => pick(index)}
        onPointerEnter={() => { focused.current = index; }} onPointerLeave={() => { focused.current = null; }}
        onFocus={() => { focused.current = index; }} onBlur={() => { focused.current = null; }}
        aria-label={`第 ${index + 1} 簇火`}
      ><Flame /><i /><span>{index + 1}</span></button>)}
    </div>
    <p className="mini-status" aria-live="polite">{message}</p>
    {won && <Result title="Well done!" text="你在荒地里辨认出了三簇真火。" onRetry={retry} />}
  </div>;
}

// ---------- 上岸 · 收一条鱼 ----------

function Fish() {
  return <svg className="art" width="64" height="36" viewBox="0 0 64 36" aria-hidden="true">
    <path d="M50 18L64 6V30Z" fill={C.clay} />
    <path d="M4 18C12 4 36 2 52 18C36 34 12 32 4 18Z" fill={C.honey} />
    <path className="thin" d="M22 10q-4 8 0 16M30 9q-4 9 0 18M38 11q-3 7 0 14" fill="none" />
    <circle className="ns" cx="14" cy="16" r="2.4" fill={C.ink} />
  </svg>;
}

function ReelIn({ onWin }) {
  const root = useRef(null);
  const sim = useRef(null);
  const [status, setStatus] = useState('按住空格或按钮收线，让张力留在绿区里。');
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const s = sim.current = { tension: 30, line: 100, slack: 0, strain: 0, stamina: 1, holding: false, done: false, started: false, time: 0 };
    let frame = 0, last = performance.now(), shown = '';
    const say = text => { if (text !== shown) { shown = text; setStatus(text); } };
    const finish = (text, win) => {
      s.done = true; s.holding = false;
      say(text);
      setResult(win ? 'win' : 'lose');
      play(win ? 'win' : 'fail');
      if (win) onWin();
    };
    const step = now => {
      const dt = Math.min(.05, (now - last) / 1000); last = now; s.time += dt;
      if (!s.done && s.started) {
        const surge = Math.max(0, Math.sin(s.time * 1.7) * Math.sin(s.time * .63)) * 55 * s.stamina;
        s.tension = Math.max(0, Math.min(100, s.tension + ((s.holding ? 46 : -38) + surge) * dt));
        const inZone = s.tension >= 25 && s.tension <= 75;
        s.line = s.holding ? s.line - (inZone ? 24 : 9) * dt : Math.min(100, s.line + 1.5 * dt);
        s.stamina = Math.max(.35, s.stamina - .03 * dt);
        s.strain = s.tension > 92 ? s.strain + dt : Math.max(0, s.strain - dt * 2);
        s.slack = s.tension < 8 ? s.slack + dt : 0;
        if (s.strain > .9) finish('线断了。', false);
        else if (s.slack > 2.2) finish('鱼脱钩了。', false);
        else if (s.line <= 0) { s.line = 0; finish('钓上来了！', true); }
        else say(s.tension > 80 ? '太紧了！' : s.tension < 15 ? '太松了！' : s.holding ? '收线中……' : '张力留在绿区里。');
      }
      const el = root.current;
      el.style.setProperty('--tension', s.tension);
      el.style.setProperty('--line', s.line);
      el.style.setProperty('--bob', `${Math.sin(s.time * 4) * 3 + (s.tension > 60 ? 6 : 0)}px`);
      el.dataset.warn = s.tension > 90 ? 'danger' : s.tension > 75 || s.tension < 15 ? 'warn' : '';
      if (!s.done) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [attempt]); // eslint-disable-line react-hooks/exhaustive-deps

  const hold = value => {
    const s = sim.current;
    if (!s || s.done) return;
    if (value) s.started = true;
    s.holding = value;
    root.current.dataset.holding = value || '';
  };
  useKeys({
    down: event => { if ((event.key === ' ' || event.key === 'Enter') && !event.target.closest?.('a, button:not(.reel-button)')) { event.preventDefault(); if (!event.repeat) hold(true); } },
    up: event => { if (event.key === ' ' || event.key === 'Enter') hold(false); },
  }, []);
  const retry = () => { setResult(null); setStatus('按住空格或按钮收线，让张力留在绿区里。'); setAttempt(attempt + 1); };

  return <div className="mini mini-reel" ref={root}>
    <div className="mini-head"><span>收一条鱼</span><span>绿区 25 – 75</span></div>
    <div className="sea">
      <i className="rod-line" />
      <div className="fish"><Fish /></div>
    </div>
    <div className="meters">
      <span>张力</span><span className="meter tension" role="meter" aria-label="张力" aria-valuemin={0} aria-valuemax={100}><i /><b /></span>
      <span>线长</span><span className="meter line" role="meter" aria-label="剩余线长" aria-valuemin={0} aria-valuemax={100}><i /></span>
    </div>
    <div className="mini-foot">
      <button className="game-button primary reel-button" onPointerDown={event => { event.preventDefault(); event.currentTarget.setPointerCapture?.(event.pointerId); hold(true); }} onPointerUp={() => hold(false)} onPointerCancel={() => hold(false)} onLostPointerCapture={() => hold(false)} disabled={Boolean(result)}>按住收线</button>
      <p className="mini-status" aria-live="polite">{status}</p>
    </div>
    {result && <Result title={result === 'win' ? 'Well done!' : 'Oh no…'} text={result === 'win' ? '钓上来了！第七天之前，你还能钓很多条。' : status} onRetry={retry} />}
  </div>;
}

// ---------- 智械驯服专家 · 调律 ----------

const BEAT = 500;
const CHART = [0, 1, 2, 3, 4, 5, 6, 6.5, 7, 8, 9, 10, 10.5, 11, 12, 13, 14, 15, 16, 16.5, 17, 18, 19, 20, 21, 22, 22.5, 23];
function Robot() {
  return <svg className="art" width="84" height="96" viewBox="0 0 84 96" aria-hidden="true">
    <path className="thin" d="M42 18V6" fill="none" />
    <circle cx="42" cy="5" r="4.5" fill={C.honey} />
    <rect x="10" y="18" width="64" height="48" rx="16" fill={C.stone} />
    <rect x="18" y="26" width="48" height="30" rx="10" fill={C.night} />
    <circle className="eye" cx="32" cy="41" r="6" />
    <circle className="eye" cx="52" cy="41" r="6" />
    <path className="hl thin" d="M36 50q6 4 12 0" fill="none" />
    <rect x="2" y="34" width="8" height="16" rx="3" fill={C.lilac} /><rect x="74" y="34" width="8" height="16" rx="3" fill={C.lilac} />
    <path d="M24 66H60L66 94H18Z" fill={C.lilac} />
    <path d="M24 66H60L66 94H18Z" fill="url(#pat-diamond)" className="ns" />
  </svg>;
}

function TuneUp({ onWin }) {
  const root = useRef(null);
  const lane = useRef(null);
  const game = useRef(null);
  const [phase, setPhase] = useState('ready');
  const [energy, setEnergy] = useState(0);
  const [judge, setJudge] = useState(null);
  const [stats, setStats] = useState({ perfect: 0, good: 0, miss: 0 });

  const start = () => {
    game.current = { start: performance.now() + BEAT * 4, notes: CHART.map(beat => ({ beat, judged: false })), energy: 0, lastBeat: -5, stats: { perfect: 0, good: 0, miss: 0 } };
    setEnergy(0); setStats(game.current.stats); setJudge(null);
    setPhase('playing');
  };

  useEffect(() => {
    if (phase !== 'playing' && phase !== 'full') return;
    const g = game.current;
    let frame = 0;
    const step = now => {
      frame = requestAnimationFrame(step);
      const songTime = now - g.start;
      const beat = Math.floor(songTime / BEAT);
      if (beat !== g.lastBeat && beat >= -4 && beat <= 24) { g.lastBeat = beat; play(beat < 0 ? 'count' : 'tick'); root.current?.style.setProperty('--pulse', beat % 2 ? 1 : 0); }
      if (phase === 'playing') {
        for (const note of g.notes) {
          if (!note.judged && songTime - note.beat * BEAT > 160) { note.judged = true; g.stats.miss++; g.energy = Math.max(0, g.energy - 4); setJudge({ text: 'MISS', id: now }); setEnergy(g.energy); setStats({ ...g.stats }); }
        }
        if (songTime > (CHART[CHART.length - 1] + 2) * BEAT) { setPhase('failed'); play('fail'); }
      }
      // Notes slide in from the right and cross the hit ring at 16% of the lane.
      lane.current?.querySelectorAll('[data-note]').forEach(element => {
        const note = g.notes[element.dataset.note];
        const x = 16 + (note.beat * BEAT - songTime) / 2400 * 84;
        element.style.left = `${x}%`;
        element.style.opacity = note.judged || x > 102 ? 0 : 1;
      });
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  const press = () => {
    if (phase === 'ready' || phase === 'failed' || phase === 'won') { if (phase !== 'won') start(); return; }
    const g = game.current;
    if (phase === 'full') {
      setPhase('won'); play('win'); onWin();
      return;
    }
    const songTime = performance.now() - g.start;
    let best = null;
    for (const note of g.notes) {
      if (note.judged) continue;
      const offset = Math.abs(songTime - note.beat * BEAT);
      if (offset < 160 && (!best || offset < best.offset)) best = { note, offset };
    }
    if (!best) { play('bonk'); setJudge({ text: '空拍', id: performance.now() }); return; }
    best.note.judged = true;
    const perfect = best.offset < 70;
    g.stats[perfect ? 'perfect' : 'good']++;
    g.energy = Math.min(100, g.energy + (perfect ? 9 : 6));
    play(perfect ? 'perfect' : 'hit');
    setJudge({ text: perfect ? 'PERFECT' : 'GOOD', id: performance.now() });
    setEnergy(g.energy); setStats({ ...g.stats });
    if (g.energy >= 100) setPhase('full');
  };
  useKeys({ down: event => { if (event.key === ' ' && !event.target.closest?.('a, button:not(.tune-button)')) { event.preventDefault(); if (!event.repeat) press(); } } }, [phase]);

  const total = stats.perfect + stats.good + stats.miss;
  return <div className="mini mini-tune" ref={root} data-phase={phase} style={{ '--energy': energy }}>
    <div className="mini-head"><span>调律智械</span><span>调律能量 <b>{Math.round(energy)}%</b></span></div>
    <div className="tune-stage">
      <div className="lane" ref={lane}>
        <i className="hit-ring" />
        {CHART.map((beat, index) => <span key={index} className="note" data-note={index} />)}
        {judge && <b className="judge" key={judge.id}>{judge.text}</b>}
      </div>
      <div className="robot"><Robot /></div>
    </div>
    <span className="energy-bar" role="meter" aria-label="调律能量" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(energy)}><i /></span>
    <div className="mini-foot">
      <button className="game-button primary tune-button" onPointerDown={event => { event.preventDefault(); press(); }} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); press(); } }}>
        {phase === 'ready' ? '开始' : phase === 'full' ? '✦ 释放修复指令' : phase === 'failed' ? '↻ 再来' : '♪ 调律'}
      </button>
      <p className="mini-status" aria-live="polite">{{
        ready: '音符到达圆环时按空格，攒满调律能量后释放修复指令。',
        playing: total ? `PERFECT ${stats.perfect} · GOOD ${stats.good} · MISS ${stats.miss}` : '跟上节拍……',
        full: '能量充满！再按一次，释放修复指令。',
        failed: '失律仍在继续。再来一次？',
        won: '修复完成。智械回到了理性的频率。',
      }[phase]}</p>
    </div>
    {phase === 'won' && <Result title="Well done!" text={`PERFECT ${stats.perfect} · GOOD ${stats.good} · MISS ${stats.miss}`} onRetry={start} />}
  </div>;
}

export default function MiniGame({ kind, onWin }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus({ preventScroll: true }); }, []);
  const Game = { wind: WindRide, fire: FireTest, reel: ReelIn, tune: TuneUp }[kind];
  return <div className="mini-host" ref={ref} tabIndex={-1}>{Game && <Game onWin={onWin} />}</div>;
}
