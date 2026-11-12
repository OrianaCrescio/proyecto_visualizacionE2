// Sala de clases con LEDs: 30 sillas, 4 chips 74HC595 en cadena.
// La página manda por USB una línea de texto:
//   "12"  -> 12 sillas moradas (mujeres) y el resto amarillas (hombres)
//   "R"   -> sin selección: una silla morada recorre la sala, para que no se lea como un dato

const int DATO = 8, RELOJ = 9, LATCH = 10;
const int N_CHIPS = 4;
const int N_SILLAS = 30;
const int OFFSET[N_CHIPS] = {0, 8, 16, 23};   // primera silla de cada placa, contando desde 0

// Orden en que se pintan de morado las sillas (número de silla, de 1 a 30).
// Así, las primeras filas del fondo se llenan primero. Si quieren que queden
// repartidas por la sala, cambien el orden de esta lista.
const byte ORDEN[N_SILLAS] = {
   1,  2,  3,  4,  5,  6,  7,  8,  9, 10,
  11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  21, 22, 23, 24, 25, 26, 27, 28, 29, 30
};

byte estado[N_CHIPS];            // bit en 1 = amarillo, bit en 0 = morado

bool esperando = true;           // true = animación de espera
int posEspera = 0;
unsigned long ultimoPaso = 0;

char linea[8];
byte largo = 0;

void setSilla(int n, bool amarillo) {            // n de 1 a 30
  int c = N_CHIPS - 1;
  while (n - 1 < OFFSET[c]) c--;
  int bit = (n - 1) - OFFSET[c];
  if (amarillo) estado[c] |= (1 << bit);
  else          estado[c] &= ~(1 << bit);
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

  if (esperando && millis() - ultimoPaso > 150) {
    ultimoPaso = millis();
    todasAmarillas();
    setSilla(ORDEN[posEspera], false);
    mostrar();
    posEspera = (posEspera + 1) % N_SILLAS;
  }
}
