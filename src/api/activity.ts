import { request } from '@/api/client'
import { normaliseActivityEntry, normaliseAuditEvent } from '@/api/normalisers'
import type { ActivityEntry, ActivityFilters, ApiList, AuditEvent } from '@/types'

export async function listActivity(filters: Partial<ActivityFilters> = {}): Promise<ApiList<ActivityEntry>> {
  const response = await request<{
    items: Array<{
      id: string
      client_ip: string
      domain: string
      query_type: string
      action: string
      rule_id: string | null
      rule_source: string | null
      response_time_ms: number | null
      created_at: string
    }>
    total: number
  }>('activity', {
    query: {
      client_ip: filters.clientIp,
      domain: filters.domain,
      action: filters.action,
    },
  })

  return {
    items: response.items.map(normaliseActivityEntry),
    total: response.total,
  }
}

export async function listAuditEvents(): Promise<ApiList<AuditEvent>> {
  const response = await request<{
    items: Array<{
      id: string
      user_id: string | null
      action: string
      resource_type: string
      resource_id: string | null
      details: string | null
      ip_address: string | null
      created_at: string
    }>
    total: number
  }>('audit')

  return {
    items: response.items.map(normaliseAuditEvent),
    total: response.total,
  }
}
