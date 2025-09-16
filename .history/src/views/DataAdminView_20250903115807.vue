<template>
    <div>
        <Navigation />
        <div class="container mt-6 mx-auto px-6 py-8">
            <!-- Header & Tombol -->
            <div class="flex justify-between items-center">
                <h1 class="data-admin-text text-3xl font-black text-black">Daftar Admin</h1>
                <button @click="openCreateModal(Admin)" class="data-admin-text font-bold bg-blue-500 text-white px-5 py-2 text-sm rounded-lg hover:bg-blue-700">
                    Tambah Akun Admin
                </button>
            </div>

            <!-- Notifikasi Error -->
            <div v-if="errorMessage" class="text-red-600 bg-red-100 p-3 rounded-lg mt-4">
                {{ errorMessage }}
            </div>

            <!-- Tabel Data Admin -->
            <div class="mt-4 bg-blue-100 p-6 rounded-xl shadow-xl overflow-auto">
                <table class="w-full border-collapse">
                    <thead>
                        <tr class="data-admin-text text-white bg-blue-500 text-black">
                            <th class="py-2 px-4 border text-center font-bold">No</th>
                            <th class="py-2 px-4 border text-center font-bold">Nama</th>
                            <th class="py-2 px-4 border text-center font-bold">Email</th>
                            <th class="py-2 px-4 border text-center font-bold">Nomor Telepon</th>
                            <th class="py-2 px-4 border text-center font-bold">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(admin, index) in admins.slice(1)" :key="admin.id" class="bg-white text-black">
                            <td class="py-2 px-4 border text-center">{{ index + 1 }}</td>
                            <td class="py-2 px-4 border">{{ admin.fullname }}</td>
                            <td class="py-2 px-4 border">{{ admin.email }}</td>
                            <td class="py-2 px-4 border">{{ admin.phone_number }}</td>
                            <td class="py-2 px-4 border">
                                <div class="flex justify-evenly w-full data-admin-text">
                                    <button @click="openEditModal(admin)" class="text-blue-500">
                                        Edit
                                    </button>
                                    <button @click="openDeleteModal(admin)" class="text-red-500">
                                        Hapus
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- Loading -->
                <div v-if="isLoading" class="text-center font-semibold text-black mt-4 loading-container">
                    <span class="text-black loading-text">Memuat data...</span>
                </div>
            </div>
        </div>

        <!-- Modal Edit Admin -->
        <transition name="modal-fade">
            <div v-if="showEditModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                <div class="modal bg-blue-200 w-3/4 max-w-lg rounded-lg shadow-lg p-6 relative">
                    <h2 class="data-admin-text text-2xl font-bold text-center text-black mb-6">Edit Akun Admin</h2>
                    <form @submit.prevent="updateAdmin">
                        <div class="mb-4">
                            <label class="data-admin-text font-bold text-black block">Nama</label>
                            <input v-model="editAdmin.fullname" type="text" class="text-black w-full p-2 border rounded-lg" required />
                        </div>
                        <div class="mb-4">
                            <label class="data-admin-text font-bold text-black block">Email</label>
                            <input v-model="editAdmin.email" type="email" class="text-black w-full p-2 border rounded-lg" required />
                        </div>
                        <div class="mb-4">
                            <label class="data-admin-text font-bold text-black block">Password Baru</label>
                            <input v-model="editAdmin.password" type="password" class="text-black w-full p-2 border rounded-lg" placeholder="Kosongi jika tidak diganti" />
                        </div>
                        <div class="mb-6">
                            <label class="data-admin-text font-bold text-black block">Nomor Telepon</label>
                            <input v-model="editAdmin.phone_number" type="text" class="text-black w-full p-2 border rounded-lg" required />
                        </div>
                        <div class="flex justify-center space-x-4">
                            <button type="submit" class="data-admin-text font-semibold bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-700">
                                Simpan
                            </button>
                            <button type="button" @click="closeEditModal" class="data-admin-text font-semibold bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-700">
                                Batal
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </transition>

        <!-- Modal Buat Akun Admin -->
        <transition name="modal-fade">
            <div v-if="showCreateModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                <div class="modal w-3/4 max-w-lg rounded-lg shadow-lg p-6 relative">
                    <h2 class="data-admin-text text-2xl font-bold text-center text-black mb-6">Buat Akun Admin</h2>
                    <form @submit.prevent="createAdmin">
                        <div class="mb-4">
                            <label class="data-admin-text font-bold text-black block">Nama</label>
                            <input v-model="newAdmin.fullname" type="text" class="text-black w-full p-2 border rounded-lg" required />
                        </div>
                        <div class="mb-4">
                            <label class="data-admin-text font-bold text-black block">Email</label>
                            <input v-model="newAdmin.email" type="email" class="text-black w-full p-2 border rounded-lg" required />
                        </div>
                        <div class="mb-4">
                            <label class="data-admin-text font-bold text-black block">Nomor Telepon</label>
                            <input v-model="newAdmin.phone_number" type="tel" class="text-black w-full p-2 border rounded-lg" required />
                        </div>
                        <div class="mb-4">
                            <label class="data-admin-text font-bold text-black block">Password</label>
                            <input v-model="newAdmin.password" type="password" class="text-black w-full p-2 border rounded-lg" required />
                        </div>
                        <div class="mb-6">
                            <label class="data-admin-text font-bold text-black block">Ulangi Password</label>
                            <input v-model="newAdmin.confirmPassword" type="password" class="text-black w-full p-2 border rounded-lg" required />
                        </div>
                        <div class="flex justify-center space-x-4">
                            <button type="submit" class="font-semibold bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-700">
                                Buat Akun
                            </button>
                            <button @click="closeCreateModal" type="button" class="font-semibold bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-700">
                                Batal
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </transition>

        <!-- Modal Hapus Admin -->
        <transition name="modal-fade">
            <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                <div class="modal w-3/4 max-w-lg rounded-lg shadow-lg p-6 relative">
                    <h2 class="text-2xl font-bold text-center text-black mb-6">Hapus Akun Admin?</h2>
                    <p class="text-black"><strong>Nama:</strong> {{ deleteAdminData.fullname }}</p>
                    <p class="text-black"><strong>Email:</strong> {{ deleteAdminData.email }}</p>
                    <p class="text-black mb-6"><strong>Nomor Telepon:</strong> {{ deleteAdminData.phone_number }}</p>
                    <div class="flex justify-center space-x-4">
                        <button @click="deleteAdmin" class="font-semibold bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-700">
                            Hapus
                        </button>
                        <button @click="closeDeleteModal" class="font-semibold bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-700">
                            Batal
                        </button>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<style scoped>
/* Animasi Modal */
.modal-fade-enter-active, .modal-fade-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
    opacity: 0;
    transform: scale(0.9);
}

.modal {
    background-color: #E8F9FF;
}

.data-admin-text {
    font-family: 'Poppins', sans-serif;
}

.loading-container {
    width: 100%;
    text-align: center;
    margin-top: 1rem;
}

.loading-container {
  width: 100%;
  text-align: center;
  margin-top: 1rem;
}

/* Animasi loading pulse */
@keyframes pulse {
  0% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}

.loading-text {
  animation: pulse 0.8s infinite;
  display: inline-block;
}

</style>

<script>
import axios from 'axios';
import Navigation from '@/components/Navigation.vue';

export default {
    name: 'DataAdminView',
    components: { Navigation },
    data() {
        return {
            admins: [], // Daftar admin dari API
            isLoading: false, // Loading saat fetch data
            errorMessage: '', // Notifikasi error
            showEditModal: false, // Status modal edit
            showDeleteModal: false, // Status modal hapus
            showCreateModal: false, // Status modal buat
            deleteAdminData: null, // Data admin yang akan dihapus
            editAdmin: { fullname: '', email: '', password: '', phone_number: '' }, // Data admin yang diedit
            newAdmin: { fullname: '', email: '', phone_number: '', password: '', confirmPassword: ''}, // Data admin baru
        };
    },
    methods: {
        async fetchAdmins() {
            this.isLoading = true;
            this.errorMessage = '';

            try {
                const token = localStorage.getItem('authToken');
                if (!token) throw new Error('Token tidak ditemukan. Silakan login kembali.');

                const response = await axios.get(
                    'https://sigemes-api-63593591732.us-central1.run.app/api/v1/admins',
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (response.data.status) this.admins = response.data.data;
                else this.errorMessage = 'Gagal mengambil data admin.';
            } catch (error) {
                this.errorMessage = error.response?.data?.message || 'Gagal mengambil data. Coba lagi nanti.';
            } finally {
                this.isLoading = false;
            }
        },

        openEditModal(admin) {
            this.editAdmin = { ...admin, password: '' };
            this.showEditModal = true;
        },

        closeEditModal() {
            this.showEditModal = false;
            this.editAdmin = { fullname: '', email: '', password: '', phone_number: '' };
        },

        openDeleteModal(admin) {
            this.deleteAdminData = admin;
            this.showDeleteModal = true;
        },

        closeDeleteModal() {
            this.showDeleteModal = false;
            this.deleteAdminData = null;
        },

        openCreateModal() {
            this.showCreateModal = true;
        },

        closeCreateModal() {
            this.showCreateModal = false;
            this.newAdmin = {
                fullname: '',
                email: '',
                phone_number: '',
                password: '',
                confirmPassword: '',
            };
        },

        async createAdmin() {
            if (this.newAdmin.password !== this.newAdmin.confirmPassword) {
                alert('Password tidak cocok!');
                return;
            }

            try {
                this.isLoading = true;
                const token = localStorage.getItem('authToken');

                const response = await axios.post(
                    'https://sigemes-api-63593591732.us-central1.run.app/api/v1/admins',
                    {
                        email: this.newAdmin.email,
                        password: this.newAdmin.password,
                        fullname: this.newAdmin.fullname,
                        phone_number: this.newAdmin.phone_number,
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        }
                    }
                );

                if (response.data.status) {
                    alert('Akun admin berhasil dibuat!');
                    this.closeCreateModal();
                    this.fetchAdmins();
                }
            } catch (error) {
                const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat membuat admin';
                alert(errorMessage);
            } finally {
                this.isLoading = false;
            }
        },

        async updateAdmin() {
            try {
                // Get auth token
                const token = localStorage.getItem('authToken');
                
                if (!token) {
                    alert("Anda harus login terlebih dahulu!");
                    return;
                }
            
                // Create FormData untuk mengirim data
                const formData = new FormData();
                formData.append('email', this.editAdmin.email);
                formData.append('fullname', this.editAdmin.fullname);
                formData.append('phone_number', this.editAdmin.phone_number);
                
                // Hanya tambahkan password jika diisi
                if (this.editAdmin.password) {
                    formData.append('password', this.editAdmin.password);
                }
            
                // Kirim request ke API
                const response = await axios.put(
                    `https://sigemes-api-63593591732.us-central1.run.app/api/v1/admins/${this.editAdmin.id}`,
                    formData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data' // penting untuk FormData
                        }
                    }
                );
            
                if (response.data.status) {
                    // Update data admin di array
                    const index = this.admins.findIndex(admin => admin.id === this.editAdmin.id);
                    if (index !== -1) {
                        this.admins[index] = response.data.data;
                    }
                    
                    alert('Admin berhasil diperbarui!');
                    this.closeEditModal();
                } else {
                    alert(response.data.message || 'Gagal memperbarui admin');
                }
            } catch (error) {
                console.error("Error updating admin:", error);
                const errorMessage = error.response?.data?.message || 'Gagal memperbarui admin. Coba lagi nanti.';
                alert(errorMessage);
            }
        },

        async deleteAdmin() {
            try {
            // Ambil token dari localStorage
            const token = localStorage.getItem('authToken');
            
            if (!token) {
                alert("Anda harus login terlebih dahulu!");
                return;
            }
            
            // Tambahkan header Authorization
            const response = await axios.delete(
                `https://sigemes-api-63593591732.us-central1.run.app/api/v1/admins/${this.deleteAdminData.id}`,
                { 
                headers: { 
                    'Authorization': `Bearer ${token}` 
                } 
                }
            );
            
            if (response.data.status) {
                // Sukses - perbarui state dan tutup modal
                this.admins = this.admins.filter(admin => admin.id !== this.deleteAdminData.id);
                alert('Admin berhasil dihapus!');
                this.closeDeleteModal();
            } else {
                alert(response.data.message || 'Gagal menghapus admin');
            }
            } catch (error) {
            console.error("Error deleting admin:", error);
            const errorMessage = error.response?.data?.message || 'Gagal menghapus admin. Coba lagi nanti.';
            alert(errorMessage);
            }
        }
    },

    mounted() {
        this.fetchAdmins();
    },
};
</script>

