/* Copia o e-mail pro clipboard com retorno visual no botão. */
(function () {
  const botaoEmail = document.getElementById('botaoCopiarEmail');
  const botaoTelefone = document.getElementById('botaoCopiarTelefone');
  const textoOriginalEmail = botaoEmail.textContent.trim();
  const textoOriginalTelefone = botaoTelefone.textContent.trim();

  botaoEmail.addEventListener('click', async () => {
    let deuCerto = true;
    try {
      await navigator.clipboard.writeText(botaoEmail.dataset.valor);
    } catch {
      deuCerto = false;
    }

    botaoEmail.textContent = deuCerto ? 'copiado ✓' : 'selecione e copie';
    botaoEmail.classList.toggle('copiado', deuCerto);

    setTimeout(() => {
      botaoEmail.textContent = textoOriginalEmail;
      botaoEmail.classList.remove('copiado');
    }, 2000);
  });

  botaoTelefone.addEventListener('click', async () => {
    let deuCerto = true;
    try {
      await navigator.clipboard.writeText(botaoTelefone.dataset.valor);
    } catch {
      deuCerto = false;
    }

    botaoTelefone.textContent = deuCerto ? 'copiado ✓' : 'selecione e copie';
    botaoTelefone.classList.toggle('copiado', deuCerto);

    setTimeout(() => {
      botaoTelefone.textContent = textoOriginalTelefone;
      botaoTelefone.classList.remove('copiado');
    }, 2000);
  });


})();
