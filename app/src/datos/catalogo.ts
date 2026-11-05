import type { Entrada, Seccion } from './m3u';

export interface Episodio {
  numero: number;
  nombre: string;
  url: string;
}

export interface Temporada {
  numero: number;
  episodios: Episodio[];
}

export interface Serie {
  titulo: string;
  grupo: string;
  logo: string;
  temporadas: Temporada[];
}

export interface Item {
  nombre: string;
  logo: string;
  url?: string;
  serie?: Serie;
}

export interface Categoria {
  nombre: string;
  items: Item[];
}

export interface Catalogo {
  vivo: Categoria[];
  series: Categoria[];
  peliculas: Categoria[];
}

const CATEGORIA_TODOS: Record<Seccion, string> = {
  vivo: 'Todos los canales',
  series: 'Todas las series',
  peliculas: 'Todas las películas',
};
const SIN_CLASIFICAR = 'Sin clasificar';
const PATRON_EPISODIO = /^(.*?)[\s._-]*S(\d{1,2})\s*E(\d{1,3})/i;

// Hides the group prefix: "Nacionales | Canal 13" is shown as "Canal 13".
function nombreCanal(nombre: string): string {
  const corte = nombre.indexOf(' | ');
  return corte >= 0 ? nombre.slice(corte + 3) : nombre;
}

function agrupar(items: { grupo: string; item: Item }[], seccion: Seccion): Categoria[] {
  const grupos: Categoria[] = [];
  const indice: Record<string, Categoria> = {};
  items.forEach(({ grupo, item }) => {
    if (!indice[grupo]) {
      indice[grupo] = { nombre: grupo, items: [] };
      grupos.push(indice[grupo]);
    }
    indice[grupo].items.push(item);
  });
  return [{ nombre: CATEGORIA_TODOS[seccion], items: items.map((i) => i.item) }, ...grupos];
}

function armarSeries(entradas: Entrada[]): Serie[] {
  const series: Serie[] = [];
  const indice: Record<string, Serie> = {};
  entradas.forEach((entrada) => {
    const patron = PATRON_EPISODIO.exec(entrada.nombre);
    const titulo = patron && patron[1] ? patron[1] : entrada.nombre;
    const grupo = patron ? entrada.grupo : SIN_CLASIFICAR;
    const numeroTemporada = patron ? parseInt(patron[2], 10) : 1;
    const numeroEpisodio = patron ? parseInt(patron[3], 10) : 1;

    const clave = `${grupo}|${titulo}`;
    if (!indice[clave]) {
      indice[clave] = { titulo, grupo, logo: entrada.logo, temporadas: [] };
      series.push(indice[clave]);
    }
    const serie = indice[clave];
    let temporada = serie.temporadas.filter((t) => t.numero === numeroTemporada)[0];
    if (!temporada) {
      temporada = { numero: numeroTemporada, episodios: [] };
      serie.temporadas.push(temporada);
    }
    temporada.episodios.push({ numero: numeroEpisodio, nombre: entrada.nombre, url: entrada.url });
  });
  series.forEach((serie) => {
    serie.temporadas.sort((a, b) => a.numero - b.numero);
    serie.temporadas.forEach((t) => t.episodios.sort((a, b) => a.numero - b.numero));
  });
  return series;
}

export function armarCatalogo(entradas: Entrada[]): Catalogo {
  const de = (seccion: Seccion) => entradas.filter((e) => e.seccion === seccion);
  const simple = (e: Entrada, nombre: string) => ({ grupo: e.grupo, item: { nombre, logo: e.logo, url: e.url } });
  return {
    vivo: agrupar(de('vivo').map((e) => simple(e, nombreCanal(e.nombre))), 'vivo'),
    peliculas: agrupar(de('peliculas').map((e) => simple(e, e.nombre)), 'peliculas'),
    series: agrupar(
      armarSeries(de('series')).map((serie) => ({
        grupo: serie.grupo,
        item: { nombre: serie.titulo, logo: serie.logo, serie },
      })),
      'series',
    ),
  };
}
