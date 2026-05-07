import React from 'react'
import type { MapEmbedBlock as MapEmbedBlockType } from '@/payload-types'

export const MapEmbedBlock: React.FC<MapEmbedBlockType> = ({ latitude, longitude, zoom, caption }) => {
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.02},${latitude - 0.01},${longitude + 0.02},${latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}`

  return (
    <div className="my-8">
      <iframe
        src={src}
        width="100%"
        height="400"
        style={{ border: '1px solid #ccc', borderRadius: '8px' }}
        loading="lazy"
        title={caption || 'Map'}
      />
      {caption && <p className="mt-2 text-sm text-gray-600 text-center">{caption}</p>}
    </div>
  )
}
