<script setup lang="ts">
import { useRoute } from 'vue-router';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Tag
} from 'lucide-vue-next';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();
const route = useRoute();

const navigation = [
  { name: 'Dashboard', href: '/dashboard/analytics', icon: LayoutDashboard },
  { name: 'Buku', href: '/dashboard/books', icon: BookOpen },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Genre', href: '/dashboard/genres', icon: Tag },
  { name: 'Riwayat Siswa', href: '/dashboard/students', icon: Users },
];
</script>

<template>
  <div class="h-full flex flex-col bg-white">
    <!-- Logo -->
    <div class="flex items-center gap-3 h-20 px-6 border-b border-gray-200">
      <div class="p-2 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl">
        <BookOpen class="h-5 w-5 text-white" />
      </div>
      <div>
        <h1 class="text-lg font-bold text-gray-900">Dashboard</h1>
        <p class="text-xs text-gray-500">Pustakawan</p>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
      <router-link
        v-for="item in navigation"
        :key="item.name"
        :to="item.href"
        :class="[
          route.path.startsWith(item.href)
            ? 'bg-gray-100 text-gray-900'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
          'group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all'
        ]"
      >
        <component
          :is="item.icon"
          :class="[
            route.path.startsWith(item.href)
              ? 'text-gray-900'
              : 'text-gray-400 group-hover:text-gray-600',
            'h-5 w-5 flex-shrink-0'
          ]"
        />
        {{ item.name }}
      </router-link>
    </nav>

    <!-- User info -->
    <div class="p-4 border-t border-gray-200">
      <router-link
        to="/profile"
        class="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-xl transition-colors"
      >
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center">
          <span class="text-white font-semibold text-sm">
            {{ authStore.user?.username?.charAt(0).toUpperCase() }}
          </span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-gray-900 truncate">
            {{ authStore.user?.username }}
          </p>
          <p class="text-xs text-gray-500">{{ authStore.user?.role }}</p>
        </div>
      </router-link>
    </div>
  </div>
</template>