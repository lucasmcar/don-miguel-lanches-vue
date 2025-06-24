import { createRouter, createWebHashHistory } from 'vue-router';
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
  {
    path: '/admin/dml/login', // Corrigido para corresponder à URL desejada
    name: 'Login',
    component: LoginView
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/faca-seu-pedido' // Redireciona rotas desconhecidas
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isElectron = navigator.userAgent.toLowerCase().includes('electron');
  const isAdminPath = to.path.startsWith('/admin') || to.path === '/admin/dml/login'; // Inclui explicitamente a rota de login
  const auth = getAuth();

  // Em ambiente Electron, bloqueia rotas não-administrativas
  if (isElectron && !isAdminPath) {
    return next('/admin/dml/login');
  }

  const requiresAuth = to.meta.requiresAuth;

  if (requiresAuth) {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        next();
      } else {
        next('/admin/dml/login');
      }
    });
  } else {
    next();
  }
});

export default router;