<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, Eye, Calendar, Loader2, AlertCircle, BookOpen, Sparkles } from 'lucide-vue-next';
import { usersAPI, recommendAPI } from '../../services/api';
import { useAuthStore } from '../../stores/auth';

interface BookHistory {
  id: number;
  book_id: number;
  title: string;
  author: string;
  genre_name: string;
  synopsis: string;
  cover_img: string | null;
  views: number;
  last_viewed: string;
}

interface Student {
  id: number;
  username: string;
  role: string;
}

interface RecommendedBook {
  id: number;
  title: string;
  author: string;
  genre_name: string;
  synopsis: string;
  cover_img: string | null;
  similarity?: number;
}

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const studentId = ref<number>(parseInt(route.params.id as string) || 0);
const student = ref<Student | null>(null);
const bookHistory = ref<BookHistory[]>([]);
const recommendations = ref<RecommendedBook[]>([]);
const loading = ref(true);
const loadingRecommendations = ref(false);
const error = ref('');
const sortBy = ref<'date' | 'views' | 'title'>('date');

const getBookCover = (book: BookHistory): string => {
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

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return `Hari ini pukul ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `Kemarin pukul ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
  }

  return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

const sortedHistory = computed(() => {
  const sorted = [...bookHistory.value];
  
  if (sortBy.value === 'date') {
    return sorted.sort((a, b) => new Date(b.last_viewed).getTime() - new Date(a.last_viewed).getTime());
  } else if (sortBy.value === 'views') {
    return sorted.sort((a, b) => b.views - a.views);
  } else if (sortBy.value === 'title') {
    return sorted.sort((a, b) => a.title.localeCompare(b.title));
  }
  
  return sorted;
});

const totalViews = computed(() => {
  return bookHistory.value.reduce((sum, book) => sum + book.views, 0);
});

const fetchStudentHistory = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    const response = await usersAPI.getStudentHistory(studentId.value);
    
    student.value = response.data.student;
    bookHistory.value = response.data.bookHistory || [];
  } catch (err: any) {
    console.error('Fetch student history error:', err);
    if (err.response?.status === 404) {
      error.value = 'Siswa tidak ditemukan';
    } else if (err.response?.status === 403) {
      error.value = 'Anda tidak memiliki akses untuk melihat data ini';
    } else {
      error.value = err.response?.data?.error || 'Gagal memuat riwayat siswa';
    }
  } finally {
    loading.value = false;
  }
};

const fetchRecommendations = async () => {
  try {
    loadingRecommendations.value = true;
    
    // Fetch recommendations for the student
    if (bookHistory.value.length === 0) {
      recommendations.value = [];
      return;
    }
    
    const response = await recommendAPI.getPersonalizedForUser(studentId.value);
    recommendations.value = response.data.recommendations || [];
  } catch (err: any) {
    console.error('Fetch recommendations error:', err);
    recommendations.value = [];
  } finally {
    loadingRecommendations.value = false;
  }
};

const goBack = () => {
  router.push('/dashboard/students');
};

onMounted(() => {
  if (!authStore.user || authStore.user.role !== 'pustakawan') {
    router.push('/');
    return;
  }
  
  if (!studentId.value) {
    router.push('/dashboard/students');
    return;
  }
  
  fetchStudentHistory();
  fetchRecommendations();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-[1400px] mx-auto px-6 lg:px-8 py-6">
        <button @click="goBack"
          class="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-gray-700 hover:bg-gray-100 transition-all duration-200 mb-4 group">
          <ArrowLeft class="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span class="font-medium">Kembali</span>
        </button>
        
        <div class="space-y-2">
          <h1 class="text-4xl font-bold text-gray-900">Riwayat Bacaan Siswa</h1>
          <p v-if="student" class="text-gray-600">Siswa: <strong>{{ student.username }}</strong></p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-[1400px] mx-auto px-6 lg:px-8 py-12">
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col justify-center items-center py-32">
        <div class="relative">
          <div class="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
          <div class="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-900 absolute inset-0"></div>
        </div>
        <p class="mt-6 text-gray-500 font-medium">Memuat riwayat bacaan siswa...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-8 flex items-start space-x-4">
        <AlertCircle class="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 class="font-semibold text-red-900 mb-1">Terjadi Kesalahan</h3>
          <p class="text-red-700">{{ error }}</p>
          <button @click="fetchStudentHistory"
            class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
            Coba Lagi
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="bookHistory.length === 0" class="text-center py-24">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 mb-6">
          <Eye class="h-10 w-10 text-blue-500" />
        </div>
        <h3 class="text-2xl font-semibold text-gray-900 mb-3">Belum Ada Riwayat Bacaan</h3>
        <p class="text-gray-600">Siswa ini belum membaca buku apapun</p>
      </div>

      <!-- Statistics & Sorting -->
      <div v-else class="space-y-8">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm font-medium">Total Buku Dibaca</p>
                <p class="text-4xl font-bold text-gray-900 mt-2">{{ bookHistory.length }}</p>
              </div>
              <div class="bg-blue-50 p-4 rounded-xl">
                <BookOpen class="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm font-medium">Total Kali Dibaca</p>
                <p class="text-4xl font-bold text-gray-900 mt-2">{{ totalViews }}</p>
              </div>
              <div class="bg-amber-50 p-4 rounded-xl">
                <Eye class="h-8 w-8 text-amber-600" />
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm font-medium">Rata-rata Dibaca</p>
                <p class="text-4xl font-bold text-gray-900 mt-2">{{ (totalViews / bookHistory.length).toFixed(1) }}</p>
              </div>
              <div class="bg-green-50 p-4 rounded-xl">
                <Sparkles class="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <!-- Sort Controls -->
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-900">Daftar Buku</h2>
          <div class="flex items-center space-x-3">
            <label class="text-sm text-gray-600 font-medium">Urutkan:</label>
            <select v-model="sortBy"
              class="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
              <option value="date">Terbaru</option>
              <option value="views">Paling Sering Dibaca</option>
              <option value="title">Judul (A-Z)</option>
            </select>
          </div>
        </div>

        <!-- History List -->
        <div class="space-y-4">
          <div v-for="book in sortedHistory" :key="book.id"
            class="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 p-6">
            
            <div class="flex gap-6">
              <!-- Book Cover -->
              <div class="flex-shrink-0 w-24 h-32 md:w-32 md:h-44">
                <img :src="getBookCover(book)" :alt="book.title"
                  class="w-full h-full object-cover rounded-lg" />
              </div>

              <!-- Book Info -->
              <div class="flex-1 min-w-0">
                <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div class="flex-1">
                    <h3 class="text-xl font-bold text-gray-900 mb-1 line-clamp-2">
                      {{ book.title }}
                    </h3>
                    <p class="text-gray-600 mb-3">{{ book.author }}</p>

                    <!-- Genre Badges -->
                    <div class="flex flex-wrap gap-2">
                      <span v-for="genre in (book.genre_name ? book.genre_name.split(',').slice(0, 3) : [])" :key="genre"
                        :class="['text-xs px-3 py-1 rounded-full font-medium', getGenreBadgeClass(genre.trim())]">
                        {{ genre.trim() }}
                      </span>
                    </div>
                  </div>

                  <!-- View Stats -->
                  <div class="flex gap-6 flex-shrink-0">
                    <div class="text-right">
                      <p class="text-gray-600 text-xs font-medium">Kali Dibaca</p>
                      <p class="text-2xl font-bold text-amber-600">{{ book.views }}</p>
                    </div>
                  </div>
                </div>

                <!-- Last Viewed -->
                <div class="flex items-center space-x-2 text-sm text-gray-500 pt-4 border-t border-gray-100">
                  <Calendar class="h-4 w-4" />
                  <span>Terakhir dibaca: {{ formatDate(book.last_viewed) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
