import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import { notFound } from 'next/navigation'
import RichText from '@/components/RichText'
import { Media } from '@/components/Media'
import { generateMeta } from '@/utilities/generateMeta'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const places = await payload.find({
    collection: 'places',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })

  return places.docs.map(({ slug }) => ({ slug }))
}

type Args = {
  params: Promise<{ slug?: string }>
}

export default async function PlacePage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const place = await queryPlaceBySlug({ slug: decodedSlug })

  if (!place) return notFound()

  return (
    <article className="pt-16 pb-24">
      <div className="container max-w-4xl">
        {place.featuredImage && typeof place.featuredImage === 'object' && (
          <div className="rounded-lg overflow-hidden mb-8 aspect-video">
            <Media resource={place.featuredImage} className="w-full h-full object-cover" />
          </div>
        )}

        <h1 className="text-4xl font-bold mb-4">{place.title}</h1>

        {place.summary && <p className="text-lg text-gray-600 mb-8">{place.summary}</p>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            {place.description && <RichText data={place.description} enableGutter={false} />}
          </div>

          <aside className="space-y-6">
            {place.address && (
              <div>
                <h3 className="font-semibold text-sm uppercase text-gray-500 mb-1">Address</h3>
                <p>{place.address}</p>
              </div>
            )}

            {place.phone && (
              <div>
                <h3 className="font-semibold text-sm uppercase text-gray-500 mb-1">Phone</h3>
                <a href={`tel:${place.phone}`} className="text-blue-600 hover:underline">
                  {place.phone}
                </a>
              </div>
            )}

            {place.email && (
              <div>
                <h3 className="font-semibold text-sm uppercase text-gray-500 mb-1">Email</h3>
                <a href={`mailto:${place.email}`} className="text-blue-600 hover:underline">
                  {place.email}
                </a>
              </div>
            )}

            {place.website && (
              <div>
                <h3 className="font-semibold text-sm uppercase text-gray-500 mb-1">Website</h3>
                <a
                  href={place.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Visit website
                </a>
              </div>
            )}

            {place.hours && place.hours.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm uppercase text-gray-500 mb-1">
                  Opening Hours
                </h3>
                <dl className="space-y-1">
                  {place.hours.map((h, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <dt>{h.label}</dt>
                      <dd className="text-gray-600">{h.times}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </aside>
        </div>

        {place.gallery && place.gallery.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-6">Photos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {place.gallery.map((item, i) => (
                <figure key={i} className="rounded-lg overflow-hidden">
                  {typeof item.image === 'object' && item.image !== null && (
                    <Media resource={item.image} className="w-full h-48 object-cover" />
                  )}
                  {item.caption && (
                    <figcaption className="p-2 text-sm text-gray-600">{item.caption}</figcaption>
                  )}
                </figure>
              ))}
            </div>
          </div>
        )}

        {place.latitude && place.longitude && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-4">Location</h2>
            <iframe
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${place.longitude - 0.02},${place.latitude - 0.01},${place.longitude + 0.02},${place.latitude + 0.01}&layer=mapnik&marker=${place.latitude},${place.longitude}`}
              width="100%"
              height="350"
              style={{ border: '1px solid #ccc', borderRadius: '8px' }}
              loading="lazy"
              title={`Map of ${place.title}`}
            />
          </div>
        )}
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const place = await queryPlaceBySlug({ slug: decodedSlug })
  return generateMeta({ doc: place })
}

const queryPlaceBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'places',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: { equals: slug },
    },
  })

  return result.docs?.[0] || null
})
