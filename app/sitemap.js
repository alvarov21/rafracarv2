import { getCars, carSlug } from '@/lib/cars';
import { SITE_URL } from '@/lib/config';

export const revalidate = 3600;

export default async function sitemap() {
  const cars = await getCars();
  return [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/stock`, changeFrequency: 'daily', priority: 0.9 },
    ...cars.map((c) => ({
      url: `${SITE_URL}/coche/${carSlug(c)}`,
      lastModified: c.updated_at,
      changeFrequency: 'weekly',
      priority: c.estado === 'vendido' ? 0.3 : 0.8,
    })),
  ];
}
