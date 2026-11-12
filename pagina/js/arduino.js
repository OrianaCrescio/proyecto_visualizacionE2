// Conexión con la sala de LEDs por Web Serial.
// La página manda una línea de texto por USB:
//   "12"  -> 12 de las 30 sillas en morado (mujeres), el resto en amarillo
//   "R"   -> sin selección (el Arduino muestra la animación de espera)
// El resto del código sigue llamando a ServoMotor.actualizarDesdePorcentaje()
// y ServoMotor.resetear(); ese nombre quedó como alias de SalaLEDs.

const SalaLEDs = (() => {
    const N_SILLAS = 30;

    let puerto = null;
    let abriendo = null;                // evita abrir el puerto dos veces a la vez
    let colaEnvios = Promise.resolve(); // los envíos van de a uno
    let ultimaOrden = "R";              // lo último que pidió la página
    let ultimaEnviada = null;           // lo último que recibió el Arduino

    // Pasa una proporción (0 a 1) a número de sillas moradas.
    // Se redondea a la silla más cercana (1 silla = 3,3 %), pero una proporción
    // distinta de 0 y de 1 nunca queda en 0 ni en 30 sillas, para no mostrar
    // "ninguna mujer" o "ningún hombre" cuando sí los hay.
    function porcentajeASillas(valor) {
        const p = Number(valor);
        if (!Number.isFinite(p)) return null;
        const prop = Math.min(1, Math.max(0, p));
        let n = Math.round(prop * N_SILLAS);
        if (prop > 0 && n === 0) n = 1;
        if (prop < 1 && n === N_SILLAS) n = N_SILLAS - 1;
        return n;
    }

    function estaConectado() {
        return Boolean(puerto && puerto.writable);
    }

    async function abrir(p) {
        if (abriendo) return abriendo;
        abriendo = (async () => {
            try {
                if (!p.writable) {
                    await p.open({ baudRate: 9600 });
                }
                puerto = p;
                return true;
            } catch (error) {
                console.warn("No se pudo abrir el puerto serial del Arduino:", error);
                puerto = null;
                return false;
            } finally {
                abriendo = null;
            }
        })();
        return abriendo;
    }

    function enviar(orden) {
        ultimaOrden = orden;
        if (!estaConectado()) return;
        if (orden === ultimaEnviada) return;   // no repite lo que el Arduino ya tiene
        ultimaEnviada = orden;                 // se marca al encolar, así no se duplican envíos seguidos

        colaEnvios = colaEnvios.then(async () => {
            if (!estaConectado()) {
                ultimaEnviada = null;
                return;
            }
            const escritor = puerto.writable.getWriter();
            try {
                await escritor.write(new TextEncoder().encode(`${orden}\n`));
            } catch (error) {
                ultimaEnviada = null;          // falló: la próxima vez se vuelve a intentar
                console.warn("No se pudo enviar al Arduino:", error);
            } finally {
                escritor.releaseLock();
            }
        });
    }

    // Después de conectar, el Arduino recibe lo que la página ya tenía seleccionado.
    function sincronizar() {
        ultimaEnviada = null;
        enviar(ultimaOrden);
    }

    // Solo se llama desde el clic del botón (Chrome exige un gesto del usuario).
    async function conectar() {
        if (!("serial" in navigator)) return false;
        if (estaConectado()) return true;
        try {
            const elegido = await navigator.serial.requestPort();
            const ok = await abrir(elegido);
            if (ok) sincronizar();
            return ok;
        } catch (error) {
            console.warn("No se eligió un puerto:", error);
            return false;
        }
    }

    // Reconecta sin preguntar a un puerto que ya autorizaste antes.
    async function reconectarAutorizado() {
        if (!("serial" in navigator)) return false;
        const puertos = await navigator.serial.getPorts();
        if (puertos.length === 0) return false;
        const ok = await abrir(puertos[0]);
        if (ok) sincronizar();
        return ok;
    }

    function resetear() {
        enviar("R");
    }

    function actualizarDesdePorcentaje(valor) {
        const n = porcentajeASillas(valor);
        if (n === null) {
            resetear();
        } else {
            enviar(String(n));
        }
    }

    window.addEventListener("beforeunload", () => {
        if (puerto && puerto.close) {
            puerto.close().catch(() => {});
        }
    });

    return {
        N_SILLAS,
        conectar,
        reconectarAutorizado,
        estaConectado,
        resetear,
        actualizarDesdePorcentaje,
        porcentajeASillas,
    };
})();

window.SalaLEDs = SalaLEDs;
window.ServoMotor = SalaLEDs;   // alias: el resto de la página sigue usando este nombre

window.addEventListener("DOMContentLoaded", () => {
    const boton = document.getElementById("connect-arduino");
    if (!boton) return;

    const marcarComoConectado = () => {
        boton.disabled = true;
        boton.setAttribute("aria-disabled", "true");
        boton.classList.add("connected");
        boton.textContent = "Arduino conectado";
    };

    if (!("serial" in navigator)) {
        boton.textContent = "Web Serial no disponible";
        boton.disabled = true;
        boton.setAttribute("aria-disabled", "true");
        return;
    }

    // Al recargar la página, intenta reconectar solo si ya diste permiso antes.
    SalaLEDs.reconectarAutorizado().then((ok) => {
        if (ok) marcarComoConectado();
    });

    boton.addEventListener("click", async () => {
        if (boton.disabled) return;

        const conectado = await SalaLEDs.conectar();
        if (conectado) {
            marcarComoConectado();
            return;
        }

        boton.textContent = "No se pudo conectar";
        boton.disabled = false;
        boton.setAttribute("aria-disabled", "false");
        boton.classList.remove("connected");
    });
});
