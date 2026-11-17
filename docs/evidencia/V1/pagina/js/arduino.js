const ServoMotor = (() => {
    const ANGULO_MIN = 10;
    const ANGULO_MAX = 170;
    const ANGULO_NEUTRO = 90;
    const DESPLAZAMIENTO = ANGULO_MAX - ANGULO_MIN;

    let puerto = null;

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

    async function abrirPuerto() {
        if (!("serial" in navigator)) {
            return false;
        }

        if (puerto && puerto.readable) {
            return true;
        }

        try {
            puerto = await navigator.serial.requestPort();
            await puerto.open({ baudRate: 9600 });
            return true;
        } catch (error) {
            console.warn("No se pudo abrir el puerto serial del Arduino:", error);
            return false;
        }
    }

    async function conectar() {
        const ok = await abrirPuerto();
        if (ok) {
            resetear();
        }
        return ok;
    }

    async function enviarAngulo(angulo) {
        if (!("serial" in navigator)) {
            return;
        }

        const numero = Math.round(angulo);
        const valido = Math.min(ANGULO_MAX, Math.max(ANGULO_MIN, numero));

        try {
            if (!(await abrirPuerto())) {
                return;
            }

            const escritor = puerto.writable.getWriter();
            const encoder = new TextEncoder();
            await escritor.write(encoder.encode(`${valido}\n`));
            escritor.releaseLock();
        } catch (error) {
            console.warn("No se pudo enviar el ángulo al Arduino:", error);
        }
    }

    function resetear() {
        enviarAngulo(ANGULO_NEUTRO);
    }

    function actualizarDesdePorcentaje(valor) {
        const porcentaje = normalizarPorcentaje(valor);
        enviarAngulo(porcentajeAangulo(porcentaje));
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

    boton.addEventListener("click", async () => {
        if (boton.disabled) return;

        if (!("serial" in navigator)) {
            boton.textContent = "Web Serial no disponible";
            boton.disabled = true;
            boton.setAttribute("aria-disabled", "true");
            return;
        }

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
