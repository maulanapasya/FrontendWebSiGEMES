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
          <p class="text-gray-800">
            <span v-if="loadingRevenue" class="skeleton-loader inline-block w-64 h-5 rounded"></span>
            <span v-else >Pendapatan {{ currentDayText }}</span>
          </p>
          <h2 class="revenue text-3xl text-black">
            <span v-if="loadingRevenue" class="skeleton-loader inline-block w-48 h-9 rounded"></span>
            <span v-else class="font-bold">{{ formatCurrency(dailyRevenue) }}</span>
          </h2>
        </div>
        <div class="bg-blue-100 p-6 rounded-xl shadow-lg flex-1">
          <p class="text-gray-800">
            <span v-if="loadingRevenue" class="skeleton-loader inline-block w-56 h-5 rounded"></span>
            <span v-else>Pendapatan bulan {{ currentMonthText }}</span>
          </p>
          <h2 class="revenue text-3xl text-black">
            <span v-if="loadingRevenue" class="skeleton-loader inline-block w-48 h-9 rounded"></span>
            <span v-else class="font-bold">{{ formatCurrency(monthlyRevenue) }}</span>
          </h2>
        </div>
        <div class="bg-blue-100 p-6 rounded-xl shadow-lg flex-1">
          <p class="text-gray-800">
            <span v-if="loadingRevenue" class="skeleton-loader inline-block w-52 h-5 rounded"></span>
            <span v-else>Total pendapatan tahun {{ currentYear }}</span>
          </p>
          <h2 class="revenue text-3xl text-black">
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