/* =========================================================================
   Herói: o letreiro de palhetas, o mascote e o mostrador de tema.
   ========================================================================= */

(function () {
  'use strict';

  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------
     Letreiro: um painel de palhetas (split-flap) que troca o que eu faço
     --------------------------------------------------------------------- */
  const letreiro = document.getElementById('letreiro');
  const FRASES = ['JOGOS NA GODOT', 'BACK-END', 'DESKTOP EM DELPHI', 'RUST, APRENDENDO', 'GO, O PRÓXIMO', 'INTERFACES', 'C++ COMPETITIVO', 'DIREÇÃO DE ARTE'];
  const CASAS = Math.max(...FRASES.map((f) => f.length));
  const SORTEIO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#+-';
  const celulas = [];
  for (let i = 0; i < CASAS; i += 1) {
    const c = document.createElement('span');
    c.className = 'vazio';
    c.setAttribute('aria-hidden', 'true');
    c.textContent = '·';
    letreiro.appendChild(c);
    celulas.push(c);
  }
  const leitor = document.createElement('span');
  leitor.className = 'acessivel-oculto';
  letreiro.appendChild(leitor);

  let iFrase = -1;
  let rodada = 0;
  function mostrar(frase) {
    const minha = ++rodada;
    leitor.textContent = frase.toLowerCase();
    celulas.forEach((c, i) => {
      const alvo = frase[i] || ' ';
      const atual = c.classList.contains('vazio') ? ' ' : c.textContent;
      if (alvo === atual) return;
      const assentar = () => {
        if (minha !== rodada) return;
        c.classList.toggle('vazio', alvo === ' ');
        c.textContent = alvo === ' ' ? '·' : alvo;
      };
      if (reduzido) { assentar(); return; }
      let voltas = 2 + Math.floor(Math.random() * 4);
      setTimeout(function virar() {
        if (minha !== rodada) return;
        c.classList.remove('virando');
        void c.offsetWidth;
        c.classList.add('virando');
        if (voltas-- > 0) {
          c.classList.remove('vazio');
          c.textContent = SORTEIO[Math.floor(Math.random() * SORTEIO.length)];
          setTimeout(virar, 60);
        } else {
          assentar();
        }
      }, i * 32);
    });
  }
  function proximaFrase() {
    iFrase = (iFrase + 1) % FRASES.length;
    mostrar(FRASES[iFrase]);
  }
  window.iniciarLetreiro = () => {
    if (window._letreiroIniciado) return;
    window._letreiroIniciado = true;
    proximaFrase();
    if (!reduzido) setInterval(() => { if (!document.hidden && naTela(letreiro)) proximaFrase(); }, 3200);
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
  const CENTRO = { x: 115, y: 104 };
  const RAIO = 92;

  const botoesRotulo = TEMAS.map((t, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'dial-rotulo';
    b.innerHTML = `<i></i>${Tema.NOMES[t]}`;
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
