import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { Header, Footer, MobileBar } from '@/components/Site';
import { wa } from '@/lib/config';
import CarCard from '@/components/CarCard';
import Gallery from '@/components/Gallery';
import { getCarBySlug, getCars, carSlug, eur, kmf, etiquetaTxt, equipList, cover } from '@/lib/cars';
import { NEGOCIO, SITE_URL } from '@/lib/config';

export const revalidate = 60;

const title = (c) => `${c.marca} ${c.modelo}${c.version ? ' ' + c.version : ''}${c.anio ? ' ' + c.anio : ''}`;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const c = await getCarBySlug(slug);
  if (!c) return { title: 'Coche no disponible | Rafracar' };
  const t = `${title(c)} en venta en Baena | Rafracar`;
  const d = c.estado === 'vendido'
    ? `${title(c)} vendido. Mira otros coches de ocasión en Rafracar, Baena (Córdoba).`
    : `${title(c)} de ocasión por ${eur(c.precio)}. ${[kmf(c.km), c.combustible, c.cambio].filter(Boolean).join(', ')}. Financiación a tu medida en Rafracar, Baena (Córdoba).`;
  return {
    title: t,
    description: d,
    alternates: { canonical: `/coche/${carSlug(c)}` },
    openGraph: { title: t, description: d, images: [cover(c)] },
  };
}

export default async function Car({ params }) {
  const { slug } = await params;
  const c = await getCarBySlug(slug);
  if (!c) notFound();
  if (slug !== carSlug(c)) permanentRedirect(`/coche/${carSlug(c)}`);

  const all = await getCars();
  const similar = all
    .filter((x) => x.id !== c.id && x.estado !== 'vendido' && (x.tipo === c.tipo || Math.abs((x.precio || 0) - (c.precio || 0)) < 4000))
    .slice(0, 4);
  const fotos = c.fotos?.length ? c.fotos : ['/img/coche-1.jpg'];
  const equip = equipList(c);
  const sold = c.estado === 'vendido';
  const msg = `Hola, me interesa el ${title(c)} de ${eur(c.precio)} que tenéis en la web. ¿Sigue disponible?`;

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: title(c),
    brand: { '@type': 'Brand', name: c.marca },
    model: c.modelo,
    vehicleModelDate: c.anio ? String(c.anio) : undefined,
    mileageFromOdometer: c.km ? { '@type': 'QuantitativeValue', value: c.km, unitCode: 'KMT' } : undefined,
    fuelType: c.combustible || undefined,
    vehicleTransmission: c.cambio || undefined,
    color: c.color || undefined,
    itemCondition: 'https://schema.org/UsedCondition',
    image: fotos.map((f) => (f.startsWith('http') ? f : SITE_URL + f)),
    description: c.descripcion || undefined,
    offers: {
      '@type': 'Offer',
      price: c.precio || undefined,
      priceCurrency: 'EUR',
      availability: sold ? 'https://schema.org/SoldOut' : c.estado === 'reservado' ? 'https://schema.org/LimitedAvailability' : 'https://schema.org/InStock',
      url: `${SITE_URL}/coche/${carSlug(c)}`,
      seller: { '@type': 'AutoDealer', name: NEGOCIO.nombre },
    },
  };

  const facts = [
    ['Año', c.anio], ['Kilómetros', kmf(c.km)], ['Potencia', c.cv ? `${c.cv} CV` : ''],
    ['Combustible', c.combustible], ['Cambio', c.cambio], ['Etiqueta DGT', c.etiqueta ? etiquetaTxt(c.etiqueta) : ''],
    ['Carrocería', c.tipo], ['Color', c.color], ['Ubicación', 'Baena'],
  ].filter(([, v]) => v);

  return (
    <>
      <Header />
      <main className="detail"><div className="wrap">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
        <Link className="back" href="/stock">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 18l-6-6 6-6" /></svg>
          Volver al stock
        </Link>
        <Gallery fotos={fotos} alt={`${title(c)} en venta en Baena`} />

        <div className="d-grid">
          <div>
            <div className="d-meta">{[c.anio, kmf(c.km), c.cv && `${c.cv} CV`, c.combustible].filter(Boolean).join(' · ')}</div>
            <h1 className="title t-l d-title">{c.marca} {c.modelo}</h1>
            {c.version && <div className="d-ver">{c.version}</div>}
            {c.descripcion ? <p className="d-desc">{c.descripcion}</p> : <div style={{ height: 40 }} />}
            <div className="facts">
              {facts.map(([k, v]) => <div key={k}><small>{k}</small><b>{v}</b></div>)}
            </div>
            {equip.length > 0 && (
              <div className="spec">
                <h4 style={{ marginTop: 0 }}>Equipamiento</h4>
                <ul>{equip.map((e) => <li key={e}>{e}</li>)}</ul>
              </div>
            )}
          </div>
          <aside className="buy">
            {c.estado === 'reservado' && <div className="note">Este coche está reservado. Escríbenos y te avisamos si se libera, o te buscamos uno parecido.</div>}
            {sold && <div className="note">Este coche ya se ha vendido. Si buscas algo parecido, te lo encontramos.</div>}
            <div className="big">{sold ? 'Vendido' : eur(c.precio)}</div>
            <div className="iva">{sold ? ' ' : 'Precio al contado · Financiación disponible'}</div>
            {sold ? (
              <a className="btn btn-white" target="_blank" rel="noopener" href={wa(`Hola, vi que el ${c.marca} ${c.modelo} está vendido. Busco algo parecido.`)}>Buscadme uno parecido</a>
            ) : (
              <>
                <a className="btn btn-white" target="_blank" rel="noopener" href={wa(msg)}>Solicitar información</a>
                <a className="btn btn-line" href={`tel:${NEGOCIO.telefono}`}>Llamar · {NEGOCIO.telefonoTxt}</a>
              </>
            )}
            <hr />
            <p>Lo puedes ver en Baena, Córdoba. Te lo enseñamos sin compromiso y, si quieres, te preparamos una cuota a tu medida.</p>
          </aside>
        </div>

        {similar.length > 0 && (
          <div style={{ marginTop: 120 }}>
            <div className="sec-head">
              <span className="eyebrow">También te puede interesar</span>
              <h2 className="title t-l">Coches parecidos</h2>
              <div className="rule" />
            </div>
            <div className="grid">{similar.map((x) => <CarCard key={x.id} c={x} />)}</div>
          </div>
        )}
      </div></main>
      <Footer />
      <MobileBar waText={sold ? 'Hola, busco un coche parecido a uno que tenéis vendido.' : msg} />
    </>
  );
}
