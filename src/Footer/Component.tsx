import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import { CMSLink } from '@/components/Link'

export async function Footer() {
  const footerData = await getCachedGlobal('footer', 1)()

  const navItems = footerData?.navItems || []

  return (
    <footer className="mt-auto border-t border-border bg-primary text-primary-foreground">
      <div className="container py-10 gap-8 flex flex-col md:flex-row md:justify-between">
        <div className="space-y-2">
          <Link className="text-xl font-semibold tracking-tight" href="/">
            Erica &amp; Rawson
          </Link>
          <p className="text-sm opacity-80">Two Townships, One Community</p>
        </div>

        <nav className="flex flex-col md:flex-row gap-4 md:items-center">
          {navItems.map(({ link }, i) => {
            return <CMSLink className="text-primary-foreground opacity-80 hover:opacity-100 transition-opacity" key={i} {...link} />
          })}
        </nav>
      </div>
    </footer>
  )
}
