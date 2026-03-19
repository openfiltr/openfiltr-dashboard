<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="auth-shell">
        <div class="auth-card">
          <div class="auth-card__brand">
            <h1>First-run setup</h1>
            <p>
              Create the initial administrative account for a new OpenFiltr deployment. If the backend has already been
              set up, the API will reject this with a clear conflict response.
            </p>
          </div>

          <div class="auth-card__panel stack">
            <div>
              <p class="muted">Initial administrator</p>
              <h2 class="page-title" style="font-size: 2rem;">Create the first account</h2>
              <p class="page-subtitle">
                Setup calls <span class="mono">POST /api/v1/auth/setup</span> directly. This page is only for the first run.
              </p>
            </div>

            <state-notice
              v-if="system.publicLoading"
              loading
              title="Contacting OpenFiltr"
              message="Checking that the backend is reachable before creating the account."
            />
            <state-notice
              v-else-if="system.publicError"
              tone="error"
              title="Backend unavailable"
              :message="system.publicError"
            />

            <state-notice
              v-if="auth.error"
              tone="error"
              title="Setup failed"
              :message="auth.error"
            />

            <state-notice
              v-if="localError"
              tone="warning"
              title="Check the form"
              :message="localError"
            />

            <form class="form-grid" @submit.prevent="submit">
              <ion-input
                v-model="form.username"
                fill="outline"
                label="Username"
                label-placement="stacked"
                placeholder="admin"
                required
              />
              <ion-input
                v-model="form.password"
                type="password"
                fill="outline"
                label="Password"
                label-placement="stacked"
                placeholder="At least 8 characters"
                required
              />
              <ion-input
                v-model="form.confirmPassword"
                type="password"
                fill="outline"
                label="Confirm password"
                label-placement="stacked"
                placeholder="Repeat the password"
                required
              />
              <div class="form-actions">
                <ion-button fill="clear" router-link="/login">Back to sign in</ion-button>
                <ion-button type="submit" :disabled="auth.loading">
                  {{ auth.loading ? 'Creating account...' : 'Create administrator' }}
                </ion-button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonButton, IonContent, IonInput, IonPage } from '@ionic/vue'
import { computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'

import StateNotice from '@/components/StateNotice.vue'
import { useAuthStore } from '@/stores/auth'
import { useSystemStore } from '@/stores/system'
import { useUiStore } from '@/stores/ui'

const auth = useAuthStore()
const router = useRouter()
const system = useSystemStore()
const ui = useUiStore()

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
})

const localError = computed(() => {
  if (!form.confirmPassword) {
    return ''
  }

  if (form.password !== form.confirmPassword) {
    return 'The passwords do not match.'
  }

  if (form.password.length < 8) {
    return 'Passwords must be at least 8 characters long.'
  }

  return ''
})

onMounted(() => {
  if (!system.version && !system.publicLoading) {
    void system.loadPublicInfo().catch(() => undefined)
  }
})

async function submit() {
  if (localError.value) {
    return
  }

  try {
    await auth.completeSetup({
      username: form.username,
      password: form.password,
    })
    ui.showToast('Administrator created. Sign in to continue.', 'success')
    await router.replace('/login')
  } catch {
    // Error state is handled by the store.
  }
}
</script>
