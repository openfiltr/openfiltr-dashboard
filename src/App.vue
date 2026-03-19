<template>
  <ion-app>
    <ion-router-outlet />
    <ion-toast
      :is-open="ui.toastOpen"
      :message="ui.toastMessage"
      :color="ui.toastColour"
      position="top"
      duration="3200"
      @didDismiss="ui.dismissToast"
    />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet, IonToast } from '@ionic/vue'

import { useUiStore } from '@/stores/ui'

const ui = useUiStore()
</script>
