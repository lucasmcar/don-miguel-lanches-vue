<template>
  <!-- Adicione o botão de consulta do pedido -->

  <div class="container mt-4">
    
    <h2>Faça seu Pedido</h2>
    <form @submit.prevent="enviarPedido" class="mb-3">
      <div class="mb-2">
        <label>Nome:</label>
        <input v-model="nome" type="text" class="form-control" required />
      </div>
      <div class="mb-2">
        <label>Telefone:</label>
        <input v-model="telefone" type="text" class="form-control" required />
      </div>
      <div class="mb-2">
        <label>Endereço:</label>
        <input v-model="endereco" type="text" class="form-control" required />
      </div>
    </form>

    <h3>Cardápio</h3>
    <CardapioCliente @add-lanche="adicionarLanche" />

    <h4 class="mt-3">Itens Selecionados:</h4>
    <ul class="list-group mb-2">
      <li v-for="(item, index) in lanchesSelecionados" :key="index"
        class="list-group-item d-flex justify-content-between">
        {{ item.nome }} x{{ item.quantidade }} - R$ {{ item.subtotal }}
        <div>
          <button @click="removerLanche(item)" class="btn btn-danger btn-sm">-</button>
        </div>
      </li>
    </ul>

    <div v-if="total > 0" class="mb-3">
      <h4>Total: R$ {{ total }}</h4>
      <p>Chave Pix: <strong>{{ chavePix }}</strong></p>
      <button @click="copiarChavePix" class="btn btn-outline-secondary btn-sm mb-2">Copiar Chave Pix</button>
      <p>Ou escaneie o QR Code abaixo para pagar:</p>
      <img :src="qrCodeUrl" alt="QR Code Pix" class="img-fluid" />
    </div>

    <button class="btn btn-primary" @click="enviarPedido"
      :disabled="!lanchesSelecionados.length || !nome || !telefone || !endereco">
      Enviar Pedido
    </button>

    <div v-if="statusPedido" class="mt-3">
      <h5>Status do Pedido:</h5>
      <span :class="['badge', badgeClass(statusPedido)]">{{ statusPedido }}</span>
    </div>

  </div>

</template>


<script setup>
import { ref, computed, watch } from "vue";
import { db } from "../../firebase";
import { collection, addDoc, doc, onSnapshot, Timestamp } from "firebase/firestore";
import CardapioCliente from "./CardapioCliente.vue";

const nome = ref("");
const telefone = ref("");
const endereco = ref("");
const lanchesSelecionados = ref([]);
const statusPedido = ref("");
const pedidoId = ref(null);

const chavePix = "chavepix123456"; // sua chave real!

const adicionarLanche = (lanche) => {
  const index = lanchesSelecionados.value.findIndex((item) => item.nome === lanche.nome);
  if (index !== -1) {
    lanchesSelecionados.value[index].quantidade++;
    lanchesSelecionados.value[index].subtotal =
      lanchesSelecionados.value[index].quantidade * lanche.preco;
  } else {
    lanchesSelecionados.value.push({
      nome: lanche.nome,
      preco: lanche.preco,
      quantidade: 1,
      subtotal: lanche.preco,
    });
  }
};

const removerLanche = (lanche) => {
  const index = lanchesSelecionados.value.findIndex((item) => item.nome === lanche.nome);
  if (index !== -1) {
    lanchesSelecionados.value[index].quantidade--;
    if (lanchesSelecionados.value[index].quantidade <= 0) {
      lanchesSelecionados.value.splice(index, 1);
    } else {
      lanchesSelecionados.value[index].subtotal =
        lanchesSelecionados.value[index].quantidade * lanche.preco;
    }
  }
};

const total = computed(() => {
  return lanchesSelecionados.value.reduce((acc, item) => acc + item.subtotal, 0);
});

const qrCodeUrl = computed(() => {
  const pixPayload = `00020126360014BR.GOV.BCB.PIX0114${chavePix}520400005303986540${total.value.toFixed(2)}5802BR5920Lancheria Teste6009SAO PAULO62070503***6304`;
  return `https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=${encodeURIComponent(pixPayload)}`;
});

const enviarPedido = async () => {
  if (!nome.value || !telefone.value || !endereco.value || !lanchesSelecionados.value.length) {
    alert("Preencha todos os campos e adicione ao menos um lanche.");
    return;
  }

  const pedido = {
    nome: nome.value,
    telefone: telefone.value,
    endereco: endereco.value,
    lanches: lanchesSelecionados.value,
    total: total.value,
    status: "Pendente",
    chavePix,
    dataCriacao: Timestamp.now(),
  };

  const docRef = await addDoc(collection(db, "pedidos"), pedido);
  pedidoId.value = docRef.id;
  statusPedido.value = "Pendente";

  // Monitorar o status do pedido em tempo real
  const pedidoDoc = doc(db, "pedidos", docRef.id);
  onSnapshot(pedidoDoc, (snapshot) => {
    if (snapshot.exists()) {
      statusPedido.value = snapshot.data().status;
    }
  });

  alert("Pedido enviado com sucesso! Agora acompanhe o status aqui.");
  // Limpar formulário
  nome.value = "";
  telefone.value = "";
  endereco.value = "";
  lanchesSelecionados.value = [];
};

const copiarChavePix = async () => {
  try {
    await navigator.clipboard.writeText(chavePix);
    alert("Chave Pix copiada para a área de transferência!");
  } catch (error) {
    alert("Erro ao copiar chave Pix.");
  }
};

const badgeClass = (status) => {
  if (status === "Pendente") return "bg-secondary";
  if (status === "Atendendo") return "bg-warning text-dark";
  if (status === "Atendido") return "bg-success";
  return "bg-light";
};
</script>

<style scoped>
.img-fluid {
  max-width: 200px;
  margin-top: 10px;
}
</style>
