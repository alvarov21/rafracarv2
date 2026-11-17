import { Header, Footer, MobileBar } from '@/components/Site';
import StockList from '@/components/StockList';
import { getCars } from '@/lib/cars';

export const revalidate = 60;

export const metadata = {
  title: 'Stock de coches de ocasión en Baena | Rafracar',
  description: 'Todos los coches de segunda mano disponibles en Rafracar (Baena, Córdoba): SUV, compactos, diésel, híbridos y automáticos. Financiación a tu medida.',
  alternates: { canonical: '/stock' },
};

export default async function Stock({ searchParams }) {
  const cars = await getCars();
  const sp = await searchParams;
  return (
    <>
      <Header />
      <main>
        <div className="page-top">
          <span className="eyebrow">Nuestro inventario</span>
          <h1 className="title t-l">Stock disponible</h1>
          <div className="rule" />
        </div>
        <StockList cars={cars} initialTipo={sp?.tipo || ''} />
      </main>
      <Footer />
      <MobileBar waText="Hola, quiero información sobre vuestros coches." />
    </>
  );
}
