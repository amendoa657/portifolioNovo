/* =========================================================================
   Herói: o letreiro de palhetas, o mascote e o mostrador de tema.
   ========================================================================= */

(function () {
  'use strict';

  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------
     O que eu faço: a frase se desfaz em pixels e os mesmos quadradinhos
     voam até formar a próxima
     --------------------------------------------------------------------- */
  const faco = document.getElementById('facoTexto');
  const FRASES = ['jogos na Godot', 'back-end', 'desktop em Delphi', 'Rust, aprendendo', 'Go, o próximo', 'interfaces', 'C++ competitivo', 'direção de arte'];
  let iFrase = 0;
  window.iniciarLetreiro = () => {
    if (window._letreiroIniciado || reduzido) return;
    window._letreiroIniciado = true;
    setInterval(() => {
      if (document.hidden || !naTela(faco)) return;
      iFrase = (iFrase + 1) % FRASES.length;
      PixelTexto.trocar(faco, FRASES[iFrase]);
    }, 3000);
  };

  /* ---------------------------------------------------------------------
     Mascote: a marca viva. Olha o mouse, pisca e troca o tema.
     --------------------------------------------------------------------- */
  const mascote = document.getElementById('mascote');
  const pupilas = Array.from(mascote.querySelectorAll('.pupila'));
  const blocos = mascote.querySelector('.mascote-blocos');
  const pecas = Array.from(blocos.children);
  let giro = 0;
  let pendente = false;
  let px = 0; let py = 0;
  window.addEventListener('pointermove', (e) => {
    px = e.clientX; py = e.clientY;
    if (pendente) return;
    pendente = true;
    requestAnimationFrame(() => {
      pendente = false;
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

  /* Gira um quarto de volta; no fim desfaz o giro e passa as cores adiante,
     para a sombra dos blocos continuar embaixo. */
  blocos.addEventListener('transitionend', (e) => {
    if (e.target !== blocos || giro === 0) return;
    for (let k = 0; k < giro; k += 1) {
      const c = pecas.map((p) => p.style.getPropertyValue('--c'));
      const girada = [c[2], c[0], c[3], c[1]];
      pecas.forEach((p, i) => p.style.setProperty('--c', girada[i]));
    }
    giro = 0;
    blocos.classList.add('sem-transicao');
    blocos.style.setProperty('--giro', 0);
    void blocos.offsetWidth;
    blocos.classList.remove('sem-transicao');
  });
  function pular() {
    giro += 1;
    blocos.style.setProperty('--giro', giro);
    mascote.classList.remove('pulando');
    void mascote.offsetWidth;
    mascote.classList.add('pulando');
  }
  mascote.addEventListener('click', (e) => {
    const r = mascote.getBoundingClientRect();
    Tema.proximo({ x: e.clientX || r.left + r.width / 2, y: e.clientY || r.top + r.height / 2 });
  });
  document.addEventListener('tema', () => { if (!reduzido) pular(); });

  /* ---------------------------------------------------------------------
     O mostrador: um botão giratório de cinco posições
     --------------------------------------------------------------------- */
  const dial = document.getElementById('dial');
  const botao = document.getElementById('dialBotao');
  const rotulos = document.getElementById('dialRotulos');
  const TEMAS = Tema.TEMAS;
  const ANGULOS = [-90, -45, 0, 45, 90];
  const CORES = { mosaic: '#86d7ac', gruvbox: '#fe8019', horizonte: '#ffd27a', papel: '#e5432d', fosforo: '#39ff88' };
  const CENTRO = { x: botao.offsetLeft + botao.offsetWidth / 2, y: botao.offsetTop + botao.offsetHeight / 2 };
  const RAIO = botao.offsetWidth / 2 + 30;
  /* As marcas de cada posição, na cor do tema que ela escolhe. */
  const marcas = document.getElementById('dialMarcas');
  TEMAS.forEach((t, i) => {
    const m = document.createElement('i');
    m.style.setProperty('--a', ANGULOS[i] + 'deg');
    m.style.setProperty('--c', CORES[t]);
    marcas.appendChild(m);
  });

  const botoesRotulo = TEMAS.map((t, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'dial-rotulo';
    b.innerHTML = `<i style="background:${CORES[t]}"></i>${Tema.NOMES[t]}`;
    const a = (ANGULOS[i] * Math.PI) / 180;
    b.style.left = (CENTRO.x + Math.sin(a) * RAIO) + 'px';
    b.style.top = (CENTRO.y - Math.cos(a) * RAIO) + 'px';
    b.setAttribute('aria-label', 'Tema ' + Tema.NOMES[t]);
    b.addEventListener('click', (e) => {
      const r = botao.getBoundingClientRect();
      Tema.aplicar(t, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
      if (Tema.atual() === t) girarPara(i);
    });
    rotulos.appendChild(b);
    return b;
  });
  rotulos.removeAttribute('aria-hidden');

  function girarPara(i) {
    botao.style.setProperty('--angulo', ANGULOS[i] + 'deg');
    botao.setAttribute('aria-valuenow', String(i));
    botao.setAttribute('aria-valuetext', Tema.NOMES[TEMAS[i]]);
    botoesRotulo.forEach((b, k) => { if (k === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
  }
  function escolher(i) {
    i = Math.max(0, Math.min(TEMAS.length - 1, i));
    girarPara(i);
    const r = botao.getBoundingClientRect();
    Tema.aplicar(TEMAS[i], { x: r.left + r.width / 2, y: r.top + r.height / 2 });
  }
  girarPara(TEMAS.indexOf(Tema.atual()));
  document.addEventListener('tema', (e) => girarPara(TEMAS.indexOf(e.detail.nome)));

  /* Arrastar para girar; soltar encaixa na posição mais perto. Um toque sem
     arrastar passa para o próximo. */
  let arrasto = null;
  const anguloDo = (e) => {
    const r = botao.getBoundingClientRect();
    return (Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180) / Math.PI;
  };
  botao.addEventListener('pointerdown', (e) => {
    botao.setPointerCapture(e.pointerId);
    const atual = ANGULOS[TEMAS.indexOf(Tema.atual())];
    arrasto = { inicio: anguloDo(e), base: atual, valor: atual, moveu: false };
    botao.classList.add('arrastando');
  });
  botao.addEventListener('pointermove', (e) => {
    if (!arrasto) return;
    let d = anguloDo(e) - arrasto.inicio;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    if (Math.abs(d) > 4) arrasto.moveu = true;
    arrasto.valor = Math.max(-110, Math.min(110, arrasto.base + d));
    botao.style.setProperty('--angulo', arrasto.valor + 'deg');
  });
  const soltar = () => {
    if (!arrasto) return;
    botao.classList.remove('arrastando');
    const a = arrasto;
    arrasto = null;
    if (!a.moveu) { escolher((TEMAS.indexOf(Tema.atual()) + 1) % TEMAS.length); return; }
    let melhor = 0;
    ANGULOS.forEach((g, i) => { if (Math.abs(g - a.valor) < Math.abs(ANGULOS[melhor] - a.valor)) melhor = i; });
    escolher(melhor);
  };
  botao.addEventListener('pointerup', soltar);
  botao.addEventListener('pointercancel', soltar);
  botao.addEventListener('keydown', (e) => {
    const i = TEMAS.indexOf(Tema.atual());
    const mapa = { ArrowRight: i + 1, ArrowUp: i + 1, ArrowLeft: i - 1, ArrowDown: i - 1, Home: 0, End: TEMAS.length - 1 };
    if (!(e.key in mapa)) return;
    e.preventDefault();
    escolher(mapa[e.key]);
  });
  void dial;
})();
