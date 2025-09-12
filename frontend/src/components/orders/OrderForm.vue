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

    <!-- Dates -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium mb-1">Order Date *</label>
        <input v-model="form.order_date" type="date" required
          class="w-full border rounded-md px-3 py-2 focus:outline" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Delivery Date *</label>
        <input v-model="form.delivery_date" type="date" required
          class="w-full border rounded-md px-3 py-2 focus:outline" />
      </div>
    </div>

    <!-- Delivery Info -->
    <div>
      <label class="block text-sm font-medium mb-1">Delivery Address</label>
      <textarea v-model="form.delivery_address" rows="2"
        class="w-full border rounded-md px-3 py-2 focus:outline"></textarea>
    </div>
    <div>
      <label class="block text-sm font-medium mb-1">Delivery Area</label>
      <input v-model="form.delivery_area" type="text"
        class="w-full border rounded-md px-3 py-2 focus:outline" />
    </div>

    <!-- Notes -->
    <div>
      <label class="block text-sm font-medium mb-1">Delivery Notes</label>
      <input v-model="form.delivery_notes" type="text"
        class="w-full border rounded-md px-3 py-2 focus:outline" />
    </div>

    <!-- Total Amount -->
    <div>
      <label class="block text-sm font-medium mb-1">Total Amount (₹)</label>
      <input v-model="form.total_amount" type="number" min="0" step="0.01" required
        class="w-full border rounded-md px-3 py-2 focus:outline" />
    </div>

    <!-- Footer -->
    <div class="flex justify-end space-x-3 pt-4">
      <button type="button" @click="$emit('cancel')"
        class="px-4 py-2 rounded-md border hover:bg-gray-100 transition-colors">
        Cancel
      </button>
      <button type="submit"
        class="px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-950 transition-colors">
        <i class="fa-thin fa-floppy-disk"></i>
        {{ form.id ? 'Update Order' : 'Create Order' }}
      </button>
    </div>
  </form>
</template>

<script>
import { createOrder, updateOrder } from "@/api/order";
import { getCustomers } from "@/api/customer";

export default {
  props: { order: Object },
  data() {
    return {
      form: {
        id: null,
        customer_id: "",
        order_date: "",
        delivery_date: "",
        delivery_address: "",
        delivery_area: "",
        delivery_notes: "",
        total_amount: 0,
      },
      customers: [],
    };
  },
  watch: {
    order: {
      immediate: true,
      handler(o) {
        if (o) {
          this.form = { ...this.form, ...o };
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
    async saveOrder() {
      try {
        if (this.form.id) {
          await updateOrder(this.form.id, this.form);
        } else {
          await createOrder(this.form);
        }
        this.$emit("saved"); // notify parent
      } catch (err) {
        console.error("Save failed:", err);
      }
    },
  },
  mounted() {
    this.fetchCustomers();
  },
};
</script>
