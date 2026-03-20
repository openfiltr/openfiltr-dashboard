<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="page-shell">
        <page-header
          eyebrow="Access"
          title="API tokens"
          subtitle="Create and revoke long-lived OpenFiltr API tokens. Raw token values are only returned once."
        >
          <template #actions>
            <ion-button fill="outline" @click="refresh" :disabled="store.loading">Reload</ion-button>
            <ion-button @click="openEditor">New token</ion-button>
          </template>
        </page-header>

        <state-notice
          v-if="store.lastCreatedToken"
          title="Token created"
          message="Copy this token now. The backend will not return the raw token value again after creation."
        >
          <template #actions>
            <copy-field label="API token" :value="store.lastCreatedToken.token" />
            <div style="margin-top: 0.75rem;">
              <ion-button size="small" fill="clear" @click="store.clearCreatedToken">Dismiss</ion-button>
            </div>
          </template>
        </state-notice>

        <div class="stack">
          <data-table
            :columns="columns"
            :rows="store.items"
            :loading="store.loading"
            :error="store.error"
            empty-title="No API tokens"
            empty-message="Create an API token for automation or CLI access."
            @retry="refresh"
            @select="noop"
          >
            <template #cell-name="{ row }">
              <div>
                <strong>{{ row.name }}</strong>
                <p class="muted mono" style="margin: 0.35rem 0 0;">{{ row.scopes }}</p>
              </div>
            </template>
            <template #cell-createdAt="{ row }">
              {{ formatDateTime(row.createdAt) }}
            </template>
            <template #cell-lastUsedAt="{ row }">
              {{ formatDateTime(row.lastUsedAt) }}
            </template>
            <template #cell-expiresAt="{ row }">
              {{ formatDateTime(row.expiresAt) }}
            </template>
            <template #actions="{ row }">
              <ion-button size="small" fill="clear" color="danger" @click="removeItem(row.id)">Delete</ion-button>
            </template>
          </data-table>
        </div>

        <editor-modal
          :is-open="isEditorOpen"
          :busy="store.saving"
          title="Create API token"
          subtitle="Optional expiry dates are sent in RFC3339 via POST /api/v1/auth/tokens."
          @dismiss="dismissEditor"
        >
          <form class="form-grid" @submit.prevent="submit">
            <ion-input v-model="form.name" fill="outline" label="Name" label-placement="stacked" required />
            <ion-input v-model="form.expiresAt" type="datetime-local" fill="outline" label="Expires at" label-placement="stacked" />
            <div class="form-actions">
              <ion-button fill="clear" @click="dismissEditor">Cancel</ion-button>
              <ion-button type="submit" :disabled="store.saving">
                {{ store.saving ? 'Creating...' : 'Create token' }}
              </ion-button>
            </div>
          </form>
        </editor-modal>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButton, IonContent, IonInput, IonPage } from '@ionic/vue'
import { onMounted, reactive, ref } from 'vue'

import CopyField from '@/components/CopyField.vue'
import DataTable, { type DataColumn } from '@/components/DataTable.vue'
import EditorModal from '@/components/EditorModal.vue'
import PageHeader from '@/components/PageHeader.vue'
import StateNotice from '@/components/StateNotice.vue'
import { useTokensStore } from '@/stores/tokens'
import { useUiStore } from '@/stores/ui'
import { formatDateTime, toIsoFromDateTimeLocal } from '@/utils/format'

const store = useTokensStore()
const ui = useUiStore()

const columns: DataColumn[] = [
  { key: 'name', label: 'Token' },
  { key: 'createdAt', label: 'Created' },
  { key: 'lastUsedAt', label: 'Last used' },
  { key: 'expiresAt', label: 'Expires' },
]

const isEditorOpen = ref(false)
const form = reactive({
  name: '',
  expiresAt: '',
})

onMounted(() => {
  void store.refresh().catch(() => undefined)
})

async function refresh() {
  await store.refresh()
}

function openEditor() {
  resetForm()
  isEditorOpen.value = true
}

function dismissEditor() {
  isEditorOpen.value = false
  resetForm()
}

function resetForm() {
  form.name = ''
  form.expiresAt = ''
}

async function submit() {
  await store.createItem({
    name: form.name,
    expiresAt: toIsoFromDateTimeLocal(form.expiresAt) ?? '',
  })
  ui.showToast('API token created', 'success')
  dismissEditor()
}

async function removeItem(id: string) {
  if (!window.confirm('Delete this API token?')) {
    return
  }

  await store.removeItem(id)
  ui.showToast('API token deleted', 'success')
}

function noop() {
  return undefined
}
</script>
