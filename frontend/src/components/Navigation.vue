<!-- Navigation.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { LogOut, LayoutDashboard, Menu, X, User, Eye } from 'lucide-vue-next';
import { authAPI } from '../services/api';
import { useAuthStore } from '../stores/auth';
import { showToast } from '../utils/toast';

const router = useRouter();
const authStore = useAuthStore();
const mobileMenuOpen = ref(false);

const isAuthenticated = computed(() => !!authStore.user);
const isPustakawan = computed(() => authStore.user?.role === 'pustakawan');

const handleLogout = async () => {
  try {
    await authAPI.logout();
    showToast.success('Logout berhasil!');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    authStore.clearUser();
    router.push('/');
  }
};

const navigateTo = (path: string) => {
  router.push(path);
  mobileMenuOpen.value = false;
};
</script>

<template>
  <nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/80">
    <div class="max-w-[1400px] mx-auto px-6 lg:px-8">
      <div class="flex justify-between h-20">
        <!-- Logo dengan Tut Wuri Handayani -->
        <div class="flex items-center">
          <button @click="navigateTo('/')" class="flex items-center space-x-3 group">
            <!-- Logo Tut Wuri Handayani -->
            <div class="relative">
              <div class="absolute inset-0 bg-blue-900/10 rounded-xl blur group-hover:bg-blue-900/20 transition-all"></div>
              <img 
                src="/tut-wuri-handayani.png" 
                alt="Logo Tut Wuri Handayani"
                class="relative h-12 w-12 object-contain"
                @error="(e) => (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2245%22 fill=%22%231e3a8a%22/%3E%3C/svg%3E'"
              />
            </div>
            <div class="flex flex-col">
              <span class="font-bold text-lg text-gray-900 leading-tight">Perpustakaan Cemerlang</span>
              <span class="text-xs text-gray-600 leading-tight">SD Negeri 2 Ganungkidul Nganjuk</span>
            </div>
          </button>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-2">
          <button
            @click="navigateTo('/')"
            class="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            Katalog
          </button>

          <template v-if="isAuthenticated">
            <button
              @click="navigateTo('/history')"
              class="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
            >
              <Eye class="h-4 w-4" />
              <span>Riwayat</span>
            </button>

            <button
              v-if="isPustakawan"
              @click="navigateTo('/dashboard')"
              class="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
            >
              <LayoutDashboard class="h-4 w-4" />
              <span>Dashboard</span>
            </button>

            <div class="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
              <button
                @click="navigateTo('/profile')"
                class="flex items-center space-x-2.5 hover:bg-gray-50 rounded-xl px-3 py-2 transition-colors"
              >
                <div class="w-9 h-9 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
                  <User class="h-4 w-4 text-white" />
                </div>
                <div class="flex flex-col text-left">
                  <span class="text-sm font-semibold text-gray-900">{{ authStore.user.username }}</span>
                  <span class="text-xs text-gray-500">{{ authStore.user.role }}</span>
                </div>
              </button>
              <button
                @click="handleLogout"
                class="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
              >
                <LogOut class="h-4 w-4" />
                <span>Keluar</span>
              </button>
            </div>
          </template>

          <template v-else>
            <button
              @click="navigateTo('/login')"
              class="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
            >
              Masuk
            </button>
            <button
              @click="navigateTo('/register')"
              class="px-5 py-2.5 rounded-xl text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition shadow-sm"
            >
              Daftar
            </button>
          </template>
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden flex items-center">
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="p-2 rounded-xl hover:bg-gray-100 transition"
          >
            <Menu v-if="!mobileMenuOpen" class="h-6 w-6" />
            <X v-else class="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <div v-if="mobileMenuOpen" class="md:hidden border-t border-gray-200 bg-white">
      <div class="px-6 py-4 space-y-2">
        <button
          @click="navigateTo('/')"
          class="block w-full text-left px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-100 transition"
        >
          Katalog
        </button>

        <template v-if="isAuthenticated">
          <button
            @click="navigateTo('/history')"
            class="flex items-center space-x-2 w-full px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            <Eye class="h-4 w-4" />
            <span>Riwayat Bacaan</span>
          </button>

          <button
            v-if="isPustakawan"
            @click="navigateTo('/dashboard')"
            class="flex items-center space-x-2 w-full px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            <LayoutDashboard class="h-4 w-4" />
            <span>Dashboard</span>
          </button>

          <div class="px-4 py-3 border-t mt-2 pt-4">
            <button
              @click="navigateTo('/profile')"
              class="flex items-center space-x-3 mb-3 w-full hover:bg-gray-50 rounded-xl p-2 transition-colors"
            >
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
                <User class="h-5 w-5 text-white" />
              </div>
              <div class="flex flex-col text-left">
                <span class="font-semibold text-gray-900">{{ authStore.user.username }}</span>
                <span class="text-sm text-gray-500">{{ authStore.user.role }}</span>
              </div>
            </button>
            <button
              @click="handleLogout"
              class="flex items-center justify-center space-x-2 w-full px-4 py-3 rounded-xl text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition"
            >
              <LogOut class="h-4 w-4" />
              <span>Keluar</span>
            </button>
          </div>
        </template>

        <template v-else>
          <button
            @click="navigateTo('/login')"
            class="block w-full text-left px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            Masuk
          </button>
          <button
            @click="navigateTo('/register')"
            class="block w-full text-left px-4 py-3 rounded-xl text-base font-medium bg-gray-900 text-white hover:bg-gray-800 transition"
          >
            Daftar
          </button>
        </template>
      </div>
    </div>
  </nav>
</template>