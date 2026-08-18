/* Menu hambúrguer: abre/fecha, fecha ao navegar, ao clicar fora e no Esc.
   Tudo dentro desse (function(){ ... })() fica só neste arquivo — assim
   um nome como "botao" aqui não conflita com o "botao" de outro arquivo. */
(function () {
  const botao = document.getElementById('navAlternar');
  const lista = document.getElementById('navLinks');

  function fechar() {
    botao.classList.remove('aberto');
    lista.classList.remove('aberto');
    botao.setAttribute('aria-expanded', 'false');
    botao.setAttribute('aria-label', 'Abrir menu');
  }

  function alternar() {
    const abriu = lista.classList.toggle('aberto');
    botao.classList.toggle('aberto', abriu);
    botao.setAttribute('aria-expanded', String(abriu));
    botao.setAttribute('aria-label', abriu ? 'Fechar menu' : 'Abrir menu');
  }

  botao.addEventListener('click', alternar);

  lista.querySelectorAll('a').forEach(link => link.addEventListener('click', fechar));

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && lista.classList.contains('aberto')) {
      fechar();
      botao.focus();
    }
  });

  document.addEventListener('click', (evento) => {
    const cliqueForaDoMenu = !evento.target.closest('.navInterna');
    if (lista.classList.contains('aberto') && cliqueForaDoMenu) fechar();
  });
})();
