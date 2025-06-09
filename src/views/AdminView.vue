<template>
  <div class="container py-4">
    <h1 class="text-center mb-4 text-danger">🍔 Painel Administrativo - Dom Ramon Lanches</h1>
    <div class="row g-4">
      <div class="col-md-6">
        <GerenciaCardapio />
      </div>
      <div class="col-md-6">
        <GerenciaPedido />
      </div>
    </div>
  </div>
</template>

<script setup>
import GerenciaCardapio from "../componentes/GerenciaCardapio.vue";
import GerenciaPedido from "../componentes/GerenciaPedido.vue";
</script>
