<template>
  <!-- Toolbar -->
  <nav class="navbar navbar-light bg-primary" style="padding: 16px 8px">
    <a class="navbar-brand" style="color: white">Don Miguel Lanches</a>
    <ConsultaPedido />
  </nav>

  <!-- Modal -->
  <div v-if="mostrarModal" class="modal-overlay mt-3">
    <div class="modal-box shadow-lg">
      <h5 class="text-success">
        <i class="bi bi-check-circle-fill me-2"></i> Pedido Finalizado
      </h5>
      <p class="text-muted">Seu pedido foi registrado com sucesso!</p>
      <p>
        <strong>Número do pedido:</strong>
        <code class="bg-light p-1 rounded">{{ pedido.numeroPedido }}</code>
        <button @click="copiarNumeroPedido" class="btn btn-sm btn-outline-primary ms-2">
          {{ copiado ? "Copiado!" : "Copiar" }}
        </button>
      </p>
      <p class="text-muted small">Acompanhe o andamento aqui mesmo pelo site.</p>
      <button @click="fecharModal" class="btn btn-success w-100">Ok, entendi</button>
    </div>
  </div>

  <div class="container py-5 mt -4">
    <h1 class="text-center mb-4 text-primary fw-bold">Faça seu Pedido</h1>

    <!-- Dados do Cliente -->
    <div class="card shadow-sm p-4 mb-4 mt-5">
      <h4 class="mb-4 text-primary">Seus Dados</h4>
      <div class="row g-3">
        <div class="col-md-4">
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-person"></i></span>
            <input
              v-model="pedido.nome"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errors.nome }"
              placeholder="Seu nome completo"
              @input="validateNome"
            />
            <div v-if="errors.nome" class="invalid-feedback">{{ errors.nome }}</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-geo-alt"></i></span>
            <input
              v-model="pedido.endereco"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errors.endereco }"
              placeholder="Endereço de entrega"
              @input="validateEndereco"
            />
            <div v-if="errors.endereco" class="invalid-feedback">
              {{ errors.endereco }}
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-telephone"></i></span>
            <input
              v-model="pedido.telefone"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errors.telefone }"
              placeholder="Telefone (ex: 11999999999)"
            />
            <div v-if="errors.telefone" class="invalid-feedback">
              {{ errors.telefone }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cardápio -->
    <div class="card shadow-sm p-4 mb-4">
      <h4 class="mb-4 text-primary">Escolha seus Lanches</h4>
      <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-4">
        <div v-for="item in cardapio" :key="item.id" class="col">
          <div class="card h-100 border-0 shadow-sm rounded-3">
            <img
              :src="item.imagem || 'https://via.placeholder.com/300x150?text=Sem+Imagem'"
              :alt="item.nome"
              class="card-img-top rounded-top"
              style="height: 150px; object-fit: cover"
            />
            <div class="card-body p-3">
              <h6 class="card-title fw-bold text-primary">{{ item.nome }}</h6>
              <p class="text-muted small mb-2">{{ item.descricao }}</p>
              <div class="d-flex justify-content-between align-items-center">
                <span class="fw-bold text-success">R$ {{ item.preco.toFixed(2) }}</span>
                <button @click="adicionarItem(item)" class="btn btn-sm btn-primary">
                  <i class="bi bi-plus-circle me-1"></i> Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Resumo do Pedido -->
    <div class="card shadow-sm p-4 mb-4">
      <h4 class="mb-4 text-primary">Resumo do Pedido</h4>
      <ul v-if="pedido.itens.length" class="list-group mb-3">
        <li
          v-for="(item, index) in pedido.itens"
          :key="index"
          class="list-group-item d-flex justify-content-between align-items-center bg-light rounded mb-1"
        >
          <div>
            <strong>{{ item.nome }}</strong
            ><br />
            <small>R$ {{ item.preco.toFixed(2) }}</small>
          </div>
          <button @click="removerItem(index)" class="btn btn-sm btn-outline-danger">
            <i class="bi bi-trash"></i> Remover
          </button>
        </li>
      </ul>
      <p v-else class="text-muted">Nenhum item selecionado.</p>

      <div class="mb-3">
        <label class="form-label">Observações:</label>
        <textarea
          v-model="pedido.observacoes"
          class="form-control"
          rows="3"
          placeholder="Ex: sem cebola, ponto da carne, etc."
        ></textarea>
      </div>

      <div class="d-flex justify-content-between align-items-center">
        <h5 class="mb-0 fw-bold text-success">
          Total: R$ {{ Number(totalPedido).toFixed(2) }}
        </h5>
      </div>
    </div>

    <!-- Pagamento via PIX -->
    <div v-if="pedidoFinalizado" class="mt-4 p-4 border border-success rounded bg-light">
      <h5 class="mb-3 text-success"><i class="bi bi-qr-code me-2"></i> Pagar com PIX</h5>
      <p class="mb-2">
        Chave PIX: <strong>{{ chavePix }}</strong>
      </p>
      <img
        v-if="pixQrCode"
        :src="pixQrCode"
        alt="QR Code PIX"
        class="img-fluid my-2 d-block mx-auto border p-2 rounded"
        style="max-width: 200px"
      />
      <p class="text-muted small text-center">Escaneie ou copie a chave PIX acima.</p>
      <button @click="confirmarPagamentoPix" class="btn btn-outline-success w-100">
        Já paguei via PIX
      </button>
    </div>

    <!-- Botão fixo de Finalizar Pedido -->
    <button
      v-if="pedido.itens.length && !pedidoFinalizado"
      @click="finalizarPedido"
      class="btn btn-success btn-lg w-100 position-fixed bottom-0 start-0 end-0 rounded-0 shadow"
      style="z-index: 999"
      :disabled="!isFormValid"
    >
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
  status: "Aguardando",
});

const errors = ref({
  nome: "",
  endereco: "",
  telefone: "",
});

const mostrarModal = ref(false);
const copiado = ref(false);
const cardapio = ref([]);
const statusPedido = ref("");
const pedidoFinalizado = ref(false);
const chavePix = "01703299094";
const pixQrCode = ref("");

// Form validation
const validateNome = () => {
  errors.value.nome = pedido.value.nome.trim() ? "" : "Nome é obrigatório.";
};

const validateEndereco = () => {
  errors.value.endereco = pedido.value.endereco.trim() ? "" : "Endereço é obrigatório.";
};

const isFormValid = computed(() => {
  return (
    pedido.value.nome.trim() &&
    pedido.value.endereco.trim() &&
    /^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(pedido.value.telefone)
  );
});

// Copiar número do pedido
const copiarNumeroPedido = async () => {
  try {
    await navigator.clipboard.writeText(pedido.value.numeroPedido.toString());
    copiado.value = true;
    setTimeout(() => (copiado.value = false), 2000);
  } catch (error) {
    alert("Erro ao copiar.");
    console.error(error);
  }
};

// Fechar modal
const fecharModal = () => {
  mostrarModal.value = false;
};

// Gerar QR Code Pix
async function gerarQrCodePix() {
  if (typeof window === "undefined" || typeof window.btoa === "undefined") {
    console.warn("Ambiente sem window.btoa, geração de QR Code Pix não suportada");
    pixQrCode.value = "";
    return;
  }

  let total;
  try {
    const normalizedValue = (totalPedido.value || "").toString().replace(",", ".");
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

  const qrCodePix = QrCodePix({
    version: "01",
    key: chavePix,
    name: "Lucas Carvalho",
    city: "PortoAlegre",
    message: "Pagamento do pedido " + numeroPedido,
    value: total,
  });

  try {
    pixQrCode.value = await qrCodePix.base64();
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

// Regenera QR code
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
  cardapio.value = dados.map((item) => ({
    ...item,
    imagem: item.imagem || null, // Assume cardapioService returns an 'imagem' field
  }));
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
  if (!isFormValid.value) {
    validateNome();
    validateEndereco();
    validateTelefone();
    return;
  }
  try {
    await criarPedido(pedido.value);
    statusPedido.value = "Pedido enviado! Aguardando pagamento via PIX...";
    pedidoFinalizado.value = true;
    mostrarModal.value = true;
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
  }
};

// Confirma pagamento via PIX
const confirmarPagamentoPix = () => {
  statusPedido.value = "Pagamento confirmado! Seu pedido está sendo preparado.";
  pedido.value = {
    nome: "",
    endereco: "",
    telefone: "",
    itens: [],
    observacoes: "",
    numeroPedido: Math.floor(100000 + Math.random() * 900000),
    status: "Aguardando",
  };
  pedidoFinalizado.value = false;
};

// Acompanhar status do pedido
onMounted(() => {
  getPedidos((pedidos) => {
    const meuPedido = pedidos.find((p) => p.telefone === pedido.value.telefone);
    if (meuPedido) {
      statusPedido.value = meuPedido.status;
    }
  });
});
</script>

<style scoped>
.toolbar {
  background-color: #dc3545;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.container {
  padding-top: 80px; /* Space for fixed toolbar */
}

h1,
h4 {
  font-weight: 600;
  color: #dc3545;
}

.card {
  border-radius: 0.75rem;
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-2px);
}

.btn-primary {
  background-color: #dc3545;
  border-color: #dc3545;
}

.btn-primary:hover {
  background-color: #c82333;
  border-color: #c82333;
}

.btn-success {
  background-color: #28a745;
  border-color: #28a745;
}

.btn-success:hover {
  background-color: #218838;
  border-color: #218838;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
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
  max-width: 450px;
  width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.form-control:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

.list-group-item {
  transition: background-color 0.2s;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}
</style>
