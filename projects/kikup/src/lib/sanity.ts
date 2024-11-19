import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { ImageUrlBuilder } from '@sanity/image-url/lib/types/builder';

if (!import.meta.env.VITE_SANITY_PROJECT_ID) {
  throw new Error('Missing VITE_SANITY_PROJECT_ID');
}

if (!import.meta.env.VITE_SANITY_DATASET) {
  throw new Error('Missing VITE_SANITY_DATASET');
}

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  useCdn: true,
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION || '2024-01-19',
  token: import.meta.env.VITE_SANITY_TOKEN
});

const builder = imageUrlBuilder(client);

export function urlFor(source: any): ImageUrlBuilder {
  return builder.image(source);
}

// Blog Posts
export async function getBlogPosts() {
  const query = `*[_type == "post"] | order(publishedAt desc) {
    title,
    slug,
    excerpt,
    "mainImage": mainImage.asset->url,
    "author": author->{
      name,
      role,
      "image": image.asset->url
    },
    "categories": categories[]->title,
    publishedAt,
    body
  }`;
  
  return client.fetch(query);
}

export async function getBlogPost(slug: string) {
  const query = `*[_type == "post" && slug.current == $slug][0] {
    title,
    slug,
    excerpt,
    "mainImage": mainImage.asset->url,
    "author": author->{
      name,
      role,
      "image": image.asset->url
    },
    "categories": categories[]->title,
    publishedAt,
    body
  }`;
  
  return client.fetch(query, { slug });
}

// Pages
export async function getPage(slug: string) {
  const query = `*[_type == "page" && slug.current == $slug][0] {
    title,
    content,
    seo {
      title,
      description,
      "image": image.asset->url
    }
  }`;
  
  return client.fetch(query, { slug });
}

// High Scores
export async function getHighScores(gameId: string) {
  const query = `*[_type == "highScore" && gameId == $gameId] | order(time asc) [0...5] {
    name,
    time,
    word,
    date,
    gameId
  }`;
  
  return client.fetch(query, { gameId });
}

export async function createHighScore(score: any) {
  return client.create({
    _type: 'highScore',
    ...score
  });
}