/* =========================================================================
   Projetos: o índice e a busca.
   E o filtro do "o que eu sei fazer".
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
     O que eu sei fazer: destacar por nível e pular para as provas
     --------------------------------------------------------------------- */
  const lista = document.getElementById('competenciasLista');
  const niveis = Array.from(document.querySelectorAll('.nivel'));
  niveis.forEach((b) => b.addEventListener('click', () => {
    niveis.forEach((n) => n.setAttribute('aria-pressed', String(n === b)));
    lista.dataset.destaque = b.dataset.nivel;
  }));
  /* Uma prova leva ao índice já filtrado pelo projeto. */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-busca-projeto]');
    if (!a) return;
    e.preventDefault();
    filtro = 'todos';
    filtros.forEach((f) => f.setAttribute('aria-pressed', String(f.dataset.filtro === 'todos')));
    busca.value = a.dataset.buscaProjeto;
    aplicar();
    const r = a.getBoundingClientRect();
    if (window.irPara) irPara('#projetos', e.clientX || r.left, e.clientY || r.top);
  });
})();
