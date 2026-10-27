/* ==========================================================================
   VERDEAGUA BEBÉS · ROPA DE BEBÉ Y NIÑOS
   Único archivo de JavaScript.

   QUÉ HACE ESTE ARCHIVO
   1. Abre y cierra el menú en celular
   2. Filtra las prendas por categoría
   3. Abre y cierra los paneles de preguntas frecuentes
   4. Marca el header cuando bajás en la página
   5. Escribe el año actual en el footer
   6. Datos de contacto en un solo lugar (WhatsApp e Instagram)
   7. Ventana de detalle al tocar una prenda
   8. Aparición suave al hacer scroll y botón de WhatsApp que se esconde en el footer

   No hay código dentro del HTML: todo el comportamiento vive acá.
   La plantilla original usaba onclick="menuToggle()" pegado en la etiqueta
   de la imagen. Acá se registra desde este archivo, que es la forma
   recomendada: si mañana cambiás el HTML, no rompés el comportamiento.
   ========================================================================== */

(function () {
  "use strict";

  // ---- Configuración: cambiá estos datos y se actualiza toda la web ----
  const WHATSAPP = "5493512104992";   // 54 9 + área + número, sin "+" ni espacios
  const INSTAGRAM = "verdeagua.bebes";     // usuario, sin "@"
  // -----------------------------------------------------------------------

  const waLink = function (texto) {
    return "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(texto);
  };

  // Todo enlace con data-wa="mensaje" se arma acá: el número vive en una sola línea.
  // (Los botones de cada prenda los genera el script de sincronización con su propio enlace.)
  document.querySelectorAll("[data-wa]").forEach(function (a) {
    a.href = waLink(a.dataset.wa);
  });
  document.querySelectorAll("[data-instagram]").forEach(function (a) {
    a.href = "https://www.instagram.com/" + INSTAGRAM + "/";
    a.textContent = "@" + INSTAGRAM;
  });


  /* ------------------------------------------------------------------------
     1. MENÚ MÓVIL
     ------------------------------------------------------------------------ */
  const burger = document.getElementById("burger");
  const nav = document.getElementById("navMenu");
  const backdrop = document.getElementById("backdrop");
  const fuera = [document.getElementById("main"), document.querySelector(".site-footer"), document.getElementById("waFloat")];

  if (burger && nav) {

    const setMenu = function (open) {
      nav.classList.toggle("is-open", open);
      if (backdrop) backdrop.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
      // Con el menú abierto el resto de la página no recibe foco ni clics
      if (window.innerWidth <= 860) {
        fuera.forEach(function (el) {
          if (el) { if (open) el.setAttribute("inert", ""); else el.removeAttribute("inert"); }
        });
      }
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    };

    burger.addEventListener("click", function () {
      const isOpen = burger.getAttribute("aria-expanded") === "true";
      setMenu(!isOpen);
    });

    if (backdrop) backdrop.addEventListener("click", function () { setMenu(false); });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { setMenu(false); });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 860) setMenu(false);
    });
  }


  /* ------------------------------------------------------------------------
     2. FILTRO DE PRENDAS

     Cada prenda lleva en el HTML un atributo data-cat, y cada botón un
     data-filtro. Al tocar un botón se comparan los dos valores y se esconde
     lo que no coincide.

     Para agregar una categoría nueva:
       - sumá un botón   <button class="filtro" data-filtro="pijamas">…
       - y poné data-cat="pijamas" en las prendas correspondientes.
     No hace falta tocar este archivo.
     ------------------------------------------------------------------------ */
  const filtros = document.getElementById("filtros");
  const contenedorCards = document.getElementById("cards");
  const mensajeVacio = document.getElementById("cardsVacio");

  if (filtros && contenedorCards) {
    const botones = filtros.querySelectorAll(".filtro");
    const cards = contenedorCards.querySelectorAll(".card");

    const aplicarFiltro = function (categoria) {
      let visibles = 0;

      cards.forEach(function (card) {
        const entra = categoria === "todos" || card.dataset.cat === categoria;
        card.classList.toggle("is-hidden", !entra);
        if (entra) visibles++;
      });

      // Si el filtro no deja ninguna prenda, avisamos en vez de dejar
      // un hueco en blanco sin explicación.
      if (mensajeVacio) mensajeVacio.hidden = visibles > 0;
    };

    botones.forEach(function (boton) {
      boton.addEventListener("click", function () {
        botones.forEach(function (b) { b.classList.remove("is-active"); });
        boton.classList.add("is-active");
        aplicarFiltro(boton.dataset.filtro);
      });
    });

    // Al entrar se muestra "Conjuntos personajes". Se resuelve acá (no en el
    // HTML) porque los filtros los regenera el script de sincronización.
    // Si ese filtro no existe, queda "Todo".
    const inicial = filtros.querySelector('[data-filtro="conjuntos-personajes"]');
    if (inicial) inicial.click();
  }


  /* ------------------------------------------------------------------------
     3. ACORDEÓN DE PREGUNTAS FRECUENTES
     Al abrir un panel se cierran los demás.
     La altura se calcula sola, así que podés agregar o sacar texto sin
     tocar nada del código.
     ------------------------------------------------------------------------ */
  const accordion = document.getElementById("accordion");

  if (accordion) {
    const heads = accordion.querySelectorAll(".acc__head");

    const abrir = function (head) {
      const panel = document.getElementById(head.dataset.acc);
      if (!panel) return;
      head.setAttribute("aria-expanded", "true");
      panel.style.maxHeight = panel.scrollHeight + "px";
    };

    const cerrar = function (head) {
      const panel = document.getElementById(head.dataset.acc);
      if (!panel) return;
      head.setAttribute("aria-expanded", "false");
      panel.style.maxHeight = "0px";
    };

    heads.forEach(function (head) {
      head.addEventListener("click", function () {
        const estabaAbierto = head.getAttribute("aria-expanded") === "true";
        heads.forEach(cerrar);
        if (!estabaAbierto) abrir(head);
      });
    });

    // Deja abierto el que viene marcado como abierto en el HTML
    heads.forEach(function (head) {
      if (head.getAttribute("aria-expanded") === "true") abrir(head);
    });

    // Al cambiar el ancho, el texto ocupa otra altura: recalculamos
    window.addEventListener("resize", function () {
      heads.forEach(function (head) {
        if (head.getAttribute("aria-expanded") === "true") abrir(head);
      });
    });
  }


  /* ------------------------------------------------------------------------
     4. SOMBRA DEL HEADER AL BAJAR
     ------------------------------------------------------------------------ */
  const header = document.getElementById("siteHeader");

  if (header) {
    const onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 20);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }


  /* ------------------------------------------------------------------------
     5. AÑO EN EL FOOTER
     Se actualiza solo, no hace falta editarlo cada enero.
     ------------------------------------------------------------------------ */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------------
     7. VENTANA DE DETALLE
     Al tocar la foto de una prenda se abre un <dialog> con la foto grande,
     la descripción, los talles, el precio y el botón de pedido. Todo se lee
     de la tarjeta, así que al agregar una prenda no hay nada más que cargar.
     El botón "Pedir por WhatsApp" de la tarjeta sigue yendo directo al chat.
     ------------------------------------------------------------------------ */
  const detalle = document.getElementById("detail");

  if (detalle && contenedorCards && typeof detalle.showModal === "function") {
    const dImg = detalle.querySelector(".detail__img");
    const dTag = detalle.querySelector(".detail__tag");
    const dTitle = detalle.querySelector(".detail__title");
    const dDesc = detalle.querySelector(".detail__desc");
    const dTalles = detalle.querySelector(".detail__talles");
    const dPrice = detalle.querySelector(".detail__price");
    const dOrder = detalle.querySelector(".detail__order");

    // Las tarjetas las genera el script de sincronización, sin botón de zoom:
    // la foto se vuelve "botón" desde acá para que también funcione con teclado.
    contenedorCards.querySelectorAll(".card__media").forEach(function (m) {
      m.tabIndex = 0;
      m.setAttribute("role", "button");
      m.setAttribute("aria-haspopup", "dialog");
      m.setAttribute("aria-label", "Ver detalle de " + m.closest(".card").querySelector(".card__name").textContent);
      m.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); m.click(); }
      });
    });

    contenedorCards.addEventListener("click", function (e) {
      const card = e.target.closest(".card");
      if (!card || e.target.closest("a")) return;

      const img = card.querySelector(".card__media img");
      const tag = card.querySelector(".card__tag");
      const talles = card.querySelector(".talles");
      const pedir = card.querySelector(".btn");

      dImg.src = img.currentSrc || img.src;
      dImg.alt = img.alt;
      dTag.textContent = tag ? tag.textContent : "";
      dTag.hidden = !tag;
      dTitle.textContent = card.querySelector(".card__name").textContent;
      dDesc.textContent = card.querySelector(".card__desc").textContent;
      dTalles.innerHTML = talles ? talles.innerHTML : "";
      dTalles.hidden = !talles;
      dPrice.textContent = card.querySelector(".card__price").textContent;
      dOrder.href = pedir.href;

      document.body.classList.add("modal-open");
      detalle.showModal();
      detalle.scrollTop = 0;
    });

    detalle.querySelector(".detail__close").addEventListener("click", function () { detalle.close(); });
    detalle.addEventListener("click", function (e) { if (e.target === detalle) detalle.close(); });
    detalle.addEventListener("close", function () { document.body.classList.remove("modal-open"); });
  }


  /* ------------------------------------------------------------------------
     8. APARICIÓN SUAVE Y BOTÓN FLOTANTE
     Las secciones con clase .reveal aparecen al entrar en pantalla (si el
     visitante pidió menos movimiento, se ven directo). El botón de WhatsApp
     se esconde cuando se ve el footer, que ya tiene sus propios enlaces.
     ------------------------------------------------------------------------ */
  const reveals = document.querySelectorAll(".reveal");
  const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if ("IntersectionObserver" in window && !sinMovimiento) {
    const io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("is-visible");
          io.unobserve(entrada.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  const waFloat = document.getElementById("waFloat");
  const footer = document.querySelector(".site-footer");
  if (waFloat && footer && "IntersectionObserver" in window) {
    new IntersectionObserver(function (e) {
      waFloat.classList.toggle("is-hidden", e[0].isIntersecting);
    }).observe(footer);
  }

})();
