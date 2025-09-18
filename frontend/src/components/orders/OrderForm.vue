<!-- ./src/components/orders/OrderForm.vue -->
<template>
  <form @submit.prevent="saveOrder" class="space-y-4">
    <!-- Customer -->
    <div>
      <label class="block text-sm font-medium mb-1">Customer *</label>
      <select
        v-model="form.customer_id"
        required
        class="w-full border rounded-md px-3 py-2 focus:outline"
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
          v-for="(item, index) in form.items"
          :key="index"
          class="grid grid-cols-12 gap-2 items-center"
        >
          <!-- Product -->
          <div class="col-span-5">
            <label class="block text-xs font-medium mb-2">Product</label>
            <select
              v-model="item.product_id"
              @change="updatePrice(index)"
              required
              class="w-full border rounded-md px-2 py-1 text-sm"
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
            />
          </div>

          <!-- Unit Price -->
          <div class="col-span-2">
            <label class="block text-xs font-medium mb-2">Unit Price</label>
            <input
              type="number"
              step="0.01"
              v-model.number="item.unit_price"
              class="w-full border rounded-md px-2 py-1 text-center text-sm bg-gray-100"
              readonly
            />
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
          type="button"
          @click="addItem"
          class="px-3 py-1 border rounded-md hover:bg-gray-100 text-sm font-medium transition-colors"
        >
          + Add Item
        </button>
      </div>
    </div>

    <!-- Order Details -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium mb-1">Delivery Area</label>
        <input
          v-model="form.delivery_area"
          type="text"
          class="w-full border rounded-md px-3 py-2 focus:outline"
        />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Delivery Date *</label>
        <input
          v-model="form.delivery_date"
          type="date"
          required
          class="w-full border rounded-md px-3 py-2 focus:outline"
        />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Delivery Address</label>
      <textarea
        v-model="form.delivery_address"
        rows="2"
        class="w-full border rounded-md px-3 py-2 focus:outline"
      ></textarea>
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Delivery Notes</label>
      <input
        v-model="form.delivery_notes"
        type="text"
        class="w-full border rounded-md px-3 py-2 focus:outline"
      />
    </div>

    <!-- Total -->
    <div class="flex justify-end text-lg font-bold">
      Total: ₹ {{ totalAmount.toFixed(2) }}
    </div>

    <!-- Footer -->
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
        {{ form.id ? "Update Order" : "Create Order" }}
      </button>
    </div>
  </form>
</template>

<script>
import { createOrder, updateOrder } from "@/api/order";
import { getCustomers } from "@/api/customer";
import { getProducts } from "@/api/product";

export default {
  props: { order: Object },
  data() {
    return {
      form: {
        id: null,
        customer_id: "",
        order_date: new Date().toISOString().slice(0, 10),
        delivery_date: "",
        delivery_address: "",
        delivery_area: "",
        delivery_notes: "",
        items: [],
      },
      customers: [],
      products: [],
    };
  },
  computed: {
    totalAmount() {
      return this.form.items.reduce((sum, i) => sum + (i.total || 0), 0);
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
            items: o.products || [],
          };
        }
      },
    },
  },
  methods: {
    async fetchCustomers() {
      try {
        const { data } = await getCustomers();
        this.customers = data;
      } catch (err) {
        console.error("Failed to fetch customers", err);
      }
    },
    async fetchProducts() {
      try {
        const { data } = await getProducts();
        this.products = data;
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    },
    addItem() {
      this.form.items.push({
        product_id: "",
        quantity: 0,
        unit_price: 0,
        total: 0,
      });
    },
    removeItem(index) {
      this.form.items.splice(index, 1);
    },
    updatePrice(index) {
      const product = this.products.find(
        (p) => p.id === this.form.items[index].product_id
      );
      if (product) {
        this.form.items[index].unit_price = product.price_per_unit || 0;
        this.calcSubtotal(index);
      }
    },
    calcSubtotal(index) {
      const item = this.form.items[index];
      item.total = (item.quantity || 0) * (item.unit_price || 0);
    },
    async saveOrder() {
      try {
        const payload = { ...this.form, total_amount: this.totalAmount };
        if (this.form.id) {
          await updateOrder(this.form.id, payload);
        } else {
          await createOrder(payload);
        }
        this.$emit("saved");
      } catch (err) {
        console.error("Save failed:", err);
      }
    },
  },
  mounted() {
    this.fetchCustomers();
    this.fetchProducts();
  },
};
</script>
