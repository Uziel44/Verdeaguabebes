/* ==========================================================================
   NUBE · ROPA DE BEBÉ Y NIÑOS
   Único archivo de JavaScript.

   QUÉ HACE ESTE ARCHIVO
   1. Abre y cierra el menú en celular
   2. Filtra las prendas por categoría
   3. Abre y cierra los paneles de preguntas frecuentes
   4. Marca el header cuando bajás en la página
   5. Escribe el año actual en el footer

   No hay código dentro del HTML: todo el comportamiento vive acá.
   La plantilla original usaba onclick="menuToggle()" pegado en la etiqueta
   de la imagen. Acá se registra desde este archivo, que es la forma
   recomendada: si mañana cambiás el HTML, no rompés el comportamiento.
   ========================================================================== */

(function () {
  "use strict";


  /* ------------------------------------------------------------------------
     1. MENÚ MÓVIL
     ------------------------------------------------------------------------ */
  const burger = document.getElementById("burger");
  const nav = document.getElementById("navMenu");

  if (burger && nav) {

    const setMenu = function (open) {
      nav.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    };

    burger.addEventListener("click", function () {
      const isOpen = burger.getAttribute("aria-expanded") === "true";
      setMenu(!isOpen);
    });

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

})();
