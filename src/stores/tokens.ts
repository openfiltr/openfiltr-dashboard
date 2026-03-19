import { ref } from 'vue'
import { defineStore } from 'pinia'

import * as authApi from '@/api/auth'
import { getErrorMessage } from '@/api/client'
import type { ApiToken, ApiTokenInput, CreatedApiToken } from '@/types'

export const useTokensStore = defineStore('tokens', () => {
  const items = ref<ApiToken[]>([])
  const total = ref(0)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)
  const lastCreatedToken = ref<CreatedApiToken | null>(null)

  async function refresh() {
    loading.value = true
    error.value = null

    try {
      const response = await authApi.listTokens()
      items.value = response.items
      total.value = response.total
    } catch (caught) {
      error.value = getErrorMessage(caught, 'Unable to load API tokens')
      throw caught
    } finally {
      loading.value = false
    }
  }

  async function createItem(payload: ApiTokenInput) {
    saving.value = true
    error.value = null

    try {
      lastCreatedToken.value = await authApi.createToken(payload)
      await refresh()
      return lastCreatedToken.value
    } catch (caught) {
      error.value = getErrorMessage(caught, 'Unable to create the API token')
      throw caught
    } finally {
      saving.value = false
    }
  }

  async function removeItem(id: string) {
    saving.value = true
    error.value = null

    try {
      await authApi.deleteToken(id)
      await refresh()
    } catch (caught) {
      error.value = getErrorMessage(caught, 'Unable to delete the API token')
      throw caught
    } finally {
      saving.value = false
    }
  }

  function clearCreatedToken() {
    lastCreatedToken.value = null
  }

  return {
    clearCreatedToken,
    createItem,
    error,
    items,
    lastCreatedToken,
    loading,
    refresh,
    removeItem,
    saving,
    total,
  }
})
