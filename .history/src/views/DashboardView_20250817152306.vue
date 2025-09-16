<template>
  <div>
    <Navigation />
    <div class="container mt-6 mx-auto px-6 py-8">
      <!-- Header & Export Button -->
      <div class="flex justify-between items-center">
        <h1 id="dashboard-header" class="text-3xl font-black text-black">Dashboard</h1>
        <button id="export-report-button" class="font-bold bg-blue-500 text-white px-5 py-2 text-sm rounded-lg hover:bg-blue-700">
          Ekspor Laporan Keuangan
        </button>
      </div>

      <!-- Income Statistics -->
      <div class="flex flex-wrap gap-4 mt-6">
        <div class="bg-blue-100 p-6 rounded-xl shadow-lg flex-1">
          <p class="text-gray-800">Pendapatan {{ currentDateFormatted }}</p>
          <h2 class="revenue text-3xl text-black font-bold">
            <span v-if="isLoadingRevenue" class="loading-text">Memuat...</span>
            <span v-else>{{ formatCurrency(dailyRevenue) }}</span>
          </h2>
        </div>
        <div class="bg-blue-100 p-6 rounded-xl shadow-lg flex-1">
          <p class="text-gray-800">Pendapatan bulan {{ currentMonthYear }}</p>
          <h2 class="revenue text-3xl text-black font-bold">
            <span v-if="isLoadingRevenue" class="loading-text">Memuat...</span>
            <span v-else>{{ formatCurrency(monthlyRevenue) }}</span>
          </h2>
        </div>
        <div class="bg-blue-100 p-6 rounded-xl shadow-lg flex-1">
          <p class="text-gray-800">Total pendapatan tahun {{ currentYear }}</p>
          <h2 class="revenue text-3xl text-black font-bold">
            <span v-if="isLoadingRevenue" class="loading-text">Memuat...</span>
            <span v-else>{{ formatCurrency(annualRevenue) }}</span>
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
              <option value="5">5</option>
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
          <span class="text-gray-600 text-sm">
            Menampilkan halaman <span class="font-bold text-black">{{ currentPage }}</span> dari total <span class="font-bold text-black">{{ totalPages }}</span> halaman
          </span>
        </div>

        <!-- Custom Pagination -->
        <div class="flex justify-center mt-2" v-if="!isLoading && !errorMessage && totalPages > 1">
          <div class="pagination-container">
            <!-- First Page Button -->
            <button 
              @click="goToPage(1)"
              :disabled="currentPage === 1"
              :class="['pagination-btn-text', currentPage === 1 ? 'disabled' : '']"
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

            <!-- Page Numbers and Ellipsis -->
            <template v-for="page in visiblePages" :key="page">
              <button 
                v-if="page !== '...'"
                @click="goToPage(page)"
                :class="['pagination-btn', page === currentPage ? 'active' : '']">
                {{ page }}
              </button>
              <button 
                v-else
                @click="showPageInputDialog"
                class="pagination-btn pagination-ellipsis"
                title="Masukkan nomor halaman">
                ...
              </button>
            </template>

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
              :class="['pagination-btn-text', currentPage === totalPages ? 'disabled' : '']"
              title="Halaman Terakhir">
              Halaman Terakhir &gt;&gt;
            </button>
          </div>
        </div>
      </div>
    </div>

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
  </div>
</template>

<script>
import axios from 'axios';
import Navigation from '@/components/Navigation.vue';

export default {
  name: 'DashboardView',
  components: {
    Navigation,
  },
  data() {
    return {
      rentals: [],
      allRentals: [], // Store the original unfiltered data
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
      showPageInput: false,
      pageInputValue: '',
      // Revenue data
      dailyRevenue: 0,
      monthlyRevenue: 0,
      annualRevenue: 0,
      isLoadingRevenue: true,
    };
  },
  computed: {
    visiblePages() {
      const pages = [];
      const total = this.totalPages;
      const current = this.currentPage;
      
      if (total <= 6) {
        // Show all pages if total is 6 or less
        for (let i = 1; i <= total; i++) {
          pages.push(i);
        }
      } else {
        // Always show first 5 pages
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        
        // Add ellipsis if current page > 5 or if there are more pages after 5
        if (total > 5) {
          pages.push('...');
        }
      }
      
      return pages;
    },
    
    // Get current date formatted for display
    currentDateFormatted() {
      const today = new Date();
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                     'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      
      const dayName = days[today.getDay()];
      const day = today.getDate();
      const month = months[today.getMonth()];
      const year = today.getFullYear();
      
      return `${dayName}, ${day} ${month} ${year}`;
    },
    
    // Get current month and year for display
    currentMonthYear() {
      const today = new Date();
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                     'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      
      const month = months[today.getMonth()];
      const year = today.getFullYear();
      
      return `${month} ${year}`;
    },
    
    // Get current year
    currentYear() {
      return new Date().getFullYear();
    }
  },
  methods: {
    // Get current date in YYYY-MM-DD format
    getCurrentDateString() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    // Fetch daily revenue
    async fetchDailyRevenue() {
      try {
        const token = localStorage.getItem('authToken');
        const currentDate = this.getCurrentDateString();
        
        const response = await axios.get(
          `https://sigemes-api-63593591732.us-central1.run.app/api/v1/dashboard/daily-revenue?date=${currentDate}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.status) {
          this.dailyRevenue = response.data.data;
        }
      } catch (error) {
        console.error('Error fetching daily revenue:', error);
        this.dailyRevenue = 0;
      }
    },

    // Fetch monthly revenue
    async fetchMonthlyRevenue() {
      try {
        const token = localStorage.getItem('authToken');
        const currentDate = this.getCurrentDateString();
        
        const response = await axios.get(
          `https://sigemes-api-63593591732.us-central1.run.app/api/v1/dashboard/monthly-revenue?date=${currentDate}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.status) {
          this.monthlyRevenue = response.data.data;
        }
      } catch (error) {
        console.error('Error fetching monthly revenue:', error);
        this.monthlyRevenue = 0;
      }
    },

    // Fetch annual revenue
    async fetchAnnualRevenue() {
      try {
        const token = localStorage.getItem('authToken');
        const currentDate = this.getCurrentDateString();
        
        const response = await axios.get(
          `https://sigemes-api-63593591732.us-central1.run.app/api/v1/dashboard/annual-revenue?date=${currentDate}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.status) {
          this.annualRevenue = response.data.data;
        }
      } catch (error) {
        console.error('Error fetching annual revenue:', error);
        this.annualRevenue = 0;
      }
    },

    // Fetch all revenue data
    async fetchRevenueData() {
      this.isLoadingRevenue = true;
      try {
        await Promise.all([
          this.fetchDailyRevenue(),
          this.fetchMonthlyRevenue(),
          this.fetchAnnualRevenue()
        ]);
      } finally {
        this.isLoadingRevenue = false;
      }
    },

    // Handle ellipsis click for page navigation
    showPageInputDialog() {
      const targetPage = prompt(`Masukkan nomor halaman (1-${this.totalPages}):`);
      if (targetPage) {
        const page = parseInt(targetPage);
        if (page >= 1 && page <= this.totalPages) {
          this.goToPage(page);
        } else {
          alert(`Halaman harus antara 1 dan ${this.totalPages}`);
        }
      }
    },
      if (!dateString) return '';
      
      // Ambil hanya bagian tanggal dari ISO string
      const datePart = dateString.split('T')[0]; // "2025-06-28"
      const [year, month, day] = datePart.split('-');
      
      const monthIndex = parseInt(month) - 1; // Month dimulai dari 0
      
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
      if (!amount) return 'Rp0';
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
      // Determine rent type based on the presence of specific pricing objects
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
    async fetchRentals() {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('Token tidak ditemukan. Silakan login kembali.');

        // Build query parameters
        const params = new URLSearchParams({
          page: this.currentPage,
          limit: this.itemsPerPage
        });

        // Add date filter if set
        if (this.filterDate) {
          params.append('date', this.filterDate);
        }

        // Add sort parameter
        params.append('sort', this.sortNewest ? 'newest' : 'oldest');

        const response = await axios.get(
          `https://sigemes-api-63593591732.us-central1.run.app/api/v1/rents?${params}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.status) {
          this.rentals = response.data.data;
          this.totalData = response.data.pagination.total_data;
          this.totalPages = response.data.pagination.last_page;
          
          // Fetch renter details for each rental
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
      // Create a map to store renter details to avoid duplicate requests
      const renterMap = new Map();
      
      // Create promises for all renter detail requests
      const renterPromises = this.rentals.map(async (rental) => {
        if (!rental.renter_id) return;
        
        // Skip if we already fetched this renter's details
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

      // Wait for all promises to resolve
      await Promise.all(renterPromises);
    },
    async showRentalDetail(rentalId) {
      this.loadingDetailId = rentalId;
      this.showModal = true;
      this.rentalDetail = null;

      // console.log('=== DEBUG: Fetching rental detail ===');
      // console.log('Rental ID:', rentalId);

      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          `https://sigemes-api-63593591732.us-central1.run.app/api/v1/rents/${rentalId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // console.log('=== DEBUG: API Response ===');
        // console.log('Full Response:', response);
        // console.log('Response Data:', response.data);
        // console.log('Response Status:', response.data.status);
        // console.log('Response Message:', response.data.message);

        if (response.data.status) {
          // console.log('=== DEBUG: Rental Detail Data ===');
          // console.log('Rental Detail:', response.data.data);
          // console.log('Payment Info:', response.data.data.payment);
          // console.log('Renter Info:', response.data.data.renter);
          
          // Check rental type
          // if (response.data.data.guesthouse_room_pricing) {
          //   console.log('=== DEBUG: Guesthouse Room Pricing ===');
          //   console.log('Guesthouse Room Pricing:', response.data.data.guesthouse_room_pricing);
          //   console.log('Retribution Type:', response.data.data.guesthouse_room_pricing.retribution_type);
          // }
          
          // if (response.data.data.city_hall_pricing) {
          //   console.log('=== DEBUG: City Hall Pricing ===');
          //   console.log('City Hall Pricing:', response.data.data.city_hall_pricing);
          //   console.log('Activity Type:', response.data.data.city_hall_pricing.activity_type);
          // }

          this.rentalDetail = response.data.data;
        } else {
          // console.log('=== DEBUG: API Error ===');
          // console.log('API returned status false');
          this.errorMessage = 'Gagal mengambil detail sewa.';
          this.closeModal();
        }
      } catch (error) {
        // console.log('=== DEBUG: Request Error ===');
        console.error('Error fetching rental detail:', error);
        // console.log('Error Response:', error.response);
        // console.log('Error Message:', error.response?.data?.message);
        this.errorMessage = error.response?.data?.message || 'Gagal mengambil detail. Coba lagi nanti.';
        this.closeModal();
      } finally {
        this.loadingDetailId = null;
        // console.log('=== DEBUG: Request completed ===');
      }
    },
    closeModal() {
      this.showModal = false;
      this.rentalDetail = null;
      this.loadingDetailId = null;
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
    onPageChange(page) {
      this.currentPage = page;
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
    }
  },
  mounted() {
    this.fetchRentals();
    this.fetchRevenueData();
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

/* Animation for loading text */
@keyframes pulse {
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}

.loading-text {
  animation: pulse 0.8s infinite;
}

/* Animasi untuk modal */
.modal-enter-active, .modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Table styling for consistent spacing */
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

/* Styling for text pagination buttons */
.pagination-btn-text {
  padding: 8px 16px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  background-color: white;
  color: #333;
  cursor: pointer;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.pagination-btn-text:hover:not(.disabled) {
  background-color: #f5f5f5;
  border-color: #bbb;
}

.pagination-btn-text.disabled {
  background-color: #f9f9f9;
  color: #ccc;
  cursor: not-allowed;
  border-color: #eee;
}

.pagination-btn-text.disabled:hover {
  background-color: #f9f9f9;
  border-color: #eee;
}

/* Styling for ellipsis button */
.pagination-ellipsis {
  cursor: pointer !important;
  font-weight: bold;
}

.pagination-ellipsis:hover {
  background-color: #e3f2fd !important;
  border-color: #2196f3 !important;
  color: #2196f3 !important;
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