import React from 'react'
import type { ContentWithImageBlock as ContentWithImageBlockType } from '@/payload-types'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

export const ContentWithImageBlock: React.FC<ContentWithImageBlockType> = ({
  image,
  richText,
  imagePosition,
}) => {
  const isLeft = imagePosition !== 'right'

  return (
    <div className="container">
      <div className={`flex flex-col md:flex-row gap-8 items-start ${!isLeft ? 'md:flex-row-reverse' : ''}`}>
        <div className="w-full md:w-2/5 shrink-0 aspect-[4/3] relative overflow-hidden rounded-lg">
          {image && typeof image === 'object' && (
            <Media
              resource={image}
              fill
              imgClassName="object-cover"
            />
          )}
        </div>
        <div className="w-full md:w-3/5">
          {richText && <RichText data={richText} enableGutter={false} />}
        </div>
      </div>
    </div>
  )
}
