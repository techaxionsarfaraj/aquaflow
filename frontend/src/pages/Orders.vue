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
  <div class="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-md bg-white shadow">
    <input
      v-model="search"
      type="text"
      placeholder="Search by Order ID, Customer, Phone, or Delivery Area"
      class="text-base flex-1 border px-3 py-2 rounded-lg focus:outline"
    />
    <select
      v-model="statusFilter"
      class="text-sm border px-3 py-2 rounded-lg focus:outline cursor-pointer"
    >
      <option value="">All Status</option>
      <option value="pending">Pending</option>
      <option value="confirmed">Confirmed</option>
      <option value="out_for_delivery">Out for Delivery</option>
      <option value="delivered">Delivered</option>
      <option value="cancelled">Cancelled</option>
    </select>
    <button
      @click="clearFilters"
      class="text-sm border px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
    >
      Clear
    </button>
  </div>
  <!-- Orders Table -->
  <div v-if="filteredOrders.length" class="bg-white rounded-lg shadow overflow-hidden">
    <!-- Table Header -->
    <div class="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-gray-600 font-semibold text-sm">
      <div class="col-span-1">Order ID</div>
      <div class="col-span-2">Customer</div>
      <div class="col-span-2">Products</div>
      <div class="col-span-1">Order Date</div>
      <div class="col-span-1">Delivery Date</div>
      <div class="col-span-2">Delivery Address</div>
      <div class="col-span-1">Total</div>
      <div class="col-span-1">Status</div>
      <div class="col-span-1 text-right">Actions</div>
    </div>

    <!-- Order Rows -->
    <div
      v-for="order in filteredOrders"
      :key="order.id"
      class="grid grid-cols-12 gap-4 items-center px-6 py-4 border-t hover:bg-gray-50 transition"
    >
      <!-- Order ID -->
      <div class="col-span-1 font-medium">ORD-{{ order.id }}</div>

      <!-- Customer -->
      <div class="col-span-2 flex items-center space-x-3">
        <div
          class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600"
        >
          {{ order.customer_name?.charAt(0).toUpperCase() }}
        </div>
        <div>
          <p class="font-semibold capitalize">{{ order.customer_name }}</p>
          <p class="text-sm text-gray-500">{{ order.customer_phone }}</p>
        </div>
      </div>

      <!-- Products -->
      <div class="col-span-2 text-sm text-gray-700">
        <template v-if="order.product_details && order.product_details.length">
          <div v-for="(p, idx) in order.product_details" :key="idx" class="text-xs text-gray-700">
            • {{ p.product_name }} ({{ p.unit_price }} x {{ p.quantity }}) = ₹{{ p.total }}
          </div>
        </template>
        <span v-else class="text-gray-400">No products</span>
      </div>

      <!-- Order Date -->
      <div class="col-span-1 text-sm text-gray-700">
        {{
          new Intl.DateTimeFormat('en-IN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }).format(new Date(order.order_date))
        }}
      </div>

      <!-- Delivery Date -->
      <div class="col-span-1 text-sm text-gray-700">
        {{
          new Intl.DateTimeFormat('en-IN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }).format(new Date(order.delivery_date))
        }}
      </div>

      <!--Delivery Address -->
      <div class="col-span-2 text-sm text-gray-700 capitalize">
        {{ order.delivery_street_address }} <br />
        <span class="font-semibold">{{ order.delivery_area }}</span> <br />
        {{ order.delivery_town }} <br /> {{ order.delivery_city }} {{ order.delivery_pincode }}
      </div>

      <!-- Total -->
      <div class="col-span-1 font-semibold">₹{{ order.total_amount }}</div>

      <!-- Status -->
      <div class="col-span-1">
        <span
          :class="[
            'text-xs px-2 py-1 rounded-full font-semibold capitalize',
            order.status?.toLowerCase() === 'scheduled'
              ? 'bg-blue-100 text-blue-600'
              : order.status?.toLowerCase() === 'pending'
                ? 'bg-yellow-100 text-yellow-600'
                : order.status?.toLowerCase() === 'out_for_delivery'
                  ? 'bg-orange-100 text-orange-600'
                  : order.status?.toLowerCase() === 'delivered'
                    ? 'bg-green-100 text-green-600'
                    : order.status?.toLowerCase() === 'cancelled'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-gray-200 text-gray-600',
          ]"
        >
          {{ order.status }}
        </span>
      </div>

      <!-- Actions -->
      <div class="col-span-1 flex justify-end space-x-3">
        <!-- If status is cancelled or delivered → View -->
        <button
          v-if="['cancelled', 'delivered'].includes(order.status?.toLowerCase())"
          @click="viewOrder(order)"
          class="text-gray-500 hover:text-blue-600"
        >
          <i class="fa-regular fa-eye"></i>
        </button>
        <button v-else @click="editOrder(order)" class="text-gray-500 hover:text-blue-600">
          <i class="fa-regular fa-pen-to-square"></i>
        </button>
        <button @click="removeOrder(order.id)" class="text-red-400 hover:text-red-500">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </div>
    </div>
  </div>

  <!-- No Orders -->
  <div v-else class="p-6 text-center text-gray-500">No orders found.</div>

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
      <OrderForm
        :read-only="editingOrder?.readOnly || false"
        :order="editingOrder"
        @saved="handleSaved"
        @cancel="closeForm"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getOrders, deleteOrder } from '@/api/order'
import { getProduct } from '@/api/product'
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

    if (orders.value.length > 0) {
      // Collect all product IDs from all orders
      const rawItems = orders.value.map((order) => {
        if (!order.product_details) return []
        return typeof order.product_details === 'string'
          ? JSON.parse(order.product_details)
          : order.product_details
      })

      const productIds = rawItems.flatMap((items) => items.map((item) => item.product_id))
      const uniqueProductIds = [...new Set(productIds)]

      // Fetch product details in parallel
      const productResponses = await Promise.all(uniqueProductIds.map((id) => getProduct(id)))

      // Build a product map (handle arrays vs objects)
      const productMap = {}
      productResponses.forEach((res) => {
        const prod = Array.isArray(res.data) ? res.data[0] : res.data
        if (prod) {
          productMap[prod.id] = prod.name
        }
      })

      // Re-map orders with parsed product_details + product_name
      orders.value = data.map((order) => {
        const details =
          typeof order.product_details === 'string' && order.product_details
            ? JSON.parse(order.product_details)
            : order.product_details || []

        return {
          ...order,
          product_details: details.map((item) => ({
            ...item,
            product_name: productMap[item.product_id] || `Product #${item.product_id}`,
          })),
        }
      })
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
    const searchTerm = search.value.toLowerCase()
    return (
      (!search.value ||
        o.customer_name?.toLowerCase().includes(searchTerm) ||
        o.customer_phone?.includes(search.value) ||
        o.delivery_area?.toLowerCase().includes(searchTerm) ||
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

function viewOrder(order) {
  editingOrder.value = { ...order, readOnly: true }
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
