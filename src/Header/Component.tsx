import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'
import type { Header as HeaderType } from '@/payload-types'

const fallback: HeaderType = { id: 0, navItems: [], updatedAt: '', createdAt: '' }

export async function Header() {
  const headerData = await getCachedGlobal('header', 1)()

  return <HeaderClient data={headerData ?? fallback} />
}
