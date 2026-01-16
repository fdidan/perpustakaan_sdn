<script setup lang="ts">
</script>

<template>
  <footer class="bg-white border-t border-gray-200 mt-20">
    <div class="max-w-[1400px] mx-auto px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- About -->
        <div>
          <div class="flex items-center space-x-3 mb-4">
            <img 
              src="/tut-wuri-handayani.png" 
              alt="Logo" 
              class="h-10 w-10"
            />
            <span class="font-bold text-xl text-gray-900">Perpustakaan Cemerlang</span>
          </div>
          <p class="text-gray-600 text-sm leading-relaxed">
            Platform perpustakaan digital untuk siswa SD Negeri 2 Ganungkidul Nganjuk dengan sistem rekomendasi buku yang cerdas berdasarkan konten.
          </p>
        </div>

        <!-- Quick Links -->
        <div>
          <h3 class="font-semibold text-gray-900 mb-4">Link Cepat</h3>
          <ul class="space-y-2 text-sm">
            <li><a href="/" class="text-gray-600 hover:text-gray-900 transition-colors">Katalog Buku</a></li>
            <li><a href="/login" class="text-gray-600 hover:text-gray-900 transition-colors">Login</a></li>
            <li><a href="/register" class="text-gray-600 hover:text-gray-900 transition-colors">Daftar</a></li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div>
          <h3 class="font-semibold text-gray-900 mb-4">Kontak</h3>
          <ul class="space-y-2 text-sm text-gray-600">
            <li>Email: perpustakaan@cemerlang.sch.id</li>
            <li>Telp: (021) 1234-5678</li>
            <li>Alamat: Jl. Megantoro No.14, Ganung Kidul, Nganjuk</li>
          </ul>
        </div>
      </div>

      <div class="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
        <p>&copy; {{ new Date().getFullYear() }} Perpustakaan Cemerlang SDN 2 Ganungkidul Nganjuk. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>
