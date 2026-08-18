/* Linha fina embaixo da navbar mostrando o progresso de leitura. */

(function () {
  const barra = document.getElementById('navProgresso');
  if (!barra) return;

  let agendado = false;

  function atualizar() {
    const rolavel = document.documentElement.scrollHeight - window.innerHeight;
    const pct = rolavel > 0 ? (window.scrollY / rolavel) * 100 : 0;
    barra.style.width = `${Math.min(pct, 100)}%`;
    agendado = false;
  }

  window.addEventListener('scroll', () => {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(atualizar);
  }, { passive: true });

  window.addEventListener('resize', atualizar, { passive: true });
  atualizar();
})();
