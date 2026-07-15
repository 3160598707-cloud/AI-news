import { useEffect, useRef } from 'react';

/** Mouse-follow aurora glow effect */
export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      el.style.setProperty('--x', `${e.clientX}px`);
      el.style.setProperty('--y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div
      ref={ref}
      className="cursor-glow"
      aria-hidden="true"
    />
  );
}
