import { defineStore } from 'pinia'
import { ref } from 'vue'

import * as filteringApi from '@/api/filtering'
import { getErrorMessage } from '@/api/client'
import { createCrudStore } from '@/stores/resourceFactory'
import type { RuleSource, RuleSourceInput } from '@/types'

export const useBlockRulesStore = createCrudStore('block-rules', {
  list: filteringApi.listBlockRules,
  create: filteringApi.createBlockRule,
  update: filteringApi.updateBlockRule,
  remove: filteringApi.deleteBlockRule,
})

export const useAllowRulesStore = createCrudStore('allow-rules', {
  list: filteringApi.listAllowRules,
  create: filteringApi.createAllowRule,
  update: filteringApi.updateAllowRule,
  remove: filteringApi.deleteAllowRule,
})

export const useRuleSourcesStore = defineStore('rule-sources', () => {
  const items = ref<RuleSource[]>([])
  const total = ref(0)
  const loading = ref(false)
  const saving = ref(false)
  const loaded = ref(false)
  const error = ref<string | null>(null)

  async function refresh() {
    loading.value = true
    error.value = null

    try {
      const response = await filteringApi.listRuleSources()
      items.value = response.items
      total.value = response.total
      loaded.value = true
    } catch (caught) {
      error.value = getErrorMessage(caught, 'Unable to load rule sources')
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

  async function createItem(payload: RuleSourceInput) {
    saving.value = true
    error.value = null

    try {
      const item = await filteringApi.createRuleSource(payload)
      await refresh()
      return item
    } catch (caught) {
      error.value = getErrorMessage(caught, 'Unable to create the rule source')
      throw caught
    } finally {
      saving.value = false
    }
  }

  async function updateItem(id: string, payload: RuleSourceInput) {
    saving.value = true
    error.value = null

    try {
      const item = await filteringApi.updateRuleSource(id, payload)
      await refresh()
      return item
    } catch (caught) {
      error.value = getErrorMessage(caught, 'Unable to update the rule source')
      throw caught
    } finally {
      saving.value = false
    }
  }

  async function removeItem(id: string) {
    saving.value = true
    error.value = null

    try {
      await filteringApi.deleteRuleSource(id)
      await refresh()
    } catch (caught) {
      error.value = getErrorMessage(caught, 'Unable to delete the rule source')
      throw caught
    } finally {
      saving.value = false
    }
  }

  async function refreshSource(id: string) {
    saving.value = true
    error.value = null

    try {
      await filteringApi.refreshRuleSource(id)
      await refresh()
    } catch (caught) {
      error.value = getErrorMessage(caught, 'Unable to refresh the rule source')
      throw caught
    } finally {
      saving.value = false
    }
  }

  return {
    createItem,
    error,
    fetchOnce,
    items,
    loaded,
    loading,
    refresh,
    refreshSource,
    removeItem,
    saving,
    total,
    updateItem,
  }
})
