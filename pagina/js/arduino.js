const ServoMotor = (() => {
    const ANGULO_MIN = 10;
    const ANGULO_MAX = 170;
    const ANGULO_NEUTRO = 90;
    const DESPLAZAMIENTO = ANGULO_MAX - ANGULO_MIN;

    let puerto = null;
    let abriendo = null;              // evita abrir el puerto dos veces a la vez
    let colaEnvios = Promise.resolve(); // los envíos van de a uno

    function normalizarPorcentaje(valor) {
        const numero = Number(valor);
        if (!Number.isFinite(numero)) return 0.5;
        return Math.min(1, Math.max(0, numero));
    }

    function porcentajeAangulo(valor) {
        const porcentaje = normalizarPorcentaje(valor);
        const angulo = ANGULO_NEUTRO + (porcentaje - 0.5) * DESPLAZAMIENTO;
        return Math.round(Math.min(ANGULO_MAX, Math.max(ANGULO_MIN, angulo)));
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

    // Solo se llama desde el clic del botón (Chrome exige un gesto del usuario).
    async function conectar() {
        if (!("serial" in navigator)) return false;
        if (estaConectado()) return true;
        try {
            const elegido = await navigator.serial.requestPort();
            const ok = await abrir(elegido);
            if (ok) resetear();
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
        if (ok) resetear();
        return ok;
    }

    function enviarAngulo(angulo) {
        // Si no hay conexión, no hace nada (ya no intenta abrir el selector).
        if (!estaConectado()) return;

        const valido = Math.min(ANGULO_MAX, Math.max(ANGULO_MIN, Math.round(angulo)));

        colaEnvios = colaEnvios.then(async () => {
            if (!estaConectado()) return;
            const escritor = puerto.writable.getWriter();
            try {
                await escritor.write(new TextEncoder().encode(`${valido}\n`));
            } catch (error) {
                console.warn("No se pudo enviar el ángulo al Arduino:", error);
            } finally {
                escritor.releaseLock();
            }
        });
    }

    function resetear() {
        enviarAngulo(ANGULO_NEUTRO);
    }

    function actualizarDesdePorcentaje(valor) {
        enviarAngulo(porcentajeAangulo(valor));
    }

    window.addEventListener("beforeunload", () => {
        if (puerto && puerto.close) {
            puerto.close().catch(() => {});
        }
    });

    return {
        ANGULO_MIN,
        ANGULO_MAX,
        ANGULO_NEUTRO,
        conectar,
        reconectarAutorizado,
        estaConectado,
        resetear,
        actualizarDesdePorcentaje,
        porcentajeAangulo,
    };
})();

window.ServoMotor = ServoMotor;

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
    ServoMotor.reconectarAutorizado().then((ok) => {
        if (ok) marcarComoConectado();
    });

    boton.addEventListener("click", async () => {
        if (boton.disabled) return;

        const conectado = await ServoMotor.conectar();
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
