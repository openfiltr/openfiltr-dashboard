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
            <ion-button fill="clear" :disabled="busy" @click="$emit('dismiss')">Close</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content :fullscreen="true">
        <div class="editor-modal__body">
          <div class="panel-card editor-modal__card">
            <div v-if="subtitle" class="panel-card__header">
              <p class="panel-card__subtitle">{{ subtitle }}</p>
            </div>
            <div class="panel-card__body">
              <slot />
            </div>
          </div>
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
  IonModal,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/vue'

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
