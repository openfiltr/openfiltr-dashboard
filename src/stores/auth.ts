import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import * as authApi from '@/api/auth'
import { getErrorMessage } from '@/api/client'
import type { Credentials, User } from '@/types'

const storageKey = 'openfiltr.dashboard.session'

interface PersistedSession {
  token: string | null
  user: User | null
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const user = ref<User | null>(null)
  const ready = ref(false)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => Boolean(token.value && user.value))

  function persistSession() {
    const payload: PersistedSession = {
      token: token.value,
      user: user.value,
    }
    localStorage.setItem(storageKey, JSON.stringify(payload))
  }

  function restoreSession() {
    const raw = localStorage.getItem(storageKey)

    if (!raw) {
      return
    }

    try {
      const payload = JSON.parse(raw) as PersistedSession
      token.value = payload.token
      user.value = payload.user
    } catch {
      localStorage.removeItem(storageKey)
    }
  }

  function clearSession() {
    token.value = null
    user.value = null
    error.value = null
    localStorage.removeItem(storageKey)
  }

  async function bootstrap() {
    if (ready.value) {
      return
    }

    restoreSession()

    if (!token.value) {
      ready.value = true
      return
    }

    try {
      user.value = await authApi.me()
      persistSession()
    } catch {
      clearSession()
    } finally {
      ready.value = true
    }
  }

  async function login(credentials: Credentials) {
    loading.value = true
    error.value = null

    try {
      const response = await authApi.login(credentials)
      token.value = response.token
      user.value = await authApi.me()
      persistSession()
    } catch (caught) {
      clearSession()
      error.value = getErrorMessage(caught, 'Unable to sign in')
      throw caught
    } finally {
      loading.value = false
    }
  }

  async function completeSetup(credentials: Credentials) {
    loading.value = true
    error.value = null

    try {
      await authApi.setup(credentials)
    } catch (caught) {
      error.value = getErrorMessage(caught, 'Unable to complete setup')
      throw caught
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      if (token.value) {
        await authApi.logout()
      }
    } finally {
      clearSession()
    }
  }

  return {
    bootstrap,
    clearSession,
    completeSetup,
    error,
    isAuthenticated,
    loading,
    login,
    logout,
    ready,
    token,
    user,
  }
})
