<template>
  <div class="container py-4">
    <h2 class="mb-4">📝 Pedidos Recebidos</h2>

    <div
      v-for="pedido in pedidos"
      :key="pedido.id"
      class="card shadow p-3 mb-3"
    >
      <h5>{{ pedido.nome }} - {{ pedido.numeroPedido}}</h5>
      <p>Telefone: {{ pedido.telefone }}</p>
      <p>Endereço: {{ pedido.endereco }}</p>
      <p>Observações: {{ pedido.observacoes }}</p>
      <ul>
        <li v-for="(item, idx) in pedido.itens" :key="idx">
          {{ item.nome }} - R$ {{ item.preco.toFixed(2) }}
        </li>
      </ul>

      <p><strong>Status:</strong> {{ pedido.status }}</p>
      <p><strong>Pagamento:</strong> {{ pedido.pagamentoConfirmado ? "Confirmado" : "Pendente" }}</p>

      <!-- Controle de status -->
      <div class="d-flex gap-2 my-2">
        <select v-model="pedido.status" class="form-select w-auto">
          <option>Aguardando</option>
          <option>Em Preparo</option>
          <option>Pronto</option>
          <option>Finalizado</option>
        </select>
        <button @click="atualizarStatus(pedido)" class="btn btn-success btn-sm">
          Atualizar Status
        </button>
      </div>

      <!-- Controle de pagamento -->
      <button
        @click="confirmarPagamento(pedido)"
        class="btn btn-outline-primary btn-sm"
      >
        Confirmar Pagamento
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getPedidos, atualizarPedido } from "../../services/pedidoService";

const pedidos = ref([]);

onMounted(() => {
  getPedidos((pedidosFirestore) => {
    pedidos.value = pedidosFirestore;
  });
});

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
</script>
