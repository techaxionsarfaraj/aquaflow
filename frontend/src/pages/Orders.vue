<!-- frontend/src/pages/Orders.vue -->

<template>
  <!-- Header -->
  <div class="flex justify-between items-center mb-6">
    <div>
      <h1 class="text-2xl font-bold">Order Management</h1>
      <p class="text-gray-500">Manage and track all customer orders</p>
    </div>
    <button
      @click="openAddOrder"
      class="transition-colors space-x-2 bg-blue-600 text-white px-3 py-2 rounded-md shadow hover:bg-blue-700 font-semibold text-sm"
    >
      + Create New Order
    </button>
  </div>

  <!-- Stats Cards -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    <div class="bg-white p-4 rounded-lg shadow">
      <p class="text-sm text-gray-500">Total Orders</p>
      <p class="text-2xl font-bold">{{ stats.total }}</p>
    </div>
    <div class="bg-white p-4 rounded-lg shadow">
      <p class="text-sm text-gray-500">Pending</p>
      <p class="text-2xl font-bold text-yellow-600">{{ stats.pending }}</p>
    </div>
    <div class="bg-white p-4 rounded-lg shadow">
      <p class="text-sm text-gray-500">Delivered</p>
      <p class="text-2xl font-bold text-green-600">{{ stats.delivered }}</p>
    </div>
    <div class="bg-white p-4 rounded-lg shadow">
      <p class="text-sm text-gray-500">Cancelled</p>
      <p class="text-2xl font-bold text-red-600">{{ stats.cancelled }}</p>
    </div>
  </div>

  <!-- Filters -->
  <div class="flex flex-wrap items-center gap-3 mb-6">
    <input
      v-model="search"
      type="text"
      placeholder="Search by Order ID, Customer, or Phone"
      class="border rounded-md px-3 py-2 w-full md:w-1/3"
    />
    <select v-model="statusFilter" class="border rounded-md px-3 py-2">
      <option value="">All Status</option>
      <option value="pending">Pending</option>
      <option value="confirmed">Confirmed</option>
      <option value="out_for_delivery">Out for Delivery</option>
      <option value="delivered">Delivered</option>
      <option value="cancelled">Cancelled</option>
    </select>
    <button @click="clearFilters" class="px-3 py-2 border rounded-md hover:bg-gray-100">
      Clear
    </button>
  </div>

  <!-- Orders Table -->
  <div class="bg-white rounded-lg shadow overflow-x-auto">
    <table class="min-w-full text-sm">
      <thead>
        <tr class="bg-gray-100 text-left text-gray-600">
          <th class="px-4 py-3">Order ID</th>
          <th class="px-4 py-3">Customer</th>
          <th class="px-4 py-3">Products</th>
          <th class="px-4 py-3">Total</th>
          <th class="px-4 py-3">Status</th>
          <th class="px-4 py-3 text-right">Actions</th>
          <th class="px-4 py-3">Date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in filteredOrders" :key="order.id" class="border-b hover:bg-gray-50">
          <td class="px-4 py-3 font-medium">#{{ order.id }}</td>

          <td class="px-4 py-3">
            <div class="font-medium">{{ order.customer_name }}</div>
            <div class="text-gray-500 text-xs">{{ order.customer_phone }}</div>
          </td>
          <td class="px-4 py-3">
            <template v-if="order.products && order.products.length">
              <span v-for="(p, idx) in order.items" :key="idx">
                {{ p.product_name }} (x{{ p.quantity }})
              </span>
            </template>
            <span v-else class="text-gray-400">No products</span>
          </td>

          <td class="px-4 py-3 font-semibold">₹{{ order.total_amount }}</td>
          <td class="px-4 py-3">
            <span
              :class="statusClass(order.status)"
              class="px-2 py-1 rounded-full text-xs font-medium"
            >
              {{ order.status }}
            </span>
          </td>
          <td class="px-4 py-3 text-right space-x-2">
            <button @click="editOrder(order)" class="text-blue-600 hover:underline">Edit</button>
            <button @click="removeOrder(order.id)" class="text-red-600 hover:underline">
              Delete
            </button>
          </td>
          <td class="px-4 py-3">{{ formatDate(order.order_date) }}</td>
        </tr>
        <tr v-if="loading">
          <td colspan="7" class="px-4 py-3 text-center text-gray-500">Loading orders...</td>
        </tr>
        <tr v-if="!loading && filteredOrders.length === 0">
          <td colspan="7" class="px-4 py-3 text-center text-gray-500">No orders found</td>
        </tr>
      </tbody>
    </table>
  </div>
  <!-- Add/Edit Modal -->
  <div
    v-if="showForm"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div
      class="bg-white rounded-lg border bg-card text-card-foreground shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 relative"
    >
      <h2 class="text-2xl font-semibold mb-4">
        <i class="fa-regular fa-box"></i>
        {{ editingOrder ? 'Edit Order' : 'Create New Order' }}
      </h2>
      <OrderForm :order="editingOrder" @saved="handleSaved" @cancel="closeForm" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getOrders, deleteOrder } from '@/api/order'
import OrderForm from '@/components/orders/OrderForm.vue'

const orders = ref([])
const loading = ref(false)
const search = ref('')
const statusFilter = ref('')

// modal + editing state
const showForm = ref(false)
const editingOrder = ref(null)

const stats = ref({
  total: 0,
  pending: 0,
  delivered: 0,
  cancelled: 0,
})

// Format Date
function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

// Fetch orders
async function fetchOrders() {
  loading.value = true
  try {
    const { data } = await getOrders()
    orders.value = data || []
    if (orders.value.length > 17 && orders.value[17].items) {
      let rawItems = orders.value[17].items

      // If items is a string, parse it
      if (typeof rawItems === 'string') {
        try {
          rawItems = JSON.parse(rawItems)
        } catch (e) {
          console.error('Invalid JSON in items:', e)
          return
        }
      }

      // Ensure it's an array before accessing index 0
      if (Array.isArray(rawItems) && rawItems.length > 0) {
        const item = JSON.stringify(rawItems[0], null, 2)
        console.log(item)
      } else {
        console.warn('items is not an array or is empty:', rawItems)
      }
    }
    calculateStats()
  } catch (error) {
    console.error('Failed to fetch orders:', error)
  } finally {
    loading.value = false
  }
}

// Stats calc
function calculateStats() {
  stats.value.total = orders.value.length
  stats.value.pending = orders.value.filter((o) => o.status === 'pending').length
  stats.value.delivered = orders.value.filter((o) => o.status === 'delivered').length
  stats.value.cancelled = orders.value.filter((o) => o.status === 'cancelled').length
}

// Filtered orders
const filteredOrders = computed(() => {
  return orders.value.filter((o) => {
    return (
      (!search.value ||
        o.customer_name.toLowerCase().includes(search.value.toLowerCase()) ||
        o.customer_phone?.includes(search.value) ||
        o.id.toString().includes(search.value)) &&
      (!statusFilter.value || o.status === statusFilter.value)
    )
  })
})

// Helpers
const statusClass = (status) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-700'
    case 'confirmed':
      return 'bg-blue-100 text-blue-700'
    case 'out_for_delivery':
      return 'bg-purple-100 text-purple-700'
    case 'delivered':
      return 'bg-green-100 text-green-700'
    case 'cancelled':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

function clearFilters() {
  search.value = ''
  statusFilter.value = ''
}

// === Modal / Form control ===
function openAddOrder() {
  editingOrder.value = null
  showForm.value = true
}

function editOrder(order) {
  editingOrder.value = order
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingOrder.value = null
}

async function handleSaved() {
  showForm.value = false
  editingOrder.value = null
  await fetchOrders()
}

// Delete order
async function removeOrder(id) {
  if (confirm('Are you sure to delete order #' + id + '?')) {
    try {
      await deleteOrder(id)
      orders.value = orders.value.filter((o) => o.id !== id)
      calculateStats()
    } catch (error) {
      console.error('Failed to delete order:', error)
    }
  }
}

onMounted(fetchOrders)
</script>
