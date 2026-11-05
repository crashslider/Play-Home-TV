export type Seccion = 'vivo' | 'series' | 'peliculas';

export interface Entrada {
  nombre: string;
  grupo: string;
  logo: string;
  url: string;
  seccion: Seccion;
}

const SIN_GRUPO = 'Sin categoria';

function atributo(linea: string, nombre: string): string {
  const encontrado = new RegExp(`${nombre}="([^"]*)"`).exec(linea);
  return encontrado ? encontrado[1].trim() : '';
}

// The name follows the first comma after the last quoted attribute, and may contain commas itself.
function nombreDe(extinf: string): string {
  const inicio = extinf.indexOf(',', extinf.lastIndexOf('"') + 1);
  return inicio >= 0 ? extinf.slice(inicio + 1).trim() : '';
}

// Removes decorations like the stars in "⭐PELICULAS ESTRENOS⭐".
function limpiarGrupo(grupo: string): string {
  return grupo.replace(/^[^0-9A-Za-zÀ-ÿ]+|[^0-9A-Za-zÀ-ÿ+)!?.]+$/g, '') || SIN_GRUPO;
}

function seccionDe(url: string): Seccion {
  const ruta = url.split('?')[0].toLowerCase();
  if (ruta.indexOf('/movie/') >= 0) return 'peliculas';
  if (ruta.indexOf('/series/') >= 0) return 'series';
  return 'vivo';
}

export function leerLista(texto: string): Entrada[] {
  const entradas: Entrada[] = [];
  let extinf = '';
  texto.split(/\r?\n/).forEach((cruda) => {
    const linea = cruda.trim();
    if (linea.indexOf('#EXTINF') === 0) {
      extinf = linea;
    } else if (linea && linea[0] !== '#' && extinf) {
      const grupo = limpiarGrupo(atributo(extinf, 'group-title'));
      const nombre = nombreDe(extinf) || atributo(extinf, 'tvg-name');
      entradas.push({ nombre, grupo, logo: atributo(extinf, 'tvg-logo'), url: linea, seccion: seccionDe(linea) });
      extinf = '';
    }
  });
  return entradas;
}
