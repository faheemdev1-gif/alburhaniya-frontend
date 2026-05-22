// src/services/articleService.ts
import api from './api';

export interface ArticleFilters {
  category?:  string;
  search?:    string;
  featured?:  boolean;
  published?: boolean | 'all';
  limit?:     number;
  page?:      number;
}

export interface ApiArticle {
  _id: string;
  title: string;
  slug: string;
  category: string;
  categoryKey: string;
  date: string;
  dateISO: string;
  author: string;
  authorRole: string;
  authorAvatar: string;
  readTime: string;
  featured: boolean;
  tags: string[];
  excerpt: string;
  image: string;
  content: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ArticlesResponse {
  articles: ApiArticle[];
  total:    number;
  page:     number;
  pages:    number;
}

// ── Public ────────────────────────────────────────────────────────
export async function fetchArticles(filters: ArticleFilters = {}): Promise<ArticlesResponse> {
  const { data } = await api.get<ArticlesResponse>('/articles', { params: filters });
  return data;
}

export async function fetchArticleById(id: string): Promise<ApiArticle> {
  const { data } = await api.get<ApiArticle>(`/articles/${id}`);
  return data;
}

export async function fetchFeaturedArticle(): Promise<ApiArticle | null> {
  const { data } = await api.get<ApiArticle | null>('/articles/featured');
  return data;
}

export async function fetchRelatedArticles(id: string): Promise<ApiArticle[]> {
  const { data } = await api.get<ApiArticle[]>(`/articles/${id}/related`);
  return data;
}

// ── Admin ─────────────────────────────────────────────────────────
export async function createArticle(payload: Partial<ApiArticle>): Promise<ApiArticle> {
  const { data } = await api.post<ApiArticle>('/articles', payload);
  return data;
}

export async function updateArticle(id: string, payload: Partial<ApiArticle>): Promise<ApiArticle> {
  const { data } = await api.put<ApiArticle>(`/articles/${id}`, payload);
  return data;
}

export async function deleteArticle(id: string): Promise<void> {
  await api.delete(`/articles/${id}`);
}