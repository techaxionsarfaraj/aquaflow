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
      <div class="col-span-1 flex justify-end space-x-2">
        <!-- If no bill yet -->
        <button
          v-if="!order.bill_url"
          @click="generateBill(order)"
          class="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Generate Bill
        </button>

        <!-- If bill exists -->
        <template v-else>          
          <button
            @click="viewBill(order.bill_url)"
            class="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-700 text-blue-600 hover:text-white transition-colors"
          >
            <i class="fa-regular fa-eye text-sm"></i>
          </button>
          <!-- <div class=" bg-green-500 text-white rounded hover:bg-green-600"><span><i class="fa-regular fa-building text-blue-600"></i></span></div> -->
          <button
            @click="shareBill(order)"
            class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 transition-colors"
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
        <div class="flex justify-between gap-3">
          <button
            :disabled="!invoiceHtml"
            @click="printInvoice"
            class="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <i class="fa-regular fa-print text-blue-800"></i>
          </button>

          <button @click="showBillModal = false" class="">
            <i class="fa-solid fa-xmark text-red-600 hover:text-red-700"></i>
          </button>
        </div>
      </div>

      <!-- Invoice HTML instead of iframe -->
      <div class="flex-1 w-full overflow-auto p-4">
        <div v-if="invoiceHtml" v-html="invoiceHtml"></div>
        <div v-else class="text-gray-500 text-center mt-10">Loading invoice...</div>
      </div>

      <!-- Footer -->
      <div class="p-4 border-t text-right">
        <button
          @click="showBillModal = false"
          class="px-3 py-2 rounded-md font-semibold text-sm border hover:bg-gray-100 transition-colors"
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
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


const orders = ref([])
const loading = ref(true)

const showBillModal = ref(false)
const invoiceHtml = ref('') // store invoice HTML

// Fetch delivered orders
const fetchOrders = async () => {
  loading.value = true
  try {
    const { data } = await getDeliveredOrders()
    orders.value = (Array.isArray(data) ? data : [data]).map((order) => {
      if (order.bill_file_name && !order.bill_url) {
        order.bill_url = `${API_BASE_URL}/bills/${order.bill_file_name}`
      }
      return { ...order } // ensure reactivity
    })
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
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Generate bill
const generateBill = async (order) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/api/billing/generate-bill`, {
      order_id: order.id,
    })

    if (res.data && res.data.file_name) {
      const billUrl = `${res.data.file_name}`

      // Update order
      const index = orders.value.findIndex(o => o.id === order.id)
      if (index !== -1) {
        orders.value[index] = { ...orders.value[index], bill_url: billUrl} //, bill_file_name: res.data.file_name 
      }

      // Show toast
      const toast = document.createElement('div')
      toast.classList.add(
        'fixed',
        'top-0',
        'right-0',
        'm-2',
        'bg-green-500',
        'text-white',
        'px-4',
        'py-2',
        'rounded'
      )
      toast.innerHTML = 'Bill generated successfully!'
      document.body.appendChild(toast)
      setTimeout(() => toast.remove(), 3000)

      // Fetch HTML and show in modal
      const htmlRes = await axios.get(billUrl, { responseType: 'text' })
      invoiceHtml.value = htmlRes.data
      // showBillModal.value = true
    } else {
      const toast = document.createElement('div')
      toast.classList.add(
        'fixed',
        'top-0',
        'right-0',
        'm-2',
        'bg-red-500',
        'text-white',
        'px-4',
        'py-2',
        'rounded'
      )
      toast.innerHTML = 'Invoice generated but no file returned'
      document.body.appendChild(toast)
      setTimeout(() => toast.remove(), 3000)
    }
  } catch (err) {
    console.error(err)
    const toast = document.createElement('div')
    toast.classList.add(
      'fixed',
      'top-0',
      'right-0',
      'm-2',
      'bg-red-500',
      'text-white',
      'px-4',
      'py-2',
      'rounded'
    )
    toast.innerHTML = 'Failed to generate bill'
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 3000)
  }
}

// View bill (fetch HTML)
const viewBill = async (fileName) => {
  try {
    // Construct the URL from the file name
    const billUrl = `${API_BASE_URL}/invoices/${fileName}`;
    
    // Fetch HTML content
    const res = await axios.get(billUrl, { responseType: 'text' });
    invoiceHtml.value = res.data;
    
    // Show modal
    showBillModal.value = true;
  } catch (err) {
    console.error('Error loading invoice HTML:', err);    
    const toast = document.createElement('div')
    toast.classList.add(
      'fixed',
      'top-0',
      'right-0',
      'm-2',
      'bg-red-500',
      'text-white',
      'px-4',
      'py-2',
      'rounded'
    )
    toast.innerHTML = 'Failed to generate bill'
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 3000)
  }
}

// Share bill
const shareBill = async (order) => {
  const text = `Invoice for Order #ORD-${order.id} | Total: ₹${order.total_amount}`
  const url = order.bill_url

  if (navigator.share) {
    try {
      await navigator.share({ title: `Invoice #ORD-${order.id}`, text, url })
    } catch (err) {
      console.error('Error sharing bill:', err)
    }
  } else {
    alert('Sharing not supported. Copy link: ' + url)
  }
}

// Print Invoice
const printInvoice = () => {
  if (!invoiceHtml.value) return alert('Invoice not ready yet!')

  const win = window.open('', '_blank')
  win.document.writeln(`
    <html>
      <head>
        <title>Invoice</title>
        <style>
          body { font-family: Arial, sans-serif; }
          .invoice { max-width: 800px; margin: auto; }
        </style>
      </head>
      <body>
        ${invoiceHtml.value}
      </body>
    </html>
  `)
  win.document.close()
  win.focus()
  win.print()
}
</script>
