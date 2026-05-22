// src/services/eventService.ts
import api from './api';

export interface EventFilters {
  status?:   'upcoming' | 'past';
  category?: string;
  search?:   string;
  featured?: boolean;
  limit?:    number;
  page?:     number;
}

export interface ApiEvent {
  _id: string;
  title: string;
  slug: string;
  category: string;
  categoryKey: string;
  status: 'upcoming' | 'past';
  featured: boolean;
  dateISO: string;
  dateLabel: string;
  day: string;
  month: string;
  year: string;
  timeStart: string;
  timeEnd: string;
  location: string;
  address: string;
  capacity: number;
  registered: number;
  price: string;
  organiser: string;
  image: string;
  thumbImage: string;
  tags: string[];
  shortDesc: string;
  fullDesc: string;
  schedule: { time: string; item: string }[];
  highlights: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EventsResponse {
  events: ApiEvent[];
  total:  number;
  page:   number;
  pages:  number;
}

// ── Public ────────────────────────────────────────────────────────
export async function fetchEvents(filters: EventFilters = {}): Promise<EventsResponse> {
  const { data } = await api.get<EventsResponse>('/events', { params: filters });
  return data;
}

export async function fetchEventById(id: string): Promise<ApiEvent> {
  const { data } = await api.get<ApiEvent>(`/events/${id}`);
  return data;
}

export async function fetchFeaturedEvent(): Promise<ApiEvent | null> {
  const { data } = await api.get<ApiEvent | null>('/events/featured');
  return data;
}

export async function fetchRelatedEvents(id: string): Promise<ApiEvent[]> {
  const { data } = await api.get<ApiEvent[]>(`/events/${id}/related`);
  return data;
}

export async function registerForEvent(id: string): Promise<{ registered: number; spotsLeft: number }> {
  const { data } = await api.patch(`/events/${id}/register`);
  return data;
}

// ── Admin ─────────────────────────────────────────────────────────
export async function createEvent(payload: Partial<ApiEvent>): Promise<ApiEvent> {
  const { data } = await api.post<ApiEvent>('/events', payload);
  return data;
}

export async function updateEvent(id: string, payload: Partial<ApiEvent>): Promise<ApiEvent> {
  const { data } = await api.put<ApiEvent>(`/events/${id}`, payload);
  return data;
}

export async function deleteEvent(id: string): Promise<void> {
  await api.delete(`/events/${id}`);
}