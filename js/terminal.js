/* =========================================================================
   Terminal: um shell de verdade num painel que desliza da direita.
   Histórico com as setas, autocompletar com Tab e comandos próprios —
   inclusive um que troca o wallpaper do site.
   ========================================================================= */

(function () {
  'use strict';

  const painel = document.getElementById('terminal');
  const corpo = document.getElementById('terminalCorpo');
  const historico = document.getElementById('terminalHistorico');
  const form = document.getElementById('terminalForm');
  const entrada = document.getElementById('terminalEntrada');
  const abrirBotao = document.getElementById('abrirTerminal');
  const fecharBotao = document.getElementById('fecharTerminal');
  const PROMPT = '<span class="prompt"><b>italo</b>@cachyos<i>:</i><u>~</u><i>$</i></span> ';

  const escapar = (t) => { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; };
  const rolar = () => { corpo.scrollTop = corpo.scrollHeight; };
  function imprimir(html) {
    const b = document.createElement('div');
    b.className = 'saida';
    b.innerHTML = html;
    historico.appendChild(b);
    rolar();
  }
  function ecoar(texto) {
    const l = document.createElement('div');
    l.className = 'linha';
    l.innerHTML = PROMPT + escapar(texto);
    historico.appendChild(l);
  }
  const grade = (pares) => `<div class="grade">${pares.map(([a, b]) => `<span class="chave">${a}</span><span>${b}</span>`).join('')}</div>`;
  const link = (repo) => `<a href="https://github.com/amendoa657/${repo}" target="_blank" rel="noopener">github.com/amendoa657/${repo}</a>`;

  const SECOES = ['inicio', 'sobre', 'evolucao', 'mosaic', 'os', 'store', 'ui', 'agora', 'projetos', 'stack', 'contato'];

  function irParaSecao(id) {
    fechar();
    setTimeout(() => window.irPara && irPara('#' + id), 300);
  }

  const comandos = {
    help: { d: 'lista os comandos', x: () => grade(Object.entries(comandos).filter(([, c]) => c.d).map(([n, c]) => [n, c.d])) },
    whoami: {
      d: 'quem é o dono desse terminal',
      x: () => `<b>Italo Cunha</b> — jogos, back-end, desktop e direção de arte.<br>Godot de um lado, Flask e Delphi do outro, Rust e Go no caminho, Linux embaixo de tudo.<br>E a Mosaic por cima: uma identidade com a cara do wallpaper.`,
    },
    ls: { d: 'lista as seções da página', x: () => SECOES.map((s) => `<span class="chave">${s}/</span>`).join('&nbsp;&nbsp;') },
    cd: {
      d: 'vai até uma seção — ex: cd mosaic',
      x(args) {
        const alvo = (args[0] || '').replace(/\/$/, '').normalize('NFD').replace(/[̀-ͯ]/g, '');
        if (!alvo || alvo === '~' || alvo === '/') { irParaSecao('inicio'); return 'voltando para <span class="chave">~</span>'; }
        if (!SECOES.includes(alvo)) return `<span class="erro">cd: ${escapar(alvo)}: diretório não encontrado</span><br>seções: ${SECOES.join(', ')}`;
        irParaSecao(alvo);
        return `~/<span class="chave">${alvo}</span>`;
      },
    },
    mosaic: {
      d: 'o ecossistema, em uma tela',
      x: () => grade([
        ['store', 'loja de pacotes pro Arch — Flask, pywebview, SQLite FTS5 · ' + link('mosaicStore')],
        ['ui', 'a identidade virou biblioteca — HTML, CSS, JS puro, 0 dependências'],
        ['os', 'desktop em Quickshell pro Hyprland · cd os'],
        ['os', 'desktop em Quickshell pro Hyprland — ilha líquida, dock de vidro · ' + link('mosaicOS')],
        ['ideal', 'calma, rápida e legível. com a cara do seu wallpaper.'],
      ]),
    },
    projetos: {
      d: 'os projetos, com link',
      x: () => grade([
        ['Mosaic Store', link('mosaicStore')], ['Mosaic OS', link('mosaicOS')], ['IndieSquad', link('indieSquad')],
        ['HW Atendimento', link('hwAtendimentoDelphi')], ['API Atendimento', link('ApiAtendimento')],
        ['TuxAssist', link('tuxAssist')], ['Zé Gotinha', link('ZeGotinhaGame')], ['Raycasting', link('RaycastingGame')],
        ['Criptografia', link('Criptografia')],
      ]),
    },
    stack: {
      d: 'o que eu uso no dia a dia',
      x: () => grade([
        ['back-end', 'Python, Flask, SQL, Java/Spring — e Go chegando'],
        ['sistemas', 'Delphi, Object Pascal, C++, Rust (aprendendo)'],
        ['interface', 'QML, CSS, JavaScript, Matugen'],
        ['jogos', 'Godot, GDScript, Pygame'],
        ['sistema', 'Linux, Hyprland, Git, Neovim'],
        ['não', 'Laravel. nunca mais.'],
      ]),
    },
    trajetoria: {
      d: 'a evolução, resumida',
      x: () => grade([
        ['2019', 'GameMaker, 5º ano — o primeiro Zé Gotinha'], ['2021', 'Ubuntu, o primeiro Linux'], ['2022', 'Artix, e o mundo Arch de vez'],
        ['2023', 'Godot — o Zé Gotinha refeito'], ['2024', 'C++ e competitiva'], ['2025', 'Amigos Droids, FTC'],
        ['2026', 'nasce a Mosaic · HW Atendimento em Delphi'], ['hoje', '<span class="ok">HEAD</span> — Rust compilando, Go na fila'],
      ]),
    },
    neofetch: {
      d: 'informações do ambiente',
      x: () => grade([['host', 'italo@cachyos'], ['os', 'CachyOS x86_64'], ['wm', 'Hyprland + Mosaic OS'], ['shell', 'fish'], ['editor', 'Neovim'], ['uptime', 'programando desde 2019']]),
    },
    tema: {
      d: 'troca cores e formas do site — ex: tema gruvbox',
      x(args) {
        const nome = (args[0] || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (!window.Tema) return '<span class="erro">tema indisponível</span>';
        if (!nome) return `atual: <span class="chave">${Tema.atual()}</span><br>opções: ${Tema.TEMAS.join(', ')}`;
        if (!Tema.TEMAS.includes(nome)) return `<span class="erro">tema: ${escapar(nome)}: não existe</span><br>opções: ${Tema.TEMAS.join(', ')}`;
        setTimeout(() => Tema.aplicar(nome), 120);
        return `aplicando o tema <span class="chave">${nome}</span>… <span class="ok">ok</span>`;
      },
    },
    cargo: { d: '', x: () => '<span class="ok">Compiling</span> italo v2026.0.0<br>warning: ainda aprendendo lifetimes. volte em breve.' },
    go: { d: '', x: () => 'go: na fila. o primeiro serviço sai em breve.' },
    laravel: { d: '', x: () => '<span class="erro">laravel: comando removido deste sistema por decisão do dono.</span>' },
    contato: {
      d: 'como falar comigo',
      x: () => grade([
        ['email', '<a href="mailto:italocisarpinheiro@gmail.com">italocisarpinheiro@gmail.com</a>'],
        ['github', '<a href="https://github.com/amendoa657" target="_blank" rel="noopener">github.com/amendoa657</a>'],
        ['linkedin', '<a href="https://www.linkedin.com/in/italo-cunha-028baa356/" target="_blank" rel="noopener">italo-cunha</a>'],
      ]),
    },
    clear: { d: 'limpa a tela (ou Ctrl+L)', x: () => { historico.innerHTML = ''; return null; } },
    exit: { d: 'fecha o terminal', x: () => { fechar(); return null; } },
    sudo: { d: '', x: () => '<span class="erro">italo não está no arquivo sudoers.</span><br>Este incidente será reportado.' },
    paru: { d: '', x: (a) => a.join(' ').includes('mosaic') ? ':: resolvendo dependências…<br><span class="ok">mosaic-store</span> já está instalado — e com a cara do seu wallpaper.' : 'use a <span class="chave">Mosaic Store</span>, é mais bonito.' },
    amendoim: { d: '', x: () => '<span class="ok">dependência crítica satisfeita.</span> produtividade +20%.' },
  };
  const apelidos = { about: 'whoami', sobre: 'whoami', skills: 'stack', projects: 'projetos', repos: 'projetos', contact: 'contato', cls: 'clear', ajuda: 'help', '?': 'help', timeline: 'trajetoria', evolucao: 'trajetoria', wallpaper: 'tema', theme: 'tema', q: 'exit' };
  const nomes = [...Object.keys(comandos), ...Object.keys(apelidos)];

  const passados = [];
  let iPassado = 0;

  function executar(bruto) {
    const texto = bruto.trim();
    ecoar(texto);
    if (texto) { passados.push(texto); iPassado = passados.length; }
    if (!texto) return rolar();
    const [nomeBruto, ...args] = texto.split(/\s+/);
    const nome = apelidos[nomeBruto.toLowerCase()] || nomeBruto.toLowerCase();
    const c = comandos[nome];
    if (!c) return imprimir(`<span class="erro">comando não encontrado: ${escapar(nomeBruto)}</span><br>digite <span class="chave">help</span> pra ver o que existe aqui.`);
    const saida = c.x(args);
    if (saida != null) imprimir(saida);
    rolar();
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); executar(entrada.value); entrada.value = ''; });
  entrada.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); if (iPassado > 0) entrada.value = passados[--iPassado]; }
    else if (e.key === 'ArrowDown') { e.preventDefault(); iPassado = Math.min(passados.length, iPassado + 1); entrada.value = passados[iPassado] || ''; }
    else if (e.key === 'Tab') {
      e.preventDefault();
      const v = entrada.value.trim().toLowerCase();
      if (!v) return;
      const partes = v.split(/\s+/);
      if (partes.length === 1) {
        const op = nomes.filter((n) => n.startsWith(v));
        if (op.length === 1) entrada.value = op[0] + ' ';
        else if (op.length > 1) { ecoar(entrada.value); imprimir(op.join('&nbsp;&nbsp;')); }
      } else {
        const lista = partes[0] === 'cd' ? SECOES : (partes[0] === 'wallpaper' || partes[0] === 'tema') ? (window.Tema ? Tema.TEMAS : []) : [];
        const op = lista.filter((n) => n.startsWith(partes[1]));
        if (op.length === 1) entrada.value = partes[0] + ' ' + op[0];
      }
    } else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); historico.innerHTML = ''; }
  });
  corpo.addEventListener('click', () => { if (!getSelection().toString()) entrada.focus(); });

  let saudou = false;
  function abrir() {
    if (painel.open) return;
    painel.showModal();
    if (!saudou) {
      saudou = true;
      imprimir('bem-vindo ao terminal do portfólio. digite <span class="chave">help</span> — ou tente <span class="chave">tema fosforo</span>.');
    }
    setTimeout(() => entrada.focus(), 50);
  }
  function fechar() {
    if (!painel.open) return;
    painel.classList.add('fechando');
    setTimeout(() => { painel.classList.remove('fechando'); painel.close(); }, 260);
  }
  painel.addEventListener('cancel', (e) => { e.preventDefault(); fechar(); });
  painel.addEventListener('click', (e) => { if (e.target === painel) fechar(); });
  abrirBotao.addEventListener('click', abrir);
  fecharBotao.addEventListener('click', fechar);
})();
