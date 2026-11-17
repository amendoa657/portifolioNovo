/* =========================================================================
   Evolução: a linha do tempo presa na tela.
   A rolagem avança os commits; cada troca de ano rola o número, entra o
   texto em cascata e a imagem se revela numa onda de pixels que sai do nó.
   ========================================================================= */

(function () {
  'use strict';

  const PASSOS = [
    {
      ano: '2019', hash: 'init', titulo: 'primeiro contato', img: 'img/gameMaker.webp', arquivo: 'gamemaker.webp',
      texto: '5º ano, GameMaker Studio 2. Eu fazia jogo antes de saber o que era lógica — e um deles virou o Zé Gotinha, que eu refaria anos depois.',
      legenda: 'programando tudo num pc velho da minha vó', tags: ['GameMaker', 'primeiro jogo'],
    },
    {
      ano: '2021', hash: 'feat(sistema)', titulo: 'hello, linux', img: 'img/ubuntu-20-04.webp', arquivo: 'ubuntu.webp',
      texto: 'Instalei o Ubuntu por curiosidade. Virou meu sistema principal e nunca mais voltei atrás.',
      legenda: 'em 3 semanas eu quebrei o sistema particionando o HD com ele rodando 👀', tags: ['Ubuntu', 'terminal'],
    },
    {
      ano: '2022', hash: 'refactor(sistema)', titulo: 'migrando pro arch', img: 'img/artixLinux.webp', arquivo: 'artix.webp',
      texto: 'Troquei o Ubuntu pelo Artix e caí de vez no mundo Arch. É dele que a Mosaic Store nasceria, quatro anos depois.',
      legenda: 'depois disso aqui eu descobri o que é ser feliz', tags: ['Artix', 'Arch', 'pacman'],
    },
    {
      ano: '2023', hash: 'feat(jogos)', titulo: 'godot', img: 'img/godotEngine.webp', arquivo: 'godot.webp',
      texto: 'Primeiro contato com a engine. Comecei a refazer, numa ferramenta de verdade, o jogo que eu tinha feito aos 10 anos.',
      legenda: 'a MELHOR engine de todos os tempos, viva o open source', tags: ['Godot', 'GDScript', 'Zé Gotinha'],
    },
    {
      ano: '2024', hash: 'perf(cabeça)', titulo: 'c++ e lógica', img: 'img/c++.webp', arquivo: 'cpp.webp',
      texto: 'C++ e lógica mais avançada. Foi quando parei de só fazer funcionar e comecei a olhar como funciona — e quanto custa.',
      legenda: 'nada melhor do que uma coca, c++ e neovim', tags: ['C++', 'competitiva', 'Neovim'],
    },
    {
      ano: '2025', hash: 'test(equipe)', titulo: 'Amigos Droids', img: 'img/amigosDroids.webp', arquivo: 'ftc.webp',
      texto: 'Selecionado para uma equipe mineira de robótica autônoma na FTC. Teste de fogo: POO, Java e resolver problema com o relógio correndo.',
      legenda: 'aqui foi o teste de fogo de tudo que eu já tinha aprendido', tags: ['FTC', 'Java', 'robótica'],
    },
    {
      ano: '2026', hash: 'feat(mosaic)', titulo: 'nasce a Mosaic', img: 'midia/mosaic/store-home.webp', arquivo: 'mosaic-store.webp',
      texto: 'Uma loja de pacotes pro meu Arch virou uma identidade inteira: a Mosaic Store, a biblioteca Mosaic UI, o desktop Mosaic OS — e o IndieSquad, em equipe, usando a mesma cara.',
      legenda: 'a loja, com as cores que vieram do wallpaper', tags: ['Mosaic', 'direção de arte', 'Flask', 'QML'],
    },
    {
      ano: 'hoje', hash: 'HEAD', titulo: 'HEAD → main', img: 'img/rice.webp', arquivo: 'rice.webp',
      texto: 'CachyOS com o Mosaic OS por cima. Jogos na Godot, back-end, C++ e interface acontecendo ao mesmo tempo — e nenhum atrapalhando o outro.',
      legenda: 'essa é a minha rice atual e meu ambiente de trabalho', tags: ['CachyOS', 'Hyprland', 'Mosaic OS'],
    },
  ];

  const trilho = document.getElementById('evolucaoTrilho');
  if (!trilho) return;
  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const anoEl = document.getElementById('evolucaoAno');
  const info = document.getElementById('evolucaoInfo');
  const commit = document.getElementById('evolucaoCommit');
  const titulo = document.getElementById('evolucaoTitulo');
  const texto = document.getElementById('evolucaoTexto');
  const tags = document.getElementById('evolucaoTags');
  const quadro = document.getElementById('evolucaoQuadro');
  const imagem = document.getElementById('evolucaoImagem');
  const legenda = document.getElementById('evolucaoLegenda');
  const arquivo = document.getElementById('evolucaoArquivo');
  const linha = document.getElementById('evolucaoLinha');
  const secao = document.getElementById('evolucao');

  trilho.style.setProperty('--passos', PASSOS.length);
  linha.style.setProperty('--passos', PASSOS.length);

  /* Pré-carrega as imagens: a onda não espera download. */
  PASSOS.forEach((p) => { const i = new Image(); i.src = p.img; });

  const nos = PASSOS.map((p, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'evolucao-no mo-tom-' + (i % 4);
    b.innerHTML = `<i></i><span>${p.ano}</span>`;
    b.setAttribute('aria-label', `Ir para ${p.ano}: ${p.titulo}`);
    b.addEventListener('click', () => irPara(i));
    linha.appendChild(b);
    return b;
  });

  let atual = -1;

  function mostrar(i, origem) {
    if (i === atual) return;
    const tras = i < atual;
    const anterior = atual;
    atual = i;
    const p = PASSOS[i];
    const tom = 'mo-tom-' + (i % 4);

    secao.querySelectorAll('.evolucao-grade')[0].className = 'contentor evolucao-grade ' + tom;

    /* O ano rola: o velho sai, o novo entra (para cima ou para baixo). */
    anoEl.classList.toggle('para-tras', tras);
    const velho = anoEl.querySelector('span:not(.sai)');
    if (anterior >= 0 && !reduzido) {
      if (velho) { velho.className = 'sai'; velho.addEventListener('animationend', () => velho.remove(), { once: true }); }
      const novo = document.createElement('span');
      novo.className = 'entra';
      novo.textContent = p.ano;
      anoEl.appendChild(novo);
    } else {
      anoEl.innerHTML = `<span>${p.ano}</span>`;
    }
    anoEl.querySelectorAll('span.sai').forEach((s, k, todos) => { if (k < todos.length - 1) s.remove(); });

    commit.innerHTML = `<b>${p.hash}</b> commit ${i + 1}/${PASSOS.length}`;
    titulo.textContent = p.titulo;
    texto.textContent = p.texto;
    tags.innerHTML = p.tags.map((t, k) => `<span class="mo-chip mo-chip--tom mo-tom-${(i + k) % 4}">${t}</span>`).join('');
    info.classList.remove('trocou');
    void info.offsetWidth;
    if (anterior >= 0) info.classList.add('trocou');

    nos.forEach((n, k) => {
      n.classList.toggle('feito', k <= i);
      n.classList.toggle('atual', k === i);
      if (k === i) n.setAttribute('aria-current', 'step'); else n.removeAttribute('aria-current');
    });
    linha.style.setProperty('--progresso', PASSOS.length > 1 ? i / (PASSOS.length - 1) : 0);

    const trocar = () => {
      imagem.src = p.img;
      imagem.alt = `${p.ano} — ${p.titulo}`;
      legenda.textContent = p.legenda;
      arquivo.textContent = `~/trajetoria/${p.ano}/${p.arquivo}`;
    };
    if (anterior < 0 || !window.Pixels) { trocar(); return; }

    /* A onda sai do nó da linha do tempo (ou do canto mais perto dele). */
    const r = quadro.getBoundingClientRect();
    let cx = r.left + r.width * (i / (PASSOS.length - 1));
    let cy = r.bottom;
    if (origem) { cx = origem.x; cy = origem.y; }
    cx = Math.max(r.left, Math.min(r.right, cx));
    cy = Math.max(r.top, Math.min(r.bottom, cy));
    Pixels.revelarElemento(quadro, {
      clienteX: cx, clienteY: cy, passo: 16,
      corCortina: getComputedStyle(document.documentElement).getPropertyValue('--mo-janela').trim(),
      trocar,
    });
  }

  /* A rolagem dentro do trilho escolhe o passo. */
  function indicePelaRolagem() {
    const r = trilho.getBoundingClientRect();
    const total = trilho.offsetHeight - window.innerHeight;
    const p = Math.min(1, Math.max(0, -r.top / Math.max(1, total)));
    return Math.min(PASSOS.length - 1, Math.floor(p * PASSOS.length));
  }

  function irPara(i) {
    const total = trilho.offsetHeight - window.innerHeight;
    const topo = trilho.getBoundingClientRect().top + window.scrollY;
    const alvo = topo + (total * (i + 0.5)) / PASSOS.length;
    window.scrollTo({ top: alvo, behavior: reduzido ? 'auto' : 'smooth' });
  }

  let pendente = false;
  window.addEventListener('scroll', () => {
    if (pendente) return;
    pendente = true;
    requestAnimationFrame(() => { pendente = false; mostrar(indicePelaRolagem()); });
  }, { passive: true });

  /* Setas do teclado quando a linha do tempo está presa na tela. */
  document.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key) || /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
    const r = trilho.getBoundingClientRect();
    if (r.top > 0 || r.bottom < window.innerHeight) return;
    e.preventDefault();
    irPara(Math.max(0, Math.min(PASSOS.length - 1, atual + (e.key === 'ArrowRight' ? 1 : -1))));
  });

  mostrar(indicePelaRolagem());
})();
