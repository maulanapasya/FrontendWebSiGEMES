<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Tambahkan Logo -->
      <img src="@/assets/sigemesapp.png" alt="Logo" class="logo" />

      <h1 class="title text-black ">SiGEMES Admin</h1>

      <form @submit.prevent="validateAndLogin">
        <div class="form-group">
          <label for="email">Alamat Email</label>
          <input
            id="email"
            v-model="email"
            type="text"
            placeholder="Masukkan email"
            @blur="validateEmailField"
            @input="checkEmailValidity"
          />
          <span v-if="emailError" class="error-text">{{ emailError }}</span>
        </div>

        <div class="form-group">
          <label for="password">Kata Sandi</label>
          <div class="password-wrapper">
            <input
              id="password"
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              placeholder="Masukkan password"
              @input="clearPasswordError"
            />
            <span class="toggle-password" @click="togglePassword">
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </span>
          </div>
          <span v-if="passwordError" class="error-text">{{ passwordError }}</span>
        </div>

        <button type="submit" class="login-button" :disabled="isLoading">
          {{ isLoading ? "Memproses..." : "Masuk" }}
        </button>
      </form>

      <!-- Area menampilkan error / notifikasi login gagal -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import '@/styles/LoginView.css';

export default {
  name: 'LoginView',
  data() {
    return {
      email: '',
      password: '',
      errorMessage: '',
      passwordError: '',
      showPassword: false, // Menampilkan / menyembunyikan password
      isLoading: false, // Menampilkan loading saat login
      emailError: '', // Error message for email validation
    };
  },
  methods: {
    clearPasswordError() {
      if (this.passwordError) {
        this.passwordError = '';
      }
    },
    togglePassword() {
      this.showPassword = !this.showPassword;
    },
    validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(String(email).toLowerCase());
    },
    checkEmailValidity() {
      // Jika email kosong atau sudah valid, hapus pesan error
      if (!this.email || this.validateEmail(this.email)) {
        this.emailError = '';
      }
    },
    validateAndLogin() {
      // Reset error messages
      this.emailError = '';
      this.errorMessage = '';
      this.passwordError = '';

      // Validasi email
      if (!this.validateEmail(this.email)) {
        this.emailError = "Masukkan alamat email yang valid.";
        return;
      }

      // Validasi password
      if (!this.password) {
        this.passwordError = "Kata sandi tidak boleh kosong.";
        return;
      }

      // Lanjutkan ke proses login
      this.login();
    },
    async login() {
      this.errorMessage = ''; // Reset error message
      this.isLoading = true; // Aktifkan loading state

      try {
        const response = await axios.post(
          'https://sigemes-api-63593591732.us-central1.run.app/api/v1/admins/login',
          {
            email: this.email,
            password: this.password,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        // Pastikan response memiliki data yang diharapkan
        if (response.data && response.data.status) {
          const { token } = response.data.data;

          // Simpan token ke localStorage
          localStorage.setItem('authToken', token);

          // Arahkan ke halaman dashboard
          this.$router.push('/dashboard');
        } else {
          this.errorMessage = 'Login gagal! Respons server tidak valid.';
        }
      } catch (error) {
        if (error.response) {
          this.errorMessage = error.response.data?.message || 'Login gagal! Periksa kembali email dan kata sandi Anda.';
        } else {
          this.errorMessage = 'Terjadi kesalahan jaringan. Coba lagi nanti.';
        }
      } finally {
        this.isLoading = false; // Matikan loading state
      }
    }
  }
};
</script>
