import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { authenticated } from '../../access/authenticated'
import { authenticatedOrPublished } from '../../access/authenticatedOrPublished'
import { slugField } from 'payload'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Places: CollectionConfig<'places'> = {
  slug: 'places',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    category: true,
    featuredImage: true,
    summary: true,
  },
  admin: {
    defaultColumns: ['title', 'category', 'slug', 'updatedAt'],
    useAsTitle: 'title',
    group: 'Content',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Details',
          fields: [
            {
              name: 'category',
              type: 'select',
              required: true,
              options: [
                { label: 'Shopping', value: 'shopping' },
                { label: 'Dining', value: 'dining' },
                { label: 'Accommodation', value: 'accommodation' },
                { label: 'Attractions', value: 'attractions' },
                { label: 'Activities', value: 'activities' },
                { label: 'Services', value: 'services' },
              ],
              admin: {
                position: 'sidebar',
              },
            },
            {
              name: 'summary',
              type: 'textarea',
              admin: {
                description: 'Short description shown in listings',
              },
            },
            {
              name: 'description',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => [
                  ...rootFeatures,
                  HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
                  FixedToolbarFeature(),
                  InlineToolbarFeature(),
                ],
              }),
            },
            {
              name: 'featuredImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'gallery',
              type: 'array',
              label: 'Photo Gallery',
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'caption',
                  type: 'text',
                },
              ],
            },
          ],
        },
        {
          label: 'Location & Contact',
          fields: [
            {
              name: 'address',
              type: 'text',
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'latitude',
                  type: 'number',
                  admin: { step: 0.000001 },
                },
                {
                  name: 'longitude',
                  type: 'number',
                  admin: { step: 0.000001 },
                },
              ],
            },
            {
              name: 'phone',
              type: 'text',
            },
            {
              name: 'email',
              type: 'email',
            },
            {
              name: 'website',
              type: 'text',
              admin: {
                description: 'External website URL',
              },
            },
            {
              name: 'hours',
              type: 'array',
              label: 'Opening Hours',
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'e.g. "Monday - Friday" or "Weekends"',
                  },
                },
                {
                  name: 'times',
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'e.g. "10:00 AM - 2:00 PM" or "Closed"',
                  },
                },
              ],
            },
          ],
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({ hasGenerateFn: true }),
            MetaImageField({ relationTo: 'media' }),
            MetaDescriptionField({}),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    slugField(),
  ],
  hooks: {
    beforeChange: [populatePublishedAt],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
