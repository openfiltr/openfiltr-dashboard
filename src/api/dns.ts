import { request } from '@/api/client'
import { normaliseDnsEntry, normaliseUpstreamServer, toEnabledNumber } from '@/api/normalisers'
import type { ApiList, DnsEntry, DnsEntryInput, UpstreamServer, UpstreamServerInput } from '@/types'

function serialiseUpstreamServer(input: UpstreamServerInput) {
  return {
    name: input.name.trim(),
    address: input.address.trim(),
    protocol: input.protocol.trim() || 'udp',
    enabled: toEnabledNumber(input.enabled),
    priority: Number(input.priority) || 0,
  }
}

function serialiseDnsEntry(input: DnsEntryInput) {
  return {
    host: input.host.trim(),
    entry_type: input.entryType.trim(),
    value: input.value.trim(),
    ttl: Number(input.ttl) || 300,
    comment: input.comment.trim() || null,
    enabled: toEnabledNumber(input.enabled),
  }
}

export async function listUpstreamServers(): Promise<ApiList<UpstreamServer>> {
  const response = await request<{
    items: Array<{
      id: string
      name: string
      address: string
      protocol: string
      enabled: number
      priority: number
      created_at: string
      updated_at: string
    }>
    total: number
  }>('dns/upstream-servers')

  return {
    items: response.items.map(normaliseUpstreamServer),
    total: response.total,
  }
}

export async function createUpstreamServer(payload: UpstreamServerInput): Promise<UpstreamServer> {
  const response = await request<{
    id: string
    name: string
    address: string
    protocol: string
    enabled: number
    priority: number
    created_at: string
    updated_at: string
  }>('dns/upstream-servers', {
    method: 'POST',
    body: serialiseUpstreamServer(payload),
  })

  return normaliseUpstreamServer(response)
}

export async function updateUpstreamServer(id: string, payload: UpstreamServerInput): Promise<UpstreamServer> {
  const response = await request<{
    id: string
    name: string
    address: string
    protocol: string
    enabled: number
    priority: number
    created_at: string
    updated_at: string
  }>(`dns/upstream-servers/${id}`, {
    method: 'PUT',
    body: serialiseUpstreamServer(payload),
  })

  return normaliseUpstreamServer(response)
}

export async function deleteUpstreamServer(id: string): Promise<void> {
  await request(`dns/upstream-servers/${id}`, {
    method: 'DELETE',
  })
}

export async function listDnsEntries(): Promise<ApiList<DnsEntry>> {
  const response = await request<{
    items: Array<{
      id: string
      host: string
      entry_type: string
      value: string
      ttl: number
      comment: string | null
      enabled: number
      created_by: string | null
      created_at: string
      updated_at: string
    }>
    total: number
  }>('dns/entries')

  return {
    items: response.items.map(normaliseDnsEntry),
    total: response.total,
  }
}

export async function createDnsEntry(payload: DnsEntryInput): Promise<DnsEntry> {
  const response = await request<{
    id: string
    host: string
    entry_type: string
    value: string
    ttl: number
    comment: string | null
    enabled: number
    created_by: string | null
    created_at: string
    updated_at: string
  }>('dns/entries', {
    method: 'POST',
    body: serialiseDnsEntry(payload),
  })

  return normaliseDnsEntry(response)
}

export async function updateDnsEntry(id: string, payload: DnsEntryInput): Promise<DnsEntry> {
  const response = await request<{
    id: string
    host: string
    entry_type: string
    value: string
    ttl: number
    comment: string | null
    enabled: number
    created_by: string | null
    created_at: string
    updated_at: string
  }>(`dns/entries/${id}`, {
    method: 'PUT',
    body: serialiseDnsEntry(payload),
  })

  return normaliseDnsEntry(response)
}

export async function deleteDnsEntry(id: string): Promise<void> {
  await request(`dns/entries/${id}`, {
    method: 'DELETE',
  })
}
