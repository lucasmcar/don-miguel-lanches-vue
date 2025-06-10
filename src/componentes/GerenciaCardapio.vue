<template>
  <div class="card shadow-sm">
    <div class="card-header bg-warning text-white">
      <h4 class="mb-0">📋 Gerenciar Cardápio</h4>
    </div>
    <div class="card-body">
      <form @submit.prevent="salvarLanche" class="mb-4">
        <div class="row g-2">
          <div class="col-md-4">
            <input v-model="form.nome" class="form-control" placeholder="Nome do lanche" required />
          </div>
          <div class="col-md-4">
            <input v-model.number="form.preco" type="number" step="0.01" class="form-control" placeholder="Preço" required />
          </div>
          <div class="col-md-4">
            <textarea v-model="form.descricao" class="form-control" placeholder="Descrição"></textarea>
          </div>
        </div>
        <div class="mt-3 d-flex gap-2">
          <button class="btn btn-success" type="submit">
            {{ form.id ? "Atualizar" : "Adicionar" }}
          </button>
          <button v-if="form.id" type="button" @click="limparFormulario" class="btn btn-secondary">
            Cancelar
          </button>
        </div>
      </form>

      <ul class="list-group">
        <li v-for="lanche in lanches" :key="lanche.id"
            class="list-group-item d-flex justify-content-between align-items-start flex-column flex-md-row">
          <div class="me-md-3">
            <h6 class="fw-bold mb-1">{{ lanche.nome }} <span class="text-success">R$ {{ lanche.preco.toFixed(2) }}</span></h6>
            <p class="text-muted small">{{ lanche.descricao }}</p>
          </div>
          <div class="btn-group mt-2 mt-md-0">
            <button @click="editarLanche(lanche)" class="btn btn-sm btn-primary">Editar</button>
            <button @click="removerLanche(lanche.id)" class="btn btn-sm btn-danger">Remover</button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { db } from "../../firebase";
import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
} from "firebase/firestore";

const lanches = ref([]);
const form = ref({ id: null, nome: "", preco: 0, descricao: "" });

onMounted(() => {
    const colRef = collection(db, "cardapio");
    onSnapshot(colRef, (snapshot) => {
        lanches.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    });
});

const salvarLanche = async () => {
    const { id, nome, preco, descricao } = form.value;
    if (id) {
        await updateDoc(doc(db, "cardapio", id), { nome, preco, descricao });
    } else {
        await addDoc(collection(db, "cardapio"), { nome, preco, descricao });
    }
    limparFormulario();
};

const editarLanche = (lanche) => {
    form.value = { ...lanche };
};

const removerLanche = async (id) => {
    await deleteDoc(doc(db, "cardapio", id));
};

const limparFormulario = () => {
    form.value = { id: null, nome: "", preco: 0, descricao: "" };
};
</script>
