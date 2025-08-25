import type { Persona } from '@/types/persona'
import { MOCK_PERSONAS } from './mock-data'

type GetPersonasArgs = { q?: string }

function getBaseUrl(): string | undefined {
  // In the UI preview, env vars may not be set. This returns undefined unless configured.
  // When ready, set NEXT_PUBLIC_API_BASE_URL (e.g., http://localhost:8000/api).
  // Example DRF endpoints expected:
  // - GET {baseUrl}/personas/
  // - GET {baseUrl}/personas/{id}/
  // - POST {baseUrl}/personas/
  // - PATCH {baseUrl}/personas/{id}/
  // - DELETE {baseUrl}/personas/{id}/
  // eslint-disable-next-line no-undef
  return process?.env?.NEXT_PUBLIC_API_BASE_URL as string | undefined
}

const baseUrl = getBaseUrl()
const USE_MOCK = !baseUrl

export async function getPersonas(args: GetPersonasArgs = {}): Promise<Persona[]> {
  if (USE_MOCK) {
    const q = (args.q ?? '').toLowerCase()
    if (!q) return delay(MOCK_PERSONAS, 300)
    return delay(
      MOCK_PERSONAS.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.goals.join(' ').toLowerCase().includes(q)
      ),
      200
    )
  }

  const url = new URL('/personas/', baseUrl)
  if (args.q) url.searchParams.set('q', args.q)
  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to fetch personas (${res.status})`)
  const data = (await res.json()) as Persona[]
  return data
}

export async function getPersona(id: string): Promise<Persona> {
  if (USE_MOCK) {
    const found = MOCK_PERSONAS.find((p) => p.id === id)
    if (!found) throw new Error('Persona not found (mock)')
    return delay(found, 200)
  }

  const url = new URL(`/personas/${id}/`, baseUrl)
  const res = await fetch(url.toString(), { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to fetch persona (${res.status})`)
  const data = (await res.json()) as Persona
  return data
}

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}
