<!-- frontend/src/pages/Customers.vue -->

<template>
  <!-- Header -->
  <div class="flex justify-between items-center mb-6">
    <div>
      <h1 class="text-2xl font-bold">Customer Management</h1>
      <p class="text-gray-500">Manage your customer database</p>
    </div>
    <button
      @click="openForm()"
      class="transition-colors space-x-2 bg-blue-600 text-white px-3 py-2 rounded-md shadow hover:bg-blue-700 font-semibold text-sm"
    >
      <span>+ Add Customer</span>
    </button>
  </div>

  <!-- Stats -->
  <div
    class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 mb-6"
  >
    <!-- Total Customers -->
    <div
      class="rounded-lg border bg-card bg-white text-card-foreground shadow-sm relative overflow-hidden p-6 border border-blue-200"
    >
      <div class="text-2xl font-bold text-gray-950 text-left mb-3">{{ customers.length }}</div>
      <div class="text-sm text-gray-500 text-left">Total Customers</div>
      <div
        class="absolute top-2 right-2 w-28 h-28 transform translate-x-8 -translate-y-8 bg-blue-500 rounded-full opacity-10"
      ></div>
      <i class="fa-regular fa-users absolute top-6 right-5 text-blue-600 text-2xl"></i>
    </div>

    <!-- Active Customers -->
    <div
      class="rounded-lg border bg-card bg-white text-card-foreground shadow-sm relative overflow-hidden p-6 border border-green-200"
    >
      <div class="text-2xl font-bold text-grey-950 text-left mb-3">
        {{ customers.filter((c) => c.status?.toLowerCase() === 'active').length }}
      </div>
      <div class="text-sm text-gray-500 text-left">Active</div>
      <div
        class="absolute top-2 right-2 w-28 h-28 transform translate-x-8 -translate-y-8 bg-green-500 rounded-full opacity-10"
      ></div>
      <i class="fa-regular fa-users absolute top-6 right-5 text-green-600 text-2xl"></i>
    </div>

    <!-- Inactive Customers -->
    <div
      class="rounded-lg border bg-card bg-white text-card-foreground shadow-sm relative overflow-hidden p-6 border border-red-200"
    >
      <div class="text-2xl font-bold text-grey-950 text-left mb-3">
        {{ customers.filter((c) => c.status?.toLowerCase() === 'inactive').length }}
      </div>
      <div class="text-sm text-gray-500 text-left">Inactive</div>
      <div
        class="absolute top-2 right-2 w-28 h-28 transform translate-x-8 -translate-y-8 bg-red-500 rounded-full opacity-10"
      ></div>
      <i class="fa-regular fa-users absolute top-6 right-5 text-red-600 text-2xl"></i>
    </div>

    <!-- Commercial Customers -->
    <div
      class="rounded-lg bg-card bg-white text-card-foreground shadow-sm relative overflow-hidden p-6 border border-orange-200"
    >
      <div class="text-2xl font-bold text-gray-950 text-left mb-3">
        {{ customers.filter((c) => c.customer_type === 'commercial').length }}
      </div>
      <div class="text-sm text-gray-500 text-left">Commercial</div>
      <div
        class="absolute top-2 right-2 w-28 h-28 transform translate-x-8 -translate-y-8 bg-orange-500 rounded-full opacity-10"
      ></div>
      <i class="fa-regular fa-building absolute top-6 right-5 text-orange-600 text-2xl"></i>
    </div>

    <!-- Residential Customers -->
    <div
      class="rounded-lg bg-card bg-white text-card-foreground shadow-sm relative overflow-hidden p-6 border border-pink-200"
    >
      <div class="text-2xl font-bold text-gray-950 text-left mb-3">
        {{ customers.filter((c) => c.customer_type === 'residential').length }}
      </div>
      <div class="text-sm text-gray-500 text-left">Residential</div>
      <div
        class="absolute top-2 right-2 w-28 h-28 transform translate-x-8 -translate-y-8 bg-pink-500 rounded-full opacity-10"
      ></div>
      <i class="fa-regular fa-house absolute top-6 right-5 text-pink-600 text-2xl"></i>
    </div>
  </div>

  <!-- Search + Filters + View Toggle -->
  <div class="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-md bg-white shadow">
    <input
      v-model="search"
      type="text"
      placeholder="Search customers by name, phone, or email..."
      class="text-base flex-1 border px-3 py-2 rounded-lg focus:outline"
    />
    <i class="fa-regular fa-filter text-blue-700"></i>

    <select v-model="filters.status" class="text-sm border px-3 py-2 rounded-lg focus:outline cursor-pointer">
      <option value="">All Status</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
      <option value="suspended">Suspended</option>
    </select>

    <select v-model="filters.type" class="text-sm border px-3 py-2 rounded-lg focus:outline cursor-pointer">
      <option value="">All Types</option>
      <option value="residential">Residential</option>
      <option value="commercial">Commercial</option>
    </select>

    <select v-model="filters.area" class="text-sm border px-3 py-2 rounded-lg focus:outline cursor-pointer">
      <option value="">All Areas</option>
      <option
        v-for="area in Array.from(new Set(customers.map((c) => c.area))).filter((a) => a)"
        :key="area"
        :value="area"
      >
        {{ area }}
      </option>
    </select>

    <button
      @click="clearFilters"
      class="text-sm border px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
    >
      Clear
    </button>

    <!-- View Toggle -->
    <div class="flex items-center ml-auto space-x-2">
      <button
        @click="viewMode = 'grid'"
        :class="['border px-3 py-2 rounded-lg flex items-center space-x-1', viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100']"
      >
        <i class="fa-solid fa-th-large text-lg"></i>
        <!-- <span class="hidden sm:inline">Grid</span> -->
      </button>
      <button
        @click="viewMode = 'list'"
        :class="['border px-3 py-2 rounded-lg flex items-center space-x-1', viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100']"
      >
        <i class="fa-solid fa-list text-lg"></i>
        <!-- <span class="hidden sm:inline">List</span> -->
      </button>
    </div>
  </div>

  <!-- Customer Grid View -->
  <div v-if="viewMode === 'grid'" class="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    <div
      v-for="c in filteredCustomers"
      :key="c.id"
      class="bg-white rounded-lg shadow p-5 relative"
      :class="{ 'border border-blue-500': c.monthly_subscription === true }"
    >
      <!-- Edit/Delete -->
      <div class="absolute top-3 right-3 flex space-x-3">
        <button @click="openForm(c)" class="text-gray-500 hover:text-green-600">
          <i class="fa-regular fa-pen-to-square"></i>
        </button>
        <button @click="confirmDelete(c.id)" class="text-red-400 hover:text-red-500">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </div>

      <!-- Header -->
      <div class="flex items-center space-x-3 mb-2">
        <div class="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100">
          <span v-if="c.customer_type === 'residential'">
            <i class="fa-regular fa-house text-blue-600"></i>
          </span>
          <span v-else>
            <i class="fa-regular fa-building text-blue-600"></i>
          </span>
        </div>
        <div>
          <h3 class="font-semibold capitalize">{{ c.name }}</h3>
          <span
            :class="[ 
              'text-xs px-2 py-1 rounded-full',
              c.status?.toLowerCase() === 'active'
                ? 'bg-green-100 text-green-600 font-semibold'
                : c.status?.toLowerCase() === 'inactive'
                ? 'bg-red-100 text-red-600 font-semibold'
                : 'bg-gray-200 text-gray-600 font-semibold',
            ]"
          >
            {{ c.status }}
          </span>
        </div>
      </div>

      <!-- Details -->
      <div class="text-md text-gray-600">
        <div class="mb-2"><i class="fa-regular fa-phone"></i> {{ c.phone }}</div>
        <div class="mb-2"><i class="fa-regular fa-envelope"></i> {{ c.email }}</div>
        <div class="mb-2">
          <i class="fa-regular fa-location-dot"></i> {{ c.street_address }}, {{ c.town }} ,
          {{ c.city }}, {{ c.pincode }}
        </div>
        <div v-if="c.area" class="text-blue-600 font-medium">{{ c.area }}</div>
        <div class="pt-3 mt-4 border-t font-semibold">
          Security Deposit: ₹{{ c.deposit_amount }}
        </div>
        <div v-if="c.notes" class="mt-2 italic text-gray-500">
          {{ c.notes }}
        </div>
      </div>
    </div>
  </div>

  <!-- Customer List View -->
  <div v-else class="bg-white rounded-lg shadow overflow-hidden">
    <!-- Table Header -->
    <div class="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-gray-600 font-semibold text-sm">
      <div class="col-span-4">Customer</div>
      <div class="col-span-2">Type</div>
      <div class="col-span-2">Status</div>
      <div class="col-span-3">Location</div>
      <div class="col-span-1 text-right">Actions</div>
    </div>

    <!-- Customer Rows -->
    <div
      v-for="c in filteredCustomers"
      :key="c.id"
      class="grid grid-cols-12 gap-4 items-center px-6 py-4 border-t hover:bg-gray-50 transition"
    >
      <!-- Customer Info -->
      <div class="col-span-4 flex items-center space-x-3">
        <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
          {{ c.name?.charAt(0).toUpperCase() }}
        </div>
        <div>
          <p class="font-semibold capitalize">{{ c.name }}</p>
          <p class="text-sm text-gray-500">{{ c.phone }}</p>
        </div>
      </div>

      <!-- Type -->
      <div class="col-span-2 capitalize text-sm">
        {{ c.customer_type || '—' }}
      </div>

      <!-- Status -->
      <div class="col-span-2">
        <span
          :class="[ 
            'text-xs px-2 py-1 rounded-full',
            c.status?.toLowerCase() === 'active'
              ? 'bg-green-100 text-green-600 font-semibold'
              : c.status?.toLowerCase() === 'inactive'
              ? 'bg-red-100 text-red-600 font-semibold'
              : 'bg-gray-200 text-gray-600 font-semibold',
          ]"
        >
          {{ c.status }}
        </span>
      </div>

      <!-- Location -->
      <div class="col-span-3 text-sm text-gray-600 capitalize">
        {{ c.street_address }}, <span class="text-blue-500"> {{ c.area }} </span> , <br />{{ c.town }} {{ c.city }}, {{ c.pincode }}
      </div>

      <!-- Actions -->
      <div class="col-span-1 flex justify-end space-x-3">
        <button @click="openForm(c)" class="text-gray-500 hover:text-green-600">
          <i class="fa-regular fa-pen-to-square"></i>
        </button>
        <button @click="confirmDelete(c.id)" class="text-red-400 hover:text-red-500">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </div>
    </div>
  </div>

  <!-- No Customers -->
  <div v-if="filteredCustomers.length === 0" class="p-6 text-center text-gray-500">
    No customers found.
  </div>

  <!-- Add/Edit Modal -->
  <div
    v-if="showForm"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
      <h2 class="text-2xl font-semibold mb-4">
        <i class="fa-regular fa-user"></i>
        {{ editingCustomer ? 'Edit Customer' : 'Add New Customer' }}
      </h2>
      <CustomerForm :customer="editingCustomer" @saved="handleSaved" @cancel="closeForm" />
    </div>
  </div>

  <!-- Delete Confirmation -->
  <div
    v-if="deleteId"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
      <h2 class="text-lg font-semibold mb-4">Confirm Delete</h2>
      <p class="mb-6 text-gray-600">Are you sure you want to delete this customer?</p>
      <div class="flex justify-end space-x-3">
        <button @click="deleteId = null" class="px-3 py-2 rounded-md border text-sm font-semibold hover:bg-gray-100 transition-colors">
          Cancel
        </button>
        <button
          @click="deleteCustomer(deleteId)"
          class="text-white px-3 py-2 rounded-md text-sm font-semibold bg-red-600 hover:bg-red-700 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { getCustomers, deleteCustomer } from '@/api/customer'
import CustomerForm from '@/components/customers/CustomerForm.vue'

export default {
  components: { CustomerForm },
  data() {
    return {
      search: '',
      filters: {
        status: '',
        type: '',
        area: '',
      },
      showForm: false,
      editingCustomer: null,
      deleteId: null,
      customers: [], // now empty, will be filled from DB
      viewMode: 'grid', // 👈 added for toggle
    }
  },
  computed: {
    filteredCustomers() {
      return this.customers.filter((c) => {
        const matchesSearch =
          !this.search ||
          c.name.toLowerCase().includes(this.search.toLowerCase()) ||
          c.phone.includes(this.search) ||
          (c.email && c.email.toLowerCase().includes(this.search.toLowerCase()))

        const matchesStatus = !this.filters.status || c.status === this.filters.status
        const matchesType =
          !this.filters.type || c.customer_type === this.filters.type?.toLowerCase()
        const matchesArea = !this.filters.area || c.area === this.filters.area

        return matchesSearch && matchesStatus && matchesType && matchesArea
      })
    },
  },
  methods: {
    async fetchCustomers() {
      try {
        const { data } = await getCustomers()
        this.customers = data.sort((a, b) => (a.created_date < b.created_date ? 1 : -1))
      } catch (err) {
        console.error('Failed to fetch customers:', err)
      }
    },
    openForm(customer = null) {
      this.editingCustomer = customer
      this.showForm = true
    },
    closeForm() {
      this.showForm = false
      this.editingCustomer = null
    },
    async handleSaved() {
      this.showForm = false
      this.editingCustomer = null
      await this.fetchCustomers()
    },
    confirmDelete(id) {
      this.deleteId = id
    },
    async deleteCustomer(id) {
      try {
        await deleteCustomer(id)
        await this.fetchCustomers()
        this.deleteId = null
      } catch (err) {
        console.error('Delete failed:', err)
      }
    },
    clearFilters() {
      this.filters = { status: '', type: '', area: '' }
      this.search = ''
    },
  },
  mounted() {
    this.fetchCustomers()
  },
}
</script>
