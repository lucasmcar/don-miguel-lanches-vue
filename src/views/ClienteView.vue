<template>

  <!-- Modal -->
  <div v-if="mostrarModal" class="modal-overlay">
    <div class="modal-box">
      <h5>✅ Pedido Finalizado</h5>
      <p>Seu pedido foi registrado com sucesso!</p>

      <p>
        <strong>Número do pedido:</strong>
        <code>{{ pedido.numeroPedido }}</code>
        <button @click="copiarNumeroPedido" class="btn btn-sm btn-outline-primary ms-2">
          {{ copiado ? 'Copiado!' : 'Copiar' }}
        </button>
      </p>

      <p>Acompanhe o andamento aqui mesmo pelo site.</p>

      <button @click="fecharModal" class="btn btn-success mt-3">Ok, entendi</button>
    </div>
  </div>
  <div class="container py-5">
    <h1 class="text-center mb-4 text-primary fw-bold">🍔 Faça seu Pedido</h1>

    <div class="text-center mt-4 mb-4">
      <ConsultaPedido />
    </div>

    <!-- Dados do Cliente -->
    <div class="card shadow p-4 mb-4">
      <h4 class="mb-3">Seus Dados</h4>
      <div class="row g-3">
        <div class="col-md-4">
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-person"></i></span>
            <input v-model="pedido.nome" type="text" class="form-control" placeholder="Seu nome completo" />
          </div>
        </div>
        <div class="col-md-4">
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-geo-alt"></i></span>
            <input v-model="pedido.endereco" type="text" class="form-control" placeholder="Endereço de entrega" />
          </div>
        </div>
        <div class="col-md-4">
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-telephone"></i></span>
            <input v-model="pedido.telefone" type="text" class="form-control" placeholder="Telefone" />
          </div>
        </div>
      </div>
    </div>

    <!-- Cardápio -->
    <!--<div class="card shadow p-4 mb-4">
      <h4 class="mb-3">Escolha seus Lanches</h4>
      <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
        <div v-for="item in cardapio" :key="item.id" class="col">
          <div class="card h-100 border-0 bg-light rounded-4">
            <div class="card-body p-3">
              <h6 class="card-title fw-semibold text-primary">{{ item.nome }}</h6>
              <small class="text-muted d-block mb-2">{{ item.descricao }}</small>
              <div class="d-flex justify-content-between align-items-center">
                <span class="fw-bold">R$ {{ item.preco.toFixed(2) }}</span>
                <button @click="adicionarItem(item)" class="btn btn-sm btn-outline-primary">+</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>-->
    <div class="card shadow p-4 mb-4">
      <h4 class="mb-3">Escolha seus Lanches</h4>
      <ul class="list-group">
        <li v-for="item in cardapio" :key="item.id"
          class="list-group-item d-flex justify-content-between align-items-start flex-column flex-md-row">
          <div class="me-md-3">
            <h6 class="fw-bold mb-1">{{ item.nome }} <span class="text-success">R$ {{ item.preco.toFixed(2) }}</span>
            </h6>
            <p class="mb-1 text-muted small">{{ item.descricao }}</p>
          </div>
          <div class="mt-2 mt-md-0">
            <button @click="adicionarItem(item)" class="btn btn-sm btn-outline-primary">
              Adicionar
            </button>
          </div>
        </li>
      </ul>
    </div>

    <!-- Resumo do Pedido -->
    <div class="card shadow p-4 mb-4">
      <h4 class="mb-3">Resumo do Pedido</h4>
      <ul class="list-group mb-3">
        <li v-for="(item, index) in pedido.itens" :key="index"
          class="list-group-item d-flex justify-content-between align-items-center bg-light rounded mb-1">
          <div>
            <strong>{{ item.nome }}</strong><br />
            <small>R$ {{ item.preco.toFixed(2) }}</small>
          </div>
          <button @click="removerItem(index)" class="btn btn-sm btn-outline-danger">Remover</button>
        </li>
      </ul>

      <div class="mb-3">
        <label class="form-label">Observações:</label>
        <textarea v-model="pedido.observacoes" class="form-control" rows="2"
          placeholder="Ex: sem cebola, ponto da carne, etc."></textarea>
      </div>

      <div class="d-flex justify-content-between align-items-center">
        <h5 class="mb-0 fw-bold text-success">
          Total: R$ {{ Number(totalPedido).toFixed(2) }}
        </h5>
      </div>
    </div>

    <!-- Pagamento via PIX -->
    <div v-if="pedidoFinalizado" class="mt-4 p-3 border border-success rounded">
      <h5 class="mb-2 text-success">💸 Pagar com PIX</h5>
      <p class="mb-2">Chave PIX: <strong>{{ chavePix }}</strong></p>
      <img v-if="pixQrCode" :src="pixQrCode" alt="QR Code PIX" class="img-fluid my-2 d-block mx-auto border p-2 rounded"
        style="max-width: 200px;" />
      <p class="text-muted small text-center">Escaneie ou copie a chave PIX acima.</p>
      <button @click="confirmarPagamentoPix" class="btn btn-outline-success btn-sm">
        Já paguei via PIX
      </button>
    </div>

    <!-- Botão fixo de Finalizar Pedido -->
    <button v-if="pedido.itens.length" @click="finalizarPedido"
      class="btn btn-success btn-lg w-100 position-fixed bottom-0 start-0 end-0 rounded-0 shadow" style="z-index: 999;">
      Finalizar Pedido
    </button>
  </div>
</template>

<script>
import ConsultaPedido from "../componentes/ConsultaPedido.vue";
</script>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { QrCodePix } from "qrcode-pix";
import { criarPedido } from "../../services/pedidoService";
import { getLanches } from "../../services/cardapioService";
import { getPedidos } from "../../services/pedidoService";

const numeroPedido = Math.floor(100000 + Math.random() * 900000);

const pedido = ref({
  nome: "",
  endereco: "",
  telefone: "",
  itens: [],
  observacoes: "",
  numeroPedido: numeroPedido,
  status: "Aguardando"
});


const mostrarModal = ref(false);
const copiado = ref(false);


// Copiar número do pedido
const copiarNumeroPedido = async () => {
  try {
    await navigator.clipboard.writeText(pedido.value.numeroPedido.toString());
    copiado.value = true;
    setTimeout(() => (copiado.value = false), 2000); // reseta após 2s
  } catch (error) {
    alert("Erro ao copiar.");
    console.error(error);
  }
};

// Fechar modal
const fecharModal = () => {
  mostrarModal.value = false;
};

/*const gerarLinkWhatsapp = () => {
  if (!pedido.value || !pedido.value.telefone) {
    console.warn("Telefone ou pedido está indefinido:", pedido.value);
    alert("Não foi possível gerar o link do WhatsApp. Verifique os dados do pedido.");
    return;

  }

  const telefone = pedido.value.telefone.toString().replace(/\D/g, '');
  const numeroPedido = pedido.value.numeroPedido || Math.floor(1000 + Math.random() * 9000);

  const msg = `Olá ${pedido.value.nome || "cliente"}, seu pedido número #${numeroPedido} foi recebido com sucesso! 🍔

Acompanhe o status do seu pedido por aqui mesmo. Clicando no botão "acompanhar pedido"`;

  const url = `https://wa.me/55${telefone}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
};*/


const cardapio = ref([]);
const statusPedido = ref("");
const pedidoFinalizado = ref(false);


const chavePix = "01703299094"; // sua chave Pix aqui
const pixQrCode = ref(""); // vai guardar o base64 do QR Code

// Função para gerar QR Code Pix em base64 para img src
// Função para gerar QR Code Pix em base64 para img src
async function gerarQrCodePix() {
  if (typeof window === 'undefined' || typeof window.btoa === 'undefined') {
    console.warn("Ambiente sem window.btoa, geração de QR Code Pix não suportada");
    pixQrCode.value = "";
    return;
  }

  // Normalizar o valor
  let total;
  try {
    const normalizedValue = (totalPedido.value || '').toString().replace(',', '.');
    total = parseFloat(normalizedValue);
  } catch (e) {
    console.warn("Erro ao converter totalPedido.value:", e);
    pixQrCode.value = "";
    return;
  }

  if (isNaN(total) || total <= 0) {
    console.warn("Total do pedido inválido:", totalPedido.value, total);
    pixQrCode.value = "";
    return;
  }

  // Gerar o QR Code Pix com os dados corretos
  const qrCodePix = QrCodePix({
    version: '01',
    key: chavePix,      // Chave Pix válida (email fictício aqui)
    name: 'Lucas Carvalho',              // Máx. 25 caracteres, SEM acento
    city: 'PortoAlegre',               // Máx. 15 caracteres, SEM acento
    message: 'Pagamento do pedido',
    value: total                       // Valor em número (float), com ponto
  });

  try {
    pixQrCode.value = await qrCodePix.base64(); // Gera imagem base64 para o <img>
  } catch (error) {
    console.error("Erro ao gerar o QR Code Pix:", error);
    pixQrCode.value = "";
  }
}

// Calcular total
const totalPedido = computed(() => {
  return pedido.value.itens.reduce((total, item) => {
    const preco = parseFloat(item.preco || 0);
    return total + (isNaN(preco) ? 0 : preco);
  }, 0);
});

// Regenera QR code sempre que o total ou o pedido for finalizado
watch([totalPedido, pedidoFinalizado], () => {
  if (pedidoFinalizado.value) {
    gerarQrCodePix();
  } else {
    pixQrCode.value = "";
  }
});

// Carregar cardápio
onMounted(async () => {
  const dados = await getLanches();
  cardapio.value = dados;
});

// Adicionar item
const adicionarItem = (item) => {
  pedido.value.itens.push(item);
};

// Remover item
const removerItem = (index) => {
  pedido.value.itens.splice(index, 1);
};



// Finalizar pedido
const finalizarPedido = async () => {
  try {
    await criarPedido(pedido.value);
    statusPedido.value = "Pedido enviado! Aguardando pagamento via PIX...";
    pedidoFinalizado.value = true;
    mostrarModal.value = true; // mostra modal
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
  }
};

// Confirma pagamento via PIX
const confirmarPagamentoPix = () => {
  // Simplesmente atualiza o status (em um app real, confirmaria no backend)
  statusPedido.value = "Pagamento confirmado! Seu pedido está sendo preparado.";
  // Limpa os campos para novo pedido
  pedido.value = {
    nome: "",
    endereco: "",
    telefone: "",
    itens: [],
    observacoes: "",

    status: "Aguardando"
  };
  pedidoFinalizado.value = false;
};

// Acompanhar status do pedido (opcional)
onMounted(() => {
  getPedidos((pedidos) => {
    const meuPedido = pedidos.find(
      (p) => p.telefone === pedido.value.telefone
    );
    if (meuPedido) {
      statusPedido.value = meuPedido.status;
    }
  });
});
</script>

<style scoped>
h1 {
  font-weight: 700;
}

.card-title {
  font-weight: 600;
}

.btn-primary {
  background-color: #dc3545;
  border: none;
}

.btn-primary:hover {
  background-color: #c82333;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-box {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
  max-width: 400px;
  width: 90%;
}
</style>
