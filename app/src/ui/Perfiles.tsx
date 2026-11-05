import { useState } from 'preact/hooks';
import { leerUltimoPerfil } from '../datos/almacen';
import { PERFILES, type Perfil } from '../datos/perfiles';
import { Icono, IconoPerfil, Logo } from './iconos';
import { limitar, useTeclas } from './teclas';

interface Props {
  alElegir: (perfil: Perfil) => void;
  alAjustes: () => void;
}

export function Perfiles({ alElegir, alAjustes }: Props) {
  const inicial = PERFILES.map((p) => p.id).indexOf(leerUltimoPerfil());
  const [foco, setFoco] = useState(Math.max(0, inicial));
  const [enAjustes, setEnAjustes] = useState(false);

  useTeclas((tecla) => {
    if (enAjustes) {
      if (tecla === 'arriba' || tecla === 'izq' || tecla === 'volver') setEnAjustes(false);
      if (tecla === 'ok') alAjustes();
      return;
    }
    if (tecla === 'izq') setFoco(limitar(foco - 1, 0, PERFILES.length - 1));
    if (tecla === 'der') setFoco(limitar(foco + 1, 0, PERFILES.length - 1));
    if (tecla === 'abajo') setEnAjustes(true);
    if (tecla === 'ok') alElegir(PERFILES[foco]);
  });

  return (
    <div class="pantalla pantalla-perfiles">
      <Logo />
      <h1 class="pregunta">¿Quién está viendo?</h1>
      <div class="fila-perfiles">
        {PERFILES.map((perfil, i) => (
          <div key={perfil.id} class={'tarjeta-perfil' + (!enAjustes && i === foco ? ' con-foco' : '')}
            style={{ color: perfil.color }}>
            <IconoPerfil grupal={perfil.grupal} />
            <span>{perfil.nombre}</span>
          </div>
        ))}
      </div>
      <div class={'boton-ajustes' + (enAjustes ? ' con-foco' : '')} aria-label="Configuración">
        <Icono nombre="ajustes" tamano={56} />
      </div>
    </div>
  );
}
