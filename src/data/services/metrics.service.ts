import { fetchEventSource } from "@microsoft/fetch-event-source";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const metricsService = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getMetricsData(token: string): Promise<any> {
    if (!token) throw new Error('Realize o login primeiro.');

    const response = await fetch(`${API_URL}/metrics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, 
      },
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Erro ao obter dados de métricas');
    return data;
  },

  listenStreamEvents(
    token: string, 
    signal: AbortSignal, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onMessage: (payload: any) => void,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => void
  ) {
    if (!token) throw new Error('Realize o login primeiro.');

    fetchEventSource(`${API_URL}/metrics/stream`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/event-stream',
      },
      signal,
      onmessage(ev) {
        if (!ev.data) return;

        try {
          const payload = JSON.parse(ev.data);
          onMessage(payload);
        } catch (err) {
          console.warn('Falha ao processar evento SSE:', ev.data, err);
        }
      },
      onerror(err) {
        onError(err);
        throw err;
      }
    });
  },
};