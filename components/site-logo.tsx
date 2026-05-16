import Link from 'next/link'

type SiteLogoProps = {
  href?: string
  className?: string
}

export function SiteLogo({ href = '/home', className }: SiteLogoProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 ${className ?? ''}`.trim()}
      aria-label="Just Ask home"
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-primary"
          aria-hidden="true"
        >
          <path
            d="M5 6.5C5 4.567 6.567 3 8.5 3H15.5C17.433 3 19 4.567 19 6.5V11.5C19 13.433 17.433 15 15.5 15H10.8L7.2 18.1C6.55 18.66 5.5 18.198 5.5 17.34V15.01C5.2 14.96 5 14.75 5 14.45V6.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M9 8.7H15M9 11.2H13.6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className="text-xl font-bold text-primary">Just Ask</span>
    </Link>
  )
}
