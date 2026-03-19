<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="page-shell">
        <page-header
          eyebrow="Monitoring"
          title="Audit log"
          subtitle="Review administrative actions recorded by OpenFiltr."
        >
          <template #actions>
            <ion-button fill="outline" @click="refresh" :disabled="store.loading">Reload</ion-button>
          </template>
        </page-header>

        <data-table
          :columns="columns"
          :rows="store.items"
          :loading="store.loading"
          :error="store.error"
          empty-title="No audit events"
          empty-message="The backend has not reported any audit events."
          @retry="refresh"
          @select="noop"
        >
          <template #cell-createdAt="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
          <template #cell-action="{ row }">
            <div>
              <strong>{{ row.action }}</strong>
              <p class="muted" style="margin: 0.35rem 0 0;">{{ row.resourceType }}</p>
            </div>
          </template>
          <template #cell-resourceId="{ row }">
            <span class="mono">{{ formatMaybe(row.resourceId) }}</span>
          </template>
          <template #cell-userId="{ row }">
            <span class="mono">{{ formatMaybe(row.userId) }}</span>
          </template>
          <template #cell-ipAddress="{ row }">
            <span class="mono">{{ formatMaybe(row.ipAddress) }}</span>
          </template>
        </data-table>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButton, IonContent, IonPage } from '@ionic/vue'
import { onMounted } from 'vue'

import DataTable, { type DataColumn } from '@/components/DataTable.vue'
import PageHeader from '@/components/PageHeader.vue'
import { useAuditStore } from '@/stores/logs'
import { formatDateTime, formatMaybe } from '@/utils/format'

const store = useAuditStore()

const columns: DataColumn[] = [
  { key: 'createdAt', label: 'Time' },
  { key: 'action', label: 'Action' },
  { key: 'resourceId', label: 'Resource ID' },
  { key: 'userId', label: 'User ID' },
  { key: 'ipAddress', label: 'IP address' },
]

onMounted(() => {
  void store.refresh().catch(() => undefined)
})

async function refresh() {
  await store.refresh()
}

function noop() {
  return undefined
}
</script>
