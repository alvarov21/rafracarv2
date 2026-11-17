import Link from 'next/link';
import { carSlug, cover, eur, kmf } from '@/lib/cars';

export default function CarCard({ c }) {
  const sold = c.estado === 'vendido';
  return (
    <Link className={'card' + (sold ? ' sold' : '')} href={`/coche/${carSlug(c)}`}>
      <div className="ph">
        {c.estado === 'reservado' && <span className="badge">Reservado</span>}
        {sold && <span className="badge">Vendido</span>}
        <img src={cover(c)} alt={`${c.marca} ${c.modelo} ${c.version || ''} en venta en Baena`} loading="lazy" />
      </div>
      <div className="body">
        <h3>
          {c.marca} {c.modelo}
          <small>{[c.anio, kmf(c.km), c.cambio].filter(Boolean).join(' · ')}</small>
        </h3>
        <span className="price">{sold ? 'Vendido' : eur(c.precio)}</span>
      </div>
    </Link>
  );
}
