import { useEffect, useState } from 'react';
import portrait from '../assets/portrait.webp';
import { stages } from './stages';
import { contact, R, rad, zones } from './world';

// Pixel art is written as rows of characters. Lowercase letters follow the current
// world's palette (k ink, s shade, b paper, a accent, m muted); uppercase letters are
// fixed colours used by the astronaut and the stars.
const runsCache = new Map();
function runs(map) {
  if (runsCache.has(map)) return runsCache.get(map);
  const out = [];
  map.forEach((row, y) => {
    for (let x = 0; x < row.length;) {
      let end = x + 1;
      while (row[end] === row[x]) end++;
      if (row[x] !== '.') out.push([x, y, end - x, row[x]]);
      x = end;
    }
  });
  runsCache.set(map, out);
  return out;
}

export const PX = 6;
export function Pixels({ map, className = '', size = PX }) {
  const width = map[0].length, height = map.length;
  return <svg className={`pixels ${className}`} width={width * size} height={height * size} viewBox={`0 0 ${width} ${height}`} shapeRendering="crispEdges" aria-hidden="true">
    {runs(map).map(([x, y, w, c]) => <rect key={`${x}-${y}`} x={x} y={y} width={w} height={1} className={`px-${c}`} />)}
  </svg>;
}

const helmet = [
  '......KKKKK.....',
  '....KKWWWWWKK...',
  '...KWWWWWWWWWK..',
  '..KWWWWVVVVVVVK.',
  '..KWWWVVVVVHHVK.',
  '..KWWWVVVVVVHVK.',
  '..KSWWVVVVVVVVK.',
  '...KSWWWVVVVVK..',
  '....KOOOOOOOK...',
  '.KPPKWWWWWWWWK..',
  '.KPPKWWWWOSWWWK.',
  '.KPPKWWSSSSWKWK.',
  '.KPPKWWWWWWWKSK.',
  '..KKKSSSSSSSK...',
];
const legs = {
  idle: ['....KWWWKWWWK...', '....KWWWKWWWK...', '....KOOOKOOOK...', '....KKKKKKKKKK..'],
  walk: ['....KWWWKWWWK...', '...KWWWK.KWWWK..', '...KOOOK.KOOOK..', '..KKKKK...KKKKK.'],
  jump: ['....KWWWKWWWK...', '....KOOOKOOOK...', '....KKKKKKKKK...', '................'],
};

export function Astronaut() {
  return <div className="astronaut" aria-hidden="true">
    <div className="sprite">
      {Object.entries(legs).map(([pose, rows]) => <Pixels key={pose} className={`pose-${pose}`} map={[...helmet, ...rows]} />)}
      <Sparkle className="held-star" />
    </div>
  </div>;
}

export function Sparkle({ className = '' }) {
  return <svg className={`sparkle ${className}`} viewBox="-20 -20 40 40" aria-hidden="true"><path d="M0 -17 L4.5 -4.5 L17 0 L4.5 4.5 L0 17 L-4.5 4.5 L-17 0 L-4.5 -4.5 Z" /></svg>;
}

const art = {
  pod: [
    '..........aa..........',
    '..........kk..........',
    '..........kk..........',
    '.......kkkkkkkk.......',
    '.....kkkkkkkkkkss.....',
    '....kkkkkkkkkkksss....',
    '...kkkkkbbbbkkkksss...',
    '...kkkkbbbbbbkkksss...',
    '..kkkkkbbabbbbkkksss..',
    '..kkkkkbabbbbbkkksss..',
    '..kkkkkbbbbbbbkkksss..',
    '..kkkkkkbbbbbkkkksss..',
    '..kkkkkkkkkkkkkkksss..',
    '..aaaaaaaaaaaaaaaaaa..',
    '..kkkkkkkkkkkkkkksss..',
    '..kkbkkbkkkkkkkkksss..',
    '..kkkkkkkkkkkkkkksss..',
    '...kkkkkkkkkkkkksss...',
    '....kkkkkkkkkkksss....',
    '...kk...........ss....',
    '..kk.............ss...',
    '.kk...............ss..',
    'kkkk.............ssss.',
  ],
  scope: [
    '................kk..',
    '..............kkkka.',
    '............kkkkkka.',
    '..........kkkkkkkk..',
    '........kkkkkkkk....',
    '......kkkkkkkk......',
    '.....kkkkkkk........',
    '.....kkkkk..........',
    '........kk..........',
    '........kk..........',
    '.......kkkk.........',
    '.......k..k.........',
    '......k....k........',
    '......k....k........',
    '.....k......k.......',
    '.....k......k.......',
    '....k........k......',
    '....k........k......',
    '...kk........kk.....',
  ],
  mailbox: [
    '...kkkkkk...',
    '.kkkkkkkkkk.',
    'kkkkkkkkkkks',
    'kkbbbbbbbkks',
    'kkkkkkkkkkks',
    'kkkkaaakkkks',
    'kkkkkkkkkkks',
    'kkkkkkkkkkks',
    'kkkkkkkkkkks',
    '.sssssssssss',
    '....kks.....',
    '....kks.....',
    '....kks.....',
    '....kks.....',
    '....kks.....',
    '....kks.....',
    '....kks.....',
    '....kks.....',
    '....kks.....',
    '...kkkkk....',
  ],
  rocket: [
    '.......kk.......',
    '......kkks......',
    '......kkks......',
    '.....kkkkss.....',
    '.....kkkkss.....',
    '....kkkkksss....',
    '....aaaaaaaa....',
    '....kkkkksss....',
    '...kkkkkkksss...',
    '...kkkbbbksss...',
    '...kkbbbbbsss...',
    '...kkbabbbsss...',
    '...kkbbbbbsss...',
    '...kkkbbbksss...',
    '...kkkkkkksss...',
    '...kkkkkkksss...',
    '...aaaaaaaaaa...',
    '...kkkkkkksss...',
    '...kkkkkkksss...',
    '..akkkkkkksssa..',
    '.aakkkkkkksssaa.',
    'aaakkkkkkksssaaa',
    'aaa.kkkkksss.aaa',
    'aa...kkkkss...aa',
    '.....ssssss.....',
  ],
  pad: [
    '..kkkkkkkkkkkkkkkkkk..',
    'kkkkkkkkkkkkkkkkkkkkkk',
    '.ss..ss........ss..ss.',
    '.ss..ss........ss..ss.',
  ],
  npc: [
    '....kkkk....',
    '...kkkkkk...',
    '..kkkkkkkk..',
    '..kbbbbbbk..',
    '..kbkbbkbk..',
    '..kbbbbbbk..',
    '...bbssbb...',
    '....bbbb....',
    '.....bb.....',
    '..sskbbkss..',
    '.skkkbbkkks.',
    '.kkkkbbkkkk.',
    '.kkkkakkkkk.',
    '.kkkkbbkkkk.',
    '.kk.kbbk.kk.',
    '.kk.kkkk.kk.',
    '.kk.kkkk.kk.',
    '.kk.kkkk.kk.',
    '.bb.kkkk.bb.',
    '....kkkk....',
    '....ssss....',
    '...kkkkkk...',
    '...kkk.kk...',
    '...kk..kk...',
    '...kk..kk...',
    '...kk..kk...',
    '...kk..kk...',
    '...kk..kk...',
    '...kk..kk...',
    '..kkk..kkk..',
  ],
  vessel: [
    '.ss........ss.',
    '.s.s......s.s.',
    'ssssssssssssss',
    '.saaaaaaaaaas.',
    '.ssssssssssss.',
    '..ssssssssss..',
    '...ssssssss...',
    '...s..ss..s...',
    '...s..ss..s...',
    '..ss..ss..ss..',
  ],
  palm: [
    '......aaaa......',
    '...aaaaaaaaaa...',
    '.aaaaa.kk.aaaaa.',
    'aaa...kkkk...aaa',
    'aa...aakkaa...aa',
    'a...aa.kk.aa...a',
    '...aa..kk..aa...',
    '.......kk.......',
    '.......kks......',
    '........kk......',
    '........kks.....',
    '........kks.....',
    '.........kk.....',
    '.........kks....',
    '.........kks....',
    '.........kks....',
    '........kks.....',
    '........kks.....',
    '.......kkks.....',
    '......kkkkss....',
  ],
  flame: [
    '....A.....',
    '...AA.....',
    '...AAA....',
    '..AAAA.A..',
    '..AAYAAA..',
    '.AAYYYAA..',
    '.AAYYYYAA.',
    '.AAYYYYAA.',
    '..AAYYAA..',
  ],
  brazier: [
    'kkkkkkkkkk',
    '.kkkkkkkk.',
    '..kkkkkk..',
    '....kk....',
    '....kk....',
    '....kk....',
    '....kk....',
    '....kk....',
    '....kk....',
    '....kk....',
    '..kkkkkk..',
  ],
  speaker: [
    'kkkkkkkkkkkkss',
    'kkkkkkkkkkkkss',
    'kkkkbbbbkkkkss',
    'kkkbbaabbkkkss',
    'kkkbbaabbkkkss',
    'kkkkbbbbkkkkss',
    'kkkkkkkkkkkkss',
    'kkkbbbbbbkkkss',
    'kkbbbbbbbbkkss',
    'kkbbbaabbbkkss',
    'kkbbaaaabbkkss',
    'kkbbaaaabbkkss',
    'kkbbbaabbbkkss',
    'kkbbbbbbbbkkss',
    'kkkbbbbbbkkkss',
    'kkkkkkkkkkkkss',
    '.kk......kk.ss',
  ],
  rock: [
    '...kkkk...',
    '.kkkkkkss.',
    'kkkkkkksss',
  ],
  crystal: [
    '...a....',
    '..aab...',
    '..aab...',
    '.aaabb.a',
    '.aaabbaa',
    'aaaabbaa',
  ],
  dish: [
    'kk..........kk',
    '.kk........kk.',
    '..kkk....kkk..',
    '...kkkkkkkk...',
    '.....kkkk.....',
    '......a.......',
    '......kk......',
    '......kk......',
    '......kk......',
    '......kk......',
    '....kkkkkk....',
  ],
};

export function SpotArt({ spot, active, cleared }) {
  switch (spot.kind) {
    case 'sign':
      return <div className="sign"><div className="sign-board"><small>ABOUT</small><b>关于 LEIDO</b></div><i /><i /></div>;
    case 'pod':
      return <div className="pod"><Pixels map={art.pod} /><span className="pod-label">LD-01</span></div>;
    case 'scope':
      return <Pixels map={art.scope} />;
    case 'cabinet': {
      const stage = stages[spot.project.number];
      return <div className="cabinet-wrap" style={{ '--cab': stage.color }}>
        <Prop kind={spot.prop} />
        <div className="cabinet">
          <div className="cab-marquee">{spot.project.title}</div>
          {cleared ? <span className="cab-clear">★ CLEAR</span> : stage.minigame && <span className="cab-demo">▶ 可试玩</span>}
          <div className="cab-body" />
          <div className="cab-side" />
          <CabinetScreen stage={stage} active={active} />
          <div className="cab-panel"><i className="stick" /><i /><i /></div>
          <div className="cab-slot"><i /></div>
          <span className="cab-coin" />
        </div>
      </div>;
    }
    case 'npc':
      return <div className="npc"><Pixels map={art.npc} /><span className="vision-tag npc-tag">npc · guide 0.97</span></div>;
    case 'frame':
      return <div className="easel"><div className="easel-frame"><img src={spot.project.image} alt="" loading="lazy" /></div><span className="easel-plaque">No. 03</span><i /><i /></div>;
    case 'mailbox':
      return <div className="mailbox"><Pixels map={art.mailbox} /><span className="mail-flag" /></div>;
    case 'rocket':
      return <div className="rocket"><div className="rocket-ship"><Pixels map={art.rocket} /><span className="rocket-flame" /></div><Pixels map={art.pad} /></div>;
    default:
      return null;
  }
}

// Walk up to a cabinet and its screen starts cycling through the game's screenshots.
function CabinetScreen({ stage, active }) {
  const shots = [...new Set(stage.media.map(item => item.thumb))];
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!active || shots.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => setIndex(current => (current + 1) % shots.length), 1300);
    return () => { clearInterval(timer); setIndex(0); };
  }, [active, shots.length]);
  return <div className="cab-screen"><img src={shots[index]} alt="" loading="lazy" key={shots[index]} /><span className="cab-insert">INSERT COIN</span></div>;
}

function Prop({ kind }) {
  if (kind === 'brazier') return <div className="prop brazier"><Pixels className="flame" map={art.flame} /><Pixels map={art.brazier} /></div>;
  if (kind === 'palm') return <div className="prop palm"><Pixels map={art.palm} /></div>;
  if (kind === 'speaker') return <div className="prop speaker"><span className="note">♪</span><span className="note">♫</span><Pixels map={art.speaker} /></div>;
  if (kind === 'bubbles') return <div className="prop bubbles"><span>AI</span><span>…</span></div>;
  return null;
}

export function Decor({ item, starCount, starTotal, clearCount, clearTotal }) {
  switch (item.kind) {
    case 'gate': {
      const from = zones[(item.zone + 3) % 4], to = zones[item.zone];
      return <div className="gate"><div className="gate-flag"><span>◀ {from.name}</span><b>{to.name} ▶</b></div><i /></div>;
    }
    case 'scoreboard':
      return <div className="scoreboard"><div><small>HI-SCORE</small><b>★ {String(starCount).padStart(2, '0')}/{starTotal}</b><small>CLEAR {clearCount}/{clearTotal}</small></div><i /></div>;
    case 'column':
      return <div className="column"><i /><span /><i /></div>;
    case 'pedestal':
      return <div className="pedestal"><Pixels map={art.vessel} /><span /></div>;
    case 'billboard':
      return <div className="billboard"><div>LET’S <em>PLAY.</em></div><i /><i /></div>;
    default:
      return art[item.kind] ? <Pixels map={art[item.kind]} /> : null;
  }
}

const farShapes = {
  moon: <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" className="far-fill" /><circle cx="34" cy="38" r="9" className="far-cut" /><circle cx="62" cy="64" r="13" className="far-cut" /><circle cx="66" cy="30" r="5" className="far-cut" /></svg>,
  ringed: <svg viewBox="0 0 160 100"><circle cx="80" cy="50" r="34" className="far-fill" /><ellipse cx="80" cy="54" rx="76" ry="14" className="far-ring" /></svg>,
  cartridge: <svg viewBox="0 0 80 90"><path d="M8 0h64v70h-8v20H16V70H8z" className="far-fill" /><rect x="18" y="12" width="44" height="30" className="far-cut" /></svg>,
  sun: <svg viewBox="0 0 100 100"><defs><clipPath id="far-sun"><circle cx="50" cy="50" r="48" /></clipPath></defs><g clipPath="url(#far-sun)" className="far-accent">{Array.from({ length: 9 }, (_, i) => <rect key={i} x="0" y={i * 11.5} width="100" height={7 + i * .3} />)}</g></svg>,
  cloud: <svg viewBox="0 0 24 10" shapeRendering="crispEdges"><path d="M6 2h6V0h6v2h2v2h4v6H0V6h2V4h4z" className="far-fill" /></svg>,
  satellite: <svg viewBox="0 0 120 50"><rect x="0" y="14" width="40" height="22" className="far-fill" /><rect x="80" y="14" width="40" height="22" className="far-fill" /><rect x="46" y="8" width="28" height="34" className="far-accent" /><rect x="40" y="23" width="40" height="4" className="far-fill" /></svg>,
  comet: <svg viewBox="0 0 160 40"><path d="M0 18 L130 12 L130 28 Z" className="far-trail" /><circle cx="138" cy="20" r="14" className="far-accent" /></svg>,
};

export function FarThing({ item }) {
  return <div className="slot far" style={{ '--a': `${item.angle}deg`, '--lift': `${item.r - R}px` }}><div className={`far-${item.kind}`}>{farShapes[item.kind]}</div></div>;
}

// Each zone's quarter of the crust carries its own surface pattern.
export function PlanetBody() {
  const band = (start, end, inner = 930) => {
    const point = (angle, r) => `${(Math.sin(rad(angle)) * r).toFixed(1)} ${(-Math.cos(rad(angle)) * r).toFixed(1)}`;
    return `M${point(start, R)} A${R} ${R} 0 0 1 ${point(end, R)} L${point(end, inner)} A${inner} ${inner} 0 0 0 ${point(start, inner)} Z`;
  };
  const craters = [[-30, 90, 34], [-8, 150, 20], [14, 70, 26], [33, 190, 40], [70, 120, 18], [112, 80, 30], [160, 140, 22], [200, 90, 36], [250, 160, 24], [290, 80, 30], [330, 130, 26]];
  return <svg className="planet-body" viewBox={`${-R} ${-R} ${R * 2} ${R * 2}`} aria-hidden="true">
    <defs>
      <pattern id="pat-cosmos" width="36" height="36" patternUnits="userSpaceOnUse"><circle cx="9" cy="9" r="3" /><circle cx="27" cy="25" r="2" /></pattern>
      <pattern id="pat-arcade" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="12" height="12" /><rect x="12" y="12" width="12" height="12" /></pattern>
      <pattern id="pat-museum" width="48" height="24" patternUnits="userSpaceOnUse"><path d="M0 0H48M0 12H48M24 0V12M0 12V24" strokeWidth="3" /></pattern>
      <pattern id="pat-orbit" width="40" height="20" patternUnits="userSpaceOnUse"><path d="M0 10 Q10 0 20 10 T40 10" strokeWidth="4" fill="none" /></pattern>
    </defs>
    <circle r={R} className="crust" />
    <circle r={R - 10} className="crust-edge" />
    {zones.map(zone => <path key={zone.id} d={band(zone.angle - 45, zone.angle + 45)} fill={`url(#pat-${zone.world})`} className={`band band-${zone.world}`} />)}
    {craters.map(([angle, depth, size]) => <ellipse key={angle} cx={Math.sin(rad(angle)) * (R - depth)} cy={-Math.cos(rad(angle)) * (R - depth)} rx={size} ry={size * .6} transform={`rotate(${angle} ${Math.sin(rad(angle)) * (R - depth)} ${-Math.cos(rad(angle)) * (R - depth)})`} className="crater" />)}
  </svg>;
}

export function Profile() {
  return <div className="profile">
    <img src={portrait} alt="Leido 的宇航员形象，伸手触碰星星" />
    <dl>
      <div><dt>NAME</dt><dd>LEIDO</dd></div>
      <div><dt>职业</dt><dd>game designer &amp; creative developer</dd></div>
      <div><dt>专长</dt><dd>游戏机制 · 交互叙事 · AI 角色</dd></div>
      <div><dt>装备</dt><dd>Unity 6 · LLM · VLM</dd></div>
      <div><dt>状态</dt><dd>保持好奇，继续创造</dd></div>
    </dl>
  </div>;
}

export function ContactSheet({ onCopy }) {
  return <div className="contact-sheet">
    <a className="game-button primary" href={`mailto:${contact.email}`}>✉ 发邮件<small>{contact.email}</small></a>
    <button className="game-button" onClick={() => onCopy(contact.email, '邮箱')}>复制邮箱</button>
    <button className="game-button" onClick={() => onCopy(contact.wechat, '微信号')}>微信 · {contact.wechat}<small>点击复制</small></button>
    <a className="game-button" href={contact.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
  </div>;
}
