<template>
  <ion-page>
    <ion-split-pane content-id="shell-main">
      <ion-menu class="shell-menu" content-id="shell-main" type="overlay">
        <ion-content class="shell-menu__content">
          <div class="shell-menu__panel">
            <div class="shell-menu__brand">
              <img
                src="/logo-white.svg"
                alt="OpenFiltr logo"
                class="shell-menu__logo"
              />
              <h1>OpenFiltr</h1>
              <p>Desktop-first administration for the OpenFiltr DNS filtering API.</p>
            </div>

            <div v-for="group in navigationGroups" :key="group.title">
              <p class="shell-menu__group-title">{{ group.title }}</p>
              <ion-list lines="none">
                <ion-menu-toggle v-for="item in group.items" :key="item.to" :auto-hide="false">
                  <ion-item
                    button
                    :class="{ 'is-active': route.path === item.to }"
                    @click="navigate(item.to)"
                  >
                    <ion-icon slot="start" :icon="item.icon" />
                    <ion-label>{{ item.label }}</ion-label>
                  </ion-item>
                </ion-menu-toggle>
              </ion-list>
            </div>

            <div class="shell-menu__footer stack">
              <ion-button expand="block" fill="outline" color="light" @click="signOut">
                Sign out
              </ion-button>
            </div>
          </div>
        </ion-content>
      </ion-menu>

      <div id="shell-main" class="shell-content">
        <div class="shell-topbar">
          <div class="shell-topbar__start">
            <ion-button fill="clear" class="shell-topbar__menu-button ion-hide-lg-up" @click="openMenu">
              <ion-icon slot="icon-only" :icon="menuOutline" />
            </ion-button>
            <h1 class="shell-topbar__title">{{ currentTitle }}</h1>
          </div>

          <ion-chip
            id="account-chip-trigger"
            button
            color="primary"
            outline
            class="shell-topbar__account-chip"
          >
            <ion-icon :icon="personCircleOutline" />
            <ion-label>{{ auth.user?.username }}</ion-label>
          </ion-chip>
        </div>

        <ion-popover trigger="account-chip-trigger" trigger-action="click" side="bottom" alignment="end">
          <ion-content class="account-popover">
            <div class="account-popover__summary">
              <p class="account-popover__eyebrow">Signed in as</p>
              <strong>{{ auth.user?.username }}</strong>
              <p class="account-popover__role">{{ auth.user?.role }}</p>
            </div>
            <ion-list lines="none">
              <ion-item button :detail="false" @click="signOut">
                <ion-label>Sign out</ion-label>
              </ion-item>
            </ion-list>
          </ion-content>
        </ion-popover>

        <div class="shell-router-shell">
          <ion-router-outlet />
        </div>
      </div>
    </ion-split-pane>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonButton,
  IonChip,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonMenuToggle,
  IonPage,
  IonPopover,
  IonRouterOutlet,
  IonSplitPane,
  menuController,
} from '@ionic/vue'
import { menuOutline, personCircleOutline } from 'ionicons/icons'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { navigationGroups } from '@/router/navigation'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const titleLookup = new Map(
  navigationGroups.flatMap((group) => group.items.map((item) => [item.to, item.label] as const)),
)

const currentTitle = computed(() => titleLookup.get(route.path) ?? 'OpenFiltr Dashboard')

async function navigate(path: string) {
  await router.push(path)
  await menuController.close()
}

async function openMenu() {
  await menuController.open()
}

async function signOut() {
  await auth.logout()
  await router.replace({ name: 'login' })
}
</script>
