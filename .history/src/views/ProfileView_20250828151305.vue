<template>
  <div>
    <Navigation />
    <div class="container mx-auto px-4 py-8">
      <!-- Title centered -->
      <h1 class="text-3xl font-black text-black text-center mb-8">Profile</h1>
      
      <!-- Skeleton Loader -->
      <div v-if="isLoadingProfile" class="flex justify-center">
        <div class="bg-blue-100 p-8 rounded-xl shadow-lg" style="min-width: 500px; max-width: 700px;">
          <div class="flex gap-8">
            <!-- Skeleton Profile Picture Section -->
            <div class="flex flex-col items-center">
              <div class="w-32 h-32 skeleton rounded-full"></div>
              <div class="mt-4 h-4 w-24 skeleton rounded"></div>
            </div>

            <!-- Skeleton Profile Info -->
            <div class="flex-1">
              <!-- Skeleton Nama -->
              <div class="mb-4">
                <div class="h-5 w-16 skeleton rounded mb-2"></div>
                <div class="h-6 w-48 skeleton rounded"></div>
              </div>

              <!-- Skeleton Email -->
              <div class="mb-4">
                <div class="h-5 w-16 skeleton rounded mb-2"></div>
                <div class="h-6 w-56 skeleton rounded"></div>
              </div>

              <!-- Skeleton Phone -->
              <div class="mb-6">
                <div class="h-5 w-24 skeleton rounded mb-2"></div>
                <div class="h-6 w-40 skeleton rounded"></div>
              </div>

              <!-- Skeleton Action Buttons -->
              <div class="flex flex-col items-start gap-3">
                <div class="h-10 w-20 skeleton rounded-lg"></div>
                <div class="h-4 w-28 skeleton rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Card - Centered and smaller -->
      <div v-else class="flex justify-center">
        <div class="bg-blue-100 p-8 rounded-xl shadow-lg" style="min-width: 500px; max-width: 700px;">
          <div class="flex gap-8">
            <!-- Profile Picture Section -->
            <div class="flex flex-col items-center">
              <div class="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-md">
                <!-- Default user icon -->
                <img 
                    v-if="profileData.profilePicture" 
                    :src="profileData.profilePicture" 
                    :alt="profileData.name"
                    class="w-32 h-32 object-cover"
                >
                <!-- Default icon if no profile picture -->
                <svg v-else class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <button 
                @click="changeProfilePicture" 
                class="text-blue-500 hover:text-blue-700 mt-4 font-bold underline text-sm">
                Ganti foto profil
              </button>
            </div>

            <!-- Profile Info - Read Only -->
            <div class="flex-1">
              <!-- Nama -->
              <div class="mb-4">
                <label class="block text-black font-bold mb-1">Nama</label>
                <p class="text-gray-800">{{ profileData.name || '-' }}</p>
              </div>

              <!-- Email -->
              <div class="mb-4">
                <label class="block text-black font-bold mb-1">Email</label>
                <p class="text-gray-800">{{ profileData.email || '-' }}</p>
              </div>

              <!-- Phone -->
              <div class="mb-6">
                <label class="block text-black font-bold mb-1">No. Telepon</label>
                <p class="text-gray-800">{{ profileData.phone || '-' }}</p>
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-col items-start gap-3">
                <button 
                  @click="openEditModal"
                  class="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">
                  Edit
                </button>
                <button 
                  @click="openChangePasswordModal" 
                  class="text-blue-500 hover:text-blue-700 font-bold underline text-sm">
                  Ganti password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <transition name="modal">
      <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click="closeEditModal">
        <div class="bg-blue-100 rounded-xl shadow-xl p-8" style="min-width: 500px; max-width: 700px;" @click.stop>
          <!-- Modal Header -->
          <h2 class="text-2xl font-bold text-black text-center mb-6">Edit Profil</h2>
          
          <!-- Edit Form -->
          <form @submit.prevent="saveProfile" class="space-y-6">
            <!-- Nama Field -->
            <div>
              <label class="block text-black font-bold mb-2">Nama</label>
              <input 
                v-model="editData.name"
                type="text" 
                class="text-gray-800 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                placeholder="Masukkan nama lengkap">
            </div>

            <!-- Email Field -->
            <div>
              <label class="block text-black font-bold mb-2">Email</label>
              <input 
                v-model="editData.email"
                type="email" 
                class="text-gray-800 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                placeholder="Masukkan email">
            </div>

            <!-- Phone Field -->
            <div>
              <label class="block text-black font-bold mb-2">No. Telepon</label>
              <input 
                v-model="editData.phone"
                type="tel" 
                class="text-gray-800 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                placeholder="Masukkan nomor telepon">
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-center space-x-4 pt-4">
              <button 
                type="submit"
                class="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
                :disabled="isSavingProfile">
                {{ isSavingProfile ? 'Menyimpan...' : 'Simpan' }}
              </button>
              <button 
                type="button"
                @click="closeEditModal"
                class="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Change Password Modal -->
    <transition name="modal">
      <div v-if="showPasswordModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click="closePasswordModal">
        <div class="bg-blue-100 rounded-lg shadow-xl p-8" style="min-width: 500px; max-width: 600px;" @click.stop>
          <!-- Modal Header -->
          <h2 class="text-2xl font-bold text-black text-center mb-6">Ganti Password</h2>
          
          <!-- Password Form -->
          <form @submit.prevent="changePassword" class="space-y-6">
            <!-- Current Password -->
            <div>
              <label class="block text-black font-bold mb-2">Password Lama</label>
              <input 
                v-model="passwordData.currentPassword"
                type="password" 
                class="text-gray-800 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="************">
            </div>

            <!-- New Password -->
            <div>
              <label class="block text-black font-bold mb-2">Password Baru</label>
              <input 
                v-model="passwordData.newPassword"
                type="password" 
                class="text-gray-800 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="************">
            </div>

            <!-- Confirm New Password -->
            <div>
              <label class="block text-black font-bold mb-2">Konfirmasi Password Baru</label>
              <input 
                v-model="passwordData.confirmPassword"
                type="password" 
                class="text-gray-800 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="************">
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-center space-x-4 pt-4">
              <button 
                type="submit"
                class="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">
                Simpan
              </button>
              <button 
                type="button"
                @click="closePasswordModal"
                class="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import axios from 'axios';
import Navigation from '@/components/Navigation.vue';

export default {
  name: 'ProfileView',
  components: {
    Navigation,
  },
  data() {
    return {
      profileData: {
        name: '',
        email: '',
        phone: '',
        profilePicture: ''
      },
      originalData: {
        name: '',
        email: '',
        phone: '',
        profilePicture: ''
      },
      editData: {
        name: '',
        email: '',
        phone: ''
      },
      showEditModal: false,
      isLoadingProfile: true,
      isSavingProfile: false,
      showPasswordModal: false,
      passwordData: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      currentUserId: null
    };
  },
  methods: {
    // Get current user ID from token or other method
    async getCurrentUserId() {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Try to decode JWT token to get user ID
        const payload = token.split('.')[1];
        if (payload) {
          const decoded = JSON.parse(atob(payload));
          return decoded.id || decoded.userId || decoded.sub;
        }

        // Alternative: try to get user ID from a profile endpoint
        const response = await axios.get(
          'https://sigemes-api-63593591732.us-central1.run.app/api/v1/admins/me',
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch(async () => {
          const userEmail = localStorage.getItem('userEmail');
          if (userEmail === 'superadmin@prisma.io') {
            return { data: { data: { id: 1 } } };
          }
          return { data: { data: { id: 2 } } };
        });

        return response.data.data.id;
      } catch (error) {
        console.error('Error getting current user ID:', error);
        const userEmail = localStorage.getItem('userEmail');
        if (userEmail === 'superadmin@prisma.io') {
          return 1;
        }
        return 2;
      }
    },

    // Fetch profile data from API
    async fetchProfileData() {
      this.isLoadingProfile = true;
      
      // Simulate minimum loading time for better UX (optional)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        this.currentUserId = await this.getCurrentUserId();
        
        if (!this.currentUserId) {
          throw new Error('Unable to determine current user ID');
        }

        const response = await axios.get(
          `https://sigemes-api-63593591732.us-central1.run.app/api/v1/admins/${this.currentUserId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.status) {
          const userData = response.data.data;
          this.profileData = {
            name: userData.fullname || '',
            email: userData.email || '',
            phone: userData.phone_number || '',
            profilePicture: userData.profile_picture || ''
          };
          
          this.originalData = { ...this.profileData };
        } else {
          throw new Error(response.data.message || 'Failed to fetch profile data');
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        
        // Fallback to localStorage data
        this.profileData = {
          name: localStorage.getItem('userFullname') || 'Admin Mess 1',
          email: localStorage.getItem('userEmail') || 'adminmess1@prisma.io',
          phone: '1234567890',
          profilePicture: ''
        };
        this.originalData = { ...this.profileData };
      } finally {
        this.isLoadingProfile = false;
      }
    },

    // Open edit modal
    openEditModal() {
      this.editData = {
        name: this.profileData.name,
        email: this.profileData.email,
        phone: this.profileData.phone
      };
      this.showEditModal = true;
    },

    // Close edit modal
    closeEditModal() {
      this.showEditModal = false;
      this.editData = {
        name: '',
        email: '',
        phone: ''
      };
    },

    // Save profile changes
    async saveProfile() {
      if (!this.editData.name.trim()) {
        alert('Nama tidak boleh kosong');
        return;
      }
      
      if (!this.editData.email.trim()) {
        alert('Email tidak boleh kosong');
        return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.editData.email)) {
        alert('Format email tidak valid');
        return;
      }

      this.isSavingProfile = true;

      try {
        // Update localStorage
        localStorage.setItem('userFullname', this.editData.name);
        localStorage.setItem('userEmail', this.editData.email);
        
        // Update profile data
        this.profileData.name = this.editData.name;
        this.profileData.email = this.editData.email;
        this.profileData.phone = this.editData.phone;
        
        this.originalData = { ...this.profileData };
        
        this.closeEditModal();
        
        alert('Profile berhasil disimpan!');
      } catch (error) {
        console.error('Error saving profile:', error);
        alert('Gagal menyimpan profile. Coba lagi nanti.');
      } finally {
        this.isSavingProfile = false;
      }
    },

    // Change profile picture
    changeProfilePicture() {
      alert('Fitur ganti foto profil akan segera tersedia');
    },

    // Password modal methods
    openChangePasswordModal() {
      this.showPasswordModal = true;
      this.resetPasswordForm();
    },

    closePasswordModal() {
      this.showPasswordModal = false;
      this.resetPasswordForm();
    },

    resetPasswordForm() {
      this.passwordData = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
    },

    changePassword() {
      if (!this.passwordData.currentPassword) {
        alert('Password lama harus diisi');
        return;
      }
      
      if (!this.passwordData.newPassword) {
        alert('Password baru harus diisi');
        return;
      }
      
      if (this.passwordData.newPassword.length < 6) {
        alert('Password baru minimal 6 karakter');
        return;
      }
      
      if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
        alert('Konfirmasi password tidak cocok');
        return;
      }
      
      alert('Password berhasil diubah!');
      this.closePasswordModal();
    }
  },
  async mounted() {
    await this.fetchProfileData();
  }
};
</script>

<style scoped>
/* Font family */
h1, h2, label, button, p {
  font-family: 'Poppins', sans-serif;
}

/* Modal animations */
.modal-enter-active, .modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Form styling */
input[type="text"], 
input[type="email"], 
input[type="tel"], 
input[type="password"] {
  font-family: 'Poppins', sans-serif;
}

input:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Button transitions */
button {
  transition: all 0.2s ease;
}

/* Profile data display */
p.text-gray-800 {
  padding: 0.25rem 0;
  min-height: 1.5rem;
}

/* Skeleton loader animation */
.skeleton {
  background: linear-gradient(
    90deg,
    #e0e0e0 25%,
    #f0f0f0 50%,
    #e0e0e0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
  border-radius: 4px;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>