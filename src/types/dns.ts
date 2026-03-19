export interface UpstreamServer {
  id: string
  name: string
  address: string
  protocol: string
  enabled: boolean
  priority: number
  createdAt: string
  updatedAt: string
}

export interface UpstreamServerInput {
  name: string
  address: string
  protocol: string
  enabled: boolean
  priority: number
}

export interface DnsEntry {
  id: string
  host: string
  entryType: string
  value: string
  ttl: number
  comment: string | null
  enabled: boolean
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export interface DnsEntryInput {
  host: string
  entryType: string
  value: string
  ttl: number
  comment: string
  enabled: boolean
}
