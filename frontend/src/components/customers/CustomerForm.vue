<!-- frontend/src/components/customers/CustomerForm.vue -->
 
<template>
  <form @submit.prevent="saveCustomer" class="space-y-4">
    <!-- 2 Column Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Name -->
      <div>
        <label class="block text-sm font-medium mb-1">Name *</label>
        <input v-model="form.name" type="text" placeholder="Customer name"
          class="w-full border rounded-md px-3 py-2 focus:outline" required />
      </div>

      <!-- Phone -->
      <div>
        <label class="block text-sm font-medium mb-1">Phone *</label>
        <input v-model="form.phone" type="text" placeholder="Phone number"
          class="w-full border rounded-md px-3 py-2 focus:outline" required />
      </div>

      <!-- Email -->
      <div>
        <label class="block text-sm font-medium mb-1">Email</label>
        <input v-model="form.email" type="email" placeholder="Email address"
          class="w-full border rounded-md px-3 py-2 focus:outline" />
      </div>

      <!-- Area -->
      <div>
        <label class="block text-sm font-medium mb-1">Area</label>
        <input v-model="form.area" type="text" placeholder="Delivery area"
          class="w-full border rounded-md px-3 py-2 focus:outline" />
      </div>

      <!-- Customer Type -->
      <div>
        <label class="block text-sm font-medium mb-1">Customer Type</label>
        <select v-model="form.customer_type"
          class="w-full border rounded-md px-3 py-2 focus:outline">
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>          
        </select>
      </div>

      <!-- Status -->
      <div>
        <label class="block text-sm font-medium mb-1">Status</label>
        <select v-model="form.status"
          class="w-full border rounded-md px-3 py-2 focus:outline">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>
    </div>

    <!-- Address -->
    <div>
      <label class="block text-sm font-medium mb-1">Address *</label>
      <textarea v-model="form.address" rows="2" placeholder="Full delivery address"
        class="w-full border rounded-md px-3 py-2 focus:outline" required></textarea>
    </div>

    <!-- Deposit + Notes -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium mb-1">Deposit Amount (₹)</label>
        <input v-model="form.deposit_amount" type="number" min="0"
          class="w-full border rounded-md px-3 py-2 focus:outline" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Notes</label>
        <input v-model="form.notes" type="text" placeholder="Additional notes"
          class="w-full border rounded-md px-3 py-2 focus:outline" />
      </div>
    </div>

    <!-- Footer Buttons -->
    <div class="flex justify-end space-x-3 pt-4">
      <button type="button" @click="$emit('cancel')"
        class="px-4 py-2 rounded-md border hover:bg-gray-100 transition-colors">
        Cancel
      </button>
      <button type="submit"
        class="px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-950 transition-colors">
        <i class="fa-thin fa-floppy-disk"></i>
        {{ form.id ? 'Update Customer' : 'Create Customer' }}
      </button>
    </div>
  </form>
</template>

<script>
import { createCustomer, updateCustomer } from "@/api/customer";

export default {
  props: { customer: Object },
  data() {
    return {
      form: {
        id: null,
        name: "",
        phone: "",
        email: "",
        address: "",
        area: "",
        customer_type: "",
        status: "active",
        deposit_amount: 0,
        notes: "",
      },
    };
  },
  watch: {
    customer: {
      immediate: true,
      handler(c) {
        if (c) {
          this.form = { ...this.form, ...c };
        }
      },
    },
  },
  methods: {
    async saveCustomer() {
      try {
        if (this.form.id) {
          await updateCustomer(this.form.id, this.form);
        } else {
          await createCustomer(this.form);
        }
        this.$emit("saved"); // notify parent to reload
      } catch (err) {
        console.error("Save failed:", err);
      }
    },
  },
};
</script>
