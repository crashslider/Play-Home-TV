import { useState } from 'preact/hooks';
import type { Seccion } from '../datos/m3u';
import type { Perfil } from '../datos/perfiles';
import { Encabezado, SECCIONES } from './Encabezado';
import { Icono } from './iconos';
import { limitar, useTeclas } from './teclas';

interface Props {
  perfil: Perfil;
  alSeccion: (seccion: Seccion) => void;
  alPerfiles: () => void;
}

export function Inicio({ perfil, alSeccion, alPerfiles }: Props) {
  const [foco, setFoco] = useState(0);
  const [enPerfil, setEnPerfil] = useState(false);

  useTeclas((tecla) => {
    if (tecla === 'volver') return alPerfiles();
    if (enPerfil) {
      if (tecla === 'abajo') setEnPerfil(false);
      if (tecla === 'ok') alPerfiles();
      return;
    }
    if (tecla === 'izq') setFoco(limitar(foco - 1, 0, SECCIONES.length - 1));
    if (tecla === 'der') setFoco(limitar(foco + 1, 0, SECCIONES.length - 1));
    if (tecla === 'arriba') setEnPerfil(true);
    if (tecla === 'ok') alSeccion(SECCIONES[foco].id);
  });

  return (
    <div class="pantalla pantalla-inicio">
      <Encabezado perfil={perfil} focoPerfil={enPerfil} />
      <div class="fila-secciones">
        {SECCIONES.map((seccion, i) => (
          <div key={seccion.id} class={`tarjeta-seccion seccion-${seccion.id}` + (!enPerfil && i === foco ? ' con-foco' : '')}
            style={{ color: seccion.color }}>
            <Icono nombre={seccion.icono} tamano={170} />
            <span>{seccion.nombre}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
