export interface Rule {
  id: string
  pattern: string
  ruleType: string
  comment: string | null
  enabled: boolean
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export interface RuleInput {
  pattern: string
  ruleType: string
  comment: string
  enabled: boolean
}

export interface RuleSource {
  id: string
  name: string
  url: string
  format: string
  enabled: boolean
  lastUpdatedAt: string | null
  ruleCount: number
  createdAt: string
  updatedAt: string
}

export interface RuleSourceInput {
  name: string
  url: string
  format: string
  enabled: boolean
}
