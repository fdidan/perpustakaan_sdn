import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/books/:slug',
    name: 'BookDetail',
    component: () => import('../views/BookDetail.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false, hideForAuth: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { requiresAuth: false, hideForAuth: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/history',
    name: 'BookHistory',
    component: () => import('../views/BookHistory.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true, requiresPustakawan: true },
    children: [
      {
        path: '',
        redirect: '/dashboard/analytics'
      },
      {
        path: 'analytics',
        name: 'DashboardAnalytics',
        component: () => import('../views/dashboard/Analytics.vue'),
      },
      {
        path: 'books',
        name: 'DashboardBooks',
        component: () => import('../views/dashboard/Books.vue'),
      },
      {
        path: 'users',
        name: 'DashboardUsers',
        component: () => import('../views/dashboard/Users.vue'),
      },
      {
        path: 'genres',
        name: 'DashboardGenres',
        component: () => import('../views/dashboard/Genres.vue'),
      },
      {
        path: 'students',
        name: 'DashboardStudents',
        component: () => import('../views/dashboard/Students.vue'),
      },
    ],
  },
  {
    path: '/dashboard/student-history/:id',
    name: 'StudentHistory',
    component: () => import('../views/dashboard/StudentHistory.vue'),
    meta: { requiresAuth: true, requiresPustakawan: true },
  },
  // 404 & 403 - All unknown routes
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// Navigation guards with 403/404 redirect
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // Initialize auth store if not already done
  if (!authStore.user) {
    authStore.initUser();
  }

  // Redirect authenticated users away from login/register
  if (to.meta.hideForAuth && authStore.user) {
    next('/');
    return;
  }

  // Check if route requires authentication (401 → redirect to login)
  if (to.meta.requiresAuth && !authStore.user) {
    next('/login');
    return;
  }

  // Check if route requires pustakawan role (403 → redirect to 404)
  if (to.meta.requiresPustakawan && authStore.user?.role !== 'pustakawan') {
    // Redirect 403 to NotFound page
    next({ name: 'NotFound', replace: true });
    return;
  }

  next();
});

// Global error handler for navigation errors
router.onError((error) => {
  console.error('Router error:', error);
});

export default router;