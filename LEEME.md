# Verdeagua Bebés · Ropa de bebé y niños

Landing page estática adaptada desde la plantilla RedStore. Tres archivos,
sin frameworks ni dependencias.

---

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | La estructura y todo el texto de la página |
| `index.css` | Todos los estilos, incluida la paleta |
| `index.js` | Contacto (WhatsApp/Instagram), menú móvil, filtro, detalle de prenda, acordeón, animaciones y año |
| `img/` | Las fotos. Leé `img/LEEME.txt` |
| `robots.txt` · `sitemap.xml` · `.nojekyll` | SEO y GitHub Pages |

---

## Qué cambié respecto a RedStore

| RedStore | Verdeagua Bebés | Por qué |
|---|---|---|
| jQuery + all.js + normalize.css | Ningún archivo externo | jQuery pesaba 90 KB y no se usaba para nada. El menú se resuelve en 15 líneas de JS común. |
| Estrellas de valoración | Chips de talles | Las estrellas eran inventadas. Los talles son un dato real y son lo que la clienta realmente necesita saber. |
| Logos de Google, Oppo, Philips, PayPal, Coca-Cola como "sponsors" | Eliminado | Decía que esas marcas eran clientes. Es falso y se nota. |
| Testimonios con Lorem ipsum | Bloque comentado en el HTML | Está listo para descomentar cuando tengas reseñas reales. |
| `onclick="menuToggle();"` en el HTML | Listener en `index.js` | Separar estructura de comportamiento. |
| Carrito sin backend | Botón a WhatsApp por prenda | No hay servidor. El botón abre el chat con el nombre de la prenda ya escrito. |
| Grilla fija de 12 productos | 6 prendas con filtro | Es tu catálogo real, con filtro por tipo de tela. |
| Sin guía de talles | Tabla completa 0-3m a 4 años | Es la pregunta número uno en ropa de bebé. |
| `lang="en"` con contenido en inglés | `lang="es"` | La tienda es argentina. |

---

## La paleta y por qué es así

Los tres pasteles pesan igual: **verde menta, celeste y rosa** conviven en
el hero, en los iconos de beneficios y en los detalles. Ninguno domina.

Eso es lo que hace que la tienda no se lea como "de nena" ni "de nene".
Si subís el rosa o bajás el verde, la percepción cambia enseguida.

El verde fuerte (`--verde`) es el color de acción de todos los botones —
elegido porque es el más neutro de los tres en la lectura cultural.

```css
--menta:   #C9E8D5;   /* pastel */
--cielo:   #CBE5F0;   /* pastel */
--rosa:    #F6D5DC;   /* pastel */
--verde:   #3F9E7E;   /* botones y links */
```

Todo está en `index.css`, en el bloque `:root` de arriba de todo.

---

## Cómo agregar una prenda

1. Guardá la foto cuadrada en `img/`, en minúscula y sin espacios.
2. En `index.html`, copiá un bloque `<article class="card">` entero.
3. Cambiá la foto, el nombre, la descripción, los talles, el precio y el
   `data-cat`.
4. Actualizá el texto del link de WhatsApp con el nombre de la prenda nueva.

**Para una categoría nueva** (por ejemplo "pijamas"):
- Sumá un botón: `<button class="filtro" data-filtro="pijamas">Pijamas</button>`
- Poné `data-cat="pijamas"` en las prendas que correspondan.

No hace falta tocar `index.js`: el filtro lee los atributos solo.

---

## Datos de contacto en un solo lugar

El número de WhatsApp y el Instagram se cambian **solo al principio de `index.js`**
(`WHATSAPP` e `INSTAGRAM`). Todos los botones de WhatsApp se arman desde ahí.
Cada prenda nueva necesita `data-wa-product="Nombre"` y `data-price="$24.900"` en su botón.

Al tocar la foto de una prenda se abre una ventana de detalle con foto grande,
descripción, talles y precio: lee todo de la tarjeta, no hay que cargar nada más.

## Antes de publicar

1. **Nombre de la marca.** El nombre es "Verdeagua Bebés". Si cambia, buscá con `Ctrl+H`
   y reemplazá si el negocio se llama distinto.
2. **Número de WhatsApp.** El `5493512345678` es de ejemplo: cambialo en `index.js` (y en `telephone` del bloque JSON-LD de `index.html`).
3. **Instagram.** `@nube.bebes` también es un marcador.
4. **Precios.** Los seis son estimados. Verificalos.
5. **Foto de `nosotros.jpg`.** Ahora es un bloque de color.
6. **Medidas de la tabla de talles.** Confirmalas con tu proveedor: si
   alguien compra mal por esa tabla, el cambio lo pagás vos.
7. **Envíos, pagos y plazo de cambio.** Están escritos en general en las
   preguntas frecuentes. Ajustalos a tu política real.
8. **`share-preview.jpg` y `favicon.png`.**
9. **La URL** aparece en el `<head>`, en el JSON-LD, en `robots.txt` y en `sitemap.xml`.

---

## Cómo probarla

Abrí `index.html` con doble clic. Funciona directo desde el disco.

Para verla en celular: clic derecho → Inspeccionar → ícono de teléfono.

---

## Cómo publicarla

1. Creá un repositorio nuevo en GitHub.
2. Subí todo con `index.html` en la raíz.
3. Settings → Pages → Deploy from a branch → main → /(root).

---

## Detalle útil

Cada botón "Pedir por WhatsApp" abre el chat con el nombre de la prenda ya
escrito y preguntando por talles. Vas a saber qué conjunto miraron antes de
leer el mensaje, y la clienta no tiene que explicar nada.
