<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { Menu, X } from 'lucide-vue-next';
import Sidebar from '../components/dashboard/Sidebar.vue';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const sidebarOpen = ref(false);

onBeforeMount(() => {
  if (!authStore.user || authStore.user.role !== 'pustakawan') {
    router.push('/login');
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Mobile sidebar backdrop -->
    <div
      v-if="sidebarOpen"
      @click="sidebarOpen = false"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
    ></div>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
    >
      <Sidebar />
    </aside>

    <!-- Main content -->
    <div class="lg:pl-64">
      <!-- Top bar for mobile -->
      <div class="sticky top-0 z-30 flex items-center gap-x-6 bg-white border-b border-gray-200 px-4 py-4 lg:hidden">
        <button
          type="button"
          @click="sidebarOpen = true"
          class="p-2 rounded-lg hover:bg-gray-100"
        >
          <Menu class="h-6 w-6 text-gray-700" />
        </button>
        <div class="flex-1 text-sm font-semibold text-gray-900">
          Dashboard Admin
        </div>
      </div>

      <!-- Page content -->
      <main class="p-6 lg:p-8">
        <router-view />
      </main>
    </div>
  </div>
</template>