import './admin.css';

export const metadata = {
  title: 'Rafracar · Gestión',
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: 'Rafracar', statusBarStyle: 'black-translucent' },
};

export const viewport = { themeColor: '#0a1324', width: 'device-width', initialScale: 1, maximumScale: 1 };

export default function AdminLayout({ children }) {
  return children;
}
