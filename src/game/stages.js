import { caseUrl, researchCases } from '../research/data';

// Briefing data for each arcade cabinet, keyed by project number. Copy is taken from
// the project pages; `thumb` feeds the cabinet screens, `src` the briefing viewer.
const shot = (game, name, caption) => ({ type: 'image', thumb: `/games/thumbs/${game}-${name}-s.webp`, src: `/games/thumbs/${game}-${name}-m.webp`, caption });

export const stages = {
  '01': {
    english: 'LOST LIGHT',
    color: '#ffa43a',
    hook: '黄昏。村里的火坛灭了，圣火昨夜被人拿走。',
    info: [['类型', '第一人称互动叙事'], ['引擎', 'Unity 6 · URP'], ['平台', 'Windows'], ['亮点', '自由输入的 NPC 对话 · 五种结局']],
    moves: [
      ['思 · 言 · 行', '不打善恶分，分别记录你怎么想、怎么说、怎么做，再看三者是否一致。'],
      ['火坛拼印', '在铁匠铺、井台与破庙各取一枚印，按那个人走过的顺序压上坛心。'],
      ['荒地辨火', '真火有稳定的「短、短、长」节奏，假火的节奏紊乱。'],
    ],
    media: [
      { type: 'video', src: '/games/lost-light/trailer.mp4', poster: '/games/thumbs/lost-light-poster-m.webp', thumb: '/games/thumbs/lost-light-poster-s.webp', caption: '宣传短片 · 1 分 32 秒 · 游戏内实机渲染' },
      shot('lost-light', 'village-dusk', '黄昏中的阶地村落全景'),
      shot('lost-light', 'ui-altar', '火坛拼印：足印、余烬、手印按顺序压上坛心'),
      shot('lost-light', 'ui-dialogue', '与铁匠对话，玩家可以自由输入回应'),
      shot('lost-light', 'wilderness', '夜晚荒地，提灯只照亮脚下几步'),
      shot('lost-light', 'shrine-night', '夜晚的圣火亭'),
      shot('lost-light', 'divine', '荒地营火旁的神祇与兄妹'),
      shot('lost-light', 'ui-god', '终局：持秤的神祇拉什努显形'),
      shot('lost-light', 'terraces', '后山三层阶地与朝圣客舍'),
      shot('lost-light', 'smithy', '铁匠铺前的石板广场'),
    ],
    minigame: 'fire',
    play: '荒地辨火',
  },
  '02': {
    english: 'TIDE ECHO',
    color: '#3fd0e0',
    hook: '到桂山岛做七天义工。第七天，决定去留。',
    info: [['类型', '第一人称海岛生活'], ['引擎', 'Unity 6 · FFT 实时海面'], ['日常', '海钓 · 潜水 · 义工 · 骑行'], ['结局', '漂泊 · 留下 · 回去']],
    moves: [
      ['海钓', '按住收线，让张力留在绿区里：太紧会断线，太松会脱钩。'],
      ['潜水', '从海面一路下潜，经过浅滩、礁盘，直到 −12 m 的海底。'],
      ['骑行', '沿着环岛公路骑行 3.7 km，看海湾、村落与山腰住区。'],
    ],
    media: [
      shot('tide-echo', 'cover', '上岸 Tide Echo'),
      shot('tide-echo', 'title-beach', '沙滩上的高脚木屋、倒扣的小船和栈桥'),
      shot('tide-echo', 'aerial-island', '俯瞰海岛、沙滩海湾与青绿色浅海'),
      shot('tide-echo', 'bay-pier', '海湾全景：栈桥、渔船与沙滩村落'),
      shot('tide-echo', 'hillside', '山腰上层层排开的住区'),
      shot('tide-echo', 'coast-road', '沿海岸山壁的环岛公路'),
      shot('tide-echo', 'road-level', '第一人称视角的环岛公路'),
      shot('tide-echo', 'sea-sunpath', '开阔海面上的太阳光路'),
      shot('tide-echo', 'shallows', '浅滩沙底的焦散光纹与浪花'),
      shot('tide-echo', 'surface-from-below', '从水下仰望起伏的海面'),
      shot('tide-echo', 'underwater-reef', '光柱、鱼群与珊瑚礁'),
      shot('tide-echo', 'reef-close', '海底的珊瑚、鱼与海龟'),
    ],
    minigame: 'reel',
    play: '收一条鱼',
  },
  '03': {
    english: 'RHYTHM × COMBAT',
    color: '#b48cff',
    hook: '在节拍中蓄力，在副歌中爆发。让游戏被音乐叙述。',
    info: [['类型', '音乐节奏 × 战斗输出'], ['形态', 'Game Demo'], ['题材', '科幻 · 叙事 × 音乐'], ['设定', '20XX 年，凯斯公司的智械开始“失律”']],
    moves: [
      ['节拍蓄力', '跟随节奏点按、长按，累积“调律能量”。'],
      ['释放修复', '能量充满后，对失律智械释放修复指令。'],
      ['格挡干扰', '同时格挡智械的反击与干扰。'],
    ],
    media: [
      { type: 'image', thumb: '/video-covers/rhythm-game-cover.svg', src: '/video-covers/rhythm-game-cover.svg', caption: '智械驯服专家 · 音游 Demo' },
      { type: 'embed', thumb: '/video-covers/rhythm-game-cover.svg', src: 'https://player.bilibili.com/player.html?isOutside=true&aid=116757796756807&bvid=BV1p6jg6CEAp&cid=39153698760&p=1&autoplay=0', caption: '游戏 Demo 演示 · 视频托管于 Bilibili' },
    ],
    links: [{ label: 'B 站观看演示', href: 'https://www.bilibili.com/video/BV1p6jg6CEAp/' }],
    minigame: 'tune',
    play: '调律智械',
  },
  '04': {
    english: 'AI NARRATIVE RESEARCH',
    color: '#4be3a0',
    hook: '四个子案例，一条从技术验证到开放叙事的研究路径：LLM 如何成为游戏机制。',
    info: [['案例', '4 个子案例'], ['周期', '2025.08 – 2025.12'], ['模型', 'GLM-4 · DeepSeek · Ollama'], ['方向', '对话、关系与开放叙事']],
    cases: researchCases.map((item, index) => ({ ...item, link: caseUrl(item.id), thumb: `/games/thumbs/research-${item.id}-s.webp`, index })),
    media: [
      shot('research', 'eastern-jin', 'I · 东晋王朝 · 技术可行性'),
      shot('research', 'warring-states', 'II · 战国外交 · 机制精炼'),
      shot('research', 'be-happy-elijah', 'III · Be Happy, Elijah · 情感探索'),
      shot('research', 'boundary', 'IV · Boundary · 边界发现'),
      shot('research', 'boundary-2', 'IV · Boundary · 游戏画面'),
      shot('research', 'boundary-3', 'IV · Boundary · 游戏画面'),
    ],
  },
  '05': {
    english: 'VIRTUAL HUMAN',
    color: '#ff6b5a',
    hook: '让角色看见展品，理解问题，回应空间。',
    info: [['场景', '无锡鸿山博物馆虚拟展厅'], ['感知', 'VLM 场景感知'], ['对话', 'LLM 推理与自然讲解'], ['行动', '自主导航 · 情感交互']],
    moves: [
      ['看见', 'AI 可以“看见”并理解展品。'],
      ['讲解', '根据游客的位置和问题实时生成讲解。'],
      ['引路', '引导游客穿行于展厅，回应场景变化。'],
    ],
    media: [{ type: 'image', thumb: '/video-covers/SgXNTRx8tP0.jpg', src: '/video-covers/SgXNTRx8tP0.jpg', caption: '鸿山博物馆虚拟展厅中的虚拟讲解员' }],
    links: [{ label: '观看演示视频', href: 'https://youtu.be/SgXNTRx8tP0' }, { label: '技术博客', href: 'https://elijahliang.github.io/Leiodo-Journey-Development/' }],
  },
};
