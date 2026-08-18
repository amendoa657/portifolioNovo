/* Copia o e-mail pro clipboard com retorno visual no botão.
   O método moderno (navigator.clipboard) não funciona em todo navegador,
   então se ele falhar caímos no método antigo (selecionar texto + copy). */
(function () {
  const botao = document.getElementById('botaoCopiar');
  const textoOriginal = botao.textContent.trim();

  function copiarComTextarea(valor) {
    const campo = document.createElement('textarea');
    campo.value = valor;
    campo.style.position = 'fixed';
    campo.style.opacity = '0';
    document.body.appendChild(campo);
    campo.select();
    const deuCerto = document.execCommand('copy');
    campo.remove();
    return deuCerto;
  }

  async function copiar(valor) {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(valor);
        return true;
      } catch {
        // segue para o método antigo abaixo
      }
    }
    return copiarComTextarea(valor);
  }

  botao.addEventListener('click', async () => {
    const deuCerto = await copiar(botao.dataset.valor);

    botao.textContent = deuCerto ? 'copiado ✓' : 'selecione e copie';
    botao.classList.toggle('copiado', deuCerto);

    setTimeout(() => {
      botao.textContent = textoOriginal;
      botao.classList.remove('copiado');
    }, 2000);
  });
})();
