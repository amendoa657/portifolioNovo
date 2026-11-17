/* =========================================================================
   Mosaic: os três capítulos.
   01 · OS     — carrossel vertical: os passos rolam, o palco fica preso à
                 direita (sangrando até a borda) e troca numa onda de pixels.
   02 · Store  — um baralho de telas: a carta da frente sai numa onda e o
                 monte anda; dá para arrastar, clicar ou usar as setas.
   03 · UI     — os pilares funcionando de verdade.
   ========================================================================= */

(function () {
  'use strict';

  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const corDe = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

  /* ---------------------------------------------------------------------
     01 · Mosaic OS
     --------------------------------------------------------------------- */
  const passos = Array.from(document.querySelectorAll('#vitrinePassos .passo'));
  const trilho = document.getElementById('vitrineTrilho');
  const mesa = document.getElementById('palcoMesa');
  const imagem = document.getElementById('palcoImagem');
  const video = document.getElementById('palcoVideo');
  const legenda = document.getElementById('palcoLegenda');
  const contador = document.getElementById('palcoContador');
  let atual = 0;

  /* Pré-carrega o que é leve; o vídeo só quando chegar a vez dele. */
  passos.forEach((p) => { if (!p.dataset.midia.endsWith('.mp4')) { const i = new Image(); i.src = p.dataset.midia; } });

  const barras = passos.map((p, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'trilho-t ' + Array.from(p.classList).find((c) => c.startsWith('mo-tom-'));
    b.setAttribute('aria-label', p.querySelector('h4').textContent);
    b.addEventListener('click', () => p.scrollIntoView({ behavior: reduzido ? 'auto' : 'smooth', block: 'center' }));
    trilho.appendChild(b);
    return b;
  });

  function mostrarPasso(i) {
    if (i === atual && imagem.dataset.pronto) return;
    imagem.dataset.pronto = '1';
    const anterior = atual;
    atual = i;
    passos.forEach((p, k) => p.classList.toggle('ativo', k === i));
    barras.forEach((b, k) => b.classList.toggle('ativo', k === i));
    const p = passos[i];
    const trocar = () => {
      const midia = p.dataset.midia;
      if (midia.endsWith('.mp4')) {
        imagem.hidden = true;
        video.hidden = false;
        if (video.getAttribute('src') !== midia) { video.poster = p.dataset.poster || ''; video.src = midia; }
        if (!reduzido) video.play().catch(() => {});
      } else {
        video.pause();
        video.hidden = true;
        imagem.hidden = false;
        imagem.src = midia;
        imagem.alt = p.dataset.legenda;
      }
      legenda.textContent = p.dataset.legenda;
      contador.textContent = String(i + 1).padStart(2, '0');
    };
    if (anterior === i || !window.Pixels) { trocar(); return; }
    /* A onda entra pela borda esquerda do palco, na altura do passo ativo. */
    const r = mesa.getBoundingClientRect();
    const pr = p.getBoundingClientRect();
    Pixels.revelarElemento(mesa, {
      clienteX: r.left + 1,
      clienteY: Math.max(r.top + 1, Math.min(r.bottom - 1, pr.top + pr.height / 2)),
      passo: 22, corCortina: corDe('--mo-janela'), trocar,
    });
  }

  /* O passo ativo é o que está mais perto do meio da tela. */
  let agendado = false;
  function escolherPeloScroll() {
    agendado = false;
    const meio = window.innerHeight * (window.innerWidth < 960 ? 0.72 : 0.5);
    let melhor = 0;
    let menor = Infinity;
    passos.forEach((p, i) => {
      const r = p.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - meio);
      if (d < menor) { menor = d; melhor = i; }
    });
    mostrarPasso(melhor);
  }
  window.addEventListener('scroll', () => { if (!agendado) { agendado = true; requestAnimationFrame(escolherPeloScroll); } }, { passive: true });
  passos[0].classList.add('ativo');
  barras[0].classList.add('ativo');
  imagem.dataset.pronto = '1';

  /* ---------------------------------------------------------------------
     02 · Mosaic Store: o baralho
     --------------------------------------------------------------------- */
  const baralho = document.getElementById('baralho');
  const cartas = Array.from(baralho.querySelectorAll('.carta'));
  const num = document.getElementById('baralhoNum');
  const nome = document.getElementById('baralhoNome');
  const desc = document.getElementById('baralhoDesc');
  const N = cartas.length;
  let frente = 0;
  let animando = false;
  Odometro.montar(num, 2);

  function arrumar() {
    cartas.forEach((c, i) => {
      const pos = (i - frente + N) % N;
      c.style.setProperty('--pos', Math.min(pos, 4));
      c.style.visibility = pos > 4 ? 'hidden' : '';
      c.setAttribute('aria-hidden', String(pos !== 0));
    });
    const c = cartas[frente];
    Odometro.definir(num, frente + 1, 2);
    nome.textContent = c.dataset.nome;
    desc.textContent = c.dataset.desc;
    /* as próximas imagens já carregam */
    [1, 2].forEach((k) => { const img = cartas[(frente + k) % N].querySelector('img'); img.loading = 'eager'; });
  }

  function avancar(direcao, origem) {
    if (animando) return;
    animando = true;
    const proxima = (frente + direcao + N) % N;
    const carta = cartas[frente];
    const r = carta.getBoundingClientRect();
    const trocar = () => { frente = proxima; arrumar(); };
    if (!window.Pixels || reduzido) { trocar(); animando = false; return; }
    /* A carta da frente vira pixels a partir da origem; a de trás já está embaixo. */
    const ox = origem ? origem.x : (direcao > 0 ? r.right - 1 : r.left + 1);
    const oy = origem ? origem.y : r.top + r.height / 2;
    const alvo = cartas[proxima];
    alvo.style.setProperty('--pos', 0);
    alvo.style.zIndex = '30';
    Pixels.revelarElemento(alvo, {
      clienteX: ox, clienteY: oy, passo: 20, corCortina: corDe('--mo-janela'),
      trocar,
    }).then(() => { alvo.style.zIndex = ''; animando = false; });
  }

  document.getElementById('baralhoDepois').addEventListener('click', () => avancar(1));
  document.getElementById('baralhoAntes').addEventListener('click', () => avancar(-1));
  baralho.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); avancar(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); avancar(-1); }
  });

  /* Arrastar: a carta da frente acompanha o dedo; soltando longe, passa. */
  let toque = null;
  baralho.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    toque = { x: e.clientX, y: e.clientY, dx: 0, id: e.pointerId };
  });
  baralho.addEventListener('pointermove', (e) => {
    if (!toque || e.pointerId !== toque.id) return;
    toque.dx = e.clientX - toque.x;
    if (Math.abs(toque.dx) > 6 && !baralho.classList.contains('arrastando')) {
      baralho.classList.add('arrastando');
      baralho.setPointerCapture(e.pointerId);
    }
    if (baralho.classList.contains('arrastando')) {
      const c = cartas[frente];
      c.style.setProperty('--arrasto', toque.dx + 'px');
      c.style.setProperty('--arrasto-giro', (toque.dx / 40) + 'deg');
    }
  });
  const soltar = (e) => {
    if (!toque) return;
    const t = toque;
    toque = null;
    const c = cartas[frente];
    const arrastou = baralho.classList.contains('arrastando');
    baralho.classList.remove('arrastando');
    c.style.removeProperty('--arrasto');
    c.style.removeProperty('--arrasto-giro');
    if (arrastou && Math.abs(t.dx) > 70) avancar(t.dx < 0 ? 1 : -1);
    else if (!arrastou && e.type === 'pointerup') avancar(1, { x: e.clientX, y: e.clientY });
  };
  baralho.addEventListener('pointerup', soltar);
  baralho.addEventListener('pointercancel', soltar);
  arrumar();
  quandoVisivel(baralho, () => Odometro.definir(num, frente + 1, 2));

  /* ---------------------------------------------------------------------
     03 · Mosaic UI: os pilares
     --------------------------------------------------------------------- */
  const grade = document.getElementById('pilarBlocos');
  const CORES = ['var(--mo-destaque)', 'var(--mo-secundaria)', 'var(--mo-terciaria)', 'var(--mo-mista)', 'var(--mo-elevada)', 'var(--mo-elevada)'];
  for (let i = 0; i < 24; i += 1) {
    const b = document.createElement('i');
    b.style.setProperty('--c', CORES[Math.floor(Math.random() * CORES.length)]);
    grade.appendChild(b);
  }
  grade.addEventListener('pointerover', (e) => { if (e.target.tagName === 'I') e.target.style.setProperty('--c', CORES[Math.floor(Math.random() * 4)]); });
  if (!reduzido) {
    setInterval(() => {
      if (document.hidden || !naTela(grade)) return;
      grade.children[Math.floor(Math.random() * 24)].style.setProperty('--c', CORES[Math.floor(Math.random() * CORES.length)]);
    }, 420);
  }
  const campoPilar = document.getElementById('pilarCampo');
  if (window.Pixels && campoPilar) new Pixels.Campo(campoPilar, { passo: 12, lente: 90, velocidade: 3, opacidade: 0.75 });
  const onda = document.getElementById('pilarOnda');
  onda.addEventListener('click', (e) => {
    const linhas = Array.from(onda.querySelectorAll('i')).slice(1);
    Pixels.revelarElemento(onda, {
      clienteX: e.clientX, clienteY: e.clientY, passo: 9, corCortina: getComputedStyle(onda).backgroundColor,
      trocar() {
        linhas.forEach((l) => { l.style.width = (40 + Math.random() * 55).toFixed(0) + '%'; });
        onda.querySelector('i').className = 'mo-tom-' + Math.floor(Math.random() * 4);
      },
    });
  });

  /* ---------------------------------------------------------------------
     Vídeos: carregam perto da tela, tocam só quando visíveis
     --------------------------------------------------------------------- */
  const videos = Array.from(document.querySelectorAll('video[data-src]'));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        const v = e.target;
        if (e.isIntersecting) {
          if (!v.dataset.carregado) { v.dataset.carregado = '1'; v.src = v.dataset.src; }
          if (!reduzido) v.play().catch(() => {});
        } else if (!v.paused) v.pause();
      });
    }, { rootMargin: '150px 0px' });
    videos.forEach((v) => io.observe(v));
  }
  videos.forEach((v) => v.addEventListener('click', () => {
    if (!v.dataset.carregado) { v.dataset.carregado = '1'; v.src = v.dataset.src; }
    if (v.paused) v.play().catch(() => {}); else v.pause();
  }));
})();
