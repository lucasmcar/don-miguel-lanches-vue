<template>
  <div>
    <button class="btn btn-warning" @click="abrirModal">
      Acompanhar Pedido
    </button>

    <!-- Modal -->
    <div v-if="mostrarModal" class="modal fade show d-block bg-dark bg-opacity-50">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Consultar Pedido</h5>
            <button type="button" class="btn-close" @click="fecharModal"></button>
          </div>

          <div class="modal-body">
            <div v-if="!pedido">
              <p>Digite o número do seu pedido para acompanhar o status:</p>
              <input
                v-model="numeroPedido"
                class="form-control"
                placeholder="Número do Pedido"
              />
            </div>

            <div v-else>
              <h5>Status: {{ pedido.status }}</h5>
              <p>Pagamento: {{ pedido.pagamentoConfirmado ? "Confirmado" : "Pendente" }}</p>
              <ul>
                <li v-for="(item, idx) in pedido.itens" :key="idx">
                  {{ item.nome }} - R$ {{ item.preco.toFixed(2) }}
                </li>
              </ul>
              <p>Data: {{ formatarData(pedido.dataCriacao) }}</p>
            </div>
          </div>

          <div class="modal-footer">
            <button
              v-if="!pedido"
              class="btn btn-success"
              @click="consultarPedido"
            >
              Consultar
            </button>

            <button
              v-else
              class="btn btn-secondary"
              @click="pedido = null"
            >
              Nova Consulta
            </button>

            <button class="btn btn-danger" @click="fecharModal">
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { buscarPedidoPorNumero } from "../../services/pedidoService";

const mostrarModal = ref(false);
const numeroPedido = ref("");
const pedido = ref(null);

const formatarData = (timestamp) => {
  if (!timestamp || !timestamp.toDate) return "Data inválida";
  const data = timestamp.toDate();
  return data.toLocaleString("pt-BR"); // ou toLocaleDateString(), se quiser só a data
};

const abrirModal = () => {
  mostrarModal.value = true;
  pedido.value = null;
  numeroPedido.value = "";
};

const fecharModal = () => {
  mostrarModal.value = false;
  pedido.value = null;
  numeroPedido.value = "";
};

const consultarPedido = async () => {
  try {
    const resultado = await buscarPedidoPorNumero(Number(numeroPedido.value));
    pedido.value = resultado;
  } catch (e) {
    alert("Pedido não encontrado!");
  }
};
</script>

<style scoped>
.modal-dialog {
  max-width: 400px;
}
</style>
