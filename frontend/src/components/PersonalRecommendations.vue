<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Sparkles, Loader2 } from 'lucide-vue-next';
import { recommendAPI, createSlug, type BookWithSimilarity } from '../services/api';
import { useAuth } from '../stores/auth';

const router = useRouter();
const authStore = useAuth();

const recommendations = ref<BookWithSimilarity[]>([]);
const loading = ref(false);
const error = ref('');
const message = ref('');

const getBookCover = (book: BookWithSimilarity): string => {
  if (book.cover_img) {
    return `http://localhost:3000/uploads/${book.cover_img}`;
  }
  return `https://via.placeholder.com/400x600/f8fafc/475569?text=${encodeURIComponent(book.title.substring(0, 20))}`;
};

const getGenreBadgeClass = (genre: string): string => {
  const lowerGenre = genre.toLowerCase();
  if (lowerGenre.includes('fantasy')) return 'bg-purple-50 text-purple-700 border border-purple-200/50';
  if (lowerGenre.includes('fiction') || lowerGenre.includes('fiksi')) return 'bg-blue-50 text-blue-700 border border-blue-200/50';
  if (lowerGenre.includes('magic')) return 'bg-pink-50 text-pink-700 border border-pink-200/50';
  if (lowerGenre.includes('adventure')) return 'bg-orange-50 text-orange-700 border border-orange-200/50';
  if (lowerGenre.includes('childrens') || lowerGenre.includes('children') || lowerGenre.includes('anak')) return 'bg-yellow-50 text-yellow-700 border border-yellow-200/50';
  if (lowerGenre.includes('mythology')) return 'bg-indigo-50 text-indigo-700 border border-indigo-200/50';
  if (lowerGenre.includes('matematika')) return 'bg-blue-50 text-blue-700 border border-blue-200/50';
  if (lowerGenre.includes('ipa') || lowerGenre.includes('sains')) return 'bg-green-50 text-green-700 border border-green-200/50';
  if (lowerGenre.includes('ips')) return 'bg-amber-50 text-amber-700 border border-amber-200/50';
  if (lowerGenre.includes('bahasa')) return 'bg-violet-50 text-violet-700 border border-violet-200/50';
  if (lowerGenre.includes('agama')) return 'bg-teal-50 text-teal-700 border border-teal-200/50';
  return 'bg-gray-50 text-gray-700 border border-gray-200/50';
};

const viewBook = (book: BookWithSimilarity) => {
  const slug = createSlug(book.title);
  router.push(`/books/${slug}`);
};

const fetchRecommendations = async () => {
  // Only fetch if user is logged in
  if (!authStore.isLoggedIn) {
    return;
  }

  try {
    loading.value = true;
    error.value = '';
    const response = await recommendAPI.getPersonalized();
    recommendations.value = response.data.recommendations;
    message.value = response.data.message;
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Gagal memuat rekomendasi';
    console.error('Fetch recommendations error:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchRecommendations();
});

defineExpose({
  fetchRecommendations,
});
</script>

<template>
  <div v-if="authStore.isLoggedIn" class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-16">
      <div class="text-center">
        <Loader2 class="h-8 w-8 animate-spin text-amber-500 mx-auto mb-4" />
        <p class="text-gray-600">Memuat rekomendasi personal...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6">
      <p class="text-red-700">{{ error }}</p>
    </div>

    <!-- Recommendations -->
    <div v-else-if="recommendations.length > 0">
      <!-- Header -->
      <div class="flex items-center space-x-3">
        <div class="relative">
          <div
            class="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full blur-lg opacity-30 animate-pulse">
          </div>
          <Sparkles class="h-7 w-7 text-amber-500 relative z-10" />
        </div>
        <div>
          <h2 class="text-3xl font-bold text-gray-900">Rekomendasi Untuk Anda</h2>
          <p class="text-gray-600 mt-1">{{ message }}</p>
        </div>
      </div>

      <!-- Recommendations Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
        <div v-for="book in recommendations" :key="book.id" @click="viewBook(book)"
          class="group cursor-pointer rounded-xl overflow-hidden bg-white hover:shadow-lg transition-all duration-300">
          
          <!-- Book Cover -->
          <div class="relative aspect-[2/3] overflow-hidden bg-gray-100">
            <img :src="getBookCover(book)" :alt="book.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            </div>

            <!-- Similarity Score Badge -->
            <div v-if="book.similarity"
              class="absolute top-3 right-3 bg-gradient-to-br from-amber-400 to-yellow-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
              {{ Math.round(book.similarity * 100) }}%
            </div>
          </div>

          <!-- Book Info -->
          <div class="p-4 space-y-3">
            <div>
              <h3 class="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-amber-600 transition-colors mb-1">
                {{ book.title }}
              </h3>
              <p class="text-xs text-gray-500 line-clamp-1">{{ book.author }}</p>
            </div>

            <!-- Genre Badges -->
            <div class="flex flex-wrap gap-1.5">
              <span v-for="genre in (book.genre_name ? book.genre_name.split(',').slice(0, 2) : [])" :key="genre"
                :class="['text-[10px] px-2 py-1 rounded-full font-medium', getGenreBadgeClass(genre.trim())]">
                {{ genre.trim() }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
      <Sparkles class="h-12 w-12 text-blue-500 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-blue-900 mb-2">Belum Ada Rekomendasi</h3>
      <p class="text-blue-700">Mulai baca buku untuk mendapatkan rekomendasi personal dari kami!</p>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
