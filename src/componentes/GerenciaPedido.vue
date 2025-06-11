<template>
  <div>
    <h2 class="mb-4">🧾 Pedidos Recebidos</h2>

    <div v-for="pedido in pedidos" :key="pedido.id" class="accordion mb-3" :id="'accordion-' + pedido.id">
      <div class="accordion-item shadow-sm">
        <h2 class="accordion-header">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                  :data-bs-target="'#collapse-' + pedido.id">
            {{ pedido.nome }} • Pedido #{{ pedido.numeroPedido }} 
            <span class="badge ms-2" :class="badgeClass(pedido.status)">
              {{ pedido.status }}
            </span>
          </button>
        </h2>
        <div :id="'collapse-' + pedido.id" class="accordion-collapse collapse" :data-bs-parent="'#accordion-' + pedido.id">
          <div class="accordion-body">
            <p><strong>Telefone:</strong> {{ pedido.telefone }}</p>
            <p><strong>Endereço:</strong> {{ pedido.endereco }}</p>
            <p><strong>Observações:</strong> {{ pedido.observacoes }}</p>
            <p><strong>Data:</strong> {{ formatarData(pedido.dataCriacao) }}</p>

            <ul class="list-group mb-2">
              <li v-for="(item, idx) in pedido.itens" :key="idx" class="list-group-item">
                {{ item.nome }} - R$ {{ item.preco.toFixed(2) }}
              </li>
            </ul>

            <p><strong>Pagamento:</strong> 
              <span :class="pedido.pagamentoConfirmado ? 'text-success' : 'text-danger'">
                {{ pedido.pagamentoConfirmado ? "Confirmado" : "Pendente" }}
              </span>
            </p>

            <!-- Controles -->
            <div class="d-flex flex-wrap gap-2">
              <select v-model="pedido.status" class="form-select w-auto">
                <option>Aguardando</option>
                <option>Em Preparo</option>
                <option>Pronto</option>
                <option>Finalizado</option>
              </select>
              <button @click="atualizarStatus(pedido)" class="btn btn-success btn-sm">Atualizar Status</button>
              <button :disabled="pedido.pagamentoConfirmado" @click="confirmarPagamento(pedido)" class="btn btn-outline-primary btn-sm">
                Confirmar Pagamento
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, toRefs } from "vue";
import { getPedidos, atualizarPedido } from "../../services/pedidoService";

const emit = defineEmits(['atualizarDashboard']);

const pedidos = ref([]);

const formatarData = (timestamp) => {
  if (!timestamp || !timestamp.toDate) return "Data inválida";
  const data = timestamp.toDate();
  return data.toLocaleString("pt-BR"); // ou toLocaleDateString(), se quiser só a data
};

onMounted(() => {
  getPedidos((pedidosFirestore) => {
    pedidos.value = pedidosFirestore;
    emit('atualizarDashboard', pedidosFirestore); // envia dados ao AdminView
     console.log("Pedidos carregados:", pedidosFirestore);
  });

 
});

watch(pedidos, (newVal) => {
  emit('atualizarDashboard', newVal);
}, { deep: true });



const atualizarStatus = async (pedido) => {
  try {
    await atualizarPedido(pedido.id, { status: pedido.status });
    alert("Status atualizado!");
  } catch (e) {
    console.error(e);
  }
};

const confirmarPagamento = async (pedido) => {
  try {
    await atualizarPedido(pedido.id, { pagamentoConfirmado: true });
    alert("Pagamento confirmado!");
  } catch (e) {
    console.error(e);
  }
};

function badgeClass(status) {
  switch (status) {
    case "Em Preparo":
      return "bg-warning text-dark";
    case "Pronto":
      return "bg-info text-white";
    case "Finalizado":
      return "bg-success";
    default:
      return "bg-secondary";
  }
}

</script>
