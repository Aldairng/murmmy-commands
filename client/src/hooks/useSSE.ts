import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SSEEvent } from '../types';

type EventCallback = (event: SSEEvent) => void;

export function useSSE(onEvent: EventCallback) {
  const { token } = useAuth();
  const callbackRef = useRef(onEvent);
  callbackRef.current = onEvent;

  useEffect(() => {
    if (!token) return;

    const es = new EventSource(`/api/events?token=${encodeURIComponent(token)}`);

    es.onmessage = (e) => {
      try {
        const parsed: SSEEvent = JSON.parse(e.data);
        callbackRef.current(parsed);
      } catch {
        // ignore malformed events
      }
    };

    es.onerror = () => {
      // EventSource auto-reconnects
    };

    return () => {
      es.close();
    };
  }, [token]);
}

export function useSSERefresh(refetch: () => void) {
  const handleEvent = useCallback(
    (event: SSEEvent) => {
      if (event.type !== 'connected') {
        refetch();
      }
    },
    [refetch]
  );

  useSSE(handleEvent);
}
