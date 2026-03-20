<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="page-shell">
        <page-header
          eyebrow="Access"
          title="Clients"
          subtitle="Manage client identities and optional group assignments. Clearing an existing group assignment currently depends on backend null-handling."
        >
          <template #actions>
            <ion-button fill="outline" @click="refresh" :disabled="clients.loading">Reload</ion-button>
            <ion-button @click="startCreate">New client</ion-button>
          </template>
        </page-header>

        <div class="stack">
          <div class="toolbar-row">
            <ion-searchbar v-model="search" class="search-input" placeholder="Filter by name, identifier, or group" />
            <ion-note color="medium">{{ filteredItems.length }} of {{ clients.total }} clients</ion-note>
          </div>

          <data-table
            :columns="columns"
            :rows="filteredItems"
            :loading="clients.loading"
            :error="clients.error"
            empty-title="No clients"
            empty-message="Create a client definition to match requests by IP, MAC, or host identifier."
            :selected-id="selectedId"
            @retry="refresh"
            @select="selectItem"
          >
            <template #cell-name="{ row }">
              <div>
                <strong>{{ row.name }}</strong>
                <p class="muted mono" style="margin: 0.35rem 0 0;">{{ row.identifier }}</p>
              </div>
            </template>
            <template #cell-group="{ row }">
              {{ groupName(row.groupId) }}
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
          :busy="clients.saving"
          :title="selectedId ? 'Edit client' : 'Create client'"
          subtitle="Client records are stored via /api/v1/clients."
          @dismiss="dismissEditor"
        >
          <form class="form-grid" @submit.prevent="submit">
            <ion-input v-model="form.name" fill="outline" label="Name" label-placement="stacked" required />
            <ion-input v-model="form.identifier" fill="outline" label="Identifier" label-placement="stacked" required />
            <div class="form-grid form-grid--two">
              <ion-select v-model="form.identifierType" fill="outline" label="Identifier type" label-placement="stacked">
                <ion-select-option value="ip">IP</ion-select-option>
                <ion-select-option value="mac">MAC</ion-select-option>
                <ion-select-option value="hostname">Hostname</ion-select-option>
              </ion-select>
              <ion-select v-model="form.groupId" fill="outline" label="Group" label-placement="stacked">
                <ion-select-option value="">No group</ion-select-option>
                <ion-select-option v-for="group in groups.items" :key="group.id" :value="group.id">
                  {{ group.name }}
                </ion-select-option>
              </ion-select>
            </div>
            <ion-textarea v-model="form.comment" fill="outline" label="Comment" label-placement="stacked" auto-grow />
            <div class="form-actions">
              <ion-button fill="clear" @click="dismissEditor">Cancel</ion-button>
              <ion-button type="submit" :disabled="clients.saving">
                {{ clients.saving ? 'Saving...' : selectedId ? 'Save changes' : 'Create client' }}
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
  IonButton,
  IonContent,
  IonInput,
  IonNote,
  IonPage,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonTextarea,
} from '@ionic/vue'
import { computed, onMounted, reactive, ref } from 'vue'

import DataTable, { type DataColumn } from '@/components/DataTable.vue'
import EditorModal from '@/components/EditorModal.vue'
import PageHeader from '@/components/PageHeader.vue'
import { useClientsStore, useGroupsStore } from '@/stores/directory'
import { useUiStore } from '@/stores/ui'
import type { Client } from '@/types'
import { formatDateTime } from '@/utils/format'

const clients = useClientsStore()
const groups = useGroupsStore()
const ui = useUiStore()

const columns: DataColumn[] = [
  { key: 'name', label: 'Client' },
  { key: 'identifierType', label: 'Identifier type' },
  { key: 'group', label: 'Group' },
  { key: 'updatedAt', label: 'Updated' },
]

const isEditorOpen = ref(false)
const search = ref('')
const selectedId = ref<string | null>(null)
const form = reactive({
  name: '',
  identifier: '',
  identifierType: 'ip',
  groupId: '',
  comment: '',
})

const filteredItems = computed(() => {
  const term = search.value.trim().toLowerCase()

  if (!term) {
    return clients.items
  }

  return clients.items.filter((item) =>
    [item.name, item.identifier, item.identifierType, groupName(item.groupId)].some((value) =>
      value.toLowerCase().includes(term),
    ),
  )
})

onMounted(() => {
  void Promise.all([clients.fetchOnce(), groups.fetchOnce()]).catch(() => undefined)
})

function groupName(groupId: string | null) {
  return groups.items.find((item) => item.id === groupId)?.name ?? 'No group'
}

function applyForm(item: Client) {
  selectedId.value = item.id
  form.name = item.name
  form.identifier = item.identifier
  form.identifierType = item.identifierType
  form.groupId = item.groupId ?? ''
  form.comment = item.comment ?? ''
}

function selectItem(item: Client) {
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
  form.name = ''
  form.identifier = ''
  form.identifierType = 'ip'
  form.groupId = ''
  form.comment = ''
}

async function refresh() {
  await Promise.all([clients.refresh(), groups.refresh()])
}

async function submit() {
  const payload = {
    name: form.name,
    identifier: form.identifier,
    identifierType: form.identifierType,
    groupId: form.groupId,
    comment: form.comment,
  }

  if (selectedId.value) {
    await clients.updateItem(selectedId.value, payload)
    ui.showToast('Client updated', 'success')
  } else {
    await clients.createItem(payload)
    ui.showToast('Client created', 'success')
  }

  dismissEditor()
}

async function removeItem(id: string) {
  if (!window.confirm('Delete this client?')) {
    return
  }

  await clients.removeItem(id)
  if (selectedId.value === id) {
    dismissEditor()
  }
  ui.showToast('Client deleted', 'success')
}
</script>
