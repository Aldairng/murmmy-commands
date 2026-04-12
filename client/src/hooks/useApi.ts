import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function useApi<T>() {
  const { apiFetch } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(
    async (url: string, options?: RequestInit): Promise<T | null> => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch(url, options);
        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: 'Request failed' }));
          setError(data.error || 'Request failed');
          return null;
        }
        const data = await res.json();
        return data as T;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Request failed');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiFetch]
  );

  return { request, loading, error };
}
