<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="page-shell">
        <page-header
          eyebrow="Access"
          title="Groups"
          subtitle="Manage reusable group definitions for client assignments."
        >
          <template #actions>
            <ion-button fill="outline" @click="refresh" :disabled="store.loading">Reload</ion-button>
            <ion-button @click="startCreate">New group</ion-button>
          </template>
        </page-header>

        <div class="stack">
          <div class="toolbar-row">
            <ion-searchbar v-model="search" class="search-input" placeholder="Filter groups locally" />
            <ion-note color="medium">{{ filteredItems.length }} of {{ store.total }} groups</ion-note>
          </div>

          <data-table
            :columns="columns"
            :rows="filteredItems"
            :loading="store.loading"
            :error="store.error"
            empty-title="No groups"
            empty-message="Create a group to organise client definitions."
            :selected-id="selectedId"
            @retry="refresh"
            @select="selectItem"
          >
            <template #cell-name="{ row }">
              <div>
                <strong>{{ row.name }}</strong>
                <p class="muted" style="margin: 0.35rem 0 0;">{{ row.description || 'No description' }}</p>
              </div>
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
          :title="selectedId ? 'Edit group' : 'Create group'"
          subtitle="Group records are stored via /api/v1/groups."
          @dismiss="dismissEditor"
        >
          <form class="form-grid" @submit.prevent="submit">
            <ion-input v-model="form.name" fill="outline" label="Name" label-placement="stacked" required />
            <ion-textarea v-model="form.description" fill="outline" label="Description" label-placement="stacked" auto-grow />
            <div class="form-actions">
              <ion-button fill="clear" @click="dismissEditor">Cancel</ion-button>
              <ion-button type="submit" :disabled="store.saving">
                {{ store.saving ? 'Saving...' : selectedId ? 'Save changes' : 'Create group' }}
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
  IonTextarea,
} from '@ionic/vue'
import { computed, onMounted, reactive, ref } from 'vue'

import DataTable, { type DataColumn } from '@/components/DataTable.vue'
import EditorModal from '@/components/EditorModal.vue'
import PageHeader from '@/components/PageHeader.vue'
import { useGroupsStore } from '@/stores/directory'
import { useUiStore } from '@/stores/ui'
import type { Group } from '@/types'
import { formatDateTime } from '@/utils/format'

const store = useGroupsStore()
const ui = useUiStore()

const columns: DataColumn[] = [
  { key: 'name', label: 'Group' },
  { key: 'updatedAt', label: 'Updated' },
]

const isEditorOpen = ref(false)
const search = ref('')
const selectedId = ref<string | null>(null)
const form = reactive({
  name: '',
  description: '',
})

const filteredItems = computed(() => {
  const term = search.value.trim().toLowerCase()

  if (!term) {
    return store.items
  }

  return store.items.filter((item) =>
    [item.name, item.description ?? ''].some((value) => value.toLowerCase().includes(term)),
  )
})

onMounted(() => {
  void store.fetchOnce().catch(() => undefined)
})

function applyForm(item: Group) {
  selectedId.value = item.id
  form.name = item.name
  form.description = item.description ?? ''
}

function selectItem(item: Group) {
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
  form.description = ''
}

async function refresh() {
  await store.refresh()
}

async function submit() {
  const payload = {
    name: form.name,
    description: form.description,
  }

  if (selectedId.value) {
    await store.updateItem(selectedId.value, payload)
    ui.showToast('Group updated', 'success')
  } else {
    await store.createItem(payload)
    ui.showToast('Group created', 'success')
  }

  dismissEditor()
}

async function removeItem(id: string) {
  if (!window.confirm('Delete this group?')) {
    return
  }

  await store.removeItem(id)
  if (selectedId.value === id) {
    dismissEditor()
  }
  ui.showToast('Group deleted', 'success')
}
</script>
