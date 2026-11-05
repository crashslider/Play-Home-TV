import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';

const LISTAS_LOCALES = ['canales.m3u', 'nueva.m3u', 'personalizada.m3u'];

// Serves the private lists on the PC only: this route does not exist in the TV build.
function listaLocal(): Plugin {
  return {
    name: 'lista-local',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__lista-local', (_req, res) => {
        const raiz = path.resolve(__dirname, '..');
        const texto = LISTAS_LOCALES
          .map((nombre) => path.join(raiz, nombre))
          .filter((ruta) => fs.existsSync(ruta))
          .map((ruta) => fs.readFileSync(ruta, 'utf-8'))
          .join('\n');
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end(texto);
      });
    },
  };
}

export default defineConfig({
  base: './',
  esbuild: { jsx: 'automatic', jsxImportSource: 'preact' },
  server: { host: 'localhost', port: 5173 },
  build: { target: 'chrome63', cssTarget: 'chrome63' },
  plugins: [listaLocal()],
});
