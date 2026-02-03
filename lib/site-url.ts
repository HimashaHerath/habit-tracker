export function getSiteUrl() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }

  const explicitUrl = process.env.NEXT_PUBLIC_APP_URL
  if (explicitUrl) {
    return explicitUrl
  }

  const vercelUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL
  if (vercelUrl) {
    if (vercelUrl.startsWith('http://') || vercelUrl.startsWith('https://')) {
      return vercelUrl
    }
    return `https://${vercelUrl}`
  }

  return 'http://localhost:3000'
}
