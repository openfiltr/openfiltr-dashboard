<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="page-shell">
        <page-header
          eyebrow="DNS"
          title="Upstream DNS servers"
          subtitle="Define the upstream resolvers OpenFiltr should use when serving DNS traffic."
        >
          <template #actions>
            <ion-button fill="outline" @click="refresh" :disabled="store.loading">Reload</ion-button>
            <ion-button @click="startCreate">New server</ion-button>
          </template>
        </page-header>

        <div class="workspace-grid">
          <div class="stack">
            <div class="toolbar-row">
              <ion-searchbar v-model="search" class="search-input" placeholder="Filter by name or address" />
              <ion-note color="medium">{{ filteredItems.length }} of {{ store.total }} servers</ion-note>
            </div>

            <data-table
              :columns="columns"
              :rows="filteredItems"
              :loading="store.loading"
              :error="store.error"
              empty-title="No upstream servers"
              empty-message="Create an upstream server to define how OpenFiltr resolves external DNS."
              :selected-id="selectedId"
              @retry="refresh"
              @select="selectItem"
            >
              <template #cell-name="{ row }">
                <div>
                  <strong>{{ row.name }}</strong>
                  <p class="muted mono" style="margin: 0.35rem 0 0;">{{ row.address }}</p>
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
              <h2 class="panel-card__title">{{ selectedId ? 'Edit upstream server' : 'Create upstream server' }}</h2>
              <p class="panel-card__subtitle">Use addresses such as <span class="mono">1.1.1.1:53</span> or a DoH endpoint.</p>
            </div>
            <div class="panel-card__body">
              <form class="form-grid" @submit.prevent="submit">
                <ion-input v-model="form.name" fill="outline" label="Name" label-placement="stacked" required />
                <ion-input v-model="form.address" fill="outline" label="Address" label-placement="stacked" required />
                <div class="form-grid form-grid--two">
                  <ion-select v-model="form.protocol" fill="outline" label="Protocol" label-placement="stacked">
                    <ion-select-option value="udp">UDP</ion-select-option>
                    <ion-select-option value="tcp">TCP</ion-select-option>
                    <ion-select-option value="https">HTTPS</ion-select-option>
                    <ion-select-option value="tls">TLS</ion-select-option>
                  </ion-select>
                  <ion-input v-model.number="form.priority" type="number" fill="outline" label="Priority" label-placement="stacked" />
                </div>
                <ion-toggle v-model="form.enabled" justify="space-between">Enabled</ion-toggle>
                <div class="form-actions">
                  <ion-button fill="clear" @click="resetForm">Clear</ion-button>
                  <ion-button type="submit" :disabled="store.saving">
                    {{ store.saving ? 'Saving...' : selectedId ? 'Save changes' : 'Create server' }}
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
  IonToggle,
} from '@ionic/vue'
import { computed, onMounted, reactive, ref } from 'vue'

import DataTable, { type DataColumn } from '@/components/DataTable.vue'
import PageHeader from '@/components/PageHeader.vue'
import { useUpstreamServersStore } from '@/stores/dns'
import { useUiStore } from '@/stores/ui'
import type { UpstreamServer } from '@/types'
import { formatDateTime } from '@/utils/format'

const store = useUpstreamServersStore()
const ui = useUiStore()

const columns: DataColumn[] = [
  { key: 'name', label: 'Server' },
  { key: 'protocol', label: 'Protocol' },
  { key: 'priority', label: 'Priority' },
  { key: 'enabled', label: 'Status' },
  { key: 'updatedAt', label: 'Updated' },
]

const search = ref('')
const selectedId = ref<string | null>(null)
const form = reactive({
  name: '',
  address: '',
  protocol: 'udp',
  priority: 0,
  enabled: true,
})

const filteredItems = computed(() => {
  const term = search.value.trim().toLowerCase()

  if (!term) {
    return store.items
  }

  return store.items.filter((item) =>
    [item.name, item.address, item.protocol].some((value) => value.toLowerCase().includes(term)),
  )
})

onMounted(() => {
  void store.fetchOnce().catch(() => undefined)
})

function applyForm(item: UpstreamServer) {
  selectedId.value = item.id
  form.name = item.name
  form.address = item.address
  form.protocol = item.protocol
  form.priority = item.priority
  form.enabled = item.enabled
}

function selectItem(item: UpstreamServer) {
  applyForm(item)
}

function startCreate() {
  resetForm()
}

function resetForm() {
  selectedId.value = null
  form.name = ''
  form.address = ''
  form.protocol = 'udp'
  form.priority = 0
  form.enabled = true
}

async function refresh() {
  await store.refresh()
}

async function submit() {
  const payload = {
    name: form.name,
    address: form.address,
    protocol: form.protocol,
    priority: Number(form.priority) || 0,
    enabled: form.enabled,
  }

  if (selectedId.value) {
    await store.updateItem(selectedId.value, payload)
    ui.showToast('Upstream server updated', 'success')
  } else {
    await store.createItem(payload)
    ui.showToast('Upstream server created', 'success')
  }

  resetForm()
}

async function removeItem(id: string) {
  if (!window.confirm('Delete this upstream server?')) {
    return
  }

  await store.removeItem(id)
  if (selectedId.value === id) {
    resetForm()
  }
  ui.showToast('Upstream server deleted', 'success')
}
</script>
