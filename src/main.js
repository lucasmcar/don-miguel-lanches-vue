import { createApp } from 'vue';
import App from './App.vue';
import router from '../router/routes'
import Vue from "vue";
import VueMeta from "vue-meta";

Vue.use(VueMeta);

const app = createApp(App);

app.use(router);

app.mount('#app');