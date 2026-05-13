#include <Arduino.h>
#include <ArduinoJson.h>
#include <IRremote.hpp>

#define LIGHT_PIN      PA0
#define IR_RECEIVE_PIN PA4
#define IR_SEND_PIN    PA3
#define LED_PIN        PC13

HardwareSerial SerialESP(PA10, PA9);

void setup() {
  SerialESP.begin(115200);
  delay(2000);

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, HIGH);

  IrReceiver.begin(IR_RECEIVE_PIN);
  IrSender.begin(IR_SEND_PIN);

  SerialESP.println("{\"status\":\"started\"}");
}

void loop() {
  static unsigned long lastSensor = 0;

  if (millis() - lastSensor >= 1500) {
    lastSensor = millis();
    int lightRaw = analogRead(LIGHT_PIN);
    int lux = (950 - lightRaw) * 0.12;

    JsonDocument doc;
    doc["light_raw"] = lightRaw;
    doc["lux"] = lux;
    serializeJson(doc, SerialESP);
    SerialESP.println();
  }

  if (IrReceiver.decode()) {
    uint32_t code = IrReceiver.decodedIRData.decodedRawData;

    JsonDocument doc;
    doc["ir_received"] = code;
    doc["protocol"] = "NEC";
    doc["bits"] = IrReceiver.decodedIRData.numberOfBits;

    serializeJson(doc, SerialESP);
    SerialESP.println();

    digitalWrite(LED_PIN, LOW); delay(80); digitalWrite(LED_PIN, HIGH);
    delay(40);
    digitalWrite(LED_PIN, LOW); delay(80); digitalWrite(LED_PIN, HIGH);

    IrReceiver.resume();
  }

  if (SerialESP.available()) {
    String line = SerialESP.readStringUntil('\n');
    line.trim();

    if (line.length() > 0) {
      JsonDocument doc;
      if (deserializeJson(doc, line) == DeserializationError::Ok && doc["type"] == "send_ir") {
        uint32_t code = strtoul(doc["code"].as<const char*>(), nullptr, 0);

        // === 7 способов отправки для Bailu/Gree ===

        // 1. Чистый raw (много повторов)
        IrSender.sendNECRaw(code, 120);

        // 2. address = 0x00, command = младшие 16 бит
        IrSender.sendNEC(0x00, code & 0xFFFF, 20);

        // 3. address = 0xB2 (очень часто у Bailu/Gree), command = младшие 8 бит
        IrSender.sendNEC(0xB2, code & 0xFF, 20);

        // 4. address = старшие 16 бит, command = младшие 8 бит
        IrSender.sendNEC((code >> 16) & 0xFFFF, code & 0xFF, 20);

        // 5. address = 0x00, command = биты 8-15
        IrSender.sendNEC(0x00, (code >> 8) & 0xFF, 20);

        // 6. address = 0xB2, command = биты 8-15
        IrSender.sendNEC(0xB2, (code >> 8) & 0xFF, 20);

        // 7. Очень много повторов raw (на случай "упрямого" кондиционера)
        IrSender.sendNECRaw(code, 200);

        // Длинное мигание при отправке
        digitalWrite(LED_PIN, LOW); delay(300); digitalWrite(LED_PIN, HIGH);
        delay(100);
        digitalWrite(LED_PIN, LOW); delay(300); digitalWrite(LED_PIN, HIGH);
      }
    }
  }
}