<template>
  <div class="flex h-screen">
    <!-- Sidebar -->
    <aside class="w-64 bg-white text-gray-800 flex flex-col">
      <!-- Logo -->
      <div class="flex flex-col gap-2 border-b border-gray-100 p-6">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-droplets w-6 h-6 text-white"
              data-filename="layout"
              data-linenumber="88"
              data-visual-selector-id="layout88"
              data-source-location="layout:88:16"
              data-dynamic-content="false"
            >
              <path
                d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"
              ></path>
              <path
                d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"
              ></path>
            </svg>
          </div>
          <div>
            <h2 class="font-bold text-gray-900 text-lg">AquaFlow</h2>
            <p class="text-xs text-gray-500 font-medium">Water Delivery Manager</p>
          </div>
        </div>
      </div>
      <nav class="flex-1 p-4 space-y-2">
        <router-link
          to="/dashboard"
          class="flex w-full overflow-hidden cursor-pointer text-left outline-none ring-sidebar-ring focus-visible:ring-2 font-semibold active:bg-sidebar-accent h-8 text-sm hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-md mb-1 items-center gap-3 px-3 py-5"
          active-class="border-blue-500 text-blue-700 border-r-2 bg-blue-50 "
        >
          <i class="fa-solid fa-grip"></i>
          Dashboard</router-link
        >
        <router-link
          to="/customers"
          class="flex w-full overflow-hidden cursor-pointer text-left outline-none ring-sidebar-ring focus-visible:ring-2 font-semibold active:bg-sidebar-accent h-8 text-sm hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-md mb-1 items-center gap-3 px-3 py-5"
          active-class="border-blue-500 text-blue-700 border-r-2 bg-blue-50 "
        >
          <i class="fa-regular fa-users"></i>
          Customers
        </router-link>
        <router-link
          to="/products"
          class="flex w-full overflow-hidden cursor-pointer text-left outline-none ring-sidebar-ring focus-visible:ring-2 font-semibold active:bg-sidebar-accent h-8 text-sm hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-md mb-1 items-center gap-3 px-3 py-5"
          active-class="border-blue-500 text-blue-700 border-r-2 bg-blue-50 "
        >
          <i class="fa-regular fa-box-isometric"></i>
          Stock
        </router-link>
        <router-link
          to="/orders"
          class="flex w-full overflow-hidden cursor-pointer text-left outline-none ring-sidebar-ring focus-visible:ring-2 font-semibold active:bg-sidebar-accent h-8 text-sm hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-md mb-1 items-center gap-3 px-3 py-5"
          active-class="border-blue-500 text-blue-700 border-r-2 bg-blue-50 "
        >
        <i class="fa-regular fa-cart-shopping"></i>
          Orders
        </router-link>
        <router-link
          to="/deliveries"
          class="flex w-full overflow-hidden cursor-pointer text-left outline-none ring-sidebar-ring focus-visible:ring-2 font-semibold active:bg-sidebar-accent h-8 text-sm hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-md mb-1 items-center gap-3 px-3 py-5"
          active-class="border-blue-500 text-blue-700 border-r-2 bg-blue-50 "
        >
        <i class="fa-regular fa-truck"></i>
          Deliveries
        </router-link>
        <router-link
          to="/payments"
          class="flex w-full overflow-hidden cursor-pointer text-left outline-none ring-sidebar-ring focus-visible:ring-2 font-semibold active:bg-sidebar-accent h-8 text-sm hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-md mb-1 items-center gap-3 px-3 py-5"
          active-class="border-blue-500 text-blue-700 border-r-2 bg-blue-50 "
        >
        <i class="fa-regular fa-credit-card"></i>
          Payments
        </router-link>
      </nav>
      <!-- Footer / User -->
      <div class="p-4 border-t border-gray-700 flex items-center gap-3">
        <div class="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500">
          <span class="font-bold">A</span>
        </div>
        <div>
          <p class="text-sm font-semibold">Admin User</p>
          <p class="text-xs text-gray-400">Business Owner</p>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 bg-gray-50 p-6 overflow-y-auto">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCustomers } from './api/customer'

const customers = ref([])

const fetchCustomers = async () => {
  const { data } = await getCustomers()
  customers.value = data
}

onMounted(fetchCustomers)
</script>
