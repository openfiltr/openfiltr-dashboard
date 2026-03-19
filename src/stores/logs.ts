import { ref } from 'vue'
import { defineStore } from 'pinia'

import * as activityApi from '@/api/activity'
import { getErrorMessage } from '@/api/client'
import type { ActivityEntry, ActivityFilters, AuditEvent } from '@/types'

export const useActivityStore = defineStore('activity', () => {
  const items = ref<ActivityEntry[]>([])
  const total = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<ActivityFilters>({
    clientIp: '',
    domain: '',
    action: '',
  })

  async function refresh() {
    loading.value = true
    error.value = null

    try {
      const response = await activityApi.listActivity(filters.value)
      items.value = response.items
      total.value = response.total
    } catch (caught) {
      error.value = getErrorMessage(caught, 'Unable to load the activity log')
      throw caught
    } finally {
      loading.value = false
    }
  }

  function setFilters(next: Partial<ActivityFilters>) {
    filters.value = {
      ...filters.value,
      ...next,
    }
  }

  return {
    error,
    filters,
    items,
    loading,
    refresh,
    setFilters,
    total,
  }
})

export const useAuditStore = defineStore('audit', () => {
  const items = ref<AuditEvent[]>([])
  const total = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function refresh() {
    loading.value = true
    error.value = null

    try {
      const response = await activityApi.listAuditEvents()
      items.value = response.items
      total.value = response.total
    } catch (caught) {
      error.value = getErrorMessage(caught, 'Unable to load the audit log')
      throw caught
    } finally {
      loading.value = false
    }
  }

  return {
    error,
    items,
    loading,
    refresh,
    total,
  }
})
