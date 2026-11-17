// Sala de clases con LEDs: 30 sillas, 4 chips 74HC595 en cadena.
// La página manda por USB una línea de texto:
//   "12"  -> 12 sillas moradas (mujeres) y el resto amarillas (hombres)
//   "R"   -> sin selección: una silla morada recorre la sala, para que no se lea como un dato

const int DATO = 8, RELOJ = 9, LATCH = 10;
const int N_CHIPS = 4;
const int N_SILLAS = 30;

// Cableado real de la maqueta, tal como quedó armado.
// SILLA_EN[placa][salida] = número de silla que cuelga de esa salida del chip.
// Las salidas van en orden QA a QH, que son las columnas del cable J: 14, 19, 24, 29, 34, 39, 44 y 49.
// El 0 significa que esa salida no tiene silla.
const byte SILLA_EN[N_CHIPS][8] = {
  {14, 13, 12,  6,  5, 11,  4, 10},   // P1
  { 9,  3,  8,  2,  1,  7, 15, 23},   // P2
  {18, 17, 27, 26, 16, 25, 24,  0},   // P3
  {22, 21, 30, 29, 20, 19, 28,  0}    // P4
};

// Orden en que se pintan de morado las sillas y en que las recorre la animación de espera.
// Va fila por fila, empezando por la fila de abajo (la de 6 sillas) y subiendo.
//   ORDEN_NORMAL:    1 a 6, 7 a 14, 15 a 22, 23 a 30
//   ORDEN_INVERTIDO: la misma fila por fila, pero cada fila al revés (6 a 1, 14 a 7, ...)
// Si en la maqueta el recorrido va de derecha a izquierda, ponen INVERTIR_FILAS en true.
const bool INVERTIR_FILAS = false;

const byte ORDEN_NORMAL[N_SILLAS] = {
   1,  2,  3,  4,  5,  6,
   7,  8,  9, 10, 11, 12, 13, 14,
  15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30
};
const byte ORDEN_INVERTIDO[N_SILLAS] = {
   6,  5,  4,  3,  2,  1,
  14, 13, 12, 11, 10,  9,  8,  7,
  22, 21, 20, 19, 18, 17, 16, 15,
  30, 29, 28, 27, 26, 25, 24, 23
};
const byte* ORDEN = INVERTIR_FILAS ? ORDEN_INVERTIDO : ORDEN_NORMAL;

// Animación de espera (cuando no hay nada seleccionado en la página).
// Cada silla se prende sola este tiempo. Para probar el cableado conviene 3000 (3 segundos).
// Para dejarla como animación de espera de verdad, bajen a unos 300.
const unsigned long PASO_ESPERA_MS = 3000;

// true: en cada paso de la animación escribe "Silla N" en el Monitor Serie (9600 baudios).
// Sirve para saber qué número se está probando. Pónganlo en false cuando ya no lo necesiten.
const bool DEPURAR = true;

byte estado[N_CHIPS];            // bit en 1 = amarillo, bit en 0 = morado

bool esperando = true;           // true = animación de espera
bool primerPaso = true;          // para que la primera silla se prenda al tiro
int posEspera = 0;
unsigned long ultimoPaso = 0;

char linea[8];
byte largo = 0;

void setSilla(int n, bool amarillo) {            // n de 1 a 30
  for (int c = 0; c < N_CHIPS; c++) {
    for (int bit = 0; bit < 8; bit++) {
      if (SILLA_EN[c][bit] == n) {
        if (amarillo) estado[c] |= (1 << bit);
        else          estado[c] &= ~(1 << bit);
        return;
      }
    }
  }
}

void todasAmarillas() {
  for (int c = 0; c < N_CHIPS; c++) estado[c] = 0xFF;
}

void mostrar() {
  digitalWrite(LATCH, LOW);
  for (int c = N_CHIPS - 1; c >= 0; c--)
    shiftOut(DATO, RELOJ, MSBFIRST, estado[c]);
  digitalWrite(LATCH, HIGH);
}

void mostrarMujeres(int n) {
  n = constrain(n, 0, N_SILLAS);
  todasAmarillas();
  for (int i = 0; i < n; i++) setSilla(ORDEN[i], false);
  mostrar();
}

void procesarLinea() {
  linea[largo] = '\0';
  if (largo == 0) return;

  if (linea[0] == 'R') {
    esperando = true;
    primerPaso = true;
    posEspera = 0;
    return;
  }

  char* fin;
  long n = strtol(linea, &fin, 10);
  if (fin != linea && *fin == '\0') {
    esperando = false;
    mostrarMujeres((int)n);
  }
}

void setup() {
  pinMode(DATO, OUTPUT);
  pinMode(RELOJ, OUTPUT);
  pinMode(LATCH, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  while (Serial.available() > 0) {
    char c = Serial.read();
    if (c == '\r') continue;
    if (c == '\n') {
      procesarLinea();
      largo = 0;
    } else if (largo < sizeof(linea) - 1) {
      linea[largo++] = c;
    } else {
      largo = 0;                 // línea demasiado larga: se descarta
    }
  }

  if (esperando && (primerPaso || millis() - ultimoPaso >= PASO_ESPERA_MS)) {
    primerPaso = false;
    ultimoPaso = millis();
    todasAmarillas();
    setSilla(ORDEN[posEspera], false);
    mostrar();
    if (DEPURAR) {
      Serial.print("Silla ");
      Serial.println(ORDEN[posEspera]);
    }
    posEspera = (posEspera + 1) % N_SILLAS;
  }
}
