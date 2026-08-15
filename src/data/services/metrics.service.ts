import { fetchEventSource } from "@microsoft/fetch-event-source";

export const metricsService = {
  async getMetricsData(token: string): Promise<any> {
    if (!token) throw new Error('Realize o login primeiro.');

    const response = await fetch('http://localhost:8080/metrics', {
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
    onMessage: (payload: any) => void,
    onError: (err: any) => void
  ) {
    if (!token) throw new Error('Realize o login primeiro.');

    fetchEventSource('http://localhost:8080/metrics/stream', {
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
          console.warn('Falha ao processar evento SSE:', ev.data);
        }
      },
      onerror(err) {
        onError(err);
        throw err;
      }
    });
  },
};