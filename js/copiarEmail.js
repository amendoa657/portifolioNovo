/* Copia o e-mail para a área de transferência com retorno visual.
   A API moderna só funciona em contexto seguro e com gesto do usuário —
   quando ela falha (e não só quando falta), caímos no método antigo. */

(function () {
  const botao = document.getElementById('botaoCopiar');
  if (!botao) return;

  const textoOriginal = botao.textContent.trim();
  let temporizador;

  function copiarAntigo(valor) {
    const campo = document.createElement('textarea');
    campo.value = valor;
    campo.setAttribute('readonly', '');
    campo.style.position = 'fixed';
    campo.style.top = '0';
    campo.style.opacity = '0';
    document.body.appendChild(campo);
    campo.select();
    campo.setSelectionRange(0, valor.length);

    let deuCerto = false;
    try {
      deuCerto = document.execCommand('copy');
    } catch {
      deuCerto = false;
    }
    campo.remove();
    return deuCerto;
  }

  async function copiar(valor) {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(valor);
        return true;
      } catch {
        /* segue para o método antigo */
      }
    }
    return copiarAntigo(valor);
  }

  function avisar(texto, classe) {
    botao.textContent = texto;
    botao.classList.toggle('copiado', classe === 'copiado');
    clearTimeout(temporizador);
    temporizador = setTimeout(() => {
      botao.textContent = textoOriginal;
      botao.classList.remove('copiado');
    }, 2000);
  }

  botao.addEventListener('click', async () => {
    const ok = await copiar(botao.dataset.valor);
    // se nem o método antigo funcionar, o e-mail continua visível e selecionável ao lado
    avisar(ok ? 'copiado ✓' : 'selecione e copie', ok ? 'copiado' : '');
  });
})();
