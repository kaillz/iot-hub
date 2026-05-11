#include <Arduino.h>
#include <ArduinoJson.h>

#define LIGHT_PIN PA0
#define RELAY1_PIN PB0
#define RELAY2_PIN PB1

HardwareSerial SerialESP(PA10, PA9);

void setup() {
  SerialESP.begin(115200);
  delay(2000);

  pinMode(RELAY1_PIN, OUTPUT);
  pinMode(RELAY2_PIN, OUTPUT);
  digitalWrite(RELAY1_PIN, LOW);
  digitalWrite(RELAY2_PIN, LOW);

  SerialESP.println("{\"status\":\"started\"}");
}

void loop() {
  static unsigned long last = 0;

  if (millis() - last >= 1500) {
    last = millis();

    int lightRaw = analogRead(LIGHT_PIN);

    JsonDocument doc;
    doc["light_raw"] = lightRaw;
    doc["relay1"] = digitalRead(RELAY1_PIN);
    doc["relay2"] = digitalRead(RELAY2_PIN);

    serializeJson(doc, SerialESP);
    SerialESP.println();
  }

  if (SerialESP.available()) {
    String cmd = SerialESP.readStringUntil('\n');
    cmd.trim();

    if (cmd == "RELAY1_ON") digitalWrite(RELAY1_PIN, HIGH);
    if (cmd == "RELAY1_OFF") digitalWrite(RELAY1_PIN, LOW);
    if (cmd == "RELAY2_ON") digitalWrite(RELAY2_PIN, HIGH);
    if (cmd == "RELAY2_OFF") digitalWrite(RELAY2_PIN, LOW);
  }
}