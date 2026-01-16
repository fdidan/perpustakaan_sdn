// frontend/src/utils/toast.ts
import { ref } from 'vue';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export const toasts = ref<Toast[]>([]);
let toastId = 0;

export const showToast = {
  success: (message: string, duration = 3000) => {
    addToast('success', message, duration);
  },
  
  error: (message: string, duration = 4000) => {
    addToast('error', message, duration);
  },
  
  warning: (message: string, duration = 3500) => {
    addToast('warning', message, duration);
  },
  
  info: (message: string, duration = 3000) => {
    addToast('info', message, duration);
  }
};

function addToast(type: Toast['type'], message: string, duration: number) {
  const id = toastId++;
  const toast: Toast = { id, type, message, duration };
  
  toasts.value.push(toast);
  
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }
}

export function removeToast(id: number) {
  const index = toasts.value.findIndex(t => t.id === id);
  if (index > -1) {
    toasts.value.splice(index, 1);
  }
}

// Confirmation modal state
export const confirmModal = ref<{
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}>({
  show: false,
  title: '',
  message: '',
  onConfirm: () => {},
  onCancel: () => {}
});

export function showConfirm(
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) {
  confirmModal.value = {
    show: true,
    title,
    message,
    onConfirm: () => {
      onConfirm();
      confirmModal.value.show = false;
    },
    onCancel: () => {
      if (onCancel) onCancel();
      confirmModal.value.show = false;
    }
  };
}