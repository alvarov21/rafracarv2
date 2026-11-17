import './globals.css';
import { NEGOCIO, SITE_URL } from '@/lib/config';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Rafracar | Coches de ocasión en Baena, Córdoba',
  description:
    'Concesionario de coches de ocasión en Baena (Córdoba). Stock actualizado, financiación a tu medida y coche a la carta.',
  icons: { icon: '/img/favicon.png', apple: '/img/icon-192.png' },
  openGraph: { type: 'website', locale: 'es_ES', siteName: 'Rafracar', images: ['/img/nave-rafracar.jpg'] },
};

export const viewport = { themeColor: '#0a1324' };

const dealerLd = {
  '@context': 'https://schema.org',
  '@type': 'AutoDealer',
  name: NEGOCIO.nombre,
  url: SITE_URL,
  telephone: NEGOCIO.telefono,
  image: SITE_URL + '/img/nave-rafracar.jpg',
  address: {
    '@type': 'PostalAddress',
    streetAddress: NEGOCIO.calle,
    postalCode: NEGOCIO.cp,
    addressLocality: NEGOCIO.ciudad,
    addressRegion: NEGOCIO.provincia,
    addressCountry: 'ES',
  },
  sameAs: [NEGOCIO.instagram],
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,500;1,300&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dealerLd) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
