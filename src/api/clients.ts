import { request } from '@/api/client'
import { normaliseClient, normaliseGroup } from '@/api/normalisers'
import type { ApiList, Client, ClientInput, Group, GroupInput } from '@/types'

function serialiseClient(input: ClientInput) {
  return {
    name: input.name.trim(),
    identifier: input.identifier.trim(),
    identifier_type: input.identifierType.trim() || 'ip',
    group_id: input.groupId.trim() || null,
    comment: input.comment.trim() || null,
  }
}

function serialiseGroup(input: GroupInput) {
  return {
    name: input.name.trim(),
    description: input.description.trim() || null,
  }
}

export async function listClients(): Promise<ApiList<Client>> {
  const response = await request<{
    items: Array<{
      id: string
      name: string
      identifier: string
      identifier_type: string
      group_id: string | null
      comment: string | null
      created_at: string
      updated_at: string
    }>
    total: number
  }>('clients')

  return {
    items: response.items.map(normaliseClient),
    total: response.total,
  }
}

export async function createClient(payload: ClientInput): Promise<Client> {
  const response = await request<{
    id: string
    name: string
    identifier: string
    identifier_type: string
    group_id: string | null
    comment: string | null
    created_at: string
    updated_at: string
  }>('clients', {
    method: 'POST',
    body: serialiseClient(payload),
  })

  return normaliseClient(response)
}

export async function updateClient(id: string, payload: ClientInput): Promise<Client> {
  const response = await request<{
    id: string
    name: string
    identifier: string
    identifier_type: string
    group_id: string | null
    comment: string | null
    created_at: string
    updated_at: string
  }>(`clients/${id}`, {
    method: 'PUT',
    body: serialiseClient(payload),
  })

  return normaliseClient(response)
}

export async function deleteClient(id: string): Promise<void> {
  await request(`clients/${id}`, {
    method: 'DELETE',
  })
}

export async function listGroups(): Promise<ApiList<Group>> {
  const response = await request<{
    items: Array<{
      id: string
      name: string
      description: string | null
      created_at: string
      updated_at: string
    }>
    total: number
  }>('groups')

  return {
    items: response.items.map(normaliseGroup),
    total: response.total,
  }
}

export async function createGroup(payload: GroupInput): Promise<Group> {
  const response = await request<{
    id: string
    name: string
    description: string | null
    created_at: string
    updated_at: string
  }>('groups', {
    method: 'POST',
    body: serialiseGroup(payload),
  })

  return normaliseGroup(response)
}

export async function updateGroup(id: string, payload: GroupInput): Promise<Group> {
  const response = await request<{
    id: string
    name: string
    description: string | null
    created_at: string
    updated_at: string
  }>(`groups/${id}`, {
    method: 'PUT',
    body: serialiseGroup(payload),
  })

  return normaliseGroup(response)
}

export async function deleteGroup(id: string): Promise<void> {
  await request(`groups/${id}`, {
    method: 'DELETE',
  })
}
