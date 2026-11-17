# Sala de clases con LEDs: conexiones (como quedó armada)

Esta guía sirve para armar y revisar las 4 protoboards de la sala. Cada cable y cada componente tiene una coordenada, así que se puede seguir sin interpretar un dibujo.

Cada silla tiene dos LEDs blancos, uno bajo celofán amarillo (hombres) y otro bajo celofán morado (mujeres). Un chip 74HC595 decide cuál de los dos se prende: salida en HIGH prende el amarillo y salida en LOW prende el morado. Con 30 sillas se necesitan 4 chips, uno por protoboard.

La numeración de las sillas y su reparto entre placas es el que quedó armado de verdad, tomado de las fotos de la maqueta. No es el reparto sencillo 1 a 8, 9 a 16 y así que se planeó al principio. El sketch `SalaLEDs.ino` usa esta misma tabla.

## 1. Cómo leer las coordenadas

Un hueco se nombra con su fila (letra) y su columna (número). Por ejemplo, `g14` es la fila g, columna 14. Para nombrar un hueco de otra placa se antepone la placa: `P2:g14`.

- Las columnas van de 1 a 63, de izquierda a derecha, con el 1 a la izquierda.
- Las filas a, b, c, d, e quedan abajo (hacia ustedes). Las filas f, g, h, i, j quedan arriba.
- Dentro de una columna, los cinco huecos de abajo (a a e) están conectados entre sí, y los cinco de arriba (f a j) también. Abajo y arriba no están conectados: los separa el canal central.
- Giren cada protoboard hasta que quede así. En la foto de las placas no todas estaban giradas igual.

### Rieles

Los rieles de estas placas están partidos a la mitad. Para no tener que unir las mitades, solo se usa la mitad izquierda de los dos rieles de arriba, los que están pegados a las filas f a j.

| Nombre | Qué es |
|---|---|
| `S+` | Riel de arriba marcado con + (línea roja), mitad izquierda. Lleva 5 V. |
| `S−` | Riel de arriba marcado con − (línea azul), mitad izquierda. Es GND. |

No se guíen por cuál riel queda más cerca del borde, porque en algunas placas el orden rojo y azul está invertido. Fíjense en el + y el − impresos en la punta de cada placa. Los rieles de abajo no se usan.

## 2. Qué silla va en cada placa

Cada fila es una placa y cada columna es el hueco donde entra el cable J de la silla (`g14`, `g19`, etc.). La salida del chip y la resistencia de esa columna son las mismas en las 4 placas.

| | g14 | g19 | g24 | g29 | g34 | g39 | g44 | g49 |
|---|---|---|---|---|---|---|---|---|
| Salida del chip | QA | QB | QC | QD | QE | QF | QG | QH |
| Resistencia | h10 a h14 | h15 a h19 | h20 a h24 | h25 a h29 | h30 a h34 | h35 a h39 | h40 a h44 | h45 a h49 |
| P1 | 14 | 13 | 12 | 6 | 5 | 11 | 4 | 10 |
| P2 | 9 | 3 | 8 | 2 | 1 | 7 | 15 | 23 |
| P3 | 18 | 17 | 27 | 26 | 16 | 25 | 24 | sin silla |
| P4 | 22 | 21 | 30 | 29 | 20 | 19 | 28 | sin silla |

En P3 y P4 la salida QH queda sin conectar. En P1 y P2 se usan las 8 salidas.

## 3. El chip 74HC595 (igual en las 4 placas)

El chip cruza el canal central con la muesca hacia la izquierda. Los pines de abajo van en la fila e, columnas 1 a 8, y los de arriba en la fila f, columnas 1 a 8. El pin 1 va en `e1`.

```
columna     1     2     3     4     5     6     7     8
fila f     16    15    14    13    12    11    10     9
          VCC    QA   SER    OE  RCLK SRCLK SRCLR   QH'
        ------------ canal central, el chip cruza -----
fila e      1     2     3     4     5     6     7     8
           QB    QC    QD    QE    QF    QG    QH   GND
```

Antes de conectar nada, revisen la orientación: la marca del chip (la muesca o el punto del pin 1) tiene que quedar hacia la columna 1. Si el chip queda girado 180°, el 5 V llega al pin 8 y el GND al pin 16, el chip se calienta y no responde.

Cada pin tiene su cable. Los de arriba salen desde un hueco libre de la fila g (misma columna del pin). Los de abajo salen desde un hueco libre de la fila d.

| Pin | Nombre | Hueco | Cable |
|---|---|---|---|
| 16 | VCC | `f1` | `g1` a `S+` |
| 15 | QA | `f2` | `g2` a `g10` (silla de la salida QA) |
| 14 | SER (datos) | `f3` | `g3` a datos (sección 5) |
| 13 | OE | `f4` | `g4` a `S−` |
| 12 | RCLK (latch) | `f5` | `g5` a latch (sección 5) |
| 11 | SRCLK (reloj) | `f6` | `g6` a reloj (sección 5) |
| 10 | SRCLR | `f7` | `g7` a `S+` |
| 9 | QH' | `f8` | `g8` al `g3` de la placa siguiente (en P4 queda libre) |
| 1 | QB | `e1` | `d1` a `g15` |
| 2 | QC | `e2` | `d2` a `g20` |
| 3 | QD | `e3` | `d3` a `g25` |
| 4 | QE | `e4` | `d4` a `g30` |
| 5 | QF | `e5` | `d5` a `g35` |
| 6 | QG | `e6` | `d6` a `g40` |
| 7 | QH | `e7` | `d7` a `g45` (solo P1 y P2) |
| 8 | GND | `e8` | `d8` a `S−` (el cable pasa por encima del chip; va en `d8`, no en `e8`, que ya está ocupado por el pin) |

Los pines 10 y 13 (`g7` a `S+` y `g4` a `S−`) son los que más se olvidan. Sin ellos el chip no hace nada.

Condensadores:

- 100 nF en cada placa, entre `S+` y `S−`, lo más cerca posible del chip (columnas 1 a 4). Sin polaridad.
- 470 µF solo en P1, entre `S+` y `S−`. La pata larga va a `S+` y la pata con franja a `S−`. Si lo ponen al revés se puede inflar.

## 4. Alimentación entre placas

| Desde | Hasta | Para qué |
|---|---|---|
| Arduino 5V | `P1:S+` | Alimentación (el pin 5V, no el 3V3 ni VIN) |
| Arduino GND | `P1:S−` | Tierra |
| `P1:S+` | `P2:S+`, `P3:S+`, `P4:S+` | Un cable desde P1 a cada una |
| `P1:S−` | `P2:S−`, `P3:S−`, `P4:S−` | Un cable desde P1 a cada una |

## 5. Cables de señal

En cada placa el reloj entra por `g6` y el latch por `g5`. Para pasarlos a la siguiente se usa el hueco `h` de la misma columna, que está conectado al `g`.

| Desde | Hasta | Señal |
|---|---|---|
| Arduino pin 8 | `P1:g3` | Datos |
| Arduino pin 9 | `P1:g6` | Reloj |
| Arduino pin 10 | `P1:g5` | Latch |
| `P1:g8` | `P2:g3` | Datos de chip 1 a chip 2 |
| `P2:g8` | `P3:g3` | Datos de chip 2 a chip 3 |
| `P3:g8` | `P4:g3` | Datos de chip 3 a chip 4 |
| `P1:h6` | `P2:g6` | Reloj |
| `P2:h6` | `P3:g6` | Reloj |
| `P3:h6` | `P4:g6` | Reloj |
| `P1:h5` | `P2:g5` | Latch |
| `P2:h5` | `P3:g5` | Latch |
| `P3:h5` | `P4:g5` | Latch |

## 6. Cada silla: lo que va en la protoboard

Cada silla usa una resistencia de 330 Ω entre dos huecos de la fila h, separados por 4 columnas. La salida del chip llega al primer extremo y el cable que va a los LEDs (cable J) sale del segundo. Esta tabla es igual en las 4 placas.

| Salida | Cable del chip | Resistencia | Cable J |
|---|---|---|---|
| QA (pin 15) | `g2` a `g10` | `h10` a `h14` | `g14` |
| QB (pin 1) | `d1` a `g15` | `h15` a `h19` | `g19` |
| QC (pin 2) | `d2` a `g20` | `h20` a `h24` | `g24` |
| QD (pin 3) | `d3` a `g25` | `h25` a `h29` | `g29` |
| QE (pin 4) | `d4` a `g30` | `h30` a `h34` | `g34` |
| QF (pin 5) | `d5` a `g35` | `h35` a `h39` | `g39` |
| QG (pin 6) | `d6` a `g40` | `h40` a `h44` | `g44` |
| QH (pin 7) | `d7` a `g45` | `h45` a `h49` | `g49` |

Cuando la salida está en HIGH, la corriente pasa por la resistencia y prende el LED amarillo. Cuando está en LOW, pasa en sentido contrario y prende el morado. Nunca hay dos LEDs prendidos a la vez.

## 7. Cada silla: lo que va dentro del cubo

Cada silla tiene 3 cables hembra-macho que bajan por su hoyo del piso. Marquen los tres con el número de la silla.

| Cable | Lado hembra | Lado macho |
|---|---|---|
| 5V (rojo) | pata larga del LED morado | un hueco libre de `S+` |
| J | pata corta del LED morado y pata larga del LED amarillo, torcidas juntas | `g(B)` de su columna (sección 2) |
| GND (negro) | pata corta del LED amarillo | un hueco libre de `S−` |

Los dos LEDs son blancos. El color lo da el celofán. La pata larga es el positivo. Un LED al revés no se prende, pero tampoco se daña.

Dentro del cubo va una tabiquería de cartulina negra entre las dos mitades del celofán, para que la luz de un LED no se mezcle con la del otro.

## 8. Plano de la maqueta y las 30 sillas

Así quedó numerada la maqueta en el dibujo (8 columnas y 4 filas, la última fila con 6 sillas):

```
fila 1:   30  29  28  27  26  25  24  23
fila 2:   22  21  20  19  18  17  16  15
fila 3:   14  13  12  11  10   9   8   7
fila 4:    .   .   6   5   4   3   2   1
```

En la foto de la maqueta la fila de 6 sillas queda abajo a la izquierda, y en el dibujo queda abajo a la derecha. Si el dibujo está hecho viendo la maqueta desde abajo, está bien. Si no, el plano está en espejo y conviene decidir cuál de los dos vale antes de seguir. El cableado no cambia, pero sí cambia si el morado se llena de izquierda a derecha o de derecha a izquierda.

Tabla ordenada por número de silla:

| Silla | Placa | Salida | Cable J | Resistencia |
|---|---|---|---|---|
| 1 | P2 | QE | `P2:g34` | `h30` a `h34` |
| 2 | P2 | QD | `P2:g29` | `h25` a `h29` |
| 3 | P2 | QB | `P2:g19` | `h15` a `h19` |
| 4 | P1 | QG | `P1:g44` | `h40` a `h44` |
| 5 | P1 | QE | `P1:g34` | `h30` a `h34` |
| 6 | P1 | QD | `P1:g29` | `h25` a `h29` |
| 7 | P2 | QF | `P2:g39` | `h35` a `h39` |
| 8 | P2 | QC | `P2:g24` | `h20` a `h24` |
| 9 | P2 | QA | `P2:g14` | `h10` a `h14` |
| 10 | P1 | QH | `P1:g49` | `h45` a `h49` |
| 11 | P1 | QF | `P1:g39` | `h35` a `h39` |
| 12 | P1 | QC | `P1:g24` | `h20` a `h24` |
| 13 | P1 | QB | `P1:g19` | `h15` a `h19` |
| 14 | P1 | QA | `P1:g14` | `h10` a `h14` |
| 15 | P2 | QG | `P2:g44` | `h40` a `h44` |
| 16 | P3 | QE | `P3:g34` | `h30` a `h34` |
| 17 | P3 | QB | `P3:g19` | `h15` a `h19` |
| 18 | P3 | QA | `P3:g14` | `h10` a `h14` |
| 19 | P4 | QF | `P4:g39` | `h35` a `h39` |
| 20 | P4 | QE | `P4:g34` | `h30` a `h34` |
| 21 | P4 | QB | `P4:g19` | `h15` a `h19` |
| 22 | P4 | QA | `P4:g14` | `h10` a `h14` |
| 23 | P2 | QH | `P2:g49` | `h45` a `h49` |
| 24 | P3 | QG | `P3:g44` | `h40` a `h44` |
| 25 | P3 | QF | `P3:g39` | `h35` a `h39` |
| 26 | P3 | QD | `P3:g29` | `h25` a `h29` |
| 27 | P3 | QC | `P3:g24` | `h20` a `h24` |
| 28 | P4 | QG | `P4:g44` | `h40` a `h44` |
| 29 | P4 | QD | `P4:g29` | `h25` a `h29` |
| 30 | P4 | QC | `P4:g24` | `h20` a `h24` |

## 9. Cables y componentes en total

| Qué | Cantidad | Detalle |
|---|---|---|
| Jumpers macho-macho | 66 | 46 en las placas (4 de alimentación del chip por placa y 1 por silla), 12 de señal y 8 de alimentación entre placas y Arduino |
| Jumpers hembra-macho | 90 | 3 por silla (5V, J y GND), que bajan por el hoyo del piso |
| Resistencias 330 Ω | 30 | Una por silla, y unas 5 de repuesto |
| Chips 74HC595 | 4 | Uno por placa |
| Condensadores 100 nF | 4 | Uno por placa |
| Condensador 470 µF | 1 | Solo en la P1 |
| LEDs blancos | 60 | Dos por silla, y unos pocos de repuesto |

## 10. Pruebas, en este orden

**1. Colores.** Suban el código de abajo. Las 30 sillas deben quedar amarillas 10 segundos y moradas otros 10. Una silla que no cambia tiene mal el cable J, la resistencia o los LEDs. Una que queda siempre del mismo color suele tener un LED al revés.

**2. Orden.** Suban `SalaLEDs.ino` y no abran todavía la página. Una silla morada debería ir recorriendo la maqueta de la 1 a la 30, siguiendo el plano de la sección 8. Si alguna se prende fuera de orden, su cable J está en otra columna: compárenlo con la tabla de la sección 8.

**3. Página.** Cierren el IDE, abran la página y conecten el Arduino. Con Ingeniería en Electricidad (6,3 % de mujeres) deben quedar moradas 2 sillas, la 1 y la 2. Con 6 sillas moradas queda completa la fila de abajo.

### Código de prueba de colores

```cpp
const int DATO = 8, RELOJ = 9, LATCH = 10;
const int N_CHIPS = 4;
byte estado[N_CHIPS];

void mostrar() {
  digitalWrite(LATCH, LOW);
  for (int c = N_CHIPS - 1; c >= 0; c--)
    shiftOut(DATO, RELOJ, MSBFIRST, estado[c]);
  digitalWrite(LATCH, HIGH);
}

void setup() {
  pinMode(DATO, OUTPUT);
  pinMode(RELOJ, OUTPUT);
  pinMode(LATCH, OUTPUT);
}

void loop() {
  for (int c = 0; c < N_CHIPS; c++) estado[c] = 0xFF;  // todas amarillas
  mostrar(); delay(10000);
  for (int c = 0; c < N_CHIPS; c++) estado[c] = 0x00;  // todas moradas
  mostrar(); delay(10000);
}
```
