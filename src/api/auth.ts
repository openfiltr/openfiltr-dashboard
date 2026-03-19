import { request } from '@/api/client'
import { normaliseToken, normaliseUser } from '@/api/normalisers'
import type {
  ApiList,
  ApiToken,
  ApiTokenInput,
  AuthResponse,
  CreatedApiToken,
  Credentials,
  User,
} from '@/types'

export async function login(credentials: Credentials): Promise<AuthResponse> {
  return request<AuthResponse>('auth/login', {
    method: 'POST',
    body: credentials,
    skipAuthRedirect: true,
  })
}

export async function setup(credentials: Credentials): Promise<{ message: string }> {
  return request<{ message: string }>('auth/setup', {
    method: 'POST',
    body: credentials,
    skipAuthRedirect: true,
  })
}

export async function logout(): Promise<void> {
  await request('auth/logout', {
    method: 'POST',
    skipAuthRedirect: true,
  })
}

export async function me(): Promise<User> {
  const response = await request<{ id: string; username: string; role: string }>('auth/me', {
    skipAuthRedirect: true,
  })
  return normaliseUser(response)
}

export async function listTokens(): Promise<ApiList<ApiToken>> {
  const response = await request<{
    items: Array<{
      id: string
      name: string
      scopes: string
      last_used_at: string | null
      expires_at: string | null
      created_at: string
    }>
    total: number
  }>('auth/tokens')

  return {
    items: response.items.map(normaliseToken),
    total: response.total,
  }
}

export async function createToken(payload: ApiTokenInput): Promise<CreatedApiToken> {
  return request<CreatedApiToken>('auth/tokens', {
    method: 'POST',
    body: {
      name: payload.name.trim(),
      expires_at: payload.expiresAt || null,
    },
  })
}

export async function deleteToken(id: string): Promise<void> {
  await request(`auth/tokens/${id}`, {
    method: 'DELETE',
  })
}
