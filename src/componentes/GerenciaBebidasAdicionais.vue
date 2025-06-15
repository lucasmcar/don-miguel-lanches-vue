<template>
  <div class="card shadow-sm">
    <div class="card-header bg-warning text-white">
      <h4 class="mb-0">📋 Gerenciar Bebidas e Adicionais</h4>
    </div>
    <div class="card-body">
      <!-- Abas para Bebidas e Adicionais -->
      <ul class="nav nav-tabs mb-4">
        <li class="nav-item">
          <button
            class="nav-link"
            :class="{ active: abaAtiva === 'bebidas' }"
            @click="abaAtiva = 'bebidas'"
          >
            <i class="bi bi-cup-straw me-1"></i> Bebidas
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link"
            :class="{ active: abaAtiva === 'adicionais' }"
            @click="abaAtiva = 'adicionais'"
          >
            <i class="bi bi-plus-circle me-1"></i> Adicionais
          </button>
        </li>
      </ul>

      <!-- Formulário e Lista para Bebidas -->
      <div v-if="abaAtiva === 'bebidas'">
        <form @submit.prevent="salvarBebida" class="mb-4">
          <div class="row g-2">
            <div class="col-md-3">
              <input
                v-model="formBebida.nome"
                class="form-control"
                placeholder="Nome da bebida"
                required
              />
            </div>
            <div class="col-md-3">
              <input
                v-model.number="formBebida.preco"
                type="number"
                step="0.01"
                class="form-control"
                placeholder="Preço"
                required
              />
            </div>
            <div class="col-md-3">
              <textarea
                v-model="formBebida.descricao"
                class="form-control"
                placeholder="Descrição"
              ></textarea>
            </div>
            <div class="col-md-3">
              <input
                v-model="formBebida.imagem"
                class="form-control"
                placeholder="URL da imagem (opcional)"
              />
            </div>
          </div>
          <div class="mt-3 d-flex gap-2">
            <button class="btn btn-success" type="submit">
              {{ formBebida.id ? "Atualizar" : "Adicionar" }}
            </button>
            <button
              v-if="formBebida.id"
              type="button"
              @click="limparFormularioBebida"
              class="btn btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </form>

        <ul class="list-group">
          <li
            v-for="bebida in bebidas"
            :key="bebida.id"
            class="list-group-item d-flex justify-content-between align-items-start flex-column flex-md-row"
          >
            <div class="me-md-3">
              <h6 class="fw-bold mb-1">
                {{ bebida.nome }}
                <span class="text-success">R$ {{ bebida.preco.toFixed(2) }}</span>
              </h6>
              <p class="text-muted small mb-1">{{ bebida.descricao }}</p>
              <p v-if="bebida.imagem" class="text-muted small">
                <a :href="bebida.imagem" target="_blank">Ver imagem</a>
              </p>
            </div>
            <div class="btn-group mt-2 mt-md-0">
              <button
                @click="editarBebida(bebida)"
                class="btn btn-sm btn-primary"
                :aria-label="'Editar ' + bebida.nome"
              >
                Editar
              </button>
              <button
                @click="removerBebida(bebida.id)"
                class="btn btn-sm btn-danger"
                :aria-label="'Remover ' + bebida.nome"
              >
                Remover
              </button>
            </div>
          </li>
          <li v-if="!bebidas.length" class="list-group-item text-muted">
            Nenhuma bebida cadastrada.
          </li>
        </ul>
      </div>

      <!-- Formulário e Lista para Adicionais -->
      <div v-if="abaAtiva === 'adicionais'">
        <form @submit.prevent="salvarAdicional" class="mb-4">
          <div class="row g-2">
            <div class="col-md-3">
              <input
                v-model="formAdicional.nome"
                class="form-control"
                placeholder="Nome do adicional"
                required
              />
            </div>
            <div class="col-md-3">
              <input
                v-model.number="formAdicional.preco"
                type="number"
                step="0.01"
                class="form-control"
                placeholder="Preço"
                required
              />
            </div>
            <div class="col-md-3">
              <textarea
                v-model="formAdicional.descricao"
                class="form-control"
                placeholder="Descrição"
              ></textarea>
            </div>
            <div class="col-md-3">
              <input
                v-model="formAdicional.imagem"
                class="form-control"
                placeholder="URL da imagem (opcional)"
              />
            </div>
          </div>
          <div class="mt-3 d-flex gap-2">
            <button class="btn btn-success" type="submit">
              {{ formAdicional.id ? "Atualizar" : "Adicionar" }}
            </button>
            <button
              v-if="formAdicional.id"
              type="button"
              @click="limparFormularioAdicional"
              class="btn btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </form>

        <ul class="list-group">
          <li
            v-for="adicional in adicionais"
            :key="adicional.id"
            class="list-group-item d-flex justify-content-between align-items-start flex-column flex-md-row"
          >
            <div class="me-md-3">
              <h6 class="fw-bold mb-1">
                {{ adicional.nome }}
                <span class="text-success">R$ {{ adicional.preco.toFixed(2) }}</span>
              </h6>
              <p class="text-muted small mb-1">{{ adicional.descricao }}</p>
              <p v-if="adicional.imagem" class="text-muted small">
                <a :href="adicional.imagem" target="_blank">Ver imagem</a>
              </p>
            </div>
            <div class="btn-group mt-2 mt-md-0">
              <button
                @click="editarAdicional(adicional)"
                class="btn btn-sm btn-primary"
                :aria-label="'Editar ' + adicional.nome"
              >
                Editar
              </button>
              <button
                @click="removerAdicional(adicional.id)"
                class="btn btn-sm btn-danger"
                :aria-label="'Remover ' + adicional.nome"
              >
                Remover
              </button>
            </div>
          </li>
          <li v-if="!adicionais.length" class="list-group-item text-muted">
            Nenhum adicional cadastrado.
          </li>
        </ul>
      </div>
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
import {
  adicionarBebida,
  getBebidas,
  adicionarAdicional,
  getAdicionais,
} from "../../services/cardapioService";

const abaAtiva = ref("bebidas");
const bebidas = ref([]);
const adicionais = ref([]);
const formBebida = ref({ id: null, nome: "", preco: 0, descricao: "", imagem: "" });
const formAdicional = ref({ id: null, nome: "", preco: 0, descricao: "", imagem: "" });

// Carregar bebidas em tempo real
onMounted(() => {
  const bebidasRef = collection(db, "bebidas");
  onSnapshot(bebidasRef, (snapshot) => {
    bebidas.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  });

  const adicionaisRef = collection(db, "adicionais");
  onSnapshot(adicionaisRef, (snapshot) => {
    adicionais.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  });
});

// Funções para bebidas
const salvarBebida = async () => {
  const { id, nome, preco, descricao, imagem } = formBebida.value;
  if (id) {
    await updateDoc(doc(db, "bebidas", id), { nome, preco, descricao, imagem });
  } else {
    await adicionarBebida({ nome, preco, descricao, imagem });
  }
  limparFormularioBebida();
};

const editarBebida = (bebida) => {
  formBebida.value = { ...bebida };
};

const removerBebida = async (id) => {
  await deleteDoc(doc(db, "bebidas", id));
};

const limparFormularioBebida = () => {
  formBebida.value = { id: null, nome: "", preco: 0, descricao: "", imagem: "" };
};

// Funções para adicionais
const salvarAdicional = async () => {
  const { id, nome, preco, descricao, imagem } = formAdicional.value;
  if (id) {
    await updateDoc(doc(db, "adicionais", id), { nome, preco, descricao, imagem });
  } else {
    await adicionarAdicional({ nome, preco, descricao, imagem });
  }
  limparFormularioAdicional();
};

const editarAdicional = (adicional) => {
  formAdicional.value = { ...adicional };
};

const removerAdicional = async (id) => {
  await deleteDoc(doc(db, "adicionais", id));
};

const limparFormularioAdicional = () => {
  formAdicional.value = { id: null, nome: "", preco: 0, descricao: "", imagem: "" };
};
</script>

<style scoped>
.card {
  border-radius: 0.75rem;
}

.card-header {
  background-color: #ffc107;
}

.nav-tabs .nav-link {
  color: #dc3545;
  font-weight: 500;
}

.nav-tabs .nav-link.active {
  background-color: #dc3545;
  color: white;
  border-color: #dc3545;
}

.nav-tabs .nav-link:hover {
  background-color: #f8f9fa;
  border-color: #dc3545;
}

.btn-primary {
  background-color: #dc3545;
  border-color: #dc3545;
}

.btn-primary:hover {
  background-color: #c82333;
  border-color: #c82333;
}

.btn-success {
  background-color: #28a745;
  border-color: #28a745;
}

.btn-success:hover {
  background-color: #218838;
  border-color: #218838;
}

.list-group-item {
  transition: background-color 0.2s;
}

.list-group-item:hover {
  background-color: #f8f9fa;
}

.form-control:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}
</style>
