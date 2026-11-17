// Diagnóstico de cableado de la sala. NO usa la página.
// Sube esto, abre el Monitor Serie (9600) y anota lo que pasa.
//
// Fase 1: todo amarillo 8 s     -> anoten qué cubos NO están amarillos
// Fase 2: todo morado 8 s       -> anoten qué cubos NO están morados
// Fase 3: de a una salida, 4 s cada una, en este orden:
//         P1 salida 1..8, P2 salida 1..8, P3 salida 1..8, P4 salida 1..8
//         En cada una, UN cubo debe quedar morado y el resto amarillo.
//         Anoten cuál cubo es (fila y posición contando desde la izquierda).
// Después repite desde la fase 1.

const int DATO = 8, RELOJ = 9, LATCH = 10;
const int N_CHIPS = 4;
byte estado[N_CHIPS];

void mostrar() {
  digitalWrite(LATCH, LOW);
  for (int c = N_CHIPS - 1; c >= 0; c--) shiftOut(DATO, RELOJ, MSBFIRST, estado[c]);
  digitalWrite(LATCH, HIGH);
}
void todo(byte v) { for (int c = 0; c < N_CHIPS; c++) estado[c] = v; mostrar(); }

void setup() {
  pinMode(DATO, OUTPUT); pinMode(RELOJ, OUTPUT); pinMode(LATCH, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  Serial.println("FASE 1: todo amarillo (8 s)");
  todo(0xFF); delay(8000);
  Serial.println("FASE 2: todo morado (8 s)");
  todo(0x00); delay(8000);
  Serial.println("FASE 3: una salida morada a la vez");
  for (int c = 0; c < N_CHIPS; c++) {
    for (int b = 0; b < 8; b++) {
      todo(0xFF);
      estado[c] &= ~(1 << b);
      mostrar();
      Serial.print("P"); Serial.print(c + 1);
      Serial.print(" salida "); Serial.print(b + 1);
      Serial.print(" (cable J columna "); Serial.print(14 + 5 * b); Serial.println(")");
      delay(4000);
    }
  }
}
