import { request } from '@/api/client'
import { normaliseRule, normaliseRuleSource, toEnabledNumber } from '@/api/normalisers'
import type { ApiList, Rule, RuleInput, RuleSource, RuleSourceInput } from '@/types'

function serialiseRule(input: RuleInput) {
  return {
    pattern: input.pattern.trim(),
    rule_type: input.ruleType,
    comment: input.comment.trim() || null,
    enabled: toEnabledNumber(input.enabled),
  }
}

function serialiseSource(input: RuleSourceInput) {
  return {
    name: input.name.trim(),
    url: input.url.trim(),
    format: input.format.trim() || 'hosts',
    enabled: toEnabledNumber(input.enabled),
  }
}

async function listRules(resource: 'allow-rules' | 'block-rules'): Promise<ApiList<Rule>> {
  const response = await request<{
    items: Array<{
      id: string
      pattern: string
      rule_type: string
      comment: string | null
      enabled: number
      created_by: string | null
      created_at: string
      updated_at: string
    }>
    total: number
  }>(`filtering/${resource}`)

  return {
    items: response.items.map(normaliseRule),
    total: response.total,
  }
}

async function createRule(resource: 'allow-rules' | 'block-rules', payload: RuleInput): Promise<Rule> {
  const response = await request<{
    id: string
    pattern: string
    rule_type: string
    comment: string | null
    enabled: number
    created_by: string | null
    created_at: string
    updated_at: string
  }>(`filtering/${resource}`, {
    method: 'POST',
    body: serialiseRule(payload),
  })

  return normaliseRule(response)
}

async function updateRule(resource: 'allow-rules' | 'block-rules', id: string, payload: RuleInput): Promise<Rule> {
  const response = await request<{
    id: string
    pattern: string
    rule_type: string
    comment: string | null
    enabled: number
    created_by: string | null
    created_at: string
    updated_at: string
  }>(`filtering/${resource}/${id}`, {
    method: 'PUT',
    body: serialiseRule(payload),
  })

  return normaliseRule(response)
}

async function deleteRule(resource: 'allow-rules' | 'block-rules', id: string): Promise<void> {
  await request(`filtering/${resource}/${id}`, {
    method: 'DELETE',
  })
}

export const listBlockRules = () => listRules('block-rules')
export const createBlockRule = (payload: RuleInput) => createRule('block-rules', payload)
export const updateBlockRule = (id: string, payload: RuleInput) => updateRule('block-rules', id, payload)
export const deleteBlockRule = (id: string) => deleteRule('block-rules', id)

export const listAllowRules = () => listRules('allow-rules')
export const createAllowRule = (payload: RuleInput) => createRule('allow-rules', payload)
export const updateAllowRule = (id: string, payload: RuleInput) => updateRule('allow-rules', id, payload)
export const deleteAllowRule = (id: string) => deleteRule('allow-rules', id)

export async function listRuleSources(): Promise<ApiList<RuleSource>> {
  const response = await request<{
    items: Array<{
      id: string
      name: string
      url: string
      format: string
      enabled: number
      last_updated_at: string | null
      rule_count: number
      created_at: string
      updated_at: string
    }>
    total: number
  }>('filtering/sources')

  return {
    items: response.items.map(normaliseRuleSource),
    total: response.total,
  }
}

export async function createRuleSource(payload: RuleSourceInput): Promise<RuleSource> {
  const response = await request<{
    id: string
    name: string
    url: string
    format: string
    enabled: number
    last_updated_at: string | null
    rule_count: number
    created_at: string
    updated_at: string
  }>('filtering/sources', {
    method: 'POST',
    body: serialiseSource(payload),
  })

  return normaliseRuleSource(response)
}

export async function updateRuleSource(id: string, payload: RuleSourceInput): Promise<RuleSource> {
  const response = await request<{
    id: string
    name: string
    url: string
    format: string
    enabled: number
    last_updated_at: string | null
    rule_count: number
    created_at: string
    updated_at: string
  }>(`filtering/sources/${id}`, {
    method: 'PUT',
    body: serialiseSource(payload),
  })

  return normaliseRuleSource(response)
}

export async function deleteRuleSource(id: string): Promise<void> {
  await request(`filtering/sources/${id}`, {
    method: 'DELETE',
  })
}

export async function refreshRuleSource(id: string): Promise<void> {
  await request(`filtering/sources/${id}/refresh`, {
    method: 'POST',
  })
}
