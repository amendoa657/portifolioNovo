/* =========================================================================
   Tema: como no Mosaic OS, um tema troca as cores E as formas.
   mosaic · gruvbox · horizonte · papel · fósforo
   A troca vem numa onda: a página é coberta a partir da origem nas cores de
   agora e se revela já no tema novo.

   window.Tema = { aplicar(nome, {x, y}), proximo({x, y}), atual(), TEMAS, NOMES }
   ========================================================================= */

(function () {
  'use strict';

  const TEMAS = ['mosaic', 'gruvbox', 'horizonte', 'papel', 'fosforo'];
  const NOMES = { mosaic: 'mosaic', gruvbox: 'gruvbox', horizonte: 'horizonte', papel: 'papel', fosforo: 'fósforo' };
  const FRASES = {
    mosaic: 'Tema Mosaic — blocos chapados nas cores do wallpaper',
    gruvbox: 'Tema Gruvbox — neo-brutalismo quente, sombra dura',
    horizonte: 'Tema Horizonte — pôr do sol dos anos 70, traço fino e grão',
    papel: 'Tema Papel — tinta preta, vermelho e azul, de dia',
    fosforo: 'Tema Fósforo — um CRT verde às três da manhã',
  };
  const raiz = document.documentElement;
  const cortina = document.getElementById('cortina');
  let trocando = false;

  const atual = () => {
    const t = raiz.getAttribute('data-tema');
    return TEMAS.includes(t) ? t : 'mosaic';
  };

  function sincronizar() {
    const t = atual();
    document.querySelectorAll('[data-tema-nome]').forEach((el) => { el.textContent = NOMES[t]; });
    const meta = document.querySelector('meta[name="theme-color"]');
    const cor = getComputedStyle(raiz).getPropertyValue('--mo-fundo').trim();
    if (meta && cor) meta.setAttribute('content', cor);
  }

  function definir(nome) {
    raiz.setAttribute('data-tema', nome);
    try { localStorage.setItem('italo:tema', nome); } catch (e) {}
    sincronizar();
    document.dispatchEvent(new CustomEvent('tema', { detail: { nome } }));
  }

  async function aplicar(nome, { x, y, silencioso } = {}) {
    if (!TEMAS.includes(nome) || nome === atual() || trocando) return;
    trocando = true;
    const ox = x ?? window.innerWidth / 2;
    const oy = y ?? window.innerHeight / 2;
    try {
      if (window.Pixels && !Pixels.reduzido.matches) {
        cortina.classList.add('ativa');
        await Pixels.cobrir(cortina, { x: ox, y: oy, passo: 24, espalhar: 300, crescer: 160 });
        definir(nome);
        /* Fontes podem mudar (Fraunces, mono): espera um quadro para o layout assentar. */
        await new Promise(requestAnimationFrame);
        await Pixels.revelar(cortina, { x: ox, y: oy, passo: 24, espalhar: 380, encolher: 220 });
      } else {
        definir(nome);
      }
    } finally {
      cortina.classList.remove('ativa');
      trocando = false;
    }
    if (!silencioso && window.avisar) avisar(FRASES[nome]);
  }

  function proximo(origem) {
    const i = TEMAS.indexOf(atual());
    return aplicar(TEMAS[(i + 1) % TEMAS.length], origem);
  }

  /* O botão do cabeçalho passa para o próximo tema. */
  const botao = document.getElementById('botaoTema');
  if (botao) {
    botao.addEventListener('click', (e) => {
      const r = botao.getBoundingClientRect();
      proximo({ x: e.clientX || r.left + r.width / 2, y: e.clientY || r.top + r.height / 2 });
    });
  }

  sincronizar();
  window.Tema = { aplicar, proximo, atual, TEMAS, NOMES };
})();
