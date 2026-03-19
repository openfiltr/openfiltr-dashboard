import { ref } from 'vue'
import { defineStore } from 'pinia'

import { getErrorMessage } from '@/api/client'
import type { ApiList } from '@/types'

interface CrudAdapter<TEntity extends { id: string }, TInput> {
  create: (payload: TInput) => Promise<TEntity>
  list: () => Promise<ApiList<TEntity>>
  remove: (id: string) => Promise<void>
  update: (id: string, payload: TInput) => Promise<TEntity>
}

export function createCrudStore<TEntity extends { id: string }, TInput>(
  storeId: string,
  adapter: CrudAdapter<TEntity, TInput>,
) {
  return defineStore(storeId, () => {
    const items = ref<TEntity[]>([])
    const total = ref(0)
    const loading = ref(false)
    const saving = ref(false)
    const loaded = ref(false)
    const error = ref<string | null>(null)

    async function refresh() {
      loading.value = true
      error.value = null

      try {
        const response = await adapter.list()
        items.value = response.items
        total.value = response.total
        loaded.value = true
      } catch (caught) {
        error.value = getErrorMessage(caught, 'Unable to load records')
        throw caught
      } finally {
        loading.value = false
      }
    }

    async function fetchOnce() {
      if (!loaded.value) {
        await refresh()
      }
    }

    async function createItem(payload: TInput) {
      saving.value = true
      error.value = null

      try {
        const created = await adapter.create(payload)
        await refresh()
        return created
      } catch (caught) {
        error.value = getErrorMessage(caught, 'Unable to create record')
        throw caught
      } finally {
        saving.value = false
      }
    }

    async function updateItem(id: string, payload: TInput) {
      saving.value = true
      error.value = null

      try {
        const updated = await adapter.update(id, payload)
        await refresh()
        return updated
      } catch (caught) {
        error.value = getErrorMessage(caught, 'Unable to update record')
        throw caught
      } finally {
        saving.value = false
      }
    }

    async function removeItem(id: string) {
      saving.value = true
      error.value = null

      try {
        await adapter.remove(id)
        await refresh()
      } catch (caught) {
        error.value = getErrorMessage(caught, 'Unable to delete record')
        throw caught
      } finally {
        saving.value = false
      }
    }

    function clearError() {
      error.value = null
    }

    return {
      clearError,
      createItem,
      error,
      fetchOnce,
      items,
      loaded,
      loading,
      refresh,
      removeItem,
      saving,
      total,
      updateItem,
    }
  })
}
