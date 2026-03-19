<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="page-shell">
        <page-header
          eyebrow="Administration"
          title="Config import/export"
          subtitle="Export the current backend configuration as YAML or import YAML into the running OpenFiltr instance."
        >
          <template #actions>
            <ion-button fill="outline" href="/openapi.yaml" target="_blank">Open OpenAPI spec</ion-button>
            <ion-button @click="exportCurrent" :disabled="store.exporting">
              {{ store.exporting ? 'Exporting...' : 'Export YAML' }}
            </ion-button>
          </template>
        </page-header>

        <state-notice
          title="Import behaviour"
          tone="warning"
          message="The documented dry-run query parameter is not implemented by the current backend handler, so this dashboard does not expose dry-run as a working feature."
        />

        <state-notice
          v-if="store.lastImportedCount !== null"
          title="Import completed"
          :message="`${store.lastImportedCount} records were imported by the backend.`"
        />

        <state-notice
          v-if="store.error"
          tone="error"
          title="Config action failed"
          :message="store.error"
        />

        <div class="workspace-grid">
          <div class="panel-card">
            <div class="panel-card__header">
              <h2 class="panel-card__title">Import YAML</h2>
              <p class="panel-card__subtitle">Paste YAML directly or load it from a file before submitting.</p>
            </div>
            <div class="panel-card__body stack">
              <div class="file-drop">
                <label for="config-file"><strong>Load file</strong></label>
                <input id="config-file" type="file" accept=".yaml,.yml,text/yaml,application/yaml" @change="loadFile" />
              </div>
              <ion-textarea
                v-model="yaml"
                fill="outline"
                label="YAML payload"
                label-placement="stacked"
                auto-grow
                :rows="18"
                placeholder="version: 1"
              />
              <div class="form-actions">
                <ion-button fill="clear" @click="yaml = ''">Clear</ion-button>
                <ion-button @click="importCurrent" :disabled="store.importing || !yaml.trim()">
                  {{ store.importing ? 'Importing...' : 'Import YAML' }}
                </ion-button>
              </div>
            </div>
          </div>

          <div class="panel-card">
            <div class="panel-card__header">
              <h2 class="panel-card__title">Operational notes</h2>
              <p class="panel-card__subtitle">Frontend behaviour aligned to the current backend implementation.</p>
            </div>
            <div class="panel-card__body meta-list">
              <div class="meta-row">
                <span class="muted">Browser API base</span>
                <strong class="mono">/api/v1</strong>
              </div>
              <div class="meta-row">
                <span class="muted">Spec endpoint</span>
                <strong class="mono">/openapi.yaml</strong>
              </div>
              <div class="meta-row">
                <span class="muted">Import endpoint</span>
                <strong class="mono">POST /api/v1/config/import</strong>
              </div>
              <div class="meta-row">
                <span class="muted">Export endpoint</span>
                <strong class="mono">GET /api/v1/config/export</strong>
              </div>
              <div class="meta-row">
                <span class="muted">Runtime delivery</span>
                <strong>Standalone nginx container</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButton, IonContent, IonPage, IonTextarea } from '@ionic/vue'
import { ref } from 'vue'

import PageHeader from '@/components/PageHeader.vue'
import StateNotice from '@/components/StateNotice.vue'
import { useConfigStore } from '@/stores/config'
import { useUiStore } from '@/stores/ui'
import { downloadBlob } from '@/utils/format'

const store = useConfigStore()
const ui = useUiStore()
const yaml = ref('')

async function exportCurrent() {
  const blob = await store.exportConfiguration()
  downloadBlob(blob, 'openfiltr-config.yaml')
  ui.showToast('Configuration exported', 'success')
}

async function importCurrent() {
  await store.importConfiguration(yaml.value)
  ui.showToast('Configuration imported', 'success')
}

async function loadFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    return
  }

  yaml.value = await file.text()
}
</script>
