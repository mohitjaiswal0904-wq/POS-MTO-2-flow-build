import type { MtoItemImage } from '@/features/mto/types'

export function revokeItemImages(images: MtoItemImage[]) {
  images.forEach((image) => {
    if (image.source === 'upload' && image.url.startsWith('blob:')) {
      URL.revokeObjectURL(image.url)
    }
  })
}
