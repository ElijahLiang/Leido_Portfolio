import { projects } from '../projects';

// The planet is authored at a fixed radius; the camera scales it to the viewport.
export const R = 1000;
export const rad = degrees => degrees * Math.PI / 180;
// Shortest signed angle from a to b, in radians.
export const wrap = angle => Math.atan2(Math.sin(angle), Math.cos(angle));

export const zones = [
  { id: 'home', world: 'cosmos', label: '关于我', name: 'COSMOS', angle: 0 },
  { id: 'works', world: 'arcade', label: '游戏作品', name: 'ARCADE', angle: 90 },
  { id: 'virtual-human', world: 'museum', label: '虚拟人', name: 'MUSEUM', angle: 180 },
  { id: 'contact', world: 'orbit', label: '联系我', name: 'ORBIT', angle: 270 },
];
export const zoneAt = theta => ((Math.round(theta / (Math.PI / 2)) % 4) + 4) % 4;

export const museumProject = { number: '05', title: '鸿山博物馆 · 虚拟讲解员', subtitle: '看见展品、理解问题、自主导航。让虚拟角色真正回应它所在的空间。', category: '虚拟人', tags: 'VLM × LLM / INTERACTIVE SPACE', image: '/video-covers/SgXNTRx8tP0.jpg', link: '/embodied-intelligence.html' };

export const contact = { email: 'erioleiono@gmail.com', wechat: 'Leidododo', github: 'https://github.com/ElijahLiang' };

// Things the player can walk up to. `angle` is degrees clockwise from the spawn point.
export const spots = [
  { id: 'sign', angle: -20, kind: 'sign', label: '公告牌', verb: '阅读' },
  { id: 'pod', angle: 12, kind: 'pod', label: '着陆舱', verb: '查看' },
  { id: 'scope', angle: 30, kind: 'scope', label: '望远镜', verb: '观察' },
  ...projects.map((project, index) => ({ id: `cabinet-${project.number}`, angle: 62 + index * 20, kind: 'cabinet', label: project.title, verb: '投币', project, prop: ['brazier', 'palm', 'speaker', 'bubbles'][index] })),
  // `stand` keeps the astronaut beside tall things instead of in front of them.
  { id: 'npc', angle: 180, kind: 'npc', label: '虚拟讲解员', verb: '对话', stand: 5.5 },
  { id: 'frame', angle: 198, kind: 'frame', label: '鸿山博物馆项目展板', verb: '查看', project: museumProject },
  { id: 'mail', angle: 258, kind: 'mailbox', label: '邮筒', verb: '写信' },
  { id: 'rocket', angle: 284, kind: 'rocket', label: '火箭', verb: '发射', stand: 5.5 },
];
export const cabinetIds = spots.filter(spot => spot.kind === 'cabinet').map(spot => spot.id);
export const demoIds = ['fire', 'reel', 'tune'];

export const decor = [
  { angle: -38, kind: 'rock' }, { angle: 39, kind: 'crystal' },
  { angle: 45, kind: 'gate', zone: 1 }, { angle: 50, kind: 'scoreboard' },
  { angle: 135, kind: 'gate', zone: 2 }, { angle: 150, kind: 'column' }, { angle: 164, kind: 'pedestal' }, { angle: 214, kind: 'column' },
  { angle: 225, kind: 'gate', zone: 3 }, { angle: 242, kind: 'billboard' }, { angle: 302, kind: 'dish' },
  { angle: 315, kind: 'gate', zone: 0 }, { angle: 330, kind: 'rock' },
];

// Distant scenery on a slower ring, for parallax.
export const farScenery = [
  { angle: -30, r: 1360, kind: 'moon' }, { angle: 18, r: 1400, kind: 'ringed' }, { angle: 60, r: 1330, kind: 'cartridge' },
  { angle: 96, r: 1300, kind: 'sun' }, { angle: 128, r: 1320, kind: 'cartridge' }, { angle: 168, r: 1380, kind: 'cloud' },
  { angle: 206, r: 1330, kind: 'cloud' }, { angle: 238, r: 1400, kind: 'satellite' }, { angle: 276, r: 1350, kind: 'moon' },
  { angle: 318, r: 1400, kind: 'comet' },
];

export const stars = [
  [-32, 55], [4, 200], [22, 130], [52, 210], [92, 60], [132, 170],
  [145, 60], [189, 220], [222, 120], [236, 60], [271, 200], [312, 140],
].map(([angle, h], index) => ({ id: `s${index + 1}`, angle, h }));

export const achievements = [
  { id: 'start', title: '新玩家', text: '按下 START，降落在小星球上' },
  { id: 'star', title: '第一颗星', text: '收集到第一颗星星' },
  { id: 'stars', title: '摘星者', text: `收集全部 ${stars.length} 颗星星` },
  { id: 'arcade', title: '街机常客', text: '看过全部 4 台街机里的作品' },
  { id: 'npc', title: '被看见了', text: '和虚拟讲解员聊一聊' },
  { id: 'lap', title: '环球旅行', text: '绕着星球走完整整一圈' },
  { id: 'mail', title: '保持联络', text: '打开邮筒' },
  { id: 'rocket', title: '发射！', text: '坐一次火箭' },
  { id: 'fire', title: '守火人', text: '在《丢失的光明》街机里辨认出三簇真火' },
  { id: 'reel', title: '钓上来了', text: '在《上岸》街机里收起一条鱼' },
  { id: 'tune', title: '调律完成', text: '在《智械驯服专家》街机里修好一台失律智械' },
  { id: 'konami', title: '老玩家', text: '↑↑↓↓←→←→BA', secret: true },
];

export const xpOf = progress => progress.seen.length * 10 + progress.stars.length * 5 + progress.achievements.length * 15;
export const XP_PER_LEVEL = 40;

export const scripts = {
  sign: { speaker: '公告牌', lines: ['你好，我是 Leido。', 'game designer & creative developer —— 探索玩法、叙事与 AI。', '这颗小星球就是我的作品集：把一个念头，变成可以玩的世界。', '往右走是游戏作品，往左走能找到我。星星可以收集，记得跳起来够一够。'] },
  pod: {
    speaker: '飞船日志',
    lines: ['操作说明：← → 或 A D 移动，空格 跳跃，E 互动，Esc 暂停，M 静音。', '也可以直接点击星球上的东西，宇航员会自己走过去。'],
    touchLines: ['操作说明：左下角 ◀ ▶ 移动，右下角 A 跳跃、B 互动。', '也可以直接点星球上的东西，宇航员会自己走过去。'],
  },
  npc: {
    speaker: '虚拟讲解员',
    lines: ['欢迎来到鸿山博物馆，我是这里的虚拟讲解员。', '我能看见展品、理解你的问题，还能自己在展厅里导航。', '……顺便一提，我看到了一位穿宇航服的访客。置信度 0.98。'],
    choices: [
      { label: '查看项目', href: museumProject.link },
      { label: '你是怎么“看见”我的？', next: 'npcVision' },
      { label: '再见', close: true },
    ],
  },
  npcVision: {
    speaker: '虚拟讲解员',
    lines: ['视觉语言模型（VLM）帮我读懂画面，大语言模型（LLM）帮我组织回答。', '让虚拟角色真正回应它所在的空间——这就是这个项目想做的事。'],
    choices: [{ label: '查看项目', href: museumProject.link }, { label: '再见', close: true }],
  },
  rocket: {
    speaker: '火箭',
    lines: ['燃料充足。这艘火箭能把你送回起点。'],
    choices: [{ label: '3、2、1，发射！', action: 'launch' }, { label: '下次吧', close: true }],
  },
  allStars: { speaker: '???', lines: [`你收集齐了全部 ${stars.length} 颗星星。`, '伸手去够，就能碰到。'] },
};
