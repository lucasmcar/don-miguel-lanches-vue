<template>
  <div class="container py-4">
    <button class="btn btn-outline-danger btn-sm float-end" @click="logout">Sair</button>
    <h1 class="text-center mb-4 text-danger fw-bold">
      Painel Administrativo - Don Miguel Lanches
    </h1>

    <!-- DASHBOARD -->
    <div class="row mb-4 text-center">
      <div class="col-md-3">
        <div class="card border-primary shadow-sm">
          <div class="card-body">
            <h6 class="text-muted">Total de Pedidos</h6>
            <h3 class="text-primary">{{ totalPedidos }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-warning shadow-sm">
          <div class="card-body">
            <h6 class="text-muted">Em Andamento</h6>
            <h3 class="text-warning">{{ pedidosEmAndamento }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-success shadow-sm">
          <div class="card-body">
            <h6 class="text-muted">Finalizados</h6>
            <h3 class="text-success">{{ pedidosFinalizados }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-dark shadow-sm">
          <div class="card-body">
            <h6 class="text-muted">Total em Vendas</h6>
            <h3 class="text-dark">R$ {{ totalVendas.toFixed(2) }}</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- ABAS -->
    <ul class="nav nav-tabs mb-4" role="tablist">
      <li class="nav-item" role="presentation">
        <button
          class="nav-link active"
          data-bs-toggle="tab"
          data-bs-target="#cardapio"
          type="button"
          role="tab"
        >
          Cardápio
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          class="nav-link"
          data-bs-toggle="tab"
          data-bs-target="#bebidas-adicionais"
          type="button"
          role="tab"
        >
          Bebidas e Adicionais
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          class="nav-link"
          data-bs-toggle="tab"
          data-bs-target="#pedidos"
          type="button"
          role="tab"
        >
          Pedidos
        </button>
      </li>
    </ul>

    <div class="tab-content">
      <div class="tab-pane fade show active" id="cardapio" role="tabpanel">
        <GerenciaCardapio />
      </div>
      <div class="tab-pane fade" id="bebidas-adicionais" role="tabpanel">
        <GerenciaBebidasAdicionais />
      </div>
      <div class="tab-pane fade" id="pedidos" role="tabpanel">
        <GerenciaPedido @atualizarDashboard="atualizarDashboard" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import GerenciaCardapio from "../componentes/GerenciaCardapio.vue";
import GerenciaBebidasAdicionais from "../componentes/GerenciaBebidasAdicionais.vue";
import GerenciaPedido from "../componentes/GerenciaPedido.vue";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "vue-router";

// Indicadores
const totalPedidos = ref(0);
const pedidosEmAndamento = ref(0);
const pedidosFinalizados = ref(0);
const totalVendas = ref(0);

function atualizarDashboard(pedidos) {
  totalPedidos.value = pedidos.length;
  pedidosEmAndamento.value = pedidos.filter((p) => p.status !== "Finalizado").length;
  pedidosFinalizados.value = pedidos.filter((p) => p.status === "Finalizado").length;
  totalVendas.value = pedidos.reduce((soma, pedido) => {
    if (!pedido.pagamentoConfirmado) return soma;
    return (
      soma +
      pedido.itens.reduce((acc, item) => {
        const precoItem = parseFloat(item.preco || 0);
        const precoAdicionais = item.adicionais
          ? item.adicionais.reduce(
              (a, adicional) => a + parseFloat(adicional.preco || 0),
              0
            )
          : 0;
        return acc + precoItem + precoAdicionais;
      }, 0)
    );
  }, 0);
}
const router = useRouter();

function logout() {
  const auth = getAuth();
  signOut(auth).then(() => {
    router.push("/login");
  });
}
</script>
