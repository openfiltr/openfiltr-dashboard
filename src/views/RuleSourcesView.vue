<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="page-shell">
        <page-header
          eyebrow="Filtering"
          title="Rule sources"
          subtitle="Track remote rule-source definitions and trigger refresh requests against the backend."
        >
          <template #actions>
            <ion-button fill="outline" @click="refresh" :disabled="store.loading">Reload</ion-button>
            <ion-button @click="startCreate">New source</ion-button>
          </template>
        </page-header>

        <div class="workspace-grid">
          <div class="stack">
            <div class="toolbar-row">
              <ion-searchbar v-model="search" class="search-input" placeholder="Filter by name or URL" />
              <ion-note color="medium">{{ filteredItems.length }} of {{ store.total }} sources</ion-note>
            </div>

            <data-table
              :columns="columns"
              :rows="filteredItems"
              :loading="store.loading"
              :error="store.error"
              empty-title="No rule sources"
              empty-message="Create a rule source to keep remote block lists in sync."
              :selected-id="selectedId"
              @retry="refresh"
              @select="selectItem"
            >
              <template #cell-name="{ row }">
                <div>
                  <strong>{{ row.name }}</strong>
                  <p class="muted mono" style="margin: 0.35rem 0 0;">{{ row.url }}</p>
                </div>
              </template>
              <template #cell-enabled="{ row }">
                <ion-badge :color="row.enabled ? 'success' : 'medium'">
                  {{ row.enabled ? 'Enabled' : 'Disabled' }}
                </ion-badge>
              </template>
              <template #cell-lastUpdatedAt="{ row }">
                {{ formatDateTime(row.lastUpdatedAt) }}
              </template>
              <template #cell-ruleCount="{ row }">
                {{ formatNumber(row.ruleCount) }}
              </template>
              <template #actions="{ row }">
                <ion-button size="small" fill="clear" @click="selectItem(row)">Edit</ion-button>
                <ion-button size="small" fill="clear" @click="triggerRefresh(row.id)">Refresh</ion-button>
                <ion-button size="small" fill="clear" color="danger" @click="removeItem(row.id)">Delete</ion-button>
              </template>
            </data-table>
          </div>

          <div class="panel-card">
            <div class="panel-card__header">
              <h2 class="panel-card__title">{{ selectedId ? 'Edit rule source' : 'Create rule source' }}</h2>
              <p class="panel-card__subtitle">Refreshing only updates metadata today; the backend marks the source refreshed.</p>
            </div>
            <div class="panel-card__body">
              <form class="form-grid" @submit.prevent="submit">
                <ion-input v-model="form.name" fill="outline" label="Name" label-placement="stacked" required />
                <ion-input v-model="form.url" fill="outline" label="URL" label-placement="stacked" type="url" required />
                <ion-input v-model="form.format" fill="outline" label="Format" label-placement="stacked" placeholder="hosts" />
                <ion-toggle v-model="form.enabled" justify="space-between">Enabled</ion-toggle>
                <div class="form-actions">
                  <ion-button fill="clear" @click="resetForm">Clear</ion-button>
                  <ion-button type="submit" :disabled="store.saving">
                    {{ store.saving ? 'Saving...' : selectedId ? 'Save changes' : 'Create source' }}
                  </ion-button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonBadge,
  IonButton,
  IonContent,
  IonInput,
  IonNote,
  IonPage,
  IonSearchbar,
  IonToggle,
} from '@ionic/vue'
import { computed, onMounted, reactive, ref } from 'vue'

import DataTable, { type DataColumn } from '@/components/DataTable.vue'
import PageHeader from '@/components/PageHeader.vue'
import { useRuleSourcesStore } from '@/stores/rules'
import { useUiStore } from '@/stores/ui'
import type { RuleSource } from '@/types'
import { formatDateTime, formatNumber } from '@/utils/format'

const store = useRuleSourcesStore()
const ui = useUiStore()

const columns: DataColumn[] = [
  { key: 'name', label: 'Source' },
  { key: 'format', label: 'Format' },
  { key: 'enabled', label: 'Status' },
  { key: 'ruleCount', label: 'Rules' },
  { key: 'lastUpdatedAt', label: 'Last refreshed' },
]

const search = ref('')
const selectedId = ref<string | null>(null)
const form = reactive({
  name: '',
  url: '',
  format: 'hosts',
  enabled: true,
})

const filteredItems = computed(() => {
  const term = search.value.trim().toLowerCase()

  if (!term) {
    return store.items
  }

  return store.items.filter((item) =>
    [item.name, item.url, item.format].some((value) => value.toLowerCase().includes(term)),
  )
})

onMounted(() => {
  void store.fetchOnce().catch(() => undefined)
})

function applyForm(item: RuleSource) {
  selectedId.value = item.id
  form.name = item.name
  form.url = item.url
  form.format = item.format
  form.enabled = item.enabled
}

function selectItem(item: RuleSource) {
  applyForm(item)
}

function startCreate() {
  resetForm()
}

function resetForm() {
  selectedId.value = null
  form.name = ''
  form.url = ''
  form.format = 'hosts'
  form.enabled = true
}

async function refresh() {
  await store.refresh()
}

async function submit() {
  const payload = {
    name: form.name,
    url: form.url,
    format: form.format,
    enabled: form.enabled,
  }

  if (selectedId.value) {
    await store.updateItem(selectedId.value, payload)
    ui.showToast('Rule source updated', 'success')
  } else {
    await store.createItem(payload)
    ui.showToast('Rule source created', 'success')
  }

  resetForm()
}

async function triggerRefresh(id: string) {
  await store.refreshSource(id)
  ui.showToast('Refresh requested', 'success')
}

async function removeItem(id: string) {
  if (!window.confirm('Delete this rule source?')) {
    return
  }

  await store.removeItem(id)
  if (selectedId.value === id) {
    resetForm()
  }
  ui.showToast('Rule source deleted', 'success')
}
</script>
