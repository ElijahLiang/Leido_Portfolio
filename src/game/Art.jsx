import { useEffect, useState } from 'react';
import portrait from '../assets/portrait.webp';
import { stages } from './stages';
import { contact, R, rad, zones } from './world';

// Decorative storybook illustration: flat colour shapes, fine warm-ink contours and
// patterned plants. Every drawing is an <svg class="art">; CSS gives all of its shapes
// the same ink line, so only fills are written here. `thin`, `fine` and `ns` (no
// stroke) adjust the line; `hl` draws a paper-white highlight.
export const C = {
  ink: '#3d2f2b', cream: '#fbf5e8', paper: '#f3e7cf', wood: '#b47c55', bark: '#8a5a3c',
  leaf: '#8fb07e', leafDark: '#638a5c', moss: '#4f7350', clay: '#cf6e52', rose: '#e9a596',
  honey: '#e8bb5e', sky: '#a9cbd3', lilac: '#b6a4d0', plum: '#7c5c86', night: '#2b3454', stone: '#d8cfbb',
};

function Art({ w, h, className = '', children, box }) {
  return <svg className={`art ${className}`} width={w} height={h} viewBox={box ?? `0 0 ${w} ${h}`} overflow="visible" aria-hidden="true">{children}</svg>;
}

// A leaf grows from (x, y) along angle `a` (degrees, 0 = up).
function Leaf({ x = 0, y = 0, a = 0, l = 30, w = 9, fill = C.leaf, rib = true }) {
  return <g transform={`translate(${x} ${y}) rotate(${a})`}>
    <path d={`M0 0C${w} ${-l * .3} ${w * .8} ${-l * .8} 0 ${-l}C${-w * .8} ${-l * .8} ${-w} ${-l * .3} 0 0Z`} fill={fill} />
    {rib && <path className="fine" d={`M0 -3V${-l * .8}`} fill="none" />}
  </g>;
}

function Flower({ x, y, r = 6, fill = C.rose, heart = C.honey }) {
  return <g transform={`translate(${x} ${y})`}>
    {[0, 72, 144, 216, 288].map(a => <circle key={a} className="thin" cx={Math.sin(rad(a)) * r * .8} cy={-Math.cos(rad(a)) * r * .8} r={r * .62} fill={fill} />)}
    <circle className="thin" r={r * .42} fill={heart} />
  </g>;
}

const starPoints = (outer, inner) => Array.from({ length: 10 }, (_, i) => {
  const r = i % 2 ? inner : outer, a = rad(i * 36);
  return `${(Math.sin(a) * r).toFixed(2)} ${(-Math.cos(a) * r).toFixed(2)}`;
}).join(' L');
const STAR = `M${starPoints(17, 7.6)}Z`;

// Shared fills, referenced by url(#…) from any drawing on the page.
export function ArtDefs() {
  return <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
    <defs>
      <pattern id="pat-diamond" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M8 0L16 8L8 16L0 8Z" fill="none" stroke="#fbf5e8" strokeWidth="1.4" /><circle cx="8" cy="8" r="1.6" fill="#fbf5e8" /></pattern>
      <pattern id="pat-dots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="1.6" fill="#3d2f2b" opacity=".28" /><circle cx="11" cy="11" r="1.2" fill="#fbf5e8" opacity=".8" /></pattern>
      <pattern id="pat-stripes" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><rect width="5" height="12" fill="#fbf5e8" opacity=".55" /></pattern>
      <pattern id="pat-leafmark" width="26" height="22" patternUnits="userSpaceOnUse"><path d="M5 15q3-7 9-8q-2 7-9 8z" fill="#3d2f2b" opacity=".18" /><path d="M17 20q2-5 7-6q-1 5-7 6z" fill="#fbf5e8" opacity=".5" /></pattern>
      <pattern id="pat-pebbles" width="60" height="44" patternUnits="userSpaceOnUse"><ellipse cx="12" cy="12" rx="6" ry="4" fill="#3d2f2b" opacity=".16" /><ellipse cx="42" cy="30" rx="4" ry="3" fill="#fbf5e8" opacity=".35" /><circle cx="30" cy="8" r="1.6" fill="#3d2f2b" opacity=".25" /><circle cx="52" cy="10" r="1.2" fill="#3d2f2b" opacity=".25" /><path d="M18 34q4-3 8 0" fill="none" stroke="#3d2f2b" strokeOpacity=".22" strokeWidth="1.4" /></pattern>
      <pattern id="pat-meadow" width="34" height="30" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="2.4" fill="#fbf5e8" opacity=".75" /><circle cx="8" cy="8" r="1" fill="#e8bb5e" /><path d="M22 24q2-5 6-6q-1 5-6 6z" fill="#4f7350" opacity=".35" /></pattern>
      <pattern id="pat-fair" width="24" height="20" patternUnits="userSpaceOnUse"><path d="M0 10l6-6l6 6l6-6l6 6" fill="none" stroke="#fbf5e8" strokeOpacity=".6" strokeWidth="2" /></pattern>
      <pattern id="pat-museum" width="40" height="22" patternUnits="userSpaceOnUse"><path d="M0 1H40M0 12H40M20 1V12M0 12V22" fill="none" stroke="#3d2f2b" strokeOpacity=".18" strokeWidth="1.6" /></pattern>
      <pattern id="pat-night" width="40" height="34" patternUnits="userSpaceOnUse"><path d="M10 6l1.4 3.2 3.2 1.4-3.2 1.4-1.4 3.2-1.4-3.2-3.2-1.4 3.2-1.4z" fill="#f3d993" opacity=".7" /><circle cx="30" cy="24" r="1.4" fill="#fbf5e8" opacity=".6" /></pattern>
    </defs>
  </svg>;
}

// ---------- the player ----------

export function Astronaut() {
  return <div className="astronaut" aria-hidden="true">
    <div className="sprite">
      <Art w={96} h={108} className="astronaut-art">
        <g className="scarf">
          <path d="M44 50C34 47 26 54 16 51C10 49 6 45 2 47C6 53 12 58 19 59C29 60 36 57 45 57Z" fill={C.clay} />
          <path className="hl fine" d="M14 53q5 2 10 1M27 53q5 2 10 0" fill="none" />
        </g>
        <rect x="18" y="49" width="17" height="29" rx="6" fill={C.stone} />
        <path className="thin" d="M22 58h9M22 64h9" fill="none" />
        <g className="leg leg-back">
          <rect x="37" y="76" width="12" height="22" rx="5" fill="#ece3d2" />
          <rect x="34" y="94" width="18" height="9" rx="4.5" fill={C.bark} />
        </g>
        <rect x="29" y="45" width="40" height="40" rx="15" fill={C.cream} />
        <path className="thin" d="M31 72H67" fill="none" />
        <rect className="thin" x="44" y="69" width="9" height="6" rx="2" fill={C.honey} />
        <circle className="thin" cx="58" cy="58" r="5" fill={C.sky} />
        <path className="ns" d="M58 55l1 2.2 2.3.3-1.7 1.6.5 2.3-2.1-1.1-2.1 1.1.5-2.3-1.7-1.6 2.3-.3z" fill={C.cream} />
        <g className="leg leg-front">
          <rect x="49" y="76" width="12" height="22" rx="5" fill={C.cream} />
          <rect x="47" y="94" width="18" height="9" rx="4.5" fill={C.bark} />
        </g>
        <g className="arm">
          <rect x="57" y="51" width="11" height="23" rx="5.5" fill={C.cream} />
          <circle cx="62.5" cy="75" r="5.5" fill={C.honey} />
        </g>
        <rect x="33" y="45" width="32" height="8" rx="4" fill={C.honey} />
        <path className="thin" d="M37 8L33 -1" fill="none" />
        <circle cx="32.5" cy="-2.5" r="3.8" fill={C.clay} />
        <circle cx="49" cy="28" r="24" fill={C.cream} />
        <path className="thin" d="M27 34q22 10 44 0" fill="none" />
        <rect x="42" y="14" width="31" height="25" rx="12" fill="#d5e6e7" />
        <circle className="ns" cx="54" cy="27" r="2.1" fill={C.ink} />
        <circle className="ns" cx="65" cy="27" r="2.1" fill={C.ink} />
        <ellipse className="ns" cx="51" cy="32" rx="3" ry="1.8" fill={C.rose} />
        <ellipse className="ns" cx="68.5" cy="32" rx="2.6" ry="1.8" fill={C.rose} />
        <path className="thin" d="M58 32q1.6 1.6 3.2 0" fill="none" />
        <path className="hl thin" d="M47 20q5-4 11-3" fill="none" />
      </Art>
      <Sparkle className="held-star" />
    </div>
  </div>;
}

export function Sparkle({ className = '' }) {
  return <svg className={`sparkle ${className}`} viewBox="-21 -21 42 42" aria-hidden="true">
    <path d={STAR} />
    <path className="sparkle-shine" d="M-5 -6L-2 -10" />
  </svg>;
}

// ---------- landmarks ----------

function Sign() {
  return <div className="sign">
    <Art w={180} h={160}>
      <rect x="38" y="70" width="11" height="90" rx="3" fill={C.wood} />
      <rect x="131" y="70" width="11" height="90" rx="3" fill={C.wood} />
      <path d="M10 14Q10 4 20 4H160Q170 4 170 14V82Q170 92 160 92H20Q10 92 10 82Z" fill={C.cream} />
      <path className="thin" d="M18 12H162V84H18Z" fill="none" strokeDasharray="1 5" />
      <path d="M44 150c-6-14 4-22 2-36c8 8 6 22-2 36z" fill={C.leaf} />
      <path className="thin" d="M46 152c4-22 12-38 30-60" fill="none" />
      <Leaf x={52} y={128} a={40} l={18} w={6} />
      <Leaf x={60} y={112} a={-30} l={16} w={6} fill={C.leafDark} />
      <Flower x={140} y={150} r={6} fill={C.honey} heart={C.clay} />
      <Flower x={128} y={156} r={5} />
      <Leaf x={150} y={160} a={30} l={20} w={6} />
      <Flower x={170} y={10} r={7} />
      <Leaf x={160} y={6} a={-70} l={18} w={6} fill={C.leafDark} />
    </Art>
    <div className="sign-board"><small>ABOUT</small><b>关于 Leido</b></div>
  </div>;
}

function Pod() {
  return <div className="pod">
    <Art w={150} h={160}>
      <path className="thin" d="M75 22V-6" fill="none" />
      <path className="pennant" d="M75 -6L100 0L75 7Z" fill={C.honey} />
      <path d="M38 118L22 158M112 118L128 158M75 124V158" fill="none" />
      <path d="M14 158h18M118 158h18M66 158h18" fill="none" />
      <path d="M20 112C20 52 42 22 75 22C108 22 130 52 130 112Q130 126 116 126H34Q20 126 20 112Z" fill={C.cream} />
      <path d="M22 92H128V110H22Z" fill={C.clay} />
      <path d="M22 92H128V110H22Z" fill="url(#pat-diamond)" />
      <circle cx="75" cy="60" r="20" fill={C.honey} />
      <circle cx="75" cy="60" r="13" fill="#d5e6e7" />
      <path className="hl thin" d="M68 54q4-4 10-3" fill="none" />
      <circle className="ns" cx="40" cy="76" r="2.5" fill={C.ink} />
      <circle className="ns" cx="110" cy="76" r="2.5" fill={C.ink} />
      <text x="75" y="122" textAnchor="middle" className="art-label">LD·01</text>
      <Flower x={30} y={158} r={5} fill={C.lilac} />
      <Leaf x={42} y={158} a={25} l={16} w={5} />
    </Art>
  </div>;
}

function Scope() {
  return <div className="scope">
    <Art w={130} h={150}>
      <path d="M58 82L28 150M64 82L66 150M70 82L104 150" fill="none" />
      <circle cx="64" cy="80" r="6" fill={C.bark} />
      <g transform="rotate(-32 64 72)">
        <rect x="18" y="62" width="96" height="20" rx="6" fill={C.honey} />
        <rect x="104" y="58" width="16" height="28" rx="4" fill={C.clay} />
        <rect x="8" y="65" width="14" height="14" rx="3" fill={C.bark} />
        <path className="thin" d="M46 62V82M74 62V82" fill="none" />
        <rect x="18" y="62" width="96" height="20" rx="6" fill="url(#pat-stripes)" className="ns" />
      </g>
      <path className="ns" d="M116 6l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill={C.honey} />
    </Art>
  </div>;
}

// A storybook market stall stands in for each project: striped awning, arched
// window with the game's screenshots, and the title painted on the counter.
function Stall({ spot, active, cleared }) {
  const stage = stages[spot.project.number];
  return <div className="cabinet-wrap" style={{ '--cab': stage.color }}>
    <Prop kind={spot.prop} />
    <div className="cabinet">
      <Art w={180} h={280} className="stall-back">
        <path className="thin" d="M90 6V-14" fill="none" />
        <path className="pennant" d="M90 -14L112 -8L90 -2Z" fill={C.honey} />
        <rect x="14" y="56" width="10" height="224" fill={C.wood} />
        <rect x="156" y="56" width="10" height="224" fill={C.wood} />
        <rect x="22" y="70" width="136" height="124" fill={C.paper} />
        <rect x="22" y="70" width="136" height="124" fill="url(#pat-dots)" className="ns" />
        <path className="cab-fill" d="M0 40Q90 -6 180 40Z" />
        <path d="M0 40Q90 -6 180 40Z" fill="url(#pat-stripes)" className="ns" />
        {[0, 1, 2, 3, 4, 5].map(i => <g key={i}>
          <rect className={i % 2 ? undefined : 'cab-fill'} x={i * 30} y="40" width="30" height="22" fill={i % 2 ? C.cream : undefined} />
          <path className={i % 2 ? undefined : 'cab-fill'} d={`M${i * 30} 62a15 15 0 0 0 30 0Z`} fill={i % 2 ? C.cream : undefined} />
        </g>)}
        <rect x="4" y="192" width="172" height="12" rx="5" fill={C.wood} />
        <rect x="10" y="202" width="160" height="78" fill={C.cream} />
        <rect className="cab-fill" x="10" y="202" width="160" height="78" />
        <rect x="10" y="202" width="160" height="78" fill="url(#pat-diamond)" className="ns" />
      </Art>
      <div className="cab-screen"><CabinetScreen stage={stage} active={active} /></div>
      <Art w={180} h={280} className="stall-front">
        <path className="curtain curtain-l cab-fill" d="M24 66C42 70 48 92 40 118C36 136 38 160 30 190H24Z" />
        <path className="curtain curtain-r cab-fill" d="M156 66C138 70 132 92 140 118C144 136 142 160 150 190H156Z" />
        <circle className="thin" cx="24" cy="70" r="4" fill={C.honey} />
        <circle className="thin" cx="156" cy="70" r="4" fill={C.honey} />
      </Art>
      <div className="cab-marquee"><span>{spot.project.title}</span></div>
      {cleared ? <span className="cab-clear">✿ 已通关</span> : stage.minigame && <span className="cab-demo">可试玩</span>}
      <span className="cab-coin"><Sparkle /></span>
    </div>
  </div>;
}

// Walk up to a stall and its window starts leafing through the game's screenshots.
function CabinetScreen({ stage, active }) {
  const shots = [...new Set(stage.media.map(item => item.thumb))];
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!active || shots.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => setIndex(current => (current + 1) % shots.length), 1300);
    return () => { clearInterval(timer); setIndex(0); };
  }, [active, shots.length]);
  return <><img src={shots[index]} alt="" loading="lazy" key={shots[index]} /><span className="cab-insert">翻开看看</span></>;
}

function Prop({ kind }) {
  // Grandmother's lace umbrella, with the little light hanging on in the wind.
  if (kind === 'umbrella') return <div className="prop umbrella"><Art w={64} h={130}>
    <path d="M32 28V84q0 9-8 9" fill="none" />
    <path d="M2 30Q4 4 32 2Q60 4 62 30Q55 24 47 30Q40 24 32 30Q24 24 17 30Q10 24 2 30Z" fill={C.lilac} />
    <path className="ns" d="M2 30Q4 4 32 2Q60 4 62 30Q55 24 47 30Q40 24 32 30Q24 24 17 30Q10 24 2 30Z" fill="url(#pat-dots)" />
    <path className="thin" d="M32 2L17 30M32 2L47 30" fill="none" />
    <circle className="thin" cx="32" cy="1" r="2.5" fill={C.honey} />
    <g className="umbrella-spirit">
      <path d="M24 96c3-6 12-6 15-1c6-1 10 5 7 10c4 4 1 11-5 10c-2 6-11 7-15 2c-6 2-11-4-8-9c-5-4-2-11 6-12z" fill="#efd3e6" />
      <circle className="ns" cx="27" cy="106" r="1.8" fill={C.ink} /><circle className="ns" cx="36" cy="106" r="1.8" fill={C.ink} />
    </g>
  </Art></div>;
  if (kind === 'brazier') return <div className="prop brazier"><Art w={70} h={130}>
    <g className="flame">
      <path d="M35 6C46 24 60 34 56 52C54 64 46 70 35 70C24 70 15 63 14 52C13 40 22 36 24 22C28 30 30 34 33 34C34 22 31 14 35 6Z" fill={C.clay} />
      <path d="M35 30C42 40 48 46 46 56C45 63 40 66 35 66C29 66 25 62 25 56C25 48 31 46 31 38C33 42 35 42 35 30Z" fill={C.honey} />
      <path className="thin" d="M35 48C38 52 40 55 39 59C38 62 32 62 31 59C30 56 34 54 35 48Z" fill={C.cream} />
    </g>
    <path d="M8 68H62Q60 88 35 90Q10 88 8 68Z" fill={C.stone} />
    <path className="thin" d="M12 76H58" fill="none" strokeDasharray="4 4" />
    <path d="M24 88L16 130M46 88L54 130M35 90V130" fill="none" />
  </Art></div>;
  if (kind === 'palm') return <div className="prop palm"><Art w={110} h={170}>
    <path d="M52 170C54 130 50 90 60 46H68C60 90 64 130 64 170Z" fill={C.wood} />
    {[60, 80, 100, 120, 140, 156].map(y => <path key={y} className="thin" d={`M${54 + (170 - y) * .06} ${y}q6 -4 10 0`} fill="none" />)}
    <Leaf x={64} y={48} a={-70} l={58} w={12} />
    <Leaf x={64} y={48} a={-25} l={50} w={12} fill={C.leafDark} />
    <Leaf x={64} y={48} a={20} l={52} w={12} />
    <Leaf x={64} y={48} a={68} l={56} w={12} fill={C.leafDark} />
    <Leaf x={64} y={48} a={110} l={40} w={10} />
    <Leaf x={64} y={48} a={-112} l={40} w={10} fill={C.leafDark} />
    <circle cx="58" cy="56" r="6" fill={C.bark} /><circle cx="70" cy="58" r="6" fill={C.wood} />
  </Art></div>;
  if (kind === 'gramophone') return <div className="prop gramophone"><span className="music-note">♪</span><span className="music-note">♫</span><Art w={100} h={140}>
    <rect x="18" y="96" width="64" height="40" rx="5" fill={C.wood} />
    <rect x="24" y="102" width="52" height="28" rx="3" fill={C.lilac} />
    <rect x="24" y="102" width="52" height="28" rx="3" fill="url(#pat-diamond)" className="ns" />
    <path d="M50 96V70C50 60 46 54 40 50" fill="none" />
    <path d="M40 52L14 6Q34 -4 52 4Q70 14 62 30Z" fill={C.honey} />
    <path className="thin" d="M40 52L22 6M40 52L36 0M40 52L50 4M40 52L60 18" fill="none" />
    <ellipse cx="50" cy="96" rx="34" ry="5" fill={C.bark} />
  </Art></div>;
  if (kind === 'bubbles') return <div className="prop bubbles"><span>AI</span><span>…</span></div>;
  return null;
}

function Guide() {
  return <div className="npc">
    <Art w={84} h={182}>
      <rect x="30" y="150" width="9" height="28" rx="4" fill={C.ink} />
      <rect x="45" y="150" width="9" height="28" rx="4" fill={C.ink} />
      <path d="M22 178h20M42 178h20" fill="none" />
      <path d="M42 56C24 56 18 70 16 100L10 156H74L68 100C66 70 60 56 42 56Z" fill="#8fae8b" />
      <path d="M42 56C24 56 18 70 16 100L10 156H74L68 100C66 70 60 56 42 56Z" fill="url(#pat-leafmark)" className="ns" />
      <path d="M32 58L42 80L52 58" fill={C.cream} />
      <path className="thin" d="M42 80V154" fill="none" />
      <circle className="thin" cx="42" cy="96" r="2.4" fill={C.honey} /><circle className="thin" cx="42" cy="112" r="2.4" fill={C.honey} />
      <rect x="50" y="92" width="22" height="28" rx="3" fill={C.clay} transform="rotate(-8 61 106)" />
      <path className="hl thin" d="M54 100h12M54 106h10" fill="none" transform="rotate(-8 61 106)" />
      <path d="M60 70C70 84 70 100 64 110" fill="none" />
      <circle cx="42" cy="34" r="20" fill="#f2d4b7" />
      <path d="M22 30C22 10 62 8 62 30C56 22 34 20 22 30Z" fill={C.plum} />
      <circle cx="42" cy="12" r="8" fill={C.plum} />
      <circle className="ns" cx="35" cy="36" r="2" fill={C.ink} />
      <circle className="ns" cx="49" cy="36" r="2" fill={C.ink} />
      <ellipse className="ns" cx="31" cy="42" rx="3" ry="1.8" fill={C.rose} />
      <ellipse className="ns" cx="53" cy="42" rx="3" ry="1.8" fill={C.rose} />
      <path className="thin" d="M39 44q3 2.4 6 0" fill="none" />
    </Art>
    <span className="vision-tag npc-tag">npc · guide 0.97</span>
  </div>;
}

function Easel({ project }) {
  return <div className="easel">
    <Art w={196} h={224} className="easel-legs">
      <path d="M70 20L40 224M126 20L156 224M98 30V224" fill="none" style={{ stroke: C.wood, strokeWidth: 7 }} />
      <path d="M70 20L40 224M126 20L156 224M98 30V224" fill="none" />
      <rect x="34" y="150" width="128" height="9" rx="3" fill={C.wood} />
    </Art>
    <div className="easel-frame"><img src={project.image} alt="" loading="lazy" /></div>
    <span className="easel-plaque">No. 05</span>
  </div>;
}

function Mailbox() {
  return <div className="mailbox">
    <Art w={96} h={170}>
      <rect x="40" y="70" width="12" height="100" rx="3" fill={C.wood} />
      <path className="thin" d="M46 168c-10-20 8-30-2-52c12 10 14 30 2 52z" fill={C.leaf} />
      <Leaf x={46} y={140} a={-50} l={18} w={6} fill={C.leafDark} />
      <Leaf x={48} y={124} a={45} l={16} w={6} />
      <Flower x={36} y={166} r={5} fill={C.honey} heart={C.clay} />
      <Flower x={60} y={166} r={6} />
      <path d="M8 74V38C8 18 24 6 46 6C68 6 84 18 84 38V74Z" fill={C.clay} />
      <path d="M8 74V38C8 18 24 6 46 6C68 6 84 18 84 38V74Z" fill="url(#pat-stripes)" className="ns" />
      <path d="M26 40H66" fill="none" />
      <rect x="30" y="28" width="32" height="12" rx="2" fill={C.cream} transform="rotate(-6 46 34)" />
      <path className="thin" d="M30 28l16 8l16-8" fill="none" transform="rotate(-6 46 34)" />
      <text x="46" y="64" textAnchor="middle" className="art-label art-label-light">POST</text>
    </Art>
    <span className="mail-flag" />
  </div>;
}

function Rocket() {
  return <div className="rocket">
    <div className="rocket-ship">
      <Art w={100} h={196}>
        <path d="M24 146L6 176Q4 186 14 182L30 168Z" fill={C.clay} />
        <path d="M76 146L94 176Q96 186 86 182L70 168Z" fill={C.clay} />
        <path d="M50 4C78 30 82 90 76 168H24C18 90 22 30 50 4Z" fill={C.cream} />
        <path d="M50 4C62 15 70 30 74 46H26C30 30 38 15 50 4Z" fill={C.clay} />
        <path d="M50 4C62 15 70 30 74 46H26C30 30 38 15 50 4Z" fill="url(#pat-dots)" className="ns" />
        <circle cx="50" cy="86" r="18" fill={C.honey} />
        <circle cx="50" cy="86" r="12" fill={C.lilac} />
        <path className="hl thin" d="M44 81q4-4 10-3" fill="none" />
        <path d="M24 128H76V142H24Z" fill={C.sky} />
        <path d="M24 128H76V142H24Z" fill="url(#pat-diamond)" className="ns" />
        <path d="M44 150L50 190L56 150Z" fill={C.clay} />
      </Art>
      <span className="rocket-flame"><Art w={48} h={90}>
        <path d="M4 0C4 30 14 56 24 88C34 56 44 30 44 0Z" fill={C.clay} />
        <path className="thin" d="M12 0C12 22 18 40 24 62C30 40 36 22 36 0Z" fill={C.honey} />
      </Art></span>
    </div>
    <Art w={130} h={28} className="pad">
      <rect x="4" y="4" width="122" height="12" rx="5" fill={C.wood} />
      <path d="M18 16V28M50 16V28M80 16V28M112 16V28" fill="none" />
    </Art>
  </div>;
}

export function SpotArt({ spot, active, cleared }) {
  switch (spot.kind) {
    case 'sign': return <Sign />;
    case 'pod': return <Pod />;
    case 'scope': return <Scope />;
    case 'cabinet': return <Stall spot={spot} active={active} cleared={cleared} />;
    case 'npc': return <Guide />;
    case 'frame': return <Easel project={spot.project} />;
    case 'mailbox': return <Mailbox />;
    case 'rocket': return <Rocket />;
    default: return null;
  }
}

// ---------- scenery ----------

const plants = {
  tree: <Art w={150} h={236}>
    <path d="M66 236C68 196 64 170 70 140H82C86 170 84 196 86 236Z" fill={C.bark} />
    <path className="thin" d="M74 170q-14-10-22-26M78 160q12-8 18-22" fill="none" />
    <path d="M75 6C112 6 140 36 140 76C140 116 116 146 76 146C34 146 10 118 10 78C10 36 38 6 75 6Z" fill={C.leafDark} />
    <path d="M75 6C112 6 140 36 140 76C140 116 116 146 76 146C34 146 10 118 10 78C10 36 38 6 75 6Z" fill="url(#pat-leafmark)" className="ns" />
    <path d="M30 90C30 60 50 40 74 40C100 40 120 60 120 88C120 116 100 132 74 132C50 132 30 116 30 90Z" fill={C.leaf} />
    <path d="M30 90C30 60 50 40 74 40C100 40 120 60 120 88C120 116 100 132 74 132C50 132 30 116 30 90Z" fill="url(#pat-meadow)" className="ns" />
    {[[54, 64], [92, 58], [104, 100], [62, 108], [80, 84]].map(([x, y]) => <circle key={x} className="thin" cx={x} cy={y} r="4.5" fill={C.clay} />)}
  </Art>,
  bush: <Art w={112} h={64}>
    <path d="M6 64C2 46 12 34 26 36C28 18 48 12 58 24C68 10 92 16 92 34C106 34 112 50 106 64Z" fill={C.leafDark} />
    <path d="M6 64C2 46 12 34 26 36C28 18 48 12 58 24C68 10 92 16 92 34C106 34 112 50 106 64Z" fill="url(#pat-leafmark)" className="ns" />
    <Flower x={34} y={42} r={5} /><Flower x={72} y={32} r={5} fill={C.cream} /><Flower x={88} y={52} r={4} fill={C.honey} heart={C.clay} />
  </Art>,
  flowers: <Art w={84} h={64}>
    <path className="thin" d="M20 64C20 46 16 36 14 26M42 64C42 40 44 26 44 12M64 64C64 48 68 38 72 30" fill="none" />
    <Leaf x={20} y={60} a={-40} l={18} w={6} /><Leaf x={42} y={52} a={40} l={18} w={6} fill={C.leafDark} /><Leaf x={64} y={60} a={45} l={16} w={6} />
    <Flower x={14} y={24} r={7} /><Flower x={44} y={12} r={8} fill={C.honey} heart={C.clay} /><Flower x={72} y={28} r={7} fill={C.lilac} />
  </Art>,
  fern: <Art w={74} h={84}>
    {[[-34, 70], [0, 80], [34, 70]].map(([a, l]) => <g key={a} transform={`translate(37 84) rotate(${a})`}>
      <path className="thin" d={`M0 0Q4 ${-l / 2} 0 ${-l}`} fill="none" />
      {Array.from({ length: 6 }, (_, i) => <g key={i}><Leaf y={-12 - i * 10} a={-60} l={14 - i * 1.4} w={4} rib={false} fill={i % 2 ? C.leaf : C.leafDark} /><Leaf y={-12 - i * 10} a={60} l={14 - i * 1.4} w={4} rib={false} fill={i % 2 ? C.leafDark : C.leaf} /></g>)}
    </g>)}
  </Art>,
  mushroom: <Art w={64} h={52}>
    <path d="M16 52V34H26V52Z" fill={C.cream} /><path d="M4 36C4 18 38 18 38 36Z" fill={C.clay} />
    <circle className="ns" cx="14" cy="28" r="2.6" fill={C.cream} /><circle className="ns" cx="26" cy="26" r="2" fill={C.cream} />
    <path d="M46 52V40H54V52Z" fill={C.cream} /><path d="M38 42C38 28 62 28 62 42Z" fill={C.honey} />
    <circle className="ns" cx="48" cy="36" r="1.8" fill={C.cream} />
  </Art>,
  rock: <Art w={76} h={30}>
    <path d="M4 30C2 16 14 8 26 10C34 2 50 4 52 16C62 14 72 20 72 30Z" fill={C.stone} />
    <path className="thin" d="M24 20q6-4 12 0M48 24q4-3 8 0" fill="none" />
  </Art>,
};

function Column() {
  return <div className="column"><Art w={80} h={214}>
    <rect x="4" y="198" width="72" height="16" rx="3" fill={C.stone} />
    <rect x="14" y="30" width="52" height="168" fill={C.cream} />
    {[24, 34, 46, 56].map(x => <path key={x} className="thin" d={`M${x} 34V194`} fill="none" />)}
    <path d="M2 30Q2 16 16 16H64Q78 16 78 30Z" fill={C.stone} />
    <circle className="thin" cx="12" cy="26" r="6" fill={C.cream} /><circle className="thin" cx="68" cy="26" r="6" fill={C.cream} />
    <rect x="8" y="6" width="64" height="10" rx="2" fill={C.stone} />
    <path className="thin" d="M62 196c-20-20 14-36-6-64c-14-20 14-34 2-60" fill="none" />
    <Leaf x={58} y={170} a={60} l={14} w={5} /><Leaf x={56} y={128} a={-60} l={14} w={5} fill={C.leafDark} /><Leaf x={60} y={92} a={50} l={14} w={5} />
  </Art></div>;
}

function Pedestal() {
  return <div className="pedestal"><Art w={104} h={176}>
    <rect x="12" y="74" width="80" height="102" fill={C.cream} />
    <rect x="4" y="64" width="96" height="12" rx="3" fill={C.stone} />
    <rect x="4" y="166" width="96" height="10" rx="3" fill={C.stone} />
    <path className="thin" d="M24 90H80V150H24Z" fill="none" strokeDasharray="2 5" />
    <path d="M38 64C26 54 26 30 40 20V8H64V20C78 30 78 54 66 64Z" fill={C.clay} />
    <path d="M30 32H74V46H30Z" fill={C.honey} className="ns" />
    <path className="thin" d="M29 32H75M29 46H75" fill="none" />
    <path className="thin" d="M34 39l4-4l4 4l4-4l4 4l4-4l4 4l4-4l4 4l4-4l4 4" fill="none" />
    <path d="M40 20H64" fill="none" />
  </Art></div>;
}

function Gate({ zone }) {
  const from = zones[(zone + 3) % 4], to = zones[zone];
  return <div className="gate">
    <Art w={14} h={236}><rect x="1" y="0" width="12" height="236" rx="4" fill={C.wood} /><circle className="thin" cx="7" cy="2" r="6" fill={C.honey} /></Art>
    <div className="gate-flag"><span>◂ {from.name}</span><b>{to.name} ▸</b></div>
  </div>;
}

function Scoreboard({ starCount, starTotal, clearCount, clearTotal }) {
  return <div className="scoreboard">
    <Art w={150} h={166}>
      <path d="M40 100L26 166M110 100L124 166" fill="none" style={{ stroke: C.wood, strokeWidth: 7 }} />
      <path d="M40 100L26 166M110 100L124 166" fill="none" />
      <rect x="2" y="2" width="146" height="104" rx="8" fill={C.wood} />
      <rect x="10" y="10" width="130" height="88" rx="4" fill="#4f6b5a" />
    </Art>
    <div><small>收集簿</small><b>★ {String(starCount).padStart(2, '0')}/{starTotal}</b><small>通关 {clearCount}/{clearTotal}</small></div>
  </div>;
}

function Billboard() {
  return <div className="billboard">
    <Art w={260} h={190}>
      <rect x="20" y="10" width="10" height="180" rx="3" fill={C.wood} /><rect x="230" y="10" width="10" height="180" rx="3" fill={C.wood} />
      <path className="thin" d="M25 16Q130 50 235 16" fill="none" />
      {[0, 1, 2, 3, 4, 5, 6].map(i => { const x = 44 + i * 28, y = 16 + Math.sin((x - 25) / 210 * Math.PI) * 17; return <path key={i} className="thin" d={`M${x - 10} ${y}L${x + 10} ${y}L${x} ${y + 18}Z`} fill={[C.clay, C.honey, C.sky, C.rose][i % 4]} />; })}
      <path d="M14 56H246L236 82L246 108L236 134H24L14 108L24 82Z" fill={C.cream} />
      <path className="thin" d="M30 64H230V126H30Z" fill="none" strokeDasharray="1 5" />
    </Art>
    <div>LET’S <em>play.</em></div>
  </div>;
}

function Lamp() {
  return <div className="lamp"><span className="lamp-glow" /><Art w={56} h={196}>
    <rect x="24" y="60" width="8" height="128" rx="3" fill={C.ink} />
    <path d="M12 196h32" fill="none" />
    <path d="M28 76c-14 4-18 14-16 22" fill="none" />
    <path d="M12 20L28 6L44 20Z" fill={C.ink} />
    <rect x="14" y="20" width="28" height="36" rx="4" fill={C.honey} />
    <path className="thin" d="M28 20V56M14 38H42" fill="none" />
    <rect x="12" y="56" width="32" height="6" rx="2" fill={C.ink} />
  </Art></div>;
}

export function Decor({ item, starCount, starTotal, clearCount, clearTotal }) {
  switch (item.kind) {
    case 'gate': return <Gate zone={item.zone} />;
    case 'scoreboard': return <Scoreboard starCount={starCount} starTotal={starTotal} clearCount={clearCount} clearTotal={clearTotal} />;
    case 'column': return <Column />;
    case 'pedestal': return <Pedestal />;
    case 'billboard': return <Billboard />;
    case 'lamp': return <Lamp />;
    default: return plants[item.kind] ?? null;
  }
}

const farShapes = {
  cloud: <Art w={180} h={80}>
    <path d="M18 74C2 74 0 50 18 46C14 24 40 14 56 28C64 6 100 2 112 26C124 14 150 20 150 40C170 38 180 56 170 74Z" fill={C.cream} />
    <path className="thin" d="M70 50q10-12 22 0q-8 8-14 2" fill="none" />
  </Art>,
  sun: <Art w={170} h={170} box="-85 -85 170 170">
    {Array.from({ length: 12 }, (_, i) => <ellipse key={i} className="thin" rx="10" ry="22" cy="-58" transform={`rotate(${i * 30})`} fill={i % 2 ? C.honey : C.clay} />)}
    <circle r="42" fill={C.honey} />
    <path className="thin" d="M-18 -4q6-6 12 0M6 -4q6-6 12 0M-10 14q10 8 20 0" fill="none" />
    <ellipse className="ns" cx="-24" cy="10" rx="6" ry="3.5" fill={C.rose} /><ellipse className="ns" cx="24" cy="10" rx="6" ry="3.5" fill={C.rose} />
  </Art>,
  birds: <Art w={120} h={50}>
    <path d="M6 30q10-12 20 0q10-12 20 0M60 14q8-10 16 0q8-10 16 0M84 40q6-8 12 0q6-8 12 0" fill="none" />
  </Art>,
  balloon: <Art w={110} h={170}>
    <path d="M55 4C86 4 104 28 104 56C104 84 78 104 66 120H44C32 104 6 84 6 56C6 28 24 4 55 4Z" fill={C.rose} />
    <path d="M55 4C40 20 36 40 38 64C40 88 44 104 48 120H62C66 104 70 88 72 64C74 40 70 20 55 4Z" fill={C.cream} />
    <path className="thin" d="M55 4V120M8 50H102" fill="none" />
    <path className="thin" d="M44 120L42 142M66 120L68 142" fill="none" />
    <rect x="38" y="142" width="34" height="24" rx="4" fill={C.wood} />
    <path className="thin" d="M40 152H70" fill="none" />
  </Art>,
  kite: <Art w={130} h={170}>
    <path className="thin" d="M50 92C40 120 70 130 58 150C50 162 66 168 74 170" fill="none" />
    {[[52, 112], [56, 136], [66, 160]].map(([x, y]) => <path key={y} className="thin" d={`M${x} ${y}l-9 -6v12zM${x} ${y}l9 -6v12z`} fill={C.clay} />)}
    <path d="M50 4L90 46L50 92L14 46Z" fill={C.honey} />
    <path d="M50 4L90 46H50Z" fill={C.lilac} /><path d="M50 92L14 46H50Z" fill={C.lilac} />
    <path className="thin" d="M50 4V92M14 46H90" fill="none" />
  </Art>,
  ringed: <Art w={200} h={130} box="-100 -65 200 130">
    <path d="M-90 4A90 20 0 0 1 90 4" fill="none" style={{ stroke: C.honey, strokeWidth: 9 }} />
    <circle r="44" fill={C.lilac} />
    <path className="thin" d="M-40 -16q40 10 80 0M-43 4q43 10 86 0M-36 22q36 8 72 0" fill="none" />
    <path d="M-90 4A90 20 0 0 0 90 4" fill="none" style={{ stroke: C.honey, strokeWidth: 9 }} />
    <path className="thin" d="M-94 4A94 24 0 0 0 94 4M-86 4A86 16 0 0 0 86 4" fill="none" />
  </Art>,
  comet: <Art w={200} h={70}>
    <path d="M150 30C110 20 80 46 46 34C26 28 12 38 2 30C14 50 34 52 52 48C88 42 114 52 150 42Z" fill={C.rose} />
    <path className="thin hl" d="M126 34C100 32 80 42 56 40" fill="none" />
    <g transform="translate(166 36) rotate(14)"><path d={STAR} fill={C.honey} /></g>
  </Art>,
  moon: <Art w={120} h={120} box="-60 -60 120 120">
    <path d="M10 -50A50 50 0 1 0 10 50A40 40 0 1 1 10 -50Z" fill={C.cream} />
    <circle className="thin" cx="-22" cy="-6" r="5" fill={C.stone} /><circle className="thin" cx="-12" cy="22" r="3.5" fill={C.stone} />
    <path className="ns" d="M36 -30l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill={C.honey} />
  </Art>,
};

export function FarThing({ item }) {
  return <div className="slot far" style={{ '--a': `${item.angle}deg`, '--lift': `${item.r - R}px` }}><div className={`far-${item.kind}`}>{farShapes[item.kind]}</div></div>;
}

// ---------- the planet ----------

const GRASS = { meadow: '#a3c48b', fair: '#e6c180', museum: '#bcc7a8', night: '#6f9098' };
const point = (angle, r) => `${(Math.sin(rad(angle)) * r).toFixed(1)} ${(-Math.cos(rad(angle)) * r).toFixed(1)}`;

// A quarter of the crust: a scalloped grass edge down to an inner arc.
function scallopBand(start, end, inner) {
  const steps = Math.round((end - start) / 1.5);
  let d = `M${point(start, R - 4)}`;
  for (let i = 0; i < steps; i++) {
    const a = start + (i + .5) * (end - start) / steps, b = start + (i + 1) * (end - start) / steps;
    d += ` Q${point(a, R + 12)} ${point(b, R - 4)}`;
  }
  return `${d} L${point(end, inner)} A${inner} ${inner} 0 0 0 ${point(start, inner)} Z`;
}

// Small plants sprout from the rim at regular intervals; the pattern repeats every five.
const sprouts = Array.from({ length: 150 }, (_, i) => ({ angle: i * 2.4 + 1, kind: i % 5 }));
function Sprout({ kind }) {
  if (kind === 0) return <path className="thin" d="M-4 0q-2-10-6-14M0 0q0-12 2-18M4 0q3-8 8-11" fill="none" />;
  if (kind === 1) return <><path className="thin" d="M0 0V-14" fill="none" /><Flower y={-16} r={4} /></>;
  if (kind === 2) return <><Leaf a={-30} l={12} w={4} rib={false} fill={C.leafDark} /><Leaf a={25} l={10} w={4} rib={false} /></>;
  if (kind === 3) return <><path className="thin" d="M0 0V-11" fill="none" /><Flower y={-13} r={3.4} fill={C.cream} /></>;
  return <path className="thin" d="M-3 0q-1-7-4-10M3 0q2-6 5-8" fill="none" />;
}

export function PlanetBody() {
  const zoneOf = angle => zones[((Math.round(angle / 90) % 4) + 4) % 4].world;
  return <svg className="planet-body art" viewBox={`${-R} ${-R} ${R * 2} ${R * 2}`} aria-hidden="true">
    <circle r={R - 40} fill="#d9ab80" />
    <circle r={R - 40} fill="url(#pat-pebbles)" className="ns" />
    <circle r={R - 150} fill="#c99470" />
    <circle className="thin" r={R - 168} fill="none" strokeDasharray="2 10" />
    <circle r={R - 300} fill="#b47e5c" />
    <circle r={R - 300} fill="url(#pat-pebbles)" className="ns" />
    <circle r={R - 480} fill="#9e6c4f" />
    {Array.from({ length: 16 }, (_, i) => <ellipse key={i} rx="46" ry="150" cy={-300} transform={`rotate(${i * 22.5})`} fill={i % 2 ? C.honey : C.clay} />)}
    <circle r="200" fill={C.cream} />
    {Array.from({ length: 8 }, (_, i) => <Leaf key={i} a={i * 45} l={150} w={42} fill={i % 2 ? C.leaf : C.leafDark} />)}
    <circle r="60" fill={C.honey} />
    <path d={STAR} transform="scale(2.4)" fill={C.clay} />
    {zones.map(zone => <g key={zone.id}>
      <path d={scallopBand(zone.angle - 45, zone.angle + 45, R - 58)} fill={GRASS[zone.world]} />
      <path d={scallopBand(zone.angle - 45, zone.angle + 45, R - 58)} fill={`url(#pat-${zone.world})`} className="ns" />
    </g>)}
    {sprouts.map(sprout => <g key={sprout.angle} className={`sprout sprout-${zoneOf(sprout.angle)}`} transform={`rotate(${sprout.angle}) translate(0 ${-R + 2})`}><Sprout kind={sprout.kind} /></g>)}
  </svg>;
}

// A botanical sprig for page margins.
export function Sprig({ className = 'gallery-sprig' }) {
  return <svg className={`art ${className}`} viewBox="0 0 220 260" aria-hidden="true">
    <path className="thin" d="M40 256C60 190 90 130 170 20" fill="none" />
    <path className="thin" d="M84 160C110 150 130 156 150 140M66 200C50 180 30 176 18 160" fill="none" />
    <Leaf x={58} y={214} a={-60} l={44} w={13} fill={C.leafDark} /><Leaf x={70} y={186} a={50} l={40} w={12} />
    <Leaf x={92} y={148} a={-50} l={40} w={12} /><Leaf x={112} y={118} a={55} l={36} w={11} fill={C.leafDark} />
    <Leaf x={134} y={84} a={-45} l={32} w={10} /><Leaf x={150} y={58} a={60} l={28} w={9} fill={C.leafDark} />
    <Flower x={170} y={20} r={13} /><Flower x={150} y={140} r={10} fill={C.honey} heart={C.clay} /><Flower x={18} y={160} r={9} fill={C.lilac} />
    {[[190, 70], [200, 110], [120, 40]].map(([x, y]) => <circle key={x} className="thin" cx={x} cy={y} r="3.5" fill={C.clay} />)}
    <path className="ns" d="M196 30l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill={C.honey} />
  </svg>;
}

// ---------- small drawn icons for the HUD ----------

export function Icon({ name }) {
  const shapes = {
    sound: <><path d="M3 9h4l5-4v14l-5-4H3z" /><path d="M15 8q3 4 0 8M18 5q6 7 0 14" fill="none" /></>,
    mute: <><path d="M3 9h4l5-4v14l-5-4H3z" /><path d="M15 9l6 6M21 9l-6 6" fill="none" /></>,
    rosette: <><path d="M8 14l-3 9 4-2 3 3 1-9M16 14l3 9-4-2-3 3-1-9" /><circle cx="12" cy="10" r="7" /><circle cx="12" cy="10" r="3" fill="none" /></>,
    lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" /></>,
    up: <><path d="M12 3l7 8h-4v9H9v-9H5z" /></>,
    leaf: <><path d="M4 20C4 10 10 4 20 4C20 14 14 20 4 20Z" /><path d="M5 19L14 10" fill="none" /></>,
  };
  return <svg className={`icon icon-${name}`} viewBox="0 0 24 24" aria-hidden="true">{shapes[name]}</svg>;
}

export function Profile() {
  return <div className="profile">
    <img src={portrait} alt="Leido 的宇航员形象，伸手触碰星星" />
    <dl>
      <div><dt>名字</dt><dd>Leido</dd></div>
      <div><dt>职业</dt><dd>game designer &amp; creative developer</dd></div>
      <div><dt>专长</dt><dd>游戏机制 · 交互叙事 · AI 角色</dd></div>
      <div><dt>行囊</dt><dd>Unity 6 · LLM · VLM</dd></div>
      <div><dt>状态</dt><dd>保持好奇，继续创造</dd></div>
    </dl>
  </div>;
}

export function ContactSheet({ onCopy }) {
  return <div className="contact-sheet">
    <a className="game-button primary" href={`mailto:${contact.email}`}>✉ 写一封信<small>{contact.email}</small></a>
    <button className="game-button" onClick={() => onCopy(contact.email, '邮箱')}>复制邮箱</button>
    <button className="game-button" onClick={() => onCopy(contact.wechat, '微信号')}>微信 · {contact.wechat}<small>点击复制</small></button>
    <a className="game-button" href={contact.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>
  </div>;
}
