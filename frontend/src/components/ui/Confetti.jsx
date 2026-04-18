import { useEffect, useRef } from 'react';

const COLORS = ['#f59e0b', '#22c55e', '#3b82f6', '#ef4444', '#a855f7', '#f8fafc'];

export default function Confetti({ active }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!active || !ref.current) return;
    const container = ref.current;
    container.innerHTML = '';
    for (let i = 0; i < 60; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.cssText = `
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 20}%;
        background: ${COLORS[Math.floor(Math.random() * COLORS.length)]};
        animation-delay: ${Math.random() * 1}s;
        animation-duration: ${1.5 + Math.random() * 1}s;
        width: ${4 + Math.random() * 8}px;
        height: ${4 + Math.random() * 8}px;
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      `;
      container.appendChild(piece);
    }
    const timer = setTimeout(() => { if (container) container.innerHTML = ''; }, 3000);
    return () => clearTimeout(timer);
  }, [active]);

  return <div ref={ref} className="pointer-events-none absolute inset-0 overflow-hidden" />;
}
