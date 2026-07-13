#include <ESP8266WiFi.h>
#include <WebSocketsClient.h>
#include <SoftwareSerial.h>
#include <ArduinoJson.h>
#include "config.h"

const char* ssid = WIFI_SSID;
const char* password = WIFI_PASSWORD;

const char* wsHost = WS_HOST;
const int wsPort = WS_PORT;

SoftwareSerial stmSerial(4, 5); 

WebSocketsClient webSocket;

void setup() {
  Serial.begin(115200);
  stmSerial.begin(115200);

  Serial.println("\n\n=== ESP8266 IoT HUB START ===");

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi подключён");

  webSocket.begin(wsHost, wsPort, "/");
  webSocket.onEvent(webSocketEvent);
  webSocket.setReconnectInterval(3000);
}

void loop() {
  webSocket.loop();

  if (stmSerial.available()) {
    String data = stmSerial.readStringUntil('\n');
    data.trim();
    if (data.length() > 0) {
      Serial.printf("→ ОТ STM32: %s\n", data.c_str());
      webSocket.sendTXT(data);
    }
  }
}

void webSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case WStype_CONNECTED:
      Serial.println("✅ WebSocket подключён к backend");
      break;

    case WStype_DISCONNECTED:
      Serial.println("❌ WebSocket отключён");
      break;

    case WStype_TEXT: {
      String msg = String((char*)payload);
      Serial.printf("← ОТ BACKEND: %s\n", msg.c_str());
      stmSerial.println(msg);
      break;
    }
  }
}