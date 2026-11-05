import type { Episodio, Serie } from '../datos/catalogo';
import type { Perfil } from '../datos/perfiles';
import { Encabezado } from './Encabezado';
import { Icono } from './iconos';
import { inicioVentana, limitar, useTeclas } from './teclas';

export interface VistaSerie {
  serie: Serie;
  enEpisodios: boolean;
  temporada: number;
  episodio: number;
}

const EPISODIOS_VISIBLES = 9;

interface Props {
  perfil: Perfil;
  vista: VistaSerie;
  alCambiar: (vista: VistaSerie) => void;
  alReproducir: (episodio: Episodio) => void;
  alVolver: () => void;
}

export function DetalleSerie({ perfil, vista, alCambiar, alReproducir, alVolver }: Props) {
  const { serie } = vista;
  const episodios = serie.temporadas[vista.temporada].episodios;
  const cambiar = (cambios: Partial<VistaSerie>) => alCambiar({ ...vista, ...cambios });

  useTeclas((tecla) => {
    if (vista.enEpisodios) {
      if (tecla === 'arriba') cambiar({ episodio: limitar(vista.episodio - 1, 0, episodios.length - 1) });
      if (tecla === 'abajo') cambiar({ episodio: limitar(vista.episodio + 1, 0, episodios.length - 1) });
      if (tecla === 'izq' || tecla === 'volver') cambiar({ enEpisodios: false });
      if (tecla === 'ok') alReproducir(episodios[vista.episodio]);
      return;
    }
    if (tecla === 'arriba') cambiar({ temporada: limitar(vista.temporada - 1, 0, serie.temporadas.length - 1), episodio: 0 });
    if (tecla === 'abajo') cambiar({ temporada: limitar(vista.temporada + 1, 0, serie.temporadas.length - 1), episodio: 0 });
    if (tecla === 'der' || tecla === 'ok') cambiar({ enEpisodios: true });
    if (tecla === 'volver') alVolver();
  });

  const inicio = inicioVentana(vista.episodio, episodios.length, EPISODIOS_VISIBLES);

  return (
    <div class="pantalla pantalla-serie">
      <Encabezado perfil={perfil} focoPerfil={false} />
      <div class="cuerpo">
        <aside class="serie-lado">
          {serie.logo
            ? <img class="serie-poster" src={serie.logo} alt="" />
            : <div class="serie-poster sin-imagen"><Icono nombre="serie" tamano={96} /></div>}
          <h1>{serie.titulo}</h1>
        </aside>
        <div class="temporadas">
          {serie.temporadas.map((temporada, i) => (
            <div key={temporada.numero} class={'categoria' + (i === vista.temporada ? ' activa' : '') + (!vista.enEpisodios && i === vista.temporada ? ' con-foco' : '')}>
              <span class="categoria-nombre">Temporada {temporada.numero}</span>
              <span class="categoria-total">{temporada.episodios.length}</span>
            </div>
          ))}
        </div>
        <div class="episodios">
          {episodios.slice(inicio, inicio + EPISODIOS_VISIBLES).map((episodio, i) => {
            const indice = inicio + i;
            return (
              <div key={episodio.url} class={'canal' + (indice === vista.episodio ? ' activa' : '') + (vista.enEpisodios && indice === vista.episodio ? ' con-foco' : '')}>
                <span class="canal-numero">{episodio.numero}</span>
                <span class="canal-nombre">{episodio.nombre}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
