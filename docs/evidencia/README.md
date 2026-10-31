# Evidencia por versión

Cada carpeta `vN/` junta todo lo de esa versión para que el grupo (y el equipo docente) la pueda ver:

```
vN/
├── pagina/        copia navegable de la página tal como quedó en esa versión (no se edita)
├── *.png / *.gif  capturas: vista general, tooltip, animación a mitad…
└── *.mp4          video corto con audio (< 100 MB; el video largo va a YouTube y se enlaza en entrega.md)
```

| Versión | Copia navegable | Origen | En GitHub Pages |
|---|---|---|---|


Para guardar una versión nueva al cerrarla: copiar la carpeta `pagina/` completa a `docs/evidencia/vN/pagina/`
(o desde git: `git archive <commit> pagina | tar -x -C docs/evidencia/vN`).
