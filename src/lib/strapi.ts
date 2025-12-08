const STRAPI_URL = import.meta.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = import.meta.env.STRAPI_API_TOKEN;

interface StrapiResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface MenuItem {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description: string;
  type: 'drink' | 'bite' | 'other';
  price: number;
  available: boolean;
  image?: {
    url: string;
  };
}

interface Page {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  content: string;
  seoTitle?: string;
  seoDescription?: string;
}

async function fetchStrapi<T>(endpoint: string): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (STRAPI_API_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
  }

  const res = await fetch(`${STRAPI_URL}/api${endpoint}`, { headers });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${res.statusText}`);
  }

  return res.json();
}

export async function getMenuItems(): Promise<MenuItem[]> {
  const response = await fetchStrapi<StrapiResponse<MenuItem>>('/menu-items?populate=image');
  return response.data;
}

export async function getMenuItemsByType(type: 'drink' | 'bite' | 'other'): Promise<MenuItem[]> {
  const response = await fetchStrapi<StrapiResponse<MenuItem>>(
    `/menu-items?filters[type][$eq]=${type}&populate=image`
  );
  return response.data;
}

export async function getPages(): Promise<Page[]> {
  const response = await fetchStrapi<StrapiResponse<Page>>('/pages');
  return response.data;
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const response = await fetchStrapi<StrapiResponse<Page>>(
    `/pages?filters[slug][$eq]=${slug}`
  );
  return response.data[0] || null;
}

interface SiteSettings {
  id: number;
  documentId: string;
  siteName: string;
  tagline?: string;
  ourStoryText: string;
  aboutPageContent?: string;
  address?: string;
  phone?: string;
  email?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  tiktokUrl?: string;
  logo?: {
    url: string;
  };
  heroImage?: {
    url: string;
  };
}

interface StrapiSingleResponse<T> {
  data: T;
  meta: object;
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const response = await fetchStrapi<StrapiSingleResponse<SiteSettings>>('/site-setting?populate=*');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch site settings:', error);
    return null;
  }
}

export { STRAPI_URL };
export type { MenuItem, Page, SiteSettings };
