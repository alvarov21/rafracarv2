# Prompt · Replicar la web de catálogo + panel de gestión (plantilla Rafracar)

> Pega este documento entero en el agente (Claude Code, Antigravity…). Rellena antes los campos entre `[corchetes]` de la sección 1. Si el agente tiene acceso a GitHub, que parta del repositorio `alvarov21/rafracarv2`: es la versión que ya funciona.

---

## 0. Qué hay que construir

Una web para un negocio local que vende productos de un catálogo que cambia cada semana (coches, motos, caravanas, maquinaria, inmuebles, muebles…), más un panel privado para que el dueño lo gestione desde el móvil.

1. **Web pública:** muestra todo el catálogo actual de un vistazo, con una página propia y bien posicionada en Google para cada artículo.
2. **Panel `/admin`:** el dueño sube artículos con fotos desde el móvil en 2 minutos y cambia su estado (Disponible · Reservado · Vendido) con un toque. Los cambios se ven en la web al momento.
3. **Formulario de petición a medida** («Coche a la carta» en Rafracar): el cliente pide lo que no encuentra. La petición llega por email al dueño y queda guardada en el panel.

La referencia de estilo es **balbasgarage.es**, ligeramente menos premium: minimalista, elegante, con aspecto de hecha a mano por un diseñador y no de plantilla de IA.

Base de código: **clona `alvarov21/rafracarv2` y adáptalo**. No lo reescribas desde cero.

---

## 1. Datos del nuevo negocio (rellenar)

```
Nombre comercial:          [ ]
Razón social (pie):        [ ]
Sector / qué vende:        [ej. motos de ocasión y taller]
Ciudad y provincia:        [ ]
Dirección:                 [ ]
Teléfono (visible):        [ ]
WhatsApp (34 + número):    [ ]
Horario:                   [ ]
Instagram / redes:         [ ]
Email que recibe las peticiones: [ ]
Email(s) con acceso al panel:    [ ]
Logo:                      [archivo PNG/SVG]
Foto de portada:           [foto real del local, mejor con el dueño y el producto]
Colores de marca:          [principal / acento, sacados del logo]
Servicios extra:           [financiación, taller, tasación, búsqueda a la carta…]
Dominio (si lo hay):       [ ]
```

---

## 2. Stack

- **Next.js 15 (App Router)**, JavaScript (sin TypeScript), sin librerías de UI y con CSS propio en `app/globals.css`.
- **Supabase**: base de datos Postgres, almacén de fotos e inicio de sesión. Cliente `@supabase/supabase-js` v2. Ninguna otra dependencia.
- **Vercel**: despliegue automático en cada push a `main`.
- **FormSubmit** (`https://formsubmit.co/ajax/<email>`) para el aviso por email del formulario. Se activa con el primer envío: llega un email «Activate FormSubmit», que suele caer en Spam.
- Fuentes desde Google Fonts con `<link>` en `app/layout.js`, no con `next/font`.

Estructura del repo:

```
app/
  layout.js            metadatos globales, fuentes, JSON-LD AutoDealer/LocalBusiness
  globals.css          todo el diseño (variables de color al principio)
  page.js              portada
  stock/page.js        catálogo con filtros
  coche/[slug]/page.js ficha de artículo (renombrar la ruta según sector, ej. /moto/[slug])
  admin/               panel (page.js, layout.js, admin.css)
  api/revalidate/route.js  refresca la web al guardar en el panel
  sitemap.js, robots.js, manifest.js, not-found.js
components/            Site (Header/Footer/MobileBar/Reveal), CarCard, Carousel, Gallery, StockList, CartaForm
lib/
  config.js            datos del negocio, URL y clave pública de Supabase, opciones de campos, helper wa()
  cars.js              lectura de datos y helpers (slug, precio, km…)
supabase/
  schema.sql           tablas, permisos, bucket de fotos
  solicitudes.sql      tabla del formulario
  seed-demo.sql        artículos de demo
public/img/            logo, favicon, iconos de la app, foto de portada
```

**Todo lo que cambia de un negocio a otro tiene que estar en `lib/config.js`, en las variables de `app/globals.css`, en los textos de `app/page.js` y en `public/img/`.**

---

## 3. Diseño (sistema visual)

**Estilo:** minimalista y editorial, como balbasgarage.es. Mucho aire, tipografía protagonista, fotos grandes y líneas finas. Prohibido: degradados llamativos, iconos por todas partes, emojis, sombras fuertes, «tarjetas dentro de tarjetas», textos de relleno.

**Tipografía**
- Títulos: *Playfair Display* 300 (cursiva solo en una palabra del titular de portada), interletrado −0,025em.
- Texto y menús: *Inter* 400/500.
- Las etiquetas pequeñas sobre cada título van en mayúsculas, a 12 px, con interletrado 0,2em y en el color de acento.

**Color** (variables CSS; cambiar por la marca del cliente)

```
--bg #0a1324 (fondo principal; en Rafracar azul marino)
--bg-2 #0d1830 (secciones alternas)   --card #111e38   --card-2 #14223f
--line #1c2b4a   --line-2 #2a3c60
--text #f5f7fb   --muted #b4c0d4   --dim #7d8ca8
--sky #8ec5ff (acento)   --sky-2 #cfe5ff (acento claro)
```

El acento se usa solo en detalles: etiquetas pequeñas, la rayita bajo los títulos, los números de pasos, el filtro activo y la etiqueta de estado. Los botones son blancos o con borde blanco.

**Componentes clave**
- **Tarjeta de artículo** (como Balbás): foto 4:3 arriba; abajo, el nombre en serif 18 px, una línea gris con año · km · cambio y el precio en una pastilla blanca pequeña (14 px, radio 12 px). Radio de la tarjeta 12 px. Si está vendido, foto en gris y precio tachado o «Vendido».
- **Botones:** rectángulos de 48 px de alto, texto en mayúsculas de 12 px con interletrado 0,18em, blancos o con borde de 1 px.
- **Cabecera:** el logo a la izquierda (PNG con fondo transparente, adaptado al fondo oscuro) y el menú en mayúsculas pequeñas. Es transparente sobre la portada y se vuelve sólida con desenfoque al hacer scroll.
- **Barra fija en el móvil:** Llamar | WhatsApp.
- **Animación:** solo un fundido suave al entrar en pantalla (`.reveal`). Respetar `prefers-reduced-motion`.

---

## 4. Web pública: páginas y secciones

### Portada `/`
1. **Hero a pantalla completa:**
   - Foto real del local a máxima calidad, con degradado del color de fondo desde la izquierda.
   - Texto alineado a la izquierda, con eyebrow («Concesionario en [ciudad]»), titular de 2 líneas, subtítulo y botones «Ver stock» y «[Servicio a la carta]».
   - En móvil: foto arriba (60 % de la altura) y texto debajo.
2. **Destacados:** carrusel con flechas de los artículos destacados o los más recientes, y el botón «Ver todo el stock».
3. **Servicio a la carta:**
   - A la izquierda: título, texto y 4 pasos numerados del 01 al 04.
   - A la derecha: el **formulario** (sección 6).
4. **Servicio 2** (financiación, taller…): título, texto, lista con líneas finas, botón a WhatsApp y una banda de 3 valores en mayúsculas.
5. **Sobre nosotros:** foto 4:5, texto cercano y firma «— [Negocio], [ciudad]».
6. **Entregados / clientes:** los últimos artículos vendidos (salen solos), con enlace a Instagram.
7. **Contacto:** dirección, teléfono, horario, botones WhatsApp y «Cómo llegar», y mapa de Google embebido y teñido con CSS.
8. **Pie:** logo, navegación, contacto y textos legales.

### Catálogo `/stock`
- Cabecera centrada y barra de filtros fija:
  - buscador de texto;
  - desplegables de marca, cambio (o el campo equivalente del sector), precio máximo y orden;
  - etiquetas de tipo y combustible (o equivalentes).
- Contador de «N disponibles», casilla «Mostrar vendidos» y cuadrícula de 4 columnas (3, 2 y 1 según el ancho de pantalla).
- Si no hay resultados: «Ahora mismo no lo tenemos, te lo buscamos» con botón a WhatsApp.

### Ficha `/coche/[slug]` (renombrar según sector)
- Galería grande 16:9 con flechas, gesto de deslizar en móvil, contador y miniaturas.
- Línea de datos clave, título en serif, versión, descripción y una tabla de 9 datos con líneas finas. Lista de equipamiento a 2 columnas.
- Caja lateral fija con el precio grande, «Precio al contado · Financiación disponible» y los botones «Solicitar información» (WhatsApp con el artículo y el precio ya escritos) y «Llamar».
- Avisos según el estado: si está reservado, «Te avisamos si se libera»; si está vendido, «Buscadme uno parecido».
- Al final, «Artículos parecidos».
- La URL se genera de forma limpia: `marca-modelo-año-id`. Si alguien entra con un slug antiguo, se redirige con un 301 al correcto.

---

## 5. Panel `/admin` (para el móvil)

- **Acceso:** email y contraseña de Supabase. La sesión se recuerda y solo hay que entrar una vez. Si la cuenta no está en `admins`, se muestra «no tiene permiso».
- **Instalable como app:** `manifest.js` con `start_url /admin`, iconos de 192 y 512 (el logo sobre el color de fondo) y `appleWebApp`. Se instala con «Añadir a pantalla de inicio».
- **Pestañas superiores:** **Artículos** | **Solicitudes** (con contador de pendientes).
- **Artículos:**
  - Botón grande «+ Añadir».
  - Pestañas Disponibles / Reservados / Vendidos, con contador.
  - Buscador si hay más de 6.
  - Cada fila muestra miniatura, nombre, año y km, precio, una ★ para destacarlo en portada (un toque) y un selector de 3 botones **Disponible · Reservado · Vendido** (un toque, actualización optimista, aviso de confirmación).
- **Alta y edición:**
  - Fotos desde la cámara o la galería, varias a la vez. **Se comprimen en el móvil** antes de subir (canvas, máximo 1600 px, JPEG 0,82, respetando la orientación). Se pueden reordenar con flechas y la primera es la portada.
  - Campos: texto para marca (con sugerencias), modelo y versión; numéricos con teclado numérico para precio, km, año y potencia; etiquetas para combustible, cambio, carrocería y etiqueta DGT (adaptar al sector); descripción y equipamiento (uno por línea); estado y destacado.
  - Botón fijo abajo, «Publicar» o «Guardar», que muestra el progreso («Subiendo fotos 2/5…»).
  - Para borrar hay que pulsar dos veces (sin `window.confirm`), y se borran también sus fotos del almacén.
- **Solicitudes:** tarjetas con lo que busca, nombre, teléfono, preferencias y comentarios, y botones Llamar, WhatsApp (con el mensaje ya escrito) y «Atendida ✓».
- **Después de guardar:** el panel llama a `POST /api/revalidate` con el token del usuario. Esa ruta comprueba `is_admin()` en Supabase y ejecuta `revalidatePath('/', 'layout')`.
- **Clases CSS con prefijo `pn-`.** Nunca `ad-`: los bloqueadores de anuncios ocultan esos elementos.

---

## 6. Formulario de petición a medida

- **Campos:**
  - Qué busca (obligatorio).
  - Presupuesto, en rangos.
  - Combustible y cambio, con «Indiferente» por defecto.
  - Nombre y teléfono (obligatorios).
  - Email.
  - Comentarios.
  - Casilla de consentimiento RGPD (obligatoria).
  - Campo oculto trampa contra bots.
- **Al enviar:**
  1. Se guarda en la tabla `solicitudes` de Supabase (inserción pública permitida, lectura solo para admins).
  2. Se envía por email con `fetch` a `https://formsubmit.co/ajax/<emailSolicitudes>`:
     - en JSON, con `_subject`, `_template: 'table'` y `_captcha: 'false'`;
     - con `_replyto` si el cliente dejó email;
     - y con un enlace `wa.me` al teléfono del cliente.
  3. Si se ha guardado o se ha enviado, se muestra «Gracias, [nombre]…». Si fallan las dos cosas, se muestra el error con un enlace a WhatsApp.

---

## 7. Base de datos (Supabase)

Ejecutar en el SQL Editor `supabase/schema.sql`, `supabase/solicitudes.sql` y, opcionalmente, `seed-demo.sql`. Resumen:

- `admins(email)` y la función `is_admin()` (`security definer`), que compara `auth.jwt()->>'email'`.
- `coches` (renombrar según el sector), con estos campos:
  - `id`, `created_at`, `updated_at`;
  - `marca`, `modelo`, `version`, `anio`, `km`, `cv`;
  - `combustible`, `cambio`, `etiqueta`, `tipo`, `color`, `precio`;
  - `estado` (con un `check` que solo admite disponible, reservado o vendido);
  - `destacado`, `descripcion`, `equipamiento`;
  - `fotos text[]` y `vendido_at`.
  - Un trigger rellena `updated_at` y `vendido_at`.
- **Permisos (RLS) de `coches`:** cualquiera puede leer; solo `is_admin()` puede crear, editar o borrar.
- **Bucket público `coches`** (máximo 5 MB; jpeg, png y webp). Solo los admins pueden subir, cambiar o borrar fotos.
- `solicitudes`: cualquiera puede insertar con `atendida = false`; solo los admins pueden leer, editar o borrar.
- **Dar acceso:**
  1. En Authentication → Add user, crear el usuario con «Auto Confirm». La contraseña la pone el dueño o Álvaro, nunca el agente.
  2. Ejecutar `insert into admins(email) values ('...')`.
- **Comprobación de seguridad:** con la clave pública y sin sesión, un `PATCH` a `coches` tiene que afectar a 0 filas.

**Límite:** el plan gratuito de Supabase permite 2 proyectos activos por organización y la de Potencia tu Negocio ya los tiene ocupados. Antes de crear el proyecto del nuevo cliente, decide: pasar la organización a Pro, o adaptar el esquema para que varios negocios compartan proyecto (columna `negocio_id` en todas las tablas y filtrar por ella).

---

## 8. SEO

- `metadata` por página. En la ficha, el título es «[Marca Modelo Versión Año] en venta en [ciudad] | [Negocio]», con una descripción que incluya el precio, los km y la ciudad.
- JSON-LD: `AutoDealer` (o el `LocalBusiness` del sector) en el layout y `Car` (o `Product`) con `Offer` en cada ficha. La disponibilidad sale del estado: InStock, LimitedAvailability o SoldOut.
- `sitemap.xml` dinámico con todas las fichas (prioridad más baja para las vendidas) y `robots.txt` que bloquee `/admin` y `/api`.
- La portada y el catálogo se refrescan cada 60 s, y al momento cuando se guarda desde el panel.
- Las imágenes llevan un `alt` descriptivo («[Marca Modelo] en venta en [ciudad]»).
- `SITE_URL` en `lib/config.js` apunta al dominio final.
- Prometer método, nunca posiciones: nada de «primeros en Google».

---

## 9. Pasos para montar el nuevo cliente

1. Clonar `rafracarv2` en un repo nuevo (`[cliente]-web`).
2. `lib/config.js`: datos del negocio, `emailSolicitudes`, `SITE_URL` y las opciones de campos del sector.
3. `app/globals.css`: variables de color de la marca.
4. `public/img/`:
   - logo recortado con fondo transparente, en dos versiones (para fondo oscuro y la original);
   - favicon e iconos de 192 y 512;
   - foto de portada a resolución completa.
5. `app/page.js`: textos de la portada, los servicios y «Sobre nosotros».
6. Si el sector no es de coches: renombrar la ruta de la ficha y adaptar los campos (tabla, formulario del panel, ficha, filtros, JSON-LD).
7. Supabase: crear el proyecto (región Europa, con «automatic RLS» activado), ejecutar los SQL y copiar la URL y la clave publicable a `lib/config.js`.
8. Vercel: importar el repo (Next.js, sin variables obligatorias) y desplegar.
9. Crear el usuario admin e insertarlo en `admins`.
10. Hacer un envío del formulario y activar FormSubmit en el email del destinatario. Revisar Spam y marcarlo como «No es spam».
11. Probar en el móvil:
    - entrar al panel;
    - subir un artículo con 3 fotos;
    - marcarlo como vendido;
    - comprobar que la web cambia al momento;
    - borrarlo.
12. Antes de entregar:
    - quitar los artículos y fotos de demo;
    - poner los textos legales (aviso legal, privacidad, cookies);
    - comprobar que la dirección es la misma que en Google Maps;
    - conectar el dominio.

---

## 10. Criterios de aceptación

- [ ] La web carga en móvil con Lighthouse ≥ 90 en Rendimiento, SEO y Accesibilidad.
- [ ] Subir un artículo desde el móvil lleva menos de 2 minutos y aparece en la web sin esperar.
- [ ] Cambiar el estado es un solo toque y se refleja en la web y en «Entregados».
- [ ] Sin sesión no se puede modificar nada (comprobado con la clave pública).
- [ ] El formulario guarda la petición y llega por email.
- [ ] Cada ficha tiene título y descripción propios, JSON-LD válido y aparece en el sitemap.
- [ ] Ningún elemento del panel desaparece con un bloqueador de anuncios activo.
- [ ] El diseño respeta la sección 3: sin degradados llamativos, iconos de relleno ni aspecto de plantilla.
