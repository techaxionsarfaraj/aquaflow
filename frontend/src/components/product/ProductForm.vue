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
          class="w-full border rounded-md px-3 py-2 focus:outline"
          required
        />
      </div>

      <!-- Type -->
      <div>
        <label class="block text-sm font-medium mb-1">Type</label>
        <select v-model="form.type" class="w-full border rounded-md px-3 py-2 focus:outline">
          <option value="20L_jar">20L Jar</option>
          <option value="10L_jar">10L Jar</option>
          <option value="5L_bottle">5L Bottle</option>
          <option value="1L_bottle">1L Bottle</option>
        </select>
      </div>

      <!-- Unit Price -->
      <div>
        <label class="block text-sm font-medium mb-1">Unit Price (₹)</label>
        <input
          v-model="form.price_per_unit"
          type="number"
          min="0"
          step="0.01"
          class="w-full border rounded-md px-3 py-2 focus:outline"
        />
      </div>

      <!-- Status -->
      <div>
        <label class="block text-sm font-medium mb-1">Status</label>
        <select v-model="form.status" class="w-full border rounded-md px-3 py-2 focus:outline">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>
    <!-- Deposit Amount -->
    <div>
      <label class="block text-sm font-medium mb-1">Deposit Amount (₹)</label>
      <input
        v-model="form.deposit_amount"
        type="number"
        min="0"
        step="0.01"
        class="w-full border rounded-md px-3 py-2 focus:outline"
      />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Current Stock -->
      <div>
        <label class="block text-sm font-medium mb-1">Current Stock</label>
        <input
          v-model="form.current_stock"
          type="number"
          min="0"
          class="w-full border rounded-md px-3 py-2 focus:outline"
        />
      </div>
      <!-- Minimum Stock -->
      <div>
        <label class="block text-sm font-medium mb-1">Minimum Stock</label>
        <input
          v-model="form.minimum_stock"
          type="number"
          min="0"
          class="w-full border rounded-md px-3 py-2 focus:outline"
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
        class="w-full border rounded-md px-3 py-2 focus:outline"
      ></textarea>
    </div>

    <!-- Footer Buttons -->
    <div class="flex justify-end space-x-3 pt-4">
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-4 py-2 rounded-md border hover:bg-gray-100 transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        class="px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-950 transition-colors"
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
        deposit_amount: 0,
        current_stock: 0,
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
