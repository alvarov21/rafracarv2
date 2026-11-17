'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, OPCIONES } from '@/lib/config';
import { carSlug, eur, kmf } from '@/lib/cars';

let _sb;
const sb = () => (_sb ||= createClient(SUPABASE_URL, SUPABASE_ANON_KEY));

const ESTADOS = [
  ['disponible', 'Disponible'],
  ['reservado', 'Reservado'],
  ['vendido', 'Vendido'],
];

/* ---------- utilidades ---------- */
async function compress(file, max = 1600, quality = 0.82) {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => createImageBitmap(file));
  const r = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * r);
  c.height = Math.round(bmp.height * r);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise((res) => c.toBlob(res, 'image/jpeg', quality));
}

const storagePath = (url) => {
  const m = String(url).split('/storage/v1/object/public/coches/');
  return m[1] ? decodeURIComponent(m[1]) : null;
};

async function refreshSite(session) {
  try {
    await fetch('/api/revalidate', { method: 'POST', headers: { Authorization: `Bearer ${session.access_token}` } });
  } catch {}
}

/* ---------- pantalla principal ---------- */
export default function Admin() {
  const [session, setSession] = useState(undefined);
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    sb().auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = sb().auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setIsAdmin(null); return; }
    sb().rpc('is_admin').then(({ data }) => setIsAdmin(!!data));
  }, [session]);

  if (session === undefined) return <div className="ad-shell"><div className="ad-center">Cargando…</div></div>;
  if (!session) return <Login />;
  if (isAdmin === null) return <div className="ad-shell"><div className="ad-center">Comprobando acceso…</div></div>;
  if (!isAdmin)
    return (
      <div className="ad-shell"><div className="ad-center">
        <img src="/img/logo-rafracar-600.png" alt="Rafracar" className="ad-logo-big" />
        <p>Esta cuenta ({session.user.email}) no tiene permiso para gestionar el stock.</p>
        <button className="ad-btn ghost" onClick={() => sb().auth.signOut()}>Salir</button>
      </div></div>
    );
  return <Panel session={session} />;
}

function Login() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const go = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    const { error } = await sb().auth.signInWithPassword({ email: email.trim(), password: pass });
    if (error) setErr('Email o contraseña incorrectos.');
    setBusy(false);
  };
  return (
    <div className="ad-shell">
      <form className="ad-login" onSubmit={go}>
        <img src="/img/logo-rafracar-600.png" alt="Rafracar" className="ad-logo-big" />
        <h1>Gestión del stock</h1>
        <label>Email<input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Contraseña<input type="password" autoComplete="current-password" value={pass} onChange={(e) => setPass(e.target.value)} required /></label>
        {err && <p className="ad-err">{err}</p>}
        <button className="ad-btn" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
        <p className="ad-hint">Solo tienes que entrar una vez: el móvil recuerda la sesión.</p>
      </form>
    </div>
  );
}

function Panel({ session }) {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('disponible');
  const [editing, setEditing] = useState(null); // null | 'new' | car
  const [toast, setToast] = useState('');
  const [q, setQ] = useState('');

  const say = (t) => { setToast(t); setTimeout(() => setToast(''), 2200); };

  const load = useCallback(async () => {
    const { data, error } = await sb().from('coches').select('*').order('created_at', { ascending: false });
    if (!error) setCars(data);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const counts = useMemo(() => Object.fromEntries(ESTADOS.map(([k]) => [k, cars.filter((c) => c.estado === k).length])), [cars]);
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return cars.filter((c) => c.estado === tab && (!t || `${c.marca} ${c.modelo} ${c.version}`.toLowerCase().includes(t)));
  }, [cars, tab, q]);

  const patch = async (c, changes, msg) => {
    const prev = cars;
    setCars((cs) => cs.map((x) => (x.id === c.id ? { ...x, ...changes } : x)));
    const { error } = await sb().from('coches').update(changes).eq('id', c.id);
    if (error) { setCars(prev); say('No se ha podido guardar. Revisa la conexión.'); return; }
    say(msg);
    refreshSite(session);
  };

  if (editing)
    return (
      <Editor
        car={editing === 'new' ? null : editing}
        session={session}
        onClose={(saved, msg) => { setEditing(null); if (saved) { load(); say(msg); } }}
      />
    );

  return (
    <div className="ad-shell">
      <header className="ad-top">
        <img src="/img/logo-rafracar-600.png" alt="Rafracar" />
        <div className="ad-top-r">
          <a href="/" target="_blank" rel="noopener" className="ad-link">Ver web</a>
          <button className="ad-link" onClick={() => sb().auth.signOut()}>Salir</button>
        </div>
      </header>

      <main className="ad-main">
        <button className="ad-add" onClick={() => setEditing('new')}>
          <span>+</span> Añadir coche
        </button>

        <div className="ad-tabs">
          {ESTADOS.map(([k, t]) => (
            <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
              {t}<b>{counts[k] || 0}</b>
            </button>
          ))}
        </div>

        {cars.length > 6 && (
          <input className="ad-search" type="search" placeholder="Buscar coche…" value={q} onChange={(e) => setQ(e.target.value)} />
        )}

        {loading ? <p className="ad-empty">Cargando coches…</p> : list.length === 0 ? (
          <p className="ad-empty">{tab === 'disponible' ? 'No hay coches disponibles. Pulsa «Añadir coche».' : `No hay coches ${tab === 'reservado' ? 'reservados' : 'vendidos'}.`}</p>
        ) : (
          <ul className="ad-list">
            {list.map((c) => (
              <li key={c.id} className="ad-item">
                <button className="ad-item-main" onClick={() => setEditing(c)}>
                  <div className="ad-thumb">{c.fotos?.[0] ? <img src={c.fotos[0]} alt="" /> : <span>Sin foto</span>}</div>
                  <div className="ad-info">
                    <strong>{c.marca} {c.modelo}</strong>
                    <small>{[c.anio, kmf(c.km)].filter(Boolean).join(' · ')}</small>
                    <em>{eur(c.precio)}</em>
                  </div>
                </button>
                <button
                  className={'ad-star' + (c.destacado ? ' on' : '')}
                  aria-label={c.destacado ? 'Quitar de destacados' : 'Destacar en portada'}
                  onClick={() => patch(c, { destacado: !c.destacado }, c.destacado ? 'Quitado de la portada' : 'Destacado en la portada')}
                >★</button>
                <div className="ad-seg">
                  {ESTADOS.map(([k, t]) => (
                    <button key={k} className={(c.estado === k ? 'on ' : '') + k} onClick={() => c.estado !== k && patch(c, { estado: k }, `${c.marca} ${c.modelo}: ${t.toLowerCase()}`)}>
                      {t}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
      {toast && <div className="ad-toast">{toast}</div>}
    </div>
  );
}

/* ---------- alta / edición ---------- */
const EMPTY = {
  marca: '', modelo: '', version: '', anio: '', km: '', cv: '', precio: '',
  combustible: 'Diésel', cambio: 'Manual', tipo: 'SUV', etiqueta: 'C', color: '',
  descripcion: '', equipamiento: '', estado: 'disponible', destacado: false, fotos: [],
};

function Editor({ car, session, onClose }) {
  const [f, setF] = useState(() => (car ? { ...EMPTY, ...car, anio: car.anio ?? '', km: car.km ?? '', cv: car.cv ?? '', precio: car.precio ?? '' } : EMPTY));
  // fotos: [{url}] existentes o [{file, preview}] nuevas
  const [fotos, setFotos] = useState(() => (car?.fotos || []).map((url) => ({ url })));
  const [busy, setBusy] = useState('');
  const [err, setErr] = useState('');
  const [confirmDel, setConfirmDel] = useState(false);
  const fileRef = useRef(null);
  const removed = useRef([]);

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e?.target ? e.target.value : e }));

  const addFiles = (files) => {
    const arr = [...files].filter((x) => x.type.startsWith('image/'));
    setFotos((fs) => [...fs, ...arr.map((file) => ({ file, preview: URL.createObjectURL(file) }))]);
  };
  const move = (i, d) => setFotos((fs) => {
    const j = i + d; if (j < 0 || j >= fs.length) return fs;
    const n = [...fs]; [n[i], n[j]] = [n[j], n[i]]; return n;
  });
  const drop = (i) => setFotos((fs) => {
    const x = fs[i]; if (x.url) removed.current.push(x.url);
    return fs.filter((_, k) => k !== i);
  });

  const save = async () => {
    setErr('');
    if (!f.marca.trim() || !f.modelo.trim()) { setErr('Pon al menos la marca y el modelo.'); return; }
    if (!fotos.length) { setErr('Añade al menos una foto.'); return; }
    try {
      const urls = [];
      const nuevas = fotos.filter((x) => x.file).length;
      let done = 0;
      for (const x of fotos) {
        if (x.url) { urls.push(x.url); continue; }
        setBusy(`Subiendo fotos ${++done}/${nuevas}…`);
        const blob = await compress(x.file);
        const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.jpg`;
        const { error } = await sb().storage.from('coches').upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' });
        if (error) throw error;
        urls.push(sb().storage.from('coches').getPublicUrl(path).data.publicUrl);
      }
      setBusy('Guardando…');
      const num = (v) => (v === '' || v == null ? null : Number(String(v).replace(/\D/g, '')) || null);
      const row = {
        marca: f.marca.trim(), modelo: f.modelo.trim(), version: f.version.trim(),
        anio: num(f.anio), km: num(f.km), cv: num(f.cv), precio: num(f.precio),
        combustible: f.combustible, cambio: f.cambio, tipo: f.tipo, etiqueta: f.etiqueta, color: f.color.trim(),
        descripcion: f.descripcion.trim(), equipamiento: f.equipamiento.trim(),
        estado: f.estado, destacado: f.destacado, fotos: urls,
      };
      const q = car ? sb().from('coches').update(row).eq('id', car.id) : sb().from('coches').insert(row);
      const { error } = await q;
      if (error) throw error;
      const paths = removed.current.map(storagePath).filter(Boolean);
      if (paths.length) await sb().storage.from('coches').remove(paths);
      await refreshSite(session);
      onClose(true, car ? 'Cambios guardados' : 'Coche publicado en la web');
    } catch (e) {
      console.error(e);
      setErr('No se ha podido guardar. Revisa la conexión e inténtalo otra vez.');
      setBusy('');
    }
  };

  const remove = async () => {
    if (!confirmDel) { setConfirmDel(true); return; }
    setBusy('Borrando…');
    const { error } = await sb().from('coches').delete().eq('id', car.id);
    if (error) { setErr('No se ha podido borrar.'); setBusy(''); return; }
    const paths = (car.fotos || []).map(storagePath).filter(Boolean);
    if (paths.length) await sb().storage.from('coches').remove(paths);
    await refreshSite(session);
    onClose(true, 'Coche borrado');
  };

  const Chips = ({ k, opts }) => (
    <div className="ad-chips">
      {opts.map((o) => (
        <button type="button" key={o} className={f[k] === o ? 'on' : ''} onClick={() => setF((s) => ({ ...s, [k]: o }))}>
          {o === '0' ? 'CERO' : o}
        </button>
      ))}
    </div>
  );

  return (
    <div className="ad-shell">
      <header className="ad-top">
        <button className="ad-link" onClick={() => onClose(false)} disabled={!!busy}>← Volver</button>
        <strong>{car ? 'Editar coche' : 'Nuevo coche'}</strong>
        {car ? <a className="ad-link" href={`/coche/${carSlug(car)}`} target="_blank" rel="noopener">Ver</a> : <span />}
      </header>

      <main className="ad-main ad-form">
        <section>
          <h2>Fotos</h2>
          <p className="ad-hint">La primera es la portada. Usa las flechas para cambiar el orden.</p>
          <div className="ad-photos">
            {fotos.map((x, i) => (
              <div key={(x.url || x.preview) + i} className="ad-photo">
                <img src={x.url || x.preview} alt="" />
                {i === 0 && <span className="ad-cover">Portada</span>}
                <div className="ad-photo-ctl">
                  <button type="button" onClick={() => move(i, -1)} aria-label="Mover antes">‹</button>
                  <button type="button" onClick={() => drop(i)} aria-label="Quitar foto">✕</button>
                  <button type="button" onClick={() => move(i, 1)} aria-label="Mover después">›</button>
                </div>
              </div>
            ))}
            <button type="button" className="ad-photo add" onClick={() => fileRef.current?.click()}>
              <span>+</span>Añadir fotos
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
        </section>

        <section>
          <h2>Datos del coche</h2>
          <div className="ad-grid">
            <label>Marca<input value={f.marca} onChange={set('marca')} placeholder="Ford" list="marcas" autoCapitalize="words" /></label>
            <label>Modelo<input value={f.modelo} onChange={set('modelo')} placeholder="Kuga" autoCapitalize="words" /></label>
            <label className="full">Versión<input value={f.version} onChange={set('version')} placeholder="2.0 TDCi ST-Line 150 CV" /></label>
            <label>Precio (€)<input inputMode="numeric" value={f.precio} onChange={set('precio')} placeholder="18900" /></label>
            <label>Kilómetros<input inputMode="numeric" value={f.km} onChange={set('km')} placeholder="98400" /></label>
            <label>Año<input inputMode="numeric" value={f.anio} onChange={set('anio')} placeholder="2019" /></label>
            <label>Potencia (CV)<input inputMode="numeric" value={f.cv} onChange={set('cv')} placeholder="150" /></label>
            <label className="full">Color<input value={f.color} onChange={set('color')} placeholder="Negro" /></label>
          </div>
          <datalist id="marcas">
            {['Audi','BMW','Citroën','Cupra','Dacia','Fiat','Ford','Honda','Hyundai','Jeep','Kia','Land Rover','Mazda','Mercedes-Benz','MG','Mini','Mitsubishi','Nissan','Opel','Peugeot','Renault','Seat','Skoda','Toyota','Volkswagen','Volvo'].map((m) => <option key={m} value={m} />)}
          </datalist>

          <div className="ad-field"><span>Combustible</span><Chips k="combustible" opts={OPCIONES.combustible} /></div>
          <div className="ad-field"><span>Cambio</span><Chips k="cambio" opts={OPCIONES.cambio} /></div>
          <div className="ad-field"><span>Carrocería</span><Chips k="tipo" opts={OPCIONES.tipo} /></div>
          <div className="ad-field"><span>Etiqueta DGT</span><Chips k="etiqueta" opts={OPCIONES.etiqueta} /></div>
        </section>

        <section>
          <h2>Texto (opcional)</h2>
          <label className="ad-block">Descripción<textarea rows={3} value={f.descripcion} onChange={set('descripcion')} placeholder="Un solo propietario, libro de mantenimiento al día…" /></label>
          <label className="ad-block">Equipamiento <small>(uno por línea)</small><textarea rows={5} value={f.equipamiento} onChange={set('equipamiento')} placeholder={'Climatizador bizona\nCámara trasera\nApple CarPlay'} /></label>
        </section>

        <section>
          <h2>Estado</h2>
          <div className="ad-seg big">
            {ESTADOS.map(([k, t]) => (
              <button type="button" key={k} className={(f.estado === k ? 'on ' : '') + k} onClick={() => setF((s) => ({ ...s, estado: k }))}>{t}</button>
            ))}
          </div>
          <label className="ad-check">
            <input type="checkbox" checked={f.destacado} onChange={(e) => setF((s) => ({ ...s, destacado: e.target.checked }))} />
            Destacar en la portada
          </label>
        </section>

        {err && <p className="ad-err">{err}</p>}

        {car && (
          <button type="button" className={'ad-del' + (confirmDel ? ' sure' : '')} onClick={remove} disabled={!!busy}>
            {confirmDel ? 'Pulsa otra vez para borrarlo definitivamente' : 'Borrar este coche'}
          </button>
        )}
      </main>

      <div className="ad-savebar">
        <button className="ad-btn" onClick={save} disabled={!!busy}>{busy || (car ? 'Guardar cambios' : 'Publicar coche')}</button>
      </div>
    </div>
  );
}
