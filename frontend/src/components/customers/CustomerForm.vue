<!-- frontend/src/components/customers/CustomerForm.vue -->

<template>
  <form @submit.prevent="saveCustomer" class="space-y-4">
    <!-- 2 Column Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Name -->
      <div>
        <label class="block text-sm font-medium mb-1">Name *</label>
        <input
          v-model="form.name"
          type="text"
          placeholder="Customer name"
          class="text-sm w-full border rounded-md px-3 py-2 focus:outline"
          required
        />
      </div>

      <!-- Phone -->
      <div>
        <label class="block text-sm font-medium mb-1">Phone *</label>
        <input
          v-model="form.phone"
          type="text"
          placeholder="Phone number"
          class="text-sm w-full border rounded-md px-3 py-2 focus:outline"
          required
        />
      </div>

      <!-- Email -->
      <div>
        <label class="block text-sm font-medium mb-1">Email</label>
        <input
          v-model="form.email"
          type="email"
          placeholder="Email address"
          class="text-sm w-full border rounded-md px-3 py-2 focus:outline"
        />
      </div>

      <!-- Street Address -->
      <div>
        <label class="block text-sm font-medium mb-1">Street Address *</label>
        <input
          v-model="form.street_address"
          type="text"
          placeholder="Street address"
          class="text-sm w-full border rounded-md px-3 py-2 focus:outline"
          required
        />
      </div>

      <!-- Area -->
      <div>
        <label class="block text-sm font-medium mb-1">Area</label>
        <input
          v-model="form.area"
          type="text"
          placeholder="Delivery area"
          class="text-sm w-full border rounded-md px-3 py-2 focus:outline"
        />
      </div>

      <!-- Town -->
      <div>
        <label class="block text-sm font-medium mb-1">Town</label>
        <input
          v-model="form.town"
          type="text"
          placeholder="Town"
          class="text-sm w-full border rounded-md px-3 py-2 focus:outline"
        />
      </div>
      <!-- City -->
      <div>
        <label class="block text-sm font-medium mb-1">City</label>
        <input
          v-model="form.city"
          type="text"
          placeholder="City"
          class="text-sm w-full border rounded-md px-3 py-2 focus:outline"
        />
      </div>
      <!-- Zip Code -->
      <div>
        <label class="block text-sm font-medium mb-1">Pincode</label>
        <input
          v-model="form.pincode"
          type="text"
          placeholder="Pincode"
          class="text-sm w-full border rounded-md px-3 py-2 focus:outline"
        />
      </div>
      <!-- Customer Type -->
      <div>
        <label class="block text-sm font-medium mb-1">Customer Type</label>
        <select
          v-model="form.customer_type"
          class="text-sm w-full border rounded-md px-3 py-2 focus:outline"
        >
          <option value="residential">Residential</option>
          <option value="commercial" selected>Commercial</option>
        </select>
      </div>

      <!-- Delivery Preference -->
      <div>
        <label class="block text-sm font-medium mb-1">Delivery Preference</label>
        <select
          v-model="form.delivery_preference"
          class="text-sm w-full border rounded-md px-3 py-2 focus:outline"
        >
          <option value="morning" selected>Morning</option>
          <option value="afternoon">Afternoon</option>
          <option value="evening">Evening</option>
          <option value="anytime">Anytime</option>
        </select>
      </div>
    </div>

    <!-- Monthly Subscription -->
    <div>
      <div class="flex items-center mb-2">
        <label class="block text-sm font-medium mr-4">Monthly Subscription</label>
        <div class="flex items-center">
          <div class="flex items-center mr-4">
            <input
              type="radio"
              id="yes"
              v-model="form.monthly_subscription"
              value="true"
              class="mr-1"
              checked
            />
            <label for="yes">Yes</label>
          </div>
          <div class="flex items-center">
            <input
              type="radio"
              id="no"
              v-model="form.monthly_subscription"
              value="false"
              class="mr-1"
            />
            <label for="no">No</label>
          </div>
        </div>
      </div>
    </div>

    <!-- Deposit + Notes -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium mb-1">Deposit Amount (₹)</label>
        <input
          v-model="form.deposit_amount"
          type="number"
          min="0"
          class="text-sm w-full border rounded-md px-3 py-2 focus:outline"
        />
      </div>

      <!-- Status -->
      <div>
        <label class="block text-sm font-medium mb-1">Status</label>
        <select v-model="form.status" class="text-sm w-full border rounded-md px-3 py-2 focus:outline">
          <option value="active" selected>Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>
    </div>
    <!-- Notes -->
    <div>
      <label class="block text-sm font-medium mb-1">Notes</label>
      <textarea
        v-model="form.notes"
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
        {{ form.id ? 'Update Customer' : 'Save Customer' }}
      </button>
    </div>
  </form>
</template>

<script>
import { createCustomer, updateCustomer } from '@/api/customer'

export default {
  props: { customer: Object },
  data() {
    return {
      form: {
        id: null,
        name: '',
        phone: '',
        email: '',
        street_address: '',
        area: '',
        town: '' || 'Viramgam',
        city: '' || 'Ahmedabad',
        pincode: '' || '382150',
        customer_type: '',
        delivery_preference: 'anytime',
        monthly_subscription: true,
        deposit_amount: 0.00,
        status: 'active',
        notes: '',
      },
    }
  },
  watch: {
    customer: {
      immediate: true,
      handler(c) {
        if (c) {
          this.form = { ...this.form, ...c }
        }
      },
    },
  },
  methods: {
    async saveCustomer() {
      try {
        if (this.form.id) {
          await updateCustomer(this.form.id, this.form)
        } else {
          await createCustomer(this.form)
        }
        this.$emit('saved') // notify parent to reload
      } catch (err) {
        console.error('Save failed:', err)
      }
    },
  },
}
</script>
