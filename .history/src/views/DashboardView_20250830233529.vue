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

      <!-- Filter Controls -->
      <div class="mt-8 bg-blue-50 p-6 rounded-xl shadow-xl">
        <div class="flex justify-center items-center mb-4">
          <div class="flex items-center space-x-6">
            <span class="text-black font-medium">Filter Berdasarkan</span>
            <button 
              @click="setSortNewest" 
              :class="['px-4 py-2 bg-white border rounded-full font-medium', 
                      sortNewest ? 'border-blue-500 text-blue-500' : 'border-gray-300 text-gray-700']">
              Terbaru
            </button>
            <button 
              @click="setSortOldest" 
              :class="['px-4 py-2 bg-white border rounded-full font-medium', 
                      !sortNewest ? 'border-blue-500 text-blue-500' : 'border-gray-300 text-gray-700']">
              Terlama
            </button>
            <input 
              v-model="filterDate" 
              @change="filterByDate"
              type="date" 
              class="border rounded-lg p-2 text-black" 
              placeholder="Tanggal Pemesanan..." />
            <span class="text-black font-medium">Baris per halaman</span>
            <select 
              v-model="itemsPerPage" 
              @change="changeItemsPerPage"
              class="border rounded-lg p-2 text-black min-w-16">
              <option value="10" selected>10</option>
              <option value="15">15</option>
              <option value="20">20</option>
            </select>
          </div>
        </div>

        <!-- Rental Data Table -->
        <div class="overflow-x-auto">
          <table class="w-full border-collapse border border-gray-300">
            <thead>
              <tr class="bg-blue-200 text-black">
                <th class="rent-column py-3 px-4 border border-gray-300 text-center font-bold w-16">No</th>
                <th class="rent-column py-3 px-4 border border-gray-300 text-center font-bold w-32">Penyewa</th>
                <th class="rent-column py-3 px-4 border border-gray-300 text-center font-bold w-40">Jenis Sewa</th>
                <th class="rent-column py-3 px-4 border border-gray-300 text-center font-bold w-48">Mulai Sewa</th>
                <th class="rent-column py-3 px-4 border border-gray-300 text-center font-bold w-48">Selesai Sewa</th>
                <th class="rent-column py-3 px-4 border border-gray-300 text-center font-bold w-24">Aksi</th>
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
                <tr v-for="(rental, index) in rentals" :key="rental.id" class="bg-white text-black border-b border-gray-200">
                  <td class="py-3 px-4 border border-gray-300 text-center">{{ getRowNumber(index) }}</td>
                  <td class="py-3 px-4 border border-gray-300">{{ rental.renterName || 'Memuat...' }}</td>
                  <td class="py-3 px-4 border border-gray-300">{{ getRentType(rental) }}</td>
                  <td class="py-3 px-4 border border-gray-300">{{ formatDate(rental.start_date) }}</td>
                  <td class="py-3 px-4 border border-gray-300">{{ formatDate(rental.end_date) }}</td>
                  <td class="py-3 px-4 border border-gray-300 text-center">
                    <button 
                      @click="showRentalDetail(rental.id)" 
                      class="text-blue-500 hover:text-blue-700 font-medium"
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

    <!-- Page Jump Modal -->
    <transition name="modal">
      <div v-if="showPageJumpModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click="closePageJumpModal">
        <div class="bg-white rounded-lg p-6 max-w-sm w-full" @click.stop>
          <h3 class="text-lg font-bold text-black mb-4">Lompat ke Halaman</h3>
          <div class="flex items-center space-x-2">
            <input 
              v-model.number="pageJumpInput"
              type="number"
              :min="1"
              :max="totalPages"
              class="flex-1 border rounded-lg p-2 text-black"
              placeholder="Masukkan nomor halaman..."
              @keyup.enter="jumpToPage">
            <button 
              @click="jumpToPage"
              class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Lompat
            </button>
            <button 
              @click="closePageJumpModal"
              class="bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-400">
              Batal
            </button>
          </div>
          <p class="text-sm text-gray-600 mt-2">Halaman 1 - {{ totalPages }}</p>
        </div>
      </div>
    </transition>

    <!-- Modal Detail Penyewaan -->
    <transition name="modal">
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click="closeModal">
        <div class="bg-gray-100 rounded-lg max-w-2xl w-full max-h-[70vh] flex flex-col" @click.stop>
          <!-- Modal Header -->
          <div class="flex justify-between items-center p-4 border-b border-gray-300 flex-shrink-0">
            <div class="flex-1"></div>
            <h2 class="text-xl font-bold text-black text-center flex-1">Detail Penyewaan</h2>
            <div class="flex-1 flex justify-end">
              <button @click="closeModal" class="text-gray-500 hover:text-gray-700 text-2xl font-bold">
                ×
              </button>
            </div>
          </div>

          <!-- Modal Content - Scrollable -->
          <div class="flex-1 overflow-y-auto p-4">
            <div v-if="rentalDetail" class="space-y-3">
              <!-- Basic Information -->
              <div class="space-y-3">
                <div class="flex">
                  <span class="text-gray-600 w-48 text-sm">No. Invoice</span>
                  <span class="text-gray-600 w-4 text-sm">:</span>
                  <span class="font-medium text-black flex-1 text-sm">{{ rentalDetail.payment?.id || '-' }}</span>
                </div>
                <div class="flex">
                  <span class="text-gray-600 w-48 text-sm">Nama Penyewa</span>
                  <span class="text-gray-600 w-4 text-sm">:</span>
                  <span class="font-medium text-black flex-1 text-sm">{{ rentalDetail.renter?.fullname || '-' }}</span>
                </div>
                <div class="flex">
                  <span class="text-gray-600 w-48 text-sm">Email</span>
                  <span class="text-gray-600 w-4 text-sm">:</span>
                  <span class="font-medium text-black flex-1 text-sm">{{ rentalDetail.renter?.email || '-' }}</span>
                </div>
                <div class="flex">
                  <span class="text-gray-600 w-48 text-sm">Jenis Kelamin</span>
                  <span class="text-gray-600 w-4 text-sm">:</span>
                  <span class="font-medium text-black flex-1 text-sm">{{ translateGender(rentalDetail.renter?.gender) }}</span>
                </div>
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
                  <span class="text-gray-600 w-48 text-sm">Status Pembayaran</span>
                  <span class="text-gray-600 w-4 text-sm">:</span>
                  <span class="font-medium text-black flex-1 text-sm">{{ translatePaymentStatus(rentalDetail.payment?.status) }}</span>
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
          <h2 class="data-gedung-text text-2xl font-bold text-black text-center mb-6">Ekspor Laporan Keuangan</h2>
          
          <!-- Building Type Selection -->
          <div class="grid grid-cols-2 gap-6 mb-6">
            <!-- Gedung Nasional -->
            <div>
              <h3 class="font-bold text-black mb-3">Gedung Nasional</h3>
              <div v-if="loadingCityHalls" class="text-gray-500">
                Memuat data gedung...
              </div>
              <div v-else-if="cityHallsList.length === 0" class="text-gray-500">
                Tidak ada data gedung nasional
              </div>
              <div v-else class="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                <label v-for="hall in cityHallsList" :key="hall.id" class="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                  <input 
                    type="checkbox" 
                    v-model="selectedCityHalls"
                    :value="hall.id"
                    class="mr-2"
                  >
                  <span class="text-sm text-gray-700">{{ hall.name }}</span>
                </label>
              </div>
            </div>

            <!-- Gedung Mess -->
            <div>
              <h3 class="font-bold text-black mb-3">Gedung Mess</h3>
              <div v-if="loadingGuesthouses" class="text-gray-500">
                Memuat data gedung...
              </div>
              <div v-else-if="guesthousesList.length === 0" class="text-gray-500">
                Tidak ada data gedung mess
              </div>
              <div v-else class="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                <label v-for="guesthouse in guesthousesList" :key="guesthouse.id" class="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                  <input 
                    type="checkbox" 
                    v-model="selectedGuesthouses"
                    :value="guesthouse.id"
                    class="mr-2"
                  >
                  <span class="text-sm text-gray-700">{{ guesthouse.name }}</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Month and Year Selection -->
          <div class="mb-6">
            <h3 class="font-bold text-black mb-3">Pilih keuangan bulanan yang akan diekspor</h3>
            <div class="flex items-center space-x-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <input 
                type="month" 
                v-model="exportMonth"
                class="flex-1 p-3 border border-gray-300 rounded-lg"
                :max="currentYearMonth"
              >
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-center space-x-4">
            <button 
              @click="exportToExcel"
              :disabled="(!selectedCityHalls.length && !selectedGuesthouses.length) || !exportMonth || isExporting"
              class="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
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
              class="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
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

export default {
  name: 'DashboardView',
  components: {
    Navigation,
  },
  data() {
    return {
      rentals: [],
      allRentals: [],
      isLoading: false,
      errorMessage: '',
      filterDate: '',
      sortNewest: true,
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
    }
  },
  methods: {
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
    translatePaymentStatus(status) {
      const statusMap = {
        'pending': 'Pending',
        'dibayar': 'dibayar',
        'paid': 'dibayar',
        'cancelled': 'Dibatalkan',
        'failed': 'Gagal'
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
    async fetchRentals() {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Token tidak ditemukan. Silakan login kembali.');

        const params = new URLSearchParams({
          page: this.currentPage,
          limit: this.itemsPerPage
        });

        if (this.filterDate) {
          params.append('date', this.filterDate);
        }

        params.append('sort', this.sortNewest ? 'newest' : 'oldest');

        const response = await axios.get(
          `https://sigemes-api-63593591732.us-central1.run.app/api/v1/rents?${params}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.status) {
          this.rentals = response.data.data;
          this.totalData = response.data.pagination.total_data;
          this.totalPages = response.data.pagination.last_page;
          
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
    async fetchRenterDetails() {
      const renterMap = new Map();
      
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
        this.fetchRentals();
        this.closePageJumpModal();
      }
    },
    setSortNewest() {
      this.sortNewest = true;
      this.currentPage = 1;
      this.fetchRentals();
    },
    setSortOldest() {
      this.sortNewest = false;
      this.currentPage = 1;
      this.fetchRentals();
    },
    filterByDate() {
      this.currentPage = 1;
      this.fetchRentals();
    },
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
        this.currentPage = page;
        this.fetchRentals();
      }
    },
    changeItemsPerPage() {
      this.currentPage = 1;
      this.fetchRentals();
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
    async fetchRentalsByBuilding(type, buildingId, startDate, endDate) {
      const token = localStorage.getItem('authToken');
      const rentals = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        try {
          const params = new URLSearchParams({
            page: page,
            limit: 100,
            start_date: startDate,
            end_date: endDate
          });

          if (type === 'guesthouse') {
            params.append('guesthouse_id', buildingId);
          } else {
            params.append('city_hall_id', buildingId);
          }

          const response = await axios.get(
            `https://sigemes-api-63593591732.us-central1.run.app/api/v1/rents?${params}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (response.data.status && response.data.data.length > 0) {
            // Fetch renter details for each rental
            for (const rental of response.data.data) {
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
            
            rentals.push(...response.data.data);
            
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
        // Check city_hall_pricing.city_hall.id or similar nested structure
        const transactions = paidNationalTransactions.filter(t => {
          // Try different possible paths for city hall ID
          return t.city_hall_pricing?.city_hall?.id === cityHallId ||
                 t.city_hall_id === cityHallId ||
                 t.city_hall?.id === cityHallId;
        });
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
  },
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
</style>