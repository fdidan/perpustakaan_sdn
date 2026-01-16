<script setup lang="ts">
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-vue-next';
import { toasts, removeToast } from '../utils/toast';

const getIcon = (type: string) => {
  switch (type) {
    case 'success': return CheckCircle;
    case 'error': return XCircle;
    case 'warning': return AlertCircle;
    case 'info': return Info;
    default: return Info;
  }
};

const getClasses = (type: string) => {
  switch (type) {
    case 'success': return 'bg-green-50 border-green-200 text-green-800';
    case 'error': return 'bg-red-50 border-red-200 text-red-800';
    case 'warning': return 'bg-amber-50 border-amber-200 text-amber-800';
    case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
    default: return 'bg-gray-50 border-gray-200 text-gray-800';
  }
};

const getIconColor = (type: string) => {
  switch (type) {
    case 'success': return 'text-green-500';
    case 'error': return 'text-red-500';
    case 'warning': return 'text-amber-500';
    case 'info': return 'text-blue-500';
    default: return 'text-gray-500';
  }
};
</script>

<template>
  <div class="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm',
          'min-w-[300px] max-w-md animate-in slide-in-from-right',
          getClasses(toast.type)
        ]"
      >
        <component :is="getIcon(toast.type)" :class="['h-5 w-5 flex-shrink-0', getIconColor(toast.type)]" />
        <p class="flex-1 text-sm font-medium">{{ toast.message }}</p>
        <button
          @click="removeToast(toast.id)"
          class="p-1 rounded-lg hover:bg-black/5 transition-colors"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}
</style>