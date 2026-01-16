<script setup lang="ts">
import { RouterView } from 'vue-router';
import Navigation from './components/Navigation.vue';
import ToastContainer from './components/ToastContainer.vue';
import ConfirmModal from './components/ConfirmModal.vue';
</script>

<template>
  <div class="min-h-screen">
    <Navigation />
    <RouterView />
    <ToastContainer />
    <ConfirmModal />
  </div>
</template>