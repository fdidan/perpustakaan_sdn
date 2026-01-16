<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { BookOpen, UserPlus, Eye, EyeOff } from 'lucide-vue-next';
import { authAPI } from '../services/api';
import { useAuthStore } from '../stores/auth';
import { showToast } from '../utils/toast';

const router = useRouter();
const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const loading = ref(false);
const error = ref('');

const handleRegister = async () => {
  if (!username.value || !password.value || !confirmPassword.value) {
    error.value = 'Semua field harus diisi';
    showToast.error(error.value);
    return;
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Password tidak cocok';
    showToast.error(error.value);
    return;
  }

  if (password.value.length < 6) {
    error.value = 'Password minimal 6 karakter';
    showToast.error(error.value);
    return;
  }

  try {
    loading.value = true;
    error.value = '';
    
    // Register dengan role siswa (default)
    await authAPI.register(username.value, password.value, 'siswa');
    
    // Auto login setelah register
    const loginResponse = await authAPI.login(username.value, password.value);
    localStorage.setItem('token', loginResponse.data.token);
    localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
    
    authStore.setUser(loginResponse.data.user);
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    showToast.success('Registrasi berhasil! Selamat datang!');
    await router.push('/');
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Registrasi gagal. Silakan coba lagi.';
    showToast.error(error.value);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center px-4 py-12">
    <div class="max-w-md w-full">
      <!-- Logo & Title -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center mb-6">
          <div class="relative">
            <div class="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl blur-xl opacity-20"></div>
            <div class="relative p-4 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl">
              <BookOpen class="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Buat Akun Baru</h1>
        <p class="text-gray-600">Bergabung dengan Perpustakaan Cemerlang</p>
      </div>

      <!-- Register Card -->
      <div class="bg-white rounded-3xl border border-gray-200 shadow-xl shadow-gray-200/50 p-8">
        <form @submit.prevent="handleRegister" class="space-y-6">
          <!-- Error Message -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p class="text-sm text-red-800 font-medium">{{ error }}</p>
          </div>

          <!-- Username -->
          <div>
            <label for="username" class="block text-sm font-semibold text-gray-900 mb-2">
              Username
            </label>
            <input
              id="username"
              v-model="username"
              type="text"
              placeholder="Pilih username"
              class="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none transition-all text-gray-900 placeholder:text-gray-400"
              :disabled="loading"
            />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-semibold text-gray-900 mb-2">
              Password
            </label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Minimal 6 karakter"
                class="w-full px-4 py-3.5 pr-12 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                :disabled="loading"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                :disabled="loading"
              >
                <Eye v-if="!showPassword" class="h-5 w-5" />
                <EyeOff v-else class="h-5 w-5" />
              </button>
            </div>
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="block text-sm font-semibold text-gray-900 mb-2">
              Konfirmasi Password
            </label>
            <div class="relative">
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Ketik ulang password"
                class="w-full px-4 py-3.5 pr-12 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                :disabled="loading"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                :disabled="loading"
              >
                <Eye v-if="!showConfirmPassword" class="h-5 w-5" />
                <EyeOff v-else class="h-5 w-5" />
              </button>
            </div>
          </div>

          <!-- Info Badge -->
          <div class="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <p class="text-sm text-blue-800 text-center">
              Akun akan terdaftar sebagai <span class="font-semibold">Siswa</span>
            </p>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-gradient-to-r from-gray-900 to-gray-700 text-white py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-gray-900/30 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus v-if="!loading" class="h-5 w-5" />
            <div v-else class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span>{{ loading ? 'Memproses...' : 'Daftar' }}</span>
          </button>
        </form>

        <!-- Login Link -->
        <div class="mt-8 text-center">
          <p class="text-sm text-gray-600">
            Sudah punya akun?
            <router-link to="/login" class="ml-1 font-semibold text-gray-900 hover:underline">
              Masuk sekarang
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>