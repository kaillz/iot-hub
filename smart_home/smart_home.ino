#include <ESP8266WiFi.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>

const char* ssid = "DIR-2150";
const char* password = "KI2028llwifi!!wifi";

WebSocketsServer webSocket = WebSocketsServer(81);

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n=== ESP8266 IoT Server Starting ===");

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  webSocket.begin();
  webSocket.onEvent(webSocketEvent);

  Serial.println("WebSocket server started on port 81");
}

void loop() {
  webSocket.loop();

  // Передача данных от STM32 на React
  if (Serial.available()) {
    String data = Serial.readStringUntil('\n');
    data.trim();
    if (data.length() > 0) {
      webSocket.broadcastTXT(data);
      Serial.print("→ Sent to React: ");
      Serial.println(data);
    }
  }
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  if (type == WStype_TEXT) {
    String cmd = String((char*)payload);
    Serial.print("← From React: ");
    Serial.println(cmd);
    
    // Передаём команду на STM32
    Serial.println(cmd);
  }
}