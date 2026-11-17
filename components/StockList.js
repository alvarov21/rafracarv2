'use client';
import { useMemo, useState } from 'react';
import CarCard from './CarCard';
import { wa } from '@/lib/config';
import { eur } from '@/lib/cars';

const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export default function StockList({ cars, initialTipo = '' }) {
  const [q, setQ] = useState('');
  const [marca, setMarca] = useState('');
  const [cambio, setCambio] = useState('');
  const [max, setMax] = useState(0);
  const [orden, setOrden] = useState('reciente');
  const [chip, setChip] = useState(initialTipo ? `tipo:${initialTipo}` : 'all');
  const [vendidos, setVendidos] = useState(true);

  const marcas = useMemo(() => [...new Set(cars.map((c) => c.marca))].sort(), [cars]);
  const combs = useMemo(() => [...new Set(cars.map((c) => c.combustible).filter(Boolean))], [cars]);
  const tipos = useMemo(() => [...new Set(cars.map((c) => c.tipo).filter(Boolean))], [cars]);

  const list = useMemo(() => {
    const qq = norm(q.trim());
    const out = cars.filter((c) => {
      const t = norm(`${c.marca} ${c.modelo} ${c.version} ${c.combustible} ${c.cambio} ${c.tipo}`);
      if (qq && !qq.split(/\s+/).every((w) => t.includes(w))) return false;
      if (marca && c.marca !== marca) return false;
      if (cambio && c.cambio !== cambio) return false;
      if (max && c.estado !== 'vendido' && (c.precio || 0) > max) return false;
      if (chip.startsWith('tipo:') && c.tipo !== chip.slice(5)) return false;
      if (chip.startsWith('comb:') && c.combustible !== chip.slice(5)) return false;
      if (chip === 'eco' && !['0', 'ECO'].includes(c.etiqueta)) return false;
      if (!vendidos && c.estado === 'vendido') return false;
      return true;
    });
    const s = {
      reciente: (a, b) => new Date(b.created_at) - new Date(a.created_at),
      pasc: (a, b) => (a.precio || 0) - (b.precio || 0),
      pdesc: (a, b) => (b.precio || 0) - (a.precio || 0),
      km: (a, b) => (a.km || 0) - (b.km || 0),
    }[orden];
    return out.sort((a, b) => (a.estado === 'vendido') - (b.estado === 'vendido') || s(a, b));
  }, [cars, q, marca, cambio, max, orden, chip, vendidos]);

  const n = list.filter((c) => c.estado !== 'vendido').length;
  const Chip = ({ id, children }) => (
    <button className={'chip' + (chip === id ? ' on' : '')} onClick={() => setChip(id)}>{children}</button>
  );

  return (
    <>
      <div className="filters"><div className="wrap">
        <div className="f-row">
          <input type="search" placeholder="Buscar marca o modelo" aria-label="Buscar" value={q} onChange={(e) => setQ(e.target.value)} />
          <select aria-label="Marca" value={marca} onChange={(e) => setMarca(e.target.value)}>
            <option value="">Marca</option>
            {marcas.map((m) => <option key={m}>{m}</option>)}
          </select>
          <select aria-label="Cambio" value={cambio} onChange={(e) => setCambio(e.target.value)}>
            <option value="">Cambio</option><option>Manual</option><option>Automático</option>
          </select>
          <select aria-label="Precio máximo" value={max} onChange={(e) => setMax(+e.target.value)}>
            <option value={0}>Precio máximo</option>
            {[8000, 10000, 15000, 20000, 25000, 30000].map((v) => <option key={v} value={v}>Hasta {eur(v)}</option>)}
          </select>
          <select aria-label="Ordenar" value={orden} onChange={(e) => setOrden(e.target.value)}>
            <option value="reciente">Más recientes</option>
            <option value="pasc">Precio ascendente</option>
            <option value="pdesc">Precio descendente</option>
            <option value="km">Menos kilómetros</option>
          </select>
        </div>
        <div className="chips">
          <Chip id="all">Todos</Chip>
          {tipos.map((t) => <Chip key={t} id={`tipo:${t}`}>{t}</Chip>)}
          {combs.map((c) => <Chip key={c} id={`comb:${c}`}>{c}</Chip>)}
          <Chip id="eco">Etiqueta ECO / CERO</Chip>
        </div>
      </div></div>
      <div className="wrap" style={{ paddingBottom: 120 }}>
        <div className="result-bar">
          <span>{n} {n === 1 ? 'coche disponible' : 'coches disponibles'}</span>
          <label><input type="checkbox" checked={vendidos} onChange={(e) => setVendidos(e.target.checked)} /> Mostrar vendidos</label>
        </div>
        <div className="grid">
          {list.length ? list.map((c) => <CarCard key={c.id} c={c} />) : (
            <div className="empty">
              <h3 className="title t-m">Ahora mismo no tenemos ese coche</h3>
              <p>Pero te lo podemos buscar a la carta.</p>
              <a className="btn btn-white" target="_blank" rel="noopener" href={wa('Hola, busco un coche que no veo en vuestro stock: ')}>Pedir a la carta</a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
