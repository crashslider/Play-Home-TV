import type { Categoria, Catalogo, Item } from '../datos/catalogo';
import type { Seccion } from '../datos/m3u';
import type { Perfil } from '../datos/perfiles';
import { Encabezado, SECCIONES } from './Encabezado';
import { Icono, iconoCategoria } from './iconos';
import { inicioVentana, limitar, useTeclas } from './teclas';

export type Zona = 'nav' | 'categorias' | 'contenido';

export interface VistaExplorar {
  seccion: Seccion;
  zona: Zona;
  nav: number;
  categoria: number;
  item: number;
}

const CATEGORIAS_VISIBLES = 10;
const CANALES_VISIBLES = 10;
const COLUMNAS = 5;
const FILAS_VISIBLES = 2;
const NAV_PERFIL = SECCIONES.length;

interface Props {
  perfil: Perfil;
  catalogo: Catalogo;
  vista: VistaExplorar;
  alCambiar: (vista: VistaExplorar) => void;
  alAbrir: (item: Item) => void;
  alInicio: () => void;
  alPerfiles: () => void;
}

export function Explorar({ perfil, catalogo, vista, alCambiar, alAbrir, alInicio, alPerfiles }: Props) {
  const categorias = catalogo[vista.seccion];
  const categoria: Categoria = categorias[vista.categoria] || { nombre: '', items: [] };
  const items = categoria.items;
  const esVivo = vista.seccion === 'vivo';
  const hayContenido = items.length > 0;
  const cambiar = (cambios: Partial<VistaExplorar>) => alCambiar({ ...vista, ...cambios });

  const moverNav = (paso: number) => {
    const nav = limitar(vista.nav + paso, 0, NAV_PERFIL);
    if (nav === NAV_PERFIL) cambiar({ nav });
    else cambiar({ nav, seccion: SECCIONES[nav].id, categoria: 0, item: 0 });
  };

  const teclaNav = (tecla: string) => {
    if (tecla === 'izq') moverNav(-1);
    if (tecla === 'der') moverNav(1);
    if (tecla === 'abajo') cambiar({ zona: 'categorias' });
    if (tecla === 'volver') alInicio();
    if (tecla === 'ok') {
      if (vista.nav === NAV_PERFIL) alPerfiles();
      else cambiar({ zona: 'categorias' });
    }
  };

  const teclaCategorias = (tecla: string) => {
    if (tecla === 'arriba') {
      if (vista.categoria === 0) cambiar({ zona: 'nav' });
      else cambiar({ categoria: vista.categoria - 1, item: 0 });
    }
    if (tecla === 'abajo') cambiar({ categoria: limitar(vista.categoria + 1, 0, categorias.length - 1), item: 0 });
    if ((tecla === 'der' || tecla === 'ok') && hayContenido) cambiar({ zona: 'contenido' });
    if (tecla === 'volver') cambiar({ zona: 'nav' });
  };

  const teclaContenido = (tecla: string) => {
    const columnas = esVivo ? 1 : COLUMNAS;
    if (tecla === 'volver') return cambiar({ zona: 'categorias' });
    if (tecla === 'ok') return alAbrir(items[vista.item]);
    if (tecla === 'izq') {
      if (vista.item % columnas === 0) cambiar({ zona: 'categorias' });
      else cambiar({ item: vista.item - 1 });
    }
    if (tecla === 'der' && !esVivo && vista.item % columnas < columnas - 1) {
      cambiar({ item: limitar(vista.item + 1, 0, items.length - 1) });
    }
    if (tecla === 'arriba') {
      if (vista.item < columnas) cambiar({ zona: 'nav' });
      else cambiar({ item: vista.item - columnas });
    }
    if (tecla === 'abajo') cambiar({ item: limitar(vista.item + columnas, 0, items.length - 1) });
  };

  useTeclas((tecla) => {
    if (vista.zona === 'nav') teclaNav(tecla);
    else if (vista.zona === 'categorias') teclaCategorias(tecla);
    else teclaContenido(tecla);
  });

  const conFoco = (activo: boolean) => (activo ? ' con-foco' : '');
  const seccionActual = SECCIONES.filter((s) => s.id === vista.seccion)[0];
  const inicioCat = inicioVentana(vista.categoria, categorias.length, CATEGORIAS_VISIBLES);

  return (
    <div class="pantalla pantalla-explorar" style={{ '--acento': seccionActual.color } as Record<string, string>}>
      <Encabezado perfil={perfil} focoPerfil={vista.zona === 'nav' && vista.nav === NAV_PERFIL}>
        <nav class="pestanas">
          {SECCIONES.map((seccion, i) => (
            <div key={seccion.id} style={{ '--acento': seccion.color } as Record<string, string>}
              class={'pestana' + (seccion.id === vista.seccion ? ' activa' : '') + conFoco(vista.zona === 'nav' && vista.nav === i)}>
              <Icono nombre={seccion.icono} tamano={34} />
              <span>{seccion.nombre}</span>
            </div>
          ))}
        </nav>
      </Encabezado>

      <div class="cuerpo">
        <aside class="categorias">
          {categorias.slice(inicioCat, inicioCat + CATEGORIAS_VISIBLES).map((cat, i) => {
            const indice = inicioCat + i;
            return (
              <div key={cat.nombre} class={'categoria' + (indice === vista.categoria ? ' activa' : '') + conFoco(vista.zona === 'categorias' && indice === vista.categoria)}>
                <Icono nombre={iconoCategoria(cat.nombre)} tamano={34} />
                <span class="categoria-nombre">{cat.nombre}</span>
                <span class="categoria-total">{cat.items.length}</span>
              </div>
            );
          })}
        </aside>
        {!hayContenido && <div class="vacio">Tu lista todavía no tiene contenido en esta sección.</div>}
        {hayContenido && esVivo && <Canales items={items} foco={vista.item} activo={vista.zona === 'contenido'} />}
        {hayContenido && !esVivo && <Rejilla items={items} foco={vista.item} activo={vista.zona === 'contenido'} />}
      </div>
    </div>
  );
}

function Imagen({ item, clase }: { item: Item; clase: string }) {
  return item.logo ? <img class={clase} src={item.logo} alt="" /> : <div class={clase + ' sin-imagen'}><Icono nombre="tv" tamano={72} /></div>;
}

function Canales({ items, foco, activo }: { items: Item[]; foco: number; activo: boolean }) {
  const inicio = inicioVentana(foco, items.length, CANALES_VISIBLES);
  const canal = items[foco];
  return (
    <div class="vivo">
      <div class="canales">
        {items.slice(inicio, inicio + CANALES_VISIBLES).map((item, i) => {
          const indice = inicio + i;
          return (
            <div key={item.url} class={'canal' + (indice === foco ? ' activa' : '') + (activo && indice === foco ? ' con-foco' : '')}>
              <span class="canal-numero">{indice + 1}</span>
              <Imagen item={item} clase="canal-logo" />
              <span class="canal-nombre">{item.nombre}</span>
            </div>
          );
        })}
      </div>
      <section class="vista-previa">
        <div class="vista-previa-imagen">
          <span class="insignia-vivo">EN VIVO</span>
          <Imagen item={canal} clase="vista-previa-logo" />
        </div>
        <div class="vista-previa-info">
          <h2>{canal.nombre}</h2>
          <p>Pulsa OK para ver a pantalla completa</p>
        </div>
      </section>
    </div>
  );
}

function Rejilla({ items, foco, activo }: { items: Item[]; foco: number; activo: boolean }) {
  const filaFoco = Math.floor(foco / COLUMNAS);
  const filas = Math.ceil(items.length / COLUMNAS);
  const inicio = inicioVentana(filaFoco, filas, FILAS_VISIBLES) * COLUMNAS;
  return (
    <div class="rejilla">
      {items.slice(inicio, inicio + COLUMNAS * FILAS_VISIBLES).map((item, i) => {
        const indice = inicio + i;
        const conFoco = activo && indice === foco;
        return (
          <div key={item.nombre + indice} class={'poster' + (conFoco ? ' con-foco' : '')}>
            <Imagen item={item} clase="poster-imagen" />
            <span class="poster-titulo">{item.nombre}</span>
          </div>
        );
      })}
    </div>
  );
}
