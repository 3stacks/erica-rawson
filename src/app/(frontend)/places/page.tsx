import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import { Media } from '@/components/Media'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Places - Erica and Rawson',
  description: 'Shops, attractions, dining, activities and services in Erica and Rawson',
}

const categoryLabels: Record<string, string> = {
  shopping: 'Shopping',
  dining: 'Dining',
  accommodation: 'Accommodation',
  attractions: 'Attractions',
  activities: 'Activities',
  services: 'Services',
}

export default async function PlacesPage() {
  const payload = await getPayload({ config: configPromise })

  const places = await payload.find({
    collection: 'places',
    draft: false,
    limit: 100,
    overrideAccess: false,
    sort: 'title',
  })

  const grouped = places.docs.reduce(
    (acc, place) => {
      const cat = place.category || 'other'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(place)
      return acc
    },
    {} as Record<string, typeof places.docs>,
  )

  return (
    <div className="pt-24 pb-24">
      <div className="container mb-16">
        <h1 className="text-4xl font-bold mb-4">Places</h1>
        <p className="text-lg text-gray-600">
          Discover the shops, attractions, dining and services in Erica and Rawson.
        </p>
      </div>

      {Object.entries(grouped).map(([category, items]) => (
        <section key={category} className="container mb-16">
          <h2 className="text-2xl font-semibold mb-8 border-b pb-2">
            {categoryLabels[category] || category}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((place) => (
              <Link
                key={place.id}
                href={`/places/${place.slug}`}
                className="group block rounded-lg overflow-hidden border hover:shadow-lg transition-shadow"
              >
                {place.featuredImage && typeof place.featuredImage === 'object' && (
                  <div className="aspect-video overflow-hidden">
                    <Media
                      resource={place.featuredImage}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold group-hover:text-blue-600 transition-colors">
                    {place.title}
                  </h3>
                  {place.summary && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{place.summary}</p>
                  )}
                  {place.address && (
                    <p className="mt-2 text-xs text-gray-400">{place.address}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
