import { useState, useEffect } from 'react';

const API_BASE = '/api';

export function useApi<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchApi() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE}${path}`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        const json = (await res.json()) as T;
        if (!cancelled) {
          setData(json);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchApi();
    return () => {
      cancelled = true;
    };
  }, [path]);

  return { data, loading, error };
}
