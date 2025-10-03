<!-- ./src/components/orders/OrderForm.vue -->
<template>
  <form @submit.prevent="saveOrder" class="space-y-4">
    <!-- Customer -->
    <div>
      <label class="block text-sm font-medium mb-1">Customer *</label>
      <select
        v-model="form.customer_id"
        required
        class="text-sm w-full border rounded-md px-3 py-2 focus:outline"
        :disabled="readOnly"
      >
        <option value="">Select Customer</option>
        <option v-for="c in customers" :key="c.id" :value="c.id">
          {{ c.name }} - {{ c.phone }}
        </option>
      </select>
    </div>

    <!-- Items -->
    <div>
      <label class="block text-sm font-medium mb-2">Items</label>
      <div class="space-y-2">
        <div
          v-for="(item, index) in form.product_details"
          :key="index"
          class="grid grid-cols-12 gap-2 items-center"
        >
          <!-- Product -->
          <div class="col-span-3">
            <label class="block text-xs font-medium mb-2">Product</label>
            <select
              v-model="item.product_id"
              @change="updatePrice(index)"
              required
              class="w-full border rounded-md px-2 py-1 text-sm"
              :disabled="readOnly"
            >
              <option value="">Select product</option>
              <option v-for="p in products" :key="p.id" :value="p.id">
                {{ p.name }}
              </option>
            </select>
          </div>

          <!-- Qty -->
          <div class="col-span-2">
            <label class="block text-xs font-medium mb-2">Qty</label>
            <input
              type="number"
              min="1"
              v-model.number="item.quantity"
              @input="calcSubtotal(index)"
              class="w-full border rounded-md px-2 py-1 text-center text-sm"
              :disabled="readOnly"
            />
          </div>

          <!-- Unit Price -->
          <div class="col-span-2">
            <label class="block text-xs font-medium mb-2">Unit Price (₹)</label>
            <input
              type="number"
              step="0.01"
              v-model.number="item.unit_price"
              class="w-full border rounded-md px-2 py-1 text-center text-sm bg-gray-100"
              readonly
            />
          </div>

          <!-- Available Stock -->
          <div class="col-span-2" v-if="!readOnly">
            <label class="block text-xs font-medium mb-2">Available Stock</label>
            <div
              class="w-full border rounded-md px-2 py-1 text-center text-sm font-semibold bg-gray-100"
            >
              {{ (products.find((p) => p.id === item.product_id) || {}).available_stock ?? '0' }}
            </div>
          </div>         

          <!-- Total -->
          <div class="col-span-2">
            <label class="block text-xs font-medium mb-2">Total</label>
            <div
              class="w-full border rounded-md px-2 py-1 text-center text-sm font-semibold bg-gray-100"
            >
              ₹ {{ item.total.toFixed(2) }}
            </div>
          </div>

          <!-- Remove -->
          <div class="col-span-1 text-center">
            <button
              v-if="!readOnly"
              type="button"
              @click="removeItem(index)"
              class="text-red-500 hover:text-red-700 border border-red-500 hover:border-red-700 rounded-md p-1 transition-colors mt-6"
            >
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </div>
      </div>
      <!-- Add Item -->
      <div class="mt-2">
        <button
          v-if="!readOnly"
          type="button"
          @click="addItem"
          class="px-3 py-1 border rounded-md hover:bg-gray-100 text-sm font-medium transition-colors"
        >
          + Add Item
        </button>
      </div>
    </div>

    <!-- Delivery Details -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Delivery Date -->
      <div>
        <label class="block text-sm font-medium mb-1">Delivery Date</label>
        <input
          v-model="form.delivery_date"
          type="date"
          required
          class="text-sm w-full border rounded-md px-3 py-2 focus:outline"
          :min="new Date().toISOString().split('T')[0]"
          :disabled="readOnly"
        />
      </div>

      <!-- Delivery Street Address -->
      <div>
        <label class="block text-sm font-medium mb-1">Delivery Street Address</label>
        <input
          v-model="form.delivery_street_address"
          type="text"
          class="text-sm w-full border rounded-md px-3 py-2 focus:outline"
          :disabled="readOnly"
        />
      </div>

      <!-- Delivery Area -->
      <div>
        <label class="block text-sm font-medium mb-1">Delivery Area</label>
        <input
          v-model="form.delivery_area"
          type="text"
          class="text-sm w-full border rounded-md px-3 py-2 focus:outline"
          :disabled="readOnly"
        />
      </div>

      <!-- Delivery Town -->
      <div>
        <label class="block text-sm font-medium mb-1">Delivery Town</label>
        <input
          v-model="form.delivery_town"
          type="text"
          class="text-sm w-full border rounded-md px-3 py-2 focus:outline"
          :disabled="readOnly"
        />
      </div>

      <!-- Delivery City -->
      <div>
        <label class="block text-sm font-medium mb-1">Delivery City</label>
        <input
          v-model="form.delivery_city"
          type="text"
          class="text-sm w-full border rounded-md px-3 py-2 focus:outline"
          :disabled="readOnly"
        />
      </div>

      <!-- Delivery Pincode -->
      <div>
        <label class="block text-sm font-medium mb-1">Delivery Pincode</label>
        <input
          v-model="form.delivery_pincode"
          type="text"
          class="text-sm w-full border rounded-md px-3 py-2 focus:outline"
          :disabled="readOnly"
        />
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Order Date (only on edit) -->
      <div v-if="form.id">
        <label class="block text-sm font-medium mb-1">Order Date</label>
        <input
          v-model="form.order_date"
          type="date"
          class="text-sm w-full border rounded-md px-3 py-2 focus:outline"
          readonly
        />
      </div>

      <!-- Status -->
      <div>
        <label class="block text-sm font-medium mb-1">Status</label>
        <select
          v-model="form.status"
          required
          class="text-sm w-full border rounded-md px-3 py-2 focus:outline"
          :disabled="readOnly"
        >
          <option value="scheduled">Scheduled</option>
          <option value="pending">Pending</option>
          <option value="out_for_delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </div>
    <!-- Delivery Notes -->
    <div>
      <label class="block text-sm font-medium mb-1">Delivery Notes</label>
      <textarea
        v-model="form.delivery_notes"
        rows="2"
        class="text-sm w-full border rounded-md px-3 py-2 focus:outline"
        :disabled="readOnly"
      ></textarea>
    </div>

    <!-- Total -->
    <div class="flex justify-end text-lg font-bold">Total: ₹ {{ totalAmount.toFixed(2) }}</div>

    <!-- Footer -->
    <div class="flex justify-end space-x-3 pt-4">
      <button
        v-if="readOnly"
        type="button"
        @click="$emit('cancel')"
        class="px-3 py-2 rounded-md font-semibold text-sm border hover:bg-gray-100 transition-colors"
      >
        Close
      </button>
      <button
        v-else
        type="button"
        @click="$emit('cancel')"
        class="px-3 py-2 rounded-md font-semibold text-sm border hover:bg-gray-100 transition-colors"
      >
        Cancel
      </button>
      <button
        v-if="!readOnly"
        type="submit"
        class="px-3 py-2 rounded-md font-semibold text-sm text-white bg-gray-800 hover:bg-gray-950 transition-colors"
      >
        {{ form.id ? 'Update Order' : 'Create Order' }}
      </button>
    </div>
  </form>
</template>

<script>
import { createOrder, updateOrder } from '@/api/order'
import { getCustomers } from '@/api/customer'
import { getProducts } from '@/api/product'

export default {
  props: {
    order: Object,
    readOnly: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      form: {
        customer_id: '',
        order_date: new Date().toISOString().slice(0, 10),
        product_details: [],
        delivery_date: '',
        delivery_street_address: '',
        delivery_area: '',
        delivery_town: '',
        delivery_city: '',
        delivery_pincode: '',
        delivery_notes: '',
        total_amount: 0,
        status: 'pending',
      },
      customers: [],
      products: [],
    }
  },
  computed: {
    totalAmount() {
      return this.form.product_details.reduce((sum, i) => sum + (i.total || 0), 0)
    },
  },
  watch: {
    order: {
      immediate: true,
      handler(o) {
        if (o) {
          this.form = {
            ...this.form,
            ...o,
            product_details: o.product_details || [],
            delivery_date: this.formatLocalDate(o.delivery_date),
            order_date: this.formatLocalDate(o.order_date),
          }
        }
      },
    },
  },
  methods: {
    async fetchCustomers() {
      try {
        const { data } = await getCustomers()
        this.customers = data
      } catch (err) {
        console.error('Failed to fetch customers', err)
      }
    },
    async fetchProducts() {
      try {
        const { data } = await getProducts()
        this.products = data
      } catch (err) {
        console.error('Failed to fetch products', err)
      }
    },
    addItem() {
      this.form.product_details.push({
        product_id: '',
        quantity: 0,
        unit_price: 0,
        available_stock: 0,
        total: 0,
      })
    },
    removeItem(index) {
      this.form.product_details.splice(index, 1)
    },
    updatePrice(index) {
      const product = this.products.find(
        (p) => p.id === this.form.product_details[index].product_id,
      )
      if (product) {
        this.form.product_details[index].unit_price = product.price_per_unit || 0
        this.calcSubtotal(index)
      }
    },
    calcSubtotal(index) {
      const item = this.form.product_details[index]
      item.total = (item.quantity || 0) * (item.unit_price || 0)
    },
    async saveOrder() {
      try {
        const payload = { ...this.form, total_amount: this.totalAmount }
        let response
        if (this.form.id) {
          response = await updateOrder(this.form.id, payload)
        } else {
          response = await createOrder(payload)
        }

        // Update available_stock locally
        this.form.product_details.forEach((item) => {
          const product = this.products.find((p) => p.id === item.product_id)
          if (product) {
            product.available_stock -= item.quantity
          }
        })

        this.$emit('saved')
      } catch (err) {
        console.error('Save failed:', err)
      }
    },

    formatLocalDate(dateStr) {
      if (!dateStr) return ''
      const d = new Date(dateStr)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
  },
  mounted() {
    this.fetchCustomers()
    this.fetchProducts()
  },
}
</script>
