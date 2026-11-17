/* =========================================================================
   Texto que se monta em pixels.
   O texto do título é desenhado num canvas, amostrado numa grade, e cada
   célula acesa vira um quadradinho que voa até o lugar na cor de uma das
   ondas do campo. Quando todos assentam, ganham a cor do texto e o texto
   de verdade aparece por baixo — o canvas some.

   <h2 data-pixel-texto>...</h2>       monta quando entra na tela
   <h1 data-pixel-texto="heroi">       espera PixelTexto.montar(el)

   window.PixelTexto = { montar(el) }
   ========================================================================= */

(function () {
  'use strict';

  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const alvos = Array.from(document.querySelectorAll('[data-pixel-texto]'));
  if (reduzido || !alvos.length) {
    window.PixelTexto = { montar() { return Promise.resolve(); } };
    return;
  }

  /* Escondido até montar (o CSS só esconde quando o JS está aqui). */
  alvos.forEach((el) => el.classList.add('pixel-texto-montando'));

  const acaso = (i) => {
    const s = Math.sin(i * 12.9898) * 43758.5453;
    return s - Math.floor(s);
  };
  const saida = (p) => 1 - (1 - p) ** 3;

  /* Cada caractere do elemento com a sua posição na tela e a sua cor. */
  function caracteres(el) {
    const lista = [];
    const andar = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const faixa = document.createRange();
    let no;
    while ((no = andar.nextNode())) {
      const pai = no.parentElement;
      const estilo = getComputedStyle(pai);
      const fonte = `${estilo.fontStyle} ${estilo.fontWeight} ${estilo.fontSize} ${estilo.fontFamily}`;
      for (let i = 0; i < no.length; i += 1) {
        const ch = no.data[i];
        if (!ch.trim()) continue;
        faixa.setStart(no, i);
        faixa.setEnd(no, i + 1);
        const r = faixa.getBoundingClientRect();
        if (!r.width) continue;
        lista.push({ ch, r, fonte, cor: estilo.color });
      }
    }
    return lista;
  }

  function montar(el, opcoes = {}) {
    return new Promise((resolver) => {
      if (!el.classList.contains('pixel-texto-montando')) return resolver();
      if (el.dataset.montado) return resolver();
      el.dataset.montado = '1';

      /* As cores reais, lidas antes de esconder. */
      el.classList.remove('pixel-texto-montando');
      const chars = caracteres(el);
      el.classList.add('pixel-texto-montando');
      if (!chars.length) { el.classList.remove('pixel-texto-montando'); return resolver(); }

      const caixa = el.getBoundingClientRect();
      const margem = Math.round(Math.min(220, caixa.height * 0.9));
      const L = Math.ceil(caixa.width + margem * 2);
      const A = Math.ceil(caixa.height + margem * 2);
      const tamFonte = parseFloat(getComputedStyle(el).fontSize) || 60;
      const passo = opcoes.passo || Math.max(3, Math.round(tamFonte / 26));

      /* 1. Desenha o texto num rascunho e amostra a grade. */
      const rascunho = document.createElement('canvas');
      rascunho.width = L;
      rascunho.height = A;
      const rc = rascunho.getContext('2d', { willReadFrequently: true });
      const corIndice = new Map();
      const coresFinais = [];
      for (const c of chars) {
        rc.font = c.fonte;
        const m = rc.measureText(c.ch);
        const sobe = m.fontBoundingBoxAscent ?? m.actualBoundingBoxAscent;
        if (!corIndice.has(c.cor)) { corIndice.set(c.cor, coresFinais.length); coresFinais.push(c.cor); }
        /* A cor vai codificada no canal azul ((índice + 1) × 60), para saber de quem é cada célula. */
        rc.fillStyle = `rgb(255, 0, ${(corIndice.get(c.cor) + 1) * 60})`;
        rc.fillText(c.ch, c.r.left - caixa.left + margem, c.r.top - caixa.top + margem + sobe);
      }
      const dados = rc.getImageData(0, 0, L, A).data;

      const t = Pixels.relogio(1);
      const celulas = [];
      for (let y = 0; y < A; y += passo) {
        for (let x = 0; x < L; x += passo) {
          const cx = Math.min(L - 1, x + (passo >> 1));
          const cy = Math.min(A - 1, y + (passo >> 1));
          const k = (cy * L + cx) * 4;
          if (dados[k + 3] < 110) continue;
          celulas.push({ x, y, final: Math.min(coresFinais.length - 1, Math.max(0, Math.round(dados[k + 2] / 60) - 1)), tom: Pixels.ondaEm(x + caixa.left, y + caixa.top, t)[0] });
        }
      }

      /* 2. O canvas de verdade, por cima do elemento. */
      const canvas = document.createElement('canvas');
      canvas.className = 'pixel-texto-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      const escala = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = L * escala;
      canvas.height = A * escala;
      canvas.style.width = L + 'px';
      canvas.style.height = A + 'px';
      canvas.style.left = -margem + 'px';
      canvas.style.top = -margem + 'px';
      el.appendChild(canvas);
      const ctx = canvas.getContext('2d');
      ctx.setTransform(escala, 0, 0, escala, 0, 0);

      const tons = Pixels.cores().tons.map((c) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`);
      const voo = opcoes.voo || 720;
      const espalhar = opcoes.espalhar || 520;
      const dispersao = opcoes.dispersao || margem * 0.85;
      celulas.forEach((c, i) => {
        const a = acaso(i + 1) * Math.PI * 2;
        const d = dispersao * (0.35 + acaso(i + 7) * 0.65);
        c.dx = Math.cos(a) * d;
        c.dy = Math.sin(a) * d * 0.6 + dispersao * 0.25;
        c.atraso = (c.x / L) * espalhar + acaso(i + 3) * 140;
      });
      const fim = espalhar + 140 + voo;

      let inicio = 0;
      function quadro(agora) {
        if (!inicio) inicio = agora;
        const dec = agora - inicio;
        ctx.clearRect(0, 0, L, A);
        const caminhosTom = [new Path2D(), new Path2D(), new Path2D()];
        const caminhosFinal = coresFinais.map(() => new Path2D());
        const lado = passo - 1;
        for (const c of celulas) {
          const p = (dec - c.atraso) / voo;
          if (p <= 0) continue;
          if (p >= 1) { caminhosFinal[c.final].rect(c.x, c.y, lado, lado); continue; }
          const e = saida(p);
          const l = lado * (0.25 + 0.75 * e);
          const x = c.x + c.dx * (1 - e) + (lado - l) / 2;
          const y = c.y + c.dy * (1 - e) + (lado - l) / 2;
          caminhosTom[c.tom].rect(x, y, l, l);
        }
        for (let k = 0; k < 3; k += 1) { ctx.fillStyle = tons[k]; ctx.fill(caminhosTom[k]); }
        coresFinais.forEach((cor, k) => { ctx.fillStyle = cor; ctx.fill(caminhosFinal[k]); });

        if (dec < fim) { requestAnimationFrame(quadro); return; }

        /* 3. Todos assentaram: o texto real aparece e o canvas some. */
        el.classList.remove('pixel-texto-montando');
        canvas.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, easing: 'ease-out', fill: 'forwards' })
          .finished.then(() => canvas.remove(), () => canvas.remove());
        resolver();
      }
      requestAnimationFrame(quadro);
    });
  }

  /* Os títulos de seção montam quando entram na tela. */
  const prontas = document.fonts ? document.fonts.ready : Promise.resolve();
  prontas.then(() => {
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        observador.unobserve(e.target);
        montar(e.target);
      });
    }, { threshold: 0.35, rootMargin: '0px 0px -8% 0px' });
    alvos.filter((el) => el.dataset.pixelTexto !== 'heroi').forEach((el) => observador.observe(el));
  });

  /* Rede de segurança: se algo der errado, o texto nunca fica escondido. */
  window.addEventListener('error', () => alvos.forEach((el) => el.classList.remove('pixel-texto-montando')));

  window.PixelTexto = { montar: (el, o) => prontas.then(() => montar(el, o)) };
})();
