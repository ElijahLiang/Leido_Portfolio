import { useEffect, useRef } from 'react';
import './ManifestoModal.css';

export default function ManifestoModal({ open, onClose }) {
  const contentRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    contentRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="manifesto-modal-overlay show"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="manifesto-title"
    >
      <div
        className="manifesto-modal-content"
        onClick={e => e.stopPropagation()}
        ref={contentRef}
        tabIndex={-1}
      >
        <button className="manifesto-close" onClick={onClose} aria-label="关闭">&times;</button>
        <div className="manifesto-modal-body">
          <h3 id="manifesto-title" className="manifesto-heading">一个没有被预先写好的故事</h3>

          <p className="manifesto-lede">
            我相信最有意义的互动，发生在脚本之外：在系统原本被设计成什么，和它最终在真实使用中变成什么之间。
          </p>

          <blockquote className="manifesto-quote">
            <p>“2022 年，有人以一种我至今难以完全解释的方式接住了我。<strong>过去三年，我一直在尝试建造也能做到这件事的系统。</strong>”</p>
            <cite>— 这里一切的起点</cite>
          </blockquote>

          <div className="manifesto-text">
            <p>我的工作位于 <strong>AI NPC 行为树与涌现叙事</strong> 的交汇处。问题很简单，也几乎没有尽头：如果我们设计好记忆、关系与情感驱动力这些条件，一个角色能否生成连设计者也会被惊讶到的故事？</p>
            <p><em>Be Happy, Elijah</em> 是我的第一次证明。玩家在 2D 对话游戏里并不是消费剧情，而是在共同书写它。被投射的记忆和未被满足的需要，会折叠进系统的回应中。行为树不是在讲故事，<strong>它是在托住故事发生的条件。</strong></p>
            <p>智能 NPC 研究之旅把这个问题带入三维空间：一个能够感知环境、自主导航并基于所见行动的具身 AI。它不是从 2D 到 3D 的技术升级，而是在追问：<strong>当 AI 能和玩家共处同一个世界时，涌现叙事会发生什么？</strong></p>
          </div>

          <div className="manifesto-footer">
            <p>这个游乐场里的每一次实验——对话游戏、GLSL 着色器、黄粉虫生态系统——都指向同一件事：<strong>不是设计一个故事，而是设计让故事不可避免地发生的条件。</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}
