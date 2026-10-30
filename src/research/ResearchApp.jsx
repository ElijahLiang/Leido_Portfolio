import { useEffect, useRef, useState } from 'react';
import { Header, Menu } from '../components/SiteNavigation';
import { researchCases, caseUrl } from './data';
import documents from './content.json';
import { CaseFan, ReadingTicks, ResearchDeck, SectionDock } from './Interactions';
import QuestionField from './QuestionField';
import './research.css';

function ResearchOverview() {
  const [open, setOpen] = useState(0);
  return <>
    <main className="research-page" id="main-content">
      <section className="research-frontier"><div className="frontier-copy"><p className="eyebrow">Research notebook · AI narrative &amp; gameplay</p><h1>当对话，<br />成为玩法。</h1><p>2025 年，我一直在研究 AI 如何参与游戏机制的设计——从网页原型，到 3D 实现。<br />四个原型，沿着同一个问题推进：AI 对话如何从技术能力，成为真正有意义的玩家体验？</p><span className="research-parent-tag">一个研究项目 / 四个子案例 / 2025 — 持续探索</span></div><QuestionField /><a className="frontier-scroll" href="#directions">↓　四段研究路径</a></section>
      <section id="directions" className="research-section"><div className="research-section-line"><span>i. research path</span><p>技术验证 → 机制精炼 → 情感探索 → 开放叙事</p></div><h2 className="research-section-title">研究路径 <small>what I study</small></h2><div className="research-directions">{researchCases.map((item,index) => <article className={`direction ${open===index?'open':''}`} key={item.id}><h3><button aria-expanded={open===index} aria-controls={`direction-${item.id}`} onClick={() => setOpen(open===index?null:index)}><span>0{index+1}</span><strong>{item.title}</strong><em>{item.english}</em><small>{item.stage}</small><b>{open===index?'−':'+'}</b></button></h3><div className="direction-reveal" id={`direction-${item.id}`} inert={open!==index || undefined}><div className="direction-content"><div><p className="direction-question">{item.question}</p><p>{item.summary}</p><a className="text-link" href={caseUrl(item.id)}>研究过程、证据与反思 <span>↗</span></a></div><div><span className="eyebrow">从这次实验中发现</span><p className="direction-finding">{item.finding}</p><div className="research-tags">{item.tags.map(tag=><span key={tag}>{tag}</span>)}</div><span className="direction-date">{item.date} / {item.status}</span></div></div></div></article>)}</div></section>
      <section id="experiments" className="research-section experiments-section"><div className="research-section-line"><span>ii. the book of experiments</span><p>四张双面牌，四个问题，属于同一项研究。</p></div><div className="experiment-intro"><h2 className="research-section-title">叙事实验集 <span>✿</span><small>four cases, one research</small></h2><p>每张牌背后都是一个原型：<br />从哪个问题出发，怎样尝试，<br />又在哪里发现新的问题。</p></div><ResearchDeck /></section>
      <section id="protocol" className="research-section protocol-section"><div className="research-section-line"><span>iii. research protocol</span><p>让下一个原型，回应上一次实验留下的问题。</p></div><h2 className="research-section-title">研究方法 <small>from question to play</small></h2><ol className="research-protocol">{[['Q','提出问题','从具体的交互与玩家体验问题出发。'],['P','构建原型','把 LLM、机制与叙事放进可体验的游戏。'],['O','观察与反思','通过试玩、对话记录和设计反思发现边界。'],['N','进入下一轮','把发现带入下一个原型，保留过程与局限。']].map(([letter,title,text],index)=><li key={letter}><span>{letter} <small>0{index+1}</small></span><h3>{title}</h3><p>{text}</p></li>)}</ol><p className="research-note">四个原型的研究问题和验证方式随阶段演进，具体过程、材料与反思保留在各自子案例中。</p></section>
    </main><SectionDock />
  </>;
}

function QuoteEvidence({ quotes }) {
  const [index,setIndex]=useState(0);
  if (!quotes?.length) return null;
  const shift=step=>setIndex(current=>(current+step+quotes.length)%quotes.length);
  return <section className="quote-evidence" id="dialogue-evidence" aria-label="对话证据"><div><h2>对话记录</h2><span aria-live="polite">{index+1} / {quotes.length}</span><button onClick={()=>shift(-1)} aria-label="上一段对话">←</button><button onClick={()=>shift(1)} aria-label="下一段对话">→</button></div><div className="quote-content" dangerouslySetInnerHTML={{__html:quotes[index].replace(/ aria-hidden="[^"]*"/g,'').replace(/ style="[^"]*"/g,'')}} /></section>;
}

function CaseDocument({ item }) {
  const content=documents[item.id];
  return <main className="research-case-page" id="main-content">
    <nav className="research-breadcrumb" aria-label="返回"><a href="/ai-agent-game.html#experiments">← AI 叙事玩法研究</a><a href="/games">完整作品集</a></nav>
    <header className="research-case-header"><p className="eyebrow">AI narrative research · case {item.roman}</p><h1>{item.title}</h1><p>{item.question}</p><div className="research-tags"><span>子案例 {item.roman} / IV</span><span>{item.date}</span>{item.duration&&<span>{item.duration}</span>}<span>{item.stage}</span><span>{item.status}</span></div></header>
    <img className="research-case-cover" src={item.image} alt={`${item.title}项目封面`} fetchPriority="high" />
    <div className="research-case-layout"><article className="case-document" dangerouslySetInnerHTML={{__html:content.html.replace(/\p{Extended_Pictographic}\uFE0F?\s?/gu,'')}} /><aside className="research-case-aside"><p className="eyebrow">所属研究项目</p><a href="/ai-agent-game.html">AI 叙事玩法研究 ↗</a><p className="eyebrow">阶段发现</p><p>{item.finding}</p><p className="eyebrow">技术与方法</p><div className="research-tags">{item.tags.map(tag=><span key={tag}>{tag}</span>)}</div>{item.video&&<a className="text-link" href={item.video} target="_blank" rel="noopener noreferrer">观看演示 <span>↗</span></a>}{item.document&&<a className="text-link" href={item.document} target="_blank" rel="noopener noreferrer">设计文档 <span>↗</span></a>}</aside></div>
    <QuoteEvidence quotes={content.quotes}/>
    <section className="more-cases"><div><span className="eyebrow">more cases · 同一研究项目</span><h2>继续看其他子案例</h2><p>拖动、点击侧边卡片或用方向键切换</p></div><CaseFan cases={researchCases.filter(other=>other.id!==item.id)} /></section>
    <nav className="research-end-links" aria-label="继续探索"><a href="/ai-agent-game.html#experiments">返回完整研究集合 ↗</a><a href="/games">查看其他作品 ↗</a></nav>
    <ReadingTicks />
  </main>;
}

export default function ResearchApp() {
  const slug=new URLSearchParams(window.location.search).get('case')||window.location.hash.slice(1);
  const item=researchCases.find(researchCase=>researchCase.id===slug);
  const [menuOpen,setMenuOpen]=useState(false);
  const close=useRef(()=>setMenuOpen(false)).current;
  useEffect(()=>{document.documentElement.dataset.world='museum';},[]);
  useEffect(()=>{document.title=item?`${item.title} — AI 叙事研究子案例 · Leido`:'AI 叙事玩法研究 — Leido';},[item]);
  useEffect(()=>{
    if (!item && window.location.hash) {
      const id=window.location.hash.slice(1);
      requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView());
    }
  },[item]);
  return <><div className="research-shell" inert={menuOpen||undefined}><a className="skip-link" href="#main-content">跳到主要内容</a><Header onMenu={()=>setMenuOpen(true)}/>{item?<CaseDocument item={item}/>:<ResearchOverview/>}<footer className="site-footer research-footer"><a href="/">Leido.</a><span>stay curious, keep playing.</span><a href="/#contact">联系我 ↗</a></footer></div>{menuOpen&&<Menu close={close} navigate={()=>setMenuOpen(false)}/>}</>;
}
