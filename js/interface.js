/* =========================================================================
   Interface: o que vale para a página inteira.
   Campo no fundo, entrada no scroll, navegação em onda, atalhos que afundam
   as teclas, odômetros, relógio, avisos e o botão de copiar.
   ========================================================================= */

(function () {
  'use strict';

  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  /* ---------- Avisos ---------- */
  const avisos = $('#avisos');
  window.avisar = function (texto, duracao = 2800) {
    const a = document.createElement('div');
    a.className = 'mo-aviso';
    a.innerHTML = '<i class="mo-marca" aria-hidden="true"></i><span></span>';
    a.querySelector('span').textContent = texto;
    avisos.appendChild(a);
    while (avisos.children.length > 2) avisos.firstElementChild.remove();
    setTimeout(() => {
      a.classList.add('saindo');
      a.addEventListener('animationend', () => a.remove(), { once: true });
    }, duracao);
  };

  /* ---------- Campo de pontos no fundo ---------- */
  const campoFundo = $('#campo');
  if (window.Pixels && campoFundo) {
    const estreita = window.innerWidth < 760;
    new Pixels.Campo(campoFundo, { fixo: true, passo: estreita ? 16 : 22, lente: estreita ? 0 : 200, velocidade: 2.2, opacidade: 0.4 });
  }
  const heroi = $('#inicio');
  function atualizarCampo() {
    const p = Math.min(1, window.scrollY / (heroi.offsetHeight * 0.9));
    campoFundo.style.opacity = String(1 - p * 0.62);
  }

  /* ---------- Entrada no scroll ---------- */
  const revelaveis = $$('.revelar');
  revelaveis.forEach((el) => {
    const irmaos = Array.from(el.parentElement.children).filter((c) => c.classList.contains('revelar'));
    el.style.setProperty('--ordem', Math.min(6, irmaos.indexOf(el)));
  });
  $$('.sobre-manifesto .peca').forEach((p, i) => p.style.setProperty('--i', i));

  const aoVer = new Set();
  let ioRevelar = null;
  window.quandoVisivel = (el, fn) => {
    if (!ioRevelar) { setTimeout(fn, 0); return; }
    aoVer.add([el, fn]);
    ioRevelar.observe(el);
  };
  if ('IntersectionObserver' in window && !reduzido) {
    ioRevelar = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('visivel');
        aoVer.forEach((par) => { if (par[0] === e.target) { par[1](); aoVer.delete(par); } });
        ioRevelar.unobserve(e.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
    revelaveis.forEach((el) => { if (!el.closest('#inicio')) ioRevelar.observe(el); });
  } else {
    revelaveis.forEach((el) => el.classList.add('visivel'));
  }
  window.revelarHeroi = () => $$('#inicio .revelar').forEach((el) => el.classList.add('visivel'));

  /* ---------- Navegação: seção ativa e marcador ---------- */
  const nav = $('#nav');
  const marcador = $('#navMarcador');
  const itens = $$('.nav-item', nav);
  const secoes = itens.map((a) => $(a.getAttribute('href')));
  let ativo = null;
  function moverMarcador() {
    if (!ativo) { marcador.style.opacity = '0'; return; }
    marcador.style.opacity = '1';
    marcador.style.width = ativo.offsetWidth + 'px';
    marcador.style.transform = `translateX(${ativo.offsetLeft}px)`;
  }
  function atualizarAtivo() {
    const linha = window.innerHeight * 0.35;
    let atual = null;
    secoes.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= linha) atual = itens[i]; });
    if (atual === ativo) return;
    if (ativo) ativo.removeAttribute('aria-current');
    ativo = atual;
    if (ativo) ativo.setAttribute('aria-current', 'true');
    moverMarcador();
  }
  const alternar = $('#navAlternar');
  function fecharMenu() { nav.classList.remove('aberta'); alternar.setAttribute('aria-expanded', 'false'); }
  alternar.addEventListener('click', () => {
    const abrir = !nav.classList.contains('aberta');
    nav.classList.toggle('aberta', abrir);
    alternar.setAttribute('aria-expanded', String(abrir));
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fecharMenu(); });

  /* ---------- Progresso em blocos ---------- */
  const progresso = $('#progresso');
  const N_BLOCOS = window.innerWidth < 640 ? 20 : 48;
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
    const acesos = Math.round((total > 0 ? window.scrollY / total : 0) * N_BLOCOS);
    blocos.forEach((b, i) => b.classList.toggle('aceso', i < acesos));
  }

  let agendado = false;
  function aoRolar() {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(() => { agendado = false; atualizarAtivo(); atualizarProgresso(); atualizarCampo(); });
  }
  window.addEventListener('scroll', aoRolar, { passive: true });
  window.addEventListener('resize', () => { moverMarcador(); aoRolar(); });
  document.addEventListener('tema', () => requestAnimationFrame(moverMarcador));
  aoRolar();
  if (document.fonts) document.fonts.ready.then(moverMarcador);

  /* ---------- Navegar em onda ---------- */
  const cortina = $('#cortina');
  let navegando = false;
  window.irPara = function (alvo, x, y) {
    const destino = typeof alvo === 'string' ? $(alvo) : alvo;
    if (!destino || navegando) return;
    fecharMenu();
    const id = destino.id;
    const topo = id === 'inicio' ? 0 : destino.getBoundingClientRect().top + window.scrollY - (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0);
    if (reduzido || !window.Pixels) {
      window.scrollTo({ top: topo, behavior: 'instant' });
    } else {
      navegando = true;
      const promessa = Pixels.revelar(cortina, { x, y, passo: 22 });
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

  /* ---------- Atalhos de teclado ---------- */
  function apertar(el) { el.classList.add('mo-apertada'); setTimeout(() => el.classList.remove('mo-apertada'), 130); }
  const digitando = (e) => e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
  window.naTela = (el) => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < window.innerHeight; };
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
    const pilar = $(`[data-tecla-pilar="${k}"]`);
    if (pilar && naTela(pilar)) { e.preventDefault(); pilar.classList.add('mo-apertada'); return; }
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

  /* ---------- Odômetro: cada dígito é uma fita que rola ---------- */
  window.Odometro = {
    montar(el, casas) {
      el.textContent = '';
      for (let i = 0; i < casas; i += 1) {
        const d = document.createElement('span');
        d.className = 'digito';
        const fita = document.createElement('span');
        fita.className = 'fita-digito';
        fita.style.setProperty('--d', i);
        for (let n = 0; n < 20; n += 1) { const s = document.createElement('span'); s.textContent = n % 10; fita.appendChild(s); }
        d.appendChild(fita);
        el.appendChild(d);
      }
    },
    /* A fita tem 0–9 duas vezes: cada troca rola para a outra metade, então sempre anda. */
    definir(el, valor, casas) {
      const texto = String(valor).padStart(casas, '0');
      Array.from(el.querySelectorAll('.fita-digito')).forEach((f, i) => {
        const n = Number(texto[i]);
        const metade = f.dataset.metade === '1' ? 0 : 1;
        f.dataset.metade = String(metade);
        f.style.transform = `translateY(-${n + metade * 10}em)`;
      });
    },
  };
  $$('[data-odometro]').forEach((el) => {
    const alvo = Number(el.dataset.odometro);
    const casas = String(alvo).length;
    el.setAttribute('aria-hidden', 'true');
    const leitor = document.createElement('span');
    leitor.className = 'acessivel-oculto';
    leitor.textContent = alvo;
    el.after(leitor);
    Odometro.montar(el, casas);
    quandoVisivel(el.closest('.revelar') || el, () => setTimeout(() => Odometro.definir(el, alvo, casas), 150));
  });

  /* ---------- Relógio de Brasília ---------- */
  const relogios = $$('[data-relogio]');
  function tic() {
    let txt = '--:--';
    try { txt = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }).format(new Date()); } catch (e) {}
    relogios.forEach((r) => { r.textContent = txt; });
  }
  tic();
  setInterval(tic, 15000);

  /* ---------- Copiar ---------- */
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

  $('#ano').textContent = new Date().getFullYear();
})();
