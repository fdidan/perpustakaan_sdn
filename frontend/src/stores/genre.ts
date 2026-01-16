import { defineStore } from 'pinia';
import api from '../services/api';

export const useGenreStore = defineStore('genre', {
  state: () => ({
    genres: [] as { id: number; name: string }[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchGenres() {
      try {
        this.loading = true;
        const response = await api.get('/genres');
        this.genres = response.data.data;
        this.error = null;
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Failed to fetch genres';
        console.error('Error fetching genres:', err);
      } finally {
        this.loading = false;
      }
    },

    getGenreName(id: number) {
      return this.genres.find(g => g.id === id)?.name || '';
    }
  },
});