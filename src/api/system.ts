import { request } from '@/api/client'
import { normaliseActivitySummary, normaliseSystemStats, normaliseSystemStatus } from '@/api/normalisers'
import type { ActivitySummary, BackendVersion, HealthStatus, SystemStats, SystemStatus } from '@/types'

export async function getHealth(): Promise<HealthStatus> {
  return request<HealthStatus>('system/health', {
    skipAuthRedirect: true,
  })
}

export async function getVersion(): Promise<BackendVersion> {
  return request<BackendVersion>('system/version', {
    skipAuthRedirect: true,
  })
}

export async function getStatus(): Promise<SystemStatus> {
  const response = await request<{
    status: string
    block_rule_count: number
    allow_rule_count: number
    client_count: number
    version: string
  }>('system/status')

  return normaliseSystemStatus(response)
}

export async function getStats(): Promise<SystemStats> {
  const response = await request<{
    total_queries: number
    blocked_queries: number
    allowed_queries: number
    block_rate: string
  }>('system/stats')

  return normaliseSystemStats(response)
}

export async function getActivitySummary(): Promise<ActivitySummary> {
  const response = await request<{
    total: number
    blocked: number
    allowed: number
    top_blocked_domains: Array<{ domain: string; count: number }>
  }>('activity/stats')

  return normaliseActivitySummary(response)
}
