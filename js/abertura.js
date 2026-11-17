/* =========================================================================
   Abertura: como a da Mosaic Store. A janela nasce coberta com a marca
   girando no meio; quando tudo está pronto, a página se revela numa onda
   de pixels que sai da marca — e o nome se monta em pixels por cima.
   Roda uma vez por sessão. Clique ou qualquer tecla pula.
   ========================================================================= */

(function () {
  'use strict';

  const raiz = document.documentElement;
  const abertura = document.getElementById('abertura');
  const nome = document.getElementById('nome');

  function entrarHeroi(atraso = 0) {
    setTimeout(() => {
      if (window.revelarHeroi) revelarHeroi();
      if (window.iniciarLetreiro) setTimeout(iniciarLetreiro, 500);
      if (window.PixelTexto) PixelTexto.montar(nome, { voo: 780, espalhar: 620 });
    }, atraso);
  }

  if (raiz.classList.contains('sem-abertura') || !abertura || !window.Pixels) {
    if (abertura) abertura.remove();
    entrarHeroi(60);
    return;
  }

  try { sessionStorage.setItem('italo:abertura', '1'); } catch (e) {}

  const blocos = document.getElementById('aberturaBlocos');
  const texto = document.getElementById('aberturaTexto');
  const marca = abertura.querySelector('.mo-marca');
  const N = 12;
  for (let i = 0; i < N; i += 1) {
    const b = document.createElement('i');
    b.className = 'mo-tom-' + (i % 4);
    blocos.appendChild(b);
  }
  const FRASES = ['italo@mosaic ~ iniciando', 'lendo o wallpaper', 'matugen: gerando a paleta', 'acordando os pixels', 'pronto'];

  let terminou = false;
  let passo = 0;
  const relogio = setInterval(() => {
    passo += 1;
    if (passo <= N) blocos.children[passo - 1].classList.add('aceso');
    texto.textContent = FRASES[Math.min(FRASES.length - 1, Math.floor((passo / N) * (FRASES.length - 1)))];
    if (passo >= N + 2) terminar();
  }, 85);

  async function terminar() {
    if (terminou) return;
    terminou = true;
    clearInterval(relogio);
    Array.from(blocos.children).forEach((b) => b.classList.add('aceso'));
    texto.textContent = 'pronto';

    /* A onda sai do centro da marca. */
    const r = marca.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const cortina = document.getElementById('cortina');
    const corJanela = getComputedStyle(raiz).getPropertyValue('--mo-janela').trim();
    if (document.fonts) await Promise.race([document.fonts.ready, new Promise((ok) => setTimeout(ok, 600))]);
    const onda = Pixels.revelar(cortina, { x, y, passo: 24, espalhar: 520, encolher: 260, corCortina: corJanela });
    abertura.remove();
    entrarHeroi(220);
    await onda;
  }

  const pular = () => { if (passo > 2) terminar(); };
  window.addEventListener('keydown', pular, { once: true });
  abertura.addEventListener('pointerdown', terminar, { once: true });
})();
