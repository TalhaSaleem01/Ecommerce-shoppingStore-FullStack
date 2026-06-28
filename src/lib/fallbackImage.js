// Inline SVG placeholder — used whenever a product image fails to load.
// Encoded as a data URI so it renders instantly with zero network dependency,
// guaranteeing the storefront never shows a broken-image icon.
export const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
      <rect width="600" height="600" fill="#f3f4f6"/>
      <g fill="#cbd5e1">
        <rect x="190" y="220" width="220" height="160" rx="12" fill="none" stroke="#cbd5e1" stroke-width="10"/>
        <circle cx="240" cy="270" r="18"/>
        <path d="M190 360 L260 300 L320 340 L380 280 L410 360 Z"/>
      </g>
      <text x="300" y="430" font-family="Arial, sans-serif" font-size="20" fill="#9ca3af" text-anchor="middle">
        Image unavailable
      </text>
    </svg>
  `)
