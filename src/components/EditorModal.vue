<template>
  <ion-modal
    :is-open="isOpen"
    :backdrop-dismiss="!busy"
    css-class="editor-modal"
    @didDismiss="$emit('dismiss')"
  >
    <ion-page>
      <ion-header class="editor-modal__header">
        <ion-toolbar>
          <ion-title>{{ title }}</ion-title>
          <ion-buttons slot="end">
            <ion-button fill="clear" :disabled="busy" @click="$emit('dismiss')">
              <ion-icon slot="icon-only" :icon="closeOutline" />
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content :fullscreen="true">
        <div class="editor-modal__body">
          <div v-if="subtitle" class="editor-modal__intro">
            <p class="editor-modal__subtitle">{{ subtitle }}</p>
          </div>
          <slot />
        </div>
      </ion-content>
    </ion-page>
  </ion-modal>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonModal,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue'
import { closeOutline } from 'ionicons/icons'

defineProps<{
  busy?: boolean
  isOpen: boolean
  subtitle?: string
  title: string
}>()

defineEmits<{
  (event: 'dismiss'): void
}>()
</script>
