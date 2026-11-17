export default function manifest() {
  return {
    name: 'Rafracar · Gestión de stock',
    short_name: 'Rafracar',
    start_url: '/admin',
    scope: '/',
    display: 'standalone',
    background_color: '#0a1324',
    theme_color: '#0a1324',
    icons: [
      { src: '/img/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/img/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
