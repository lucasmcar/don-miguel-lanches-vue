import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router';

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
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isElectron = navigator.userAgent.toLowerCase().includes('electron')
  const isAdminPath = to.path.startsWith('/admin') || to.path.startsWith('/dml')
  const auth = getAuth()

  if (isElectron && !isAdminPath) {
    // bloqueia acesso a qualquer rota que não seja admin ou dml
    return next('/dml/login')
  }

  const requiresAuth = to.meta.requiresAuth // exemplo: meta flag nas rotas protegidas

  if (requiresAuth) {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      if (user) {
        next()
      } else {
        next('/dml/login')
      }
    })
  } else {
    next()
  }
})

export default router;