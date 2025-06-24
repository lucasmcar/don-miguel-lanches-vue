<template>
  <div>
    <h2 class="mb-4">🧾 Pedidos Recebidos</h2>

    <!-- Controles de Filtro -->
    <div class="card mb-4">
      <div class="card-body">
        <h5>Filtros</h5>
        <div class="row g-2">
          <div class="col-md-3">
            <select v-model="filtroTipo" class="form-select">
              <option value="dia">Por Dia</option>
              <option value="mes">Por Mês</option>
            </select>
          </div>
          <div class="col-md-3">
            <input
              v-model="filtroData"
              :type="filtroTipo === 'dia' ? 'date' : 'month'"
              class="form-control"
            />
          </div>
          <div class="col-md-3">
            <button @click="limparFiltro" class="btn btn-secondary">Limpar Filtro</button>
          </div>
        </div>
        <div class="mt-3">
          <h6>
            Total das Vendas no Período: <strong>R$ {{ totalVendas.toFixed(2) }}</strong>
          </h6>
          <p>
            Total de Pedidos: <strong>{{ pedidos.length }}</strong>
          </p>
        </div>
      </div>
    </div>

    <!-- Lista de Pedidos -->
    <div
      v-for="pedido in pedidos"
      :key="pedido.id"
      class="accordion mb-3"
      :id="'accordion-' + pedido.id"
    >
      <div class="accordion-item shadow-sm">
        <h2 class="accordion-header">
          <button
            class="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            :data-bs-target="'#collapse-' + pedido.id"
          >
            {{ pedido.nome }} • Pedido #{{ pedido.numeroPedido }}
            <span class="badge ms-2" :class="badgeClass(pedido.status)">
              {{ pedido.status }}
            </span>
          </button>
        </h2>
        <div
          :id="'collapse-' + pedido.id"
          class="accordion-collapse collapse"
          :data-bs-parent="'#accordion-' + pedido.id"
        >
          <div class="accordion-body">
            <p><strong>Telefone:</strong> {{ pedido.telefone }}</p>
            <p><strong>Endereço:</strong> {{ pedido.endereco }}</p>
            <p><strong>Observações:</strong> {{ pedido.observacoes || "Nenhuma" }}</p>
            <p>
              <strong>Tipo de Entrega:</strong>
              {{ pedido.deliveryOption ? "Tele-entrega" : "Retirada" }}
            </p>
            <p v-if="pedido.deliveryOption">
              <strong>Frete:</strong> R$ {{ (pedido.deliveryFee || 0).toFixed(2) }}
            </p>
            <p><strong>Data:</strong> {{ formatarData(pedido.dataCriacao) }}</p>

            <ul class="list-group mb-2">
              <li v-for="(item, idx) in pedido.itens" :key="idx" class="list-group-item">
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
                </div>
              </li>
            </ul>

            <p><strong>Total:</strong> R$ {{ calcularTotalPedido(pedido).toFixed(2) }}</p>
            <p>
              <strong>Pagamento:</strong>
              <span :class="pedido.pagamentoConfirmado ? 'text-success' : 'text-danger'">
                {{ pedido.pagamentoConfirmado ? "Confirmado" : "Pendente" }}
              </span>
            </p>

            <!-- Controles -->
            <div class="d-flex flex-wrap gap-2">
              <select
                v-model="pedido.status"
                @change="atualizarStatus(pedido)"
                class="form-select w-auto"
              >
                <option>Aguardando</option>
                <option>Em Preparo</option>
                <option>Pronto</option>
                <option>Finalizado</option>
              </select>
              <button
                :disabled="pedido.pagamentoConfirmado"
                @click="confirmarPagamento(pedido)"
                class="btn btn-outline-primary btn-sm"
                :aria-label="'Confirmar pagamento do pedido ' + pedido.numeroPedido"
              >
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
import { ref, computed, onMounted, watch, onUnmounted } from "vue";
import { getPedidos, atualizarPedido } from "../../services/pedidoService";
import { DateTime } from "luxon";
import { db } from "../../firebase";
import { collection, query, where, onSnapshot, Timestamp } from "firebase/firestore";

const emit = defineEmits(["atualizarDashboard"]);
const pedidos = ref([]);
const filtroTipo = ref("dia"); // Tipo de filtro: 'dia' ou 'mes'
const filtroData = ref(""); // Data ou mês selecionado
let unsubscribe = null; // Para gerenciar o listener do Firestore

// Formatar data para exibição
const formatarData = (timestamp) => {
  if (!timestamp || !timestamp.toDate) return "Data inválida";
  const data = timestamp.toDate();
  return data.toLocaleString("pt-BR");
};

// Calcular total do pedido, incluindo adicionais e frete
const calcularTotalPedido = (pedido) => {
  const totalItens = pedido.itens.reduce((total, item) => {
    const precoItem = parseFloat(item.preco || 0);
    const precoAdicionais = item.adicionais
      ? item.adicionais.reduce(
          (acc, adicional) => acc + parseFloat(adicional.preco || 0),
          0
        )
      : 0;
    return total + precoItem + precoAdicionais;
  }, 0);
  const frete = pedido.deliveryOption ? parseFloat(pedido.deliveryFee || 0) : 0;
  return totalItens + frete;
};

// Calcular total das vendas no período filtrado
const totalVendas = computed(() => {
  return pedidos.value.reduce((total, pedido) => {
    return total + calcularTotalPedido(pedido);
  }, 0);
});

// Aplicar filtro no Firestore
const aplicarFiltro = () => {
  // Cancelar listener anterior, se existir
  if (unsubscribe) {
    unsubscribe();
  }

  const colRef = collection(db, "pedidos");
  let q = colRef;

  if (filtroData.value) {
    let start, end;
    if (filtroTipo.value === "dia") {
      const filtro = DateTime.fromISO(filtroData.value)
        .setZone("America/Sao_Paulo")
        .startOf("day");
      start = Timestamp.fromDate(filtro.toJSDate());
      end = Timestamp.fromDate(filtro.endOf("day").toJSDate());
    } else {
      const filtro = DateTime.fromISO(filtroData.value)
        .setZone("America/Sao_Paulo")
        .startOf("month");
      start = Timestamp.fromDate(filtro.toJSDate());
      end = Timestamp.fromDate(filtro.endOf("month").toJSDate());
    }

    q = query(colRef, where("dataCriacao", ">=", start), where("dataCriacao", "<=", end));
  }

  // Configurar novo listener
  unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      pedidos.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      emit("atualizarDashboard", pedidos.value);
    },
    (error) => {
      console.error("Erro ao carregar pedidos:", error);
      alert("Erro ao carregar pedidos.");
    }
  );
};

// Limpar os filtros
const limparFiltro = () => {
  filtroTipo.value = "dia";
  filtroData.value = "";
  aplicarFiltro();
};

// Inicializar e atualizar filtros
onMounted(() => {
  filtroData.value = DateTime.now().setZone("America/Sao_Paulo").toISODate();
  aplicarFiltro();
});

// Atualizar filtro quando tipo ou data mudarem
watch([filtroTipo, filtroData], () => {
  aplicarFiltro();
});

// Limpar listener ao desmontar o componente
onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});

const atualizarStatus = async (pedido) => {
  try {
    await atualizarPedido(pedido.id, { status: pedido.status });
    alert("Status atualizado!");
  } catch (e) {
    console.error(e);
    alert("Erro ao atualizar status.");
  }
};

const confirmarPagamento = async (pedido) => {
  try {
    await atualizarPedido(pedido.id, { pagamentoConfirmado: true });
    alert("Pagamento confirmado!");
  } catch (e) {
    console.error(e);
    alert("Erro ao confirmar pagamento.");
  }
};

const badgeClass = (status) => {
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
};
</script>
