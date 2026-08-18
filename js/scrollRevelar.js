/* Revela os blocos conforme entram na tela. Uma vez revelado, para de observar. */
(function () {
  const alvos = document.querySelectorAll('.revelar');

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    alvos.forEach(el => el.classList.add('visivel'));
    return;
  }

  const observador = new IntersectionObserver((entradas, obs) => {
    entradas.forEach(entrada => {
      if (!entrada.isIntersecting) return;
      entrada.target.classList.add('visivel');
      obs.unobserve(entrada.target);
    });
  }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });

  alvos.forEach(el => observador.observe(el));
})();
