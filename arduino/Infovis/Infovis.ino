#include <Servo.h>
#include <stdlib.h>

Servo miServo;

const byte PIN_SERVO = 6;
char entrada[8];
byte indice = 0;

void setup() {
  Serial.begin(9600);
  miServo.attach(PIN_SERVO);
  miServo.write(90);
}

void loop() {
  while (Serial.available() > 0) {
    char caracter = Serial.read();

    if (caracter == '\r') {
      continue;
    }

    if (caracter == '\n') {
      entrada[indice] = '\0';

      if (indice > 0) {
        char* fin;
        long angulo = strtol(entrada, &fin, 10);

        if (fin != entrada && *fin == '\0') {
          miServo.write(constrain((int)angulo, 10, 170));
        }
      }

      indice = 0;
    } else if (caracter >= '0' && caracter <= '9') {
      if (indice < sizeof(entrada) - 1) {
        entrada[indice++] = caracter;
      } else {
        indice = 0;
      }
    } else {
      indice = 0;
    }
  }
}