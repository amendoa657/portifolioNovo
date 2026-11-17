/* =========================================================================
   Tema: o "wallpaper" do site.
   Como na Mosaic, trocar a cor é só redefinir as variáveis (data-paleta no
   <html>). A troca vem numa onda: a página é coberta a partir do clique nas
   cores de agora e se revela já nas cores novas.

   window.Tema = { aplicar(nome, {x, y}), proximo({x, y}), atual() }
   ========================================================================= */

(function () {
  'use strict';

  const PALETAS = ['menta', 'laranja', 'azul', 'uva'];
  const NOMES = { menta: 'Menta', laranja: 'Laranja', azul: 'Azul', uva: 'Uva' };
  const raiz = document.documentElement;
  const cortina = document.getElementById('cortina');
  let trocando = false;

  const atual = () => raiz.getAttribute('data-paleta') || 'menta';

  function marcarBotoes() {
    document.querySelectorAll('.wallpaper-opcao').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.paleta === atual()));
    });
    const cor = getComputedStyle(raiz).getPropertyValue('--mo-janela').trim();
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta && cor) meta.setAttribute('content', cor);
  }

  function definir(nome) {
    if (nome === 'menta') raiz.removeAttribute('data-paleta');
    else raiz.setAttribute('data-paleta', nome);
    try { localStorage.setItem('italo:paleta', nome); } catch (e) {}
    marcarBotoes();
    document.dispatchEvent(new CustomEvent('tema', { detail: { nome } }));
  }

  async function aplicar(nome, { x, y } = {}) {
    if (!PALETAS.includes(nome) || nome === atual() || trocando) return;
    trocando = true;
    const ox = x ?? window.innerWidth / 2;
    const oy = y ?? window.innerHeight / 2;
    try {
      if (window.Pixels && !Pixels.reduzido.matches) {
        cortina.classList.add('ativa');
        await Pixels.cobrir(cortina, { x: ox, y: oy, passo: 24, espalhar: 300, crescer: 160 });
        definir(nome);
        await new Promise(requestAnimationFrame);
        await Pixels.revelar(cortina, { x: ox, y: oy, passo: 24, espalhar: 380, encolher: 220 });
      } else {
        definir(nome);
      }
    } finally {
      cortina.classList.remove('ativa');
      trocando = false;
    }
    if (window.avisar) avisar('Wallpaper ' + NOMES[nome] + ' — o site inteiro se repintou');
  }

  function proximo(origem) {
    const i = PALETAS.indexOf(atual());
    return aplicar(PALETAS[(i + 1) % PALETAS.length], origem);
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('.wallpaper-opcao');
    if (!b) return;
    const r = b.getBoundingClientRect();
    aplicar(b.dataset.paleta, { x: e.clientX || r.left + r.width / 2, y: e.clientY || r.top + r.height / 2 });
  });

  marcarBotoes();
  window.Tema = { aplicar, proximo, atual, PALETAS };
})();
