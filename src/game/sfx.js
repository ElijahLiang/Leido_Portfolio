// Tiny music-box synth: every sound is generated, so there are no audio files to load.
let context, master, noise;
let muted = false;

export function unlockAudio() {
  const Context = window.AudioContext || window.webkitAudioContext;
  if (!Context) return;
  if (!context) {
    context = new Context();
    master = context.createGain();
    master.gain.value = muted ? 0 : .32;
    master.connect(context.destination);
    noise = context.createBuffer(1, context.sampleRate * .6, context.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    // Fall silent with the tab, and pick up again on return.
    document.addEventListener('visibilitychange', () => (document.hidden ? context.suspend() : context.resume()));
  }
  if (context.state === 'suspended') context.resume();
}

// The book's chimes share this context and master volume.
export const audioOut = () => context && { context, master };

export function setMuted(value) {
  muted = value;
  if (master) master.gain.setTargetAtTime(value ? 0 : .32, context.currentTime, .02);
}

function tone(frequency, { type = 'triangle', at = 0, duration = .1, volume = .2, to } = {}) {
  const start = context.currentTime + at;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  if (to) oscillator.frequency.exponentialRampToValueAtTime(to, start + duration);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
  oscillator.connect(gain).connect(master);
  oscillator.start(start);
  oscillator.stop(start + duration + .02);
}

function hiss({ at = 0, duration = .2, volume = .2, from = 2000, to = 200, type = 'lowpass', q, attack = 0 } = {}) {
  const start = context.currentTime + at;
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = noise;
  source.loop = true;
  filter.type = type;
  if (q) filter.Q.value = q;
  filter.frequency.setValueAtTime(from, start);
  filter.frequency.exponentialRampToValueAtTime(to, start + duration);
  gain.gain.setValueAtTime(attack ? .0001 : volume, start);
  if (attack) gain.gain.exponentialRampToValueAtTime(volume, start + attack);
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
  source.connect(filter).connect(gain).connect(master);
  source.start(start);
  source.stop(start + duration + .02);
}

const sounds = {
  start: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, { at: i * .07, duration: .14, volume: .14 })),
  jump: () => tone(260, { to: 640, duration: .14, volume: .1 }),
  land: () => hiss({ duration: .08, volume: .12, from: 900, to: 120 }),
  star: () => { tone(988, { duration: .07, volume: .12 }); tone(1319, { at: .07, duration: .22, volume: .12 }); },
  open: () => tone(660, { to: 990, duration: .08, volume: .1, type: 'triangle' }),
  close: () => tone(520, { to: 330, duration: .08, volume: .08, type: 'triangle' }),
  coin: () => { tone(1568, { duration: .05, volume: .1 }); tone(2093, { at: .05, duration: .18, volume: .1 }); },
  type: () => tone(720 + Math.random() * 160, { duration: .025, volume: .025 }),
  select: () => tone(880, { duration: .04, volume: .06 }),
  bonk: () => tone(140, { to: 90, duration: .09, volume: .08, type: 'triangle' }),
  zone: () => [392, 523, 659].forEach((f, i) => tone(f, { at: i * .09, duration: .3, volume: .06, type: 'triangle' })),
  achieve: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, { at: i * .08, duration: .18, volume: .1 })),
  level: () => [523, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, { at: i * .06, duration: .16, volume: .09, type: 'triangle' })),
  fireShort: () => tone(262, { type: 'sine', duration: .14, volume: .16 }),
  fireLong: () => tone(196, { type: 'sine', duration: .5, volume: .16 }),
  tick: () => tone(1200, { type: 'sine', duration: .03, volume: .03 }),
  count: () => tone(660, { type: 'sine', duration: .06, volume: .06 }),
  hit: () => tone(880, { type: 'triangle', duration: .08, volume: .1 }),
  perfect: () => { tone(1175, { type: 'triangle', duration: .06, volume: .1 }); tone(1568, { at: .05, type: 'triangle', duration: .1, volume: .08 }); },
  win: () => [659, 784, 988, 1319].forEach((f, i) => tone(f, { at: i * .07, duration: .16, volume: .1, type: 'triangle' })),
  fail: () => tone(330, { to: 140, duration: .3, volume: .08, type: 'triangle' }),
  // A leaf crackles as it lifts, sweeps through the air and settles flat; several riffle.
  page: (count = 1) => {
    for (let i = 0; i < Math.min(count, 6); i++) {
      const at = i * .08;
      for (let j = 0; j < 4; j++) hiss({ at: at + Math.random() * .2, duration: .02 + Math.random() * .03, volume: .06 + Math.random() * .08, from: 7000, to: 2600, type: 'highpass' });
      hiss({ at: at + .05, duration: .6, volume: .55, from: 800, to: 3000, type: 'bandpass', q: .7, attack: .24 });
      hiss({ at: at + .74, duration: .14, volume: .35, from: 900, to: 160 });
    }
  },
  // The board lands with a soft thud.
  cover: () => { tone(160, { type: 'sine', at: .76, to: 70, duration: .3, volume: .3 }); hiss({ at: .74, duration: .2, volume: .4, from: 500, to: 120 }); },
  fold: () => hiss({ duration: .22, volume: .3, from: 1600, to: 500, type: 'bandpass', q: .9, attack: .05 }),
  // A pop-up card flicks upright, once for each delay in seconds.
  rise: delays => delays.forEach(at => hiss({ at, duration: .13, volume: .35, from: 700, to: 2600, type: 'bandpass', q: 1.2, attack: .03 })),
  rocket: () => { hiss({ duration: 1.6, volume: .28, from: 300, to: 4000 }); tone(80, { to: 520, duration: 1.4, volume: .08, type: 'sawtooth' }); },
};

export function play(name, ...args) {
  if (!context || muted || context.state !== 'running') return;
  sounds[name]?.(...args);
}
