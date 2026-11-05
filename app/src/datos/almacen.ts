const URL_LISTA = 'urlLista';
const COPIA_LISTA = 'copiaLista';
const ULTIMO_PERFIL = 'ultimoPerfil';

function leer(clave: string): string {
  try {
    return localStorage.getItem(clave) || '';
  } catch {
    return '';
  }
}

function guardar(clave: string, valor: string) {
  try {
    localStorage.setItem(clave, valor);
  } catch {
    // Without storage the app still works; it only loses this value on the next start.
  }
}

// On the PC the private lists are served by the dev server (vite.config.ts).
export const leerUrlLista = () => leer(URL_LISTA) || (import.meta.env.DEV ? '/__lista-local' : '');
export const guardarUrlLista = (url: string) => guardar(URL_LISTA, url);
export const leerCopiaLista = () => leer(COPIA_LISTA);
export const guardarCopiaLista = (texto: string) => guardar(COPIA_LISTA, texto);
export const leerUltimoPerfil = () => leer(ULTIMO_PERFIL);
export const guardarUltimoPerfil = (id: string) => guardar(ULTIMO_PERFIL, id);
