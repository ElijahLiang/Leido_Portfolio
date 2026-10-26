// Tiny chiptune synth: every sound is generated, so there are no audio files to load.
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
  }
  if (context.state === 'suspended') context.resume();
}

export function setMuted(value) {
  muted = value;
  if (master) master.gain.setTargetAtTime(value ? 0 : .32, context.currentTime, .02);
}

function tone(frequency, { type = 'square', at = 0, duration = .1, volume = .2, to } = {}) {
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

function hiss({ at = 0, duration = .2, volume = .2, from = 2000, to = 200 } = {}) {
  const start = context.currentTime + at;
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  source.buffer = noise;
  source.loop = true;
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(from, start);
  filter.frequency.exponentialRampToValueAtTime(to, start + duration);
  gain.gain.setValueAtTime(volume, start);
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
  tick: () => tone(1200, { type: 'square', duration: .03, volume: .03 }),
  count: () => tone(660, { type: 'square', duration: .06, volume: .06 }),
  hit: () => tone(880, { type: 'triangle', duration: .08, volume: .1 }),
  perfect: () => { tone(1175, { type: 'triangle', duration: .06, volume: .1 }); tone(1568, { at: .05, type: 'triangle', duration: .1, volume: .08 }); },
  win: () => [659, 784, 988, 1319].forEach((f, i) => tone(f, { at: i * .07, duration: .16, volume: .1, type: 'triangle' })),
  fail: () => tone(330, { to: 140, duration: .3, volume: .08, type: 'sawtooth' }),
  rocket: () => { hiss({ duration: 1.6, volume: .28, from: 300, to: 4000 }); tone(80, { to: 520, duration: 1.4, volume: .08, type: 'sawtooth' }); },
};

export function play(name) {
  if (!context || muted || context.state !== 'running') return;
  sounds[name]?.();
}
