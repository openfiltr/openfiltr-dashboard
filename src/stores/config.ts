import { ref } from 'vue'
import { defineStore } from 'pinia'

import * as configApi from '@/api/config'
import { getErrorMessage } from '@/api/client'

export const useConfigStore = defineStore('config', () => {
  const exporting = ref(false)
  const importing = ref(false)
  const error = ref<string | null>(null)
  const lastImportedCount = ref<number | null>(null)

  async function exportConfiguration() {
    exporting.value = true
    error.value = null

    try {
      return await configApi.exportConfig()
    } catch (caught) {
      error.value = getErrorMessage(caught, 'Unable to export configuration')
      throw caught
    } finally {
      exporting.value = false
    }
  }

  async function importConfiguration(payload: string) {
    importing.value = true
    error.value = null

    try {
      const response = await configApi.importConfig(payload)
      lastImportedCount.value = response.imported
      return response
    } catch (caught) {
      error.value = getErrorMessage(caught, 'Unable to import configuration')
      throw caught
    } finally {
      importing.value = false
    }
  }

  return {
    error,
    exportConfiguration,
    exporting,
    importConfiguration,
    importing,
    lastImportedCount,
  }
})
