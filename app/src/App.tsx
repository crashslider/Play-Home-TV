import { useEffect, useState } from 'preact/hooks';
import {
  guardarCopiaLista, guardarUltimoPerfil, guardarUrlLista, leerCopiaLista, leerUrlLista,
} from './datos/almacen';
import { armarCatalogo, type Catalogo, type Item } from './datos/catalogo';
import { leerLista, type Seccion } from './datos/m3u';
import { PERFILES, type Perfil } from './datos/perfiles';
import { Configuracion } from './ui/Configuracion';
import { DetalleSerie, type VistaSerie } from './ui/DetalleSerie';
import { Explorar, type VistaExplorar } from './ui/Explorar';
import { Inicio } from './ui/Inicio';
import { Perfiles } from './ui/Perfiles';
import { Reproductor } from './ui/Reproductor';
import { SECCIONES } from './ui/Encabezado';

type Pantalla =
  | { tipo: 'perfiles' }
  | { tipo: 'inicio' }
  | { tipo: 'configuracion' }
  | { tipo: 'explorar'; vista: VistaExplorar }
  | { tipo: 'serie'; vista: VistaSerie; origen: VistaExplorar }
  | { tipo: 'reproductor'; titulo: string; url: string; enVivo: boolean; volver: Pantalla };

const SIN_CONTENIDO = 'No hay una lista configurada.';

function vistaInicial(seccion: Seccion): VistaExplorar {
  return { seccion, zona: 'categorias', nav: SECCIONES.map((s) => s.id).indexOf(seccion), categoria: 0, item: 0 };
}

export function App() {
  const [pantalla, setPantalla] = useState<Pantalla>({ tipo: 'perfiles' });
  const [perfil, setPerfil] = useState<Perfil>(PERFILES[0]);
  const [catalogo, setCatalogo] = useState<Catalogo | null>(null);
  const [estadoLista, setEstadoLista] = useState('Cargando la lista...');

  const usarTexto = (texto: string) => {
    const nuevo = armarCatalogo(leerLista(texto));
    setCatalogo(nuevo);
    return nuevo;
  };

  // Downloads the list and falls back to the last saved copy when that fails.
  const cargarLista = (url: string) => {
    if (!url) {
      setEstadoLista(SIN_CONTENIDO);
      return;
    }
    setEstadoLista('Cargando la lista...');
    fetch(url)
      .then((respuesta) => {
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        return respuesta.text();
      })
      .then((texto) => {
        usarTexto(texto);
        guardarCopiaLista(texto);
        setEstadoLista('Lista actualizada.');
      })
      .catch((error: Error) => {
        const copia = leerCopiaLista();
        if (copia) usarTexto(copia);
        setEstadoLista(copia
          ? `No se pudo descargar (${error.message}). Se usa la última copia guardada.`
          : `No se pudo descargar la lista (${error.message}).`);
      });
  };

  useEffect(() => cargarLista(leerUrlLista()), []);

  const abrir = (item: Item, vista: VistaExplorar) => {
    if (item.serie) {
      setPantalla({ tipo: 'serie', origen: vista, vista: { serie: item.serie, enEpisodios: false, temporada: 0, episodio: 0 } });
    } else if (item.url) {
      setPantalla({
        tipo: 'reproductor', titulo: item.nombre, url: item.url, enVivo: vista.seccion === 'vivo',
        volver: { tipo: 'explorar', vista },
      });
    }
  };

  switch (pantalla.tipo) {
    case 'perfiles':
      return (
        <Perfiles
          alAjustes={() => setPantalla({ tipo: 'configuracion' })}
          alElegir={(elegido) => {
            guardarUltimoPerfil(elegido.id);
            setPerfil(elegido);
            setPantalla({ tipo: 'inicio' });
          }}
        />
      );
    case 'inicio':
      return (
        <Inicio perfil={perfil}
          alPerfiles={() => setPantalla({ tipo: 'perfiles' })}
          alSeccion={(seccion) => setPantalla({ tipo: 'explorar', vista: vistaInicial(seccion) })}
        />
      );
    case 'configuracion':
      return (
        <Configuracion urlInicial={leerUrlLista()} catalogo={catalogo} estado={estadoLista}
          alVolver={() => setPantalla({ tipo: 'perfiles' })}
          alGuardar={(url) => {
            guardarUrlLista(url);
            cargarLista(url);
          }}
        />
      );
    case 'explorar':
      return (
        <Explorar perfil={perfil} vista={pantalla.vista}
          catalogo={catalogo || { vivo: [], series: [], peliculas: [] }}
          alCambiar={(vista) => setPantalla({ tipo: 'explorar', vista })}
          alAbrir={(item) => abrir(item, pantalla.vista)}
          alInicio={() => setPantalla({ tipo: 'inicio' })}
          alPerfiles={() => setPantalla({ tipo: 'perfiles' })}
        />
      );
    case 'serie':
      return (
        <DetalleSerie perfil={perfil} vista={pantalla.vista}
          alCambiar={(vista) => setPantalla({ ...pantalla, vista })}
          alVolver={() => setPantalla({ tipo: 'explorar', vista: pantalla.origen })}
          alReproducir={(episodio) => setPantalla({
            tipo: 'reproductor', titulo: episodio.nombre, url: episodio.url, enVivo: false, volver: pantalla,
          })}
        />
      );
    case 'reproductor':
      return (
        <Reproductor titulo={pantalla.titulo} url={pantalla.url} enVivo={pantalla.enVivo}
          alVolver={() => setPantalla(pantalla.volver)}
        />
      );
  }
}
