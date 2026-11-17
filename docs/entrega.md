# Entrega 2 · Documento de proceso · IIC2026

## 1. Portada

- **Grupo:** N°1
- **Integrantes:** Antonia Ramos · Oriana Crescio · Florencia Godoy
- **GitHub Pages:** https://orianacrescio.github.io/proyecto_visualizacionE2/
- **Repositorio:** https://github.com/OrianaCrescio/proyecto_visualizacionE2
- **Video final (V4):** [pendiente: link de YouTube de la E2]

> YouTube redujo la definición de los videos. Para verlos con mayor nitidez, recomendamos usar las
> copias originales incluidas en el repositorio: [V1](evidencia/V1/V1_balanza_servomotor.mp4) ·
> [V2](evidencia/V2/V2_sala_de_clases_leds.mp4) · [V3](evidencia/V3/V3_sala_leds_pagina_conectada.mp4) ·
> V4 (pendiente). Son los mismos videos.

> La página publicada en GitHub Pages es estática: se puede navegar y conectar el Arduino por USB desde
> Chrome, pero no sincroniza la selección con un teléfono. Esa parte necesita `servidor.py` corriendo en el
> computador (ver el README).

---

## 2. Contexto general del proyecto

### 2.1 Mensaje principal

Las mujeres ya son mayoría en la matrícula de educación superior en Chile: pasaron de 42,7 % en 1984 a
53,3 % en 2025 y cruzaron la paridad en 2008. Pero ese total esconde una segregación por área. En 2026,
Educación tiene 75,2 % de mujeres y Salud 74,5 %, mientras Tecnología llega a 21,1 % (y TIC, dentro de ella,
a 15,1 %). Queremos que estudiantes de enseñanza media que están eligiendo carrera, y quienes diseñan
políticas para impulsar a las mujeres en STEM, vean que la igualdad del total no es igualdad en cada carrera.

En la Entrega 2 el mismo mensaje se puede ver sin leer un gráfico: una sala de clases de cartón con 30 sillas.
Al elegir una región, un área o una carrera en la página, tantas sillas como corresponda al porcentaje de
mujeres se ponen moradas y el resto queda amarillo.

### 2.2 Origen y procesamiento de los datos

- **Regiones:** serie de matrícula por sexo y región, 1984–2025, de la Biblioteca del Congreso Nacional
  (SIIT, estadísticas territoriales). `procesar_regiones.py` la convierte en `matricula_genero_region.csv`.
  El mapa sale de los mapas vectoriales de la BCN (comunas), agrupados en regiones con
  `generar_mapa_regiones.py`.
- **Carreras y áreas:** microdatos de matrícula del Centro de Estudios MINEDUC, 2007–2026, un registro por
  estudiante. Usamos sexo (`gen_alu`), área del conocimiento y carrera genérica, solo pregrado.
  `procesar_carreras.py` los agrega y `resumir_carreras.py` deja `carreras_pregrado.csv`, que es lo que
  carga la página. Los totales por sexo calzan con los de la serie de la BCN (por ejemplo 2015: 592.698
  hombres y 640.345 mujeres en ambas).
- **Proporción:** mujeres / (hombres + mujeres) de lo que esté seleccionado. En la maqueta se redondea al
  entero más cercano de 30 sillas, y solo se muestran 0 o 30 sillas moradas si la proporción es exactamente
  0 o 1. Así una carrera con 99 % de mujeres no se ve igual que una con 100 %.

El detalle de fuentes y variables está en [`investigacion.md`](investigacion.md).

---

## 3. V1 · La idea completa

| Campo | |
|---|---|
| **Versión / fecha** | V1 · 31/10/2026 |
| **Commit / tag** | tag `v1` (commit `6939953`) |
| **Evidencia** | [Página de V1](https://orianacrescio.github.io/proyecto_visualizacionE2/docs/evidencia/V1/pagina/) · [Video](evidencia/V1/V1_balanza_servomotor.mp4) · [cuaderno: la idea](evidencia/V1/V1_cuaderno_idea_balanza.jpg) · [cuaderno: boceto del prototipo](evidencia/V1/V1_cuaderno_boceto_prototipo.jpg) |

**Decisiones iniciales**
- Una balanza de género: un brazo de cartón sobre un soporte en forma de pirámide, con hombres en amarillo
  a un lado y mujeres en morado al otro.
- Un servomotor (Tower Pro MG90S) movido por un Arduino. La página calcula el ángulo desde el porcentaje y
  lo manda por USB (Web Serial): 50 % deja el brazo en 90°, horizontal, y los extremos lo inclinan hasta
  10° o 170°.
- La balanza se inclina hacia el género con mayor representación, y la inclinación es proporcional a la
  diferencia porcentual entre ambos.
- Partir con 3 o 5 escenarios, no con todas las carreras.

**Por qué**
- Queríamos que elegir algo en el computador tuviera una respuesta física inmediata, y la balanza es la
  imagen más conocida del equilibrio entre dos grupos. Calza con el 50 % que ya marca la paridad en la
  visualización.

**Qué se descartó**
- Un brazo de Lego: aparece en el boceto del cuaderno, pero en el video la balanza ya es de cartón forrado
  con cartulina, como también anotamos ahí.

---

## 4. R1 · Revisión con el equipo docente

- **Fecha:** [03/11/2026]
- **Qué se discutió:** cuatro preguntas sobre el prototipo físico.
  1. Cuál es la verdadera diferencia entre la visualización y lo que estamos fisicalizando.
  2. Qué queremos representar que se pueda percibir sin una pantalla.
  3. Pensar en algo que le agregue significado físico.
  4. Cómo mide la balanza, por qué y para qué.
- **Qué adoptamos:** cambiar de balanza a sala de clases. Nuestras respuestas a las preguntas:
  - La balanza solo repetía en un ángulo lo que la pantalla ya muestra con más precisión. Nadie puede leer
    un porcentaje en 20° de inclinación, y no teníamos cómo justificar qué significaba ese ángulo
    (pregunta 4). En la sala cada silla es una persona y se pueden contar.
  - Lo que se percibe sin pantalla es una cantidad: cuántas de 30 sillas están en morado, y si son más, menos
    o la mitad.
  - El significado físico viene del lugar. Una sala de clases es donde ocurre lo que mide la visualización,
    quién se sienta ahí, y los colores de cada silla son los mismos de la página.
- **Qué dejamos en evaluación:** [completar si en la reunión quedó algo abierto]
- **Cómo se ve en V2:** la balanza desaparece y aparece la sala con sillas y LEDs.

---

## 5. V2 · Primera iteración de diseño

| Campo | |
|---|---|
| **Versión / fecha** | V2 · 12/11/2026 |
| **Commit / tag** | tag `v2` (commit `d7638f2`, el del video; la conexión a la maqueta es `b7ac553`) |
| **Evidencia** | [Página de V2](https://orianacrescio.github.io/proyecto_visualizacionE2/docs/evidencia/V2/pagina/) · [Video](evidencia/V2/V2_sala_de_clases_leds.mp4) |

**Qué cambió respecto a V1**
- La balanza y el servomotor se reemplazan por una sala de cartón con 30 sillas. Cada silla es un cubo de
  3 × 3 cm con dos LED blancos tapados por celofán, uno amarillo (hombres) y uno morado (mujeres).
- Un Arduino Leonardo con chips 74HC595 prende los LED. La página manda por USB cuántas sillas deben quedar
  moradas, y el resto se queda en amarillo.
- `arduino.js` ahora habla con `SalaLEDs.ino` en vez del servo (el sketch de la balanza sigue en
  `arduino/Infovis/`).
- Una silla usa una sola resistencia de 330 Ω para sus dos LED, que van en polaridad opuesta: según el
  nivel de la salida del chip prende uno u otro.

**Por qué**
- Es la respuesta a R1. Con sillas, el porcentaje se puede contar y no hay que interpretar un ángulo.
- Dos colores por silla mantienen la lectura de la página (amarillo hombres, morado mujeres), así no hay que
  aprender otra leyenda.
- Cada silla vale 3,3 puntos porcentuales. Alcanza para distinguir áreas que están a 20 o más puntos de
  distancia, que es la diferencia que queremos mostrar.

**Qué se descartó**
- Sillas que suben o bajan: eran 30 actuadores, mucho más caro y difícil de armar.
- Una tira de LED direccionables (WS2812B), que simplificaba el cableado pero no tenía el efecto del
  celofán sobre la silla. Seguimos con la opción de 60 LED.
- Escanear carreras con un QR en la pizarra de la maqueta, que era parte de la idea original. Queda para
  después.

---

## 6. R2 · Revisión entre pares

- **Fecha / grupo que nos revisó:** 12/11/2026, Grupo 10. Nosotras revisamos al mismo grupo.
- **Qué se discutió (lo que nos dijeron):**
  - *Mensaje:* entendieron que la visualización sigue siendo la proporción de mujeres en las carreras
    universitarias a lo largo de los años, a nivel país y por carrera.
  - *Lo físico:* lo leyeron como una sala de clases donde cada silla tiene LED que representan la
    distribución de hombres y mujeres según una categoría (región, carrera), y las luces cambian con lo que
    muestra la página.
  - *Usarlo:* basta con navegar por la página; el prototipo cambia solo.
  - *Lo que funciona:* las mejoras de contraste de la página (achurados, colores) y la sala con luces
    intercambiables, "clave para mostrar rápidamente las distribuciones".
  - *Cambios que propusieron:* (1) un menú seleccionable en el celular, integrado al prototipo, a modo de
    tótem informativo; (2) botones físicos o accesos rápidos para mostrar momentos históricos de los avances
    de las mujeres en educación superior.
- **Qué adoptamos:** el cambio 1. El teléfono pasó a ser el control de la selección (ver V3).
- **Qué descartamos:** el cambio 2, los botones de hitos históricos, al menos en la maqueta. Lo dejamos fuera
  de V3 y lo conversamos con el equipo docente en R3 (sección 8), que nos dijo que no hacía falta.
- **Cómo se ve en V3 y V4:** el teléfono controla la sala desde V3. En V4 la selección pasa a una pizarra
  en la maqueta (sección 9).
- **Feedback que dimos al Grupo 10:** en la sección 11.

---

## 7. V3 · Segunda iteración de diseño

| Campo | |
|---|---|
| **Versión / fecha** | V3 · 17/11/2026 |
| **Commit / tag** | tag `v3` (commit `8e280dc`, el de la evidencia; el control desde el teléfono es `0d0790f` y el cableado `381870f`) |
| **Evidencia** | [Página de V3](https://orianacrescio.github.io/proyecto_visualizacionE2/docs/evidencia/V3/pagina/) · [Video](evidencia/V3/V3_sala_leds_pagina_conectada.mp4) |

**Qué cambió respecto a V2**
- Se puede elegir región, área o carrera desde un teléfono: la página muestra un QR, el teléfono abre la
  misma página en la red local y `servidor.py` sincroniza la selección entre los dispositivos.
- La página suma selectores de región, área y carrera, que se usan desde el teléfono o desde el computador.
- El cableado se reorganizó: 4 protoboards, cada una con un chip 74HC595, en cadena desde tres pines del
  Arduino Leonardo. Cada silla tiene su salida; el mapa real está en `arduino/SalaLEDs/README_conexiones.md`.
- Cuando no hay nada seleccionado, una silla morada recorre la sala. Así no se confunde el estado de espera
  con un dato.
- La página funciona también sin servidor (por ejemplo en GitHub Pages): oculta el QR y avisa que está en
  modo sin servidor.

**Por qué**
- El teléfono como menú sale de R2 (cambio 1). Además, quien mira la sala puede elegir sin acercarse al
  computador, y la sala queda como lo principal de la mesa.
- Con los chips en cadena, 30 sillas y 60 LED salen de solo tres pines del Arduino, y la cantidad de pines
  no crece con el número de sillas.
- La animación de espera responde a que una sala con sillas moradas al azar se leía como un porcentaje.

**Qué se descartó**
- Los botones físicos de hitos históricos (cambio 2 de R2), por ahora.
- Escanear un QR por carrera en la maqueta: el teléfono controla la selección, pero la interacción desde la
  propia maqueta queda para V4 (pizarra con código ArUco, sección 9).

---

## 8. R3 · Revisión final con el equipo docente

- **Fecha:** 17/11/2026
- **Qué se discutió:**
  - Quedaron sorprendidos con el avance. Hablamos de que nos complicamos bastante armando el prototipo, y
    les gustó la idea.
  - Les contamos nuestra idea de poner en la maqueta una pizarra con la carrera y un código ArUco, para que
    la interacción con la sala no dependa tanto de la visualización en el computador. Les pareció buena.
  - Preguntaron por qué morado y amarillo, y dijeron que eso no se entiende bien: sugirieron una leyenda.
    También sugirieron poner, en alguna parte, la pregunta que dice qué se está viendo en la visualización.
  - Conversamos si sería útil mostrar en el celular o en el computador el porcentaje de mujeres en cada
    cambio de luces.
  - Les contamos lo que propuso el Grupo 10 en R2 sobre hechos históricos. Respondieron que no era necesario:
    ya hay mucha información, y en la maqueta podría marear más. Quizás sí en la visualización virtual.
- **Qué decidimos:** para V4 vamos a hacer tres cosas.
  1. Que el botón de play de la línea de tiempo vaya cambiando los LED según lo seleccionado, sea una
     carrera, una región o el país.
  2. "Cerrar" la sala de clases con una pizarra que lleve el nombre de lo que se está viendo (una carrera en
     específico), y por el otro lado un código ArUco que se pueda mover para elegir el año y ver el
     porcentaje o la distribución de mujeres y hombres.
  3. Agregar una leyenda que diga que morado son mujeres y amarillo son hombres.
- **Qué dejamos en evaluación:** la pregunta que explica qué se está viendo y el porcentaje en pantalla junto
  con el cambio de luces. La pizarra con el nombre cubre parte de lo primero, y tenemos que ver si alcanza.
- **Qué descartamos:** los hitos históricos en la maqueta. Podrían ir en la visualización del computador.
- **Cómo se ve en V4:** ver sección 9.

---

## 9. V4 · La versión final

| Campo | |
|---|---|
| **Versión / fecha** | V4 · [pendiente] |
| **Commit / tag** | [pendiente] |
| **Evidencia** | [pendiente] |

**Qué cambia respecto a V3** (plan decidido en R3; falta construirlo)
- Play en la línea de tiempo: los LED cambian año a año con lo que esté seleccionado.
- Sala cerrada con una pizarra: de un lado el nombre de la carrera que se ve, del otro un código ArUco que
  se mueve para elegir el año.
- Leyenda: morado mujeres, amarillo hombres.

**Por qué**
- Con V3 las luces mostraban una foto fija de la selección. El mensaje de la visualización incluye el
  tiempo (1984–2025 en regiones, 2007–2026 en carreras), y la maqueta no lo mostraba.
- La pizarra y el ArUco salen de la pregunta de cómo interactuar con la sala sin mirar el computador. Es la
  idea del QR por carrera de V2, ahora con un objeto que se maneja con la mano.
- Los docentes no entendían por qué morado y amarillo. Una leyenda lo dice sin que haya que explicarlo.

**Qué se descartó**
- Hitos históricos en la maqueta (ver R3).

**Balance del recorrido**
- [Pendiente.]

---

## 10. Evaluación con usuarios

| Ronda | Fecha | Versión | Participantes | Registro |
|---|---|---|---|---|
| 1 | [completar] | V3 | [completar] | [ronda_1.md](evaluacion_usuarios/ronda_1.md) |

**Ronda 1 (V3).** Thinking aloud de ~10 minutos con la sala y la página, sin explicarles nada. Hallazgos:
- Color: [completar con lo observado, con cita y minuto.]
- Contexto: [completar.]
- Interacción: [completar.]
- Sonido: [completar.]
- Lo que funcionó: [completar.]

**Efecto (V3 → V4):** [completar: qué cambio de V4 viene de esta ronda y cuál de R3.] Lo que no
incorporamos, con su motivo, está en `ronda_1.md`.

---

## 11. Feedback al otro grupo (R2)

**El proyecto evaluado:** Grupo 10. Su prototipo mide el salto de una persona con el celular sujeto a una tobillera y compara la altura y la
velocidad con las que saltaría en otros planetas. Lo probamos el 12/11/2026. Se entra escaneando un QR con el
teléfono, se conecta el sensor, se elige "saltar" y se ve el resultado en el computador.

**El feedback que dimos:**
- Conservar la interacción del salto: vivirlo en el cuerpo y ver los saltos propios hace el mensaje más
  memorable, y entrega el dato de una persona concreta en vez de un promedio.
- Cambiar el botón "saltar": hay que apretarlo y el análisis empieza a los 3 segundos, así que se aprieta muy
  rápido, mirando el aparato del tobillo, y se cometen errores simples. Propusimos detectar el salto
  automáticamente.
- Se pierde poder ver la altura en el celular y comparar con otros planetas sin pasar al computador, y no se
  pueden ver todos los planetas a la vez con nuestro salto como referencia.

**Lo que nos llevamos para nuestro proyecto:**
- [Completar: errores de ellos que reconocimos en el nuestro, ideas que adaptamos (citando al Grupo 10) y
  decisiones nuestras que salieron confirmadas.]

---

## 12. Comentarios finales

[Pendiente.]
