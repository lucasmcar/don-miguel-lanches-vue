<template>
  <div class="card shadow-sm">
    <div class="card-header bg-warning text-white">
      <h4 class="mb-0">Gerenciar Cardápio</h4>
    </div>
    <div class="card-body">
      <form @submit.prevent="salvarLanche" class="mb-4">
        <div class="row g-2">
          <div class="col-md-4">
            <input
              v-model="form.nome"
              class="form-control"
              placeholder="Nome do lanche"
              required
            />
          </div>
          <div class="col-md-4">
            <input
              v-model.number="form.preco"
              type="number"
              step="0.01"
              class="form-control"
              placeholder="Preço"
              required
            />
          </div>
          <div class="col-md-4">
            <textarea
              v-model="form.descricao"
              class="form-control"
              placeholder="Descrição"
            ></textarea>
          </div>
        </div>
        <div class="row g-2 mt-2">
          <div class="col-md-6">
            <label class="form-label">Imagem do Lanche</label>
            <input
              type="file"
              accept="image/*"
              @change="handleImagem"
              class="form-control"
            />
          </div>
          <div v-if="form.imagem" class="col-md-6">
            <img
              :src="form.imagem"
              alt="Imagem do lanche"
              class="img-thumbnail"
              style="max-height: 100px"
            />
            <button
              type="button"
              @click="removerImagem"
              class="btn btn-sm btn-danger mt-2"
            >
              Remover Imagem
            </button>
          </div>
        </div>
        <div class="mt-3 d-flex gap-2">
          <button class="btn btn-success" type="submit">
            {{ form.id ? "Atualizar" : "Adicionar" }}
          </button>
          <button
            v-if="form.id"
            type="button"
            @click="limparFormulario"
            class="btn btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>

      <ul class="list-group">
        <li
          v-for="lanche in lanches"
          :key="lanche.id"
          class="list-group-item d-flex justify-content-between align-items-start flex-column flex-md-row"
        >
          <div class="d-flex align-items-start">
            <img
              v-if="lanche.imagem"
              :src="lanche.imagem"
              alt="Imagem do lanche"
              class="img-thumbnail me-3"
              style="max-width: 80px"
            />
            <div>
              <h6 class="fw-bold mb-1">
                {{ lanche.nome }}
                <span class="text-success">R$ {{ lanche.preco.toFixed(2) }}</span>
              </h6>
              <p class="text-muted small">{{ lanche.descricao }}</p>
            </div>
          </div>
          <div class="btn-group mt-2 mt-md-0">
            <button @click="editarLanche(lanche)" class="btn btn-sm btn-primary">
              Editar
            </button>
            <button
              @click="removerLanche(lanche.id, lanche.imagem)"
              class="btn btn-sm btn-danger"
            >
              Remover
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { db, storage } from "../../firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

const lanches = ref([]);
const form = ref({
  id: null,
  nome: "",
  preco: 0,
  descricao: "",
  imagem: null,
  imagemFile: null,
});

onMounted(() => {
  const colRef = collection(db, "cardapio");
  onSnapshot(colRef, (snapshot) => {
    lanches.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  });
});

const handleImagem = (event) => {
  const file = event.target.files[0];
  if (file) {
    form.value.imagemFile = file;
    form.value.imagem = URL.createObjectURL(file); // Visualização temporária
  }
};

const removerImagem = () => {
  form.value.imagem = null;
  form.value.imagemFile = null;
};

const salvarLanche = async () => {
  const { id, nome, preco, descricao, imagemFile } = form.value;
  let imagemUrl = form.value.imagem;

  try {
    // Fazer upload da imagem, se houver
    if (imagemFile) {
      const imagemRef = storageRef(
        storage,
        `lanches/${id || Date.now()}_${imagemFile.name}`
      );
      const snapshot = await uploadBytes(imagemRef, imagemFile);
      imagemUrl = await getDownloadURL(snapshot.ref);
    } else if (!imagemUrl) {
      imagemUrl = null; // Remove a imagem se não houver nova
    }

    // Salvar ou atualizar no Firestore
    const lancheData = { nome, preco, descricao, imagem: imagemUrl };
    if (id) {
      await updateDoc(doc(db, "cardapio", id), lancheData);
    } else {
      await addDoc(collection(db, "cardapio"), lancheData);
    }

    limparFormulario();
    alert("Lanche salvo com sucesso!");
  } catch (error) {
    console.error("Erro ao salvar lanche:", error);
    alert("Erro ao salvar lanche.");
  }
};

const editarLanche = (lanche) => {
  form.value = { ...lanche, imagemFile: null };
};

const removerLanche = async (id, imagem) => {
  try {
    // Excluir a imagem do Storage, se existir
    if (imagem) {
      const imagemRef = storageRef(storage, imagem);
      await deleteObject(imagemRef).catch((error) => {
        if (error.code !== "storage/object-not-found") throw error;
      });
    }
    // Excluir o documento do Firestore
    await deleteDoc(doc(db, "cardapio", id));
    alert("Lanche removido com sucesso!");
  } catch (error) {
    console.error("Erro ao remover lanche:", error);
    alert("Erro ao remover lanche.");
  }
};

const limparFormulario = () => {
  form.value = {
    id: null,
    nome: "",
    preco: 0,
    descricao: "",
    imagem: null,
    imagemFile: null,
  };
};
</script>

<style scoped>
.img-thumbnail {
  object-fit: cover;
}
</style>
