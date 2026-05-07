import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { className } = props

  return (
    <span className={clsx('flex items-center gap-2', className)}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Mountain silhouette */}
        <path d="M2 26L10 10L16 18L20 12L30 26H2Z" fill="currentColor" opacity="0.2" />
        <path d="M4 26L12 12L16 18L22 10L28 26H4Z" fill="currentColor" opacity="0.4" />
        {/* Tree */}
        <path d="M15.5 6L12 14H19L15.5 6Z" fill="currentColor" opacity="0.7" />
        <rect x="15" y="14" width="1" height="4" fill="currentColor" opacity="0.7" />
      </svg>
      <span className="font-semibold text-lg tracking-tight whitespace-nowrap">
        Erica &amp; Rawson
      </span>
    </span>
  )
}
