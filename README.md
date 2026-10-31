# Gymdiet · prototipo

Prototipo móvil (React + Vite) con dos pantallas, siguiendo la dirección **1a · Clásica** del diseño:

1. **Cámara** (pantalla de inicio): cámara trasera a pantalla completa, marco para encuadrar el plato, selector Plato / Alimento / Etiqueta, botón de galería, disparador y flash.
2. **Resultado**: foto capturada, macros totales (kcal, proteína, carbohidratos, grasa) e ingredientes editables (± 10 g, quitar, añadir). Los totales se recalculan al momento.

El análisis **no usa IA**: `analyzeDish()` en `src/data/mockAnalysis.js` devuelve siempre «Pollo con arroz» tras 1,4 s. Para conectar el agente real, sustituye el cuerpo de esa función y devuelve el mismo formato (`{ name, confidence, items: [{ id, grams }] }`).

## Arrancar

```bash
npm install
npm run dev          # http://localhost:5173 en el ordenador
```

### Probar en el iPhone

Safari solo da acceso a la cámara con **HTTPS**:

```bash
npm run dev:https    # https://<IP-de-tu-ordenador>:5173
```

Abre esa dirección en el iPhone (misma wifi), acepta el aviso de certificado y permite la cámara.

### Instalar como web app

La app se publica sola en **GitHub Pages** con cada push a `main`:

👉 https://bymikelangelo.github.io/gimdiet/

1. Abre esa URL en Safari en el iPhone.
2. Botón **Compartir** → **Añadir a pantalla de inicio**.
3. La app se abre a pantalla completa, sin barras de Safari, con su icono.

Cómo funciona la publicación: el workflow `.github/workflows/deploy.yml` instala dependencias, compila con `BASE_PATH=/gimdiet/` (porque Pages sirve el repo en esa subcarpeta) y sube la carpeta `dist/` a Pages. Puedes ver cada publicación en la pestaña **Actions** del repo.

> Requisito una sola vez: en el repo, **Settings → Pages → Source: GitHub Actions**.

## Estructura

```
src/
  App.jsx                  navegación entre pantallas + kcal del día
  screens/CameraScreen.jsx cámara (getUserMedia), captura, galería, fallback
  screens/ResultScreen.jsx resultado y edición de ingredientes
  data/mockAnalysis.js     alimentos, objetivo del día y análisis simulado
  styles.css               tokens del sistema de diseño y estilos
public/
  manifest.webmanifest, sw.js, icons/, fonts/, sample-plate.svg
```

Si no hay cámara (ordenador sin webcam, permiso denegado), la pantalla ofrece **Elegir foto** o **Usar plato de ejemplo**.
