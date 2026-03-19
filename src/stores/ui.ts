import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const toastOpen = ref(false)
  const toastMessage = ref('')
  const toastColour = ref<'danger' | 'primary' | 'success' | 'warning'>('primary')

  function showToast(message: string, colour: 'danger' | 'primary' | 'success' | 'warning' = 'primary') {
    toastMessage.value = message
    toastColour.value = colour
    toastOpen.value = true
  }

  function dismissToast() {
    toastOpen.value = false
  }

  return {
    dismissToast,
    showToast,
    toastColour,
    toastMessage,
    toastOpen,
  }
})
