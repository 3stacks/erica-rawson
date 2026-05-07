import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      required: true,
      defaultValue: 'Erica and Rawson',
    },
    {
      name: 'tagline',
      type: 'text',
      defaultValue: 'Two Townships, One Community',
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Used in meta tags and search results',
      },
    },
    {
      type: 'group',
      name: 'contact',
      label: 'Contact Details',
      fields: [
        {
          name: 'organisation',
          type: 'text',
        },
        {
          name: 'address',
          type: 'textarea',
        },
        {
          name: 'phone',
          type: 'text',
        },
        {
          name: 'email',
          type: 'email',
        },
      ],
    },
    {
      type: 'group',
      name: 'social',
      label: 'Social Media',
      fields: [
        {
          name: 'facebook',
          type: 'text',
          admin: { description: 'Facebook page URL' },
        },
      ],
    },
  ],
}
