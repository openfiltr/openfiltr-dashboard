import { createRouter, createWebHistory } from '@ionic/vue-router'
import type { RouteRecordRaw } from 'vue-router'

import AppShell from '@/layouts/AppShell.vue'
import { registerGuards } from '@/router/guards'
import ActivityLogView from '@/views/ActivityLogView.vue'
import AllowRulesView from '@/views/AllowRulesView.vue'
import ApiTokensView from '@/views/ApiTokensView.vue'
import AuditLogView from '@/views/AuditLogView.vue'
import BlockRulesView from '@/views/BlockRulesView.vue'
import ClientsView from '@/views/ClientsView.vue'
import ConfigView from '@/views/ConfigView.vue'
import DashboardView from '@/views/DashboardView.vue'
import DnsEntriesView from '@/views/DnsEntriesView.vue'
import GroupsView from '@/views/GroupsView.vue'
import LoginView from '@/views/LoginView.vue'
import RuleSourcesView from '@/views/RuleSourcesView.vue'
import SetupView from '@/views/SetupView.vue'
import UpstreamServersView from '@/views/UpstreamServersView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { guestOnly: true },
  },
  {
    path: '/setup',
    name: 'setup',
    component: SetupView,
    meta: { guestOnly: true },
  },
  {
    path: '/',
    component: AppShell,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        component: DashboardView,
      },
      {
        path: 'filtering/block-rules',
        component: BlockRulesView,
      },
      {
        path: 'filtering/allow-rules',
        component: AllowRulesView,
      },
      {
        path: 'filtering/sources',
        component: RuleSourcesView,
      },
      {
        path: 'dns/upstream-servers',
        component: UpstreamServersView,
      },
      {
        path: 'dns/entries',
        component: DnsEntriesView,
      },
      {
        path: 'clients',
        component: ClientsView,
      },
      {
        path: 'groups',
        component: GroupsView,
      },
      {
        path: 'activity',
        component: ActivityLogView,
      },
      {
        path: 'audit',
        component: AuditLogView,
      },
      {
        path: 'tokens',
        component: ApiTokensView,
      },
      {
        path: 'config',
        component: ConfigView,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

registerGuards(router)

export default router
