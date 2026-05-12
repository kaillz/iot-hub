// src/lib/websocket.ts
class WebSocketClient {
  public ws: WebSocket | null = null;           // ← сделал public
  private listeners: ((data: any) => void)[] = [];
  private reconnectInterval: any = null;        // ← убрал NodeJS.Timeout

  private readonly URL = 'ws://localhost:8080';

  addListener(callback: (data: any) => void) {
    this.listeners.push(callback);
  }

  removeListener(callback: (data: any) => void) {
    this.listeners = this.listeners.filter((cb) => cb !== callback);
  }

  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    console.log(`🔌 Подключаемся к ${this.URL}`);
    this.ws = new WebSocket(this.URL);

    this.ws.onopen = () => {
      console.log('✅ WebSocket подключён к backend (8080)');
      if (this.reconnectInterval) clearInterval(this.reconnectInterval);
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.listeners.forEach((cb) => cb(data));
      } catch (e) {
        console.error('❌ Ошибка парсинга WS', e);
      }
    };

    this.ws.onclose = () => {
      console.log('❌ WebSocket отключён. Переподключение...');
      this.reconnect();
    };

    this.ws.onerror = (err) => console.error('WebSocket error', err);
  }

  private reconnect() {
    if (this.reconnectInterval) return;
    this.reconnectInterval = setInterval(() => this.connect(), 3000);
  }

  // Публичный метод отправки (используется в IRRemoteCard)
  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket не подключён, сообщение не отправлено');
    }
  }

  disconnect() {
    if (this.reconnectInterval) clearInterval(this.reconnectInterval);
    this.ws?.close();
    this.ws = null;
  }
}

export const wsClient = new WebSocketClient();