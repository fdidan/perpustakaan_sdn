<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import debounce from 'lodash.debounce';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PhotoIcon,
  EyeIcon,
  FunnelIcon

} from '@heroicons/vue/24/outline';
import { booksAPI, genresAPI, type Book, type Genre } from '../../services/api';
import { showToast, showConfirm } from '../../utils/toast';

const books = ref<Book[]>([]);
const genres = ref<Genre[]>([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedGenreFilter = ref<number[]>([]);
const showModal = ref(false);
const showDetailModal = ref(false);
const showGenreFilter = ref(false);
const modalMode = ref<'create' | 'edit'>('create');
const selectedBook = ref<Book | null>(null);
const selectedBooks = ref<number[]>([]);
const imagePreview = ref<string | null>(null);

const formData = ref<FormData>(new FormData());
const form = ref({
  title: '',
  author: '',
  genreId: '',
  synopsis: '',
});

// Computed for bulk actions
const allSelected = computed(() =>
  filteredBooks.value.length > 0 && selectedBooks.value.length === filteredBooks.value.length
);

const filteredBooks = computed(() => {
  let result = books.value;

  // Filter by genre
  if (selectedGenreFilter.value.length > 0) {
    result = result.filter(book => selectedGenreFilter.value.includes(book.genre_id));
  }

  return result;
});

const getBookCoverUrl = (coverImg: string | null) => {
  if (!coverImg) return null;
  return `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/uploads/${coverImg}`;
};

const debouncedSearch = debounce(async (query: string) => {
  try {
    loading.value = true;
    const response = await booksAPI.search(query);
    books.value = response.data.books;
  } catch (error) {
    showToast.error('Gagal mencari buku');
  } finally {
    loading.value = false;
  }
}, 300);

const handleSearch = (event: Event) => {
  const query = (event.target as HTMLInputElement).value;
  searchQuery.value = query;
  if (query.trim()) {
    debouncedSearch(query);
  } else {
    fetchBooks();
  }
};

const toggleGenreFilter = (genreId: number) => {
  const index = selectedGenreFilter.value.indexOf(genreId);
  if (index > -1) {
    selectedGenreFilter.value.splice(index, 1);
  } else {
    selectedGenreFilter.value.push(genreId);
  }
};

const clearGenreFilter = () => {
  selectedGenreFilter.value = [];
};

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedBooks.value = [];
  } else {
    selectedBooks.value = filteredBooks.value.map(book => book.id);
  }
};

const toggleSelectBook = (bookId: number) => {
  const index = selectedBooks.value.indexOf(bookId);
  if (index > -1) {
    selectedBooks.value.splice(index, 1);
  } else {
    selectedBooks.value.push(bookId);
  }
};

const bulkDelete = () => {
  if (selectedBooks.value.length === 0) {
    showToast.warning('Pilih buku yang ingin dihapus');
    return;
  }

  showConfirm(
    'Hapus Buku Terpilih',
    `Apakah Anda yakin ingin menghapus ${selectedBooks.value.length} buku?`,
    async () => {
      try {
        await Promise.all(
          selectedBooks.value.map(id => booksAPI.delete(id))
        );
        await fetchBooks();
        selectedBooks.value = [];
        showToast.success(`${selectedBooks.value.length} buku berhasil dihapus`);
      } catch (error: any) {
        showToast.error('Gagal menghapus beberapa buku');
      }
    }
  );
};

const fetchBooks = async () => {
  try {
    loading.value = true;
    const [booksRes, genresRes] = await Promise.all([
      booksAPI.getAll(),
      genresAPI.getAll()
    ]);
    books.value = booksRes.data.books;
    genres.value = genresRes.data.data;
  } catch (error) {
    showToast.error('Gagal memuat data');
  } finally {
    loading.value = false;
  }
};

const handleImageChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    formData.value.set('coverImage', file);
    imagePreview.value = URL.createObjectURL(file);
  }
};

const openCreateModal = () => {
  modalMode.value = 'create';
  form.value = {
    title: '',
    author: '',
    genreId: '',
    synopsis: '',
  };
  imagePreview.value = null;
  formData.value = new FormData();
  showModal.value = true;
};

const openEditModal = (book: Book) => {
  modalMode.value = 'edit';
  selectedBook.value = book;
  form.value = {
    title: book.title,
    author: book.author,
    genreId: book.genre_id.toString(),
    synopsis: book.synopsis,
  };
  imagePreview.value = book.cover_img ? getBookCoverUrl(book.cover_img) : null;
  formData.value = new FormData();
  showModal.value = true;
};

const openDetailModal = (book: Book) => {
  selectedBook.value = book;
  showDetailModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  showDetailModal.value = false;
  selectedBook.value = null;
  imagePreview.value = null;
};

const handleSubmit = () => {
  showConfirm(
    modalMode.value === 'create' ? 'Tambah Buku' : 'Edit Buku',
    `Apakah Anda yakin ingin ${modalMode.value === 'create' ? 'menambah' : 'mengubah'} buku ini?`,
    async () => {
      try {
        formData.value.set('title', form.value.title);
        formData.value.set('author', form.value.author);
        formData.value.set('genreId', form.value.genreId);
        formData.value.set('synopsis', form.value.synopsis);

        if (modalMode.value === 'create') {
          await booksAPI.create(formData.value);
          showToast.success('Buku berhasil ditambahkan');
        } else if (selectedBook.value) {
          await booksAPI.update(selectedBook.value.id, formData.value);
          showToast.success('Buku berhasil diperbarui');
        }

        await fetchBooks();
        closeModal();
      } catch (error: any) {
        showToast.error(error.response?.data?.error || 'Gagal menyimpan buku');
      }
    }
  );
};

const handleDelete = (book: Book) => {
  showConfirm(
    'Hapus Buku',
    `Apakah Anda yakin ingin menghapus "${book.title}"?`,
    async () => {
      try {
        await booksAPI.delete(book.id);
        await fetchBooks();
        showToast.success('Buku berhasil dihapus');
      } catch (error: any) {
        showToast.error(error.response?.data?.error || 'Gagal menghapus buku');
      }
    }
  );
};

onMounted(() => {
  fetchBooks();
});
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Kelola Buku</h1>
      <p class="text-gray-600">Kelola koleksi buku perpustakaan</p>
    </div>

    <!-- Actions -->
    <div class="flex flex-col sm:flex-row gap-4 mb-6">
      <!-- Search -->
      <div class="relative flex-1">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input v-model="searchQuery" @input="handleSearch" type="text" placeholder="Cari buku..."
          class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
      </div>

      <!-- Genre Filter -->
      <div class="relative">
        <button @click="showGenreFilter = !showGenreFilter"
          class="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg border border-gray-300 hover:border-gray-400 transition-colors">
          <FunnelIcon class="h-5 w-5 text-gray-600" />
          <span class="text-sm font-medium text-gray-700">
            Filter Genre
            <span v-if="selectedGenreFilter.length > 0" class="ml-1 text-blue-600">({{ selectedGenreFilter.length
              }})</span>
          </span>
        </button>

        <div v-if="showGenreFilter"
          class="absolute z-10 mt-2 w-64 bg-white rounded-lg border border-gray-200 shadow-xl p-4 max-h-80 overflow-y-auto">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-gray-900">Pilih Genre</h3>
            <button v-if="selectedGenreFilter.length > 0" @click="clearGenreFilter"
              class="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Reset
            </button>
          </div>

          <div class="space-y-2">
            <button v-for="genre in genres" :key="genre.id" @click="toggleGenreFilter(genre.id)" :class="[
              'w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all',
              selectedGenreFilter.includes(genre.id)
                ? 'bg-blue-100 text-blue-900 border-2 border-blue-400'
                : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
            ]">
              {{ genre.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Bulk Actions -->
      <div v-if="selectedBooks.length > 0" class="flex items-center gap-2">
        <span class="text-sm text-gray-600">{{ selectedBooks.length }} dipilih</span>
        <button @click="bulkDelete"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
          Hapus Terpilih
        </button>
      </div>

      <!-- Add Book Button -->
      <button @click="openCreateModal"
        class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
        <PlusIcon class="h-5 w-5 mr-2" />
        Tambah Buku
      </button>
    </div>

    <!-- Books Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3">
                <input type="checkbox" :checked="allSelected" @change="toggleSelectAll"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cover
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Judul
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Penulis
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Genre
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="book in filteredBooks" :key="book.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <input type="checkbox" :checked="selectedBooks.includes(book.id)" @change="toggleSelectBook(book.id)"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <img v-if="book.cover_img" :src="getBookCoverUrl(book.cover_img) || ''" :alt="book.title"
                  class="h-16 w-12 object-cover rounded cursor-pointer hover:scale-105 transition-transform"
                  @click="openDetailModal(book)" />
                <div v-else class="h-16 w-12 bg-gray-100 rounded flex items-center justify-center">
                  <PhotoIcon class="h-6 w-6 text-gray-400" />
                </div>
              </td>
              <td class="px-6 py-4">
                <button @click="openDetailModal(book)"
                  class="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors text-left">
                  {{ book.title }}
                </button>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-500">{{ book.author }}</div>
              </td>
              <td class="px-6 py-4">
                <span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {{ book.genre_name }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button @click="openDetailModal(book)" class="text-green-600 hover:text-green-900" title="Detail">
                  <EyeIcon class="h-5 w-5" />
                </button>
                <button @click="openEditModal(book)" class="text-indigo-600 hover:text-indigo-900" title="Edit">
                  <PencilIcon class="h-5 w-5" />
                </button>
                <button @click="handleDelete(book)" class="text-red-600 hover:text-red-900" title="Hapus">
                  <TrashIcon class="h-5 w-5" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      @click.self="closeModal">
      <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="sticky top-0 bg-gradient-to-r from-gray-900 to-gray-700 px-6 py-5 rounded-t-2xl">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-white flex items-center space-x-2">
              <BookOpen class="h-6 w-6" />
              <span>{{ modalMode === 'create' ? 'Tambah Buku Baru' : 'Edit Buku' }}</span>
            </h3>
            <button @click="closeModal" class="text-white/80 hover:text-white transition-colors">
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="px-6 py-6 space-y-6">
          <!-- Cover Preview -->
          <div class="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
            <label class="block text-sm font-semibold text-gray-900 mb-3">
              Cover Buku
            </label>
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0">
                <div
                  class="h-40 w-32 border-2 border-gray-200 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg">
                  <img v-if="imagePreview" :src="imagePreview" class="h-full w-full object-cover" alt="Preview" />
                  <div v-else class="h-full flex flex-col items-center justify-center text-gray-400">
                    <PhotoIcon class="h-10 w-10 mb-2" />
                    <span class="text-xs">No Image</span>
                  </div>
                </div>
              </div>
              <div class="flex-1">
                <input type="file" accept="image/*" @change="handleImageChange" class="block w-full text-sm text-gray-600
                file:mr-4 file:py-3 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-gray-900 file:text-white
                hover:file:bg-gray-800
                file:cursor-pointer cursor-pointer
                transition-all" />
                <p class="mt-2 text-xs text-gray-500">
                  Format: JPG, PNG, WebP, GIF. Maksimal 5MB.
                </p>
              </div>
            </div>
          </div>

          <!-- Title -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">
              Judul Buku <span class="text-red-500">*</span>
            </label>
            <input v-model="form.title" type="text" required placeholder="Masukkan judul buku" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 
                 outline-none transition-all text-gray-900 
                 placeholder:text-gray-400" />
          </div>

          <!-- Author -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">
              Penulis <span class="text-red-500">*</span>
            </label>
            <input v-model="form.author" type="text" required placeholder="Masukkan nama penulis" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 
                 outline-none transition-all text-gray-900 
                 placeholder:text-gray-400" />
          </div>

          <!-- Genre -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">
              Genre <span class="text-red-500">*</span>
            </label>
            <select v-model="form.genreId" required class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 
                 outline-none transition-all text-gray-900 bg-white">
              <option value="" disabled>Pilih genre</option>
              <option v-for="genre in genres" :key="genre.id" :value="genre.id">
                {{ genre.name }}
              </option>
            </select>
          </div>

          <!-- Synopsis -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">
              Sinopsis <span class="text-red-500">*</span>
            </label>
            <textarea v-model="form.synopsis" rows="5" required placeholder="Masukkan sinopsis buku" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 
                 outline-none transition-all text-gray-900 
                 placeholder:text-gray-400 resize-none"></textarea>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end space-x-3 pt-4 border-t-2 border-gray-100">
            <button type="button" @click="closeModal" class="px-6 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold 
                 text-gray-700 hover:bg-gray-50 transition-all">
              Batal
            </button>
            <button type="submit" class="px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-700 
                 text-white rounded-xl text-sm font-semibold 
                 hover:shadow-lg hover:shadow-gray-900/30 
                 transition-all duration-300">
              {{ modalMode === 'create' ? 'Tambah Buku' : 'Perbarui Buku' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="showDetailModal && selectedBook"
      class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
      @click.self="closeModal">
      <div class="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Detail Buku</h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>
        </div>

        <div class="px-6 py-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Cover Image -->
            <div>
              <img v-if="selectedBook.cover_img" :src="getBookCoverUrl(selectedBook.cover_img) || ''"
                :alt="selectedBook.title" class="w-full rounded-lg shadow-lg" />
              <div v-else class="w-full aspect-[2/3] bg-gray-100 rounded-lg flex items-center justify-center">
                <PhotoIcon class="h-16 w-16 text-gray-400" />
              </div>
            </div>

            <!-- Book Info -->
            <div class="md:col-span-2 space-y-4">
              <div>
                <h4 class="text-2xl font-bold text-gray-900 mb-2">{{ selectedBook.title }}</h4>
                <p class="text-gray-600">oleh {{ selectedBook.author }}</p>
              </div>

              <div>
                <span class="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                  {{ selectedBook.genre_name }}
                </span>
              </div>

              <div>
                <h5 class="font-semibold text-gray-900 mb-2">Sinopsis</h5>
                <p class="text-gray-700 text-sm leading-relaxed">{{ selectedBook.synopsis }}</p>
              </div>

              <div class="text-sm text-gray-500 space-y-1">
                <p>Ditambahkan: {{ new Date(selectedBook.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })
                  }}</p>
                <p>Terakhir diubah: {{ new Date(selectedBook.updated_at).toLocaleDateString('id-ID', {
                  dateStyle: 'long'
                  }) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>