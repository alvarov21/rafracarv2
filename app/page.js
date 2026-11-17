import Link from 'next/link';
import { Header, Footer, MobileBar, Reveal } from '@/components/Site';
import { wa } from '@/lib/config';
import CarCard from '@/components/CarCard';
import Carousel from '@/components/Carousel';
import { getCars, ORDER, cover } from '@/lib/cars';
import { NEGOCIO } from '@/lib/config';

export const revalidate = 60;

export default async function Home() {
  const cars = await getCars();
  const disp = cars.filter((c) => c.estado !== 'vendido');
  let dest = disp.filter((c) => c.destacado);
  if (dest.length < 4) dest = [...dest, ...disp.filter((c) => !c.destacado)].slice(0, 8);
  dest.sort((a, b) => ORDER[a.estado] - ORDER[b.estado]);
  const sold = cars.filter((c) => c.estado === 'vendido')
    .sort((a, b) => new Date(b.vendido_at || b.updated_at) - new Date(a.vendido_at || a.updated_at))
    .slice(0, 4);

  return (
    <>
      <Header overHero />
      <main>
        <section className="hero" style={{ padding: 0 }}>
          <div className="hero-bg" style={{ backgroundImage: `url('${NEGOCIO.heroImg}')` }} />
          <div className="wrap">
            <div className="hero-txt">
              <span className="eyebrow">Concesionario en Baena, Córdoba</span>
              <h1 className="title t-xl">Coches de ocasión,<br /><em>con confianza</em></h1>
              <p>Cada coche revisado y preparado antes de entregarlo. Financiación a tu medida y, si no está en el stock, te lo buscamos.</p>
              <div className="hero-ctas">
                <Link className="btn btn-white" href="/stock">Ver stock</Link>
                <Link className="btn btn-line" href="/#carta">Coche a la carta</Link>
              </div>
            </div>
          </div>
          <div className="scroll">Scroll<i /></div>
        </section>

        <section>
          <div className="wrap">
            <div className="sec-head reveal">
              <span className="eyebrow">Nuestro stock</span>
              <h2 className="title t-l">Coches disponibles</h2>
              <div className="rule" />
            </div>
            {dest.length ? (
              <Carousel>{dest.map((c) => <CarCard key={c.id} c={c} />)}</Carousel>
            ) : (
              <p className="lead" style={{ margin: '0 auto', textAlign: 'center' }}>Estamos actualizando el stock. Escríbenos y te contamos qué coches tenemos ahora mismo.</p>
            )}
            <div className="center"><Link className="btn btn-line" href="/stock">Ver todo el stock</Link></div>
          </div>
        </section>

        <section id="carta" style={{ paddingTop: 40 }}>
          <div className="wrap svc">
            <div className="reveal">
              <span className="eyebrow">Coche a la carta</span>
              <h2 className="title t-l">¿No está en el stock?<br />Te lo buscamos</h2>
              <p className="lead">Nos dices qué coche quieres y cuánto quieres gastar. Nosotros buscamos la unidad, la revisamos y te la entregamos lista para circular.</p>
              <div style={{ marginTop: 36 }}>
                <a className="btn btn-white" target="_blank" rel="noopener" href={wa('Hola, quiero pedir un coche a la carta. Busco: ')}>Pedir mi coche</a>
              </div>
            </div>
            <div className="steps reveal">
              {[
                ['01', 'Nos cuentas qué buscas', 'Marca, modelo, presupuesto o combustible. Con lo que tengas claro nos basta.'],
                ['02', 'Buscamos la unidad', 'Comparamos opciones y te enseñamos las que encajan, con fotos y datos reales.'],
                ['03', 'La revisamos', 'Comprobamos estado, kilómetros e historial antes de darte el visto bueno.'],
                ['04', 'Te la entregamos', 'Nos encargamos de los trámites y la recoges en Baena lista para circular.'],
              ].map(([n, t, p]) => (
                <div className="step" key={n}><span>{n}</span><div><h4>{t}</h4><p>{p}</p></div></div>
              ))}
            </div>
          </div>
        </section>

        <section id="financiacion" style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
          <div className="wrap">
            <div className="svc">
              <div className="reveal">
                <span className="eyebrow">Financiación</span>
                <h2 className="title t-l">Financiamos a tu medida</h2>
                <p className="lead">Elige el coche y nosotros preparamos una cuota que encaje con lo que puedes pagar cada mes. Sin complicaciones y sin papeleo interminable.</p>
              </div>
              <div className="reveal">
                <ul className="list">
                  <li><b>Estudio personalizado</b> para cada cliente, sin compromiso.</li>
                  <li><b>Entrada y plazos</b> adaptados a lo que necesitas.</li>
                  <li><b>Todo el papeleo</b> lo gestionamos nosotros.</li>
                  <li><b>Respuesta rápida</b> por WhatsApp o por teléfono.</li>
                </ul>
                <a className="btn btn-line" target="_blank" rel="noopener" href={wa('Hola, quiero información sobre la financiación de un coche.')}>Pedir mi cuota</a>
              </div>
            </div>
            <div className="band reveal"><div>Coches revisados</div><div>Precio claro</div><div>Trato directo</div></div>
          </div>
        </section>

        <section id="nosotros">
          <div className="wrap about">
            <div className="about-photo reveal" style={{ backgroundImage: `url('${NEGOCIO.sobreImg}')` }} />
            <div className="reveal">
              <span className="eyebrow">Sobre nosotros</span>
              <h2 className="title t-l">Un concesionario de Baena, con trato de tú a tú</h2>
              <p>En Rafracar elegimos cada coche como si fuera para nosotros. Te lo enseñamos sin prisas, te contamos todo lo que tiene y te ayudamos con la financiación.</p>
              <p>Y cuando te lo llevas, lo celebramos contigo. Cada entrega la compartimos en nuestras redes.</p>
              <div className="sign">— Rafracar Automóviles, Baena</div>
            </div>
          </div>
        </section>

        {sold.length > 0 && (
          <section style={{ paddingTop: 0 }}>
            <div className="wrap">
              <div className="sec-head reveal">
                <span className="eyebrow">Clientes satisfechos</span>
                <h2 className="title t-l">Entregados</h2>
                <div className="rule" />
              </div>
              <div className="ig-grid reveal">
                {sold.map((c) => (
                  <a key={c.id} href={NEGOCIO.instagram} target="_blank" rel="noopener">
                    <img src={cover(c)} alt={`${c.marca} ${c.modelo} entregado`} loading="lazy" />
                    <span>{c.marca} {c.modelo}</span>
                  </a>
                ))}
              </div>
              <div className="center"><a className="btn btn-ghost" href={NEGOCIO.instagram} target="_blank" rel="noopener">@rafracar en Instagram</a></div>
            </div>
          </section>
        )}

        <section id="contacto" style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--line)' }}>
          <div className="wrap contact">
            <div className="reveal">
              <span className="eyebrow">Contacto</span>
              <h2 className="title t-l">Ven a verlos</h2>
              <div className="c-row"><small>Dirección</small>{NEGOCIO.direccion}</div>
              <div className="c-row"><small>Teléfono</small><a href={`tel:${NEGOCIO.telefono}`}>{NEGOCIO.telefonoTxt}</a></div>
              <div className="c-row"><small>Horario</small>{NEGOCIO.horario.map((h) => <div key={h}>{h}</div>)}</div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 36 }}>
                <a className="btn btn-white" target="_blank" rel="noopener" href={wa('Hola, quiero información sobre vuestros coches.')}>WhatsApp</a>
                <a className="btn btn-line" target="_blank" rel="noopener" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Rafracar automoviles Baena')}`}>Cómo llegar</a>
              </div>
            </div>
            <div className="map reveal">
              <iframe loading="lazy" title="Mapa de Rafracar" src={`https://maps.google.com/maps?q=${encodeURIComponent(NEGOCIO.direccion)}&z=15&output=embed`} />
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <MobileBar waText="Hola, quiero información sobre vuestros coches." />
      <Reveal />
    </>
  );
}
