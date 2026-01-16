<script setup lang="ts">
import { useRouter } from 'vue-router';
import { BookOpen, Home, ArrowLeft, Search } from 'lucide-vue-next';
import Footer from '../components/Footer.vue';

const router = useRouter();

const goHome = () => {
  router.push('/');
};

const goBack = () => {
  router.go(-1);
};

const goToLogin = () => {
  router.push('/login');
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center px-4 py-10">
    <div class="max-w-lg w-full text-center">

      <!-- 404 Text -->
      <div class="mb-8">
        <h1 class="text-8xl md:text-9xl font-bold text-gray-900 mb-2">404</h1>
        <div class="h-1 w-24 bg-gradient-to-r from-amber-400 to-yellow-400 mx-auto rounded-full mb-6"></div>
        <h2 class="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Halaman Tidak Ditemukan</h2>
        <p class="text-gray-600 leading-relaxed max-w-md mx-auto">
          Maaf, halaman yang Anda cari tidak dapat ditemukan. Halaman mungkin telah dipindahkan, dihapus, atau Anda tidak memiliki akses ke halaman ini.
        </p>
      </div>

      <!-- Possible Reasons -->
      <div class="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 text-left">
        <h3 class="font-semibold text-amber-900 mb-3 flex items-center">
          <Search class="h-5 w-5 mr-2" />
          Kemungkinan Penyebab:
        </h3>
        <ul class="space-y-2 text-sm text-amber-800">
          <li class="flex items-start">
            <span class="mr-2">•</span>
            <span>URL yang Anda masukkan salah atau sudah tidak valid</span>
          </li>
          <li class="flex items-start">
            <span class="mr-2">•</span>
            <span>Halaman telah dipindahkan atau dihapus dari sistem</span>
          </li>
          <li class="flex items-start">
            <span class="mr-2">•</span>
            <span>Anda tidak memiliki akses ke halaman yang diminta (403 Forbidden)</span>
          </li>
        </ul>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          @click="goBack"
          class="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
        >
          <ArrowLeft class="h-5 w-5" />
          Kembali
        </button>
        <button
          @click="goHome"
          class="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-gray-900 to-gray-700 text-white font-semibold hover:shadow-lg hover:shadow-gray-900/30 transition-all"
        >
          <Home class="h-5 w-5" />
          Ke Beranda
        </button>
      </div>

      <!-- Additional Help -->
      <div class="mt-8 pt-8 border-t border-gray-200">
        <p class="text-sm text-gray-500 mb-3">Butuh bantuan?</p>
        <div class="flex items-center justify-center space-x-4 text-sm">
          <button 
            @click="goHome"
            class="text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            Lihat Katalog Buku
          </button>
          <span class="text-gray-300">•</span>
          <button 
            @click="goToLogin"
            class="text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  </div>
</template>