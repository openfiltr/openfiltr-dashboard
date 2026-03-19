<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="page-shell">
        <page-header
          eyebrow="Monitoring"
          title="Activity log"
          subtitle="Inspect query activity recorded by the backend. Filters are passed through to the API where supported."
        >
          <template #actions>
            <ion-button fill="outline" @click="refresh" :disabled="store.loading">Reload</ion-button>
          </template>
        </page-header>

        <div class="panel-card">
          <div class="panel-card__body">
            <form class="form-grid form-grid--two" @submit.prevent="refresh">
              <ion-input v-model="store.filters.clientIp" fill="outline" label="Client IP" label-placement="stacked" />
              <ion-input v-model="store.filters.domain" fill="outline" label="Domain contains" label-placement="stacked" />
              <ion-select v-model="store.filters.action" fill="outline" label="Action" label-placement="stacked">
                <ion-select-option value="">Any action</ion-select-option>
                <ion-select-option value="blocked">Blocked</ion-select-option>
                <ion-select-option value="allowed">Allowed</ion-select-option>
              </ion-select>
              <div class="form-actions" style="align-items: end;">
                <ion-button fill="clear" @click="clearFilters">Clear filters</ion-button>
                <ion-button type="submit" :disabled="store.loading">
                  {{ store.loading ? 'Loading...' : 'Apply filters' }}
                </ion-button>
              </div>
            </form>
          </div>
        </div>

        <data-table
          :columns="columns"
          :rows="store.items"
          :loading="store.loading"
          :error="store.error"
          empty-title="No activity"
          empty-message="OpenFiltr has not returned any activity rows for the current filters."
          @retry="refresh"
          @select="noop"
        >
          <template #cell-createdAt="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
          <template #cell-action="{ row }">
            <ion-badge :color="row.action === 'blocked' ? 'danger' : 'success'">
              {{ row.action }}
            </ion-badge>
          </template>
          <template #cell-domain="{ row }">
            <div>
              <strong class="mono">{{ row.domain }}</strong>
              <p class="muted" style="margin: 0.35rem 0 0;">{{ row.queryType }} from {{ row.clientIp }}</p>
            </div>
          </template>
          <template #cell-ruleSource="{ row }">
            {{ formatMaybe(row.ruleSource) }}
          </template>
          <template #cell-responseTimeMs="{ row }">
            {{ formatDurationMs(row.responseTimeMs) }}
          </template>
        </data-table>
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
  IonPage,
  IonSelect,
  IonSelectOption,
} from '@ionic/vue'
import { onMounted } from 'vue'

import DataTable, { type DataColumn } from '@/components/DataTable.vue'
import PageHeader from '@/components/PageHeader.vue'
import { useActivityStore } from '@/stores/logs'
import { formatDateTime, formatDurationMs, formatMaybe } from '@/utils/format'

const store = useActivityStore()

const columns: DataColumn[] = [
  { key: 'createdAt', label: 'Time' },
  { key: 'action', label: 'Action' },
  { key: 'domain', label: 'Domain' },
  { key: 'ruleSource', label: 'Rule source' },
  { key: 'responseTimeMs', label: 'Response time' },
]

onMounted(() => {
  void store.refresh().catch(() => undefined)
})

async function refresh() {
  await store.refresh()
}

function clearFilters() {
  store.setFilters({
    clientIp: '',
    domain: '',
    action: '',
  })
  void store.refresh()
}

function noop() {
  return undefined
}
</script>
