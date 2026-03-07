'use client';

import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';

export const client = createClient({
  projectId: 'lda6ia2e',
  dataset: 'production',
  apiVersion: '2023-05-03',
  useCdn: true, // Always use CDN for better performance in dev/prod
});

const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}