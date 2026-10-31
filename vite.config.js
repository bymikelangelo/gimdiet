import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

// `npm run dev`        → http://localhost:5173 (la cámara funciona en localhost)
// `npm run dev:https`  → https://<IP-de-tu-ordenador>:5173 para probar en el iPhone
//                        por la misma wifi (Safari solo da acceso a la cámara con HTTPS)
export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === 'https' ? [basicSsl()] : [])],
  server: { host: true },
}));
