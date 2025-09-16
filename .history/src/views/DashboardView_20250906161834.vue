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
        <div class="bg-blue-100 rounded-lg max-w-lg w-1/4 max-h-[90vh] overflow-hidden" @click.stop>
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
                  <span class="text-black font-medium">Semua Tanggal</span>
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

              <!-- Date Range Validation Error Message -->
              <div v-if="dateRangeValidationError" class="mb-3">
                <p class="text-red-500 text-sm font-medium">{{ dateRangeValidationError }}</p>
              </div>
            </div>

            <!-- Jenis Sewa - Moved above Status Pembayaran -->
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

            <!-- Payment Status - Changed to Checkboxes -->
            <div class="mb-4">
              <h3 class="rent-column font-bold text-black mb-3">Status Pembayaran</h3>
              <div class="space-y-2">
                <label v-for="option in paymentStatusOptionsForCheckbox" 
                      :key="option.value" 
                      class="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input 
                    type="checkbox" 
                    v-model="selectedPaymentStatuses"
                    :value="option.value"
                    class="mr-2"
                  />
                  <span class="text-black text-sm">{{ option.label }}</span>
                </label>
              </div>
            </div>

            <!-- COMMENTED OUT SECTIONS - No longer needed -->
            <!--
            <!-- Conditional Fields for Gedung Mess --
            <template v-if="filterRentalType === 'guesthouse'">
              <!-- Room Type - Custom Dropdown --
              <div class="mb-4">
                <h3 class="rent-column font-bold text-black mb-3">Tipe</h3>
                <div class="relative">
                  <div class="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2.5 cursor-pointer hover:border-blue-400 transition-colors"
                      @click="toggleRoomTypeDropdown">
                    <span class="text-gray-600 text-sm flex-1">{{ getRoomTypeLabel() }}</span>
                    <svg class="w-4 h-4 text-gray-500 transition-transform" :class="{ 'rotate-180': showRoomTypeDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </div>
                  
                  <!-- Room Type Dropdown Menu --
                  <div v-if="showRoomTypeDropdown" 
                      class="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    <div class="py-1">
                      <div v-for="option in roomTypeOptions" 
                          :key="option.value"
                          @click="selectRoomType(option.value)"
                          class="px-3 py-2 text-sm text-black hover:bg-blue-50 cursor-pointer"
                          :class="{ 'bg-blue-100 font-medium': filterRoomType === option.value }">
                        {{ option.label }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Retribution - Custom Dropdown --
              <div class="mb-4">
                <h3 class="rent-column font-bold text-black mb-3">Retribusi</h3>
                <div class="relative">
                  <div class="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2.5 cursor-pointer hover:border-blue-400 transition-colors"
                      @click="toggleRetributionDropdown">
                    <span class="text-gray-600 text-sm flex-1 truncate">{{ getRetributionLabel() }}</span>
                    <svg class="w-4 h-4 text-gray-500 transition-transform" :class="{ 'rotate-180': showRetributionDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </div>
                  
                  <!-- Retribution Dropdown Menu --
                  <div v-if="showRetributionDropdown" 
                      class="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    <div class="py-1">
                      <div v-for="option in retributionOptions" 
                          :key="option.value"
                          @click="selectRetribution(option.value)"
                          class="px-3 py-2 text-sm text-black hover:bg-blue-50 cursor-pointer"
                          :class="{ 'bg-blue-100 font-medium': filterRetribution === option.value }">
                        {{ option.label }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- Conditional Fields for Gedung Nasional --
            <template v-if="filterRentalType === 'city_hall'">
              <div class="mb-4">
                <h3 class="rent-column font-bold text-black mb-3">Tipe Sewa</h3>
                <div class="relative">
                  <div class="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2.5 cursor-pointer hover:border-blue-400 transition-colors"
                      @click="toggleActivityTypeDropdown">
                    <span class="text-gray-600 text-sm flex-1">{{ getActivityTypeLabel() }}</span>
                    <svg class="w-4 h-4 text-gray-500 transition-transform" :class="{ 'rotate-180': showActivityTypeDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </div>
                  
                  <!-- Activity Type Dropdown Menu --
                  <div v-if="showActivityTypeDropdown" 
                      class="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    <div class="py-1">
                      <div v-for="option in activityTypeOptions" 
                          :key="option.value"
                          @click="selectActivityType(option.value)"
                          class="px-3 py-2 text-sm text-black hover:bg-blue-50 cursor-pointer"
                          :class="{ 'bg-blue-100 font-medium': filterActivityType === option.value }">
                        {{ option.label }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
            -->

          </div>
          
          <!-- Action Buttons -->
          <div class="flex justify-center gap-4 mt-2 p-6 pt-0">
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

    <!-- Modal Detail Penyewaan - UPDATED WITH NEW FIELDS -->
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

                <!-- Jenis Sewa - NEW FIELD -->
                <div class="flex">
                  <span class="text-gray-600 w-48 text-sm">Jenis Sewa</span>
                  <span class="text-gray-600 w-4 text-sm">:</span>
                  <span class="font-medium text-black flex-1 text-sm">{{ getRentalType(rentalDetail) }}</span>
                </div>

                <!-- Nama Ruang & Tipe Ruang (Only for Gedung Mess) - NEW FIELDS -->
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
import * as XLSX from 'xlsx';

// Import Vue Datepicker (uncomment after installing the library)
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

export default {
  name: 'DashboardView',
  components: {
    Navigation,
    VueDatePicker, // Uncomment after installing the library
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

      // Options for dropdowns - FIXED PAYMENT STATUS VALUES
      // paymentStatusOptions: [
      //   { value: '', label: 'Semua' },
      //   { value: 'pending', label: 'Pending' },
      //   { value: 'gagal', label: 'Gagal' },
      //   { value: 'dibayar', label: 'Dibayar' }
      // ],

      // Opsi untuk checkbox status pembayaran
      paymentStatusOptionsForCheckbox: [
        { value: 'pending', label: 'Pending' },
        { value: 'gagal', label: 'Gagal' },
        { value: 'dibayar', label: 'Dibayar' }
      ],
      selectedPaymentStatuses: [], // Array untuk menyimpan status pembayaran yang dipilih
      
      rentalTypeOptions: [
        { value: '', label: 'Semua' },
        { value: 'guesthouse', label: 'Gedung Mess' },
        { value: 'city_hall', label: 'Gedung Nasional' }
      ],
      
      roomTypeOptions: [
        { value: '', label: 'Semua' },
        { value: 'vip', label: 'VIP' },
        { value: 'standard', label: 'Standard' }
      ],
      
      retributionOptions: [
        { value: '', label: 'Semua' },
        { value: 'Pejabat Negara / Pejabat Pemerintah', label: 'Pejabat Negara / Pejabat Pemerintah' },
        { value: 'PNS (Gol. II, III, dan IV)', label: 'PNS (Gol. II, III, dan IV)' },
        { value: 'Umum', label: 'Umum' },
        { value: 'Khusus Booking 1 Kamar', label: 'Khusus Booking 1 Kamar' }
      ],
      
      activityTypeOptions: [
        { value: '', label: 'Semua' },
        { value: 'Komersial', label: 'Komersial' },
        { value: 'Sosial', label: 'Sosial' },
        { value: 'Instansi Pemerintah', label: 'Instansi Pemerintah' }
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
      
      // Filter modal properties
      showFilterModal: false,
      filterAllDates: true, // Default to "Semua Tanggal"
      filterStartDate: '',
      filterEndDate: '',
      // filterPaymentStatus: '', tidak dipakai menyesuaikan use case saat ini
      filterRentalType: '',
      filterRoomType: '',
      filterRetribution: '',
      filterActivityType: '',
      
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
      
      this.currentPage = 1;
      this.fetchRentals();
      this.closeFilterModal();
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

    // New methods for filter modal dropdowns
    // togglePaymentStatusDropdown() {
    //   this.showPaymentStatusDropdown = !this.showPaymentStatusDropdown;
    //   this.closeOtherFilterDropdowns('paymentStatus');
    // },
    
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
    
    // Kondisional pemilihan tipe ruang dan retribusi hanya untuk Gedung Mess, Tipe Sewa hanya untuk Gedung Nasional
    closeOtherFilterDropdowns(except) {
      // if (except !== 'paymentStatus') this.showPaymentStatusDropdown = false;
      if (except !== 'rentalType') this.showRentalTypeDropdown = false;
      // if (except !== 'roomType') this.showRoomTypeDropdown = false;
      // if (except !== 'retribution') this.showRetributionDropdown = false;
      // if (except !== 'activityType') this.showActivityTypeDropdown = false;
    },
    
    // selectPaymentStatus(value) {
    //   this.filterPaymentStatus = value;
    //   this.showPaymentStatusDropdown = false;
    // },
    
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
    
    // getPaymentStatusLabel() {
    //   const option = this.paymentStatusOptions.find(opt => opt.value === this.filterPaymentStatus);
    //   return option ? option.label : 'Semua';
    // },
    
    getRentalTypeLabel() {
      const option = this.rentalTypeOptions.find(opt => opt.value === this.filterRentalType);
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

      // Filter by payment status
      // if (this.filterPaymentStatus) {
      //   filtered = filtered.filter(rental => {
      //     const status = rental.payment?.status;
      //     return status === this.filterPaymentStatus;
      //   });
      // }
      if (this.selectedPaymentStatuses.length > 0) {
        filtered = filtered.filter(rental => {
          const status = rental.payment?.status;
          return this.selectedPaymentStatuses.includes(status);
        });
      }

      // Filter by rental type
      if (this.filterRentalType) {
        filtered = filtered.filter(rental => {
          if (this.filterRentalType === 'guesthouse') {
            return !!rental.guesthouse_room_pricing;
          } else if (this.filterRentalType === 'city_hall') {
            return !!rental.city_hall_pricing;
          }
          return true;
        });
      }

      // Filter by room type (for guesthouse rentals)
      // if (this.filterRentalType === 'guesthouse' && this.filterRoomType) {
      //   filtered = filtered.filter(rental => {
      //     const roomType = rental.guesthouse_room_pricing?.guesthouse_room?.type;
      //     return roomType === this.filterRoomType;
      //   });
      // }

      // Filter by retribution (for guesthouse rentals)
      // if (this.filterRentalType === 'guesthouse' && this.filterRetribution) {
      //   filtered = filtered.filter(rental => {
      //     const retributionType = rental.guesthouse_room_pricing?.retribution_type;
      //     return retributionType === this.filterRetribution;
      //   });
      // }

      // Filter by activity type (for city hall rentals)
      // if (this.filterRentalType === 'city_hall' && this.filterActivityType) {
      //   filtered = filtered.filter(rental => {
      //     const activityType = rental.city_hall_pricing?.activity_type;
      //     return activityType === this.filterActivityType;
      //   });
      // }

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
      // Set default dates to today only if not "Semua Tanggal"
      // if (!this.filterAllDates) {
      //   const today = new Date().toISOString().split('T')[0];
      //   this.filterStartDate = today;
      //   this.filterEndDate = today;
      // }
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

    // handleRentalTypeChange() {
    //   // Reset conditional filters when rental type changes
    //   this.filterRoomType = '';
    //   this.filterRetribution = '';
    //   this.filterActivityType = '';
    // },

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

        // Add date range filters only if not "Semua Tanggal"
        if (!this.filterAllDates) {
          if (this.filterStartDate) {
            params.append('start_date', this.filterStartDate);
          }
          if (this.filterEndDate) {
            params.append('end_date', this.filterEndDate);
          }
        }

        // HAPUS parameter sort dari API karena akan di-handle client-side
        // params.append('sort', this.sortBy); // <- HAPUS BARIS INI

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

        // Fetch all rental data for selected buildings
        const messTransactions = [];
        const nationalTransactions = [];
        
        // Fetch data for each selected guesthouse
        for (const guesthouseId of this.selectedGuesthouses) {
          const rentals = await this.fetchRentalsByBuilding('guesthouse', guesthouseId, startDateStr, endDateStr);
          messTransactions.push(...rentals);
        }

        // Fetch data for each selected city hall
        for (const cityHallId of this.selectedCityHalls) {
          const rentals = await this.fetchRentalsByBuilding('city_hall', cityHallId, startDateStr, endDateStr);
          nationalTransactions.push(...rentals);
        }

        // Create Excel workbook
        await this.createExcelReport(messTransactions, nationalTransactions, month, year);
        
      } catch (error) {
        console.error('Error exporting to Excel:', error);
        alert('Gagal mengekspor laporan. Silakan coba lagi.');
      } finally {
        this.isExporting = false;
      }
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
    async createExcelReport(messTransactions, nationalTransactions, month, year) {
      // XLSX is imported at the top of the file, so we can use it directly
      const workbook = XLSX.utils.book_new();
      const monthName = this.getMonthName(parseInt(month) - 1);

      // Filter only paid transactions with retribution type
      const paidMessTransactions = messTransactions.filter(rental => 
        (rental.payment?.status === 'paid' || rental.payment?.status === 'dibayar') &&
        rental.guesthouse_room_pricing?.retribution_type
      );
      const paidNationalTransactions = nationalTransactions.filter(rental => 
        (rental.payment?.status === 'paid' || rental.payment?.status === 'dibayar') &&
        rental.city_hall_pricing?.activity_type
      );

      // Prepare header data for all sheets
      const headerData = [
        ['PEMERINTAH KOTA PADANGSIDIMPUAN'],
        ['SEKRETARIAT DAERAH'],
        ['Jalan Jenderal Sudirman Nomor 2 Padangsidimpuan Utara,'],
        ['Padangsidimpuan, Sumatera Utara 22718, Telepon: (0634) 27806 - 27807'],
        ['Faksimile : (0634) 27227'],
        [''],
        [''],
        [`Laporan Transaksi Bulanan - ${monthName} ${year}`],
        ['']
      ];

      // Sheet 1: Mess Transactions
      const messTableHeader = ['No', 'Tanggal Transaksi', 'Nama Penyewa', 'Tanggal Check-in', 'Tanggal Check-out', 'Nomor Invoice', 'Jenis Retribusi', 'Harga Item (@)', 'Total Harga'];
      
      const messData = paidMessTransactions.map((rental, index) => [
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

      // Calculate total for mess
      const messTotal = messData.reduce((sum, row) => sum + (row[8] || 0), 0);

      // Add total row for mess
      messData.push(['', '', '', '', '', '', 'Jumlah', '', messTotal]);

      // Combine header, table header, and data
      const messSheetData = [
        ...headerData,
        messTableHeader,
        ...messData
      ];

      const messSheet = XLSX.utils.aoa_to_sheet(messSheetData);
      
      // Merge cells for header
      messSheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }, // PEMERINTAH KOTA
        { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } }, // SEKRETARIAT DAERAH
        { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } }, // Jalan
        { s: { r: 3, c: 0 }, e: { r: 3, c: 8 } }, // Telepon
        { s: { r: 4, c: 0 }, e: { r: 4, c: 8 } }, // Faksimile
        { s: { r: 7, c: 0 }, e: { r: 7, c: 8 } }  // Laporan title
      ];
      
      // Apply column widths
      messSheet['!cols'] = [
        { wch: 5 },   // No
        { wch: 18 },  // Tanggal Transaksi
        { wch: 25 },  // Nama Penyewa
        { wch: 18 },  // Tanggal Check-in
        { wch: 18 },  // Tanggal Check-out
        { wch: 20 },  // Nomor Invoice
        { wch: 30 },  // Jenis Retribusi
        { wch: 15 },  // Harga Item
        { wch: 15 }   // Total Harga
      ];
      
      // Apply borders if using xlsx-js-style library
      if (typeof messSheet.A1 === 'object') { // Check if styling is supported
        this.applyBordersToSheet(messSheet, 0, headerData.length + messData.length, 9);
      }
      
      XLSX.utils.book_append_sheet(workbook, messSheet, 'Transaksi Mess');

      // Sheet 2: National Building Transactions
      const nationalTableHeader = ['No', 'Tanggal Transaksi', 'Nama Penyewa', 'Tanggal Pemakaian', 'Nomor Invoice', 'Jenis Retribusi', 'Harga Item (@)', 'Total Harga'];
      
      const nationalData = paidNationalTransactions.map((rental, index) => [
        index + 1,
        this.formatDateExcel(rental.created_at),
        rental.renter?.fullname || '-',
        this.formatDateExcel(rental.start_date),
        rental.payment?.id || '-',
        rental.city_hall_pricing?.activity_type || '-',
        rental.city_hall_pricing?.price_per_day || 0,
        rental.payment?.amount || 0
      ]);

      // Calculate total for national
      const nationalTotal = nationalData.reduce((sum, row) => sum + (row[7] || 0), 0);

      // Add total row for national
      nationalData.push(['', '', '', '', '', 'Jumlah', '', nationalTotal]);

      // Combine header and data for national
      const nationalSheetData = [
        ...headerData,
        nationalTableHeader,
        ...nationalData
      ];

      const nationalSheet = XLSX.utils.aoa_to_sheet(nationalSheetData);
      
      // Merge cells for header
      nationalSheet['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: 7 } },
        { s: { r: 4, c: 0 }, e: { r: 4, c: 7 } },
        { s: { r: 7, c: 0 }, e: { r: 7, c: 7 } }
      ];
      
      // Apply column widths
      nationalSheet['!cols'] = [
        { wch: 5 },   // No
        { wch: 18 },  // Tanggal Transaksi
        { wch: 25 },  // Nama Penyewa
        { wch: 18 },  // Tanggal Pemakaian
        { wch: 20 },  // Nomor Invoice
        { wch: 30 },  // Jenis Retribusi
        { wch: 15 },  // Harga Item
        { wch: 15 }   // Total Harga
      ];
      
      // Apply borders if using xlsx-js-style library
      if (typeof nationalSheet.A1 === 'object') {
        this.applyBordersToSheet(nationalSheet, 0, headerData.length + nationalData.length, 8);
      }
      
      XLSX.utils.book_append_sheet(workbook, nationalSheet, 'Transaksi Gedung Nasional');

      // Sheet 3: Financial Summary
      const summaryTableHeader = ['Jenis Gedung', 'Nama Gedung', 'Jumlah Penyewa', 'Total Pendapatan'];
      const summaryData = [];
      
      // Add mess summary - fix the ID matching
      this.selectedGuesthouses.forEach(guesthouseId => {
        const guesthouse = this.guesthousesList.find(g => g.id === guesthouseId);
        // Check guesthouse_room_pricing.guesthouse_room.guesthouse.id
        const transactions = paidMessTransactions.filter(t => 
          t.guesthouse_room_pricing?.guesthouse_room?.guesthouse?.id === guesthouseId
        );
        const totalAmount = transactions.reduce((sum, t) => sum + (t.payment?.amount || 0), 0);
        
        summaryData.push([
          'Mess',
          guesthouse?.name || '-',
          transactions.length,
          totalAmount
        ]);
      });

      // Add national building summary - fix the ID matching
      this.selectedCityHalls.forEach(cityHallId => {
        const cityHall = this.cityHallsList.find(c => c.id === cityHallId);
        // Check city_hall_pricing.city_hall.id
        const transactions = paidNationalTransactions.filter(t => 
          t.city_hall_pricing?.city_hall?.id === cityHallId
        );
        const totalAmount = transactions.reduce((sum, t) => sum + (t.payment?.amount || 0), 0);
        
        summaryData.push([
          'Gedung Nasional',
          cityHall?.name || '-',
          transactions.length,
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
      
      // Apply borders if using xlsx-js-style library
      if (typeof summarySheet.A1 === 'object') {
        this.applyBordersToSheet(summarySheet, 0, headerData.length + 2 + summaryData.length, 4);
      }
      
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan Keuangan');

      // Generate Excel file
      const fileName = `Laporan_Keuangan_${monthName}_${year}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      alert('Laporan berhasil diekspor!');
      this.closeExportModal();
    },
    applyBordersToSheet(worksheet, startRow, endRow, endCol) {
      // This function only works with xlsx-js-style library
      if (!worksheet['!ref']) return;
      
      for (let R = startRow; R <= endRow; R++) {
        for (let C = 0; C < endCol; C++) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          if (!worksheet[cellAddress]) {
            worksheet[cellAddress] = { v: '', t: 's' };
          }
          
          if (!worksheet[cellAddress].s) {
            worksheet[cellAddress].s = {};
          }
          
          // Add borders
          worksheet[cellAddress].s.border = {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
          };
          
          // Center align headers (row 0-8 are headers, row 9 is table header)
          if (R <= 8) {
            worksheet[cellAddress].s.alignment = { horizontal: 'center', vertical: 'center' };
            if (R === 0 || R === 1 || R === 7) {
              worksheet[cellAddress].s.font = { bold: true, sz: 14 };
            }
          }
          
          // Bold table header row
          if (R === 9) {
            worksheet[cellAddress].s.font = { bold: true };
            worksheet[cellAddress].s.fill = { fgColor: { rgb: 'E0E0E0' } };
            worksheet[cellAddress].s.alignment = { horizontal: 'center' };
          }
          
          // Bold last row (total)
          if (R === endRow) {
            worksheet[cellAddress].s.font = { bold: true };
          }
        }
      }
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