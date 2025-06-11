import { createRouter, createWebHistory } from 'vue-router';

import ClienteView from '../src/views/ClienteView.vue';
import AdminView from '../src/views/AdminView.vue';
import LoginView from '../src/views/LoginView.vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const routes = [
    {
      path: '/faca-seu-pedido',
      name: 'Cliente',
      component: ClienteView
    },
    {
      path: '/admin',
      name: 'Admin',
      component: AdminView,
      meta: { requiresAuth: true }
    },
    { path: '/dml/login', name: 'Login', component: LoginView },

    {
      path: '/:pathMatch(.*)*',
      redirect: '/faca-seu-pedido' // Qualquer rota desconhecida vai para a tela do cliente
    }
  ]

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const auth = getAuth();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth) {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        next(); // usuário logado
      } else {
        next('/login'); // redireciona
      }
    });
  } else {
    next();
  }
});

export default router;