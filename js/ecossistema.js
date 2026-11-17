/* =========================================================================
   Ecossistema: a janela do app da Mosaic.
   A lateral troca de projeto como na loja: a pílula desliza até o item e o
   conteúdo novo nasce coberto e se revela numa onda que sai do clique.
   Os vídeos só carregam e tocam quando estão na tela.
   ========================================================================= */

(function () {
  'use strict';

  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const app = document.getElementById('moApp');
  if (!app) return;
  const abas = Array.from(app.querySelectorAll('[role="tab"]'));
  const pilula = document.getElementById('moPilula');
  const conteudo = document.getElementById('moConteudo');

  function moverPilula(aba) {
    pilula.style.transform = `translateY(${aba.offsetTop}px)`;
    pilula.style.height = aba.offsetHeight + 'px';
  }

  function selecionar(aba, origem) {
    if (aba.getAttribute('aria-selected') === 'true') return;
    const painel = document.getElementById(aba.getAttribute('aria-controls'));
    abas.forEach((a) => {
      const sim = a === aba;
      a.setAttribute('aria-selected', String(sim));
      a.tabIndex = sim ? 0 : -1;
    });
    moverPilula(aba);

    const trocar = () => {
      app.querySelectorAll('[role="tabpanel"]').forEach((p) => { p.hidden = p !== painel; });
      painel.classList.remove('entrou');
      void painel.offsetWidth;
      painel.classList.add('entrou');
      conteudo.scrollTop = 0;
      tocarVisiveis();
    };

    if (!window.Pixels || reduzido) { trocar(); return; }
    /* A cortina cobre só a parte visível do conteúdo. */
    Pixels.revelarElemento(conteudo, {
      clienteX: origem && origem.x, clienteY: origem && origem.y, passo: 20,
      corCortina: getComputedStyle(document.documentElement).getPropertyValue('--mo-fundo').trim(),
      trocar,
    });
  }

  abas.forEach((aba) => {
    aba.addEventListener('click', (e) => {
      const r = conteudo.getBoundingClientRect();
      /* A onda sai da borda do conteúdo, na altura do clique. */
      selecionar(aba, { x: r.left + 1, y: Math.min(r.bottom - 1, Math.max(r.top + 1, e.clientY || r.top + 40)) });
    });
    aba.addEventListener('keydown', (e) => {
      const i = abas.indexOf(aba);
      let alvo = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') alvo = abas[(i + 1) % abas.length];
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') alvo = abas[(i - 1 + abas.length) % abas.length];
      if (e.key === 'Home') alvo = abas[0];
      if (e.key === 'End') alvo = abas[abas.length - 1];
      if (!alvo) return;
      e.preventDefault();
      alvo.focus();
      selecionar(alvo);
    });
  });

  const inicial = abas.find((a) => a.getAttribute('aria-selected') === 'true') || abas[0];
  requestAnimationFrame(() => moverPilula(inicial));
  window.addEventListener('resize', () => moverPilula(abas.find((a) => a.getAttribute('aria-selected') === 'true')));
  if (document.fonts) document.fonts.ready.then(() => moverPilula(abas.find((a) => a.getAttribute('aria-selected') === 'true')));

  /* ---------------------------------------------------------------------
     Vídeos: carregam perto da tela, tocam só quando visíveis
     --------------------------------------------------------------------- */
  const videos = Array.from(document.querySelectorAll('video[data-src]'));
  const vistos = new Set();

  function carregar(v) {
    if (v.dataset.carregado) return;
    v.dataset.carregado = '1';
    v.src = v.dataset.src;
    v.preload = 'auto';
  }
  function tocarVisiveis() {
    videos.forEach((v) => {
      const aparece = vistos.has(v) && v.offsetParent !== null;
      if (aparece) {
        carregar(v);
        if (!reduzido) v.play().catch(() => {});
      } else if (!v.paused) v.pause();
    });
  }
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => { if (e.isIntersecting) vistos.add(e.target); else vistos.delete(e.target); });
      tocarVisiveis();
    }, { rootMargin: '200px 0px' });
    videos.forEach((v) => io.observe(v));
  }
  /* Com movimento reduzido, o vídeo fica parado no pôster e toca no clique. */
  videos.forEach((v) => v.addEventListener('click', () => { carregar(v); if (v.paused) v.play().catch(() => {}); else v.pause(); }));

  /* ---------------------------------------------------------------------
     Temas do Mosaic OS
     --------------------------------------------------------------------- */
  const osQuadro = document.getElementById('osQuadro');
  const osImagem = document.getElementById('osImagem');
  const osLegenda = document.getElementById('osLegenda');
  const temas = Array.from(document.querySelectorAll('.tema-os'));
  /* A imagem animada (pesada) só entra quando o painel do OS aparece. */
  const abaOS = document.getElementById('aba-os');
  abaOS.addEventListener('click', () => {
    if (osImagem.dataset.src && !osImagem.dataset.carregado) {
      osImagem.dataset.carregado = '1';
      const pre = new Image();
      pre.onload = () => { osImagem.src = osImagem.dataset.src; };
      pre.src = osImagem.dataset.src;
    }
  }, { once: true });

  temas.forEach((b) => b.addEventListener('click', (e) => {
    if (b.getAttribute('aria-pressed') === 'true') return;
    temas.forEach((t) => t.setAttribute('aria-pressed', String(t === b)));
    const trocar = () => { osImagem.src = b.dataset.img; osLegenda.textContent = b.dataset.legenda; };
    if (!window.Pixels || reduzido) { trocar(); return; }
    const r = osQuadro.getBoundingClientRect();
    Pixels.revelarElemento(osQuadro, {
      clienteX: Math.max(r.left, Math.min(r.right, e.clientX)), clienteY: r.bottom - 1, passo: 18,
      corCortina: getComputedStyle(document.documentElement).getPropertyValue('--mo-janela').trim(),
      trocar,
    });
  }));
})();
