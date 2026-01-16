<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Users, Eye, BookOpen, Loader2, AlertCircle } from 'lucide-vue-next';
import { usersAPI } from '../../services/api';
import { useAuthStore } from '../../stores/auth';

interface Student {
  id: number;
  username: string;
  role: string;
  created_at: string;
  total_books_read: number;
  total_views: number;
}

const router = useRouter();
const authStore = useAuthStore();

const students = ref<Student[]>([]);
const loading = ref(true);
const error = ref('');

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const fetchStudents = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    const response = await usersAPI.getStudents();
    students.value = response.data.students || [];
  } catch (err: any) {
    console.error('Fetch students error:', err);
    if (err.response?.status === 403) {
      error.value = 'Anda tidak memiliki akses untuk melihat data ini';
    } else {
      error.value = err.response?.data?.error || 'Gagal memuat daftar siswa';
    }
  } finally {
    loading.value = false;
  }
};

const viewStudentHistory = (studentId: number) => {
  router.push(`/dashboard/student-history/${studentId}`);
};

onMounted(() => {
  if (!authStore.user || authStore.user.role !== 'pustakawan') {
    router.push('/');
    return;
  }
  
  fetchStudents();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <div class="flex items-center space-x-3 mb-4">
        <div class="p-2 bg-blue-50 rounded-lg">
          <Users class="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Manajemen Riwayat Siswa</h1>
          <p class="text-gray-600">Lihat riwayat bacaan semua siswa</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="relative">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
        <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 absolute inset-0"></div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start space-x-4">
      <AlertCircle class="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
      <div>
        <h3 class="font-semibold text-red-900">Terjadi Kesalahan</h3>
        <p class="text-red-700">{{ error }}</p>
      </div>
    </div>

    <!-- Students Table -->
    <div v-else class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div v-if="students.length === 0" class="text-center py-12">
        <Users class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-500">Belum ada siswa terdaftar</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nama Siswa</th>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Buku Dibaca</th>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total Views</th>
              <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Terdaftar Sejak</th>
              <th class="px-6 py-4 text-right text-sm font-semibold text-gray-900">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="student in students" :key="student.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4">
                <p class="font-medium text-gray-900">{{ student.username }}</p>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center space-x-2">
                  <BookOpen class="h-4 w-4 text-blue-600" />
                  <span class="text-gray-700">{{ student.total_books_read }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center space-x-2">
                  <Eye class="h-4 w-4 text-amber-600" />
                  <span class="text-gray-700">{{ student.total_views || 0 }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ formatDate(student.created_at) }}
              </td>
              <td class="px-6 py-4 text-right">
                <button @click="viewStudentHistory(student.id)"
                  class="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                  Lihat Riwayat
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
