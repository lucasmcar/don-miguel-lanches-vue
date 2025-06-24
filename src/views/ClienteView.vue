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

  <!-- Modal de Seleção de Adicionais -->
  <div v-if="mostrarModalAdicionais" class="modal-overlay">
    <div class="modal-box shadow-lg">
      <h5 class="text-primary">🍔 Personalizar {{ lancheSelecionado?.nome }}</h5>
      <p class="text-muted small mb-3">Selecione os adicionais desejados:</p>
      <ul class="list-group mb-3">
        <li
          v-for="adicional in cardapioAdicionais"
          :key="adicional.id"
          class="list-group-item d-flex align-items-center"
        >
          <input
            type="checkbox"
            v-model="adicionaisSelecionados"
            :value="adicional"
            class="form-check-input me-2"
          />
          <label class="form-check-label flex-grow-1">
            {{ adicional.nome }}
            <span class="text-success">R$ {{ adicional.preco.toFixed(2) }}</span>
            <p class="text-muted small mb-0">{{ adicional.descricao }}</p>
          </label>
        </li>
        <li v-if="!cardapioAdicionais.length" class="list-group-item text-muted">
          Nenhum adicional disponível.
        </li>
      </ul>
      <div class="d-flex gap-2">
        <button @click="confirmarAdicionais" class="btn btn-primary w-50">
          Adicionar ao Pedido
        </button>
        <button @click="cancelarAdicionais" class="btn btn-secondary w-50">
          Cancelar
        </button>
      </div>
    </div>
  </div>

  <div class="container py-5">
    <h1 class="text-center mb-4 text-primary fw-bold">Faça seu Pedido</h1>

    <!-- Dados do Cliente -->
    <div class="card shadow-sm p-4 mb-4">
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
            <span class="input-group-text"><i class="bi bi-telephone"></i></span>
            <input
              v-model="pedido.telefone"
              type="text"
              class="form-control"
              placeholder="Telefone (ex: (11) 99999-9999)"
            />
          </div>
        </div>
        <div class="col-md-4">
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              type="radio"
              name="deliveryOption"
              id="teleEntrega"
              value="tele-entrega"
              v-model="pedido.deliveryOption"
              @change="validateDeliveryOption"
            />
            <label class="form-check-label" for="teleEntrega">Tele-entrega</label>
          </div>
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              type="radio"
              name="deliveryOption"
              id="retirarLocal"
              value="retirar-local"
              v-model="pedido.deliveryOption"
              @change="validateDeliveryOption"
            />
            <label class="form-check-label" for="retirarLocal">Retirar no Local</label>
          </div>
        </div>
      </div>
      <div v-if="pedido.deliveryOption === 'tele-entrega'" class="row g-3 mt-3">
        <div class="col-md-8">
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
            <span class="input-group-text">R$</span>
            <input
              v-model="deliveryFee"
              type="number"
              step="0.01"
              min="0"
              class="form-control"
              :class="{ 'is-invalid': errors.deliveryFee }"
              placeholder="Taxa de entrega"
              @input="validateDeliveryFee"
            />
            <div v-if="errors.deliveryFee" class="invalid-feedback">
              {{ errors.deliveryFee }}
            </div>
          </div>
          <p v-if="!deliveryFee" class="text-muted small mt-1">
            Não sabe a taxa?
            <a :href="whatsappLink" target="_blank">Entre em contato</a> para confirmar o
            valor.
          </p>
        </div>
      </div>
    </div>

    <!-- Cardápio: Lanches -->
    <div class="card shadow-sm p-4 mb-4">
      <h4 class="mb-4 text-primary">🍔 Escolha seus Lanches</h4>
      <ul class="list-group">
        <li
          v-for="item in cardapioLanches"
          :key="item.id"
          class="list-group-item d-flex align-items-center bg-light rounded mb-2"
        >
          <img
            :src="item.imagem || 'https://via.placeholder.com/100x100?text=Sem+Imagem'"
            :alt="item.nome"
            class="rounded me-3"
            style="width: 100px; height: 100px; object-fit: cover"
          />
          <div class="flex-grow-1">
            <h6 class="mb-1 fw-bold text-primary">{{ item.nome }}</h6>
            <p class="text-muted small mb-1">{{ item.descricao }}</p>
            <span class="fw-bold text-success">R$ {{ item.preco.toFixed(2) }}</span>
          </div>
          <button
            @click="abrirModalAdicionais(item)"
            class="btn btn-sm btn-primary ms-3"
            :aria-label="'Adicionar ' + item.nome"
          >
            <i class="bi bi-plus-circle me-1"></i> Adicionar
          </button>
        </li>
        <li v-if="!cardapioLanches.length" class="list-group-item text-muted">
          Nenhum lanche disponível no momento.
        </li>
      </ul>
    </div>

    <!-- Cardápio: Bebidas -->
    <div class="card shadow-sm p-4 mb-4">
      <h4 class="mb-4 text-primary">🥤 Escolha suas Bebidas</h4>
      <ul class="list-group">
        <li
          v-for="item in cardapioBebidas"
          :key="item.id"
          class="list-group-item d-flex align-items-center bg-light rounded mb-2"
        >
          <img
            :src="item.imagem || 'https://via.placeholder.com/100x100?text=Sem+Imagem'"
            :alt="item.nome"
            class="rounded me-3"
            style="width: 100px; height: 100px; object-fit: cover"
          />
          <div class="flex-grow-1">
            <h6 class="mb-1 fw-bold text-primary">{{ item.nome }}</h6>
            <p class="text-muted small mb-1">{{ item.descricao }}</p>
            <span class="fw-bold text-success">R$ {{ item.preco.toFixed(2) }}</span>
          </div>
          <button
            @click="adicionarItem(item)"
            class="btn btn-sm btn-primary ms-3"
            :aria-label="'Adicionar ' + item.nome"
          >
            <i class="bi bi-plus-circle me-1"></i> Adicionar
          </button>
        </li>
        <li v-if="!cardapioBebidas.length" class="list-group-item text-muted">
          Nenhuma bebida disponível no momento.
        </li>
      </ul>
    </div>

    <!-- Cardápio: Adicionais -->
    <div class="card shadow-sm p-4 mb-4">
      <h4 class="mb-4 text-primary">🍟 Adicionais</h4>
      <ul class="list-group">
        <li
          v-for="item in cardapioAdicionais"
          :key="item.id"
          class="list-group-item d-flex align-items-center bg-light rounded mb-2"
        >
          <img
            :src="item.imagem || 'https://via.placeholder.com/100x100?text=Sem+Imagem'"
            :alt="item.nome"
            class="rounded me-3"
            style="width: 100px; height: 100px; object-fit: cover"
          />
          <div class="flex-grow-1">
            <h6 class="mb-1 fw-bold text-primary">{{ item.nome }}</h6>
            <p class="text-muted small mb-1">{{ item.descricao }}</p>
            <span class="fw-bold text-success">R$ {{ item.preco.toFixed(2) }}</span>
          </div>
          <button
            @click="adicionarItem(item)"
            class="btn btn-sm btn-primary ms-3"
            :aria-label="'Adicionar ' + item.nome"
          >
            <i class="bi bi-plus-circle me-1"></i> Adicionar
          </button>
        </li>
        <li v-if="!cardapioAdicionais.length" class="list-group-item text-muted">
          Nenhum adicional disponível no momento.
        </li>
      </ul>
    </div>

    <!-- Resumo do Pedido -->
    <div class="card shadow-sm p-4 mb-4">
      <h4 class="mb-4 text-primary">Resumo do Pedido</h4>
      <ul v-if="pedido.itens.length" class="list-group mb-3">
        <li
          v-for="(item, index) in pedido.itens"
          :key="index"
          class="list-group-item bg-light rounded mb-1"
        >
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <strong>{{ item.nome }}</strong>
              <span class="text-success ms-2">R$ {{ item.preco.toFixed(2) }}</span>
              <ul v-if="item.adicionais?.length" class="list-unstyled mt-1">
                <li
                  v-for="adicional in item.adicionais"
                  :key="adicional.id"
                  class="text-muted small"
                >
                  + {{ adicional.nome }} (R$ {{ adicional.preco.toFixed(2) }})
                </li>
              </ul>
            </div>
            <button
              @click="removerItem(index)"
              class="btn btn-sm btn-outline-danger"
              :aria-label="'Remover ' + item.nome"
            >
              <i class="bi bi-trash"></i> Remover
            </button>
          </div>
        </li>
      </ul>
      <p v-else class="text-muted">Nenhum item selecionado.</p>

      <div v-if="pedido.deliveryOption === 'tele-entrega' && deliveryFee" class="mb-3">
        <p class="text-success">
          Taxa de Entrega: R$ {{ Number(deliveryFee).toFixed(2) }}
        </p>
      </div>

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
      <p v-else class="text-danger">
        QR Code não gerado. Por favor, informe a taxa de entrega.
      </p>
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
import { getLanches, getBebidas, getAdicionais } from "../../services/cardapioService";
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
  deliveryOption: "tele-entrega",
});

const deliveryFee = ref(null);
const errors = ref({
  nome: "",
  endereco: "",
  deliveryFee: "",
});

const mostrarModal = ref(false);
const copiado = ref(false);
const cardapioLanches = ref([]);
const cardapioBebidas = ref([]);
const cardapioAdicionais = ref([]);
const statusPedido = ref("");
const pedidoFinalizado = ref(false);
const chavePix = "01703299094";
const pixQrCode = ref("");
const mostrarModalAdicionais = ref(false);
const lancheSelecionado = ref(null);
const adicionaisSelecionados = ref([]);

// WhatsApp link
const whatsappLink = computed(() => {
  const telefone = "5511999999999"; // Replace with business WhatsApp number
  const msg = `Olá, gostaria de confirmar a taxa de entrega para o endereço: ${
    pedido.value.endereco || "não informado"
  }.`;
  return `https://wa.me/${telefone}?text=${encodeURIComponent(msg)}`;
});

// Form validation
const validateNome = () => {
  errors.value.nome = pedido.value.nome.trim() ? "" : "Nome é obrigatório.";
};

const validateEndereco = () => {
  if (pedido.value.deliveryOption === "tele-entrega") {
    errors.value.endereco = pedido.value.endereco.trim()
      ? ""
      : "Endereço é obrigatório para tele-entrega.";
  } else {
    errors.value.endereco = "";
  }
};

const validateDeliveryFee = () => {
  if (pedido.value.deliveryOption === "tele-entrega") {
    errors.value.deliveryFee =
      deliveryFee.value && parseFloat(deliveryFee.value) >= 0
        ? ""
        : "Taxa de entrega é obrigatória para tele-entrega.";
  } else {
    errors.value.deliveryFee = "";
  }
};

const validateDeliveryOption = () => {
  validateEndereco();
  validateDeliveryFee();
};

const isFormValid = computed(() => {
  if (pedido.value.deliveryOption === "tele-entrega") {
    return (
      pedido.value.nome.trim() &&
      pedido.value.endereco.trim() &&
      deliveryFee.value &&
      parseFloat(deliveryFee.value) >= 0
    );
  }
  return pedido.value.nome.trim();
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

// Modal de adicionais
const abrirModalAdicionais = (item) => {
  lancheSelecionado.value = item;
  adicionaisSelecionados.value = [];
  mostrarModalAdicionais.value = true;
};

const confirmarAdicionais = () => {
  if (lancheSelecionado.value) {
    const itemComAdicionais = {
      ...lancheSelecionado.value,
      adicionais: adicionaisSelecionados.value.map((adicional) => ({
        id: adicional.id,
        nome: adicional.nome,
        preco: adicional.preco,
        descricao: adicional.descricao,
      })),
    };
    pedido.value.itens.push(itemComAdicionais);
  }
  mostrarModalAdicionais.value = false;
  lancheSelecionado.value = null;
  adicionaisSelecionados.value = [];
};

const cancelarAdicionais = () => {
  mostrarModalAdicionais.value = false;
  lancheSelecionado.value = null;
  adicionaisSelecionados.value = [];
};

// Gerar QR Code Pix
async function gerarQrCodePix() {
  if (typeof window === "undefined" || typeof window.btoa === "undefined") {
    console.warn("Ambiente sem window.btoa, geração de QR Code Pix não suportada");
    pixQrCode.value = "";
    return;
  }

  if (pedido.value.deliveryOption === "tele-entrega" && !deliveryFee.value) {
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
    message: `Pagamento do pedido #${pedido.value.numeroPedido}`,
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
  const itemsTotal = pedido.value.itens.reduce((total, item) => {
    const precoItem = parseFloat(item.preco || 0);
    const precoAdicionais = item.adicionais
      ? item.adicionais.reduce(
          (acc, adicional) => acc + parseFloat(adicional.preco || 0),
          0
        )
      : 0;
    return total + precoItem + precoAdicionais;
  }, 0);

  const fee =
    pedido.value.deliveryOption === "tele-entrega" && deliveryFee.value
      ? parseFloat(deliveryFee.value) || 0
      : 0;

  return itemsTotal + fee;
});

// Regenera QR code
watch(
  [totalPedido, pedidoFinalizado, deliveryFee, () => pedido.value.deliveryOption],
  () => {
    if (pedidoFinalizado.value) {
      gerarQrCodePix();
    } else {
      pixQrCode.value = "";
    }
  }
);

// Carregar cardápios
onMounted(async () => {
  const lanches = await getLanches();
  cardapioLanches.value = lanches.map((item) => ({
    ...item,
    imagem: item.imagem || null,
  }));

  const bebidas = await getBebidas();
  cardapioBebidas.value = bebidas.map((item) => ({
    ...item,
    imagem: item.imagem || null,
  }));

  const adicionais = await getAdicionais();
  cardapioAdicionais.value = adicionais.map((item) => ({
    ...item,
    imagem: item.imagem || null,
  }));
});

// Adicionar item (bebida ou adicional)
const adicionarItem = (item) => {
  pedido.value.itens.push({ ...item, adicionais: [] });
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
    validateDeliveryFee();
    return;
  }
  try {
    await criarPedido({
      ...pedido.value,
      deliveryFee:
        pedido.value.deliveryOption === "tele-entrega"
          ? parseFloat(deliveryFee.value) || 0
          : 0,
    });
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
    deliveryOption: "tele-entrega",
  };
  deliveryFee.value = null;
  errors.value = {
    nome: "",
    endereco: "",
    deliveryFee: "",
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
  padding-top: 80px;
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

.form-check-input:checked {
  background-color: #dc3545;
  border-color: #dc3545;
}
</style>
