// frontend/src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'

// Import your pages
import Dashboard from "../pages/Dashboard.vue";
import Customers from '../pages/Customers.vue'
import Products from "../pages/Products.vue";
import Orders from "../pages/Orders.vue";

const routes = [
  { path: '/', redirect: '/dashboard' }, // default redirect
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/customers', name: 'Customers', component: Customers },
  { path: '/products', name: 'Products', component: Products },
  { path: '/orders', name: 'Orders', component: Orders },
  // add more routes here later
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
