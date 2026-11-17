# Rafracar · Web y gestión de stock

Web de Rafracar Automóviles (Baena, Córdoba) con stock en tiempo real y un panel para gestionarlo desde el móvil.

- **Web pública** (`/`, `/stock`, `/coche/[slug]`): Next.js en Vercel. Cada coche tiene su propia página generada en servidor, con título, descripción y datos estructurados para Google, y aparece en `sitemap.xml`.
- **Panel** (`/admin`): Rafa entra con email y contraseña, sube coches con fotos desde la cámara o la galería del móvil y cambia el estado (Disponible · Reservado · Vendido) con un toque. Los cambios se ven en la web al momento.
- **Datos**: Supabase (proyecto `rafracar`). Tabla `coches`, bucket de fotos `coches` y políticas de seguridad en `supabase/schema.sql`.

## Dar acceso a alguien al panel

1. Supabase → Authentication → Users → **Add user** → Create new user (email y contraseña, marcando *Auto Confirm User*).
2. Supabase → SQL Editor:
   ```sql
   insert into public.admins (email) values ('email@ejemplo.com');
   ```

Solo los emails de la tabla `admins` pueden crear, editar o borrar coches. La web pública solo puede leer.

## Instalar el panel en el móvil

Abrir `https://<dominio>/admin` en Safari → Compartir → **Añadir a pantalla de inicio**. Se abre como una app.

## Desarrollo local

```bash
npm install
npm run dev
```

Abre http://localhost:3000 (panel en http://localhost:3000/admin).

## Datos del negocio

Teléfono, WhatsApp, dirección, horario e imágenes de portada están en `lib/config.js`.

Los 10 coches iniciales son de demo (`supabase/seed-demo.sql`): bórralos desde el panel cuando estén los reales.
