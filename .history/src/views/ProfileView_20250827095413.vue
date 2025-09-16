<template>
  <div>
    <Navigation />
    <div class="container mt-6 mx-auto px-6 py-8">
      <h1 class="text-3xl font-black text-black mb-8">Profile</h1>
      
      <!-- Profile Form -->
      <div class="bg-blue-100 p-8 rounded-xl shadow-xl max-w-4xl">
        <div class="flex gap-8">
          <!-- Profile Picture Section -->
          <div class="flex flex-col items-center">
            <div class="w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-lg mb-6">
              <!-- Default user icon -->
              <svg class="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <button 
              @click="changeProfilePicture" 
              class="text-blue-500 hover:text-blue-700 mb-3 font-medium underline">
              Ganti foto profil
            </button>
            <button 
              @click="openChangePasswordModal" 
              class="text-blue-500 hover:text-blue-700 font-medium underline">
              Ganti password
            </button>
          </div>

          <!-- Form Fields -->
          <div class="flex-1">
            <form @submit.prevent="saveProfile" class="space-y-6">
              <!-- Nama Field -->
              <div>
                <label class="block text-black font-bold mb-2">Nama</label>
                <input 
                  v-model="profileData.name"
                  type="text" 
                  class="text-black w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Masukkan nama lengkap">
              </div>

              <!-- Email Field -->
              <div>
                <label class="block text-black font-bold mb-2">Email</label>
                <input 
                  v-model="profileData.email"
                  type="email" 
                  class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Masukkan email">
              </div>

              <!-- Phone Field -->
              <div>
                <label class="block text-black font-bold mb-2">No. Telepon</label>
                <input 
                  v-model="profileData.phone"
                  type="tel" 
                  class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Masukkan nomor telepon">
              </div>

              <!-- Action Buttons -->
              <div class="flex space-x-4 pt-4">
                <button 
                  type="submit"
                  class="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">
                  Simpan
                </button>
                <button 
                  type="button"
                  @click="cancelEdit"
                  class="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <transition name="modal">
      <div v-if="showPasswordModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click="closePasswordModal">
        <div class="bg-white rounded-lg max-w-2xl w-full p-6" @click.stop>
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
                class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="************">
            </div>

            <!-- New Password -->
            <div>
              <label class="block text-black font-bold mb-2">Password Baru</label>
              <input 
                v-model="passwordData.newPassword"
                type="password" 
                class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="************">
            </div>

            <!-- Confirm New Password -->
            <div>
              <label class="block text-black font-bold mb-2">Konfirmasi Password Baru</label>
              <input 
                v-model="passwordData.confirmPassword"
                type="password" 
                class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
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
        phone: ''
      },
      originalData: {
        name: '',
        email: '',
        phone: ''
      },
      showPasswordModal: false,
      passwordData: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    };
  },
  methods: {
    loadProfileData() {
      // Load profile data from localStorage or set defaults
      this.profileData.name = localStorage.getItem('userFullname') || '';
      this.profileData.email = localStorage.getItem('userEmail') || '';
      this.profileData.phone = ''; // This would come from API normally
      
      // Store original data for cancel functionality
      this.originalData = { ...this.profileData };
    },
    saveProfile() {
      // Validate form data
      if (!this.profileData.name.trim()) {
        alert('Nama tidak boleh kosong');
        return;
      }
      
      if (!this.profileData.email.trim()) {
        alert('Email tidak boleh kosong');
        return;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.profileData.email)) {
        alert('Format email tidak valid');
        return;
      }
      
      // Here you would normally make API call to save profile
      console.log('Saving profile:', this.profileData);
      
      // Update localStorage
      localStorage.setItem('userFullname', this.profileData.name);
      localStorage.setItem('userEmail', this.profileData.email);
      
      // Update original data
      this.originalData = { ...this.profileData };
      
      alert('Profile berhasil disimpan!');
    },
    cancelEdit() {
      // Reset form to original data
      this.profileData = { ...this.originalData };
      alert('Perubahan dibatalkan');
    },
    changeProfilePicture() {
      // This would normally open file picker
      alert('Fitur ganti foto profil akan segera tersedia');
    },
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
      // Validate password form
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
      
      // Here you would normally make API call to change password
      console.log('Changing password');
      
      alert('Password berhasil diubah!');
      this.closePasswordModal();
    }
  },
  mounted() {
    this.loadProfileData();
  }
};
</script>

<style scoped>
/* Use the same font family as dashboard */
h1, label, button {
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

/* Form styling consistency */
input[type="text"], 
input[type="email"], 
input[type="tel"], 
input[type="password"] {
  font-family: 'Poppins', sans-serif;
}

input:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Button styling consistency */
button {
  transition: background-color 0.2s ease;
}

/* Fixed positioning for modal */
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
</style>