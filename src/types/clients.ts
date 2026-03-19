export interface Client {
  id: string
  name: string
  identifier: string
  identifierType: string
  groupId: string | null
  comment: string | null
  createdAt: string
  updatedAt: string
}

export interface ClientInput {
  name: string
  identifier: string
  identifierType: string
  groupId: string
  comment: string
}

export interface Group {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface GroupInput {
  name: string
  description: string
}
