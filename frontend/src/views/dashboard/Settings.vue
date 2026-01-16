<!-- frontend/src/views/dashboard/Settings.vue -->
<script setup lang="ts">
import { ref } from 'vue';
import { 
  Cog6ToothIcon,
  UserCircleIcon,
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon
} from '@heroicons/vue/24/outline';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();

const settings = ref({
  notifications: true,
  emailAlerts: false,
  darkMode: false,
  autoSave: true,
});

const saveSettings = () => {
  // Implement settings save logic here
  alert('Settings saved successfully!');
};
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center space-x-3 mb-3">
        <Cog6ToothIcon class="h-8 w-8 text-gray-700" />
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Settings</h1>
          <p class="text-gray-600">Manage your account and application preferences</p>
        </div>
      </div>
    </div>

    <!-- Settings Sections -->
    <div class="space-y-6">
      <!-- Profile Section -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center space-x-3 mb-6">
          <UserCircleIcon class="h-6 w-6 text-gray-700" />
          <h2 class="text-lg font-semibold text-gray-900">Profile Information</h2>
        </div>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              :value="authStore.user?.username"
              disabled
              class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <input
              type="text"
              :value="authStore.user?.role"
              disabled
              class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      <!-- Notifications Section -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center space-x-3 mb-6">
          <BellIcon class="h-6 w-6 text-gray-700" />
          <h2 class="text-lg font-semibold text-gray-900">Notifications</h2>
        </div>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900">Push Notifications</p>
              <p class="text-sm text-gray-500">Receive push notifications for updates</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                v-model="settings.notifications"
                type="checkbox" 
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900">Email Alerts</p>
              <p class="text-sm text-gray-500">Receive email notifications for important updates</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                v-model="settings.emailAlerts"
                type="checkbox" 
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Appearance Section -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center space-x-3 mb-6">
          <PaintBrushIcon class="h-6 w-6 text-gray-700" />
          <h2 class="text-lg font-semibold text-gray-900">Appearance</h2>
        </div>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900">Dark Mode</p>
              <p class="text-sm text-gray-500">Enable dark theme for the interface</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                v-model="settings.darkMode"
                type="checkbox" 
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- System Section -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center space-x-3 mb-6">
          <ShieldCheckIcon class="h-6 w-6 text-gray-700" />
          <h2 class="text-lg font-semibold text-gray-900">System</h2>
        </div>
        
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900">Auto Save</p>
              <p class="text-sm text-gray-500">Automatically save changes</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input 
                v-model="settings.autoSave"
                type="checkbox" 
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <div class="flex justify-end">
        <button
          @click="saveSettings"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
</template>