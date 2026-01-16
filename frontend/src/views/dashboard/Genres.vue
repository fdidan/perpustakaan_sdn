<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, TagIcon } from '@heroicons/vue/24/outline';
import { genresAPI, type Genre } from '../../services/api';
import { showToast, showConfirm } from '../../utils/toast';

const genres = ref<Genre[]>([]);
const loading = ref(true);
const showModal = ref(false);
const modalMode = ref<'create' | 'edit'>('create');
const selectedGenre = ref<Genre | null>(null);

const form = ref({
  name: '',
});

const fetchGenres = async () => {
  try {
    loading.value = true;
    const response = await genresAPI.getAll();
    genres.value = response.data.data;
  } catch (error) {
    showToast.error('Gagal memuat genre');
  } finally {
    loading.value = false;
  }
};

const openCreateModal = () => {
  modalMode.value = 'create';
  form.value.name = '';
  showModal.value = true;
};

const openEditModal = (genre: Genre) => {
  modalMode.value = 'edit';
  selectedGenre.value = genre;
  form.value.name = genre.name;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  selectedGenre.value = null;
};

const handleSubmit = async () => {
  if (!form.value.name.trim()) {
    showToast.error('Nama genre harus diisi');
    return;
  }

  showConfirm(
    modalMode.value === 'create' ? 'Tambah Genre' : 'Edit Genre',
    `Apakah Anda yakin ingin ${modalMode.value === 'create' ? 'menambah' : 'mengubah'} genre ini?`,
    async () => {
      try {
        if (modalMode.value === 'create') {
          await genresAPI.create({ name: form.value.name });
          showToast.success('Genre berhasil ditambahkan');
        } else if (selectedGenre.value) {
          await genresAPI.update(selectedGenre.value.id, { name: form.value.name });
          showToast.success('Genre berhasil diperbarui');
        }

        await fetchGenres();
        closeModal();
      } catch (error: any) {
        showToast.error(error.response?.data?.message || 'Gagal menyimpan genre');
      }
    }
  );
};

const handleDelete = (genre: Genre) => {
  showConfirm(
    'Hapus Genre',
    `Apakah Anda yakin ingin menghapus genre "${genre.name}"?`,
    async () => {
      try {
        await genresAPI.delete(genre.id);
        await fetchGenres();
        showToast.success('Genre berhasil dihapus');
      } catch (error: any) {
        showToast.error(error.response?.data?.message || 'Gagal menghapus genre');
      }
    }
  );
};

onMounted(() => {
  fetchGenres();
});
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Kelola Genre</h1>
      <p class="text-gray-600">Kelola kategori buku perpustakaan</p>
    </div>

    <!-- Actions -->
    <div class="flex justify-end mb-6">
      <button
        @click="openCreateModal"
        class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <PlusIcon class="h-5 w-5 mr-2" />
        Tambah Genre
      </button>
    </div>

    <!-- Genres Grid -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="genre in genres"
        :key="genre.id"
        class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-blue-100 rounded-lg">
              <TagIcon class="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">{{ genre.name }}</h3>
              <p class="text-sm text-gray-500">
                Dibuat: {{ new Date(genre.created_at).toLocaleDateString('id-ID') }}
              </p>
            </div>
          </div>
          
          <div class="flex space-x-2">
            <button
              @click="openEditModal(genre)"
              class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Edit"
            >
              <PencilIcon class="h-4 w-4" />
            </button>
            <button
              @click="handleDelete(genre)"
              class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Hapus"
            >
              <TrashIcon class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50"
    >
      <div class="bg-white rounded-lg max-w-md w-full">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">
              {{ modalMode === 'create' ? 'Tambah Genre Baru' : 'Edit Genre' }}
            </h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="px-6 py-4">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Nama Genre
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="Contoh: Fiksi Anak, Matematika, IPA"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {{ modalMode === 'create' ? 'Tambah' : 'Perbarui' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>