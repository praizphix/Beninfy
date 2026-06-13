import Image from 'next/image'

interface CatalogImageProps {
  src: string
  alt: string
  sizes: string
  className?: string
  priority?: boolean
}

export default function CatalogImage({ src, alt, sizes, className, priority = false }: CatalogImageProps) {
  const isUploadedImage = src.startsWith('/api/media/')

  if (isUploadedImage) {
    return (
      // Uploaded catalog images are already served by a cacheable media endpoint.
      // Native img avoids production optimizer issues with dynamic API-backed files.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={className}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
    />
  )
}
