<!-- src/views/dashboard/Analytics.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {
  ChartBarIcon,
  BookOpenIcon,
  UsersIcon,
  ArrowTrendingUpIcon
} from '@heroicons/vue/24/outline';
import { booksAPI, genresAPI, type Book, type Genre } from '../../services/api';

const stats = ref({
  totalBooks: 0,
  totalGenres: 0,
  totalBorrows: 0,
  mostPopularGenre: '',
});

const booksByGenre = ref<Record<string, number>>({});
const genres = ref<Genre[]>([]);
const books = ref<Book[]>([]);
const loading = ref(true);

const fetchData = async () => {
  try {
    loading.value = true;
    const [booksRes, genresRes] = await Promise.all([
      booksAPI.getAll(),
      genresAPI.getAll()
    ]);

    books.value = booksRes.data.books;
    genres.value = genresRes.data.data;

    // Calculate statistics
    calculateStats();
  } catch (error) {
    console.error('Failed to fetch data:', error);
  } finally {
    loading.value = false;
  }
};

const calculateStats = () => {
  // Reset booksByGenre
  booksByGenre.value = {};
  
  // Calculate books per genre
  books.value.forEach(book => {
    const genreName = book.genre_name;
    booksByGenre.value[genreName] = (booksByGenre.value[genreName] || 0) + 1;
  });

  // Find most popular genre
  let maxBooks = 0;
  let mostPopularGenre = '';
  Object.entries(booksByGenre.value).forEach(([genre, count]) => {
    if (count > maxBooks) {
      maxBooks = count;
      mostPopularGenre = genre;
    }
  });

  // Update stats
  stats.value = {
    totalBooks: books.value.length,
    totalGenres: genres.value.length,
    totalBorrows: 0, // This would need to be updated when borrow functionality is implemented
    mostPopularGenre,
  };
};

const chartData = computed(() => {
  return Object.entries(booksByGenre.value).map(([genre, count]) => ({
    genre,
    count,
  }));
});

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
      <p class="text-gray-600">Overview of library statistics and trends</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-8">
      <!-- Total Books -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-100">
            <BookOpenIcon class="h-6 w-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Total Books</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.totalBooks }}</p>
          </div>
        </div>
      </div>

      <!-- Total Genres -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-100">
            <ChartBarIcon class="h-6 w-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Total Genres</p>
            <p class="text-2xl font-semibold text-gray-900">{{ stats.totalGenres }}</p>
          </div>
        </div>
      </div>

      <!-- Most Popular Genre -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-purple-100">
            <ArrowTrendingUpIcon class="h-6 w-6 text-purple-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Most Popular Genre</p>
            <p class="text-2xl font-semibold text-gray-900">
              {{ stats.mostPopularGenre || 'N/A' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Books by Genre Chart -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Books by Genre</h2>
      <div class="relative">
        <!-- Loading State -->
        <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        
        <!-- Chart -->
        <div class="space-y-4">
          <div
            v-for="item in chartData"
            :key="item.genre"
            class="flex items-center"
          >
            <div class="w-32 text-sm font-medium text-gray-600">{{ item.genre }}</div>
            <div class="flex-1">
              <div class="relative h-8 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-500"
                  :style="{ width: `${(item.count / stats.totalBooks) * 100}%` }"
                ></div>
              </div>
            </div>
            <div class="w-16 text-right text-sm font-medium text-gray-900">
              {{ item.count }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>