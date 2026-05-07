import type { Block } from 'payload'

export const MapEmbed: Block = {
  slug: 'mapEmbed',
  interfaceName: 'MapEmbedBlock',
  labels: {
    singular: 'Map Embed',
    plural: 'Map Embeds',
  },
  fields: [
    {
      name: 'latitude',
      type: 'number',
      required: true,
      admin: {
        description: 'e.g. -37.956389',
        step: 0.000001,
      },
    },
    {
      name: 'longitude',
      type: 'number',
      required: true,
      admin: {
        description: 'e.g. 146.396944',
        step: 0.000001,
      },
    },
    {
      name: 'zoom',
      type: 'number',
      defaultValue: 14,
      min: 1,
      max: 20,
    },
    {
      name: 'caption',
      type: 'text',
    },
  ],
}
