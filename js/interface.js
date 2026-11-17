/* =========================================================================
   Interface: tudo o que faz a página parecer um app da Mosaic.
   Campo no fundo, navegação em onda, atalhos que afundam as teclas, avisos,
   o mascote, os pilares, o teclado da stack e o filtro dos projetos.
   ========================================================================= */

(function () {
  'use strict';

  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  /* ---------------------------------------------------------------------
     Avisos flutuantes
     --------------------------------------------------------------------- */
  const avisos = $('#avisos');
  window.avisar = function (texto, duracao = 2600) {
    const a = document.createElement('div');
    a.className = 'mo-aviso';
    a.innerHTML = '<i class="mo-marca" aria-hidden="true"></i><span></span>';
    a.querySelector('span').textContent = texto;
    avisos.appendChild(a);
    while (avisos.children.length > 3) avisos.firstElementChild.remove();
    setTimeout(() => {
      a.classList.add('saindo');
      a.addEventListener('animationend', () => a.remove(), { once: true });
    }, duracao);
  };

  /* ---------------------------------------------------------------------
     Campo de pontos no fundo
     --------------------------------------------------------------------- */
  const campoFundo = $('#campo');
  if (window.Pixels && campoFundo) {
    const estreita = window.innerWidth < 760;
    new Pixels.Campo(campoFundo, { fixo: true, passo: estreita ? 16 : 20, lente: estreita ? 0 : 190, velocidade: 2.2, opacidade: 0.42 });
  }
  const heroi = $('#inicio');
  function atualizarCampo() {
    const fim = heroi.offsetHeight * 0.9;
    const p = Math.min(1, window.scrollY / fim);
    campoFundo.style.opacity = String(1 - p * 0.6);
  }

  /* ---------------------------------------------------------------------
     Entrada no scroll (com cascata entre irmãos)
     --------------------------------------------------------------------- */
  const revelaveis = $$('.revelar');
  revelaveis.forEach((el) => {
    const irmaos = Array.from(el.parentElement.children).filter((c) => c.classList.contains('revelar'));
    el.style.setProperty('--ordem', Math.min(6, irmaos.indexOf(el)));
  });
  if ('IntersectionObserver' in window && !reduzido) {
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('visivel');
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revelaveis.forEach((el) => {
      /* Os do herói esperam a abertura. */
      if (el.closest('#inicio')) return;
      io.observe(el);
    });
  } else {
    revelaveis.forEach((el) => el.classList.add('visivel'));
  }
  window.revelarHeroi = function () {
    $$('#inicio .revelar').forEach((el) => el.classList.add('visivel'));
  };

  /* ---------------------------------------------------------------------
     Navegação: seção ativa, pílula e menu
     --------------------------------------------------------------------- */
  const nav = $('#nav');
  const pilula = $('#navPilula');
  const itens = $$('.nav-item', nav);
  const secoes = itens.map((a) => $(a.getAttribute('href')));
  let ativo = null;

  function moverPilula() {
    if (!ativo) { pilula.style.opacity = '0'; return; }
    pilula.style.opacity = '1';
    pilula.style.width = ativo.offsetWidth + 'px';
    pilula.style.transform = `translateX(${ativo.offsetLeft}px)`;
  }
  function atualizarAtivo() {
    const linha = window.innerHeight * 0.35;
    let atual = null;
    secoes.forEach((s, i) => {
      if (s && s.getBoundingClientRect().top <= linha) atual = itens[i];
    });
    if (atual === ativo) return;
    if (ativo) ativo.removeAttribute('aria-current');
    ativo = atual;
    if (ativo) ativo.setAttribute('aria-current', 'true');
    moverPilula();
  }

  const alternar = $('#navAlternar');
  function fecharMenu() {
    nav.classList.remove('aberta');
    alternar.setAttribute('aria-expanded', 'false');
  }
  alternar.addEventListener('click', () => {
    const abrir = !nav.classList.contains('aberta');
    nav.classList.toggle('aberta', abrir);
    alternar.setAttribute('aria-expanded', String(abrir));
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fecharMenu(); });

  /* ---------------------------------------------------------------------
     Progresso em blocos
     --------------------------------------------------------------------- */
  const progresso = $('#progresso');
  const N_BLOCOS = window.innerWidth < 640 ? 20 : 40;
  progresso.style.setProperty('--n', N_BLOCOS);
  const blocos = [];
  for (let i = 0; i < N_BLOCOS; i += 1) {
    const b = document.createElement('i');
    b.className = 'mo-tom-' + (i % 4);
    progresso.appendChild(b);
    blocos.push(b);
  }
  function atualizarProgresso() {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const p = total > 0 ? window.scrollY / total : 0;
    const acesos = Math.round(p * N_BLOCOS);
    blocos.forEach((b, i) => b.classList.toggle('aceso', i < acesos));
  }

  let agendado = false;
  function aoRolar() {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(() => {
      agendado = false;
      atualizarAtivo();
      atualizarProgresso();
      atualizarCampo();
    });
  }
  window.addEventListener('scroll', aoRolar, { passive: true });
  window.addEventListener('resize', () => { moverPilula(); aoRolar(); });
  aoRolar();
  if (document.fonts) document.fonts.ready.then(moverPilula);

  /* ---------------------------------------------------------------------
     Navegar em onda: a seção nova nasce coberta e se revela do clique
     --------------------------------------------------------------------- */
  const cortina = $('#cortina');
  let navegando = false;
  window.irPara = async function (alvo, x, y) {
    const destino = typeof alvo === 'string' ? $(alvo) : alvo;
    if (!destino || navegando) return;
    fecharMenu();
    const id = destino.id;
    if (reduzido || !window.Pixels) {
      destino.scrollIntoView();
    } else {
      navegando = true;
      const promessa = Pixels.revelar(cortina, { x, y, passo: 22 });
      const topo = id === 'inicio' ? 0 : destino.getBoundingClientRect().top + window.scrollY - (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0);
      window.scrollTo({ top: topo, behavior: 'instant' });
      promessa.then(() => { navegando = false; });
    }
    if (id && history.replaceState) history.replaceState(null, '', '#' + id);
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-onda]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    const href = a.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    e.preventDefault();
    const r = a.getBoundingClientRect();
    irPara(href, e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2);
  });

  /* ---------------------------------------------------------------------
     Atalhos de teclado: a tecla da tela afunda de verdade
     --------------------------------------------------------------------- */
  function apertar(el) {
    el.classList.add('mo-apertada');
    setTimeout(() => el.classList.remove('mo-apertada'), 130);
  }
  function digitando(e) {
    const t = e.target;
    return t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName);
  }
  function visivel(el) {
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  }
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || digitando(e) || $('#terminal').open) return;
    const k = e.key.toLowerCase();

    if (k === '/') {
      e.preventDefault();
      const busca = $('#buscaProjetos');
      busca.scrollIntoView({ block: 'center', behavior: reduzido ? 'auto' : 'smooth' });
      busca.focus({ preventScroll: true });
      return;
    }

    /* As teclas A S D do pilar respondem ao teclado quando ele está à vista. */
    const pilar = $(`[data-tecla-pilar="${k}"]`);
    if (pilar && visivel(pilar)) {
      e.preventDefault();
      pilar.classList.add('mo-apertada');
      return;
    }

    if (k === 'enter' && document.activeElement !== document.body) return;
    const el = $(`[data-atalho="${k}"]`);
    if (!el || e.repeat) return;
    e.preventDefault();
    if (el.classList.contains('mo-tecla')) apertar(el);
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    setTimeout(() => {
      if (el.matches('a[data-onda]')) irPara(el.getAttribute('href'), x, y);
      else el.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: x, clientY: y }));
    }, 90);
  });
  document.addEventListener('keyup', (e) => {
    const pilar = $(`[data-tecla-pilar="${e.key.toLowerCase()}"]`);
    if (pilar) pilar.classList.remove('mo-apertada');
  });

  /* ---------------------------------------------------------------------
     O papel que troca, numa varrida de bloco
     --------------------------------------------------------------------- */
  const papel = $('#papel');
  const PAPEIS = ['jogos', 'back-end', 'interfaces', 'front-end', 'identidade visual', 'C++ competitivo'];
  let iPapel = 0;
  function trocarPapel() {
    iPapel = (iPapel + 1) % PAPEIS.length;
    papel.classList.remove('trocando');
    void papel.offsetWidth;
    papel.classList.add('trocando');
    setTimeout(() => {
      papel.textContent = PAPEIS[iPapel];
      papel.className = 'papel-palavra trocando mo-tom-' + (iPapel % 4);
    }, 190);
  }
  if (!reduzido) setInterval(() => { if (!document.hidden) trocarPapel(); }, 2600);

  /* ---------------------------------------------------------------------
     Números que contam
     --------------------------------------------------------------------- */
  const contadores = $$('[data-contar]');
  function contar(el) {
    const alvo = Number(el.dataset.contar);
    const de = Number(el.dataset.de || 0);
    if (reduzido) { el.textContent = alvo; return; }
    const dur = 1100;
    const t0 = performance.now();
    (function passo(agora) {
      const p = Math.min(1, (agora - t0) / dur);
      const e = 1 - (1 - p) ** 4;
      el.textContent = Math.round(de + (alvo - de) * e);
      if (p < 1) requestAnimationFrame(passo);
    })(t0);
  }
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => { if (e.isIntersecting) { contar(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.6 });
    contadores.forEach((c) => io.observe(c));
  } else contadores.forEach((c) => (c.textContent = c.dataset.contar));

  /* ---------------------------------------------------------------------
     Copiar
     --------------------------------------------------------------------- */
  document.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-copiar]');
    if (!b) return;
    try {
      await navigator.clipboard.writeText(b.dataset.copiar);
      avisar(b.dataset.aviso || 'Copiado');
      const antes = b.textContent;
      b.textContent = 'copiado';
      b.setAttribute('aria-pressed', 'true');
      setTimeout(() => { b.textContent = antes; b.removeAttribute('aria-pressed'); }, 1600);
    } catch (err) {
      avisar('Não deu pra copiar — seleciona e copia na mão');
    }
  });

  /* ---------------------------------------------------------------------
     O mascote: a marca viva. Olha o mouse, pisca e troca o wallpaper.
     --------------------------------------------------------------------- */
  const mascote = $('#mascote');
  const pupilas = $$('.pupila', mascote);
  const blocosMascote = $('.mascote-blocos', mascote);
  let giro = 0;
  let olharPendente = false;
  let px = 0; let py = 0;
  window.addEventListener('pointermove', (e) => {
    px = e.clientX; py = e.clientY;
    if (olharPendente) return;
    olharPendente = true;
    requestAnimationFrame(() => {
      olharPendente = false;
      const r = mascote.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const ang = Math.atan2(py - cy, px - cx);
      const dist = Math.min(1, Math.hypot(px - cx, py - cy) / 400);
      const alcance = r.width * 0.032;
      pupilas.forEach((p) => {
        p.style.setProperty('--px', (Math.cos(ang) * alcance * dist).toFixed(2) + 'px');
        p.style.setProperty('--py', (Math.sin(ang) * alcance * 1.3 * dist).toFixed(2) + 'px');
      });
    });
  }, { passive: true });

  function piscar() {
    mascote.classList.add('piscando');
    setTimeout(() => mascote.classList.remove('piscando'), 130);
    setTimeout(piscar, 2400 + Math.random() * 3600);
  }
  if (!reduzido) setTimeout(piscar, 2200);

  /* Gira um quarto de volta; no fim, desfaz o giro e passa as cores adiante,
     para a sombra dos blocos continuar embaixo. */
  const pecas = $$('i', blocosMascote);
  blocosMascote.addEventListener('transitionend', (e) => {
    if (e.target !== blocosMascote || giro === 0) return;
    for (let k = 0; k < giro; k += 1) {
      const c = pecas.map((p) => p.style.getPropertyValue('--c'));
      /* ordem no DOM: cima-esq, cima-dir, baixo-esq, baixo-dir; no horário,
         quem estava embaixo-esq sobe, e assim por diante */
      const girada = [c[2], c[0], c[3], c[1]];
      pecas.forEach((p, i) => p.style.setProperty('--c', girada[i]));
    }
    giro = 0;
    blocosMascote.classList.add('sem-transicao');
    blocosMascote.style.setProperty('--giro', 0);
    void blocosMascote.offsetWidth;
    blocosMascote.classList.remove('sem-transicao');
  });

  mascote.addEventListener('click', (e) => {
    giro += 1;
    blocosMascote.style.setProperty('--giro', giro);
    mascote.classList.remove('pulando');
    void mascote.offsetWidth;
    mascote.classList.add('pulando');
    const balao = $('.mascote-balao', mascote);
    if (balao) balao.remove();
    const r = mascote.getBoundingClientRect();
    Tema.proximo({ x: e.clientX || r.left + r.width / 2, y: e.clientY || r.top + r.height / 2 });
  });

  /* ---------------------------------------------------------------------
     Pilares da Mosaic
     --------------------------------------------------------------------- */
  /* Blocos chapados: uma grade que se embaralha onde o mouse passa. */
  const grade = $('#pilarBlocos');
  const CORES_BLOCO = ['var(--mo-destaque)', 'var(--mo-secundaria)', 'var(--mo-terciaria)', 'var(--mo-mista)', 'var(--mo-elevada)', 'var(--mo-elevada)'];
  for (let i = 0; i < 24; i += 1) {
    const b = document.createElement('i');
    b.style.setProperty('--c', CORES_BLOCO[Math.floor(Math.random() * CORES_BLOCO.length)]);
    grade.appendChild(b);
  }
  grade.addEventListener('pointerover', (e) => {
    if (e.target.tagName !== 'I') return;
    e.target.style.setProperty('--c', CORES_BLOCO[Math.floor(Math.random() * 4)]);
  });
  if (!reduzido) {
    setInterval(() => {
      if (document.hidden || !visivel(grade)) return;
      const b = grade.children[Math.floor(Math.random() * grade.children.length)];
      b.style.setProperty('--c', CORES_BLOCO[Math.floor(Math.random() * CORES_BLOCO.length)]);
    }, 420);
  }

  /* Campo de pixels: um campo pequeno, com lente forte. */
  const campoPilar = $('#pilarCampo');
  if (window.Pixels && campoPilar) new Pixels.Campo(campoPilar, { passo: 12, lente: 90, velocidade: 3, opacidade: 0.75 });

  /* Onda de pixels: a "tela" se revela a partir do clique. */
  const onda = $('#pilarOnda');
  onda.addEventListener('click', (e) => {
    const linhas = $$('i', onda).slice(1);
    Pixels.revelarElemento(onda, {
      clienteX: e.clientX, clienteY: e.clientY, passo: 9,
      corCortina: getComputedStyle(onda).backgroundColor,
      trocar() {
        linhas.forEach((l) => { l.style.width = (40 + Math.random() * 55).toFixed(0) + '%'; });
        onda.querySelector('i').className = 'mo-tom-' + Math.floor(Math.random() * 4);
      },
    });
  });

  /* ---------------------------------------------------------------------
     Teclado da stack
     --------------------------------------------------------------------- */
  const saida = $('#tecladoSaida');
  let escrevendo = 0;
  $('#teclado').addEventListener('click', (e) => {
    const tecla = e.target.closest('.mo-tecla');
    if (!tecla) return;
    $$('#teclado .mo-tecla[aria-pressed]').forEach((t) => t.removeAttribute('aria-pressed'));
    tecla.setAttribute('aria-pressed', 'true');
    const [onde, nota] = (tecla.dataset.onde || '').split('|');
    const grupo = tecla.closest('.teclado-grupo').querySelector('.rotulo').textContent.trim();
    const nome = tecla.textContent.trim();
    const linhas = [
      `<span class="seta">$</span> grep -r "${nome.toLowerCase()}" ${grupo}`,
      `<span class="seta">›</span> <span class="nome">${nome}</span> ${tecla.classList.contains('principal') ? '<span class="mo-selo mo-selo--vivo">todo dia</span>' : '<span class="fraco">de vez em quando</span>'}`,
      `<span class="seta">›</span> onde: ${onde}`,
      `<span class="seta">›</span> <span class="fraco">${nota}</span>`,
    ];
    const minha = ++escrevendo;
    saida.innerHTML = '';
    linhas.forEach((html, i) => {
      setTimeout(() => {
        if (minha !== escrevendo) return;
        const d = document.createElement('div');
        d.className = 'linha';
        d.innerHTML = html + (i === linhas.length - 1 ? '<span class="mo-caret"></span>' : '');
        saida.appendChild(d);
      }, reduzido ? 0 : i * 90);
    });
  });

  /* ---------------------------------------------------------------------
     Projetos: busca e filtro, como o Instalados da loja
     --------------------------------------------------------------------- */
  const busca = $('#buscaProjetos');
  const filtros = $$('[data-filtro]');
  const projetos = $$('#projetosGrade .projeto');
  const vazio = $('#projetosVazio');
  let filtro = 'todos';
  const normalizar = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  function aplicarFiltro() {
    const termo = normalizar(busca.value.trim());
    let n = 0;
    projetos.forEach((p) => {
      const texto = normalizar(p.dataset.busca + ' ' + p.textContent);
      const mostra = (filtro === 'todos' || p.dataset.area.split(' ').includes(filtro)) && (!termo || texto.includes(termo));
      p.hidden = !mostra;
      p.classList.remove('filtrando');
      if (mostra) {
        p.style.setProperty('--ordem', n);
        void p.offsetWidth;
        p.classList.add('filtrando');
        n += 1;
      }
    });
    vazio.hidden = n > 0;
  }
  busca.addEventListener('input', aplicarFiltro);
  busca.addEventListener('keydown', (e) => { if (e.key === 'Escape') { busca.value = ''; aplicarFiltro(); busca.blur(); } });
  filtros.forEach((b) => b.addEventListener('click', () => {
    filtro = b.dataset.filtro;
    filtros.forEach((f) => f.setAttribute('aria-pressed', String(f === b)));
    aplicarFiltro();
  }));

  /* ---------------------------------------------------------------------
     Rodapé
     --------------------------------------------------------------------- */
  $('#ano').textContent = new Date().getFullYear();
})();
