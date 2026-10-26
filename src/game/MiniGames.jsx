import { useEffect, useRef, useState } from 'react';
import { Pixels } from './Art';
import { play } from './sfx';

// Thirty-second cabinet demos. Each one mirrors a mechanic from its project page
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

// ---------- 丢失的光明 · 荒地辨火 ----------

const TRUE_FIRE = [140, 160, 140, 160, 560, 520];
const FALSE_FIRES = [
  [140, 300, 520, 200, 140, 520],
  [560, 160, 140, 160, 140, 520],
  [140, 160, 140, 160, 140, 160, 360, 400],
  [300, 260, 300, 260, 300, 400],
];
const flameMap = [
  '....A.....',
  '...AA.....',
  '...AAA....',
  '..AAAA.A..',
  '..AAYAAA..',
  '.AAYYYAA..',
  '.AAYYYYAA.',
  '.AAYYYYAA.',
  '..AAYYAA..',
];

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
      ><Pixels map={flameMap} size={8} /><i /><span>{index + 1}</span></button>)}
    </div>
    <p className="mini-status" aria-live="polite">{message}</p>
    {won && <Result title="CLEAR!" text="你在荒地里辨认出了三簇真火。" onRetry={retry} />}
  </div>;
}

// ---------- 上岸 · 收一条鱼 ----------

const fishMap = [
  '....KKKK....',
  '..KKOOOOKK.K',
  '.KWKOOOOOOKK',
  'KOOOOOOOOOOK',
  '.KOOOOOOOOKK',
  '..KKOOOOKK.K',
  '....KKKK....',
];

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
      <div className="fish"><Pixels map={fishMap} size={5} /></div>
    </div>
    <div className="meters">
      <span>张力</span><span className="meter tension" role="meter" aria-label="张力" aria-valuemin={0} aria-valuemax={100}><i /><b /></span>
      <span>线长</span><span className="meter line" role="meter" aria-label="剩余线长" aria-valuemin={0} aria-valuemax={100}><i /></span>
    </div>
    <div className="mini-foot">
      <button className="game-button primary reel-button" onPointerDown={event => { event.preventDefault(); event.currentTarget.setPointerCapture?.(event.pointerId); hold(true); }} onPointerUp={() => hold(false)} onPointerCancel={() => hold(false)} onLostPointerCapture={() => hold(false)} disabled={Boolean(result)}>按住收线</button>
      <p className="mini-status" aria-live="polite">{status}</p>
    </div>
    {result && <Result title={result === 'win' ? 'CLEAR!' : 'MISS…'} text={result === 'win' ? '钓上来了！第七天之前，你还能钓很多条。' : status} onRetry={retry} />}
  </div>;
}

// ---------- 智械驯服专家 · 调律 ----------

const BEAT = 500;
const CHART = [0, 1, 2, 3, 4, 5, 6, 6.5, 7, 8, 9, 10, 10.5, 11, 12, 13, 14, 15, 16, 16.5, 17, 18, 19, 20, 21, 22, 22.5, 23];
const robotMap = [
  '.....AA.....',
  '.....KK.....',
  '.KKKKKKKKKK.',
  '.KSSSSSSSSK.',
  '.KSEESSEESK.',
  '.KSEESSEESK.',
  '.KSSSSSSSSK.',
  '.KSSKKKKSSK.',
  '.KSSSSSSSSK.',
  '.KKKKKKKKKK.',
  '...KPPPPK...',
  '..KPPPPPPK..',
];

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
      <div className="robot"><Pixels map={robotMap} size={7} /></div>
    </div>
    <span className="energy-bar" role="meter" aria-label="调律能量" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(energy)}><i /></span>
    <div className="mini-foot">
      <button className="game-button primary tune-button" onPointerDown={event => { event.preventDefault(); press(); }} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); press(); } }}>
        {phase === 'ready' ? '▶ 开始' : phase === 'full' ? '⚡ 释放修复指令' : phase === 'failed' ? '↻ 再来' : '♪ 调律'}
      </button>
      <p className="mini-status" aria-live="polite">{{
        ready: '音符到达圆环时按空格，攒满调律能量后释放修复指令。',
        playing: total ? `PERFECT ${stats.perfect} · GOOD ${stats.good} · MISS ${stats.miss}` : '跟上节拍……',
        full: '能量充满！再按一次，释放修复指令。',
        failed: '失律仍在继续。再来一次？',
        won: '修复完成。智械回到了理性的频率。',
      }[phase]}</p>
    </div>
    {phase === 'won' && <Result title="CLEAR!" text={`PERFECT ${stats.perfect} · GOOD ${stats.good} · MISS ${stats.miss}`} onRetry={start} />}
  </div>;
}

export default function MiniGame({ kind, onWin }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus({ preventScroll: true }); }, []);
  const Game = { fire: FireTest, reel: ReelIn, tune: TuneUp }[kind];
  return <div className="mini-host" ref={ref} tabIndex={-1}>{Game && <Game onWin={onWin} />}</div>;
}
