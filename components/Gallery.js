'use client';
import { useRef, useState } from 'react';

const L = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 18l-6-6 6-6" /></svg>;
const R = <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18l6-6-6-6" /></svg>;

export default function Gallery({ fotos, alt }) {
  const [i, setI] = useState(0);
  const x0 = useRef(null);
  const n = fotos.length;
  const go = (k) => setI(((k % n) + n) % n);
  return (
    <>
      <div
        className="gallery"
        onTouchStart={(e) => (x0.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (x0.current == null) return;
          const d = e.changedTouches[0].clientX - x0.current;
          if (Math.abs(d) > 40) go(i + (d < 0 ? 1 : -1));
          x0.current = null;
        }}
      >
        {fotos.map((f, k) => (
          <div key={f + k} className={'slide' + (k === i ? ' on' : '')}>
            <img src={f} alt={`${alt} · foto ${k + 1}`} loading={k === 0 ? 'eager' : 'lazy'} />
          </div>
        ))}
        {n > 1 && (
          <>
            <button className="g-btn prev" aria-label="Anterior" onClick={() => go(i - 1)}>{L}</button>
            <button className="g-btn next" aria-label="Siguiente" onClick={() => go(i + 1)}>{R}</button>
            <span className="g-count">{i + 1} / {n}</span>
          </>
        )}
      </div>
      {n > 1 && (
        <div className="thumbs">
          {fotos.map((f, k) => (
            <button key={f + k} className={k === i ? 'on' : ''} onClick={() => setI(k)} aria-label={`Foto ${k + 1}`}>
              <img src={f} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </>
  );
}
