export interface Credentials {
  username: string
  password: string
}

export interface User {
  id: string
  username: string
  role: string
}

export interface AuthResponse {
  token: string
  username: string
  role: string
}

export interface ApiToken {
  id: string
  name: string
  scopes: string
  lastUsedAt: string | null
  expiresAt: string | null
  createdAt: string
}

export interface ApiTokenInput {
  name: string
  expiresAt: string
}

export interface CreatedApiToken {
  id: string
  name: string
  token: string
}
