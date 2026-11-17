/* =========================================================================
   Projetos: o índice, a busca e a prévia que segue o mouse.
   E o teclado da stack.
   ========================================================================= */

(function () {
  'use strict';

  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------
     Busca e filtro (como o Instalados da loja)
     --------------------------------------------------------------------- */
  const busca = document.getElementById('buscaProjetos');
  const filtros = Array.from(document.querySelectorAll('[data-filtro]'));
  const linhas = Array.from(document.querySelectorAll('#indice .indice-linha'));
  const vazio = document.getElementById('projetosVazio');
  const contagem = document.getElementById('indiceContagem');
  let filtro = 'todos';
  const normalizar = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  function aplicar() {
    const termo = normalizar(busca.value.trim());
    let n = 0;
    linhas.forEach((l) => {
      const texto = normalizar(l.dataset.busca + ' ' + l.textContent);
      const mostra = (filtro === 'todos' || l.dataset.area.split(' ').includes(filtro)) && (!termo || texto.includes(termo));
      l.hidden = !mostra;
      l.classList.remove('filtrando');
      if (mostra) {
        l.style.setProperty('--ordem', n);
        void l.offsetWidth;
        l.classList.add('filtrando');
        n += 1;
      }
    });
    vazio.hidden = n > 0;
    contagem.textContent = n === 1 ? '1 resultado' : `${n} resultados`;
  }
  busca.addEventListener('input', aplicar);
  busca.addEventListener('keydown', (e) => { if (e.key === 'Escape') { busca.value = ''; aplicar(); busca.blur(); } });
  filtros.forEach((b) => b.addEventListener('click', () => {
    filtro = b.dataset.filtro;
    filtros.forEach((f) => f.setAttribute('aria-pressed', String(f === b)));
    aplicar();
  }));

  /* ---------------------------------------------------------------------
     Prévia: um quadro que segue o mouse e se revela numa onda de pixels
     --------------------------------------------------------------------- */
  const previa = document.getElementById('previa');
  const quadro = document.getElementById('previaQuadro');
  const fino = window.matchMedia('(hover: hover) and (pointer: fine)');
  let alvoX = 0; let alvoY = 0; let x = 0; let y = 0; let vivo = false; let quadroAtual = null;

  function conteudo(linha) {
    const fonte = linha.dataset.previa;
    if (fonte === 'ladrilho') return `<div class="previa-ladrilho">${linha.dataset.letra || ''}</div>`;
    const classes = [linha.dataset.pixelada ? 'pixelada' : '', linha.dataset.previaFundo ? 'contida' : ''].join(' ');
    return `<img src="${fonte}" alt="" class="${classes}">`;
  }
  /* Pré-carrega as imagens das prévias */
  linhas.forEach((l) => { if (l.dataset.previa !== 'ladrilho') { const i = new Image(); i.src = l.dataset.previa; } });

  function seguir() {
    x += (alvoX - x) * 0.2;
    y += (alvoY - y) * 0.2;
    const giro = Math.max(-6, Math.min(6, (alvoX - x) * 0.08));
    previa.style.setProperty('--x', x + 'px');
    previa.style.setProperty('--y', y + 'px');
    quadro.style.setProperty('--giro', giro.toFixed(2) + 'deg');
    if (vivo) requestAnimationFrame(seguir);
  }
  linhas.forEach((l) => {
    const a = l.querySelector('a');
    a.addEventListener('pointerenter', (e) => {
      if (!fino.matches) return;
      const tom = Array.from(l.classList).find((c) => c.startsWith('mo-tom-'));
      previa.className = 'previa ativa ' + tom;
      const trocar = () => { quadro.innerHTML = conteudo(l); };
      if (!vivo) {
        vivo = true;
        alvoX = x = e.clientX + 24;
        alvoY = y = e.clientY - 120;
        requestAnimationFrame(seguir);
      }
      if (quadroAtual === l) return;
      quadroAtual = l;
      if (window.Pixels && !reduzido) {
        Pixels.revelarElemento(quadro, { passo: 14, corCortina: getComputedStyle(document.documentElement).getPropertyValue('--mo-janela').trim(), trocar });
      } else trocar();
    });
    a.addEventListener('pointermove', (e) => { alvoX = e.clientX + 24; alvoY = e.clientY - 120; });
  });
  document.getElementById('indice').addEventListener('pointerleave', () => {
    vivo = false;
    quadroAtual = null;
    previa.classList.remove('ativa');
  });

  /* ---------------------------------------------------------------------
     O teclado da stack
     --------------------------------------------------------------------- */
  const saida = document.getElementById('tecladoSaida');
  let escrevendo = 0;
  document.getElementById('teclado').addEventListener('click', (e) => {
    const tecla = e.target.closest('.mo-tecla');
    if (!tecla) return;
    document.querySelectorAll('#teclado .mo-tecla[aria-pressed]').forEach((t) => t.removeAttribute('aria-pressed'));
    tecla.setAttribute('aria-pressed', 'true');
    const [onde, nota] = (tecla.dataset.onde || '').split('|');
    const grupo = tecla.closest('.teclado-grupo').querySelector('.rotulo').textContent.trim();
    const nomeTecla = tecla.textContent.trim();
    const frequencia = tecla.classList.contains('principal') ? '<span class="mo-selo mo-selo--vivo">todo dia</span>'
      : tecla.classList.contains('aprendendo') ? '<span class="mo-selo">aprendendo</span>' : '<span class="fraco">de vez em quando</span>';
    const linhasSaida = [
      `<span class="seta">$</span> grep -r "${nomeTecla.toLowerCase()}" ${grupo}`,
      `<span class="seta">›</span> <span class="nome">${nomeTecla}</span> ${frequencia}`,
      `<span class="seta">›</span> onde: ${onde}`,
      `<span class="seta">›</span> <span class="fraco">${nota}</span>`,
    ];
    const minha = ++escrevendo;
    saida.innerHTML = '';
    linhasSaida.forEach((html, i) => {
      setTimeout(() => {
        if (minha !== escrevendo) return;
        const d = document.createElement('div');
        d.className = 'linha';
        d.innerHTML = html + (i === linhasSaida.length - 1 ? '<span class="mo-caret"></span>' : '');
        saida.appendChild(d);
      }, reduzido ? 0 : i * 90);
    });
  });
})();
