<template>
  <header class="navbar flex justify-between items-center px-6 py-3 shadow-md">
    <!-- Logo -->
    <img src="@/assets/sigemesapp.png" alt="Logo Pemda" class="w-16" />

    <!-- Navbar -->
    <nav>
      <ul class="flex space-x-6">
        <li>
          <router-link to="/dashboard" class="nav-link" :class="{ 'active': route.path === '/dashboard' }">
            Dashboard
          </router-link>
        </li>
        <li>
          <router-link to="/data-gedung-nasional" class="nav-link" :class="{ 'active': route.path === '/data-gedung-nasional' }">
            Daftar Gedung Nasional
          </router-link>
        </li>
        <li>
          <router-link to="/data-ruang-mess" class="nav-link" :class="{ 'active': route.path === '/data-ruang-mess' }">
            Daftar Gedung Mess
          </router-link>
        </li>
        <!-- Tampilkan Daftar Admin hanya untuk Superadmin -->
        <li v-if="isSuperAdmin">
          <router-link to="/data-admin" class="nav-link" :class="{ 'active': route.path === '/data-admin' }">
            Daftar Admin
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- Dropdown Profile & Logout -->
    <div class="relative">
      <button
        @click="toggleDropdown"
        class="bg-white border rounded-lg shadow-sm flex items-center gap-2 px-3 py-2 focus:outline-none hover:bg-gray-50 text-black"
        aria-haspopup="menu"
        :aria-expanded="dropdownOpen"
      >
        <span class="sr-only">Buka menu akun</span>

        <!-- Ikon user (outline) -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="1.5"
            class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round"
                d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 007.5 0z" />
          <path stroke-linecap="round" stroke-linejoin="round"
                d="M4.5 20.25a8.25 8.25 0 1116.5 0" />
        </svg>

        <!-- Chevron -->
        <svg class="w-4 h-4 transform transition-transform duration-200"
            :class="dropdownOpen ? 'rotate-180' : ''"
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd" />
        </svg>
      </button>

      <!-- Dropdown Menu -->
      <div v-if="dropdownOpen" class="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-md">
        <ul class="py-2">
          <li>
            <router-link to="/profile" class="block px-4 py-2 text-gray-700 hover:bg-gray-100">Profile</router-link>
          </li>
          <li>
            <button @click="logout" class="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>

  </header>
</template>

<script>
import { useRoute, useRouter } from 'vue-router';
import { ref, computed } from 'vue';

export default {
  name: 'Navigation',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const dropdownOpen = ref(false);

    // Ambil fullname dan role dari localStorage
    const userFullname = computed(() => localStorage.getItem('userFullname') || 'Admin');
    const userRole = computed(() => localStorage.getItem('userRole'));

    // Cek apakah user adalah superadmin
    const isSuperAdmin = computed(() => userRole.value === 'superadmin');

    const toggleDropdown = () => {
      dropdownOpen.value = !dropdownOpen.value;
    };

    const logout = () => {
      console.log("User logged out");
      dropdownOpen.value = false;
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userFullname');
      localStorage.removeItem('userRole');
      router.push('/');
    };

    return { route, router, dropdownOpen, toggleDropdown, logout, isSuperAdmin, userFullname };
  }
};
</script>


<style scoped>
#dropdown-menu {
  z-index: 1000;
}

.nav-link {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  color: #008BCD;
  padding-bottom: 4px;
  border-bottom: 2px solid transparent;
  transition: border-bottom 0.3s ease-in-out;
}

.nav-link:hover {
  border-bottom: 2px solid #008BCD;
}

.nav-link.active {
  border-bottom: 2px solid #008BCD;
}

.navbar  {
  background-color: #E8F9FF;
}
</style>
