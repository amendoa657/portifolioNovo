/* Troca a cor de destaque do site pelos quadradinhos do neofetch.
   Só a variável --acento muda: tudo o mais é derivado dela no CSS
   com color-mix, então um setProperty repinta a página inteira.
   A escolha fica salva no localStorage pro próximo acesso. */
(function () {
  const CHAVE = 'italo:acento';
  const PADRAO = '#ffb454';
  const botoes = document.querySelectorAll('.neofetchCor');
  const icone = document.querySelector('link[rel="icon"]');

  function faviconCom(cor) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="22" fill="#0b0e12"/>
      <text x="50" y="70" font-size="58" text-anchor="middle" fill="${cor}"
            font-family="monospace" font-weight="bold">&gt;_</text></svg>`;
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  }

  function aplicar(cor, salvar) {
    if (cor === PADRAO) {
      document.documentElement.style.removeProperty('--acento');
      localStorage.removeItem(CHAVE);
    } else {
      document.documentElement.style.setProperty('--acento', cor);
      if (salvar) localStorage.setItem(CHAVE, cor);
    }

    botoes.forEach(botao => botao.setAttribute('aria-pressed', String(botao.dataset.cor === cor)));
    icone.href = faviconCom(cor);
  }

  botoes.forEach(botao => {
    botao.addEventListener('click', () => aplicar(botao.dataset.cor, true));
  });

  const salvo = localStorage.getItem(CHAVE);
  aplicar(salvo || PADRAO, false);
})();
