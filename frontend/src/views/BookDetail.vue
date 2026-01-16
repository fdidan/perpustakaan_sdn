<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, BookOpen, User, Tag, Sparkles, Clock } from 'lucide-vue-next';
import { booksAPI, recommendAPI, createSlug, type Book, type BookWithSimilarity } from '../services/api';

const route = useRoute();
const router = useRouter();

const book = ref<Book | null>(null);
const recommendations = ref<BookWithSimilarity[]>([]);
const loading = ref(true);
const error = ref('');

const getBookCover = (bookData: Book): string => {
  if (bookData.cover_img) {
    return `http://localhost:3000/uploads/${bookData.cover_img}`;
  }
  return `https://via.placeholder.com/500x750/f8fafc/475569?text=${encodeURIComponent(bookData.title.substring(0, 20))}`;
};

const getGenreBadgeClass = (genre: string): string => {
  const lowerGenre = genre.toLowerCase();
  if (lowerGenre.includes('fantasy')) return 'badge-fantasy';
  if (lowerGenre.includes('fiction') || lowerGenre.includes('fiksi')) return 'badge-fiction';
  if (lowerGenre.includes('magic')) return 'badge-magic';
  if (lowerGenre.includes('adventure')) return 'badge-adventure';
  if (lowerGenre.includes('childrens') || lowerGenre.includes('children') || lowerGenre.includes('anak')) return 'badge-childrens';
  if (lowerGenre.includes('mythology')) return 'badge-mythology';
  if (lowerGenre.includes('dragon')) return 'badge-dragons';
  return 'badge-default';
};

const fetchBookDetail = async () => {
  try {
    loading.value = true;
    const slug = route.params.slug as string;

    // Fetch book by slug
    const bookResponse = await booksAPI.getBySlug(slug);
    book.value = bookResponse.data.book;

    // Get recommendations by book ID
    const recResponse = await recommendAPI.getByBookId(book.value.id);
    recommendations.value = recResponse.data.recommendations;
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to fetch book details';
    console.error('Fetch book detail error:', err);
  } finally {
    loading.value = false;
  }
};

const viewBook = (book: Book) => {
  const slug = createSlug(book.title);
  router.push(`/books/${slug}`);
};

const goBack = () => {
  router.push('/');
};

// FIX: Watch route params untuk reload data ketika slug berubah
watch(() => route.params.slug, (newSlug, oldSlug) => {
  if (newSlug && newSlug !== oldSlug) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchBookDetail();
  }
}, { immediate: false });

onMounted(() => {
  fetchBookDetail();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col justify-center items-center py-32">
      <div class="relative">
        <div class="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
        <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-900 absolute inset-0"></div>
      </div>
      <p class="mt-6 text-gray-500 font-medium">Memuat detail buku...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-[1400px] mx-auto px-6 lg:px-8 py-32 text-center">
      <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 mb-6">
        <BookOpen class="h-10 w-10 text-red-500" />
      </div>
      <h3 class="text-xl font-semibold text-gray-900 mb-2">Terjadi Kesalahan</h3>
      <p class="text-gray-600 mb-6">{{ error }}</p>
      <button @click="goBack"
        class="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium">
        Kembali ke Katalog
      </button>
    </div>

    <!-- Book Detail -->
    <div v-else-if="book" class="max-w-[1400px] mx-auto px-6 lg:px-8 py-8">
      <!-- Back Button -->
      <button @click="goBack"
        class="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-gray-700 hover:bg-white hover:shadow-sm transition-all duration-200 mb-8 group">
        <ArrowLeft class="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        <span class="font-medium">Kembali ke Katalog</span>
      </button>

      <!-- Book Info Card -->
      <div class="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden mb-16">
        <div class="grid lg:grid-cols-12 gap-10 p-8 lg:p-12">
          <!-- Book Cover -->
          <div class="lg:col-span-4">
            <div class="relative group">
              <div
                class="absolute inset-0 bg-gradient-to-br from-gray-900/5 to-gray-700/5 rounded-2xl blur-2xl group-hover:blur-3xl transition-all duration-500">
              </div>
              <div
                class="relative aspect-[2/3] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-2xl shadow-gray-300/50">
                <img :src="getBookCover(book)" :alt="book.title" class="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          <!-- Book Details -->
          <div class="lg:col-span-8 flex flex-col justify-center space-y-6">
            <!-- Category Badge -->
            <div class="flex items-center space-x-2">
              <div class="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-full">
                <BookOpen class="h-4 w-4 text-gray-600" />
                <span class="text-sm font-medium text-gray-700">Detail Buku</span>
              </div>
            </div>

            <!-- Title -->
            <div>
              <h1 class="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
                {{ book.title }}
              </h1>
              <div class="flex items-center space-x-3 text-lg">
                <User class="h-5 w-5 text-gray-400" />
                <span class="text-gray-700 font-medium">{{ book.author }}</span>
              </div>
            </div>

            <!-- Genre Tags -->
            <div class="space-y-3">
              <div class="flex items-center space-x-2 text-sm text-gray-600">
                <Tag class="h-4 w-4" />
                <span class="font-medium">Genre</span>
              </div>
              <div class="flex flex-wrap gap-2">
                <span v-for="genre in (book.genre_name ? book.genre_name.split(',').slice(0, 2) : [])" :key="genre"
                  :class="['badge-genre text-[10px]', getGenreBadgeClass(genre.trim())]">
                  {{ genre.trim() }}
                </span>
              </div>
            </div>

            <!-- Divider -->
            <div class="border-t border-gray-200"></div>

            <!-- Description -->
            <div class="space-y-3">
              <h2 class="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <span>Sinopsis</span>
              </h2>
              <p class="text-gray-700 leading-relaxed text-base">
                {{ book.synopsis }}
              </p>
            </div>

            <!-- Meta Info -->
            <div class="flex items-center space-x-6 text-sm text-gray-500 pt-4">
              <div class="flex items-center space-x-2">
                <Clock class="h-4 w-4" />
                <span>Ditambahkan {{ new Date(book.created_at).toLocaleDateString('id-ID') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recommendations -->
      <div v-if="recommendations.length > 0" class="space-y-8">
        <!-- Header -->
        <div class="flex items-center space-x-3">
          <div class="relative">
            <div
              class="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full blur-lg opacity-30 animate-pulse">
            </div>
            <Sparkles class="h-7 w-7 text-amber-500 relative z-10" />
          </div>
          <div>
            <h2 class="text-3xl font-bold text-gray-900">Rekomendasi Buku Serupa</h2>
            <p class="text-gray-600 mt-1">Buku lain yang mungkin kamu sukai</p>
          </div>
        </div>

        <!-- Recommendations Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          <div v-for="recBook in recommendations" :key="recBook.id" @click="viewBook(recBook)"
            class="book-card cursor-pointer">
            <!-- Book Cover with Match Badge -->
            <div class="book-cover">
              <img :src="getBookCover(recBook)" :alt="recBook.title" loading="lazy" />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              </div>

              <!-- Match Percentage -->
              <!-- <div v-if="recBook.similarity"
                class="absolute top-3 right-3 bg-gradient-to-br from-gray-900 to-gray-700 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
                {{ Math.round(recBook.similarity * 100) }}% Match
              </div> -->
            </div>

            <!-- Book Info -->
            <div class="p-4 space-y-3">
              <div>
                <h3
                  class="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-gray-700 transition-colors mb-1">
                  {{ recBook.title }}
                </h3>
                <p class="text-xs text-gray-500 line-clamp-1">{{ recBook.author }}</p>
              </div>

              <!-- Genre Badges -->
              <div class="flex flex-wrap gap-1.5">
                <span v-for="genre in (recBook.genre_name ? recBook.genre_name.split(',').slice(0, 2) : [])" :key="genre"
                  :class="['badge-genre text-[10px]', getGenreBadgeClass(genre.trim())]">
                  {{ genre.trim() }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
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