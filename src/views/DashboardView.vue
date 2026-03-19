<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="page-shell">
        <page-header
          eyebrow="Overview"
          title="Dashboard overview"
          subtitle="System health, query volumes, top blocked domains, and headline counts from the existing OpenFiltr backend."
        >
          <template #actions>
            <ion-button @click="refresh" :disabled="system.loading">
              {{ system.loading ? 'Refreshing...' : 'Refresh dashboard' }}
            </ion-button>
          </template>
        </page-header>

        <state-notice
          v-if="system.error && !system.status"
          tone="error"
          title="Dashboard unavailable"
          :message="system.error"
        />

        <div v-else class="stack">
          <div class="grid-cards">
            <stat-card label="System status" :value="system.status?.status ?? 'Loading'" :hint="`Backend version ${system.status?.version ?? 'unknown'}`" />
            <stat-card label="Total queries" :value="formatNumber(system.stats?.totalQueries)" :hint="`Block rate ${system.stats?.blockRate ?? '0.00'}%`" />
            <stat-card label="Blocked queries" :value="formatNumber(system.activitySummary?.blocked)" :hint="`Allowed ${formatNumber(system.activitySummary?.allowed)}`" />
            <stat-card label="Clients" :value="formatNumber(system.status?.clientCount)" hint="Registered client definitions" />
            <stat-card label="Block rules" :value="formatNumber(system.status?.blockRuleCount)" hint="Enabled rules reported by the backend" />
            <stat-card label="Allow rules" :value="formatNumber(system.status?.allowRuleCount)" hint="Enabled exceptions reported by the backend" />
          </div>

          <div class="workspace-grid">
            <div class="panel-card">
              <div class="panel-card__header">
                <h2 class="panel-card__title">Top blocked domains</h2>
                <p class="panel-card__subtitle">
                  Derived from <span class="mono">GET /api/v1/activity/stats</span>. The current handler returns totals and
                  <span class="mono">top_blocked_domains</span>, not a block-rate field.
                </p>
              </div>
              <div class="panel-card__body">
                <state-notice
                  v-if="system.loading && !system.activitySummary"
                  loading
                  title="Loading blocked domain data"
                  message="Pulling activity summary metrics from OpenFiltr."
                />
                <state-notice
                  v-else-if="!system.activitySummary?.topBlockedDomains.length"
                  tone="warning"
                  title="No blocked domains yet"
                  message="OpenFiltr has not reported blocked-domain activity so far."
                />
                <ul v-else class="list-reset domain-list">
                  <li v-for="entry in system.activitySummary.topBlockedDomains" :key="entry.domain">
                    <span class="mono">{{ entry.domain }}</span>
                    <ion-badge color="primary">{{ formatNumber(entry.count) }}</ion-badge>
                  </li>
                </ul>
              </div>
            </div>

            <div class="panel-card">
              <div class="panel-card__header">
                <h2 class="panel-card__title">Backend snapshot</h2>
                <p class="panel-card__subtitle">Current headline values from the protected status and stats endpoints.</p>
              </div>
              <div class="panel-card__body meta-list">
                <div class="meta-row">
                  <span class="muted">Backend version</span>
                  <strong>{{ system.status?.version ?? 'Unknown' }}</strong>
                </div>
                <div class="meta-row">
                  <span class="muted">Total queries</span>
                  <strong>{{ formatNumber(system.stats?.totalQueries) }}</strong>
                </div>
                <div class="meta-row">
                  <span class="muted">Blocked queries</span>
                  <strong>{{ formatNumber(system.stats?.blockedQueries) }}</strong>
                </div>
                <div class="meta-row">
                  <span class="muted">Allowed queries</span>
                  <strong>{{ formatNumber(system.stats?.allowedQueries) }}</strong>
                </div>
                <div class="meta-row">
                  <span class="muted">Client count</span>
                  <strong>{{ formatNumber(system.status?.clientCount) }}</strong>
                </div>
                <div class="meta-row">
                  <span class="muted">Enabled block rules</span>
                  <strong>{{ formatNumber(system.status?.blockRuleCount) }}</strong>
                </div>
                <div class="meta-row">
                  <span class="muted">Enabled allow rules</span>
                  <strong>{{ formatNumber(system.status?.allowRuleCount) }}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonBadge, IonButton, IonContent, IonPage } from '@ionic/vue'
import { onMounted } from 'vue'

import PageHeader from '@/components/PageHeader.vue'
import StateNotice from '@/components/StateNotice.vue'
import StatCard from '@/components/StatCard.vue'
import { useSystemStore } from '@/stores/system'
import { formatNumber } from '@/utils/format'

const system = useSystemStore()

onMounted(() => {
  if (!system.status && !system.loading) {
    void system.loadDashboard().catch(() => undefined)
  }
})

async function refresh() {
  await system.loadDashboard()
}
</script>
