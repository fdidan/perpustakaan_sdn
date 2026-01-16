<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next';
import { confirmModal } from '../utils/toast';
</script>

<template>
  <Transition name="modal">
    <div
      v-if="confirmModal.show"
      class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      @click.self="confirmModal.onCancel"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      
      <!-- Modal -->
      <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95">
        <!-- Icon -->
        <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-amber-100">
          <AlertTriangle class="h-6 w-6 text-amber-600" />
        </div>
        
        <!-- Title -->
        <h3 class="text-xl font-bold text-gray-900 text-center mb-2">
          {{ confirmModal.title }}
        </h3>
        
        <!-- Message -->
        <p class="text-gray-600 text-center mb-6">
          {{ confirmModal.message }}
        </p>
        
        <!-- Actions -->
        <div class="flex gap-3">
          <button
            @click="confirmModal.onCancel"
            class="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            @click="confirmModal.onConfirm"
            class="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
          >
            Ya, Lanjutkan
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.3s ease;
}

.modal-enter-from .bg-white {
  transform: scale(0.9);
}

.modal-leave-to .bg-white {
  transform: scale(0.9);
}
</style>