// src/hooks/useEvents.ts
import { useState, useEffect, useCallback } from 'react';
import {
  fetchEvents, fetchEventById, fetchFeaturedEvent, fetchRelatedEvents,
  type ApiEvent, type EventFilters, type EventsResponse,
} from '../services/eventService';

// ── useEvents: listing page ────────────────────────────────────
export function useEvents(filters: EventFilters = {}) {
  const [data,    setData]    = useState<EventsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const key = JSON.stringify(filters);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchEvents(filters);
      setData(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refetch: load };
}

// ── useEvent: single event ─────────────────────────────────────
export function useEvent(id: string | undefined) {
  const [event,   setEvent]   = useState<ApiEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchEventById(id)
      .then(setEvent)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load event'))
      .finally(() => setLoading(false));
  }, [id]);

  return { event, loading, error };
}

// ── useFeaturedEvent ───────────────────────────────────────────
export function useFeaturedEvent() {
  const [event,   setEvent]   = useState<ApiEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedEvent()
      .then(setEvent)
      .catch(() => setEvent(null))
      .finally(() => setLoading(false));
  }, []);

  return { event, loading };
}

// ── useRelatedEvents ───────────────────────────────────────────
export function useRelatedEvents(id: string | undefined) {
  const [events,  setEvents]  = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchRelatedEvents(id)
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [id]);

  return { events, loading };
}