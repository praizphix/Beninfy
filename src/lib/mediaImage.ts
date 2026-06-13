const DATA_IMAGE_PATTERN = /^data:(image\/(?:jpeg|png|webp|avif));base64,([\s\S]+)$/

export function isDataImage(value: string | null | undefined) {
  return Boolean(value && DATA_IMAGE_PATTERN.test(value))
}

export function catalogImageUrl(kind: 'vehicles' | 'tours', id: string, image: string | null | undefined, updatedAt: Date) {
  if (!image) return null
  if (!isDataImage(image)) return image
  return `/api/media/${kind}/${encodeURIComponent(id)}/image?v=${updatedAt.getTime()}`
}

export function parseDataImage(value: string | null | undefined) {
  if (!value) return null

  const match = value.match(DATA_IMAGE_PATTERN)
  if (!match) return null

  return {
    contentType: match[1],
    bytes: Buffer.from(match[2], 'base64'),
  }
}
