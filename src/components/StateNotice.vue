<template>
  <div :class="['notice-card', `notice-card--${tone}`]">
    <div style="display: flex; gap: 0.75rem; align-items: center;">
      <ion-spinner v-if="loading" name="crescent" />
      <div>
        <p class="notice-card__title">{{ title }}</p>
        <p class="notice-card__message">{{ message }}</p>
      </div>
    </div>
    <div v-if="$slots.actions" style="margin-top: 0.9rem;">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonSpinner } from '@ionic/vue'

withDefaults(
  defineProps<{
    loading?: boolean
    message: string
    title: string
    tone?: 'error' | 'info' | 'warning'
  }>(),
  {
    loading: false,
    tone: 'info',
  },
)
</script>
