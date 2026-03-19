import type { Router } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

export function registerGuards(router: Router) {
  router.beforeEach(async (to) => {
    const auth = useAuthStore()

    if (!auth.ready) {
      await auth.bootstrap()
    }

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
      return {
        name: 'login',
        query: {
          redirect: to.fullPath,
        },
      }
    }

    if (to.meta.guestOnly && auth.isAuthenticated) {
      return {
        path: '/dashboard',
      }
    }

    return true
  })
}
