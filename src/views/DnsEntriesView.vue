<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="page-shell">
        <page-header
          eyebrow="DNS"
          title="Local DNS entries"
          subtitle="Manage static DNS records stored in OpenFiltr."
        >
          <template #actions>
            <ion-button fill="outline" @click="refresh" :disabled="store.loading">Reload</ion-button>
            <ion-button @click="startCreate">New entry</ion-button>
          </template>
        </page-header>

        <div class="stack">
          <div class="toolbar-row">
            <ion-searchbar v-model="search" class="search-input" placeholder="Filter by host or value" />
            <ion-note color="medium">{{ filteredItems.length }} of {{ store.total }} entries</ion-note>
          </div>

          <data-table
            :columns="columns"
            :rows="filteredItems"
            :loading="store.loading"
            :error="store.error"
            empty-title="No DNS entries"
            empty-message="Create a local DNS entry to serve static answers."
            :selected-id="selectedId"
            @retry="refresh"
            @select="selectItem"
          >
            <template #cell-host="{ row }">
              <div>
                <strong class="mono">{{ row.host }}</strong>
                <p class="muted" style="margin: 0.35rem 0 0;">{{ row.value }}</p>
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

        <editor-modal
          :is-open="isEditorOpen"
          :busy="store.saving"
          :title="selectedId ? 'Edit DNS entry' : 'Create DNS entry'"
          subtitle="Entries are sent to /api/v1/dns/entries."
          @dismiss="dismissEditor"
        >
          <form class="form-grid" @submit.prevent="submit">
            <ion-input v-model="form.host" fill="outline" label="Host" label-placement="stacked" required />
            <div class="form-grid form-grid--two">
              <ion-select v-model="form.entryType" fill="outline" label="Entry type" label-placement="stacked">
                <ion-select-option value="A">A</ion-select-option>
                <ion-select-option value="AAAA">AAAA</ion-select-option>
                <ion-select-option value="CNAME">CNAME</ion-select-option>
                <ion-select-option value="TXT">TXT</ion-select-option>
              </ion-select>
              <ion-input v-model.number="form.ttl" type="number" fill="outline" label="TTL" label-placement="stacked" />
            </div>
            <ion-input v-model="form.value" fill="outline" label="Value" label-placement="stacked" required />
            <ion-textarea v-model="form.comment" fill="outline" label="Comment" label-placement="stacked" auto-grow />
            <ion-toggle v-model="form.enabled" justify="space-between">Enabled</ion-toggle>
            <div class="form-actions">
              <ion-button fill="clear" @click="dismissEditor">Cancel</ion-button>
              <ion-button type="submit" :disabled="store.saving">
                {{ store.saving ? 'Saving...' : selectedId ? 'Save changes' : 'Create entry' }}
              </ion-button>
            </div>
          </form>
        </editor-modal>
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
import EditorModal from '@/components/EditorModal.vue'
import PageHeader from '@/components/PageHeader.vue'
import { useDnsEntriesStore } from '@/stores/dns'
import { useUiStore } from '@/stores/ui'
import type { DnsEntry } from '@/types'
import { formatDateTime } from '@/utils/format'

const store = useDnsEntriesStore()
const ui = useUiStore()

const columns: DataColumn[] = [
  { key: 'host', label: 'Host' },
  { key: 'entryType', label: 'Type' },
  { key: 'ttl', label: 'TTL' },
  { key: 'enabled', label: 'Status' },
  { key: 'updatedAt', label: 'Updated' },
]

const isEditorOpen = ref(false)
const search = ref('')
const selectedId = ref<string | null>(null)
const form = reactive({
  host: '',
  entryType: 'A',
  value: '',
  ttl: 300,
  comment: '',
  enabled: true,
})

const filteredItems = computed(() => {
  const term = search.value.trim().toLowerCase()

  if (!term) {
    return store.items
  }

  return store.items.filter((item) =>
    [item.host, item.value, item.entryType].some((value) => value.toLowerCase().includes(term)),
  )
})

onMounted(() => {
  void store.fetchOnce().catch(() => undefined)
})

function applyForm(item: DnsEntry) {
  selectedId.value = item.id
  form.host = item.host
  form.entryType = item.entryType
  form.value = item.value
  form.ttl = item.ttl
  form.comment = item.comment ?? ''
  form.enabled = item.enabled
}

function selectItem(item: DnsEntry) {
  applyForm(item)
  isEditorOpen.value = true
}

function startCreate() {
  resetForm()
  isEditorOpen.value = true
}

function dismissEditor() {
  isEditorOpen.value = false
  resetForm()
}

function resetForm() {
  selectedId.value = null
  form.host = ''
  form.entryType = 'A'
  form.value = ''
  form.ttl = 300
  form.comment = ''
  form.enabled = true
}

async function refresh() {
  await store.refresh()
}

async function submit() {
  const payload = {
    host: form.host,
    entryType: form.entryType,
    value: form.value,
    ttl: Number(form.ttl) || 300,
    comment: form.comment,
    enabled: form.enabled,
  }

  if (selectedId.value) {
    await store.updateItem(selectedId.value, payload)
    ui.showToast('DNS entry updated', 'success')
  } else {
    await store.createItem(payload)
    ui.showToast('DNS entry created', 'success')
  }

  dismissEditor()
}

async function removeItem(id: string) {
  if (!window.confirm('Delete this DNS entry?')) {
    return
  }

  await store.removeItem(id)
  if (selectedId.value === id) {
    dismissEditor()
  }
  ui.showToast('DNS entry deleted', 'success')
}
</script>
