/* ==========================================================================
   VERDEAGUA BEBÉS · CARRITO
   Lógica de carrito adaptada de plexipedidos (carrito.js + whatsapp.js):
   estado guardado en localStorage, cantidad y observación por línea,
   total, datos del cliente con validación y pedido armado para WhatsApp.

   Las tarjetas las genera el script de sincronización con Plexi (con un botón
   "Pedir por WhatsApp" cada una). Este archivo las mejora al cargar: cambia ese
   botón por "Agregar al carrito" y toma nombre, precio y foto de la propia
   tarjeta, así que al re-sincronizar no hay que tocar nada.

   Se carga antes que index.js. Expone window.Carrito.agregarDesdeCard(card).
   ========================================================================== */

(function () {
  "use strict";

  // Mismo número que index.js (si lo cambiás allá, cambialo acá también)
  const WHATSAPP = "5493512104992";
  const LIMITE_ENLACE = 2000;           // largo máximo del enlace de WhatsApp
  const CLAVE = "carrito_verdeagua_bebes";
  const CLAVE_DATOS = "carrito_verdeagua_bebes_datos";

  let CARRITO = [];
  let datos = { nombre: "", telefono: "", entrega: "", direccion: "", pago: "" };

  const $ = function (id) { return document.getElementById(id); };
  const esc = function (t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  const dinero = function (n) { return "$" + n.toLocaleString("es-AR"); };


  /* ------------------------------------------------------------------------
     ESTADO
     ------------------------------------------------------------------------ */
  const guardar = function () {
    try { localStorage.setItem(CLAVE, JSON.stringify(CARRITO)); } catch (e) { /* sin almacenamiento: sigue en memoria */ }
  };
  const guardarDatos = function () {
    try { localStorage.setItem(CLAVE_DATOS, JSON.stringify(datos)); } catch (e) { /* idem */ }
  };

  const recuperar = function () {
    try {
      const g = JSON.parse(localStorage.getItem(CLAVE) || "[]");
      if (Array.isArray(g)) {
        CARRITO = g.filter(function (l) {
          return l && typeof l.id === "string" && typeof l.nombre === "string" &&
                 Number.isFinite(l.precio) && Number.isInteger(l.cantidad) && l.cantidad > 0;
        });
      }
      const d = JSON.parse(localStorage.getItem(CLAVE_DATOS) || "{}");
      if (d && typeof d === "object") {
        Object.keys(datos).forEach(function (k) { if (typeof d[k] === "string") datos[k] = d[k]; });
      }
    } catch (e) {
      CARRITO = [];
    }
  };

  const cantidadTotal = function () {
    return CARRITO.reduce(function (s, l) { return s + l.cantidad; }, 0);
  };
  const subtotalLinea = function (l) { return l.precio * l.cantidad; };
  const total = function () {
    return CARRITO.reduce(function (s, l) { return s + subtotalLinea(l); }, 0);
  };

  const agregar = function (prod) {
    // Mismo producto sin observación: suma cantidad. Con observación distinta
    // (otro talle, por ejemplo) queda como línea aparte, igual que en Plexi.
    const existente = CARRITO.find(function (l) { return l.id === prod.id && !l.obs; });
    if (existente) existente.cantidad += 1;
    else CARRITO.push({ id: prod.id, nombre: prod.nombre, precio: prod.precio, img: prod.img, cantidad: 1, obs: "" });
    guardar();
    actualizarContador();
  };

  const cambiarCantidad = function (i, nueva) {
    if (!CARRITO[i]) return;
    if (nueva <= 0) CARRITO.splice(i, 1);
    else CARRITO[i].cantidad = Math.min(nueva, 99);
    guardar();
  };


  /* ------------------------------------------------------------------------
     TARJETAS: de "Pedir por WhatsApp" a "Agregar al carrito"
     ------------------------------------------------------------------------ */
  const productoDeCard = function (card) {
    const img = card.querySelector(".card__media img");
    const precioTxt = card.querySelector(".card__price").textContent;
    const precio = parseInt(precioTxt.replace(/\D/g, ""), 10);
    if (!img || !Number.isFinite(precio)) return null;
    const src = img.getAttribute("src");
    return {
      id: src.split("/").pop().replace(/\.[a-z]+$/i, ""),
      nombre: card.querySelector(".card__name").textContent.trim(),
      precio: precio,
      img: src
    };
  };

  const avisar = function (texto) {
    const t = $("cartToast");
    if (!t) return;
    t.textContent = texto;
    t.classList.add("is-on");
    clearTimeout(avisar.timer);
    avisar.timer = setTimeout(function () { t.classList.remove("is-on"); }, 2200);
  };

  const agregarDesdeCard = function (card) {
    const prod = productoDeCard(card);
    if (!prod) return;
    agregar(prod);
    avisar("Agregado: " + prod.nombre);
  };

  const prepararCards = function () {
    document.querySelectorAll("#cards .card").forEach(function (card) {
      const viejo = card.querySelector("a.btn");
      if (!viejo || !productoDeCard(card)) return;
      const b = document.createElement("button");
      b.type = "button";
      b.className = "btn btn--verde btn--block";
      b.dataset.add = "";
      b.textContent = "Agregar al carrito";
      viejo.replaceWith(b);
    });

    const cards = $("cards");
    if (cards) cards.addEventListener("click", function (e) {
      const b = e.target.closest("[data-add]");
      if (!b) return;
      agregarDesdeCard(b.closest(".card"));
      b.classList.add("is-added");
      setTimeout(function () { b.classList.remove("is-added"); }, 600);
    });
  };


  /* ------------------------------------------------------------------------
     MENSAJE DE WHATSAPP (mismo formato que plexipedidos)
     ------------------------------------------------------------------------ */
  const armarMensaje = function () {
    const envio = datos.entrega === "envio";
    const out = ["Hola! Te hago este pedido:", ""];

    CARRITO.forEach(function (l, i) {
      out.push((i + 1) + ") " + l.nombre + " - " + l.cantidad + (l.cantidad === 1 ? " unidad" : " unidades") + " - " + dinero(subtotalLinea(l)));
      if (l.obs) out.push("   Obs: " + l.obs);
    });

    out.push("", "TOTAL: " + dinero(total()), "");
    out.push("Nombre: " + datos.nombre);
    out.push("Telefono: " + datos.telefono);
    out.push("Entrega: " + (envio ? "Necesito que me lo envien" : "Lo retiro personalmente"));
    if (envio && datos.direccion) out.push("Direccion: " + datos.direccion);
    out.push("Pago: " + (datos.pago === "transferencia" ? "Transferencia" : datos.pago === "mercadopago" ? "Mercado Pago" : "Efectivo"));
    return out.join("\n");
  };

  const enlace = function () {
    return "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(armarMensaje());
  };


  /* ------------------------------------------------------------------------
     PANEL DEL CARRITO (<dialog> como cajón lateral: Esc y foco ya vienen resueltos)
     ------------------------------------------------------------------------ */
  const panel = $("cart");
  const cuerpo = $("cartBody");

  const actualizarContador = function () {
    const n = cantidadTotal();
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = n;
      el.hidden = n === 0;
    });
    const btn = $("cartOpen");
    if (btn) btn.setAttribute("aria-label", "Abrir carrito (" + n + (n === 1 ? " prenda)" : " prendas)"));
  };

  const lineasHtml = function () {
    return CARRITO.map(function (l, i) {
      return '<div class="cart__line">' +
        '<img class="cart__img" src="' + esc(l.img) + '" alt="" width="64" height="80">' +
        '<div class="cart__info">' +
          '<div class="cart__name">' + esc(l.nombre) + '</div>' +
          '<div class="cart__unit">' + dinero(l.precio) + ' c/u</div>' +
          '<input class="cart__obs" type="text" maxlength="80" placeholder="Talle u observación" aria-label="Talle u observación de ' + esc(l.nombre) + '" value="' + esc(l.obs) + '" data-obs="' + i + '">' +
          '<div class="cart__row">' +
            '<div class="stepper">' +
              '<button type="button" data-act="menos" data-i="' + i + '" aria-label="Quitar uno">&minus;</button>' +
              '<span aria-live="polite">' + l.cantidad + '</span>' +
              '<button type="button" data-act="mas" data-i="' + i + '" aria-label="Sumar uno">+</button>' +
            '</div>' +
            '<strong class="cart__sub">' + dinero(subtotalLinea(l)) + '</strong>' +
          '</div>' +
          '<button type="button" class="cart__remove" data-act="quitar" data-i="' + i + '">Quitar</button>' +
        '</div>' +
      '</div>';
    }).join("");
  };

  const formHtml = function () {
    const ck = function (campo, v) { return datos[campo] === v ? " is-on" : ""; };
    return '' +
      '<div class="cart__block">' +
        '<div class="cart__field"><label for="c-nombre">Nombre <span class="req">*</span></label>' +
          '<input id="c-nombre" type="text" autocomplete="name" value="' + esc(datos.nombre) + '" data-campo="nombre"></div>' +
        '<div class="cart__field"><label for="c-tel">Teléfono <span class="req">*</span></label>' +
          '<input id="c-tel" type="tel" inputmode="numeric" autocomplete="tel" placeholder="Solo números" value="' + esc(datos.telefono) + '" data-campo="telefono"></div>' +
      '</div>' +
      '<div class="cart__block"><div class="cart__legend">Entrega <span class="req">*</span></div>' +
        '<div class="cart__opts">' +
          '<button type="button" class="cart__opt' + ck("entrega", "retiro") + '" data-opt="entrega" data-v="retiro">Lo retiro</button>' +
          '<button type="button" class="cart__opt' + ck("entrega", "envio") + '" data-opt="entrega" data-v="envio">Envío</button>' +
        '</div>' +
        '<div class="cart__field" id="c-dir-wrap"' + (datos.entrega === "envio" ? "" : " hidden") + ' style="margin-top:10px">' +
          '<label for="c-dir">Dirección <span class="req">*</span></label>' +
          '<input id="c-dir" type="text" autocomplete="street-address" placeholder="Calle, número, ciudad y provincia" value="' + esc(datos.direccion) + '" data-campo="direccion"></div>' +
      '</div>' +
      '<div class="cart__block"><div class="cart__legend">Forma de pago <span class="req">*</span></div>' +
        '<div class="cart__opts">' +
          '<button type="button" class="cart__opt' + ck("pago", "efectivo") + '" data-opt="pago" data-v="efectivo">Efectivo</button>' +
          '<button type="button" class="cart__opt' + ck("pago", "transferencia") + '" data-opt="pago" data-v="transferencia">Transferencia</button>' +
          '<button type="button" class="cart__opt' + ck("pago", "mercadopago") + '" data-opt="pago" data-v="mercadopago">Mercado Pago</button>' +
        '</div>' +
      '</div>' +
      '<div id="cartError" role="alert"></div>';
  };

  const dibujar = function () {
    if (!CARRITO.length) {
      cuerpo.innerHTML = '<div class="cart__empty"><p>Tu carrito está vacío.</p>' +
        '<button type="button" class="btn btn--linea" data-act="cerrar">Ver las prendas</button></div>';
      $("cartFoot").hidden = true;
      return;
    }
    cuerpo.innerHTML =
      '<div class="cart__tools"><button type="button" class="cart__clear" data-act="vaciar">Vaciar carrito</button></div>' +
      lineasHtml() + formHtml();
    $("cartFoot").hidden = false;
    actualizarTotal();
  };

  const actualizarTotal = function () {
    $("cartTotal").textContent = dinero(total());
  };

  const abrir = function () {
    dibujar();
    document.body.classList.add("modal-open");
    panel.showModal();
  };
  const cerrar = function () { panel.close(); };

  const validar = function () {
    const e = [];
    if (!datos.nombre.trim()) e.push("tu nombre");
    else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(datos.nombre)) e.push("tu nombre (solo letras)");
    if (!datos.telefono.trim()) e.push("tu teléfono");
    else if (!/^[0-9]+$/.test(datos.telefono)) e.push("tu teléfono (solo números)");
    if (!datos.entrega) e.push("la forma de entrega");
    if (datos.entrega === "envio" && !datos.direccion.trim()) e.push("la dirección");
    if (!datos.pago) e.push("la forma de pago");
    return e;
  };

  const enviar = function () {
    const caja = $("cartError");
    const errores = validar();
    if (errores.length) {
      caja.innerHTML = '<div class="cart__alert">Antes de seguir, completá ' + esc(errores.join(", ")) + ".</div>";
      caja.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (enlace().length > LIMITE_ENLACE) {
      caja.innerHTML = '<div class="cart__alert">El pedido es muy largo para enviarlo por WhatsApp de una vez. Dividilo en dos pedidos.</div>';
      return;
    }
    caja.innerHTML = "";
    // Con "noopener" window.open devuelve siempre null, así que se corta la relación a mano
    const v = window.open(enlace(), "_blank");
    if (v) v.opener = null;
    else window.location.href = enlace();
  };

  if (panel && cuerpo) {
    recuperar();
    prepararCards();
    actualizarContador();

    $("cartOpen").addEventListener("click", abrir);
    $("cartClose").addEventListener("click", cerrar);
    $("cartSend").addEventListener("click", enviar);
    panel.addEventListener("click", function (e) { if (e.target === panel) cerrar(); });
    panel.addEventListener("close", function () { document.body.classList.remove("modal-open"); });

    cuerpo.addEventListener("click", function (e) {
      const opt = e.target.closest("[data-opt]");
      if (opt) {
        datos[opt.dataset.opt] = opt.dataset.v;
        guardarDatos();
        $("cartError").innerHTML = "";
        opt.parentElement.querySelectorAll(".cart__opt").forEach(function (b) { b.classList.toggle("is-on", b === opt); });
        if (opt.dataset.opt === "entrega") $("c-dir-wrap").hidden = opt.dataset.v !== "envio";
        return;
      }
      const a = e.target.closest("[data-act]");
      if (!a) return;
      const i = Number(a.dataset.i);
      switch (a.dataset.act) {
        case "mas": cambiarCantidad(i, CARRITO[i].cantidad + 1); break;
        case "menos": cambiarCantidad(i, CARRITO[i].cantidad - 1); break;
        case "quitar": cambiarCantidad(i, 0); break;
        case "vaciar": CARRITO = []; guardar(); break;
        case "cerrar": cerrar(); return;
      }
      actualizarContador();
      // Se vuelve a dibujar conservando lo ya escrito en el formulario (está en `datos`)
      dibujar();
    });

    cuerpo.addEventListener("input", function (e) {
      const t = e.target;
      if (t.dataset.campo) $("cartError").innerHTML = "";
      if (t.dataset.obs !== undefined) {
        CARRITO[Number(t.dataset.obs)].obs = t.value.trim();
        guardar();
      } else if (t.dataset.campo) {
        if (t.dataset.campo === "telefono") t.value = t.value.replace(/\D/g, "");
        datos[t.dataset.campo] = t.value;
        guardarDatos();
      }
    });
  }

  window.Carrito = { agregarDesdeCard: agregarDesdeCard };
})();
