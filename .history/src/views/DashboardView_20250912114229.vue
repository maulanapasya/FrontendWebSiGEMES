<template>
  <div>
    <Navigation />
    <div class="container mt-6 mx-auto px-6 py-8">
      <!-- Header & Export Button -->
      <div class="flex justify-between items-center">
        <h1 id="dashboard-header" class="text-3xl font-black text-black">Dashboard</h1>
        <button 
          @click="openExportModal"
          id="export-report-button" 
          class="font-bold bg-blue-500 text-white px-5 py-2 text-sm rounded-lg hover:bg-blue-700">
          Ekspor Laporan Keuangan
        </button>
      </div>

      <!-- Income Statistics -->
      <div class="flex flex-wrap gap-4 mt-6">
        <div class="bg-blue-100 p-6 rounded-xl shadow-lg flex-1">
          <p class="text-gray-800">
            <span v-if="loadingRevenue" class="skeleton-loader inline-block w-64 h-5 rounded"></span>
            <span v-else>Pendapatan <span class="font-bold">{{ currentDayText }}</span></span>
          </p>
          <h2 class="revenue text-3xl text-black">
            <span v-if="loadingRevenue" class="skeleton-loader inline-block w-48 h-9 rounded"></span>
            <span v-else class="font-black">{{ formatCurrency(dailyRevenue) }}</span>
          </h2>
        </div>
        <div class="bg-blue-100 p-6 rounded-xl shadow-lg flex-1">
          <p class="text-gray-800">
            <span v-if="loadingRevenue" class="skeleton-loader inline-block w-56 h-5 rounded"></span>
            <span v-else>Pendapatan bulan <span class="font-bold">{{ currentMonthText }}</span></span>
          </p>
          <h2 class="revenue text-3xl text-black font-bold">
            <span v-if="loadingRevenue" class="skeleton-loader inline-block w-48 h-9 rounded"></span>
            <span v-else class="font-black">{{ formatCurrency(monthlyRevenue) }}</span>
          </h2>
        </div>
        <div class="bg-blue-100 p-6 rounded-xl shadow-lg flex-1">
          <p class="text-gray-800">
            <span v-if="loadingRevenue" class="skeleton-loader inline-block w-52 h-5 rounded"></span>
            <span v-else>Total pendapatan tahun <span class="font-bold">{{ currentYear }}</span></span>
          </p>
          <h2 class="revenue text-3xl text-black font-bold">
            <span v-if="loadingRevenue" class="skeleton-loader inline-block w-48 h-9 rounded"></span>
            <span v-else class="font-black">{{ formatCurrency(annualRevenue) }}</span>
          </h2>
        </div>
      </div>

      <!-- New Filter Controls Layout -->
      <div class="mt-8 bg-blue-100 p-6 rounded-xl shadow-xl">
        <!-- Updated Filter Controls Row -->
        <div class="flex justify-center items-center gap-3 mb-6">
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

        <!-- Active Filters Display -->
        <div v-if="activeFilters().length > 0" class="mt-4 mb-4">
          <div class="flex justify-center flex-wrap gap-2">
            <div 
              v-for="filter in activeFilters()" 
              :key="filter.key"
              class="inline-flex items-center rent-column bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium"
            >
              <span>{{ filter.label }}</span>
              <button 
                @click="removeFilter(filter.key)"
                class="ml-2 text-white hover: font-bold text-lg leading-none"
                title="Hapus filter"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <!-- Rental Data Table -->
        <div class="overflow-x-auto">
          <table class="w-full border-collapse border border-gray-300">
            <thead>
              <tr class="bg-blue-500 text-black">
                <th class="rent-column py-3 px-4 border border-gray-300 text-center font-bold w-16 text-white">No</th>
                <th class="rent-column py-3 px-4 border border-gray-300 text-center font-bold w-32 text-white">Penyewa</th>
                <th class="rent-column py-3 px-4 border border-gray-300 text-center font-bold w-40 text-white">Jenis Sewa</th>
                <th class="rent-column py-3 px-4 border border-gray-300 text-center font-bold w-48 text-white">Mulai Sewa</th>
                <th class="rent-column py-3 px-4 border border-gray-300 text-center font-bold w-48 text-white">Selesai Sewa</th>
                <th class="rent-column py-3 px-4 border border-gray-300 text-center font-bold w-24 text-white">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoading" class="bg-white">
                <td colspan="6" class="py-4 text-center border border-gray-300">
                  <span class="loading-text text-black">Memuat data...</span>
                </td>
              </tr>
              <tr v-else-if="errorMessage" class="bg-white">
                <td colspan="6" class="py-4 text-center text-red-500 border border-gray-300">{{ errorMessage }}</td>
              </tr>
              <template v-else>
                <tr v-for="(rental, index) in paginatedRentals" :key="rental.id" class="bg-white text-black border-b border-gray-200">
                  <td class="py-3 px-4 border border-gray-300 text-center rent-column">{{ getRowNumber(index) }}</td>
                  <td class="py-3 px-4 border border-gray-300 rent-column">{{ rental.renterName || 'Memuat...' }}</td>
                  <td class="py-3 px-4 border border-gray-300 rent-column">{{ getRentType(rental) }}</td>
                  <td class="py-3 px-4 border border-gray-300 rent-column">{{ formatDate(rental.start_date) }}</td>
                  <td class="py-3 px-4 border border-gray-300 rent-column">{{ formatDate(rental.end_date) }}</td>
                  <td class="py-3 px-4 border border-gray-300 text-center rent-column">
                    <button 
                      @click="showRentalDetail(rental.id)" 
                      class="text-blue-500 hover:text-blue-700 font-bold"
                      :disabled="loadingDetailId === rental.id">
                      {{ loadingDetailId === rental.id ? 'Loading...' : 'Detail' }}
                    </button>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Page Indicator -->
        <div class="text-center mt-4 mb-2" v-if="!isLoading && !errorMessage && totalPages > 1">
          <span class="text-black text-sm">
            Menampilkan halaman <span class="font-bold">{{ currentPage }}</span> dari total <span class="font-bold">{{ totalPages }}</span> halaman
          </span>
        </div>

        <!-- Custom Pagination -->
        <div class="flex justify-center mt-3" v-if="!isLoading && !errorMessage && totalPages > 1">
          <div class="pagination-container">
            <!-- First Page Button -->
            <button 
              @click="goToPage(1)"
              :disabled="currentPage === 1"
              :class="['pagination-btn', 'pagination-nav-text', currentPage === 1 ? 'disabled' : '']"
              title="Halaman Pertama">
              &lt;&lt; Halaman Pertama
            </button>

            <!-- Previous Button -->
            <button 
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              :class="['pagination-btn', 'pagination-nav', currentPage === 1 ? 'disabled' : '']"
              title="Halaman Sebelumnya">
              &#8249;
            </button>

            <!-- Page Numbers -->
            <button 
              v-for="page in visiblePages" 
              :key="'page-' + page"
              @click="typeof page === 'number' ? goToPage(page) : openPageJumpModal()"
              :class="['pagination-btn', page === currentPage ? 'active' : '', typeof page === 'string' ? 'dots' : '']">
              {{ page }}
            </button>

            <!-- Next Button -->
            <button 
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              :class="['pagination-btn', 'pagination-nav', currentPage === totalPages ? 'disabled' : '']"
              title="Halaman Selanjutnya">
              &#8250;
            </button>

            <!-- Last Page Button -->
            <button 
              @click="goToPage(totalPages)"
              :disabled="currentPage === totalPages"
              :class="['pagination-btn', 'pagination-nav-text', currentPage === totalPages ? 'disabled' : '']"
              title="Halaman Terakhir">
              Halaman Terakhir &gt;&gt;
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Modal -->
    <transition name="modal">
      <div v-if="showFilterModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click="closeFilterModal">
        <div class="bg-blue-100 rounded-lg max-w-lg max-h-[90vh] overflow-hidden" @click.stop>
          <h2 class="rent-column text-2xl font-bold text-black text-center mb-6 p-6 pb-0">Filter Berdasarkan</h2>
          
          <div class="relative z-50 px-6 pb-6 max-h-[calc(90vh-120px)] overflow-y-auto">
            <!-- Date Range -->
            <div class="mb-4">
              <h3 class="rent-column font-bold text-black mb-3">Rentang Tanggal</h3>
              
              <!-- All Dates Checkbox -->
              <div class="mb-3">
                <label class="flex items-center cursor-pointer">
                  <input 
                    v-model="filterAllDates"
                    @change="handleAllDatesToggle"
                    type="checkbox"
                    class="mr-2"
                  />
                  <span class="text-black rent-column font-medium">Semua Tanggal</span>
                </label>
              </div>

              <!-- Date Range Picker - Always visible, but disabled when "Semua Tanggal" is checked -->
              <div class="mb-3">
                <VueDatePicker
                  v-model="dateRange"
                  range
                  :enable-time-picker="false"
                  :format="'dd/MM/yyyy'"
                  placeholder="Pilih rentang tanggal"
                  :clearable="true"
                  auto-apply
                  @update:model-value="handleDateRangeChange"
                  :disabled="filterAllDates"
                  :class="{ 'opacity-50 cursor-not-allowed': filterAllDates }"
                  class="w-full"
                />
              </div>

              <!-- Petunjuk -->
              <div v-if="filterAllDates" class="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p class="text-sm rent-column text-yellow-800 font-medium">
                  Kosongi ceklis 'Semua Tanggal' untuk memilih rentang tanggal tertentu.
                </p>
              </div>

              <!-- Date Range Validation Error Message -->
              <div v-if="dateRangeValidationError" class="mb-3">
                <p class="text-red-500 rent-column text-sm font-bold">{{ dateRangeValidationError }}</p>
              </div>
            </div>

            <!-- Jenis Sewa -->
            <div class="mb-4">
              <h3 class="rent-column font-bold text-black mb-3">Jenis Sewa</h3>
              <div class="relative">
                <div class="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2.5 cursor-pointer hover:border-blue-400 transition-colors"
                    @click="toggleRentalTypeDropdown">
                  <span class="text-gray-600 text-sm flex-1">{{ getRentalTypeLabel() }}</span>
                  <svg class="w-4 h-4 text-gray-500 transition-transform" :class="{ 'rotate-180': showRentalTypeDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
                
                <!-- Rental Type Dropdown Menu -->
                <div v-if="showRentalTypeDropdown" 
                    class="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  <div class="py-1">
                    <div v-for="option in rentalTypeOptions" 
                        :key="option.value"
                        @click="selectRentalType(option.value)"
                        class="px-3 py-2 text-sm text-black hover:bg-blue-50 cursor-pointer"
                        :class="{ 'bg-blue-100 font-medium': filterRentalType === option.value }">
                      {{ option.label }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Payment Status - Updated with "Semua" logic -->
            <div class="mb-4">
              <h3 class="rent-column font-bold text-black mb-3">Status Pembayaran</h3>
              <div class="space-y-2">
                <!-- Semua Checkbox -->
                <label class="flex items-center rent-column cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input 
                    type="checkbox" 
                    v-model="filterAllPaymentStatuses"
                    @change="handleAllPaymentStatusToggle"
                    class="mr-2"
                  />
                  <span class="text-black text-sm font-medium">Semua</span>
                </label>
                
                <!-- Individual Status Checkboxes -->
                <label v-for="option in paymentStatusOptionsForCheckbox" 
                      :key="option.value" 
                      class="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
                      :class="{ 'opacity-50 cursor-not-allowed': filterAllPaymentStatuses }">
                  <input 
                    type="checkbox" 
                    v-model="selectedPaymentStatuses"
                    :value="option.value"
                    :disabled="filterAllPaymentStatuses"
                    @change="handleIndividualPaymentStatusChange"
                    class="mr-2"
                  />
                  <span class="text-black rent-column text-sm" :class="{ 'text-gray-400': filterAllPaymentStatuses }">{{ option.label }}</span>
                </label>

                <div v-if="filterAllPaymentStatuses" class="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p class="text-sm rent-column text-yellow-800 font-medium">
                    Kosongi ceklis 'Semua' untuk memilih status pembayaran tertentu.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex justify-center gap-4 p-6 pt-0">
            <button 
              @click="applyFilters"
              class="rent-column bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
              Simpan
            </button>
            <button 
              @click="closeFilterModal"
              class="rent-column bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
              Batal
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal Detail Penyewaan -->
    <transition name="modal">
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click="closeModal">
        <div class="bg-gray-100 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden" @click.stop>
          <!-- Modal Header -->
          <div class="relative flex justify-center items-center p-4 border-b border-gray-300">
            <h1 class="rent-column text-xl font-bold text-black">Detail Penyewaan</h1>
            <button @click="closeModal" class="absolute right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold">
              ×
            </button>
          </div>

          <!-- Modal Content - Scrollable -->
          <div class="overflow-y-auto p-4" style="max-height: calc(90vh - 80px);">
            <div v-if="rentalDetail" class="space-y-3">
              <!-- Basic Information -->
              <div class="space-y-3">
                <!-- No. Invoice -->
                <div class="flex">
                  <span class="text-gray-600 w-48 text-sm">No. Invoice</span>
                  <span class="text-gray-600 w-4 text-sm">:</span>
                  <span class="font-medium text-black flex-1 text-sm">{{ rentalDetail.payment?.id || '-' }}</span>
                </div>

                <!-- Jenis Sewa -->
                <div class="flex">
                  <span class="text-gray-600 w-48 text-sm">Jenis Sewa</span>
                  <span class="text-gray-600 w-4 text-sm">:</span>
                  <span class="font-medium text-black flex-1 text-sm">{{ getRentalType(rentalDetail) }}</span>
                </div>

                <!-- Nama Ruang & Tipe Ruang (Only for Gedung Mess) -->
                <template v-if="rentalDetail.guesthouse_room_pricing">
                  <!-- Nama Ruang -->
                  <div class="flex" v-if="getRoomName(rentalDetail)">
                    <span class="text-gray-600 w-48 text-sm">Nama Ruang</span>
                    <span class="text-gray-600 w-4 text-sm">:</span>
                    <span class="font-medium text-black flex-1 text-sm">{{ getRoomName(rentalDetail) }}</span>
                  </div>

                  <!-- Tipe Ruang -->
                  <div class="flex" v-if="getRoomType(rentalDetail)">
                    <span class="text-gray-600 w-48 text-sm">Tipe Ruang</span>
                    <span class="text-gray-600 w-4 text-sm">:</span>
                    <span class="font-medium text-black flex-1 text-sm flex items-center">
                      <!-- VIP Type - Icon Only -->
                      <img 
                        v-if="getRoomType(rentalDetail).toLowerCase() === 'vip'" 
                        src="@/assets/vipclass.png" 
                        alt="VIP" 
                        class="h-5 w-auto object-contain"
                      />
                      <!-- Standard Type - Icon Only -->
                      <img 
                        v-else-if="getRoomType(rentalDetail).toLowerCase() === 'standard'" 
                        src="@/assets/standardclass.png" 
                        alt="Standard" 
                        class="h-5 w-auto object-contain"
                      />
                      <!-- Other Types - Text Only -->
                      <span v-else class="text-sm">{{ formatRoomTypeDisplay(getRoomType(rentalDetail)) }}</span>
                    </span>
                  </div>
                </template>

                <!-- Nama Penyewa -->
                <div class="flex">
                  <span class="text-gray-600 w-48 text-sm">Nama Penyewa</span>
                  <span class="text-gray-600 w-4 text-sm">:</span>
                  <span class="font-medium text-black flex-1 text-sm">{{ rentalDetail.renter?.fullname || '-' }}</span>
                </div>

                <!-- Email -->
                <div class="flex">
                  <span class="text-gray-600 w-48 text-sm">Email</span>
                  <span class="text-gray-600 w-4 text-sm">:</span>
                  <span class="font-medium text-black flex-1 text-sm">{{ rentalDetail.renter?.email || '-' }}</span>
                </div>

                <!-- Jenis Kelamin -->
                <div class="flex">
                  <span class="text-gray-600 w-48 text-sm">Jenis Kelamin</span>
                  <span class="text-gray-600 w-4 text-sm">:</span>
                  <span class="font-medium text-black flex-1 text-sm">{{ translateGender(rentalDetail.renter?.gender) }}</span>
                </div>

                <!-- Slot yang Dipakai -->
                <div class="flex">
                  <span class="text-gray-600 w-48 text-sm">Slot yang Dipakai</span>
                  <span class="text-gray-600 w-4 text-sm">:</span>
                  <span class="font-medium text-black flex-1 text-sm">{{ rentalDetail.slot || '-' }}</span>
                </div>
                
                <!-- Conditional field based on rental type -->
                <div class="flex" v-if="rentalDetail.guesthouse_room_pricing">
                  <span class="text-gray-600 w-48 text-sm">Jenis Retribusi</span>
                  <span class="text-gray-600 w-4 text-sm">:</span>
                  <span class="font-medium text-black flex-1 text-sm">{{ rentalDetail.guesthouse_room_pricing.retribution_type || '-' }}</span>
                </div>
                <div class="flex" v-if="rentalDetail.city_hall_pricing">
                  <span class="text-gray-600 w-48 text-sm">Tipe Sewa</span>
                  <span class="text-gray-600 w-4 text-sm">:</span>
                  <span class="font-medium text-black flex-1 text-sm">{{ rentalDetail.city_hall_pricing.activity_type || '-' }}</span>
                </div>
                <div class="flex">
                  <span class="text-gray-600 w-48 text-sm">Tanggal Pesanan Dibuat</span>
                  <span class="text-gray-600 w-4 text-sm">:</span>
                  <span class="font-medium text-black flex-1 text-sm">{{ formatDateTime(rentalDetail.created_at) }}</span>
                </div>
                <div class="flex">
                  <span class="text-gray-600 w-48 text-sm">Tanggal Pesanan Diperbarui</span>
                  <span class="text-gray-600 w-4 text-sm">:</span>
                  <span class="font-medium text-black flex-1 text-sm">{{ formatDateTime(rentalDetail.updated_at) }}</span>
                </div>
                <div class="flex">
                  <span class="text-gray-600 w-48 text-sm">Waktu Tanggal Sewa</span>
                  <span class="text-gray-600 w-4 text-sm">:</span>
                  <span class="font-medium text-black flex-1 text-sm">{{ formatDateTime(rentalDetail.start_date) }}</span>
                </div>
                <div class="flex">
                  <span class="text-gray-600 w-48 text-sm">Tanggal Selesai Sewa</span>
                  <span class="text-gray-600 w-4 text-sm">:</span>
                  <span class="font-medium text-black flex-1 text-sm">{{ formatDateTime(rentalDetail.end_date) }}</span>
                </div>
              </div>

              <!-- Payment Details Section in White Box -->
              <div class="mt-6 bg-white rounded-lg p-4 shadow-sm">
                <h3 class="text-lg font-bold text-black mb-4 text-center">Rincian Pembayaran</h3>
                <div class="space-y-3">
                  <div class="flex">
                    <span class="text-gray-600 w-48 text-sm">Metode Pembayaran</span>
                    <span class="font-medium text-black flex-1 text-right text-sm">{{ translatePaymentMethod(rentalDetail.payment?.method) }}</span>
                  </div>
                  <div class="flex">
                    <span class="text-gray-600 w-48 text-sm">Status Pembayaran</span>
                    <span class="font-medium text-black flex-1 text-right text-sm">{{ translatePaymentStatus(rentalDetail.payment?.status) }}</span>
                  </div>
                  <div class="flex">
                    <span class="text-gray-600 w-48 text-sm">Waktu Pembayaran Dibuat</span>
                    <span class="font-medium text-black flex-1 text-right text-sm">{{ formatDateTime(rentalDetail.payment?.payment_triggered_at) }}</span>
                  </div>
                  <div class="flex">
                    <span class="text-gray-600 w-48 text-sm">Waktu Pembayaran Dikonfirmasi</span>
                    <span class="font-medium text-black flex-1 text-right text-sm">{{ formatDateTime(rentalDetail.payment?.payment_confirmed_at) }}</span>
                  </div>
                  <div class="flex pt-3 border-t border-gray-300">
                    <span class="text-base font-bold text-black w-48">Total Jumlah Dibayar</span>
                    <span class="text-base font-bold text-black flex-1 text-right">{{ formatCurrency(rentalDetail.payment?.amount) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Loading state for modal -->
            <div v-else class="text-center py-8">
              <span class="loading-text text-gray-600">Memuat detail...</span>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal Export Laporan Keuangan -->
    <transition name="modal">
      <div v-if="showExportModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click="closeExportModal">
        <div class="bg-blue-100 rounded-lg max-w-2xl w-full p-6" @click.stop>
          <!-- Modal Header -->
          <h2 class="rent-column text-2xl font-bold text-black text-center mb-6">Ekspor Laporan Keuangan</h2>
          
          <!-- Building Type Selection -->
          <div class="grid grid-cols-2 gap-6 mb-6">
            <!-- Gedung Nasional -->
            <div>
              <h3 class="rent-column font-bold text-black mb-3">Gedung Nasional</h3>
              <div v-if="loadingCityHalls" class="text-gray-500">
              <span class="loading-text">Memuat data gedung...</span>
              </div>
              <div v-else-if="cityHallsList.length === 0" class="text-gray-500">
              Tidak ada data gedung nasional
              </div>
              <div v-else class="space-y-2 max-h-40 overflow-y-auto border border-gray-400 rounded-lg p-3">
              <label v-for="hall in cityHallsList" :key="hall.id" class="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                <input 
                type="checkbox" 
                v-model="selectedCityHalls"
                :value="hall.id"
                class="mr-2"
                >
                <span class="rent-column text-sm text-gray-900">{{ hall.name }}</span>
              </label>
              </div>
            </div>

            <!-- Gedung Mess -->
            <div>
              <h3 class="rent-column font-bold text-black mb-3">Gedung Mess</h3>
              <div v-if="loadingGuesthouses" class="text-gray-500">
              <span class="loading-text">Memuat data gedung...</span>
              </div>
              <div v-else-if="guesthousesList.length === 0" class="rent-column text-gray-500">
              Tidak ada data gedung mess
              </div>
              <div v-else class="space-y-2 max-h-40 overflow-y-auto border border-gray-400 rounded-lg p-3">
              <label v-for="guesthouse in guesthousesList" :key="guesthouse.id" class="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                <input 
                type="checkbox" 
                v-model="selectedGuesthouses"
                :value="guesthouse.id"
                class="mr-2"
                >
                <span class="rent-column text-sm text-gray-900">{{ guesthouse.name }}</span>
              </label>
              </div>
            </div>
          </div>

          <!-- Month and Year Selection -->
          <div class="mb-6">
            <h3 class="rent-column font-bold text-black mb-3">Pilih keuangan bulanan yang akan diekspor</h3>
            <div class="flex items-center space-x-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <input 
                type="month" 
                v-model="exportMonth"
                class="text-black flex-1 p-3 border border-gray-300 rounded-lg"
                :max="currentYearMonth"
              >
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-center space-x-4">
            <button 
              @click="exportToExcel"
              :disabled="(!selectedCityHalls.length && !selectedGuesthouses.length) || !exportMonth || isExporting"
              class="rent-column bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
            >
              <svg v-if="!isExporting" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <svg v-else class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isExporting ? 'Mengekspor...' : 'Ekspor ke Excel' }}
            </button>
            <button 
              @click="closeExportModal"
              class="rent-column bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios';
import Navigation from '@/components/Navigation.vue';
import ExcelJS from 'exceljs';
// import * as XLSX from 'xlsx';

// Import Vue Datepicker
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

export default {
  name: 'DashboardView',
  components: {
    Navigation,
    VueDatePicker,
  },
  data() {
    return {
      rentals: [],
      allRentals: [],
      isLoading: false,
      errorMessage: '',

      // New dropdown states
      showSortDropdown: false,
      showItemsDropdown: false,

      // Opsi untuk checkbox status pembayaran
      paymentStatusOptionsForCheckbox: [
        { value: 'pending', label: 'Pending' },
        { value: 'gagal', label: 'Gagal' },
        { value: 'dibayar', label: 'Dibayar' }
      ],
      selectedPaymentStatuses: [], // Array untuk menyimpan status pembayaran yang dipilih
      filterAllPaymentStatuses: true, // Default: semua status pembayaran dipilih
      
      rentalTypeOptions: [
        { value: '', label: 'Semua' },
        { value: 'guesthouse', label: 'Gedung Mess' },
        { value: 'city_hall', label: 'Gedung Nasional' }
      ],
      
      // dropdown states for filter modal
      showPaymentStatusDropdown: false,
      showRentalTypeDropdown: false,
      showRoomTypeDropdown: false,
      showRetributionDropdown: false,
      showActivityTypeDropdown: false,
      
      // Sort options
      sortOptions: [
        { value: 'newest', label: 'Terbaru' },
        { value: 'oldest', label: 'Terlama' },
        { value: 'name', label: 'Nama Penyewa Urut Abjad' }
      ],
      
      // Items per page options
      itemsOptions: [10, 15, 20],
      
      // New filter properties
      searchQuery: '',
      sortBy: 'newest',
      searchTimeout: null,
      
      // Filter modal properties (what's being set in the modal)
      showFilterModal: false,
      filterAllDates: true, // Default to "Semua Tanggal"
      filterStartDate: '',
      filterEndDate: '',
      filterRentalType: '',
      filterRoomType: '',
      filterRetribution: '',
      filterActivityType: '',
      
      // Applied filters (what actually affects the data display)
      appliedFilterAllDates: true,
      appliedFilterStartDate: '',
      appliedFilterEndDate: '',
      appliedFilterRentalType: '',
      appliedSelectedPaymentStatuses: [],
      
      // Date picker options
      useVueDatepicker: true, // Toggle between Vue Datepicker and native inputs
      dateRange: null, // For Vue Datepicker range
      
      // Validation error message for date range
      dateRangeValidationError: '',
      
      // Existing properties
      currentPage: 1,
      itemsPerPage: 10,
      totalData: 0,
      totalPages: 0,
      showModal: false,
      rentalDetail: null,
      loadingDetailId: null,
      showPageJumpModal: false,
      pageJumpInput: null,
      // Revenue data
      dailyRevenue: 0,
      monthlyRevenue: 0,
      annualRevenue: 0,
      loadingRevenue: true,
      currentDayText: '',
      currentMonthText: '',
      currentYear: '',
      // Export modal data
      showExportModal: false,
      cityHallsList: [],
      guesthousesList: [],
      selectedCityHalls: [],
      selectedGuesthouses: [],
      exportMonth: '',
      loadingCityHalls: false,
      loadingGuesthouses: false,
      isExporting: false,
      currentYearMonth: ''
    };
  },
  computed: {
    visiblePages() {
      const pages = [];
      const total = this.totalPages;
      const current = this.currentPage;
      
      if (total <= 7) {
        // Show all pages if total is 7 or less
        for (let i = 1; i <= total; i++) {
          pages.push(i);
        }
      } else {
        // Always show 5 pages including current page
        let pagesToShow = [];
        
        // If current page is in the first 5 pages
        if (current <= 5) {
          for (let i = 1; i <= 5; i++) {
            pagesToShow.push(i);
          }
          // Add dots if there are more pages
          if (total > 5) {
            pagesToShow.push('...');
          }
        } 
        // If current page is in the last 5 pages
        else if (current > total - 5) {
          // Add dots at the beginning
          pagesToShow.push('...');
          for (let i = total - 4; i <= total; i++) {
            pagesToShow.push(i);
          }
        }
        // Current page is in the middle
        else {
          // Add dots at the beginning
          pagesToShow.push('...');
          // Show current page and 2 pages before and after
          for (let i = current - 2; i <= current + 2; i++) {
            pagesToShow.push(i);
          }
          // Add dots at the end
          pagesToShow.push('...');
        }
        
        return pagesToShow;
      }
      
      return pages;
    },

    // Add computed property for paginated rentals
    paginatedRentals() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.rentals.slice(start, end);
    }
  },
  methods: {
    // Method to validate date range
    validateDateRange() {
      // Clear previous validation error
      this.dateRangeValidationError = '';
      
      // If "Semua Tanggal" is checked, no validation needed
      if (this.filterAllDates) {
        return true;
      }
      
      // Check if date range is empty based on datepicker type
      let isDateRangeEmpty = false;
      
      if (this.useVueDatepicker) {
        // For Vue Datepicker
        isDateRangeEmpty = !this.dateRange || this.dateRange.length !== 2;
      } else {
        // For native inputs
        isDateRangeEmpty = !this.filterStartDate || !this.filterEndDate;
      }
      
      if (isDateRangeEmpty) {
        this.dateRangeValidationError = 'Mohon pilih rentang tanggal';
        return false;
      }
      
      return true;
    },

    // Update applyFilters method to include validation
    applyFilters() {
      // Validate date range first
      if (!this.validateDateRange()) {
        return; // Don't proceed if validation fails
      }
      
      // Copy modal filter values to applied filter values
      this.appliedFilterAllDates = this.filterAllDates;
      this.appliedFilterStartDate = this.filterStartDate;
      this.appliedFilterEndDate = this.filterEndDate;
      this.appliedFilterRentalType = this.filterRentalType;
      
      // For payment status, if "Semua" is selected, clear individual selections
      if (this.filterAllPaymentStatuses) {
        this.appliedSelectedPaymentStatuses = [];
      } else {
        this.appliedSelectedPaymentStatuses = [...this.selectedPaymentStatuses];
      }
      
      this.currentPage = 1;
      this.fetchRentals();
      this.closeFilterModal();
    },

    // New method to handle "Semua" payment status toggle
    handleAllPaymentStatusToggle() {
      if (this.filterAllPaymentStatuses) {
        // When "Semua" is checked, clear individual selections
        this.selectedPaymentStatuses = [];
      }
    },

    // New method to handle individual payment status changes
    handleIndividualPaymentStatusChange() {
      // Check if all individual options are selected
      const allIndividualOptions = this.paymentStatusOptionsForCheckbox.map(option => option.value);
      const allSelected = allIndividualOptions.every(option => 
        this.selectedPaymentStatuses.includes(option)
      );

      if (allSelected) {
        // If all individual options are selected, revert to "Semua" state
        this.filterAllPaymentStatuses = true;
        this.selectedPaymentStatuses = [];
      } else if (this.selectedPaymentStatuses.length > 0) {
        // When any individual status is selected (but not all), uncheck "Semua"
        this.filterAllPaymentStatuses = false;
      } else {
        // When no individual status is selected, check "Semua"
        this.filterAllPaymentStatuses = true;
      }
    },

    activeFilters() {
      const filters = [];

      // Date range filter
      if (!this.appliedFilterAllDates && this.appliedFilterStartDate && this.appliedFilterEndDate) {
        const startDate = this.formatDateIndicator(this.appliedFilterStartDate);
        const endDate = this.formatDateIndicator(this.appliedFilterEndDate);
        filters.push({
          key: 'dateRange',
          label: `${startDate} - ${endDate}`
        });
      }

      // Rental type filter
      if (this.appliedFilterRentalType) {
        const rentalTypeLabel = this.getRentalTypeLabel(this.appliedFilterRentalType);
        if (rentalTypeLabel !== 'Semua') {
          filters.push({
            key: 'rentalType',
            label: rentalTypeLabel
          });
        }
      }

      // Payment status filter
      if (this.appliedSelectedPaymentStatuses.length > 0) {
        const statusLabels = this.appliedSelectedPaymentStatuses.map(status => {
          const option = this.paymentStatusOptionsForCheckbox.find(opt => opt.value === status);
          return option ? option.label : status;
        });
        
        if (statusLabels.length === 1) {
          filters.push({
            key: 'paymentStatus',
            label: `Status Pembayaran : ${statusLabels[0]}`
          });
        } else {
          filters.push({
            key: 'paymentStatus',
            label: `Status Pembayaran : ${statusLabels.join(', ')}`
          });
        }
      }

      return filters;
    },

    // Update handleAllDatesToggle to clear validation error
    handleAllDatesToggle() {
      if (this.filterAllDates) {
        // Clear date inputs when "Semua Tanggal" is selected
        this.filterStartDate = '';
        this.filterEndDate = '';
        this.dateRange = null;
        this.dateRangeValidationError = ''; // Clear validation error
      } else {
        // Don't set default dates - let user choose
        this.filterStartDate = '';
        this.filterEndDate = '';
        this.dateRange = null;
      }
    },

    removeFilter(filterKey) {
      switch (filterKey) {
        case 'dateRange':
          this.appliedFilterAllDates = true;
          this.appliedFilterStartDate = '';
          this.appliedFilterEndDate = '';
          // Also reset modal values
          this.filterAllDates = true;
          this.filterStartDate = '';
          this.filterEndDate = '';
          this.dateRange = null;
          break;
        
        case 'rentalType':
          this.appliedFilterRentalType = '';
          // Also reset modal values
          this.filterRentalType = '';
          break;
        
        case 'paymentStatus':
          this.appliedSelectedPaymentStatuses = [];
          // Also reset modal values
          this.selectedPaymentStatuses = [];
          this.filterAllPaymentStatuses = true;
          break;
      }
      
      // Apply filters after removing
      this.currentPage = 1;
      this.fetchRentals();
    },

    formatDateIndicator(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const day = date.getDate();
      const month = this.getMonthName(date.getMonth());
      const year = date.getFullYear();
      return `${day} ${month} ${year}`;
    },

    // Update handleDateRangeChange to clear validation error
    handleDateRangeChange(range) {
      if (range && range.length === 2) {
        this.filterStartDate = range[0].toISOString().split('T')[0];
        this.filterEndDate = range[1].toISOString().split('T')[0];
        this.dateRangeValidationError = ''; // Clear validation error when dates are selected
      } else {
        // Clear dates if range is invalid
        this.filterStartDate = '';
        this.filterEndDate = '';
      }
    },

    // Update closeFilterModal to clear validation error
    closeFilterModal() {
      this.showFilterModal = false;
      this.closeOtherFilterDropdowns();
      this.dateRangeValidationError = ''; // Clear validation error when closing modal
    },

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
    },
    
    toggleRentalTypeDropdown() {
      this.showRentalTypeDropdown = !this.showRentalTypeDropdown;
      this.closeOtherFilterDropdowns('rentalType');
    },
    
    toggleRoomTypeDropdown() {
      this.showRoomTypeDropdown = !this.showRoomTypeDropdown;
      this.closeOtherFilterDropdowns('roomType');
    },
    
    toggleRetributionDropdown() {
      this.showRetributionDropdown = !this.showRetributionDropdown;
      this.closeOtherFilterDropdowns('retribution');
    },
    
    toggleActivityTypeDropdown() {
      this.showActivityTypeDropdown = !this.showActivityTypeDropdown;
      this.closeOtherFilterDropdowns('activityType');
    },
    
    closeOtherFilterDropdowns(except) {
      if (except !== 'rentalType') this.showRentalTypeDropdown = false;
    },
    
    selectRentalType(value) {
      this.filterRentalType = value;
      this.showRentalTypeDropdown = false;
      this.handleRentalTypeChange();
    },
    
    selectRoomType(value) {
      this.filterRoomType = value;
      this.showRoomTypeDropdown = false;
    },
    
    selectRetribution(value) {
      this.filterRetribution = value;
      this.showRetributionDropdown = false;
    },
    
    selectActivityType(value) {
      this.filterActivityType = value;
      this.showActivityTypeDropdown = false;
    },
    
    getRentalTypeLabel(rentalType = null) {
      const filterValue = rentalType || this.filterRentalType;
      const option = this.rentalTypeOptions.find(opt => opt.value === filterValue);
      return option ? option.label : 'Semua';
    },
    
    getRoomTypeLabel() {
      const option = this.roomTypeOptions.find(opt => opt.value === this.filterRoomType);
      return option ? option.label : 'Semua';
    },
    
    getRetributionLabel() {
      const option = this.retributionOptions.find(opt => opt.value === this.filterRetribution);
      return option ? option.label : 'Semua';
    },
    
    getActivityTypeLabel() {
      const option = this.activityTypeOptions.find(opt => opt.value === this.filterActivityType);
      return option ? option.label : 'Semua';
    },

    // NEW METHODS FOR RENTAL TYPE AND ROOM DETAILS
    /**
     * Get rental type (Jenis Sewa)
     * @param {Object} rental - The rental detail object
     * @returns {String} - The rental type
     */
    getRentalType(rental) {
      if (rental.guesthouse_room_pricing) {
        return 'Gedung Mess';
      } else if (rental.city_hall_pricing) {
        return 'Gedung Nasional';
      }
      return 'Tidak Diketahui';
    },

    /**
     * Get room name for guesthouse rentals
     * @param {Object} rental - The rental detail object
     * @returns {String|null} - The room name or null
     */
    getRoomName(rental) {
      if (rental.guesthouse_room_pricing?.guesthouse_room?.name) {
        return rental.guesthouse_room_pricing.guesthouse_room.name;
      }
      return null;
    },

    /**
     * Get room type for guesthouse rentals
     * @param {Object} rental - The rental detail object
     * @returns {String|null} - The room type or null
     */
    getRoomType(rental) {
      if (rental.guesthouse_room_pricing?.guesthouse_room?.type) {
        return rental.guesthouse_room_pricing.guesthouse_room.type;
      }
      return null;
    },

    /**
     * Format room type for display
     * @param {String} type - The room type
     * @returns {String} - Formatted room type
     */
    formatRoomTypeDisplay(type) {
      if (!type) return '';
      
      const typeMap = {
        'vip': 'VIP',
        'standard': 'Standard'
      };
      
      return typeMap[type.toLowerCase()] || type.charAt(0).toUpperCase() + type.slice(1);
    },

    // Client-side filtering method
    applyClientSideFilters(data) {
      let filtered = [...data];

      // Filter by payment status - use applied values
      if (this.appliedSelectedPaymentStatuses.length > 0) {
        filtered = filtered.filter(rental => {
          const status = rental.payment?.status;
          return this.appliedSelectedPaymentStatuses.includes(status);
        });
      }

      // Filter by rental type - use applied values
      if (this.appliedFilterRentalType) {
        filtered = filtered.filter(rental => {
          if (this.appliedFilterRentalType === 'guesthouse') {
            return !!rental.guesthouse_room_pricing;
          } else if (this.appliedFilterRentalType === 'city_hall') {
            return !!rental.city_hall_pricing;
          }
          return true;
        });
      }

      // TAMBAHKAN SORTING CLIENT-SIDE
      filtered = this.applySorting(filtered);

      return filtered;
    },

    applySorting(data) {
      const sortedData = [...data];
      
      switch (this.sortBy) {
        case 'newest':
          return sortedData.sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return dateB - dateA; // Terbaru dulu (descending)
          });
          
        case 'oldest':
          return sortedData.sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            return dateA - dateB; // Terlama dulu (ascending)
          });
          
        case 'name':
          return sortedData.sort((a, b) => {
            const nameA = (a.renterName || a.renter?.fullname || '').toLowerCase();
            const nameB = (b.renterName || b.renter?.fullname || '').toLowerCase();
            return nameA.localeCompare(nameB, 'id', { numeric: true }); // Urut abjad A-Z
          });
          
        default:
          return sortedData;
      }
    },

    // NEW FILTER METHODS
    handleSearch() {
      // Clear previous timeout
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      
      // Set new timeout for debounced search
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1;
        this.fetchRentals();
      }, 500);
    },

    handleSortChange() {
      this.currentPage = 1;
      this.fetchRentals();
    },

    openFilterModal() {
      this.showFilterModal = true;
    },

    toggleDatepickerType() {
      this.useVueDatepicker = !this.useVueDatepicker;
      
      if (this.useVueDatepicker) {
        // Convert from separate dates to range format
        if (this.filterStartDate && this.filterEndDate) {
          this.dateRange = [new Date(this.filterStartDate), new Date(this.filterEndDate)];
        }
      } else {
        // Convert from range format to separate dates
        if (this.dateRange && this.dateRange.length === 2) {
          this.filterStartDate = this.dateRange[0].toISOString().split('T')[0];
          this.filterEndDate = this.dateRange[1].toISOString().split('T')[0];
        }
      }
    },

    openCalendarPicker() {
      // Legacy method - now handled by toggleDatepickerType
      this.toggleDatepickerType();
    },

    handleRentalTypeChange() {
      // Reset conditional filters when rental type changes
      this.filterRoomType = '';
      this.filterRetribution = '';
      this.filterActivityType = '';
    },

    // EXISTING METHODS (updated to work with new filters)
    formatDate(dateString) {
      if (!dateString) return '';
      
      const datePart = dateString.split('T')[0];
      const [year, month, day] = datePart.split('-');
      
      const monthIndex = parseInt(month) - 1;
      
      return `${parseInt(day)} ${this.getMonthName(monthIndex)} ${year}`;
    },
    formatDateTime(dateString) {
      if (!dateString) return '-';
      
      const date = new Date(dateString);
      const day = date.getDate();
      const month = this.getMonthName(date.getMonth());
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day} ${month} ${year}, ${hours}.${minutes}`;
    },
    formatCurrency(amount) {
      if (!amount && amount !== 0) return 'Rp0';
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(amount);
    },
    getMonthName(monthIndex) {
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      return months[monthIndex];
    },
    getDayName(dayIndex) {
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      return days[dayIndex];
    },
    translateStatus(status) {
      const statusMap = {
        'pending': 'Menunggu',
        'confirmed': 'Dikonfirmasi',
        'dikonfirmasi': 'Dikonfirmasi',
        'selesai': 'Selesai',
        'dibatalkan': 'Dibatalkan',
        'cancelled': 'Dibatalkan'
      };
      return statusMap[status.toLowerCase()] || status;
    },
    translateGender(gender) {
      const genderMap = {
        'laki_laki': 'Laki-laki',
        'perempuan': 'Perempuan'
      };
      return genderMap[gender] || gender;
    },
    // FIXED PAYMENT STATUS TRANSLATION
    translatePaymentStatus(status) {
      const statusMap = {
        'pending': 'Pending',
        'dibayar': 'Dibayar',
        'gagal': 'Gagal',
        'cancelled': 'Dibatalkan'
      };
      return statusMap[status] || status;
    },
    translatePaymentMethod(method) {
      const methodMap = {
        'qris': 'qris',
        'bank_transfer': 'Transfer Bank',
        'cash': 'Tunai',
        'credit_card': 'Kartu Kredit'
      };
      return methodMap[method] || method;
    },
    getRentType(rental) {
      if (rental.guesthouse_room_pricing) {
        return 'Gedung Mess';
      } else if (rental.city_hall_pricing) {
        return 'Gedung Nasional';
      }
      return 'Tidak Diketahui';
    },
    getRowNumber(index) {
      return (this.currentPage - 1) * this.itemsPerPage + index + 1;
    },
    async fetchRevenue() {
      this.loadingRevenue = true;
      
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Token tidak ditemukan. Silakan login kembali.');

        const today = new Date();
        const dateString = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        
        // Set current date texts
        const dayName = this.getDayName(today.getDay());
        const day = today.getDate();
        const monthName = this.getMonthName(today.getMonth());
        const year = today.getFullYear();
        
        this.currentDayText = `${dayName}, ${day} ${monthName} ${year}`;
        this.currentMonthText = `${monthName} ${year}`;
        this.currentYear = year.toString();

        // Fetch all revenue data in parallel
        const [dailyResponse, monthlyResponse, annualResponse] = await Promise.all([
          axios.get(
            `https://sigemes-api-63593591732.us-central1.run.app/api/v1/dashboard/daily-revenue?date=${dateString}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get(
            `https://sigemes-api-63593591732.us-central1.run.app/api/v1/dashboard/monthly-revenue?date=${dateString}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get(
            `https://sigemes-api-63593591732.us-central1.run.app/api/v1/dashboard/annual-revenue?date=${dateString}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
        ]);

        // Update revenue data
        if (dailyResponse.data.status) {
          this.dailyRevenue = dailyResponse.data.data || 0;
        }
        if (monthlyResponse.data.status) {
          this.monthlyRevenue = monthlyResponse.data.data || 0;
        }
        if (annualResponse.data.status) {
          this.annualRevenue = annualResponse.data.data || 0;
        }

      } catch (error) {
        console.error('Error fetching revenue:', error);
        // Set default values on error
        this.dailyRevenue = 0;
        this.monthlyRevenue = 0;
        this.annualRevenue = 0;
        
        // Still set the date texts even if API fails
        const today = new Date();
        const dayName = this.getDayName(today.getDay());
        const day = today.getDate();
        const monthName = this.getMonthName(today.getMonth());
        const year = today.getFullYear();
        
        this.currentDayText = `${dayName}, ${day} ${monthName} ${year}`;
        this.currentMonthText = `${monthName} ${year}`;
        this.currentYear = year.toString();
      } finally {
        this.loadingRevenue = false;
      }
    },

    // UPDATED FETCH RENTALS WITH CLIENT-SIDE FILTERING
    async fetchRentals() {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Token tidak ditemukan. Silakan login kembali.');

        const params = new URLSearchParams({
          page: 1, // Always fetch from page 1 to get all data
          limit: 1000 // Use large limit to get all data
        });

        // Add search parameter
        if (this.searchQuery) {
          params.append('search', this.searchQuery);
        }

        // Add date range filters only if not "Semua Tanggal" - use applied values
        if (!this.appliedFilterAllDates) {
          if (this.appliedFilterStartDate) {
            params.append('start_date', this.appliedFilterStartDate);
          }
          if (this.appliedFilterEndDate) {
            params.append('end_date', this.appliedFilterEndDate);
          }
        }

        const response = await axios.get(
          `https://sigemes-api-63593591732.us-central1.run.app/api/v1/rents?${params}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.status) {
          let filteredData = response.data.data;
          
          // Client-side filtering dan sorting
          filteredData = this.applyClientSideFilters(filteredData);
          
          this.rentals = filteredData;
          this.totalData = filteredData.length;
          this.totalPages = Math.ceil(filteredData.length / this.itemsPerPage);
          
          // Adjust current page if necessary
          if (this.currentPage > this.totalPages && this.totalPages > 0) {
            this.currentPage = this.totalPages;
          }
          
          await this.fetchRenterDetails();
        } else {
          this.errorMessage = 'Gagal mengambil data sewa.';
        }
      } catch (error) {
        console.error('Error fetching rentals:', error);
        this.errorMessage = error.response?.data?.message || 'Gagal mengambil data. Coba lagi nanti.';
      } finally {
        this.isLoading = false;
      }
    },
    // UPDATED TO WORK WITH ALL RENTALS (NOT JUST PAGINATED)
    async fetchRenterDetails() {
      const renterMap = new Map();
      
      // Process ALL rentals, not just paginated ones
      const renterPromises = this.rentals.map(async (rental) => {
        if (!rental.renter_id) return;
        
        if (renterMap.has(rental.renter_id)) {
          rental.renterName = renterMap.get(rental.renter_id);
          return;
        }

        try {
          const token = localStorage.getItem('authToken');
          const response = await axios.get(
            `https://sigemes-api-63593591732.us-central1.run.app/api/v1/renters/${rental.renter_id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (response.data.status) {
            const renterName = response.data.data.fullname;
            renterMap.set(rental.renter_id, renterName);
            rental.renterName = renterName;
          }
        } catch (error) {
          console.error(`Error fetching renter ${rental.renter_id}:`, error);
          rental.renterName = 'Tidak ditemukan';
        }
      });

      await Promise.all(renterPromises);

      if (this.sortBy === 'name') {
        this.rentals = this.applySorting(this.rentals);
      }
    },
    async showRentalDetail(rentalId) {
      this.loadingDetailId = rentalId;
      this.showModal = true;
      this.rentalDetail = null;

      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          `https://sigemes-api-63593591732.us-central1.run.app/api/v1/rents/${rentalId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.status) {
          this.rentalDetail = response.data.data;
        } else {
          this.errorMessage = 'Gagal mengambil detail sewa.';
          this.closeModal();
        }
      } catch (error) {
        console.error('Error fetching rental detail:', error);
        this.errorMessage = error.response?.data?.message || 'Gagal mengambil detail. Coba lagi nanti.';
        this.closeModal();
      } finally {
        this.loadingDetailId = null;
      }
    },
    closeModal() {
      this.showModal = false;
      this.rentalDetail = null;
      this.loadingDetailId = null;
    },
    openPageJumpModal() {
      this.showPageJumpModal = true;
      this.pageJumpInput = this.currentPage;
    },
    closePageJumpModal() {
      this.showPageJumpModal = false;
      this.pageJumpInput = null;
    },
    jumpToPage() {
      if (this.pageJumpInput && this.pageJumpInput >= 1 && this.pageJumpInput <= this.totalPages) {
        this.currentPage = this.pageJumpInput;
        this.closePageJumpModal();
      }
    },
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
        this.currentPage = page;
      }
    },
    changeItemsPerPage() {
      this.currentPage = 1;
      this.totalPages = Math.ceil(this.totalData / this.itemsPerPage);
    },
    // Export modal methods
    async openExportModal() {
      this.showExportModal = true;
      // Set default month to current month
      const today = new Date();
      this.exportMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      this.currentYearMonth = this.exportMonth;
      
      // Fetch building lists
      await this.fetchBuildingLists();
    },
    closeExportModal() {
      this.showExportModal = false;
      this.selectedCityHalls = [];
      this.selectedGuesthouses = [];
    },
    async fetchBuildingLists() {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert("Anda harus login terlebih dahulu!");
        return;
      }

      // Fetch City Halls
      this.loadingCityHalls = true;
      try {
        const response = await axios.get(
          'https://sigemes-api-63593591732.us-central1.run.app/api/v1/city-halls',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.status) {
          this.cityHallsList = response.data.data;
        }
      } catch (error) {
        console.error('Error fetching city halls:', error);
      } finally {
        this.loadingCityHalls = false;
      }

      // Fetch Guesthouses
      this.loadingGuesthouses = true;
      try {
        const response = await axios.get(
          'https://sigemes-api-63593591732.us-central1.run.app/api/v1/guesthouses',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.status) {
          this.guesthousesList = response.data.data;
        }
      } catch (error) {
        console.error('Error fetching guesthouses:', error);
      } finally {
        this.loadingGuesthouses = false;
      }
    },

    applyCellStyleExcelJS(worksheet, cellAddress, style) {
      const cell = worksheet.getCell(cellAddress);
      
      if (style.font) {
        cell.font = { name: 'Arial', ...style.font };
      }
      
      if (style.alignment) {
        cell.alignment = style.alignment;
      }
      
      if (style.fill) {
        cell.fill = style.fill;
      }
      
      if (style.border) {
        cell.border = style.border;
      }
      
      if (style.numFmt) {
        cell.numFmt = style.numFmt;
      }
    },

    async addLogo(worksheet, startRow = 1, startCol = 1) {
      try {
        const logoPath = '/logo-pemda.png';
        
        const response = await fetch(logoPath);
        if (response.ok) {
          const blob = await response.blob();
          const buffer = await blob.arrayBuffer();
          
          const imageId = worksheet.workbook.addImage({
            buffer: buffer,
            extension: 'png'
          });
          
          worksheet.addImage(imageId, {
            tl: { col: startCol - 1, row: startRow - 1 },
            ext: { width: 80, height: 100 }
          });
          
          return true;
        }
      } catch (error) {
        console.error('Error adding logo:', error);
        return false;
      }
      return false;
    },
    
    // NEW UPDATED EXPORT TO EXCEL METHOD
    async exportToExcel() {
      if ((!this.selectedCityHalls.length && !this.selectedGuesthouses.length) || !this.exportMonth) {
        alert('Pilih minimal satu gedung dan bulan yang akan diekspor');
        return;
      }

      this.isExporting = true;
      
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Token tidak ditemukan. Silakan login kembali.');

        // Parse month and year
        const [year, month] = this.exportMonth.split('-');
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        
        // Format dates for API
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        const monthName = this.getMonthName(parseInt(month) - 1);

        // Store all building data for summary
        const allBuildingData = [];
        
        // Export separate files for each selected guesthouse
        for (const guesthouseId of this.selectedGuesthouses) {
          const rentals = await this.fetchRentalsByBuilding('guesthouse', guesthouseId, startDateStr, endDateStr);
          const guesthouse = this.guesthousesList.find(g => g.id === guesthouseId);
          
          if (guesthouse) {
            // Clean building name for filename
            const cleanBuildingName = this.cleanFilename(guesthouse.name);
            await this.createBuildingReport(rentals, guesthouse.name, 'Mess', cleanBuildingName, monthName, year);
            
            // Store data for summary
            allBuildingData.push({
              type: 'Mess',
              name: guesthouse.name,
              transactions: rentals.filter(r => r.payment?.status === 'paid' || r.payment?.status === 'dibayar')
            });
          }
        }

        // Export separate files for each selected city hall
        for (const cityHallId of this.selectedCityHalls) {
          const rentals = await this.fetchRentalsByBuilding('city_hall', cityHallId, startDateStr, endDateStr);
          const cityHall = this.cityHallsList.find(c => c.id === cityHallId);
          
          if (cityHall) {
            // Clean building name for filename
            const cleanBuildingName = this.cleanFilename(cityHall.name);
            await this.createBuildingReport(rentals, cityHall.name, 'GedungNasional', cleanBuildingName, monthName, year);
            
            // Store data for summary
            allBuildingData.push({
              type: 'Gedung Nasional',
              name: cityHall.name,
              transactions: rentals.filter(r => r.payment?.status === 'paid' || r.payment?.status === 'dibayar')
            });
          }
        }

        // Create summary report
        if (allBuildingData.length > 0) {
          await this.createSummaryReport(allBuildingData, monthName, year);
        }

        alert(`Berhasil mengekspor ${allBuildingData.length + 1} file laporan!`);
        this.closeExportModal();
        
      } catch (error) {
        console.error('Error exporting to Excel:', error);
        alert('Gagal mengekspor laporan. Silakan coba lagi.');
      } finally {
        this.isExporting = false;
      }
    },

    // New method to clean filename for safe file naming
    cleanFilename(name) {
      return name
        .replace(/[^\w\s-]/g, '') // Remove special characters except word chars, spaces, and hyphens
        .replace(/\s+/g, '') // Remove all spaces
        .replace(/-+/g, ''); // Remove hyphens
    },

    // New method to create individual building report
    async createBuildingReport(transactions, buildingName, buildingType, cleanBuildingName, monthName, year) {
      const workbook = XLSX.utils.book_new();

      // Filter only paid transactions
      const paidTransactions = transactions.filter(rental => 
        (rental.payment?.status === 'paid' || rental.payment?.status === 'dibayar')
      );

      // Prepare header data (rows 1-5)
      const headerData = [
        ['PEMERINTAH KOTA PADANGSIDIMPUAN'],           // Row 1
        ['SEKRETARIAT DAERAH'],                        // Row 2
        ['Jalan Jenderal Sudirman Nomor 2 Padangsidimpuan Utara,'], // Row 3
        ['Padangsidimpuan, Sumatera Utara 22718, Telepon: (0634) 27806 - 27807'], // Row 4
        ['Faksimile : (0634) 27227'],                  // Row 5
        [''],                                          // Row 6 (empty)
        [''],                                          // Row 7 (empty)
        [buildingName],                                // Row 8 (building name)
        ['Laporan Transaksi Bulanan'],                 // Row 9 (report title)
        [''],                                          // Row 10 (empty)
        [`Bulan : ${monthName} ${year}`],              // Row 11 (month info)
      ];

      // Prepare table data based on building type
      let tableHeader, tableData;
      
      if (buildingType === 'Mess') {
        tableHeader = ['No', 'Tanggal Transaksi', 'Nama Penyewa', 'Tanggal Check-in', 'Tanggal Check-out', 'Nomor Invoice', 'Jenis Retribusi', 'Harga Item (@)', 'Total Harga'];
        
        tableData = paidTransactions.map((rental, index) => [
          index + 1,
          this.formatDateExcel(rental.created_at),
          rental.renter?.fullname || '-',
          this.formatDateExcel(rental.start_date),
          this.formatDateExcel(rental.end_date),
          rental.payment?.id || '-',
          rental.guesthouse_room_pricing?.retribution_type || '-',
          rental.guesthouse_room_pricing?.price_per_day || 0,
          rental.payment?.amount || 0
        ]);
      } else {
        tableHeader = ['No', 'Tanggal Transaksi', 'Nama Penyewa', 'Tanggal Pemakaian', 'Nomor Invoice', 'Jenis Retribusi', 'Harga Item (@)', 'Total Harga'];
        
        tableData = paidTransactions.map((rental, index) => [
          index + 1,
          this.formatDateExcel(rental.created_at),
          rental.renter?.fullname || '-',
          this.formatDateExcel(rental.start_date),
          rental.payment?.id || '-',
          rental.city_hall_pricing?.activity_type || '-',
          rental.city_hall_pricing?.price_per_day || 0,
          rental.payment?.amount || 0
        ]);
      }

      // Calculate total
      const total = tableData.reduce((sum, row) => sum + (row[tableData[0].length - 1] || 0), 0);
      
      // Add total row
      const totalRow = new Array(tableData[0].length).fill('');
      totalRow[tableData[0].length - 3] = 'Jumlah';
      totalRow[tableData[0].length - 1] = total;
      tableData.push(totalRow);

      // Combine all data
      const sheetData = [
        ...headerData,
        tableHeader,
        ...tableData
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
      
      // Calculate column widths based on content
      const colWidths = [];
      for (let col = 0; col < tableHeader.length; col++) {
        let maxWidth = tableHeader[col].length;
        
        // Check all data rows for max width
        for (let row = 0; row < tableData.length; row++) {
          const cellValue = String(tableData[row][col] || '');
          maxWidth = Math.max(maxWidth, cellValue.length);
        }
        
        // Special handling for invoice column (make it wider)
        if (col === 5) { // Nomor Invoice column
          maxWidth = Math.max(maxWidth, 35);
        }
        
        // Special handling for name column
        if (col === 2) { // Nama Penyewa column
          maxWidth = Math.max(maxWidth, 25);
        }
        
        colWidths.push({ wch: Math.min(maxWidth + 2, 50) }); // Add padding, max 50
      }
      
      worksheet['!cols'] = colWidths;

      // Apply cell formatting
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      
      for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
          
          if (!worksheet[cellRef]) {
            worksheet[cellRef] = { t: 's', v: '' };
          }
          
          // Initialize cell style
          if (!worksheet[cellRef].s) {
            worksheet[cellRef].s = {};
          }
          
          // Apply Arial font to all cells
          worksheet[cellRef].s.font = { name: 'Arial' };
          
          // Header formatting (rows 0-4)
          if (row >= 0 && row <= 4) {
            worksheet[cellRef].s.alignment = { horizontal: 'center', vertical: 'center' };
            
            if (row === 0) { // PEMERINTAH KOTA PADANGSIDIMPUAN
              worksheet[cellRef].s.font = { name: 'Arial', sz: 14, bold: true };
            } else if (row === 1) { // SEKRETARIAT DAERAH
              worksheet[cellRef].s.font = { name: 'Arial', sz: 18, bold: true };
            } else { // Other header rows
              worksheet[cellRef].s.font = { name: 'Arial', sz: 14 };
            }
          }
          
          // Building name (row 7)
          if (row === 7) {
            worksheet[cellRef].s.alignment = { horizontal: 'center', vertical: 'center' };
            worksheet[cellRef].s.font = { name: 'Arial', sz: 14, bold: true };
          }
          
          // Report title (row 8)
          if (row === 8) {
            worksheet[cellRef].s.alignment = { horizontal: 'center', vertical: 'center' };
            worksheet[cellRef].s.font = { name: 'Arial', sz: 14, bold: true };
          }
          
          // Month info (row 10)
          if (row === 10) {
            worksheet[cellRef].s.font = { name: 'Arial', sz: 12 };
          }
          
          // Table header (row 11)
          if (row === 11) {
            worksheet[cellRef].s.font = { name: 'Arial', sz: 12, bold: true };
            worksheet[cellRef].s.alignment = { horizontal: 'center', vertical: 'center' };
            worksheet[cellRef].s.fill = { fgColor: { rgb: 'E8F4FD' } };
            worksheet[cellRef].s.border = {
              top: { style: 'thin', color: { rgb: '000000' } },
              bottom: { style: 'thin', color: { rgb: '000000' } },
              left: { style: 'thin', color: { rgb: '000000' } },
              right: { style: 'thin', color: { rgb: '000000' } }
            };
          }
          
          // Table data rows
          if (row > 11) {
            worksheet[cellRef].s.font = { name: 'Arial', sz: 11 };
            worksheet[cellRef].s.border = {
              top: { style: 'thin', color: { rgb: '000000' } },
              bottom: { style: 'thin', color: { rgb: '000000' } },
              left: { style: 'thin', color: { rgb: '000000' } },
              right: { style: 'thin', color: { rgb: '000000' } }
            };
            
            // Center align No column
            if (col === 0) {
              worksheet[cellRef].s.alignment = { horizontal: 'center', vertical: 'center' };
            }
            
            // Right align currency columns
            if (col === tableHeader.length - 2 || col === tableHeader.length - 1) {
              worksheet[cellRef].s.alignment = { horizontal: 'right', vertical: 'center' };
              worksheet[cellRef].s.numFmt = '#,##0';
            }
            
            // Bold total row
            if (row === range.e.r) {
              worksheet[cellRef].s.font = { name: 'Arial', sz: 11, bold: true };
            }
          }
        }
      }

      // Add bottom border under header (row 4)
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: 4, c: col });
        if (!worksheet[cellRef]) {
          worksheet[cellRef] = { t: 's', v: '' };
        }
        if (!worksheet[cellRef].s) {
          worksheet[cellRef].s = {};
        }
        worksheet[cellRef].s.border = {
          bottom: { style: 'thin', color: { rgb: '000000' } }
        };
      }

      // Merge cells for header
      const headerMerges = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: tableHeader.length - 1 } }, // PEMERINTAH KOTA
        { s: { r: 1, c: 0 }, e: { r: 1, c: tableHeader.length - 1 } }, // SEKRETARIAT DAERAH
        { s: { r: 2, c: 0 }, e: { r: 2, c: tableHeader.length - 1 } }, // Address
        { s: { r: 3, c: 0 }, e: { r: 3, c: tableHeader.length - 1 } }, // Phone
        { s: { r: 4, c: 0 }, e: { r: 4, c: tableHeader.length - 1 } }, // Fax
        { s: { r: 7, c: 0 }, e: { r: 7, c: tableHeader.length - 1 } }, // Building name
        { s: { r: 8, c: 0 }, e: { r: 8, c: tableHeader.length - 1 } }  // Report title
      ];
      
      worksheet['!merges'] = headerMerges;
      
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Transaksi');

      // Generate Excel file
      const fileName = `Laporan_Keuangan_${cleanBuildingName}_${monthName}_${year}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    },

    // Updated method to create summary report with signature section
    async createSummaryReport(allBuildingData, monthName, year) {
      const workbook = XLSX.utils.book_new();

      // Prepare header data (rows 0-4)
      const headerData = [
        ['PEMERINTAH KOTA PADANGSIDIMPUAN'],           // Row 0
        ['SEKRETARIAT DAERAH'],                        // Row 1
        ['Jalan Jenderal Sudirman Nomor 2 Padangsidimpuan Utara,'], // Row 2
        ['Padangsidimpuan, Sumatera Utara 22718, Telepon: (0634) 27806 - 27807'], // Row 3
        ['Faksimile : (0634) 27227'],                  // Row 4
        [''],                                          // Row 5 (empty)
        [''],                                          // Row 6 (empty)
        ['Laporan Keuangan'],                          // Row 7
        ['Pendapatan Bagian Umum'],                    // Row 8
        ['Sekretariat Daerah Kota Padangsidimpuan'],   // Row 9
        ['(SiGEMES)'],                                 // Row 10
        [''],                                          // Row 11 (empty)
        [''],                                          // Row 12 (empty)
      ];

      // Prepare summary table (starting at row 13)
      const summaryTableHeader = ['No', 'Retribusi', 'Jumlah Penyewa', 'Total Pendapatan']; // Row 13
      const summaryData = [];
      
      // Add data for each building
      allBuildingData.forEach((building, index) => {
        const totalAmount = building.transactions.reduce((sum, t) => sum + (t.payment?.amount || 0), 0);
        
        summaryData.push([
          index + 1,
          building.name,
          building.transactions.length,
          totalAmount
        ]);
      });

      // Calculate grand total
      const grandTotalPendapatan = summaryData.reduce((sum, row) => sum + (row[3] || 0), 0);

      // Add total row
      summaryData.push(['', 'Total', '', grandTotalPendapatan]);

      // Add signature section
      const signatureSection = [
        [''],                                          // Empty row
        [''],                                          // Empty row
        [`Padangsidimpuan, [hari bulan tahun]`],      // Date placeholder
        [''],                                          // Empty row
        ['Mengetahui,', '', '', 'Bendahara Penerimaan,'], // Signature titles
        ['a. n. Sekretaris Daerah', '', '', ''],       // Left title
        ['Asisten Administrasi Umum', '', '', ''],     // Left title
        ['u. b. Kepala Bagian Umum,', '', '', ''],     // Left title
        [''],                                          // Empty row for signature space
        [''],                                          // Empty row for signature space
        [''],                                          // Empty row for signature space
        [''],                                          // Empty row for signature space
        ['Tobonsyah Pulungan, S. Sos, M. M.', '', '', 'Jenni Sartika'], // Names
        ['Pembina Tingkat I / IVb', '', '', 'Penata Muda / IIa'], // Ranks
        ['NIP. 197909091998031002', '', '', 'NIP. 198405202008012002'] // NIP
      ];

      // Combine all data
      const summarySheetData = [
        ...headerData,        // rows 0-12
        summaryTableHeader,   // row 13
        ...summaryData,       // rows 14+
        ...signatureSection   // signature section
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summarySheetData);
      
      // Set column widths
      summarySheet['!cols'] = [
        { wch: 5 },   // No
        { wch: 40 },  // Retribusi
        { wch: 15 },  // Jumlah Penyewa
        { wch: 20 }   // Total Pendapatan
      ];

      // Get range for styling
      const range = XLSX.utils.decode_range(summarySheet['!ref']);
      const tableEndRow = 13 + summaryData.length; // Last row of table
      
      // Apply styles
      for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
          
          // Ensure cell exists
          if (!summarySheet[cellRef]) {
            summarySheet[cellRef] = { t: 's', v: '' };
          }
          if (!summarySheet[cellRef].s) {
            summarySheet[cellRef].s = {};
          }

          // Apply Arial font to all cells
          summarySheet[cellRef].s.font = { name: 'Arial', size: 11 };
          
          // Header section styling (rows 0-4)
          if (row >= 0 && row <= 4) {
            this.applyCellStyle(summarySheet, cellRef, {
              font: { 
                name: 'Arial', 
                size: row === 0 ? 14 : (row === 1 ? 18 : 14),
                bold: row === 0 || row === 1
              },
              alignment: { horizontal: 'center', vertical: 'center' }
            });
          }
          
          // Title sections (rows 7-10)
          else if (row >= 7 && row <= 10) {
            this.applyCellStyle(summarySheet, cellRef, {
              font: { name: 'Arial', size: 14, bold: true },
              alignment: { horizontal: 'center', vertical: 'center' }
            });
          }
          
          // Table header (row 13)
          else if (row === 13) {
            this.applyCellStyle(summarySheet, cellRef, {
              font: { name: 'Arial', size: 12, bold: true },
              alignment: { horizontal: 'center', vertical: 'center' },
              fill: { fgColor: { rgb: 'E8F4FD' } },
              border: {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' }
              }
            });
          }
          
          // Table data rows
          else if (row > 13 && row <= tableEndRow) {
            const borderStyle = {
              top: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' },
              right: { style: 'thin' }
            };
            
            let alignment = {};
            let numFmt = null;
            
            // Center align No column
            if (col === 0) {
              alignment = { horizontal: 'center', vertical: 'center' };
            }
            // Right align number columns
            else if (col === 2 || col === 3) {
              alignment = { horizontal: 'right', vertical: 'center' };
              if (col === 3) {
                numFmt = '#,##0';
              }
            }
            
            const cellStyle = {
              font: { 
                name: 'Arial', 
                size: 11, 
                bold: row === tableEndRow // Bold for total row
              },
              border: borderStyle,
              alignment: alignment
            };
            
            if (numFmt) {
              cellStyle.numFmt = numFmt;
            }
            
            this.applyCellStyle(summarySheet, cellRef, cellStyle);
          }
          
          // Signature section formatting
          else if (row > tableEndRow + 1) {
            this.applyCellStyle(summarySheet, cellRef, {
              font: { name: 'Arial', size: 11 },
              alignment: { horizontal: 'center', vertical: 'center' }
            });
          }
        }
      }

      // Add bottom border under kop surat (row 4)
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: 4, c: col });
        this.applyCellStyle(summarySheet, cellRef, {
          border: { bottom: { style: 'thin' } }
        });
      }

      // Merge cells for header sections and titles
      summarySheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },  // PEMERINTAH KOTA
        { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },  // SEKRETARIAT DAERAH
        { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },  // Address
        { s: { r: 3, c: 0 }, e: { r: 3, c: 3 } },  // Phone
        { s: { r: 4, c: 0 }, e: { r: 4, c: 3 } },  // Fax
        { s: { r: 7, c: 0 }, e: { r: 7, c: 3 } },  // Laporan Keuangan
        { s: { r: 8, c: 0 }, e: { r: 8, c: 3 } },  // Pendapatan Bagian Umum
        { s: { r: 9, c: 0 }, e: { r: 9, c: 3 } },  // Sekretariat Daerah
        { s: { r: 10, c: 0 }, e: { r: 10, c: 3 } } // (SiGEMES)
      ];
      
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan Keuangan');

      // Generate Excel file
      const fileName = `Ringkasan_Keuangan_${monthName}_${year}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    },

    // New method to create summary report
    async createSummaryReport(allBuildingData, monthName, year) {
      const workbook = XLSX.utils.book_new();

      // Prepare header data
      const headerData = [
        ['PEMERINTAH KOTA PADANGSIDIMPUAN'],
        ['SEKRETARIAT DAERAH'],
        ['Jalan Jenderal Sudirman Nomor 2 Padangsidimpuan Utara,'],
        ['Padangsidimpuan, Sumatera Utara 22718, Telepon: (0634) 27806 - 27807'],
        ['Faksimile : (0634) 27227'],
        [''],
        [''],
        [`Ringkasan Keuangan - ${monthName} ${year}`],
        ['']
      ];

      // Prepare summary table
      const summaryTableHeader = ['Jenis Gedung', 'Nama Gedung', 'Jumlah Penyewa', 'Total Pendapatan'];
      const summaryData = [];
      
      // Add data for each building
      allBuildingData.forEach(building => {
        const totalAmount = building.transactions.reduce((sum, t) => sum + (t.payment?.amount || 0), 0);
        
        summaryData.push([
          building.type,
          building.name,
          building.transactions.length,
          totalAmount
        ]);
      });

      // Calculate grand total
      const grandTotalPenyewa = summaryData.reduce((sum, row) => sum + (row[2] || 0), 0);
      const grandTotalPendapatan = summaryData.reduce((sum, row) => sum + (row[3] || 0), 0);

      // Add grand total
      summaryData.push(['', 'TOTAL', grandTotalPenyewa, grandTotalPendapatan]);

      // Combine header and summary data
      const summarySheetData = [
        ...headerData,
        ['Ringkasan Keuangan'],
        [''],
        summaryTableHeader,
        ...summaryData
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summarySheetData);
      
      // Merge cells for header and title
      summarySheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: 3 } },
        { s: { r: 4, c: 0 }, e: { r: 4, c: 3 } },
        { s: { r: 7, c: 0 }, e: { r: 7, c: 3 } },
        { s: { r: 9, c: 0 }, e: { r: 9, c: 3 } }
      ];
      
      // Apply column widths
      summarySheet['!cols'] = [
        { wch: 20 },  // Jenis Gedung
        { wch: 35 },  // Nama Gedung
        { wch: 15 },  // Jumlah Penyewa
        { wch: 20 }   // Total Pendapatan
      ];
      
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan Keuangan');

      // Generate Excel file
      const fileName = `Ringkasan_Keuangan_${monthName}_${year}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    },
    
    // UPDATED FETCH RENTALS BY BUILDING WITH CLIENT-SIDE FILTERING
    async fetchRentalsByBuilding(type, buildingId, startDate, endDate) {
      const token = localStorage.getItem('authToken');
      const rentals = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        try {
          const params = new URLSearchParams({
            page: page,
            limit: 1000, // Use larger limit to get more data at once
            start_date: startDate,
            end_date: endDate
          });

          const response = await axios.get(
            `https://sigemes-api-63593591732.us-central1.run.app/api/v1/rents?${params}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (response.data.status && response.data.data.length > 0) {
            // Filter by building type and ID on client side
            const filteredRentals = response.data.data.filter(rental => {
              if (type === 'guesthouse') {
                return rental.guesthouse_room_pricing?.guesthouse_room?.guesthouse?.id === buildingId;
              } else if (type === 'city_hall') {
                return rental.city_hall_pricing?.city_hall?.id === buildingId;
              }
              return false;
            });

            // Fetch renter details for each filtered rental
            for (const rental of filteredRentals) {
              if (rental.renter_id) {
                try {
                  const renterResponse = await axios.get(
                    `https://sigemes-api-63593591732.us-central1.run.app/api/v1/renters/${rental.renter_id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  if (renterResponse.data.status) {
                    rental.renter = renterResponse.data.data;
                  }
                } catch (error) {
                  console.error(`Error fetching renter ${rental.renter_id}:`, error);
                }
              }
            }
            
            rentals.push(...filteredRentals);
            
            // Check if there are more pages
            if (response.data.pagination && page < response.data.pagination.last_page) {
              page++;
            } else {
              hasMore = false;
            }
          } else {
            hasMore = false;
          }
        } catch (error) {
          console.error('Error fetching rentals:', error);
          hasMore = false;
        }
      }

      return rentals;
    },
    
    formatDateExcel(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  },
  mounted() {
    this.fetchRevenue();
    this.fetchRentals();
    document.addEventListener('click', this.handleClickOutside);
  },

  beforeUnmount() {
    // Remove click outside listener
    document.removeEventListener('click', this.handleClickOutside);
  }
};
</script>

<style scoped>
#dashboard-header, #export-report-button, .revenue, .rent-column {
  font-family: 'Poppins', sans-serif;
}

.revenue-cardbox {
  background-color: #E8F9FF;
}

/* Skeleton loader animation - konsisten dengan gedung nasional */
.skeleton-loader {
  background: linear-gradient(
    90deg,
    #e0e0e0 25%,
    #f0f0f0 50%,
    #e0e0e0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Animation for loading text */
@keyframes pulse {
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}

.loading-text {
  animation: pulse 0.8s infinite;
}

/* Modal animations */
.modal-enter-active, .modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Custom scrollbar untuk modal filter */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Table styling */
table {
  table-layout: fixed;
}

table th, table td {
  word-wrap: break-word;
}

table th:first-child, table td:first-child {
  text-align: center;
}

table th:last-child, table td:last-child {
  text-align: center;
}

/* Custom pagination styling */
.pagination-container {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-btn {
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  background-color: white;
  color: #333;
  cursor: pointer;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  padding: 0 12px;
}

.pagination-btn.pagination-nav-text {
  min-width: auto;
  white-space: nowrap;
}

.pagination-btn:hover:not(.disabled):not(.active) {
  background-color: #f5f5f5;
  border-color: #bbb;
}

.pagination-btn.active {
  background-color: #4682b4 !important;
  color: white !important;
  border-color: #4682b4 !important;
}

.pagination-btn.dots {
  cursor: pointer;
  background-color: #f9f9f9;
}

.pagination-btn.dots:hover {
  background-color: #e0e0e0;
}

.pagination-btn.pagination-nav {
  font-size: 18px;
  font-weight: bold;
}

.pagination-btn.disabled {
  background-color: #f9f9f9;
  color: #ccc;
  cursor: not-allowed;
  border-color: #eee;
}

.pagination-btn.disabled:hover {
  background-color: #f9f9f9;
  border-color: #eee;
}

/* Modal styling */
.fixed {
  position: fixed;
}

.inset-0 {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.z-50 {
  z-index: 50;
}

.bg-opacity-50 {
  background-opacity: 0.5;
}

.max-h-90vh {
  max-height: 90vh;
}

.overflow-y-auto {
  overflow-y: auto;
}

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