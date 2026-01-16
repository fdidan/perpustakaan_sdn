<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { User, Lock, ArrowLeft, Eye, EyeOff, Shield, Calendar } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import { usersAPI } from '../services/api';
import { showToast, showConfirm } from '../utils/toast';

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  username: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const loading = ref(false);

onMounted(() => {
  if (!authStore.user) {
    router.push('/login');
    return;
  }
  form.value.username = authStore.user.username;
});

const handleUpdateProfile = () => {
  showConfirm(
    'Konfirmasi Perubahan',
    'Apakah Anda yakin ingin mengubah informasi profil?',
    async () => {
      try {
        loading.value = true;

        const updateData: any = {};
        
        if (form.value.username !== authStore.user?.username) {
          updateData.username = form.value.username;
        }

        if (form.value.newPassword) {
          if (!form.value.currentPassword) {
            showToast.error('Password saat ini harus diisi');
            loading.value = false;
            return;
          }

          if (form.value.newPassword !== form.value.confirmPassword) {
            showToast.error('Password baru tidak cocok');
            loading.value = false;
            return;
          }

          if (form.value.newPassword.length < 6) {
            showToast.error('Password minimal 6 karakter');
            loading.value = false;
            return;
          }

          updateData.password = form.value.newPassword;
        }

        if (Object.keys(updateData).length === 0) {
          showToast.warning('Tidak ada perubahan');
          loading.value = false;
          return;
        }

        await usersAPI.update(authStore.user!.id, updateData);

        if (updateData.username) {
          const updatedUser = { ...authStore.user!, username: updateData.username };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          authStore.setUser(updatedUser);
        }

        showToast.success('Profil berhasil diperbarui!');
        
        form.value.currentPassword = '';
        form.value.newPassword = '';
        form.value.confirmPassword = '';

      } catch (error: any) {
        showToast.error(error.response?.data?.error || 'Gagal memperbarui profil');
      } finally {
        loading.value = false;
      }
    }
  );
};

const goBack = () => {
  if (authStore.user?.role === 'pustakawan') {
    router.push('/dashboard');
  } else {
    router.push('/');
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4">
    <div class="max-w-2xl mx-auto">
      <!-- Back Button -->
      <button
        @click="goBack"
        class="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-gray-700 hover:bg-white hover:shadow-sm transition-all mb-8 group"
      >
        <ArrowLeft class="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        <span class="font-medium">Kembali</span>
      </button>

      <!-- Profile Card -->
      <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <!-- Header Section -->
        <div class="relative bg-gradient-to-br from-gray-50 to-white p-8 border-b border-gray-200">
          <!-- Avatar -->
          <div class="flex flex-col items-center">
            <div class="relative mb-4">
              <div class="w-24 h-24 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center ring-4 ring-gray-100">
                <User class="h-12 w-12 text-white" />
              </div>
              <!-- Online indicator -->
              <div class="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-white"></div>
            </div>
            
            <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ authStore.user?.username }}</h1>
            
            <!-- Role Badge -->
            <div
              :class="[
                'inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold border-2',
                authStore.user?.role === 'pustakawan'
                  ? 'bg-purple-50/50 text-purple-900 border-purple-200'
                  : 'bg-blue-50/50 text-blue-900 border-blue-200'
              ]"
            >
              <Shield class="h-4 w-4" />
              <span>{{ authStore.user?.role === 'pustakawan' ? 'Pustakawan' : 'Siswa' }}</span>
            </div>
          </div>
        </div>

        <!-- Form Section -->
        <form @submit.prevent="handleUpdateProfile" class="p-8 space-y-8">
          <!-- Account Information -->
          <div class="space-y-4">
            <h2 class="text-lg font-semibold text-gray-900 flex items-center space-x-2 pb-3 border-b border-gray-200">
              <User class="h-5 w-5 text-gray-600" />
              <span>Informasi Akun</span>
            </h2>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                v-model="form.username"
                type="text"
                class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none transition-all text-gray-900 bg-white"
                :disabled="loading"
              />
            </div>
          </div>

          <!-- Security Section -->
          <div class="space-y-4">
            <h2 class="text-lg font-semibold text-gray-900 flex items-center space-x-2 pb-3 border-b border-gray-200">
              <Lock class="h-5 w-5 text-gray-600" />
              <span>Keamanan</span>
            </h2>

            <!-- Current Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Password Saat Ini
              </label>
              <div class="relative">
                <input
                  v-model="form.currentPassword"
                  :type="showCurrentPassword ? 'text' : 'password'"
                  placeholder="Masukkan password saat ini"
                  class="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none transition-all text-gray-900 placeholder:text-gray-400 bg-white"
                  :disabled="loading"
                />
                <button
                  type="button"
                  @click="showCurrentPassword = !showCurrentPassword"
                  class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Eye v-if="!showCurrentPassword" class="h-5 w-5" />
                  <EyeOff v-else class="h-5 w-5" />
                </button>
              </div>
            </div>

            <!-- New Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Password Baru
              </label>
              <div class="relative">
                <input
                  v-model="form.newPassword"
                  :type="showNewPassword ? 'text' : 'password'"
                  placeholder="Minimal 6 karakter"
                  class="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none transition-all text-gray-900 placeholder:text-gray-400 bg-white"
                  :disabled="loading"
                />
                <button
                  type="button"
                  @click="showNewPassword = !showNewPassword"
                  class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Eye v-if="!showNewPassword" class="h-5 w-5" />
                  <EyeOff v-else class="h-5 w-5" />
                </button>
              </div>
            </div>

            <!-- Confirm New Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Konfirmasi Password Baru
              </label>
              <div class="relative">
                <input
                  v-model="form.confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Ketik ulang password baru"
                  class="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none transition-all text-gray-900 placeholder:text-gray-400 bg-white"
                  :disabled="loading"
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Eye v-if="!showConfirmPassword" class="h-5 w-5" />
                  <EyeOff v-else class="h-5 w-5" />
                </button>
              </div>
            </div>

            <div class="bg-amber-50/50 border border-amber-200 rounded-xl p-4">
              <p class="text-sm text-amber-900">
                💡 Kosongkan kolom password jika tidak ingin mengubah password
              </p>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-gradient-to-r from-gray-900 to-gray-700 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-gray-900/30 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div v-if="loading" class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span>{{ loading ? 'Menyimpan...' : 'Simpan Perubahan' }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>