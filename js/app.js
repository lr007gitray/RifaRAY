/**
 * app.js - Integração com Comprovante em Foto
 */

// ⚠️ DIGITE SEU NÚMERO DE WHATSAPP AQUI (Com DDD, apenas números)
const SEU_WHATSAPP = '5511975521048';

document.addEventListener('DOMContentLoaded', () => {
  RifaSystem.init();
  setupEvents();
  atualizarInterface();
});

function setupEvents() {
  // Alternar Visibilidade Admin
  const btnToggleAdmin = document.getElementById('btn-toggle-admin');
  const adminPanel = document.getElementById('admin-panel');
  if (btnToggleAdmin && adminPanel) {
    btnToggleAdmin.addEventListener('click', () => adminPanel.classList.toggle('hidden'));
  }

  // Formulário Editar Prêmio
  const formPrize = document.getElementById('form-edit-prize');
  if (formPrize) {
    formPrize.addEventListener('submit', (e) => {
      e.preventDefault();
      const t = document.getElementById('edit-title').value;
      const d = document.getElementById('edit-desc').value;
      const v = document.getElementById('edit-price').value;
      const fileInput = document.getElementById('edit-img-file');

      if (fileInput && fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (event) {
          RifaSystem.salvarPremio(t, d, v, event.target.result);
          atualizarInterface();
          alert('Prêmio e foto atualizados!');
        };
        reader.readAsDataURL(fileInput.files[0]);
      } else {
        RifaSystem.salvarPremio(t, d, v, RifaSystem.premio.imagem);
        atualizarInterface();
        alert('Prêmio atualizado!');
      }
    });
  }

  // Form Admin Estado
  const adminForm = document.getElementById('admin-form');
  if (adminForm) adminForm.addEventListener('submit', handleAdminSubmit);

  // Botão Sorteio
  const btnDraw = document.getElementById('btn-draw');
  if (btnDraw) btnDraw.addEventListener('click', executarAnimacaoESorteio);

  // Modal Fechar / Enviar
  const btnCloseModal = document.getElementById('btn-close-modal');
  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', () => {
      document.getElementById('modal-buy').classList.add('hidden');
    });
  }

  const formBuyClient = document.getElementById('form-buy-client');
  if (formBuyClient) formBuyClient.addEventListener('submit', handleClientBuySubmit);

  // Botão Baixar Imagem do Comprovante
  const btnDownloadReceipt = document.getElementById('btn-download-receipt');
  if (btnDownloadReceipt) {
    btnDownloadReceipt.addEventListener('click', baixarFotoComprovante);
  }

  // Botão Fechar Comprovante
  const btnFinish = document.getElementById('btn-finish-receipt');
  if (btnFinish) {
    btnFinish.addEventListener('click', () => {
      document.getElementById('modal-buy').classList.add('hidden');
    });
  }

  // Backups
  const btnExportar = document.getElementById('btn-exportar');
  const btnImportar = document.getElementById('btn-importar');
  const fileImportar = document.getElementById('file-importar');

  if (btnExportar) btnExportar.addEventListener('click', () => RifaSystem.exportarBackupJSON());
  if (btnImportar && fileImportar) {
    btnImportar.addEventListener('click', () => fileImportar.click());
    fileImportar.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const res = RifaSystem.importarBackupJSON(event.target.result);
        if (res.success) {
          atualizarInterface();
          alert('Backup restaurado!');
        } else alert(res.message);
      };
      reader.readAsText(file);
    });
  }
}

// Reserva e gera o Card Comprovante
function handleClientBuySubmit(e) {
  e.preventDefault();
  const num = Number(document.getElementById('modal-number-input').value);
  const name = document.getElementById('client-name').value;
  const phone = document.getElementById('client-phone').value;

  try {
    const part = ParticipantesModule.criarParticipante(name, phone);
    RifaSystem.atualizarNumero(num, 'reserved', part);
    atualizarInterface();

    const numFmt = String(num).padStart(2, '0');
    const agora = new Date().toLocaleDateString('pt-BR');
    const codAuth = 'RF-' + Math.floor(1000 + Math.random() * 9000);

    // Preenche o Card Comprovante
    document.getElementById('rec-number').textContent = numFmt;
    document.getElementById('rec-prize').textContent = RifaSystem.premio.titulo;
    document.getElementById('rec-name').textContent = name;
    document.getElementById('rec-phone').textContent = phone;
    document.getElementById('rec-value').textContent = RifaSystem.premio.valor;
    document.getElementById('rec-date').textContent = agora;
    document.getElementById('rec-code').textContent = codAuth;

    // Ação do Botão WhatsApp
    const btnWA = document.getElementById('btn-send-whatsapp');
    btnWA.onclick = () => {
      const msg = `Olá! Acabei de reservar o *Número ${numFmt}* na rifa (*${RifaSystem.premio.titulo}*).\n\n*Nome:* ${name}\n*Código:* ${codAuth}\n\nComo faço para pagar?`;
      window.open(`https://wa.me/${SEU_WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    // Alterna a modal do formulário para o comprovante
    document.getElementById('modal-step-form').classList.add('hidden');
    document.getElementById('modal-step-receipt').classList.remove('hidden');

  } catch (err) {
    alert(err.message);
  }
}

// Transforma o Card HTML em arquivo de imagem .PNG
function baixarFotoComprovante() {
  const cardElement = document.getElementById('ticket-receipt-card');
  
  html2canvas(cardElement).then(canvas => {
    const link = document.createElement('a');
    link.download = `comprovante_numero_${document.getElementById('rec-number').textContent}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
}

function handleAdminSubmit(e) {
  e.preventDefault();
  const num = Number(document.getElementById('input-number').value);
  const name = document.getElementById('input-name').value;
  const phone = document.getElementById('input-phone').value;
  const status = document.getElementById('select-status').value;

  let part = null;
  if (status !== 'available') {
    try { part = ParticipantesModule.criarParticipante(name, phone); }
    catch(err) { alert(err.message); return; }
  }

  RifaSystem.atualizarNumero(num, status, part);
  atualizarInterface();
  e.target.reset();
  alert(`Número ${String(num).padStart(2, '0')} atualizado!`);
}

function atualizarInterface() {
  renderPremio();
  renderGrid();
  renderEstatisticas();
}

function renderPremio() {
  const p = RifaSystem.premio;
  document.getElementById('prize-title').textContent = p.titulo;
  document.getElementById('prize-description').textContent = p.descricao;
  document.getElementById('prize-ticket-price').textContent = p.valor;
  document.getElementById('prize-img').src = p.imagem;

  document.getElementById('edit-title').value = p.titulo;
  document.getElementById('edit-desc').value = p.descricao;
  document.getElementById('edit-price').value = p.valor;
}

function renderGrid() {
  const gridContainer = document.getElementById('numbers-grid');
  if (!gridContainer) return;
  gridContainer.innerHTML = '';

  RifaSystem.numeros.forEach(item => {
    const numFmt = String(item.numero).padStart(2, '0');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `number-btn ${item.status}`;
    button.textContent = numFmt;

    button.addEventListener('click', () => {
      if (item.status === 'available') {
        document.getElementById('modal-step-form').classList.remove('hidden');
        document.getElementById('modal-step-receipt').classList.add('hidden');
        
        document.getElementById('modal-title').textContent = `Reservar Número ${numFmt}`;
        document.getElementById('modal-number-input').value = item.numero;
        document.getElementById('modal-buy').classList.remove('hidden');
      } else {
        const p = item.participante;
        alert(`Número ${numFmt} [${item.status.toUpperCase()}]\nParticipante: ${p ? p.nome : 'N/I'}`);
      }
    });

    gridContainer.appendChild(button);
  });
}

function renderEstatisticas() {
  const stats = RifaSystem.obterEstatisticas();
  document.getElementById('stat-available').textContent = stats.disponiveis;
  document.getElementById('stat-reserved').textContent = stats.reservados;
  document.getElementById('stat-sold').textContent = stats.vendidos;
  document.getElementById('stat-free').textContent = stats.gratuitos;
}

function executarAnimacaoESorteio() {
  const resultado = SorteioModule.realizarSorteio();
  if (!resultado.sucesso) { alert(resultado.mensagem); return; }

  const btnDraw = document.getElementById('btn-draw');
  const spinner = document.getElementById('draw-number-spinner');
  const resultCard = document.getElementById('draw-result-card');

  btnDraw.disabled = true;
  resultCard.classList.add('hidden');

  let giros = 0;
  const timer = setInterval(() => {
    spinner.textContent = String(Math.floor(Math.random() * 100) + 1).padStart(2, '0');
    giros++;
    if (giros >= 30) {
      clearInterval(timer);
      const numFinal = String(resultado.numero).padStart(2, '0');
      spinner.textContent = numFinal;
      document.getElementById('res-datetime').textContent = resultado.dataHora;
      document.getElementById('res-number').textContent = numFinal;
      document.getElementById('res-winner').textContent = resultado.ganhador;
      document.getElementById('res-hash').textContent = resultado.hash;
      resultCard.classList.remove('hidden');
      btnDraw.disabled = false;
    }
  }, 80);
}
