<template>
  <div class="container py-5">

    
    <h1 class="text-center mb-4 text-primary fw-bold">🍔 Faça seu Pedido</h1>

    <div class="text-center mt-4">
      <ConsultaPedido />
    </div>
    <!-- Dados do Cliente -->
    <div class="card shadow p-4 mb-4">
      <h4 class="mb-3">Seus Dados</h4>
      <div class="row g-3">
        <div class="col-md-4">
          <input v-model="pedido.nome" type="text" class="form-control" placeholder="Seu nome" />
        </div>
        <div class="col-md-4">
          <input v-model="pedido.endereco" type="text" class="form-control" placeholder="Endereço de entrega" />
        </div>
        <div class="col-md-4">
          <input v-model="pedido.telefone" type="text" class="form-control" placeholder="Telefone" />
        </div>
      </div>
    </div>

    <!-- Cardápio -->
    <div class="card shadow p-4 mb-4">
      <h4 class="mb-3">Escolha seus Lanches</h4>
      <div class="row">
        <div
          v-for="item in cardapio"
          :key="item.id"
          class="col-md-4 mb-3"
        >
          <div class="card h-100 shadow-sm">
            <div class="card-body">
              <h5 class="card-title">{{ item.nome }}</h5>
              <p class="card-text text-muted">{{ item.descricao }}</p>
              <p class="fw-bold">R$ {{ item.preco.toFixed(2) }}</p>
              <button
                @click="adicionarItem(item)"
                class="btn btn-sm btn-primary"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Resumo do Pedido -->
    <div class="card shadow p-4 mb-4">
      <h4 class="mb-3">Resumo do Pedido</h4>
      <ul class="list-group mb-3">
        <li
          v-for="(item, index) in pedido.itens"
          :key="index"
          class="list-group-item d-flex justify-content-between align-items-center"
        >
          {{ item.nome }} - R$ {{ item.preco.toFixed(2) }}
          <button
            @click="removerItem(index)"
            class="btn btn-sm btn-outline-danger"
          >
            Remover
          </button>
        </li>
      </ul>
      <div class="mb-3">
        <label class="form-label">Observações:</label>
        <textarea
          v-model="pedido.observacoes"
          class="form-control"
          rows="2"
          placeholder="Ex: sem cebola, ponto da carne, etc."
        ></textarea>
      </div>
      <div class="d-flex justify-content-between align-items-center">
        <h5 class="mb-0 fw-bold text-success">
          Total: R$ {{ totalPedido.toFixed(2) }}
        </h5>
        <button
          @click="finalizarPedido"
          class="btn btn-success btn-lg shadow"
        >
          Finalizar Pedido
        </button>
      </div>

      <!-- Pagamento via PIX -->
      <div v-if="pedidoFinalizado" class="mt-4 p-3 border border-success rounded">
        <h5 class="mb-2 text-success">💸 Pagar com PIX</h5>
        <p class="mb-2">Chave PIX: <strong>{{ chavePix }}</strong></p>
        <img
          :src="pixQrCode"
          alt="QR Code PIX"
          class="img-fluid mb-2"
          style="max-width: 200px;"
        />
        <p class="text-muted small">Escaneie o QR Code no seu app de banco ou copie a chave PIX para pagamento.</p>
        <button
          @click="confirmarPagamentoPix"
          class="btn btn-outline-success btn-sm"
        >
          Já paguei via PIX
        </button>
      </div>
    </div>
  </div>

</template>
<script>
  import ConsultaPedido from "../componentes/ConsultaPedido.vue";
</script>

<script setup>
import { ref, computed, onMounted } from "vue";
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

const cardapio = ref([]);
const statusPedido = ref("");
const pedidoFinalizado = ref(false);

// Chave PIX e QR Code (exemplo estático; ideal: gerar dinâmico em backend)
const chavePix = "pix@exemplo.com";
const pixQrCode = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=pix@exemplo.com";

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

// Calcular total
const totalPedido = computed(() => {
  return pedido.value.itens.reduce((total, item) => total + item.preco, 0);
});

// Finalizar pedido
const finalizarPedido = async () => {
  try {
    await criarPedido(pedido.value);
    statusPedido.value = "Pedido enviado! Aguardando pagamento via PIX...";
    pedidoFinalizado.value = true;
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
</style>
