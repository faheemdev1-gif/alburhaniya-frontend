// src/hooks/useArticles.ts
import { useState, useEffect, useCallback } from 'react';
import {
  fetchArticles, fetchArticleById, fetchFeaturedArticle, fetchRelatedArticles,
  type ApiArticle, type ArticleFilters, type ArticlesResponse,
} from '../services/articleService';

export function useArticles(filters: ArticleFilters = {}) {
  const [data,    setData]    = useState<ArticlesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const key = JSON.stringify(filters);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchArticles(filters);
      setData(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load articles');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, refetch: load };
}

export function useArticle(id: string | undefined) {
  const [article, setArticle] = useState<ApiArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchArticleById(id)
      .then(setArticle)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load article'))
      .finally(() => setLoading(false));
  }, [id]);

  return { article, loading, error };
}

export function useFeaturedArticle() {
  const [article, setArticle] = useState<ApiArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedArticle()
      .then(setArticle)
      .catch(() => setArticle(null))
      .finally(() => setLoading(false));
  }, []);

  return { article, loading };
}

export function useRelatedArticles(id: string | undefined) {
  const [articles, setArticles] = useState<ApiArticle[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchRelatedArticles(id)
      .then(setArticles)
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [id]);

  return { articles, loading };
}