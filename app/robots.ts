import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/story/',
          '/onboarding',
          '/mood-set',
        ],
      },
    ],
    sitemap: 'https://sillygoosetales.com/sitemap.xml',
  }
}
