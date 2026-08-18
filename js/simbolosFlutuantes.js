/* Símbolos discretos subindo pelas margens laterais.
   Só entram quando sobra espaço fora do conteúdo (telas largas), ficam em
   opacidade baixa e usam só transform/opacity para não custar repaint. */

(function () {
  /* sorteio por categoria — assim as três sempre aparecem na tela,
     em vez de depender da ordem de uma lista única */
  const CATEGORIAS = [
    { glifos: ['{ }', '</>', '=>', '&&', '()', ';', '[]', '!='], quantos: 5 },
    { glifos: ['~/', '>_', '$', '|', 'sudo', '/etc'],            quantos: 4 },
    { glifos: ['♪', '♫', '♬', '𝄞'],                              quantos: 3 },
  ];

  // precisa de margem sobrando dos dois lados do conteúdo (max 1080px)
  const temEspaco = window.matchMedia('(min-width: 1280px)');
  const movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)');

  let camada = null;

  function sortear(min, max) {
    return min + Math.random() * (max - min);
  }

  /* monta a lista final: N glifos distintos de cada categoria, embaralhados */
  function sortearGlifos() {
    const escolhidos = [];

    CATEGORIAS.forEach(({ glifos, quantos }) => {
      const sobrando = [...glifos];
      for (let i = 0; i < quantos && sobrando.length; i++) {
        escolhidos.push(sobrando.splice(Math.floor(Math.random() * sobrando.length), 1)[0]);
      }
    });

    for (let i = escolhidos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [escolhidos[i], escolhidos[j]] = [escolhidos[j], escolhidos[i]];
    }
    return escolhidos;
  }

  function construir() {
    if (camada) return;

    camada = document.createElement('div');
    camada.className = 'camadaSimbolos';
    camada.setAttribute('aria-hidden', 'true');

    sortearGlifos().forEach((simbolo, i) => {
      const glifo = document.createElement('span');
      glifo.className = 'simbolo';
      glifo.textContent = simbolo;

      const naEsquerda = i % 2 === 0;
      glifo.style[naEsquerda ? 'left' : 'right'] = `${sortear(1.5, 7)}%`;

      glifo.style.setProperty('--atraso', `${sortear(-30, 0)}s`);
      glifo.style.setProperty('--duracao', `${sortear(26, 46)}s`);
      glifo.style.setProperty('--opacidade', sortear(0.10, 0.20).toFixed(2));
      glifo.style.setProperty('--tamanho', `${sortear(0.75, 1.15).toFixed(2)}rem`);
      glifo.style.setProperty('--giro', `${sortear(-10, 10).toFixed(1)}deg`);

      camada.appendChild(glifo);
    });

    document.body.appendChild(camada);
  }

  function destruir() {
    if (!camada) return;
    camada.remove();
    camada = null;
  }

  function avaliar() {
    if (temEspaco.matches && !movimentoReduzido.matches) construir();
    else destruir();
  }

  temEspaco.addEventListener('change', avaliar);
  movimentoReduzido.addEventListener('change', avaliar);
  avaliar();
})();
