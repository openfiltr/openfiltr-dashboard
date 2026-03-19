import { ref } from 'vue'
import { defineStore } from 'pinia'

import * as systemApi from '@/api/system'
import { getErrorMessage } from '@/api/client'
import type { ActivitySummary, BackendVersion, HealthStatus, SystemStats, SystemStatus } from '@/types'

export const useSystemStore = defineStore('system', () => {
  const loading = ref(false)
  const publicLoading = ref(false)
  const error = ref<string | null>(null)
  const publicError = ref<string | null>(null)

  const health = ref<HealthStatus | null>(null)
  const version = ref<BackendVersion | null>(null)
  const status = ref<SystemStatus | null>(null)
  const stats = ref<SystemStats | null>(null)
  const activitySummary = ref<ActivitySummary | null>(null)

  async function loadPublicInfo() {
    publicLoading.value = true
    publicError.value = null

    try {
      const [healthResponse, versionResponse] = await Promise.all([
        systemApi.getHealth(),
        systemApi.getVersion(),
      ])
      health.value = healthResponse
      version.value = versionResponse
    } catch (caught) {
      publicError.value = getErrorMessage(caught, 'Unable to contact the backend')
      throw caught
    } finally {
      publicLoading.value = false
    }
  }

  async function loadDashboard() {
    loading.value = true
    error.value = null

    try {
      const [statusResponse, statsResponse, activityResponse] = await Promise.all([
        systemApi.getStatus(),
        systemApi.getStats(),
        systemApi.getActivitySummary(),
      ])

      status.value = statusResponse
      stats.value = statsResponse
      activitySummary.value = activityResponse
    } catch (caught) {
      error.value = getErrorMessage(caught, 'Unable to load dashboard data')
      throw caught
    } finally {
      loading.value = false
    }
  }

  return {
    activitySummary,
    error,
    health,
    loadDashboard,
    loadPublicInfo,
    loading,
    publicError,
    publicLoading,
    stats,
    status,
    version,
  }
})
