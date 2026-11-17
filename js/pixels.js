/* =========================================================================
   Pixels: o campo de pontos e a onda de pixels.

   É a mesma conta da Mosaic UI (mosaic-ui/js/pixels-worker.js): três ondas
   lentas, uma por cor do tema, passam por uma grade; em cada célula vence a
   mais forte e a força vira o tamanho do quadradinho, como uma retícula.
   A trigonometria é feita uma vez por linha e uma por coluna (soma de
   arcos) e só as células que mudaram são redesenhadas.

   A onda usa a mesma grade: para revelar, cada célula vira um quadradinho
   na cor da onda daquele ponto e encolhe até sumir, a partir da origem;
   para cobrir, o contrário.

   window.Pixels = { Campo, revelar, cobrir, limpar, cores, ondaEm }
   ========================================================================= */

(function () {
  'use strict';

  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)');

  const ONDAS = [
    { fx: 0.0062, fy: 0.0048, vx: 0.05, vy: 0.032, torcao: 1.7, fase: 0.0 },
    { fx: 0.0051, fy: 0.0069, vx: -0.041, vy: 0.046, torcao: 1.4, fase: 2.1 },
    { fx: 0.0072, fy: 0.0055, vx: 0.036, vy: -0.052, torcao: 1.9, fase: 4.4 },
  ];
  const NEUTRO = 0.12 / 0.34;
  const QUADRO_CALMO_MS = 1000 / 30;

  /* O mesmo relógio para todos: o campo e a onda mostram a mesma cor no
     mesmo ponto. Começa no meio do desenho, não no zero. */
  const relogio = (velocidade = 1) => 31 + (performance.now() / 1000) * velocidade;

  /* ---------------------------------------------------------------------
     Cores: qualquer cor CSS (hex, var, color-mix) vira [r, g, b]
     --------------------------------------------------------------------- */
  let amostra = null;
  function rgb(cor) {
    if (!amostra) {
      const c = document.createElement('canvas');
      c.width = c.height = 1;
      amostra = c.getContext('2d', { willReadFrequently: true });
    }
    const prova = document.createElement('i');
    prova.style.cssText = 'position:absolute;visibility:hidden;color:' + cor;
    document.body.appendChild(prova);
    const resolvida = getComputedStyle(prova).color;
    prova.remove();
    amostra.clearRect(0, 0, 1, 1);
    amostra.fillStyle = '#000';
    amostra.fillStyle = resolvida;
    amostra.fillRect(0, 0, 1, 1);
    const d = amostra.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  }
  const css = (c, a = 1) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;

  let coresCache = null;
  function cores(recalcular) {
    if (coresCache && !recalcular) return coresCache;
    coresCache = {
      tons: [rgb('var(--mo-destaque)'), rgb('var(--mo-secundaria)'), rgb('var(--mo-terciaria)')],
      texto: rgb('var(--mo-texto)'),
      fundo: rgb('var(--mo-fundo)'),
      janela: rgb('var(--mo-janela)'),
      cartao: rgb('var(--mo-cartao)'),
    };
    return coresCache;
  }

  /* Qual das três ondas vence num ponto (e com que força). */
  function ondaEm(x, y, t) {
    let melhor = 0;
    let forca = -Infinity;
    for (let k = 0; k < 3; k += 1) {
      const o = ONDAS[k];
      const u = x * o.fx + t * o.vx + Math.sin(y * o.fy * 0.7 + t * 0.07 + o.fase) * o.torcao;
      const v = y * o.fy + t * o.vy + Math.cos(x * o.fx * 0.6 - t * 0.05 + o.fase) * o.torcao;
      const valor = Math.sin(u) * Math.cos(v);
      if (valor > forca) { forca = valor; melhor = k; }
    }
    return [melhor, forca];
  }

  /* ---------------------------------------------------------------------
     Campo
     --------------------------------------------------------------------- */
  const campos = new Set();
  const ponteiro = { x: -9999, y: -9999, mexeuEm: 0 };
  let quadro = 0;

  class Campo {
    constructor(canvas, opcoes = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.passo = opcoes.passo || 18;
      this.lente = opcoes.lente ?? 150;
      this.velocidade = opcoes.velocidade ?? 1;
      this.opacidade = opcoes.opacidade ?? 0.34;
      this.fixo = !!opcoes.fixo; // ocupa a janela inteira
      this.visivel = true;
      this.lx = -9999; this.ly = -9999; // a lente, atrasada em relação ao mouse
      this.ultimo = 0;
      this.anterior = null;
      this.definirCores();
      this.redimensionar();
      campos.add(this);

      if (!this.fixo && 'IntersectionObserver' in window) {
        new IntersectionObserver(([e]) => {
          this.visivel = e.isIntersecting;
          if (this.visivel) acordar();
        }).observe(canvas);
      }
      acordar();
    }

    definirCores() {
      const c = cores();
      this.estilos = [
        css(c.tons[0], this.opacidade),
        css(c.tons[1], this.opacidade),
        css(c.tons[2], this.opacidade),
        css(c.texto, this.opacidade * NEUTRO),
      ];
      if (this.anterior) this.anterior.fill(-1);
    }

    retangulo() {
      if (this.fixo) return { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
      return this.canvas.getBoundingClientRect();
    }

    redimensionar() {
      const r = this.retangulo();
      if (r.width < 1 || r.height < 1) return;
      this.largura = r.width;
      this.altura = r.height;
      this.escala = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = Math.round(this.largura * this.escala);
      this.canvas.height = Math.round(this.altura * this.escala);
      this.ctx.setTransform(this.escala, 0, 0, this.escala, 0, 0);
      this.prepararGrade();
      this.desenhar();
    }

    prepararGrade() {
      const passo = this.passo;
      this.colunas = Math.ceil(this.largura / passo) + 1;
      this.linhas = Math.ceil(this.altura / passo) + 1;
      const desvio = Math.floor(passo / 2);
      this.xs = new Float32Array(this.colunas);
      this.ys = new Float32Array(this.linhas);
      for (let i = 0; i < this.colunas; i += 1) this.xs[i] = i * passo + desvio;
      for (let j = 0; j < this.linhas; j += 1) this.ys[j] = j * passo + desvio;
      this.trig = ONDAS.map((o) => {
        const g = {
          sx: new Float32Array(this.colunas), cx: new Float32Array(this.colunas),
          sy: new Float32Array(this.linhas), cy: new Float32Array(this.linhas),
          sinL: new Float32Array(this.linhas), cosL: new Float32Array(this.linhas),
          sinC: new Float32Array(this.colunas), cosC: new Float32Array(this.colunas),
        };
        for (let i = 0; i < this.colunas; i += 1) { g.sx[i] = Math.sin(this.xs[i] * o.fx); g.cx[i] = Math.cos(this.xs[i] * o.fx); }
        for (let j = 0; j < this.linhas; j += 1) { g.sy[j] = Math.sin(this.ys[j] * o.fy); g.cy[j] = Math.cos(this.ys[j] * o.fy); }
        return g;
      });
      this.anterior = new Int16Array(this.colunas * this.linhas * 2).fill(-1);
    }

    desenhar() {
      if (!this.anterior) return;
      const ctx = this.ctx;
      const t = relogio(this.velocidade);
      const passo = this.passo;

      /* A lente segue o cursor com atraso, para não colar no mouse. */
      const r = this.fixo ? null : this.canvas.getBoundingClientRect();
      const alvoX = r ? ponteiro.x - r.left : ponteiro.x;
      const alvoY = r ? ponteiro.y - r.top : ponteiro.y;
      if (this.lx < -999) { this.lx = alvoX; this.ly = alvoY; }
      this.lx += (alvoX - this.lx) * 0.18;
      this.ly += (alvoY - this.ly) * 0.18;

      for (let k = 0; k < 3; k += 1) {
        const o = ONDAS[k];
        const g = this.trig[k];
        for (let j = 0; j < this.linhas; j += 1) {
          const b = t * o.vx + Math.sin(this.ys[j] * o.fy * 0.7 + t * 0.07 + o.fase) * o.torcao;
          g.sinL[j] = Math.sin(b); g.cosL[j] = Math.cos(b);
        }
        for (let i = 0; i < this.colunas; i += 1) {
          const d = t * o.vy + Math.cos(this.xs[i] * o.fx * 0.6 - t * 0.05 + o.fase) * o.torcao;
          g.sinC[i] = Math.sin(d); g.cosC[i] = Math.cos(d);
        }
      }

      const raio = this.lente;
      const lenteAtiva = raio > 0 && ponteiro.x > -999;
      const raio2 = raio * raio;
      const passoTela = 1 / this.escala;
      const ladoMax = passo - 5;
      const [g0, g1, g2] = this.trig;
      const anterior = this.anterior;
      let estiloAtual = -1;

      for (let j = 0; j < this.linhas; j += 1) {
        const y = this.ys[j];
        const dy = y - this.ly;
        for (let i = 0; i < this.colunas; i += 1) {
          const x = this.xs[i];
          const v0 = (g0.sx[i] * g0.cosL[j] + g0.cx[i] * g0.sinL[j]) * (g0.cy[j] * g0.cosC[i] - g0.sy[j] * g0.sinC[i]);
          const v1 = (g1.sx[i] * g1.cosL[j] + g1.cx[i] * g1.sinL[j]) * (g1.cy[j] * g1.cosC[i] - g1.sy[j] * g1.sinC[i]);
          const v2 = (g2.sx[i] * g2.cosL[j] + g2.cx[i] * g2.sinL[j]) * (g2.cy[j] * g2.cosC[i] - g2.sy[j] * g2.sinC[i]);

          let melhor = 0;
          let forca = v0;
          if (v1 > forca) { forca = v1; melhor = 1; }
          if (v2 > forca) { forca = v2; melhor = 2; }

          let lente = 0;
          if (lenteAtiva) {
            const dx = x - this.lx;
            const d2 = dx * dx + dy * dy;
            if (d2 < raio2) { const q = 1 - Math.sqrt(d2) / raio; lente = q * q; }
          }

          const nivel = Math.max(0, (forca - 0.35) / 0.65) + lente * 0.6;
          let lado; let estilo;
          if (nivel <= 0.02) { lado = 1 + lente * 1.5; estilo = 3; }
          else { lado = Math.min(1.5 + nivel * 4 * (passo / 15), ladoMax); estilo = melhor; }

          const ladoTela = Math.round(lado / passoTela);
          const indice = (j * this.colunas + i) * 2;
          if (anterior[indice] === ladoTela && anterior[indice + 1] === estilo) continue;

          const apagar = Math.max(anterior[indice], ladoTela) * passoTela + 2;
          ctx.clearRect(x - apagar / 2, y - apagar / 2, apagar, apagar);
          anterior[indice] = ladoTela;
          anterior[indice + 1] = estilo;
          if (ladoTela === 0) continue;
          if (estilo !== estiloAtual) { ctx.fillStyle = this.estilos[estilo]; estiloAtual = estilo; }
          const l = ladoTela * passoTela;
          ctx.fillRect(x - l / 2, y - l / 2, l, l);
        }
      }
    }
  }

  function laco(agora) {
    quadro = 0;
    if (document.hidden || reduzido.matches) return;
    let algum = false;
    const mexendo = agora - ponteiro.mexeuEm < 400;
    for (const f of campos) {
      if (!f.visivel) continue;
      algum = true;
      if (mexendo || agora - f.ultimo >= QUADRO_CALMO_MS) {
        f.ultimo = agora;
        f.desenhar();
      }
    }
    if (algum) quadro = requestAnimationFrame(laco);
  }
  function acordar() {
    if (!quadro && !document.hidden && !reduzido.matches) quadro = requestAnimationFrame(laco);
  }

  window.addEventListener('pointermove', (e) => {
    ponteiro.x = e.clientX;
    ponteiro.y = e.clientY;
    ponteiro.mexeuEm = performance.now();
    acordar();
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { ponteiro.x = -9999; ponteiro.y = -9999; });
  document.addEventListener('visibilitychange', acordar);

  let esperaResize = 0;
  window.addEventListener('resize', () => {
    clearTimeout(esperaResize);
    esperaResize = setTimeout(() => campos.forEach((f) => f.redimensionar()), 120);
  });

  /* Troca de tema: todo mundo se repinta. */
  document.addEventListener('tema', () => {
    cores(true);
    campos.forEach((f) => { f.definirCores(); f.desenhar(); });
  });

  /* ---------------------------------------------------------------------
     Onda de pixels
     --------------------------------------------------------------------- */
  const ESPALHAR_MS = 320;
  const ENCOLHER_MS = 200;
  const COBRIR_ESPALHAR_MS = 260;
  const CRESCER_MS = 170;
  const execucoes = new WeakMap();

  /* Prepara o canvas e calcula, uma vez só, o atraso e a cor de cada célula. */
  function montar(canvas, { x, y, passo = 22, espalhar, corCortina, largura, altura }) {
    const ctx = canvas.getContext('2d');
    const escala = Math.min(window.devicePixelRatio || 1, 2);
    const r = canvas.getBoundingClientRect();
    const L = largura || r.width;
    const A = altura || r.height;
    canvas.width = Math.round(L * escala);
    canvas.height = Math.round(A * escala);
    ctx.setTransform(escala, 0, 0, escala, 0, 0);

    const ox = x ?? L / 2;
    const oy = y ?? A / 2;
    const colunas = Math.ceil(L / passo);
    const linhas = Math.ceil(A / passo);
    const alcance = Math.max(Math.hypot(ox, oy), Math.hypot(L - ox, oy), Math.hypot(ox, A - oy), Math.hypot(L - ox, A - oy), 1);
    const t = relogio(1);
    const total = colunas * linhas;
    const celulas = new Float32Array(total * 4);
    let n = 0;
    for (let j = 0; j < linhas; j += 1) {
      for (let i = 0; i < colunas; i += 1) {
        const cx = i * passo + passo / 2;
        const cy = j * passo + passo / 2;
        celulas[n * 4] = i * passo;
        celulas[n * 4 + 1] = j * passo;
        /* um pouquinho de acaso na frente da onda, para ela não ser um círculo de compasso */
        celulas[n * 4 + 2] = (Math.hypot(cx - ox, cy - oy) / alcance) * espalhar + Math.random() * 24;
        celulas[n * 4 + 3] = ondaEm(cx, cy, t)[0];
        n += 1;
      }
    }
    const c = cores();
    return {
      ctx, passo, celulas, total, L, A,
      feitas: new Uint8Array(total),
      estilos: c.tons.map((t2) => css(t2, 1)),
      cortina: css(corCortina || c.fundo, 1),
    };
  }

  function cancelar(canvas) {
    const anterior = execucoes.get(canvas);
    if (anterior) anterior.cancelada = true;
  }

  /* Revelar: a área nasce coberta (já neste quadro) e a onda abre a partir
     da origem. Quem chama pode trocar o conteúdo por baixo logo depois. */
  function revelar(canvas, opcoes = {}) {
    cancelar(canvas);
    if (reduzido.matches) { limpar(canvas); return Promise.resolve(); }
    const m = montar(canvas, { ...opcoes, espalhar: opcoes.espalhar || ESPALHAR_MS });
    const exec = { cancelada: false };
    execucoes.set(canvas, exec);
    m.ctx.fillStyle = m.cortina;
    m.ctx.fillRect(0, 0, m.L, m.A);
    const encolher = opcoes.encolher || ENCOLHER_MS;

    return new Promise((resolver) => {
      let inicio = 0;
      function passoQuadro(agora) {
        if (exec.cancelada) return resolver();
        if (!inicio) inicio = agora;
        const decorrido = agora - inicio;
        const { ctx, passo, celulas: cel } = m;
        let restantes = 0;
        let estiloAtual = -1;
        for (let n = 0; n < m.total; n += 1) {
          if (m.feitas[n]) continue;
          const p = (decorrido - cel[n * 4 + 2]) / encolher;
          if (p <= 0) { restantes += 1; continue; }
          const x = cel[n * 4];
          const y = cel[n * 4 + 1];
          ctx.clearRect(x, y, passo, passo);
          if (p >= 1) { m.feitas[n] = 1; continue; }
          restantes += 1;
          const saida = 1 - (1 - p) ** 3;
          const lado = (passo - 2) * (1 - saida);
          const cor = cel[n * 4 + 3];
          if (cor !== estiloAtual) { ctx.fillStyle = m.estilos[cor]; estiloAtual = cor; }
          ctx.fillRect(x + (passo - lado) / 2, y + (passo - lado) / 2, lado, lado);
        }
        if (restantes > 0) requestAnimationFrame(passoQuadro);
        else { ctx.clearRect(0, 0, m.L, m.A); resolver(); }
      }
      requestAnimationFrame(passoQuadro);
    });
  }

  /* Cobrir: a partir da origem, cada célula vira um quadradinho na cor da
     onda que cresce até fechar na cor da cortina. Fica coberto no fim. */
  function cobrir(canvas, opcoes = {}) {
    cancelar(canvas);
    if (reduzido.matches) return Promise.resolve();
    const m = montar(canvas, { ...opcoes, espalhar: opcoes.espalhar || COBRIR_ESPALHAR_MS });
    const exec = { cancelada: false };
    execucoes.set(canvas, exec);
    const crescer = opcoes.crescer || CRESCER_MS;
    m.ctx.clearRect(0, 0, m.L, m.A);

    return new Promise((resolver) => {
      let inicio = 0;
      function passoQuadro(agora) {
        if (exec.cancelada) return resolver();
        if (!inicio) inicio = agora;
        const decorrido = agora - inicio;
        const { ctx, passo, celulas: cel } = m;
        let restantes = 0;
        for (let n = 0; n < m.total; n += 1) {
          if (m.feitas[n]) continue;
          const p = (decorrido - cel[n * 4 + 2]) / crescer;
          if (p <= 0) { restantes += 1; continue; }
          const x = cel[n * 4];
          const y = cel[n * 4 + 1];
          if (p >= 1) {
            m.feitas[n] = 1;
            ctx.fillStyle = m.cortina;
            ctx.fillRect(x, y, passo + 0.5, passo + 0.5);
            continue;
          }
          restantes += 1;
          const saida = 1 - (1 - p) ** 3;
          const lado = (passo - 2) * saida;
          ctx.fillStyle = m.estilos[cel[n * 4 + 3]];
          ctx.fillRect(x + (passo - lado) / 2, y + (passo - lado) / 2, lado, lado);
        }
        if (restantes > 0) requestAnimationFrame(passoQuadro);
        else resolver();
      }
      requestAnimationFrame(passoQuadro);
    });
  }

  function limpar(canvas) {
    cancelar(canvas);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  /* Cortina local: um canvas por cima de um elemento, só durante a onda. */
  function revelarElemento(el, opcoes = {}) {
    if (reduzido.matches) { if (opcoes.trocar) opcoes.trocar(); return Promise.resolve(); }
    let canvas = el.querySelector(':scope > canvas.cortina-local');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'cortina-local';
      canvas.setAttribute('aria-hidden', 'true');
      el.appendChild(canvas);
    }
    const r = el.getBoundingClientRect();
    const x = opcoes.clienteX != null ? opcoes.clienteX - r.left : undefined;
    const y = opcoes.clienteY != null ? opcoes.clienteY - r.top : undefined;
    const vez = (canvas._vez = (canvas._vez || 0) + 1);
    const promessa = revelar(canvas, { passo: opcoes.passo || 18, x, y, corCortina: opcoes.corCortina, largura: r.width, altura: r.height });
    if (opcoes.trocar) opcoes.trocar();
    return promessa.then(() => { if (canvas._vez === vez) canvas.remove(); });
  }

  window.Pixels = { Campo, revelar, cobrir, limpar, revelarElemento, cores, rgb, ondaEm, relogio, reduzido };
})();
