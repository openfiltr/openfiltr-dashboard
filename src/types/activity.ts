export interface ActivityEntry {
  id: string
  clientIp: string
  domain: string
  queryType: string
  action: string
  ruleId: string | null
  ruleSource: string | null
  responseTimeMs: number | null
  createdAt: string
}

export interface ActivityFilters {
  clientIp: string
  domain: string
  action: string
}

export interface AuditEvent {
  id: string
  userId: string | null
  action: string
  resourceType: string
  resourceId: string | null
  details: string | null
  ipAddress: string | null
  createdAt: string
}
