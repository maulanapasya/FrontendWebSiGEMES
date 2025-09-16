<!-- New Filter Controls Layout -->
<div class="mt-8 bg-blue-100 p-6 rounded-xl shadow-xl">
  <!-- Updated Filter Controls Row -->
  <div class="flex items-center gap-3 mb-6">
    <!-- Search Box with Icon -->
    <div class="flex-1 max-w-md relative">
      <div class="relative">
        <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        <input 
          v-model="searchQuery"
          @input="handleSearch"
          type="text"
          placeholder="Nama penyewa atau nomor invoice"
          class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-black text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>

    <!-- Custom Dropdown for Sort -->
    <div class="relative">
      <div class="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2.5 min-w-[140px] cursor-pointer hover:border-blue-400 transition-colors"
           @click="toggleSortDropdown">
        <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
        </svg>
        <span class="text-black text-sm font-medium">Urutkan</span>
        <span class="text-gray-600 text-sm flex-1">{{ getSortLabel(sortBy) }}</span>
        <svg class="w-4 h-4 text-gray-500 transition-transform" :class="{ 'rotate-180': showSortDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </div>
      
      <!-- Sort Dropdown Menu -->
      <div v-if="showSortDropdown" 
           class="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
        <div class="py-1">
          <div v-for="option in sortOptions" 
               :key="option.value"
               @click="selectSort(option.value)"
               class="px-3 py-2 text-sm text-black hover:bg-blue-50 cursor-pointer"
               :class="{ 'bg-blue-100 font-medium': sortBy === option.value }">
            {{ option.label }}
          </div>
        </div>
      </div>
    </div>

    <!-- Custom Dropdown for Items Per Page -->
    <div class="relative">
      <div class="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2.5 min-w-[180px] cursor-pointer hover:border-blue-400 transition-colors"
           @click="toggleItemsDropdown">
        <span class="text-black text-sm font-medium">Baris per halaman</span>
        <span class="text-gray-600 text-sm flex-1">{{ itemsPerPage }}</span>
        <svg class="w-4 h-4 text-gray-500 transition-transform" :class="{ 'rotate-180': showItemsDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </div>
      
      <!-- Items Per Page Dropdown Menu -->
      <div v-if="showItemsDropdown" 
           class="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
        <div class="py-1">
          <div v-for="option in itemsOptions" 
               :key="option"
               @click="selectItemsPerPage(option)"
               class="px-3 py-2 text-sm text-black hover:bg-blue-50 cursor-pointer"
               :class="{ 'bg-blue-100 font-medium': itemsPerPage === option }">
            {{ option }}
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Button with New Icon -->
    <button 
      @click="openFilterModal"
      class="flex items-center justify-center bg-blue-500 text-white p-2.5 rounded-lg hover:bg-blue-700 transition-colors">
      <!-- Settings/Filter Icon -->
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/>
      </svg>
    </button>
  </div>

  <!-- Rest of the content remains the same -->
  <!-- Rental Data Table -->
  <div class="overflow-x-auto">
    <table class="w-full border-collapse border border-gray-300">
      <!-- Table content remains unchanged -->
    </table>
  </div>
</div>

<script>
// Add these new data properties to your existing data() function:
export default {
  data() {
    return {
      // ... existing data properties ...
      
      // New dropdown states
      showSortDropdown: false,
      showItemsDropdown: false,
      
      // Sort options
      sortOptions: [
        { value: 'newest', label: 'Terbaru' },
        { value: 'oldest', label: 'Terlama' },
        { value: 'name', label: 'Nama Penyewa Urut Abjad' }
      ],
      
      // Items per page options
      itemsOptions: [5, 10, 15, 20]
    };
  },
  
  methods: {
    // ... existing methods ...
    
    // New methods for custom dropdowns
    toggleSortDropdown() {
      this.showSortDropdown = !this.showSortDropdown;
      if (this.showSortDropdown) {
        this.showItemsDropdown = false;
      }
    },
    
    toggleItemsDropdown() {
      this.showItemsDropdown = !this.showItemsDropdown;
      if (this.showItemsDropdown) {
        this.showSortDropdown = false;
      }
    },
    
    selectSort(value) {
      this.sortBy = value;
      this.showSortDropdown = false;
      this.handleSortChange();
    },
    
    selectItemsPerPage(value) {
      this.itemsPerPage = value;
      this.showItemsDropdown = false;
      this.changeItemsPerPage();
    },
    
    getSortLabel(value) {
      const option = this.sortOptions.find(opt => opt.value === value);
      return option ? option.label : 'Terbaru';
    },
    
    // Close dropdowns when clicking outside
    handleClickOutside(event) {
      if (!event.target.closest('.relative')) {
        this.showSortDropdown = false;
        this.showItemsDropdown = false;
      }
    }
  },
  
  mounted() {
    // ... existing mounted logic ...
    
    // Add click outside listener
    document.addEventListener('click', this.handleClickOutside);
  },
  
  beforeUnmount() {
    // Remove click outside listener
    document.removeEventListener('click', this.handleClickOutside);
  }
};
</script>

<style scoped>
/* Add custom dropdown styling */
.relative {
  position: relative;
}

/* Dropdown animations */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
  transform-origin: top;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scaleY(0.9);
}

/* Custom focus states */
.custom-dropdown:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

/* Hover effects */
.custom-dropdown:hover {
  border-color: #60a5fa;
}

/* Icon rotation animation */
.rotate-180 {
  transform: rotate(180deg);
}

/* Transition for smooth interactions */
.transition-colors {
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.transition-transform {
  transition: transform 0.2s ease;
}
</style>