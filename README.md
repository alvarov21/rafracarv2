# Rafracar · Web de stock

Web de Rafracar Automóviles (Baena, Córdoba): portada, stock con filtros y ficha de cada coche. HTML, CSS y JavaScript en un solo archivo, sin dependencias ni build.

## Ver en local

```bash
python3 -m http.server 8000
```

Abre http://localhost:8000

## Editar el stock

Al principio del `<script>` de `index.html`:

- `NEGOCIO`: teléfono, WhatsApp, dirección, horario y fotos de portada (`heroImg`) y de "Sobre nosotros" (`sobreImg`).
- `STOCK`: un objeto por coche. `estado` puede ser `disponible`, `reservado` o `vendido`. Las fotos van en `img/` y se listan en `fotos: [...]`.

Los coches y las imágenes de `img/` son de demo: hay que sustituirlos por los reales.

## Publicar

Importa el repo en Vercel como proyecto estático (sin framework, sin comando de build).
