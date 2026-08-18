/* =========================================================================
   Terminal interativo do herói.
   Faz o boot animado (whoami -> cartão de apresentação) e depois entrega
   um shell de verdade: histórico, autocompletar com Tab e alguns comandos.
   ========================================================================= */

(function () {
  const terminal      = document.getElementById('terminal');
  const corpo         = document.getElementById('terminalCorpo');
  const historico     = document.getElementById('terminalHistorico');
  const heroCartao    = document.getElementById('heroCartao');
  const bootComando   = document.getElementById('bootComando');
  const bootCursor    = document.getElementById('bootCursor');
  const linhaEntrada  = document.getElementById('terminalEntradaLinha');
  const entrada       = document.getElementById('terminalEntrada');
  const cursorEntrada = document.getElementById('cursorEntrada');
  const dica          = document.getElementById('terminalDica');

  if (!terminal || !entrada) return;

  const movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PROMPT = '<b>italo</b>@cachyos<i>:</i><u>~</u><i>$</i> ';

  /* ---------- utilidades ---------- */

  function escapar(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
  }

  function rolarParaFim() {
    corpo.scrollTop = corpo.scrollHeight;
  }

  function imprimir(html, classe = 'terminalSaida') {
    const bloco = document.createElement('div');
    bloco.className = classe;
    bloco.innerHTML = html;
    historico.appendChild(bloco);
    rolarParaFim();
    return bloco;
  }

  function ecoarComando(texto) {
    const linha = document.createElement('div');
    linha.className = 'terminalLinha';
    linha.innerHTML = `<span class="terminalPrompt">${PROMPT}</span>${escapar(texto)}`;
    historico.appendChild(linha);
  }

  /* ---------- comandos ---------- */

  const secoes = ['sobre', 'trajetoria', 'stack', 'projetos', 'contato'];

  const projetos = [
    ['Zé Gotinha',        'Godot',   'ZeGotinhaGame'],
    ['Raycasting Game',   'Python',  'RaycastingGame'],
    ['Varal Inteligente', 'Flask',   'AppFlaskManageVaral'],
    ['Criptografia',      'C++',     'Criptografia'],
    ['CRUD SQLAlchemy',   'Flask',   'sqlAlchemyCrud'],
    ['API REST',          'Laravel', 'laravelApiRest'],
  ];

  const comandos = {
    help: {
      descricao: 'lista os comandos disponíveis',
      executar() {
        const linhas = Object.entries(comandos)
          .filter(([, c]) => !c.oculto)
          .map(([nome, c]) => `<span class="chave">${nome}</span><span>${c.descricao}</span>`)
          .join('');
        return `<div class="grade">${linhas}</div>`;
      }
    },

    whoami: {
      descricao: 'quem é o dono desse terminal',
      executar() {
        return `<b>Italo Cunha</b> — jogos, back-end e programação competitiva.<br>
                Godot de um lado, Flask e Laravel do outro, C++ e OBI no meio, Linux embaixo de tudo.<br>
                Aprendo construindo: quase todo projeto meu começou como curiosidade mal resolvida.`;
      }
    },

    ls: {
      descricao: 'lista as seções da página',
      executar() {
        return secoes.map(s => `<span class="chave">${s}/</span>`).join('&nbsp;&nbsp;');
      }
    },

    cd: {
      descricao: 'navega até uma seção — ex: cd projetos',
      executar(args) {
        const alvo = (args[0] || '').replace(/\/$/, '');
        if (!alvo || alvo === '~' || alvo === '/') {
          document.getElementById('topo').scrollIntoView({ behavior: 'smooth' });
          return 'voltando para <span class="chave">~</span>';
        }
        if (!secoes.includes(alvo)) {
          return `<span class="erro">cd: ${escapar(alvo)}: diretório não encontrado</span><br>
                  seções: ${secoes.join(', ')}`;
        }
        document.getElementById(alvo).scrollIntoView({ behavior: 'smooth' });
        return `~/<span class="chave">${alvo}</span>`;
      }
    },

    stack: {
      descricao: 'o que eu uso no dia a dia',
      executar() {
        return `<div class="grade">
          <span class="chave">competitiva</span><span>C++, algoritmos, estruturas de dados, STL</span>
          <span class="chave">gamedev</span><span>Godot, GDScript, C#, Pygame, GameMaker</span>
          <span class="chave">web</span><span>Flask, Python, SQL, Laravel, PHP, JavaScript</span>
          <span class="chave">sistema</span><span>Linux, Bash, Git, Hyprland, C</span>
        </div>`;
      }
    },

    projetos: {
      descricao: 'lista os projetos com link',
      executar() {
        const linhas = projetos.map(([nome, tec, repo]) =>
          `<span class="chave">${nome}</span><span>${tec} · <a href="https://github.com/amendoa657/${repo}" target="_blank" rel="noopener">github.com/amendoa657/${repo}</a></span>`
        ).join('');
        return `<div class="grade">${linhas}</div>`;
      }
    },

    contato: {
      descricao: 'como falar comigo',
      executar() {
        return `<div class="grade">
          <span class="chave">email</span><span><a href="mailto:italocisarpinheiro@gmail.com">italocisarpinheiro@gmail.com</a></span>
          <span class="chave">github</span><span><a href="https://github.com/amendoa657" target="_blank" rel="noopener">github.com/amendoa657</a></span>
          <span class="chave">linkedin</span><span><a href="https://www.linkedin.com/in/italo-cunha-028baa356/" target="_blank" rel="noopener">italo-cunha</a></span>
        </div>`;
      }
    },

    neofetch: {
      descricao: 'informações do ambiente',
      executar() {
        return `<div class="grade">
          <span class="chave">host</span><span>italo@cachyos</span>
          <span class="chave">os</span><span>CachyOS x86_64</span>
          <span class="chave">kernel</span><span>linux-cachyos</span>
          <span class="chave">wm</span><span>Hyprland (rice própria)</span>
          <span class="chave">shell</span><span>fish</span>
          <span class="chave">uptime</span><span>programando desde 2019</span>
        </div>`;
      }
    },

    trajetoria: {
      descricao: 'a linha do tempo, resumida',
      executar() {
        return `<div class="grade">
          <span class="chave">2019</span><span>primeiro contato — GameMaker Studio 2, 5º ano</span>
          <span class="chave">2021</span><span>Ubuntu, primeiro Linux — virou sistema principal</span>
          <span class="chave">2022</span><span>Artix, e o mundo Arch de vez</span>
          <span class="chave">2023</span><span>Godot — começo do Zé Gotinha Adventures</span>
          <span class="chave">2024</span><span>C++ e lógica de programação mais avançada</span>
          <span class="chave">2025</span><span>primeira OBI, competitiva pra valer</span>
          <span class="chave">hoje</span><span><span class="ok">HEAD</span> — CachyOS + Hyprland, rice própria</span>
        </div>`;
      }
    },

    clear: {
      descricao: 'volta o terminal ao estado inicial (ou Ctrl+L)',
      executar() {
        restaurarInicio();
        return null;
      }
    },

    sudo: {
      descricao: 'tentar o que não deve',
      executar() {
        return `<span class="erro">italo não está no arquivo sudoers.</span><br>
                Este incidente será reportado.`;
      }
    },

    /* escondidos do help, mas funcionam */
    amendoim: {
      descricao: '',
      oculto: true,
      executar() {
        return `<span class="ok">dependência crítica satisfeita.</span> produtividade +20%.`;
      }
    },
    exit: {
      descricao: '',
      oculto: true,
      executar() {
        return 'não dá pra sair, essa é a página inteira.';
      }
    }
  };

  const aliases = {
    about: 'whoami', sobre: 'whoami', quem: 'whoami',
    skills: 'stack', habilidades: 'stack',
    projects: 'projetos', repos: 'projetos',
    contact: 'contato', email: 'contato',
    cls: 'clear', dir: 'ls', ajuda: 'help', '?': 'help',
    timeline: 'trajetoria', historia: 'trajetoria', obi: 'trajetoria'
  };

  const nomesComandos = [...Object.keys(comandos), ...Object.keys(aliases)];

  /* ---------- execução ---------- */

  function executar(textoBruto) {
    const texto = textoBruto.trim();
    ecoarComando(texto);
    if (!texto) { rolarParaFim(); return; }

    const [nomeBruto, ...args] = texto.split(/\s+/);
    const nome = aliases[nomeBruto.toLowerCase()] || nomeBruto.toLowerCase();
    const comando = comandos[nome];

    if (!comando) {
      imprimir(`<span class="erro">comando não encontrado: ${escapar(nomeBruto)}</span><br>
                digite <span class="chave">help</span> para ver o que existe aqui.`);
      return;
    }

    const saida = comando.executar(args);
    if (saida !== null) imprimir(saida);
    rolarParaFim();
  }

  /* ---------- estado inicial ----------
     Guardamos o conteúdo do terminal logo depois do boot para que `clear`
     devolva a apresentação, em vez de deixar a tela vazia. */

  let estadoInicial = null;

  function restaurarInicio() {
    if (estadoInicial === null) {
      historico.innerHTML = '';
      return;
    }
    historico.innerHTML = estadoInicial;
    corpo.scrollTop = 0;
  }

  /* ---------- histórico e autocompletar ---------- */

  const historicoComandos = [];
  let indiceHistorico = -1;

  function autocompletar() {
    const valor = entrada.value.trimStart();
    if (!valor || valor.includes(' ')) return;
    const candidatos = nomesComandos.filter(n => n.startsWith(valor.toLowerCase()));
    if (candidatos.length === 1) {
      entrada.value = candidatos[0] + ' ';
      atualizarCursor();
    } else if (candidatos.length > 1) {
      ecoarComando(valor);
      imprimir(candidatos.map(c => `<span class="chave">${c}</span>`).join('&nbsp;&nbsp;'));
    }
  }

  /* ---------- cursor em bloco ---------- */

  function atualizarCursor() {
    const pos = entrada.selectionStart ?? entrada.value.length;
    cursorEntrada.style.setProperty('--pos', pos);
    cursorEntrada.style.marginLeft = `${-entrada.scrollLeft}px`;
  }

  ['input', 'keyup', 'click', 'select', 'scroll'].forEach(evento =>
    entrada.addEventListener(evento, atualizarCursor)
  );
  entrada.addEventListener('focus', () => linhaEntrada.classList.remove('semFoco'));
  entrada.addEventListener('blur',  () => linhaEntrada.classList.add('semFoco'));

  /* ---------- eventos ---------- */

  linhaEntrada.addEventListener('submit', (e) => {
    e.preventDefault();
    const valor = entrada.value;
    if (valor.trim()) {
      historicoComandos.push(valor);
      indiceHistorico = historicoComandos.length;
    }
    executar(valor);
    entrada.value = '';
    atualizarCursor();
  });

  entrada.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      autocompletar();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (indiceHistorico > 0) {
        indiceHistorico--;
        entrada.value = historicoComandos[indiceHistorico];
        requestAnimationFrame(atualizarCursor);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (indiceHistorico < historicoComandos.length - 1) {
        indiceHistorico++;
        entrada.value = historicoComandos[indiceHistorico];
      } else {
        indiceHistorico = historicoComandos.length;
        entrada.value = '';
      }
      requestAnimationFrame(atualizarCursor);
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      restaurarInicio();
    }
  });

  /* clicar em qualquer área vazia do terminal foca a entrada */
  corpo.addEventListener('click', (e) => {
    if (window.getSelection().toString()) return;      // deixa copiar texto
    if (e.target.closest('a, button')) return;         // não rouba clique de link
    entrada.focus();
  });

  if (dica) {
    dica.addEventListener('click', (e) => {
      const botao = e.target.closest('[data-comando]');
      if (!botao) return;
      entrada.focus();
      executar(botao.dataset.comando);
    });
  }

  /* ---------- boot ---------- */

  function liberarEntrada() {
    bootCursor.classList.add('oculto');
    linhaEntrada.hidden = false;
    linhaEntrada.classList.add('semFoco');
    if (dica) dica.hidden = false;
    atualizarCursor();
    // fotografia do terminal recém-inicializado, usada pelo `clear`
    estadoInicial = historico.innerHTML;
  }

  function mostrarCartao() {
    heroCartao.classList.add('visivel');
    setTimeout(liberarEntrada, movimentoReduzido ? 0 : 450);
  }

  function digitarBoot(texto, aoTerminar) {
    let i = 0;
    (function passo() {
      bootComando.textContent = texto.slice(0, i);
      if (i++ <= texto.length) {
        setTimeout(passo, 55 + Math.random() * 65);   // ritmo irregular, como digitação real
      } else {
        setTimeout(aoTerminar, 220);
      }
    })();
  }

  if (movimentoReduzido) {
    bootComando.textContent = 'whoami';
    mostrarCartao();
  } else {
    setTimeout(() => digitarBoot('whoami', mostrarCartao), 400);
  }
})();
