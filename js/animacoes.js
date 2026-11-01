/* =========================================================
   ANIMAÇÕES — GSAP + ScrollTrigger + ScrollSmoother + SplitText
   Cada efeito é uma função; todas são chamadas em
   iniciarAnimacoes(), no final do arquivo.
   ========================================================= */

// Elementos que recebem o efeito de "cortina" (imagem revelada de baixo para cima)
const IMAGENS_REVELADAS = ".historia__main, .historia__strip figure, .mundo__item, .destaque";

// Textos que sobem suavemente ao entrar na tela
const TEXTOS_REVELADOS = ".section .eyebrow, .interlude .eyebrow, .historia__text p:not(.eyebrow), .section__lead";

// Tempo máximo do preloader: internet lenta não pode prender o visitante
const PRELOADER_MAXIMO = 6000;

/* ---------------------------------------------------------
   PRELOADER: conta imagens, vídeo e fontes carregados.
   Resolve quando tudo chegou (ou quando o tempo máximo acaba).
   --------------------------------------------------------- */
function carregarPagina() {
  const barra = document.getElementById("preloader-barra");
  const pct = document.getElementById("preloader-pct");
  const video = document.querySelector(".hero__video");

  // Promise que resolve no primeiro dos eventos (erro também conta, para não travar)
  const esperar = (el, eventos) => new Promise((ok) => {
    eventos.forEach((evento) => el.addEventListener(evento, ok, { once: true }));
  });

  // null = já estava carregado
  const recursos = [
    ...[...document.images].map((img) => (img.complete ? null : esperar(img, ["load", "error"]))),
    video.readyState >= 2 ? null : esperar(video, ["loadeddata", "error"]),
    document.fonts.ready,
  ];

  const total = recursos.length;
  const progresso = { valor: 0 };
  let carregados = recursos.filter((r) => r === null).length;

  const atualizarContador = (alvo, duracao = 0.4) => gsap.to(progresso, {
    valor: alvo,
    duration: duracao,
    ease: "power2.out",
    overwrite: true,
    onUpdate: () => {
      pct.textContent = `${Math.round(progresso.valor)}%`;
      gsap.set(barra, { scaleX: progresso.valor / 100 });
    },
  });

  atualizarContador((carregados / total) * 100);
  recursos.filter(Boolean).forEach((r) => r.then(() => {
    carregados++;
    atualizarContador((carregados / total) * 100);
  }));

  const tudoPronto = Promise.all(recursos);
  const limite = new Promise((ok) => setTimeout(ok, PRELOADER_MAXIMO));

  // Sempre termina em 100% antes de abrir a página
  return Promise.race([tudoPronto, limite]).then(() => {
    atualizarContador(100, 0.4);
    return new Promise((ok) => setTimeout(ok, 450));
  });
}

/* ---------------------------------------------------------
   PRELOADER: sobe como uma cortina e libera o scroll
   --------------------------------------------------------- */
function sairDoPreloader() {
  return gsap.timeline({
    onComplete: () => document.getElementById("preloader").remove(),
  })
    .to(".preloader__logo, .preloader__barra, .preloader__pct", {
      autoAlpha: 0, y: -20, duration: 0.5, stagger: 0.05, ease: "power2.in",
    })
    .to("#preloader", { yPercent: -100, duration: 1.1, ease: "expo.inOut" }, "-=0.1")
    .add(() => document.documentElement.classList.remove("is-loading"), "<");
}

/* ---------------------------------------------------------
   SCROLL SUAVE + links âncora passando pelo ScrollSmoother
   --------------------------------------------------------- */
function criarScrollSuave() {
  const smoother = ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 0.8,
  });

  // O scroll nativo "smooth" do CSS brigaria com o ScrollSmoother
  document.documentElement.style.scrollBehavior = "auto";

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (evento) => {
      const alvo = document.querySelector(link.getAttribute("href"));
      if (!alvo) return;
      evento.preventDefault();
      smoother.scrollTo(alvo, true, "top top");
    });
  });
}

/* ---------------------------------------------------------
   BARRA DE PROGRESSO no topo
   --------------------------------------------------------- */
function animarProgresso() {
  gsap.to(".progresso", {
    scaleX: 1,
    ease: "none",
    scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
  });
}

/* ---------------------------------------------------------
   NAV: some ao rolar para baixo, volta ao rolar para cima
   --------------------------------------------------------- */
function animarNav() {
  const esconder = gsap.to("#nav", { yPercent: -100, duration: 0.4, ease: "power2.out", paused: true });

  ScrollTrigger.create({
    start: "top -200",
    end: "max",
    onUpdate: (self) => (self.direction === 1 ? esconder.play() : esconder.reverse()),
    onLeaveBack: () => esconder.reverse(),
  });
}

/* ---------------------------------------------------------
   HERO: intro cinematográfica + parallax ao rolar
   --------------------------------------------------------- */
function animarHero(atraso = 0) {
  const titulo = SplitText.create(".hero__title-top", { type: "chars", mask: "chars" });

  gsap.set(".nav, .hero__content, .hero__scroll", { visibility: "visible" });

  gsap.timeline({ delay: atraso, defaults: { ease: "expo.out" } })
    .from(".hero__video", { scale: 1.25, duration: 2.6, ease: "power3.out" }, 0)
    .from(titulo.chars, { yPercent: 110, duration: 1.2, stagger: 0.05 }, 0.3)
    .from(".hero__title-bottom", { autoAlpha: 0, letterSpacing: "0.6em", duration: 1.6, ease: "power3.out" }, 0.6)
    .from(".hero__content .eyebrow, .hero__lead", { autoAlpha: 0, y: 24, duration: 1.2, stagger: 0.15 }, 0.9)
    .from(".nav", { autoAlpha: 0, y: -20, duration: 1 }, 1.1)
    .from(".hero__scroll", { autoAlpha: 0, duration: 1 }, 1.3);

  // Ao rolar: o texto sobe e some, o vídeo desce mais devagar (profundidade)
  const scrub = { trigger: ".hero", start: "top top", end: "bottom top", scrub: true };
  gsap.to(".hero__content", { y: -140, autoAlpha: 0, ease: "none", scrollTrigger: scrub });
  gsap.to(".hero__video", { yPercent: 25, ease: "none", scrollTrigger: scrub });
  gsap.to(".hero__scroll", { autoAlpha: 0, ease: "none", scrollTrigger: { ...scrub, end: "20% top" } });
}

/* ---------------------------------------------------------
   TÍTULOS: linhas surgem de dentro de uma máscara
   --------------------------------------------------------- */
function animarTitulos() {
  document.querySelectorAll(".section__title, .interlude__title").forEach((titulo) => {
    SplitText.create(titulo, {
      type: "lines",
      mask: "lines",
      autoSplit: true, // refaz a divisão se a largura mudar
      onSplit: (self) => gsap.from(self.lines, {
        yPercent: 110,
        duration: 1,
        stagger: 0.1,
        ease: "expo.out",
        scrollTrigger: { trigger: titulo, start: "top 92%", once: true },
      }),
    });
  });
}

/* ---------------------------------------------------------
   TEXTOS: sobem e aparecem em grupo
   --------------------------------------------------------- */
function animarTextos() {
  gsap.set(TEXTOS_REVELADOS, { autoAlpha: 0, y: 30 });

  ScrollTrigger.batch(TEXTOS_REVELADOS, {
    start: "top 95%",
    once: true,
    onEnter: (lote) => gsap.to(lote, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, ease: "power3.out" }),
  });
}

/* ---------------------------------------------------------
   IMAGENS: cortina de baixo para cima + zoom saindo
   --------------------------------------------------------- */
function animarImagens() {
  document.querySelectorAll(IMAGENS_REVELADAS).forEach((bloco) => {
    const img = bloco.querySelector("img");
    // Itens lado a lado entram em sequência
    const atraso = ([...bloco.parentElement.children].indexOf(bloco) % 3) * 0.08;

    gsap.set(bloco, { clipPath: "inset(100% 0% 0% 0%)" });
    gsap.set(img, { scale: 1.15, transition: "none" });

    gsap.timeline({
      scrollTrigger: { trigger: bloco, start: "top bottom", once: true },
      // devolve o controle ao CSS para o zoom do hover funcionar
      onComplete: () => gsap.set(img, { clearProps: "transform,transition" }),
    })
      .to(bloco, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "power3.out" }, atraso)
      .to(img, { scale: 1, duration: 1.2, ease: "power3.out" }, atraso);
  });
}

/* ---------------------------------------------------------
   INTERLÚDIO: parallax no pôr do sol
   --------------------------------------------------------- */
function animarInterludio() {
  gsap.fromTo(".interlude img",
    { yPercent: -10, scale: 1.2 },
    {
      yPercent: 10,
      ease: "none",
      scrollTrigger: { trigger: ".interlude", start: "top bottom", end: "bottom top", scrub: true },
    });
}

/* ---------------------------------------------------------
   GALERIA: cards entram em cascata
   --------------------------------------------------------- */
function animarGaleria() {
  gsap.set(".galeria__card", { autoAlpha: 0, y: 40 });

  ScrollTrigger.batch(".galeria__card", {
    start: "top bottom",
    once: true,
    onEnter: (lote) => gsap.to(lote, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.05, ease: "power3.out" }),
  });
}

/* ---------------------------------------------------------
   FOOTER: a frase "acende" palavra por palavra conforme o scroll
   --------------------------------------------------------- */
function animarFooter() {
  const frase = SplitText.create(".footer__quote p", { type: "words" });

  gsap.from(frase.words, {
    opacity: 0.12,
    stagger: 0.1,
    ease: "none",
    scrollTrigger: { trigger: ".footer__quote", start: "top 85%", end: "bottom 50%", scrub: true },
  });

  gsap.from(".footer__quote cite", {
    autoAlpha: 0,
    y: 20,
    duration: 1,
    ease: "power3.out",
    scrollTrigger: { trigger: ".footer__quote cite", start: "top 90%", once: true },
  });
}

/* ---------------------------------------------------------
   INICIALIZAÇÃO
   --------------------------------------------------------- */
function iniciarAnimacoes() {
  const raiz = document.documentElement;

  // Sem GSAP (CDN fora do ar) ou com "reduzir movimento": página estática, sem preloader
  if (!window.gsap || !raiz.classList.contains("js-anim")) {
    raiz.classList.remove("js-anim", "is-loading");
    return;
  }

  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

  // O preloader também espera as fontes, então o SplitText mede as linhas certas
  carregarPagina().then(() => {
    criarScrollSuave();
    animarProgresso();
    animarNav();
    animarTitulos();
    animarTextos();
    animarImagens();
    animarInterludio();
    animarGaleria();
    animarFooter();

    sairDoPreloader();
    animarHero(0.7); // começa enquanto a cortina do preloader sobe
  });
}

iniciarAnimacoes();
