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
          <h3 id="manifesto-title" className="manifesto-heading">The meaning of life is how we illuminate one another.</h3>

          <p className="manifesto-lede">
            Design, technology, and art are the torches I carry to reach people who have been overlooked and to meet them with warmth.
          </p>

          <blockquote className="manifesto-quote">
            <p>"Five years ago, under the lanterns of Nanjing's Confucius Temple, I made a wish: <strong>become a designer who can bring happiness to others.</strong>"</p>
            <cite>— Night in Qinhuai, 2019</cite>
          </blockquote>

          <div className="manifesto-text">
            <p>Since childhood I have been moved by how many gentle souls carry pain, how fragility and resilience coexist. I keep asking: <strong>how can design help the unseen be equally seen, and the unheard be gently understood?</strong></p>
            <p>Five years of practice taught me this: <strong>happiness cannot be given—it can only be empowered.</strong> My work builds spaces, tools, and systems that let people rediscover their own strength.</p>
          </div>

          <div className="manifesto-footer">
            <p>I hope every life—human or non-human—finds a space within my work to feel <strong>gently seen</strong>, <strong>kindly treated</strong>, and free to glow.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
