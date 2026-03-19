<template>
  <div class="copy-field">
    <ion-input
      class="copy-field__value"
      :value="value"
      readonly
      fill="outline"
      label-placement="stacked"
      :label="label"
    />
    <ion-button color="primary" @click="copyValue">Copy</ion-button>
  </div>
</template>

<script setup lang="ts">
import { IonButton, IonInput } from '@ionic/vue'

import { useUiStore } from '@/stores/ui'

const props = defineProps<{
  label: string
  value: string
}>()

const ui = useUiStore()

async function copyValue() {
  await navigator.clipboard.writeText(props.value)
  ui.showToast('Copied to the clipboard', 'success')
}
</script>
