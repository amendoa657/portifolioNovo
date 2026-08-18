/* Botão de voltar ao topo — aparece depois da primeira dobra. */

(function () {
  const botao = document.getElementById('voltarTopo');
  if (!botao) return;

  let agendado = false;

  function atualizar() {
    botao.classList.toggle('visivel', window.scrollY > window.innerHeight * .8);
    agendado = false;
  }

  window.addEventListener('scroll', () => {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(atualizar);
  }, { passive: true });

  botao.addEventListener('click', () => {
    const suave = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: suave ? 'smooth' : 'auto' });
  });

  atualizar();
})();
