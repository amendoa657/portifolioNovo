/* =========================================================================
   Evolução: a linha do tempo presa na tela.
   A rolagem avança os commits; cada troca rola o ano (quando ele muda),
   entra o texto em cascata e a janela troca num fade curto. Alguns commits mostram uma imagem; outros, um trecho de código de
   verdade, tirado do repositório do projeto.
   ========================================================================= */

(function () {
  'use strict';

  const PASSOS = [
    {
      ano: '2019', rotulo: 'gamemaker', hash: 'init', titulo: 'primeiro contato', img: 'img/gameMaker.webp', arquivo: 'gamemaker.webp',
      texto: '5º ano, GameMaker Studio 2. Eu fazia jogo antes de saber o que era lógica — e um deles virou o Zé Gotinha, que eu refaria anos depois.',
      legenda: 'programando tudo num pc velho da minha vó', tags: ['GameMaker', 'primeiro jogo'],
    },
    {
      ano: '2021', rotulo: 'ubuntu', hash: 'feat(sistema)', titulo: 'hello, linux', img: 'img/ubuntu-20-04.webp', arquivo: 'ubuntu.webp',
      texto: 'Instalei o Ubuntu por curiosidade. Virou meu sistema principal e nunca mais voltei atrás.',
      legenda: 'em 3 semanas eu quebrei o sistema particionando o HD com ele rodando 👀', tags: ['Ubuntu', 'terminal'],
    },
    {
      ano: '2022', rotulo: 'artix', hash: 'refactor(sistema)', titulo: 'migrando pro arch', img: 'img/artixLinux.webp', arquivo: 'artix.webp',
      texto: 'Troquei o Ubuntu pelo Artix e caí de vez no mundo Arch. É dele que a Mosaic Store nasceria, quatro anos depois.',
      legenda: 'depois disso aqui eu descobri o que é ser feliz', tags: ['Artix', 'Arch', 'pacman'],
    },
    {
      ano: '2023', rotulo: 'zé gotinha', hash: 'feat(jogos)', titulo: 'Zé Gotinha, refeito na Godot', img: 'midia/projetos/zegotinha-voo.png', pixelada: true, arquivo: 'zegotinha.png',
      texto: 'Primeiro contato com a Godot — e o primeiro projeto sério: refazer do zero o jogo dos 10 anos, numa ferramenta de verdade, só pra medir o quanto eu tinha mudado.',
      legenda: 'o mesmo jogo, quatro anos e uma engine depois', tags: ['Godot', 'GDScript', 'pixel art'],
    },
    {
      ano: '2024', rotulo: 'c++', hash: 'perf(cabeça)', titulo: 'c++ e lógica', img: 'img/c++.webp', arquivo: 'cpp.webp',
      texto: 'C++ e lógica mais avançada. Foi quando parei de só fazer funcionar e comecei a olhar como funciona — e quanto custa.',
      legenda: 'nada melhor do que uma coca, c++ e neovim', tags: ['C++', 'competitiva', 'Neovim'],
    },
    {
      ano: '2025', rotulo: 'matemática', hash: 'feat(algoritmos)', titulo: 'a matemática vira código', arquivo: 'Criptografia/main.cpp', lingua: 'cpp',
      codigo: `int matrizChave[2][2]        = {{2, 3}, {5, 8}};
int matrizChaveInversa[2][2] = {{8, -3}, {-5, 2}};

// cada par de letras vira um vetor; criptografar é multiplicar
for (int i = 0; i < tamanhoTexto; i++) {
  matrizCriptografada[0][i] = (matrizChave[0][0] * textoConvertido[0][i]) +
                              (matrizChave[0][1] * textoConvertido[1][i]);
  matrizCriptografada[1][i] = (matrizChave[1][0] * textoConvertido[0][i]) +
                              (matrizChave[1][1] * textoConvertido[1][i]);
}`,
      texto: 'Uma cifra em C++ onde a chave é uma matriz, e um raycasting à la Wolfenstein em Pygame, onde a distância vira altura. Duas aulas de matemática levadas até o compilador.',
      legenda: 'trecho real do Criptografia — a multiplicação pela chave', tags: ['C++', 'Python', 'Pygame', 'álgebra linear'],
    },
    {
      ano: '2025', rotulo: 'ftc', hash: 'test(equipe)', titulo: 'Amigos Droids', img: 'img/amigosDroids.webp', arquivo: 'ftc.webp',
      texto: 'Selecionado para uma equipe mineira de robótica autônoma na FTC. Teste de fogo: POO, Java e resolver problema com o relógio correndo — e o FtcSim virando app de desktop.',
      legenda: 'aqui foi o teste de fogo de tudo que eu já tinha aprendido', tags: ['FTC', 'Java', 'robótica', 'Electron'],
    },
    {
      ano: '2026', rotulo: 'back-end', hash: 'feat(back-end)', titulo: 'back-end de verdade', img: 'midia/projetos/indiesquad-busca.webp', arquivo: 'indiesquad.webp',
      texto: 'Flask, Laravel e SQLAlchemy no mesmo semestre — e o IndieSquad, em equipe de seis: uma plataforma para montar times de jogos indie, com o back-end em quatro camadas e o front na Mosaic UI.',
      legenda: 'IndieSquad: buscar profissionais e projetos', tags: ['Flask', 'Laravel', 'MySQL', 'SQLAlchemy'],
    },
    {
      ano: '2026', rotulo: 'store', hash: 'feat(mosaic)', titulo: 'nasce a Mosaic Store', img: 'midia/mosaic/store-home.webp', arquivo: 'mosaic-store.webp',
      texto: 'Uma loja de pacotes para o meu Arch, com a cara do wallpaper. A identidade cresceu tanto que virou uma biblioteca: a Mosaic UI.',
      legenda: 'a loja, com as cores que vieram do wallpaper', tags: ['Python', 'Flask', 'pywebview', 'SQLite FTS5'],
    },
    {
      ano: '2026', rotulo: 'tuxassist', hash: 'feat(voz)', titulo: 'TuxAssist', arquivo: 'tuxAssist/main.py', lingua: 'py',
      codigo: `with sd.InputStream(samplerate=16000, channels=1, dtype="int16") as mic:
    print("Diga 'hey jarvis'...")

    while True:
        bloco, _ = mic.read(1280)

        if max(detector.predict(bloco[:, 0]).values()) > 0.5:
            detector.reset()
            notificar("Pode falar!")

            texto = transcrever(gravar(mic))
            resposta = json.loads(perguntar(texto))`,
      texto: 'Um assistente de voz para Linux: escuta “hey jarvis” com um modelo local, grava até o silêncio, transcreve com Whisper e responde numa notificação do GNOME.',
      legenda: 'trecho real do TuxAssist — o laço da palavra-chave', tags: ['Python', 'ONNX', 'Whisper'],
    },
    {
      ano: '2026', rotulo: 'delphi', hash: 'feat(desktop)', titulo: 'HW Atendimento em Delphi', arquivo: 'src/utils/uSenha.pas', lingua: 'pas',
      codigo: `class function TSenha.gerarSalt : string;
begin
  // GUID sem chaves e traços: 32 caracteres hexadecimais aleatórios
  Result := GUIDToString(TGUID.NewGuid);
  Result := StringReplace(Result, '{', '', [rfReplaceAll]);
  Result := StringReplace(Result, '}', '', [rfReplaceAll]);
  Result := StringReplace(Result, '-', '', [rfReplaceAll]);
  Result := LowerCase(Result);
end;

class function TSenha.gerarHash(const salt, senha : string) : string;
begin
  // mesmo cálculo do banco: SHA2(CONCAT(salt, senha), 256)
  Result := THashSHA2.GetHashString(salt + senha);
end;`,
      texto: 'Um sistema desktop de atendimentos em Delphi, com VCL, FireDAC e MySQL: login com salt, perfis e permissões, log de ações e anexos. E o mesmo domínio virou API em Spring Boot.',
      legenda: 'trecho real do HW Atendimento — salt e hash das senhas', tags: ['Delphi', 'Pascal', 'FireDAC', 'Spring Boot'],
    },
    {
      ano: '2026', rotulo: 'mosaic os', hash: 'feat(mosaic)', titulo: 'Mosaic OS', img: 'midia/os/mosaic-desktop.webp', arquivo: 'mosaic-os.webp',
      texto: 'Minha segunda rice virou projeto: um shell em Quickshell para o Hyprland, com uma ilha líquida, um dock de vidro e temas que trocam as cores e as formas.',
      legenda: 'o desktop no tema Mosaic', tags: ['QML', 'Quickshell', 'Hyprland', 'Matugen'],
    },
    {
      ano: 'hoje', rotulo: 'hoje', hash: 'HEAD', titulo: 'HEAD → main', img: 'img/rice.webp', arquivo: 'rice.webp',
      texto: 'CachyOS com a minha rice. Rust compilando, Go na fila, jogos na Godot e back-end acontecendo ao mesmo tempo — e nenhum atrapalhando o outro.',
      legenda: 'essa é a minha rice atual e meu ambiente de trabalho', tags: ['Rust', 'Go', 'CachyOS', 'Hyprland'],
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
  const grade = document.querySelector('#evolucao .evolucao-grade');

  const codigo = document.createElement('pre');
  codigo.className = 'evolucao-codigo';
  codigo.hidden = true;
  quadro.appendChild(codigo);

  trilho.style.setProperty('--passos', PASSOS.length);
  linha.style.setProperty('--passos', PASSOS.length);

  /* Pré-carrega as imagens: a onda não espera download. */
  PASSOS.forEach((p) => { if (p.img) { const i = new Image(); i.src = p.img; } });

  /* Um realce de sintaxe pequeno: comentário, texto, número e palavra-chave. */
  const CHAVES = {
    cpp: 'int|for|if|return|vector|string|using|namespace|const|auto|void',
    py: 'with|as|while|if|True|False|None|def|return|import|from|print|max|not',
    pas: 'class|function|begin|end|const|string|Result|var|procedure|type',
  };
  const escapar = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  function realcar(fonte, lingua) {
    const re = new RegExp(`(\\/\\/.*$|#.*$)|("[^"\\n]*"|'[^'\\n]*')|\\b(\\d+)\\b|\\b(${CHAVES[lingua] || 'x^'})\\b`, 'gm');
    let saida = '';
    let ultimo = 0;
    fonte.replace(re, (m, com, str, num, kw, pos) => {
      saida += escapar(fonte.slice(ultimo, pos));
      const classe = com ? 'c' : str ? 's' : num ? 'n' : 'k';
      saida += `<span class="${classe}">${escapar(m)}</span>`;
      ultimo = pos + m.length;
      return m;
    });
    return saida + escapar(fonte.slice(ultimo));
  }

  const nos = PASSOS.map((p, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'evolucao-no mo-tom-' + (i % 4);
    b.innerHTML = `<i></i><span>${p.rotulo}</span>`;
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
    grade.className = 'contentor evolucao-grade mo-tom-' + (i % 4);

    /* O ano rola só quando muda (vários commits de 2026 seguem no mesmo ano). */
    const anoAntes = anterior >= 0 ? PASSOS[anterior].ano : null;
    if (anoAntes !== p.ano) {
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
    }

    commit.innerHTML = `<b>${p.hash}</b> commit ${i + 1}/${PASSOS.length}`;
    titulo.textContent = p.titulo;
    texto.textContent = p.texto;
    tags.innerHTML = p.tags.map((t) => `<span class="mo-chip">${t}</span>`).join('');
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
      if (p.codigo) {
        imagem.hidden = true;
        codigo.hidden = false;
        codigo.innerHTML = `<code>${realcar(p.codigo, p.lingua)}</code>`;
        arquivo.textContent = `~/${p.arquivo}`;
      } else {
        codigo.hidden = true;
        imagem.hidden = false;
        imagem.src = p.img;
        imagem.alt = `${p.ano} — ${p.titulo}`;
        imagem.classList.toggle('pixelada', !!p.pixelada);
        arquivo.textContent = `~/trajetoria/${p.ano}/${p.arquivo}`;
      }
      legenda.textContent = p.legenda;
    };
    trocar();
    /* Troca simples: a janela nova entra num fade curto. */
    if (anterior >= 0 && !reduzido) quadro.animate([{ opacity: 0.2 }, { opacity: 1 }], { duration: 260, easing: 'ease-out' });
  }

  /* ---------------------------------------------------------------------
     Controles: setas, arrastar para o lado, clicar nos nós e o teclado.
     A página rola normal — o carrossel só anda quando você pede, um commit
     por vez.
     --------------------------------------------------------------------- */
  function irPara(i) {
    mostrar(Math.max(0, Math.min(PASSOS.length - 1, i)));
    btnAntes.disabled = atual === 0;
    /* No último commit, a seta da direita vira "continuar": leva para a Mosaic. */
    const fim = atual === PASSOS.length - 1;
    btnDepois.textContent = fim ? '↓' : '→';
    btnDepois.setAttribute('aria-label', fim ? 'Continuar para a Mosaic' : 'Próximo commit');
    btnDepois.classList.toggle('continuar', fim);
  }
  const btnAntes = document.getElementById('evoAntes');
  const btnDepois = document.getElementById('evoDepois');
  btnAntes.addEventListener('click', () => irPara(atual - 1));
  btnDepois.addEventListener('click', (e) => {
    if (atual < PASSOS.length - 1) { irPara(atual + 1); return; }
    const r = btnDepois.getBoundingClientRect();
    if (window.irPara) window.irPara('#mosaic', e.clientX || r.left, e.clientY || r.top);
  });

  /* Arrastar: só conta o gesto claramente horizontal; o vertical é rolagem. */
  let toque = null;
  grade.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button, a')) return;
    toque = { x: e.clientX, y: e.clientY, id: e.pointerId };
  });
  grade.addEventListener('pointerup', (e) => {
    if (!toque || e.pointerId !== toque.id) return;
    const dx = e.clientX - toque.x;
    const dy = e.clientY - toque.y;
    toque = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.4) irPara(atual + (dx < 0 ? 1 : -1));
  });
  grade.addEventListener('pointercancel', () => { toque = null; });

  /* Teclado: ← → quando a linha do tempo está na tela. */
  document.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key) || /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
    if (e.target.closest && e.target.closest('#baralho')) return;
    const r = grade.getBoundingClientRect();
    if (r.bottom < window.innerHeight * 0.3 || r.top > window.innerHeight * 0.7) return;
    e.preventDefault();
    irPara(atual + (e.key === 'ArrowRight' ? 1 : -1));
  });

  irPara(0);
})();
