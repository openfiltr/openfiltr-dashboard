<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="auth-shell">
        <div class="auth-card">
          <div class="auth-card__brand">
            <h1>OpenFiltr Dashboard</h1>
            <p>
              Manage filtering rules, DNS data, clients, monitoring, tokens, and
              configuration from a standalone frontend that speaks to the OpenFiltr API over HTTP.
            </p>
          </div>

          <div class="auth-card__panel stack">
            <div>
              <p class="muted">Sign in</p>
              <h2 class="page-title" style="font-size: 2rem;">Administrative access</h2>
              <p class="page-subtitle">
                The dashboard prefers same-origin API delivery in production and bearer-token auth in the browser.
              </p>
            </div>

            <state-notice
              v-if="system.publicLoading"
              loading
              title="Contacting OpenFiltr"
              message="Checking the public health and version endpoints."
            />
            <state-notice
              v-else-if="system.publicError"
              tone="error"
              title="Backend unavailable"
              :message="system.publicError"
            />
            <state-notice
              v-else-if="system.version"
              title="Backend detected"
              :message="`Connected to OpenFiltr ${system.version.version}. Public health reports ${system.health?.status ?? 'unknown'}.`"
            />

            <state-notice
              v-if="auth.error"
              tone="error"
              title="Sign-in failed"
              :message="auth.error"
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
                placeholder="Enter your password"
                required
              />
              <div class="form-actions">
                <ion-button fill="clear" router-link="/setup">First run setup</ion-button>
                <ion-button type="submit" :disabled="auth.loading">
                  {{ auth.loading ? 'Signing in...' : 'Sign in' }}
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
import { onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import StateNotice from '@/components/StateNotice.vue'
import { useAuthStore } from '@/stores/auth'
import { useSystemStore } from '@/stores/system'
import { useUiStore } from '@/stores/ui'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const system = useSystemStore()
const ui = useUiStore()

const form = reactive({
  username: '',
  password: '',
})

onMounted(() => {
  if (!system.version && !system.publicLoading) {
    void system.loadPublicInfo().catch(() => undefined)
  }
})

async function submit() {
  try {
    await auth.login(form)
    ui.showToast('Signed in successfully', 'success')
    await router.replace(String(route.query.redirect || '/dashboard'))
  } catch {
    // Error state is handled by the store.
  }
}
</script>
