/* =========================================================
   RED DEAD REDEMPTION 2 — SCRIPTS
   Cada recurso da página é uma função independente,
   chamada no final do arquivo.
   As animações (GSAP) ficam em js/animacoes.js.
   ========================================================= */

const CONFIG = {
  pastaPersonagens: "assets/img/personagens/galeria/",
};

/* ---------------------------------------------------------
   NAVEGAÇÃO: fundo ao rolar + link da seção ativa
   --------------------------------------------------------- */
function iniciarNavegacao() {
  const nav = document.getElementById("nav");
  const links = document.querySelectorAll(".nav__links a");

  const marcarScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
  marcarScroll();
  window.addEventListener("scroll", marcarScroll, { passive: true });

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      links.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${entrada.target.id}`);
      });
    });
  }, { rootMargin: "-50% 0px -50% 0px" });

  links.forEach((link) => {
    const secao = document.querySelector(link.getAttribute("href"));
    if (secao) observador.observe(secao);
  });
}

/* ---------------------------------------------------------
   GALERIA: monta os cards a partir de js/personagens.js
   --------------------------------------------------------- */
function montarGaleria() {
  const galeria = document.getElementById("galeria");

  galeria.innerHTML = PERSONAGENS.map(({ nome, arquivo }) => `
    <figure class="galeria__card">
      <img src="${CONFIG.pastaPersonagens}${arquivo}" alt="${nome}" decoding="async">
      <figcaption>${nome}</figcaption>
    </figure>
  `).join("");
}

/* ---------------------------------------------------------
   INICIALIZAÇÃO
   --------------------------------------------------------- */
iniciarNavegacao();
montarGaleria();
