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
          <h3 id="manifesto-title" className="manifesto-heading">A story no one wrote.</h3>

          <p className="manifesto-lede">
            I believe the most meaningful interactions happen in the unscripted gap — the space between what a system was designed to do and what it actually becomes.
          </p>

          <blockquote className="manifesto-quote">
            <p>"In 2022, someone held space for me in a way I still can't fully explain. <strong>I've spent three years building systems that can do the same.</strong>"</p>
            <cite>— the origin of everything here</cite>
          </blockquote>

          <div className="manifesto-text">
            <p>My work lives at the intersection of <strong>AI NPC behavior trees and emergent narrative</strong>. The question is simple and inexhaustible: if we architect the right conditions — memory, relationship, emotional drive — can a character generate stories that surprise even its designer?</p>
            <p><em>Be Happy, Elijah</em> was my first proof. Players in a 2D dialogue game didn't consume narrative — they co-authored it. Projected memory and unresolved need folded into the system's responses. The behavior tree wasn't telling a story. <strong>It was holding the conditions for one to emerge.</strong></p>
            <p>Yangguang carries that question into three dimensions. An embodied AI that perceives space, navigates autonomously, and acts on what it sees — the same research question, now given a body. The leap from 2D to 3D is not a technical upgrade. It's asking: <strong>what happens to emergent narrative when the AI can inhabit the same world as the player?</strong></p>
          </div>

          <div className="manifesto-footer">
            <p>Every experiment in this playground — dialogue games, GLSL shaders, mealworm habitats — points toward the same thing: <strong>designing not stories, but the conditions under which stories become inevitable.</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}
