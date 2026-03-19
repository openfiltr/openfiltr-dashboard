<template>
  <div class="panel-card">
    <div class="panel-card__body">
      <div v-if="loading">
        <state-notice
          loading
          title="Loading data"
          message="The dashboard is fetching the latest records from OpenFiltr."
        />
      </div>
      <div v-else-if="error">
        <state-notice tone="error" title="Unable to load records" :message="error">
          <template #actions>
            <ion-button size="small" @click="$emit('retry')">Try again</ion-button>
          </template>
        </state-notice>
      </div>
      <div v-else-if="rows.length === 0">
        <state-notice tone="warning" :title="emptyTitle" :message="emptyMessage">
          <template #actions>
            <slot name="empty-actions" />
          </template>
        </state-notice>
      </div>
      <div v-else class="table-shell">
        <table class="data-table">
          <thead>
            <tr>
              <th v-for="column in columns" :key="column.key">{{ column.label }}</th>
              <th v-if="$slots.actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in rows"
              :key="String(row[rowKey])"
              :class="{ 'is-selected': selectedId && String(row[rowKey]) === selectedId }"
              @click="$emit('select', row)"
            >
              <td v-for="column in columns" :key="column.key">
                <slot :name="`cell-${column.key}`" :row="row">
                  {{ row[column.key] }}
                </slot>
              </td>
              <td v-if="$slots.actions" @click.stop>
                <slot name="actions" :row="row" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="TRow extends Record<string, unknown>">
import { IonButton } from '@ionic/vue'

import StateNotice from '@/components/StateNotice.vue'

export interface DataColumn {
  key: string
  label: string
}

withDefaults(
  defineProps<{
    columns: DataColumn[]
    emptyMessage: string
    emptyTitle: string
    error?: string | null
    loading?: boolean
    rowKey?: string
    rows: TRow[]
    selectedId?: string | null
  }>(),
  {
    error: null,
    loading: false,
    rowKey: 'id',
    selectedId: null,
  },
)

defineEmits<{
  (event: 'retry'): void
  (event: 'select', row: TRow): void
}>()
</script>
