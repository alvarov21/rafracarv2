// Datos públicos: la URL y la clave "anon" de Supabase están pensadas para ir en el navegador.
// La seguridad la ponen las políticas RLS de supabase/schema.sql.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bkcjeeffzfoemogfhlrq.supabase.co';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_gF4eRiSQD2aEWYoya66lhw_EtFrfh0z';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rafracar-web.vercel.app';

export const NEGOCIO = {
  nombre: 'Rafracar Automóviles',
  telefono: '+34624231835',
  telefonoTxt: '624 23 18 35',
  whatsapp: '34624231835',
  calle: 'C. Cancionero de Baena, 2',
  cp: '14850',
  ciudad: 'Baena',
  provincia: 'Córdoba',
  direccion: 'C. Cancionero de Baena, 2, 14850 Baena, Córdoba',
  horario: ['Lunes a viernes · [horario]', 'Sábados · [horario]'],
  instagram: 'https://www.instagram.com/rafracar/',
  // A dónde llegan las solicitudes de «Coche a la carta» (FormSubmit pide activarlo con el primer envío)
  emailSolicitudes: 'itsmakitwich@gmail.com',
  heroImg: '/img/nave-rafracar.jpg',
  sobreImg: '/img/nave-rafracar.jpg',
};

export const OPCIONES = {
  combustible: ['Diésel', 'Gasolina', 'Híbrido', 'Híbrido enchufable', 'Eléctrico', 'GLP'],
  cambio: ['Manual', 'Automático'],
  tipo: ['SUV', 'Compacto', 'Berlina', 'Familiar', 'Monovolumen', 'Utilitario', 'Furgoneta', 'Pick-up'],
  etiqueta: ['0', 'ECO', 'C', 'B', 'Sin etiqueta'],
};

export const wa = (t) =>
  `https://wa.me/${NEGOCIO.whatsapp}` + (t ? `?text=${encodeURIComponent(t)}` : '');
