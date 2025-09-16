import { createRouter, createWebHistory } from 'vue-router'
// import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import DataGedungNasionalView from '@/views/DataGedungNasionalView.vue'
import DataRuangMessView from '@/views/DataRuangMessView.vue'
import DataAdminView from '@/views/DataAdminView.vue'
import ProfileView from '@/views/ProfileView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Login',
      component: LoginView,
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: DashboardView,
    },
    {
      path: '/data-gedung-nasional',
      name: 'DataGedungNasional',
      component: DataGedungNasionalView,
    },
    {
      path: '/data-ruang-mess',
      name: 'DataRuangMess',
      component: DataRuangMessView,
    },
    {
      path: '/data-admin',
      name: 'DataAdmin',
      component: DataAdminView,
    },
    {
      path: '/profile',
      name: 'Profile',
      component: ProfileView,
    }
  ],
})

export default router