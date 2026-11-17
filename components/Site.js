'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NEGOCIO, wa } from '@/lib/config';

const NAV = [
  ['/', 'Inicio'],
  ['/stock', 'Stock'],
  ['/#carta', 'Coche a la carta'],
  ['/#financiacion', 'Financiación'],
  ['/#nosotros', 'Sobre nosotros'],
  ['/#contacto', 'Contacto'],
];

export function Header({ overHero = false }) {
  const [solid, setSolid] = useState(!overHero);
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => {
    if (!overHero) return;
    const on = () => setSolid(window.scrollY > 40);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [overHero]);
  useEffect(() => setOpen(false), [path]);
  return (
    <>
      <header className={solid || open ? 'solid' : ''}>
        <div className="wrap nav">
          <Link href="/" className="logo" aria-label="Rafracar, inicio">
            <img src="/img/logo-rafracar-600.png" alt="Rafracar" />
          </Link>
          <nav className="menu">
            {NAV.map(([h, t]) => (
              <Link key={h} href={h} className={(h === '/' && path === '/') || (h === '/stock' && path === '/stock') ? 'active' : ''}>
                {t}
              </Link>
            ))}
          </nav>
          <button className="burger" aria-label="Abrir menú" onClick={() => setOpen(!open)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 8h18M3 16h18" />}
            </svg>
          </button>
        </div>
      </header>
      <nav className={'mobile-menu' + (open ? ' open' : '')} onClick={() => setOpen(false)}>
        {NAV.map(([h, t]) => (
          <Link key={h} href={h}>{t}</Link>
        ))}
      </nav>
    </>
  );
}

export function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="f-grid">
          <div>
            <Link href="/" className="logo"><img src="/img/logo-rafracar-600.png" alt="Rafracar" /></Link>
            <p className="lead">Concesionario de coches de ocasión en Baena, Córdoba. Financiación a medida y coche a la carta.</p>
          </div>
          <div>
            <h5>Navegación</h5>
            {NAV.slice(0, 5).map(([h, t]) => <Link key={h} href={h}>{t}</Link>)}
          </div>
          <div>
            <h5>Contacto</h5>
            <a href={`tel:${NEGOCIO.telefono}`}>+34 {NEGOCIO.telefonoTxt}</a>
            <a href={NEGOCIO.instagram} target="_blank" rel="noopener">@rafracar</a>
            <p>{NEGOCIO.calle}<br />{NEGOCIO.cp} {NEGOCIO.ciudad}, {NEGOCIO.provincia}</p>
          </div>
        </div>
        <div className="f-bottom">
          <span>© {new Date().getFullYear()} Rafracar Automóviles S.L. Todos los derechos reservados.</span>
          <span>Política de privacidad · Configurar cookies</span>
        </div>
      </div>
    </footer>
  );
}

export function MobileBar({ waText }) {
  return (
    <div className="mbar">
      <a className="btn btn-ghost" href={`tel:${NEGOCIO.telefono}`}>Llamar</a>
      <a className="btn btn-white" href={wa(waText)} target="_blank" rel="noopener">WhatsApp</a>
    </div>
  );
}


export function Reveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.in)');
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
      { threshold: 0.1 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
  return null;
}
