import type {
  ActivityEntry,
  ActivitySummary,
  ApiToken,
  AuditEvent,
  Client,
  DnsEntry,
  Group,
  NumericBoolean,
  Rule,
  RuleSource,
  SystemStats,
  SystemStatus,
  TopBlockedDomain,
  UpstreamServer,
  User,
} from '@/types'

export function toBoolean(value: NumericBoolean): boolean {
  return value === true || value === 1 || value === '1'
}

export function toEnabledNumber(value: boolean): 0 | 1 {
  return value ? 1 : 0
}

export function normaliseUser(raw: { id: string; username: string; role: string }): User {
  return {
    id: raw.id,
    username: raw.username,
    role: raw.role,
  }
}

export function normaliseToken(raw: {
  id: string
  name: string
  scopes: string
  last_used_at: string | null
  expires_at: string | null
  created_at: string
}): ApiToken {
  return {
    id: raw.id,
    name: raw.name,
    scopes: raw.scopes,
    lastUsedAt: raw.last_used_at,
    expiresAt: raw.expires_at,
    createdAt: raw.created_at,
  }
}

export function normaliseRule(raw: {
  id: string
  pattern: string
  rule_type: string
  comment: string | null
  enabled: NumericBoolean
  created_by: string | null
  created_at: string
  updated_at: string
}): Rule {
  return {
    id: raw.id,
    pattern: raw.pattern,
    ruleType: raw.rule_type,
    comment: raw.comment ?? null,
    enabled: toBoolean(raw.enabled),
    createdBy: raw.created_by ?? null,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}

export function normaliseRuleSource(raw: {
  id: string
  name: string
  url: string
  format: string
  enabled: NumericBoolean
  last_updated_at: string | null
  rule_count: number
  created_at: string
  updated_at: string
}): RuleSource {
  return {
    id: raw.id,
    name: raw.name,
    url: raw.url,
    format: raw.format,
    enabled: toBoolean(raw.enabled),
    lastUpdatedAt: raw.last_updated_at ?? null,
    ruleCount: raw.rule_count ?? 0,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}

export function normaliseUpstreamServer(raw: {
  id: string
  name: string
  address: string
  protocol: string
  enabled: NumericBoolean
  priority: number
  created_at: string
  updated_at: string
}): UpstreamServer {
  return {
    id: raw.id,
    name: raw.name,
    address: raw.address,
    protocol: raw.protocol,
    enabled: toBoolean(raw.enabled),
    priority: raw.priority ?? 0,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}

export function normaliseDnsEntry(raw: {
  id: string
  host: string
  entry_type: string
  value: string
  ttl: number
  comment: string | null
  enabled: NumericBoolean
  created_by: string | null
  created_at: string
  updated_at: string
}): DnsEntry {
  return {
    id: raw.id,
    host: raw.host,
    entryType: raw.entry_type,
    value: raw.value,
    ttl: raw.ttl ?? 300,
    comment: raw.comment ?? null,
    enabled: toBoolean(raw.enabled),
    createdBy: raw.created_by ?? null,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}

export function normaliseClient(raw: {
  id: string
  name: string
  identifier: string
  identifier_type: string
  group_id: string | null
  comment: string | null
  created_at: string
  updated_at: string
}): Client {
  return {
    id: raw.id,
    name: raw.name,
    identifier: raw.identifier,
    identifierType: raw.identifier_type,
    groupId: raw.group_id ?? null,
    comment: raw.comment ?? null,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}

export function normaliseGroup(raw: {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}): Group {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? null,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  }
}

export function normaliseActivityEntry(raw: {
  id: string
  client_ip: string
  domain: string
  query_type: string
  action: string
  rule_id: string | null
  rule_source: string | null
  response_time_ms: number | null
  created_at: string
}): ActivityEntry {
  return {
    id: raw.id,
    clientIp: raw.client_ip,
    domain: raw.domain,
    queryType: raw.query_type,
    action: raw.action,
    ruleId: raw.rule_id ?? null,
    ruleSource: raw.rule_source ?? null,
    responseTimeMs: raw.response_time_ms ?? null,
    createdAt: raw.created_at,
  }
}

export function normaliseAuditEvent(raw: {
  id: string
  user_id: string | null
  action: string
  resource_type: string
  resource_id: string | null
  details: string | null
  ip_address: string | null
  created_at: string
}): AuditEvent {
  return {
    id: raw.id,
    userId: raw.user_id ?? null,
    action: raw.action,
    resourceType: raw.resource_type,
    resourceId: raw.resource_id ?? null,
    details: raw.details ?? null,
    ipAddress: raw.ip_address ?? null,
    createdAt: raw.created_at,
  }
}

export function normaliseSystemStatus(raw: {
  status: string
  block_rule_count: number
  allow_rule_count: number
  client_count: number
  version: string
}): SystemStatus {
  return {
    status: raw.status,
    blockRuleCount: raw.block_rule_count ?? 0,
    allowRuleCount: raw.allow_rule_count ?? 0,
    clientCount: raw.client_count ?? 0,
    version: raw.version,
  }
}

export function normaliseSystemStats(raw: {
  total_queries: number
  blocked_queries: number
  allowed_queries: number
  block_rate: string
}): SystemStats {
  return {
    totalQueries: raw.total_queries ?? 0,
    blockedQueries: raw.blocked_queries ?? 0,
    allowedQueries: raw.allowed_queries ?? 0,
    blockRate: raw.block_rate ?? '0.00',
  }
}

export function normaliseTopBlockedDomains(raw: Array<{ domain: string; count: number }>): TopBlockedDomain[] {
  return raw.map((entry) => ({
    domain: entry.domain,
    count: entry.count,
  }))
}

export function normaliseActivitySummary(raw: {
  total: number
  blocked: number
  allowed: number
  top_blocked_domains: Array<{ domain: string; count: number }>
}): ActivitySummary {
  return {
    total: raw.total ?? 0,
    blocked: raw.blocked ?? 0,
    allowed: raw.allowed ?? 0,
    topBlockedDomains: normaliseTopBlockedDomains(raw.top_blocked_domains ?? []),
  }
}
