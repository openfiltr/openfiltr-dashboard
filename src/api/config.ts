import { request } from '@/api/client'
import type { ConfigImportResult } from '@/types'

export async function exportConfig(): Promise<Blob> {
  return request<Blob>('config/export', {
    parseAs: 'blob',
  })
}

export async function importConfig(payload: string): Promise<ConfigImportResult> {
  return request<ConfigImportResult>('config/import', {
    method: 'POST',
    body: payload,
    headers: {
      'Content-Type': 'application/yaml',
    },
  })
}
