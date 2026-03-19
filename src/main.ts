import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

import { IonicVue } from '@ionic/vue'

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css'

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'

/* Theme variables */
import './theme/variables.css'
import './css/app.css'

import { configureApiClient } from '@/api/client'
import { useAuthStore } from '@/stores/auth'

const pinia = createPinia()
const app = createApp(App)
  .use(IonicVue)
  .use(router)
  .use(pinia)

const auth = useAuthStore(pinia)

configureApiClient({
  getToken: () => auth.token,
  onUnauthorized: () => {
    auth.clearSession()

    if (router.currentRoute.value.name !== 'login') {
      void router.replace({
        name: 'login',
        query: {
          redirect: router.currentRoute.value.fullPath,
        },
      })
    }
  },
})

async function bootstrap() {
  await auth.bootstrap()
  await router.isReady()
  app.mount('#app')
}

void bootstrap()
