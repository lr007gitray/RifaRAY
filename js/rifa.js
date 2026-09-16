/**
 * rifa.js - Dados da Rifa e do Prêmio
 */

const STORAGE_KEY = 'rifa_100_dados';
const STORAGE_PREMIO_KEY = 'rifa_100_premio';

const RifaSystem = {
  numeros: [],
  premio: {
    titulo: '🏆 Smartphone XYZ',
    descricao: 'Smartphone novo, 128GB, com garantia de fábrica. Escolha seus números abaixo!',
    valor: 'R$ 5,00',
    imagem: 'https://via.placeholder.com/600x350?text=Foto+do+Pr%C3%Aamio'
  },

  init() {
    // Carrega Prêmio
    const premioSalvo = localStorage.getItem(STORAGE_PREMIO_KEY);
    if (premioSalvo) {
      try { this.premio = JSON.parse(premioSalvo); } catch(e){}
    }

    // Carrega Números
    const dadosSalvos = localStorage.getItem(STORAGE_KEY);
    if (dadosSalvos) {
      try {
        this.numeros = JSON.parse(dadosSalvos);
      } catch (e) {
        this.resetarRifa();
      }
    } else {
      this.resetarRifa();
    }
  },

  salvarPremio(titulo, descricao, valor, imagem) {
    this.premio = { titulo, descricao, valor, imagem };
    localStorage.setItem(STORAGE_PREMIO_KEY, JSON.stringify(this.premio));
  },

  resetarRifa() {
    this.numeros = [];
    for (let i = 1; i <= 100; i++) {
      this.numeros.push({ numero: i, status: 'available', participante: null });
    }
    this.salvarLocal();
  },

  salvarLocal() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.numeros));
  },

  getNumero(num) {
    return this.numeros.find(item => item.numero === Number(num));
  },

  atualizarNumero(num, novoStatus, dadosParticipante = null) {
    const item = this.getNumero(num);
    if (!item) return { success: false };

    item.status = novoStatus;
    item.participante = dadosParticipante;

    this.salvarLocal();
    return { success: true };
  },

  obterEstatisticas() {
    return {
      total: 100,
      disponiveis: this.numeros.filter(n => n.status === 'available').length,
      reservados: this.numeros.filter(n => n.status === 'reserved').length,
      vendidos: this.numeros.filter(n => n.status === 'sold').length,
      gratuitos: this.numeros.filter(n => n.status === 'free').length
    };
  },

  exportarBackupJSON() {
    const payload = { premio: this.premio, numeros: this.numeros };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `backup_rifa_100_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  importarBackupJSON(conteudoTexto) {
    try {
      const dados = JSON.parse(conteudoTexto);
      if (dados.premio && dados.numeros) {
        this.premio = dados.premio;
        this.numeros = dados.numeros;
        localStorage.setItem(STORAGE_PREMIO_KEY, JSON.stringify(this.premio));
        this.salvarLocal();
        return { success: true };
      }
      return { success: false, message: 'Arquivo incompatível.' };
    } catch (e) {
      return { success: false, message: 'JSON inválido.' };
    }
  }
};
