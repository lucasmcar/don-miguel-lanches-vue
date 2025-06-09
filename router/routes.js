import { createRouter, createWebHistory } from 'vue-router';

import ClienteView from '../src/views/ClienteView.vue';
import AdminView from '../src/views/AdminView.vue';

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/faca-seu-pedido',
      name: 'Cliente',
      component: ClienteView
    },
    {
      path: '/admin',
      name: 'Admin',
      component: AdminView
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/faca-seu-pedido' // Qualquer rota desconhecida vai para a tela do cliente
    }
  ]
});
