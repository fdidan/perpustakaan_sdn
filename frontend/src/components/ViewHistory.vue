<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Eye, Loader2, AlertCircle } from 'lucide-vue-next';
import { booksAPI, createSlug, type Book } from '../services/api';
import { useAuth } from '../stores/auth';

interface BookWithViewCount extends Book {
  view_count?: number;
  last_viewed?: string;
}

const router = useRouter();
const authStore = useAuth();

const viewHistory = ref<BookWithViewCount[]>([]);
const loading = ref(false);
const error = ref('');

const getBookCover = (book: BookWithViewCount): string => {
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
  if (lowerGenre.includes('matematika')) return 'bg-blue-50 text-blue-700 border border-blue-200/50';
  if (lowerGenre.includes('ipa') || lowerGenre.includes('sains')) return 'bg-green-50 text-green-700 border border-green-200/50';
  if (lowerGenre.includes('ips')) return 'bg-amber-50 text-amber-700 border border-amber-200/50';
  if (lowerGenre.includes('bahasa')) return 'bg-violet-50 text-violet-700 border border-violet-200/50';
  return 'bg-gray-50 text-gray-700 border border-gray-200/50';
};

const viewBook = (book: BookWithViewCount) => {
  const slug = createSlug(book.title);
  router.push(`/books/${slug}`);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return `Hari ini ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `Kemarin ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
  }

  return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' });
};

const fetchViewHistory = async () => {
  // Fetch all books and manually check which ones have been viewed
  // This is a placeholder - ideally we'd have a dedicated endpoint
  try {
    loading.value = true;
    error.value = '';
    
    // For now, just show empty state with instruction
    // In real implementation, would need backend endpoint to fetch user's viewed books
    viewHistory.value = [];
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Gagal memuat riwayat';
    console.error('Fetch history error:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (authStore.isLoggedIn) {
    fetchViewHistory();
  }
});

defineExpose({
  fetchViewHistory,
});
</script>

<template>
  <div v-if="authStore.isLoggedIn" class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-16">
      <div class="text-center">
        <Loader2 class="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
        <p class="text-gray-600">Memuat riwayat bacaan...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start space-x-3">
      <AlertCircle class="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
      <p class="text-red-700">{{ error }}</p>
    </div>

    <!-- View History -->
    <div v-else-if="viewHistory.length > 0">
      <!-- Header -->
      <div class="flex items-center space-x-3">
        <Eye class="h-7 w-7 text-blue-500" />
        <div>
          <h2 class="text-3xl font-bold text-gray-900">Riwayat Bacaan</h2>
          <p class="text-gray-600 mt-1">Buku yang telah Anda baca</p>
        </div>
      </div>

      <!-- History Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
        <div v-for="book in viewHistory" :key="book.id" @click="viewBook(book)"
          class="group cursor-pointer rounded-xl overflow-hidden bg-white hover:shadow-lg transition-all duration-300">
          
          <!-- Book Cover -->
          <div class="relative aspect-[2/3] overflow-hidden bg-gray-100">
            <img :src="getBookCover(book)" :alt="book.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            </div>

            <!-- View Count Badge -->
            <div v-if="book.view_count"
              class="absolute top-3 right-3 bg-gradient-to-br from-blue-400 to-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm flex items-center space-x-1">
              <Eye class="h-3 w-3" />
              <span>{{ book.view_count }}</span>
            </div>
          </div>

          <!-- Book Info -->
          <div class="p-4 space-y-3">
            <div>
              <h3 class="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors mb-1">
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

            <!-- Last Viewed -->
            <p v-if="book.last_viewed" class="text-xs text-gray-500 pt-2 border-t border-gray-100">
              Terakhir: {{ formatDate(book.last_viewed) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
      <Eye class="h-12 w-12 text-blue-500 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-blue-900 mb-2">Belum Ada Riwayat Bacaan</h3>
      <p class="text-blue-700">Buku yang Anda baca akan ditampilkan di sini</p>
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
