import { useEffect, useRef } from 'react';
import { play } from './sfx';

// Focus the first control, trap Tab, close on Escape and hand focus back on unmount.
// `view` re-focuses when a dialog swaps its content; data-arrows enables ↑/↓ navigation.
export default function useModal(onClose, view) {
  const ref = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const target = ref.current.querySelector('[data-autofocus]') ?? ref.current.querySelector('a, button');
    target?.focus({ preventScroll: true });
  }, [view]);
  useEffect(() => {
    const previous = document.activeElement;
    const keydown = event => {
      if (event.key === 'Escape') { event.preventDefault(); close.current(); return; }
      const items = [...ref.current.querySelectorAll('a, button:not([disabled]), [tabindex="0"]')];
      if (event.key === 'Tab' && items.length) {
        const first = items[0], last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
      if (['ArrowDown', 'ArrowUp'].includes(event.key) && ref.current.dataset.arrows !== undefined) {
        event.preventDefault();
        const next = items.indexOf(document.activeElement) + (event.key === 'ArrowDown' ? 1 : -1);
        items[(next + items.length) % items.length]?.focus();
        play('select');
      }
    };
    window.addEventListener('keydown', keydown);
    return () => { window.removeEventListener('keydown', keydown); previous?.focus?.({ preventScroll: true }); };
  }, []);
  return ref;
}
