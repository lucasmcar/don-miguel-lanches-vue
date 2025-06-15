<template>
  <div class="d-flex justify-content-center align-items-center vh-100 bg-light">
    <div class="card p-4 shadow" style="min-width: 300px">
      <h3 class="text-center mb-3">Acessar Painel</h3>
      <button class="btn btn-danger w-100" @click="loginGoogle">Entrar com Google</button>
    </div>
  </div>
</template>

<script setup>
import { auth, provider } from "../../firebase";
import { signInWithPopup } from "firebase/auth";
import { useRouter } from "vue-router";

const router = useRouter();
const errorMessage = ref(""); // Declarado como ref

// Use electronAPI.openExternal para abrir o link
/*const openLoginPage = () => {
  window.electronAPI.openExternal(
    "https://donmiguelanches.netlify.app/#/dml/login?electron=1"
  );
};*/

async function loginGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    if (result.user) {
      router.push("/admin"); // redireciona após login
    }
  } catch (error) {
    console.error("Erro ao logar:", error);
    alert("Erro ao logar com o Google.");
  }
}
</script>
