'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, NEGOCIO, OPCIONES, wa } from '@/lib/config';

const PRESUPUESTOS = ['Hasta 10.000 €', '10.000 – 15.000 €', '15.000 – 20.000 €', '20.000 – 30.000 €', 'Más de 30.000 €'];

export default function CartaForm() {
  const [f, setF] = useState({ nombre: '', telefono: '', email: '', busca: '', presupuesto: '', combustible: '', cambio: '', comentarios: '', acepto: false, web: '' });
  const [estado, setEstado] = useState('idle'); // idle | enviando | ok | error
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const enviar = async (e) => {
    e.preventDefault();
    if (f.web) return; // campo trampa para bots
    setEstado('enviando');
    const row = {
      nombre: f.nombre.trim(), telefono: f.telefono.trim(), email: f.email.trim() || null,
      busca: f.busca.trim(), presupuesto: f.presupuesto || null, combustible: f.combustible || null,
      cambio: f.cambio || null, comentarios: f.comentarios.trim() || null,
    };
    let guardado = false;
    let enviado = false;
    try {
      const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
      const { error } = await sb.from('solicitudes').insert(row);
      guardado = !error;
    } catch {}
    try {
      const r = await fetch(`https://formsubmit.co/ajax/${NEGOCIO.emailSolicitudes}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: `Coche a la carta: ${row.busca} — ${row.nombre}`,
          _template: 'table',
          _captcha: 'false',
          ...(row.email ? { _replyto: row.email } : {}),
          Nombre: row.nombre,
          Teléfono: row.telefono,
          Email: row.email || '—',
          'Coche que busca': row.busca,
          Presupuesto: row.presupuesto || '—',
          Combustible: row.combustible || 'Indiferente',
          Cambio: row.cambio || 'Indiferente',
          Comentarios: row.comentarios || '—',
          WhatsApp: `https://wa.me/34${row.telefono.replace(/\D/g, '').replace(/^34(?=\d{9}$)/, '')}`,
        }),
      });
      enviado = r.ok;
    } catch {}
    setEstado(guardado || enviado ? 'ok' : 'error');
  };

  if (estado === 'ok')
    return (
      <div className="cf cf-ok">
        <span className="eyebrow">Solicitud enviada</span>
        <h3 className="title t-m">Gracias, {f.nombre.split(' ')[0]}.</h3>
        <p>Ya estamos buscando tu {f.busca}. Te llamamos o te escribimos al {f.telefono} en cuanto tengamos opciones.</p>
      </div>
    );

  return (
    <form className="cf" onSubmit={enviar}>
      <div className="cf-grid">
        <label className="full">¿Qué coche buscas?*
          <input required minLength={2} maxLength={300} value={f.busca} onChange={set('busca')} placeholder="Ej. SUV automático, Seat Ateca, 7 plazas…" />
        </label>
        <label>Presupuesto
          <select value={f.presupuesto} onChange={set('presupuesto')}>
            <option value="">Indiferente</option>
            {PRESUPUESTOS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>
        <label>Combustible
          <select value={f.combustible} onChange={set('combustible')}>
            <option value="">Indiferente</option>
            {OPCIONES.combustible.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label>Cambio
          <select value={f.cambio} onChange={set('cambio')}>
            <option value="">Indiferente</option>
            {OPCIONES.cambio.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label>Nombre*
          <input required minLength={2} maxLength={120} autoComplete="name" value={f.nombre} onChange={set('nombre')} />
        </label>
        <label>Teléfono*
          <input required type="tel" minLength={9} maxLength={30} autoComplete="tel" value={f.telefono} onChange={set('telefono')} />
        </label>
        <label>Email
          <input type="email" maxLength={160} autoComplete="email" value={f.email} onChange={set('email')} />
        </label>
        <label className="full">Algo más que debamos saber
          <textarea rows={3} maxLength={2000} value={f.comentarios} onChange={set('comentarios')} placeholder="Kilómetros máximos, color, si tienes coche para entregar…" />
        </label>
        <input type="text" name="web" value={f.web} onChange={set('web')} tabIndex={-1} autoComplete="off" className="cf-hp" aria-hidden="true" />
      </div>
      <label className="cf-check">
        <input type="checkbox" required checked={f.acepto} onChange={set('acepto')} />
        <span>Acepto que Rafracar use estos datos para contactarme sobre mi solicitud.</span>
      </label>
      {estado === 'error' && (
        <p className="cf-err">No se ha podido enviar. Escríbenos por <a href={wa(`Hola, busco este coche: ${f.busca}`)} target="_blank" rel="noopener">WhatsApp</a> y te atendemos igual.</p>
      )}
      <button className="btn btn-white" disabled={estado === 'enviando'}>{estado === 'enviando' ? 'Enviando…' : 'Enviar solicitud'}</button>
    </form>
  );
}
