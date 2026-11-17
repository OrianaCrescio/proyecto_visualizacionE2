// Sincroniza las selecciones de los dispositivos conectados a la misma sala.
(() => {
    const parametros = new URLSearchParams(location.search);
    const sala = parametros.get("room") || "sala";
    const selectorRegion = document.querySelector("#selector-region");
    const selectorArea = document.querySelector("#selector-area");
    const selectorCarrera = document.querySelector("#selector-carrera");
    const estado = document.querySelector("#estado-sincronizacion");
    const ayudaQr = document.querySelector("#qr-ayuda");
    const botonSonido = document.querySelector("#activar-sonido");

    let revision = 0;
    let seleccionActual = null;
    let carrerasListas = Boolean(window.VisualizacionCarreras);
    let regionesListas = Boolean(window.VisualizacionRegiones);
    let enviosPendientes = Promise.resolve();
    let sincronizacionIniciada = false;
    // En GitHub Pages (o sin servidor.py) no existe /api: la página sigue funcionando sola.
    let sinServidor = false;

    function mostrarEstado(mensaje, error = false) {
        estado.textContent = mensaje;
        estado.classList.toggle("error", error);
    }

    function agregarOpciones(select, opciones, textoInicial) {
        select.replaceChildren(new Option(textoInicial, ""));
        opciones.forEach(valor => select.add(new Option(valor, valor)));
    }

    function actualizarCarreras(area) {
        const catalogo = window.VisualizacionCarreras.catalogo();
        const opciones = area ? catalogo.carreras(area) : [];
        agregarOpciones(selectorCarrera, opciones, area ? "Selecciona una carrera" : "Selecciona un área primero");
        selectorCarrera.disabled = !area;
    }

    function reflejarEnArduino(datos) {
        if (!datos) {
            SalaLEDs.resetear();
            return;
        }

        const total = datos.hombres + datos.mujeres;
        SalaLEDs.actualizarDesdePorcentaje(total > 0 ? datos.mujeres / total : NaN);
    }

    function aplicarSeleccion(seleccion) {
        seleccionActual = seleccion;

        if (!seleccion) {
            selectorRegion.value = "";
            selectorArea.value = "";
            actualizarCarreras("");
            window.VisualizacionRegiones.limpiar();
            window.VisualizacionCarreras.limpiar();
            reflejarEnArduino(null);
            return;
        }

        if (seleccion.type === "region") {
            selectorRegion.value = seleccion.region;
            selectorArea.value = "";
            actualizarCarreras("");
            window.activarTabVisualizacion(document.querySelector("#tab-regiones"));
            reflejarEnArduino(window.VisualizacionRegiones.seleccionar(seleccion.region));
            return;
        }

        selectorRegion.value = "";
        selectorArea.value = seleccion.area;
        actualizarCarreras(seleccion.area);
        selectorCarrera.value = seleccion.type === "career" ? seleccion.career : "";
        window.activarTabVisualizacion(document.querySelector("#tab-carreras"));
        reflejarEnArduino(window.VisualizacionCarreras.seleccionar(
            seleccion.area,
            seleccion.type === "career" ? seleccion.career : ""
        ));
    }

    async function publicarSeleccion(seleccion) {
        aplicarSeleccion(seleccion);
        const url = `/api/state?room=${encodeURIComponent(sala)}`;
        const enviar = async () => {
            const respuesta = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ selection: seleccion })
            });
            if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}.`);
            return respuesta.json();
        };

        enviosPendientes = enviosPendientes.then(enviar, enviar);
        try {
            const resultado = await enviosPendientes;
            revision = Math.max(revision, resultado.revision);
            mostrarEstado(`Conectado · sala ${sala} · selección sincronizada`);
        } catch (error) {
            enviosPendientes = Promise.resolve();
            if (!sinServidor) mostrarEstado(`No se pudo sincronizar: ${error.message}`, true);
        }
    }

    async function leerSeleccionCompartida() {
        if (sinServidor) return;
        try {
            const respuesta = await fetch(`/api/state?room=${encodeURIComponent(sala)}`, { cache: "no-store" });
            if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}.`);
            const resultado = await respuesta.json();
            if (resultado.revision > revision) {
                revision = resultado.revision;
                aplicarSeleccion(resultado.selection);
                mostrarEstado(`Conectado · sala ${sala} · selección recibida`);
            }
        } catch (error) {
            mostrarEstado(`Sin conexión con la sala: ${error.message}`, true);
        }
    }

    async function crearQr() {
        try {
            const respuesta = await fetch("/api/info", { cache: "no-store" });
            if (!respuesta.ok) throw new Error(`El servidor respondió ${respuesta.status}.`);
            const servidor = await respuesta.json();
            const url = `http://${servidor.ip}:${servidor.port}/pagina/?room=${encodeURIComponent(sala)}`;

            if (typeof QRCode === "undefined") {
                throw new Error("No se pudo cargar la biblioteca para generar el QR.");
            }
            new QRCode(document.querySelector("#qr-code"), {
                text: url,
                width: 144,
                height: 144,
                correctLevel: QRCode.CorrectLevel.M
            });
            ayudaQr.textContent = "Escanea el código desde la misma red Wi‑Fi. La selección del teléfono cambiará esta pantalla.";
        } catch (error) {
            sinServidor = true;
            document.querySelector(".qr-panel").style.display = "none";
            mostrarEstado("Modo sin servidor: la selección funciona en esta pantalla y en el Arduino conectado. Para controlarla desde el teléfono, corre servidor.py.");
        }
    }

    function iniciar() {
        if (sincronizacionIniciada || !carrerasListas || !regionesListas) return;
        sincronizacionIniciada = true;

        const catalogo = window.VisualizacionCarreras.catalogo();
        agregarOpciones(selectorArea, catalogo.areas, "Selecciona un área");
        agregarOpciones(
            selectorRegion,
            window.VisualizacionRegiones.listar().sort((a, b) => a.localeCompare(b, "es")),
            "Selecciona una región"
        );

        selectorRegion.addEventListener("change", () => {
            const region = selectorRegion.value;
            selectorArea.value = "";
            actualizarCarreras("");
            publicarSeleccion(region ? { type: "region", region } : null);
        });

        selectorArea.addEventListener("change", () => {
            const area = selectorArea.value;
            selectorRegion.value = "";
            actualizarCarreras(area);
            publicarSeleccion(area ? { type: "area", area } : null);
        });

        selectorCarrera.addEventListener("change", () => {
            const carrera = selectorCarrera.value;
            publicarSeleccion(carrera
                ? { type: "career", area: selectorArea.value, career: carrera }
                : selectorArea.value
                    ? { type: "area", area: selectorArea.value }
                    : null);
        });

        botonSonido.addEventListener("click", async () => {
            try {
                await Sonido.activar();
                botonSonido.textContent = "Sonido activado en este dispositivo";
                if (seleccionActual) aplicarSeleccion(seleccionActual);
            } catch (error) {
                mostrarEstado(`No se pudo activar el sonido: ${error.message}`, true);
            }
        });

        crearQr().then(() => {
            if (sinServidor) return;
            leerSeleccionCompartida();
            window.setInterval(leerSeleccionCompartida, 700);
        });
    }

    window.addEventListener("carreras-ready", () => {
        carrerasListas = true;
        iniciar();
    });
    window.addEventListener("regiones-ready", () => {
        regionesListas = true;
        iniciar();
    });
    iniciar();
})();
