<!-- src/pages/Billing.vue -->
<template>
  <!-- Header -->
  <div class="flex justify-between items-center mb-6">
    <div>
      <h1 class="text-2xl font-bold">Bill Management</h1>
      <p class="text-gray-500">Manage customer bills</p>
    </div>
    <div></div>
  </div>

  <!-- Loading -->
  <div v-if="loading" class="text-gray-500">Loading delivered orders...</div>

  <!-- Empty state -->
  <div v-else-if="orders.length === 0" class="text-gray-500">No delivered orders found.</div>

  <!-- Orders table -->
  <div v-else class="bg-white rounded-lg shadow overflow-hidden">
    <!-- Table Header -->
    <div class="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-gray-600 font-semibold text-sm">
      <div class="col-span-1">Order ID</div>
      <div class="col-span-2">Customer</div>
      <div class="col-span-2">Products</div>
      <div class="col-span-1">Order Date</div>
      <div class="col-span-1">Delivery Date</div>
      <div class="col-span-2">Delivery Address</div>
      <div class="col-span-1">Total</div>
      <div class="col-span-1 text-right">Actions</div>
    </div>

    <!-- Delivered Orders -->
    <div
      v-for="order in orders"
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
          <p class="text-sm text-gray-500">
            <a :href="'tel:+91' + order.phone" :title="'Call ' + order.customer_name">
              {{ order.phone }}
            </a>
          </p>
          <p class="text-sm text-gray-500">
            <a :href="'mailto:' + order.email">
              {{ order.email }}
            </a>
          </p>
        </div>
      </div>

      <!-- Products -->
      <div class="col-span-2 text-sm text-gray-700">
        <template v-if="parseProducts(order.product_details).length">
          <div
            v-for="(p, idx) in parseProducts(order.product_details)"
            :key="idx"
            class="text-xs text-gray-700"
          >
            • {{ p.product_name }} ({{ p.unit_price }} x {{ p.quantity }}) = ₹{{ p.total }}
          </div>
        </template>
        <span v-else class="text-gray-400">No products</span>
      </div>

      <!-- Order Date -->
      <div class="col-span-1 text-sm text-gray-700">
        {{ formatDate(order.order_date) }}
      </div>

      <!-- Delivery Date -->
      <div class="col-span-1 text-sm text-gray-700">
        {{ formatDate(order.delivery_date) }}
      </div>

      <!-- Delivery Address -->
      <div class="col-span-2 text-sm text-gray-700 capitalize">
        {{ order.delivery_street_address }} <br />
        <span class="font-semibold">{{ order.delivery_area }}</span> <br />
        {{ order.delivery_town }} <br />
        {{ order.delivery_city }} {{ order.delivery_pincode }}
      </div>

      <!-- Total -->
      <div class="col-span-1 font-semibold">₹{{ order.total_amount }}</div>

      <!-- Actions -->
      <!-- <div class="col-span-1 flex justify-end">
        <button
          @click="generateBill(order)"
          class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Generate Bill
        </button>
      </div> -->
      <!-- Actions -->
      <div class="col-span-1 flex justify-end space-x-2">
        <!-- If no bill yet -->
        <button
          v-if="!order.bill_url"
          @click="generateBill(order)"
          class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Generate Bill
        </button>

        <!-- If bill exists -->
        <template v-else>
          <button
            @click="viewBill(order.bill_url)"
            class="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-700 text-blue-600  hover:text-white transition-colors"
          >
            <i class="fa-regular fa-eye  text-sm"></i>
          </button>
          <!-- <div class=" bg-green-500 text-white rounded hover:bg-green-600"><span><i class="fa-regular fa-building text-blue-600"></i></span></div> -->
          <button
            @click="shareBill(order)"
            class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700  hover:text-gray-900 transition-colors"
          >
            <i class="fa-regular fa-share-nodes"></i>
          </button>
        </template>
      </div>
    </div>
  </div>

  <!-- Bill Modal -->
  <div
    v-if="showBillModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div
      class="bg-white w-11/12 md:w-3/4 lg:w-2/3 h-4/5 rounded-lg overflow-hidden shadow-lg flex flex-col"
    >
      <!-- Header -->
      <div class="flex justify-between items-center p-4 border-b">
        <h3 class="text-lg font-bold">Invoice Preview</h3>

        <button @click="showBillModal = false" class="text-gray-600 hover:text-gray-900">✖</button>
      </div>

      <!-- Iframe -->
      <iframe
        v-if="billUrlInModal"
        ref="billIframe"
        :src="billUrlInModal"
        class="flex-1 w-full"
        @load="iframeLoaded = true"
      >
      </iframe>
      <button
        :disabled="!iframeLoaded"
        @click="billIframe.value?.contentWindow?.print()"
        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Print
      </button>
      <!-- Footer -->
      <div class="p-4 border-t text-right">
        <button
          @click="showBillModal = false"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDeliveredOrders } from '@/api/order'
import axios from 'axios'

const orders = ref([])
const loading = ref(true)

const showBillModal = ref(false)
const billUrlInModal = ref('')
const billIframe = ref(null)
const iframeLoaded = ref(false)

const fetchOrders = async () => {
  loading.value = true
  try {
    const { data } = await getDeliveredOrders()
    orders.value = Array.isArray(data) ? data : [data]
  } catch (err) {
    console.error('Error fetching delivered orders:', err)
    orders.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchOrders)

// Parse product_details JSON
const parseProducts = (json) => {
  try {
    return JSON.parse(json)
  } catch {
    return []
  }
}

// Format date
const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// Generate bill
// const generateBill = async (order) => {
//   try {
//     const res = await axios.post('http://localhost:5000/api/billing/generate-bill', {
//       order_id: order.id,
//     })

//     if (res.data && res.data.url) {
//       // open invoice in new tab
//       window.open(res.data.url, '_blank')
//     } else {
//       alert('Invoice generated but no URL returned')
//     }
//   } catch (err) {
//     console.error('Failed to generate invoice', err)
//     alert('Failed to generate bill')
//   }
// }

const generateBill = async (order) => {
  try {
    const res = await axios.post('http://localhost:5000/api/billing/generate-bill', {
      order_id: order.id,
    })

    if (res.data && res.data.url) {
      order.bill_url = res.data.url // save in current list so UI updates
      alert('Bill generated successfully!')
    } else {
      alert('Bill generated but no URL returned')
    }
  } catch (err) {
    console.error(err)
    alert('Failed to generate bill')
  }
}
const viewBill = (billUrl) => {
  iframeLoaded.value = false
  billUrlInModal.value = billUrl
  showBillModal.value = true
}

const shareBill = async (order) => {
  const text = `Invoice for Order #ORD-${order.id} | Total: ₹${order.total_amount}`;
  const url = order.bill_url;

  if (navigator.share) {
    try {
      await navigator.share({
        title: `Invoice #ORD-${order.id}`,
        text,
        url,
      });
      console.log('Bill shared successfully');
    } catch (err) {
      console.error('Error sharing bill:', err);
    }
  } else {
    alert('Sharing is not supported on this browser. You can copy the link: ' + url);
  }
};

</script>
