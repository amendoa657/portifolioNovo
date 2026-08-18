/* Menu hambúrguer: abre/fecha, fecha ao navegar, ao clicar fora e no Esc. */

(function () {
  const botao = document.getElementById('navAlternar');
  const lista = document.getElementById('navLinks');
  if (!botao || !lista) return;

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

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lista.classList.contains('aberto')) {
      fechar();
      botao.focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (!lista.classList.contains('aberto')) return;
    if (e.target.closest('.navInterna')) return;
    fechar();
  });
})();
