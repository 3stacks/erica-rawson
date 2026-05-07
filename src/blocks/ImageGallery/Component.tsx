import React from 'react'
import type { ImageGalleryBlock as ImageGalleryBlockType } from '@/payload-types'
import { Media } from '@/components/Media'

const colClasses: Record<string, string> = {
  '2': 'grid-cols-1 sm:grid-cols-2',
  '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  '4': 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
}

export const ImageGalleryBlock: React.FC<ImageGalleryBlockType> = ({ heading, images, columns }) => {
  const cols = columns || '3'

  return (
    <div className="my-8">
      {heading && <h3 className="text-2xl font-semibold mb-4">{heading}</h3>}
      <div className={`grid gap-4 ${colClasses[cols]}`}>
        {images?.map((item, i) => (
          <figure key={i} className="overflow-hidden rounded-lg">
            {typeof item.image === 'object' && item.image !== null && (
              <Media resource={item.image} className="w-full h-48 object-cover" />
            )}
            {item.caption && (
              <figcaption className="mt-2 text-sm text-gray-600">{item.caption}</figcaption>
            )}
          </figure>
        ))}
      </div>
    </div>
  )
}
