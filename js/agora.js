/* =========================================================================
   Agora: a fila de compilação, no jeito da fila da Mosaic Store.
   Cada linguagem é um pacote; a saída do "build" conta o que eu fiz com ela
   (ou o que ainda estou aprendendo). Nada inventado: o Rust e o Go estão
   marcados como estudo, porque é isso que eles são agora.
   ========================================================================= */

(function () {
  'use strict';

  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fila = document.getElementById('fila');
  if (!fila) return;
  const itens = Array.from(fila.querySelectorAll('.fila-item'));
  const log = document.getElementById('filaLog');
  const titulo = document.getElementById('filaTitulo');
  const marca = document.getElementById('filaMarca');
  const detalhe = document.getElementById('filaDetalhe');

  const PACOTES = {
    delphi: {
      titulo: 'hw-atendimento — delphi · vcl',
      vivo: false,
      linhas: [
        ['seta', ':: instalando hw-atendimento'],
        ['', '   -> VCL + FireDAC conversando com MySQL'],
        ['', '   -> login com salt + SHA-256, o mesmo cálculo do banco'],
        ['', '   -> perfis e permissões em tabela: perfil novo sem mexer no código'],
        ['', '   -> atendimentos, clientes, equipamentos e anexos'],
        ['', '   -> log de ações de cada usuário'],
        ['', '   -> 8 migrations SQL versionadas, uma por mudança'],
        ['', '   -> ajuda no F1 (.chm) do lado do .exe'],
        ['ok', '   ✓ repositórios separados dos formulários'],
        ['ok', '== instalado: Object Pascal faz parte da stack'],
      ],
      detalhe: 'Um sistema de verdade: usuário, permissão, log e anexo. <a class="link-sublinhado" href="https://github.com/amendoa657/hwAtendimentoDelphi" target="_blank" rel="noopener">ver o código ↗</a>',
    },
    rust: {
      titulo: 'rust — cargo build',
      vivo: true,
      linhas: [
        ['seta', '   Compiling italo v2026.0.0 (~/aprendendo/rust)'],
        ['', '   Compiling ownership v0.1.0'],
        ['', '   Compiling borrowing v0.1.0'],
        ['aviso', 'warning: `tempo_livre` foi movido e não pode mais ser usado'],
        ['fraco', '   = help: o borrow checker tinha razão de novo'],
        ['', '   Compiling lifetimes v0.0.3 (ainda entendendo)'],
        ['', '   Compiling cargo, enums, match, Result<T, E>'],
        ['fraco', '   Building [=========>               ] 42%'],
      ],
      detalhe: 'A linguagem que eu mais quero dominar: a velocidade do C++ que eu usava em competitiva, sem as armadilhas de memória.',
    },
    go: {
      titulo: 'go — na fila',
      vivo: false,
      linhas: [
        ['seta', ':: aguardando: backend-em-go'],
        ['fraco', '   -> dependência: terminar o básico de Rust? não, dá pra ir junto'],
        ['', '   -> próximo passo: go mod init'],
        ['', '   -> objetivo: APIs simples, compiladas e rápidas de subir'],
        ['', '   -> vindo de Flask e Spring: menos mágica, mais controle'],
        ['fraco', '   (na fila)'],
      ],
      detalhe: 'O próximo back-end. Começo agora — e conto aqui quando sair o primeiro serviço.',
    },
    java: {
      titulo: 'api-atendimento — spring boot',
      vivo: false,
      linhas: [
        ['seta', ':: instalando api-atendimento'],
        ['', '   -> Spring Boot + Spring Data JPA + MySQL'],
        ['', '   -> controllers, repositories e models para clientes e equipamentos'],
        ['', '   -> o mesmo domínio do HW Atendimento, agora como API REST'],
        ['', '   -> Lombok pra cortar o código repetido'],
        ['ok', '== instalado: Java desde a FTC, agora no back-end'],
      ],
      detalhe: 'O mesmo problema, duas linguagens: desktop em Delphi, API em Java. <a class="link-sublinhado" href="https://github.com/amendoa657/ApiAtendimento" target="_blank" rel="noopener">ver o código ↗</a>',
    },
  };

  let rodada = 0;
  function mostrar(chave) {
    const p = PACOTES[chave];
    const minha = ++rodada;
    itens.forEach((b) => b.setAttribute('aria-selected', String(b.dataset.item === chave)));
    titulo.textContent = p.titulo;
    marca.classList.toggle('mo-marca--girando', p.vivo);
    detalhe.innerHTML = p.detalhe;
    log.innerHTML = '';
    p.linhas.forEach(([classe, texto], i) => {
      const escrever = () => {
        if (minha !== rodada) return;
        const l = document.createElement('span');
        l.className = 'l ' + classe;
        l.textContent = texto;
        log.appendChild(l);
      };
      if (reduzido) escrever(); else setTimeout(escrever, 120 + i * 170);
    });
    /* O Rust fica "compilando": a barra no fim do log anda e volta. */
    if (p.vivo && !reduzido) {
      setTimeout(function andar() {
        if (minha !== rodada) return;
        const ultima = log.lastElementChild;
        if (ultima && ultima.textContent.includes('Building')) {
          const pct = 38 + Math.floor(Math.random() * 9);
          const cheio = Math.round(pct / 4);
          ultima.textContent = `   Building [${'='.repeat(cheio - 1)}>${' '.repeat(25 - cheio)}] ${pct}%`;
        }
        setTimeout(andar, 700);
      }, 120 + p.linhas.length * 170 + 400);
    }
  }

  itens.forEach((b) => b.addEventListener('click', () => mostrar(b.dataset.item)));
  fila.querySelector('.fila-lista').addEventListener('keydown', (e) => {
    const i = itens.indexOf(document.activeElement);
    if (i < 0) return;
    const alvo = e.key === 'ArrowDown' ? itens[(i + 1) % itens.length] : e.key === 'ArrowUp' ? itens[(i - 1 + itens.length) % itens.length] : null;
    if (!alvo) return;
    e.preventDefault();
    alvo.focus();
    mostrar(alvo.dataset.item);
  });

  quandoVisivel(fila, () => mostrar('rust'));
})();
