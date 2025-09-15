import { useEffect, useState } from 'react';
import { backend_url } from '../App';

export default function useMetrics() {
  const [metrics, setMetrics] = useState({ totalRevenue: 0, totalOrders: 0, updatedAt: null, loading: true, error: null });

  useEffect(() => {
    let es;
    const token = localStorage.getItem('adminToken');
    const headers = { Authorization: `Bearer ${token}` };

    async function load() {
      try {
        const r = await fetch(`${backend_url}/api/admin/metrics`, { headers });
        const j = await r.json();
        if (j?.success) setMetrics({ ...j.data, loading: false, error: null });
        else setMetrics(m => ({ ...m, loading: false, error: 'Failed to fetch metrics' }));
      } catch (e) {
        setMetrics(m => ({ ...m, loading: false, error: e?.message || 'Failed to fetch metrics' }));
      }
    }

    load();

    try {
      es = new EventSource(`${backend_url}/api/admin/metrics/stream`);
      es.addEventListener('metrics', (e) => {
        try {
          const data = JSON.parse(e.data);
          setMetrics(m => ({ ...m, ...data, loading: false, error: null }));
        } catch {}
      });
    } catch {}

    return () => { if (es) es.close(); };
  }, []);

  return metrics;
}