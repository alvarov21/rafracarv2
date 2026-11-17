import Link from 'next/link';
import { Header, Footer } from '@/components/Site';

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="page-top" style={{ minHeight: '60vh' }}>
        <span className="eyebrow">No disponible</span>
        <h1 className="title t-l">Este coche ya no está en el stock</h1>
        <p className="lead" style={{ margin: '20px auto 32px' }}>Puede que se haya vendido. Echa un vistazo al resto de coches.</p>
        <Link className="btn btn-white" href="/stock">Ver stock</Link>
      </main>
      <Footer />
    </>
  );
}
