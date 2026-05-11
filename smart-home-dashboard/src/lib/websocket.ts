// src/lib/websocket.ts
class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectInterval = 3000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private onMessageCallback: ((data: any) => void) | null = null;

  connect(ip: string = '192.168.0.186') {   // ← замени на IP своего ESP8266
    const url = `ws://${ip}:81`;
    
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log(`✅ WebSocket connected to ${url}`);
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.onMessageCallback?.(data);
      } catch (e) {
        console.log('Raw:', event.data);
      }
    };

    this.ws.onclose = () => {
      console.log('❌ Disconnected. Reconnecting...');
      this.reconnectTimer = setTimeout(() => this.connect(ip), this.reconnectInterval);
    };

    this.ws.onerror = () => console.error('WebSocket error');
  }

  setOnMessage(callback: (data: any) => void) {
    this.onMessageCallback = callback;
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
  }
}

export const wsClient = new WebSocketClient();