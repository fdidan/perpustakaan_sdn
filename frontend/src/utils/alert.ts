import Swal from 'sweetalert2';

export const showAlert = {
  success: (message: string) => {
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: message,
      showConfirmButton: false,
      timer: 1500,
      customClass: {
        popup: 'rounded-xl',
        title: 'font-semibold',
      },
    });
  },

  error: (message: string) => {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      confirmButtonText: 'OK',
      customClass: {
        popup: 'rounded-xl',
        title: 'font-semibold',
        confirmButton: 'bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors',
      },
    });
  },

  confirm: (title: string, text: string) => {
    return Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      customClass: {
        popup: 'rounded-xl',
        title: 'font-semibold',
        confirmButton: 'bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors',
        cancelButton: 'bg-gray-500 hover:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors',
      },
    });
  },

  loading: () => {
    Swal.fire({
      title: 'Processing...',
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
      customClass: {
        popup: 'rounded-xl',
        title: 'font-semibold',
      },
    });
  },

  close: () => {
    Swal.close();
  },
};