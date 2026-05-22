// src/services/galleryService.ts
import api from './api';

export interface ApiGalleryItem {
  _id: string;
  title: string;
  category: string;
  imageUrl: string;
  filename: string;
  size: 'normal' | 'tall' | 'wide';
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryResponse {
  items: ApiGalleryItem[];
  total: number;
  page:  number;
  pages: number;
}

// ── Public ────────────────────────────────────────────────────────
// Handles both plain array response and paginated { items } response
export async function fetchGallery(category?: string): Promise<GalleryResponse> {
  const { data } = await api.get('/gallery', {
    params: category && category !== 'all' ? { category } : {},
  });

  // Backend returns plain array — normalise it
  if (Array.isArray(data)) {
    return { items: data, total: data.length, page: 1, pages: 1 };
  }
  // Already paginated shape
  return data as GalleryResponse;
}

// ── Admin ─────────────────────────────────────────────────────────
export async function uploadGalleryImage(formData: FormData): Promise<ApiGalleryItem> {
  const { data } = await api.post<ApiGalleryItem>('/gallery', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updateGalleryItem(
  id: string,
  payload: Partial<Pick<ApiGalleryItem, 'title' | 'category' | 'size' | 'order'>>
): Promise<ApiGalleryItem> {
  const { data } = await api.put<ApiGalleryItem>(`/gallery/${id}`, payload);
  return data;
}

export async function deleteGalleryItem(id: string): Promise<void> {
  await api.delete(`/gallery/${id}`);
}