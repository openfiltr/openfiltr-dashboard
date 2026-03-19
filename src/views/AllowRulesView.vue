<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="page-shell">
        <page-header
          eyebrow="Filtering"
          title="Allow rules"
          subtitle="Manage allow-list exceptions. Search on this page is client-side because the current backend handler only supports pagination."
        >
          <template #actions>
            <ion-button fill="outline" @click="refresh" :disabled="store.loading">Reload</ion-button>
            <ion-button @click="startCreate">New rule</ion-button>
          </template>
        </page-header>

        <div class="workspace-grid">
          <div class="stack">
            <div class="toolbar-row">
              <ion-searchbar v-model="search" class="search-input" placeholder="Filter rules locally" />
              <ion-note color="medium">{{ filteredItems.length }} of {{ store.total }} rules</ion-note>
            </div>

            <data-table
              :columns="columns"
              :rows="filteredItems"
              :loading="store.loading"
              :error="store.error"
              empty-title="No allow rules"
              empty-message="Create an allow rule to override blocking behaviour for trusted domains."
              :selected-id="selectedId"
              @retry="refresh"
              @select="selectItem"
            >
              <template #cell-pattern="{ row }">
                <div>
                  <strong class="mono">{{ row.pattern }}</strong>
                  <p class="muted" style="margin: 0.35rem 0 0;">{{ formatMaybe(row.comment, 'No comment') }}</p>
                </div>
              </template>
              <template #cell-enabled="{ row }">
                <ion-badge :color="row.enabled ? 'success' : 'medium'">
                  {{ row.enabled ? 'Enabled' : 'Disabled' }}
                </ion-badge>
              </template>
              <template #cell-updatedAt="{ row }">
                {{ formatDateTime(row.updatedAt) }}
              </template>
              <template #actions="{ row }">
                <ion-button size="small" fill="clear" @click="selectItem(row)">Edit</ion-button>
                <ion-button size="small" fill="clear" color="danger" @click="removeItem(row.id)">Delete</ion-button>
              </template>
            </data-table>
          </div>

          <div class="panel-card">
            <div class="panel-card__header">
              <h2 class="panel-card__title">{{ selectedId ? 'Edit allow rule' : 'Create allow rule' }}</h2>
              <p class="panel-card__subtitle">Patterns are submitted to <span class="mono">/api/v1/filtering/allow-rules</span>.</p>
            </div>
            <div class="panel-card__body">
              <form class="form-grid" @submit.prevent="submit">
                <ion-input v-model="form.pattern" fill="outline" label="Pattern" label-placement="stacked" placeholder="example.com" required />
                <ion-select v-model="form.ruleType" fill="outline" label="Rule type" label-placement="stacked">
                  <ion-select-option value="exact">Exact</ion-select-option>
                  <ion-select-option value="wildcard">Wildcard</ion-select-option>
                  <ion-select-option value="regex">Regex</ion-select-option>
                </ion-select>
                <ion-textarea v-model="form.comment" fill="outline" label="Comment" label-placement="stacked" auto-grow />
                <ion-toggle v-model="form.enabled" justify="space-between">Enabled</ion-toggle>
                <div class="form-actions">
                  <ion-button fill="clear" @click="resetForm">Clear</ion-button>
                  <ion-button type="submit" :disabled="store.saving">
                    {{ store.saving ? 'Saving...' : selectedId ? 'Save changes' : 'Create rule' }}
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
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonToggle,
} from '@ionic/vue'
import { computed, onMounted, reactive, ref } from 'vue'

import DataTable, { type DataColumn } from '@/components/DataTable.vue'
import PageHeader from '@/components/PageHeader.vue'
import { useAllowRulesStore } from '@/stores/rules'
import { useUiStore } from '@/stores/ui'
import type { Rule } from '@/types'
import { formatDateTime, formatMaybe } from '@/utils/format'

const store = useAllowRulesStore()
const ui = useUiStore()

const columns: DataColumn[] = [
  { key: 'pattern', label: 'Pattern' },
  { key: 'ruleType', label: 'Type' },
  { key: 'enabled', label: 'Status' },
  { key: 'updatedAt', label: 'Updated' },
]

const search = ref('')
const selectedId = ref<string | null>(null)
const form = reactive({
  pattern: '',
  ruleType: 'exact',
  comment: '',
  enabled: true,
})

const filteredItems = computed(() => {
  const term = search.value.trim().toLowerCase()

  if (!term) {
    return store.items
  }

  return store.items.filter((item) =>
    [item.pattern, item.ruleType, item.comment ?? ''].some((value) => value.toLowerCase().includes(term)),
  )
})

onMounted(() => {
  void store.fetchOnce().catch(() => undefined)
})

function applyForm(item: Rule) {
  selectedId.value = item.id
  form.pattern = item.pattern
  form.ruleType = item.ruleType
  form.comment = item.comment ?? ''
  form.enabled = item.enabled
}

function selectItem(item: Rule) {
  applyForm(item)
}

function startCreate() {
  resetForm()
}

function resetForm() {
  selectedId.value = null
  form.pattern = ''
  form.ruleType = 'exact'
  form.comment = ''
  form.enabled = true
}

async function refresh() {
  await store.refresh()
}

async function submit() {
  const payload = {
    pattern: form.pattern,
    ruleType: form.ruleType,
    comment: form.comment,
    enabled: form.enabled,
  }

  if (selectedId.value) {
    await store.updateItem(selectedId.value, payload)
    ui.showToast('Allow rule updated', 'success')
  } else {
    await store.createItem(payload)
    ui.showToast('Allow rule created', 'success')
  }

  resetForm()
}

async function removeItem(id: string) {
  if (!window.confirm('Delete this allow rule?')) {
    return
  }

  await store.removeItem(id)
  if (selectedId.value === id) {
    resetForm()
  }
  ui.showToast('Allow rule deleted', 'success')
}
</script>
