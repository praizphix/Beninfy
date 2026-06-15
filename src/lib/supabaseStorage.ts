const DEFAULT_BUCKET = 'beninfy-media'

type CatalogKind = 'vehicles' | 'tours'

function getSupabaseStorageConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || DEFAULT_BUCKET

  if (!url) return { error: 'NEXT_PUBLIC_SUPABASE_URL is not configured' as const }
  if (!key) return { error: 'SUPABASE_SECRET_KEY is not configured' as const }

  return { url, key, bucket }
}

function extensionForType(type: string) {
  switch (type) {
    case 'image/jpeg':
      return 'jpg'
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    case 'image/avif':
      return 'avif'
    default:
      return 'bin'
  }
}

export async function uploadCatalogImage(kind: CatalogKind, id: string, file: File) {
  const config = getSupabaseStorageConfig()
  if ('error' in config) {
    return { ok: false as const, error: config.error }
  }

  const extension = extensionForType(file.type)
  const safeId = id.replace(/[^a-zA-Z0-9_-]/g, '-')
  const path = `${kind}/${safeId}/${Date.now()}.${extension}`
  const uploadUrl = `${config.url}/storage/v1/object/${encodeURIComponent(config.bucket)}/${path}`

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      'Content-Type': file.type,
      'Cache-Control': '31536000',
      'x-upsert': 'true',
    },
    body: Buffer.from(await file.arrayBuffer()),
  })

  if (!res.ok) {
    const message = await res.text().catch(() => '')
    return {
      ok: false as const,
      error: `Supabase Storage upload failed (${res.status})${message ? `: ${message.slice(0, 180)}` : ''}`,
    }
  }

  return {
    ok: true as const,
    url: `${config.url}/storage/v1/object/public/${encodeURIComponent(config.bucket)}/${path}`,
  }
}
