/* Cada ano da linha do tempo abre a sua imagem no painel.
   No desktop o painel fica fixo à direita; no telefone ele é movido para
   logo abaixo do item clicado, senão a foto apareceria longe do clique. */
(function () {
  const lista = document.getElementById('linhaTempo');
  const painel = document.getElementById('trajetoriaPainel');
  const moldura = painel.querySelector('.painelMoldura');
  const imagem = document.getElementById('painelImagem');
  const varredura = document.getElementById('painelVarredura');
  const legenda = document.getElementById('painelLegenda');
  const texto = document.getElementById('painelTexto');

  const itens = [...lista.querySelectorAll('.linhaTempoItem')];
  const colunaDesktop = painel.parentElement; // .trajetoriaGrade
  const ehDesktop = window.matchMedia('(min-width: 901px)');
  const movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)');

  let selecionado = itens[0];

  /* reinicia uma animação CSS: tira a classe, força o navegador a notar
     que ela sumiu, devolve — assim ela toca de novo mesmo se já tivesse rodado */
  function reanimar(elemento, classe) {
    elemento.classList.remove(classe);
    void elemento.offsetWidth;
    elemento.classList.add(classe);
  }

  function posicionarPainel(item) {
    if (ehDesktop.matches) {
      colunaDesktop.appendChild(painel);
    } else {
      item.querySelector('.linhaTempoCorpo').appendChild(painel);
    }
  }

  function marcar(item) {
    itens.forEach(i => {
      const ativo = i === item;
      i.classList.toggle('selecionado', ativo);
      i.querySelector('.linhaTempoAno').setAttribute('aria-pressed', String(ativo));
    });
  }

  function trocar(item, animar) {
    selecionado = item;
    marcar(item);
    posicionarPainel(item);

    texto.textContent = item.dataset.legenda;
    imagem.alt = item.dataset.legenda;

    if (!animar || movimentoReduzido.matches) {
      imagem.src = item.dataset.img;
      return;
    }

    // carrega a imagem escondida antes de animar, senão a animação
    // rodaria em cima de um quadro vazio até a imagem chegar
    moldura.classList.add('carregando');
    const previa = new Image();
    previa.onload = previa.onerror = () => {
      moldura.classList.remove('carregando');
      imagem.src = item.dataset.img;
      reanimar(imagem, 'entrando');
      reanimar(varredura, 'ativa');
      reanimar(legenda, 'entrando');
    };
    previa.src = item.dataset.img;
  }

  lista.addEventListener('click', (evento) => {
    const botao = evento.target.closest('.linhaTempoAno');
    if (!botao) return;
    const item = botao.closest('.linhaTempoItem');
    if (item !== selecionado) trocar(item, true);
  });

  // setas para cima/baixo percorrem os anos, como numa lista
  lista.addEventListener('keydown', (evento) => {
    if (!evento.target.closest('.linhaTempoAno')) return;
    if (evento.key !== 'ArrowDown' && evento.key !== 'ArrowUp') return;

    evento.preventDefault();
    const atual = itens.indexOf(evento.target.closest('.linhaTempoItem'));
    const passo = evento.key === 'ArrowDown' ? 1 : -1;
    const proximo = itens[(atual + passo + itens.length) % itens.length];

    trocar(proximo, true);
    proximo.querySelector('.linhaTempoAno').focus();
  });

  ehDesktop.addEventListener('change', () => posicionarPainel(selecionado));

  trocar(itens[0], false); // estado inicial, sem animação
})();
