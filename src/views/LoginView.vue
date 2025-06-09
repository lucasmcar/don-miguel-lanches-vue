<template>
  <div class="login-view">
    <h1>Login</h1>
    <form @submit.prevent="login">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="senha" type="password" placeholder="Senha" required />
      <button type="submit">Entrar</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { useRouter } from 'vue-router';

const email = ref('');
const senha = ref('');
const router = useRouter();

const login = async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, senha.value);
    alert('Login realizado com sucesso!');
    router.push('/admin');
  } catch (error) {
    console.error(error);
    alert('Erro ao fazer login: ' + error.message);
  }
};
</script>

<style scoped>
.login-view {
  max-width: 400px;
  margin: auto;
  padding: 1rem;
}
input, button {
  display: block;
  margin-bottom: 0.5rem;
  width: 100%;
}
</style>
