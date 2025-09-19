<!-- frontend/src/pages/Products.vue -->

<template>
  <!-- Header -->
  <div class="flex justify-between items-center mb-6">
    <div>
      <h1 class="text-2xl font-bold">Products / Stocks  Management</h1>
      <p class="text-gray-500">Manage inventory and product details</p>
    </div>
    <button
      @click="openForm()"
      class="flex items-center transition-colors space-x-2 bg-blue-600 text-white px-3 py-2 rounded-md shadow hover:bg-blue-700 font-semibold text-sm"
    >
      <span>+ Add Product</span>
    </button>
  </div>

  <!-- Stats Cards -->
  <div
    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 mb-6"
  >
    <!-- Total Products -->
    <div
      class="rounded-lg bg-card bg-white text-card-foreground shadow-sm relative overflow-hidden p-6 border border-blue-200"
    >
      <div class="text-2xl font-bold text-gray-950 text-left mb-3">{{ products.length }}</div>
      <div class="text-sm text-gray-500 text-left">Total Products</div>
      <div
        class="absolute top-2 right-2 w-28 h-28 transform translate-x-8 -translate-y-8 bg-blue-500 rounded-full opacity-10"
      ></div>
      <i class="fa-regular fa-box-isometric absolute top-6 right-5 text-blue-600 text-2xl"></i>
    </div>

    <!-- Low Stock -->
    <div
      class="rounded-lg bg-card bg-white text-card-foreground shadow-sm relative overflow-hidden p-6 border border-red-200"
    >
      <div class="text-2xl font-bold text-gray-950 text-left mb-3">{{ lowStockCount }}</div>
      <div class="text-sm text-gray-500 text-left">Low Stock Items</div>
      <div
        class="absolute top-2 right-2 w-28 h-28 transform translate-x-8 -translate-y-8 bg-red-500 rounded-full opacity-10"
      ></div>
      <i class="fa-regular fa-triangle-exclamation absolute top-6 right-5 text-red-600 text-2xl"></i>
    </div>
  </div>

  <!-- Product Grid -->
  <div class="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    <div
      v-for="s in products"
      :key="s.id"
      class="bg-white rounded-xl shadow-md p-5 relative border hover:shadow-lg transition"
    >
      <!-- Edit/Delete -->
      <div class="absolute top-3 right-3 flex space-x-3">
        <button @click="openForm(s)" class="text-gray-500 hover:text-green-600">
          <i class="fa-regular fa-pen-to-square"></i>
        </button>
        <button @click="confirmDelete(s.id)" class="text-red-400 hover:text-red-500">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </div>

      <!-- Title -->
      <h3 class="text-lg font-semibold">{{ s.name }}</h3>

      <!-- Tags -->
      <div class="flex items-center mt-2 gap-2">
        <span v-if="s.type" class="text-xs border text-gray-600 px-2 py-0.5 rounded-full">
          {{ s.type }}
        </span>
        <span
          :class="[
            'text-xs px-2 py-0.5 rounded-full font-semibold',
            s.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600',
          ]"
        >
          {{ s.status }}
        </span>
      </div>

      <!-- Price & Deposit -->
      <div class="mt-5">
        <div class="text-2xl font-bold text-gray-800">
          ₹{{ s.price_per_unit }}
          <span class="text-sm text-gray-500 font-normal">/ unit</span>
        </div>
        <!-- <p class="text-gray-600 text-sm mt-4">Deposit: ₹{{ s.deposit_amount }}</p> -->
      </div>

      <!-- Description -->
      <p v-if="s.description" class="text-sm text-gray-500 italic mt-4">
        {{ s.description }}
      </p>

      <!-- Stock Level -->
      <div class="mt-4">
        <div class="flex justify-between text-sm text-gray-600">
          <span>Stock Level</span>
          <span class="font-medium">{{ s.available_stock }} / {{ s.total_stock }}</span>
        </div>

        <!-- Progress Bar -->
        <div class="w-2/5 bg-gray-200 rounded-full h-4 mt-1 overflow-hidden">
          <div
            class="h-4 rounded-full"
            :class="s.available_stock < s.total_stock ? 'bg-red-500' : 'bg-gray-900'"
            :style="{ width: (s.available_stock / s.total_stock) * 100 + '%' }"
          ></div>
        </div>
      </div>

      <!-- Update Stock -->
      <div class="mt-4">
        <label class="text-sm text-gray-600 block mb-1">Update Stock</label>
        <div class="flex items-center space-x-2">
          <button
            class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            @click="s.available_stock = Math.max(0, s.available_stock - 1)"
          >
            –
          </button>
          <input
            v-model.number="s.available_stock"
            type="number"
            class="w-20 text-center border rounded-md py-1"
          />
          <button
            class="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            @click="s.available_stock++"
          >
            +
          </button>
          <button
            class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            @click="updateStock(s)"
            :disabled="s.available_stock === s.minimum_stock"
          >
            <i class="fa-regular fa-check"></i>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Add/Edit Modal -->
  <div
    v-if="showForm"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
      <h2 class="text-2xl font-semibold mb-4">
        {{ editingProduct ? 'Edit Product' : 'Add New Product' }}
      </h2>
      <!-- pass prop name `product` to match ProductForm.vue -->
      <ProductForm :product="editingProduct" @saved="handleSaved" @cancel="closeForm" />
    </div>
  </div>

  <!-- Delete Confirmation -->
  <div
    v-if="deleteId"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
      <h2 class="text-lg font-semibold mb-4">Confirm Delete</h2>
      <p class="mb-6 text-gray-600">Are you sure you want to delete this product?</p>
      <div class="flex justify-end space-x-3">
        <button @click="deleteId = null" class="px-3 py-2 rounded-md border text-sm font-semibold hover:bg-gray-100 transition-colors">
          Cancel
        </button>
        <button
          @click="deleteProduct(deleteId)"
          class=" text-white px-3 py-2 rounded-md text-sm font-semibold bg-red-600 hover:bg-red-700 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { getProducts, deleteProduct } from '@/api/product'
import ProductForm from '@/components/product/ProductForm.vue'

export default {
  components: { ProductForm },
  data() {
    return {
      showForm: false,
      editingProduct: null,
      deleteId: null,
      products: [],
    }
  },
  methods: {
    async fetchProducts() {
      try {
        const res = await getProducts()
        // backend might return array directly or wrapped in data property
        const list = res.data.data || res.data
        // try to sort by created_date if present, otherwise by id desc
        this.products = list.sort((a, b) => {
          const da = a.created_date || a.created_at || a.id
          const db = b.created_date || b.created_at || b.id
          // if created_date strings — compare timestamps
          const ta = isNaN(Date.parse(da)) ? a.id : Date.parse(da)
          const tb = isNaN(Date.parse(db)) ? b.id : Date.parse(db)
          return tb - ta
        })
        console.log('Products fetched:', this.products)
      } catch (err) {
        console.error('Failed to fetch products:', err)
      }
    },
    openForm(product = null) {
      // pass an actual object for editing, else null for create
      this.editingProduct = product ? { ...product } : null
      this.showForm = true
    },
    closeForm() {
      this.showForm = false
      this.editingProduct = null
    },
    async handleSaved() {
      this.showForm = false
      this.editingProduct = null
      await this.fetchProducts()
    },
    confirmDelete(id) {
      this.deleteId = id
    },
    async deleteProduct(id) {
      try {
        await deleteProduct(id)
        await this.fetchProducts()
        this.deleteId = null
      } catch (err) {
        console.error('Delete failed:', err)
      }
    },
  },
  computed: {
    lowStockCount() {
      return this.products.filter((p) => p.available_stock < p.minimum_stock).length
    },
  },

  mounted() {
    this.fetchProducts()
  },
}
</script>
