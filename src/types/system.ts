export interface HealthStatus {
  status: string
  time: string
}

export interface BackendVersion {
  version: string
}

export interface SystemStatus {
  status: string
  blockRuleCount: number
  allowRuleCount: number
  clientCount: number
  version: string
}

export interface SystemStats {
  totalQueries: number
  blockedQueries: number
  allowedQueries: number
  blockRate: string
}

export interface TopBlockedDomain {
  domain: string
  count: number
}

export interface ActivitySummary {
  total: number
  blocked: number
  allowed: number
  topBlockedDomains: TopBlockedDomain[]
}
