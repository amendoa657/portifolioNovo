/* Cada ano da linha do tempo abre a sua imagem no painel.
   No desktop o painel fica fixo à direita; no telefone ele é movido para
   logo abaixo do item clicado, senão a foto apareceria longe do clique. */

(function () {
  const lista   = document.getElementById('linhaTempo');
  const painel  = document.getElementById('trajetoriaPainel');
  const moldura = painel && painel.querySelector('.painelMoldura');
  const imagem  = document.getElementById('painelImagem');
  const varredura = document.getElementById('painelVarredura');
  const legenda = document.getElementById('painelLegenda');
  const texto   = document.getElementById('painelTexto');

  if (!lista || !painel || !imagem) return;

  const itens = [...lista.querySelectorAll('.linhaTempoItem')];
  if (!itens.length) return;

  const colunaDesktop = painel.parentElement;      // .trajetoriaGrade
  const ehDesktop = window.matchMedia('(min-width: 901px)');
  const movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)');

  let selecionado = itens[0];

  /* reinicia uma animação CSS: tira a classe, força refluxo, devolve */
  function reanimar(el, classe) {
    if (!el) return;
    el.classList.remove(classe);
    void el.offsetWidth;
    el.classList.add(classe);
  }

  function posicionarPainel(item) {
    if (ehDesktop.matches) {
      if (painel.parentElement !== colunaDesktop) colunaDesktop.appendChild(painel);
    } else {
      const destino = item.querySelector('.linhaTempoCorpo');
      if (destino && painel.parentElement !== destino) destino.appendChild(painel);
    }
  }

  function marcar(item) {
    itens.forEach(i => {
      const ativo = i === item;
      i.classList.toggle('selecionado', ativo);
      const botao = i.querySelector('.linhaTempoAno');
      if (botao) botao.setAttribute('aria-pressed', String(ativo));
    });
  }

  function trocar(item, animar) {
    const src = item.dataset.img;
    const descricao = item.dataset.legenda || '';

    selecionado = item;
    marcar(item);
    posicionarPainel(item);

    if (texto) texto.textContent = descricao;
    imagem.alt = descricao;

    if (!animar || movimentoReduzido.matches) {
      imagem.src = src;
      return;
    }

    // carrega antes de revelar, para a animação não rodar sobre um quadro vazio
    if (moldura) moldura.classList.add('carregando');

    const previa = new Image();
    previa.onload = previa.onerror = () => {
      if (moldura) moldura.classList.remove('carregando');
      imagem.src = src;
      reanimar(imagem, 'entrando');
      reanimar(varredura, 'ativa');
      reanimar(legenda, 'entrando');
    };
    previa.src = src;
  }

  lista.addEventListener('click', (evento) => {
    const botao = evento.target.closest('.linhaTempoAno');
    if (!botao) return;
    const item = botao.closest('.linhaTempoItem');
    if (!item || item === selecionado) return;
    trocar(item, true);
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

  // estado inicial, sem animação
  trocar(itens[0], false);
})();
