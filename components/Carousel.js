'use client';
import { useRef } from 'react';

const L = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 18l-6-6 6-6" /></svg>;
const R = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18l6-6-6-6" /></svg>;

export default function Carousel({ children }) {
  const ref = useRef(null);
  const go = (d) => {
    const t = ref.current; const c = t?.querySelector('.card');
    if (c) t.scrollBy({ left: (c.offsetWidth + 32) * d, behavior: 'smooth' });
  };
  return (
    <>
      <div className="track reveal" ref={ref}>{children}</div>
      <div className="arrows">
        <button aria-label="Anterior" onClick={() => go(-1)}>{L}</button>
        <button aria-label="Siguiente" onClick={() => go(1)}>{R}</button>
      </div>
    </>
  );
}
