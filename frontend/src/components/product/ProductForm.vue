<!-- frontend/src/components/product/ProductForm.vue  -->

<template>
  <form @submit.prevent="saveProduct" class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Product Name -->
      <div>
        <label class="block text-sm font-medium mb-1">Product Name *</label>
        <input
          v-model="form.name"
          type="text"
          placeholder="Product name"
          class="text-sm w-full border rounded-md px-3 py-2 focus:outline"
          required
        />
      </div>

      <!-- Type -->
      <div>
        <label class="block text-sm font-medium mb-1">Type</label>
        <input
          v-model="form.type"
          type="text"
          placeholder="Product type (e.g. 20L Jar, 10L Jar, 5L Bottle, 1L Bottle)"
          class="text-sm w-full border rounded-md px-3 py-2 focus:outline" />
      </div>

      <!-- Unit Price -->
      <div>
        <label class="block text-sm font-medium mb-1">Unit Price (₹)</label>
        <input
          v-model="form.price_per_unit"
          type="number"
          min="0"
          step="0.01"
          class="text-sm w-full border rounded-md px-3 py-2 focus:outline"
        />
      </div>

      <!-- Status -->
      <div>
        <label class="block text-sm font-medium mb-1">Status</label>
        <select v-model="form.status" class="text-sm w-full border rounded-md px-3 py-2 focus:outline">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Total Stock -->
      <div>
        <label class="block text-sm font-medium mb-1">Total Stock</label>
        <input
          v-model="form.total_stock"
          type="number"
          min="0"
          class="text-sm w-full border rounded-md px-3 py-2 focus:outline"
        />
      </div>
      <!-- Minimum Stock -->
      <div>
        <label class="block text-sm font-medium mb-1">Minimum Stock</label>
        <input
          v-model="form.minimum_stock"
          type="number"
          min="0"
          class="text-sm w-full border rounded-md px-3 py-2 focus:outline"
        />
      </div>
    </div>
    <!-- Description -->
    <div>
      <label class="block text-sm font-medium mb-1">Description</label>
      <textarea
        v-model="form.description"
        rows="2"
        placeholder="Additional notes"
        class="text-sm w-full border rounded-md px-3 py-2 focus:outline"
      ></textarea>
    </div>

    <!-- Footer Buttons -->
    <div class="flex justify-end space-x-3 pt-4">
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-3 py-2 rounded-md font-semibold text-sm border hover:bg-gray-100 transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        class="px-3 py-2 rounded-md font-semibold text-sm text-white bg-gray-800 hover:bg-gray-950 transition-colors"
      >
        {{ form.id ? 'Update Product' : 'Create Product' }}
      </button>
    </div>
  </form>
</template>

<script>
import { createProduct, updateProduct } from '@/api/product'

export default {
  props: { product: Object },
  data() {
    return {
      form: {
        id: null,
        name: '',
        type: '',
        price_per_unit: 0,
        status: 'active',        
        total_stock_stock: 0,
        minimum_stock: 0,
        description: '',
      },
    }
  },
  watch: {
    product: {
      immediate: true,
      handler(s) {
        if (s) {
          this.form = { ...this.form, ...s }
        }
      },
    },
  },
  methods: {
    async saveProduct() {
      try {
        if (this.form.id) {
          await updateProduct(this.form.id, this.form)
        } else {
          await createProduct(this.form)
        }
        this.$emit('saved')
      } catch (err) {
        console.error('Save failed:', err)
      }
    },
  },
}
</script>
