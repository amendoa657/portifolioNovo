/* Destaca no menu a seção que está sendo lida no momento. */
(function () {
  const secoes = document.querySelectorAll('main section[id]');
  const links = document.querySelectorAll('#navLinks a');

  function marcar(id) {
    links.forEach(link => {
      link.classList.toggle('ativo', link.getAttribute('href') === `#${id}`);
    });
  }

  const observador = new IntersectionObserver((entradas) => {
    // a seção mais visível no centro da tela vence
    const visivel = entradas
      .filter(e => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visivel) marcar(visivel.target.id);
  }, {
    rootMargin: '-45% 0px -45% 0px'
  });

  secoes.forEach(secao => observador.observe(secao));

  // no topo da página nenhuma seção fica ativa
  window.addEventListener('scroll', () => {
    if (window.scrollY < 120) links.forEach(link => link.classList.remove('ativo'));
  }, { passive: true });
})();
