/**
 * participantes.js - Validação e Formatação do Cadastro
 */

const ParticipantesModule = {
  /**
   * Valida e constrói o objeto do participante
   */
  criarParticipante(nome, telefone, observacao = '') {
    if (!nome || nome.trim() === '') {
      throw new Error('O nome do participante é obrigatório.');
    }

    return {
      nome: nome.trim(),
      telefone: telefone ? telefone.trim() : 'Não informado',
      observacao: observacao,
      dataRegistro: new Date().toISOString()
    };
  }
};
