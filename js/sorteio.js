/**
 * sorteio.js - Mecanismo de Sorteio Criptográfico e Hash de Autenticidade
 */

const SorteioModule = {
  /**
   * Gera um número inteiro verdadeiramente aleatório entre min e max usando Crypto API
   */
  gerarNumeroAleatorioCrypto(min, max) {
    const range = max - min + 1;
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return min + (array[0] % range);
  },

  /**
   * Filtra os números elegíveis (Apenas 'sold' e 'free')
   */
  obterNumerosElegiveis() {
    return RifaSystem.numeros.filter(
      item => item.status === 'sold' || item.status === 'free'
    );
  },

  /**
   * Executa a regra do sorteio
   */
  realizarSorteio() {
    const elegiveis = this.obterNumerosElegiveis();

    if (elegiveis.length === 0) {
      return {
        sucesso: false,
        mensagem: 'Não há números vendidos ou gratuitos para realizar o sorteio!'
      };
    }

    // Seleciona um índice aleatório dentro do array de elegíveis
    const indiceSorteado = this.gerarNumeroAleatorioCrypto(0, elegiveis.length - 1);
    const numeroGanhador = elegiveis[indiceSorteado];

    // Monta o comprovante do resultado
    const agora = new Date();
    const hashVerificacao = this.gerarHashVerificacao(numeroGanhador, agora);

    return {
      sucesso: true,
      numero: numeroGanhador.numero,
      ganhador: numeroGanhador.participante ? numeroGanhador.participante.nome : 'Anônimo / Não informado',
      dataHora: agora.toLocaleString('pt-BR'),
      hash: hashVerificacao
    };
  },

  /**
   * Gera um código de verificação simulado para auditoria
   */
  gerarHashVerificacao(item, data) {
    const str = `${item.numero}-${data.getTime()}-${Math.random()}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    return `RF100-${hex.substring(0, 4)}-${hex.substring(4, 8)}`;
  }
};
