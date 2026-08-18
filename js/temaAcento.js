/* Troca a cor de destaque do site pelos quadradinhos do neofetch.
   Só a variável --acento muda: tudo o mais é derivado dela no CSS
   com color-mix, então um setProperty repinta a página inteira.
   A escolha fica salva pro próximo acesso. */

(function () {
  const CHAVE = 'italo:acento';
  const PADRAO = '#ffb454';

  const botoes = document.querySelectorAll('.neofetchCor');
  if (!botoes.length) return;

  const icone = document.querySelector('link[rel="icon"]');

  function valido(cor) {
    return typeof cor === 'string' && /^#[0-9a-f]{6}$/i.test(cor);
  }

  function faviconCom(cor) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="22" fill="#0b0e12"/>
      <text x="50" y="70" font-size="58" text-anchor="middle" fill="${cor}"
            font-family="monospace" font-weight="bold">&gt;_</text></svg>`;
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  }

  function aplicar(cor, salvar) {
    if (!valido(cor)) cor = PADRAO;

    if (cor === PADRAO) {
      // volta ao valor da folha de estilo em vez de fixar um inline
      document.documentElement.style.removeProperty('--acento');
    } else {
      document.documentElement.style.setProperty('--acento', cor);
    }

    botoes.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.cor === cor)));
    if (icone) icone.href = faviconCom(cor);

    if (!salvar) return;
    try {
      if (cor === PADRAO) localStorage.removeItem(CHAVE);
      else localStorage.setItem(CHAVE, cor);
    } catch {
      /* modo privado ou storage bloqueado — a troca vale só nesta sessão */
    }
  }

  botoes.forEach(botao => {
    botao.addEventListener('click', () => aplicar(botao.dataset.cor, true));
  });

  let salvo = null;
  try { salvo = localStorage.getItem(CHAVE); } catch { /* segue com o padrão */ }
  aplicar(salvo || PADRAO, false);
})();
