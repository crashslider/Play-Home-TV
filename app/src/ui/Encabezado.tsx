import type { ComponentChildren } from 'preact';
import type { Seccion } from '../datos/m3u';
import type { Perfil } from '../datos/perfiles';
import { IconoPerfil, Logo } from './iconos';

export const SECCIONES: { id: Seccion; nombre: string; icono: string; color: string }[] = [
  { id: 'vivo', nombre: 'En Vivo', icono: 'envivo', color: '#22d3ee' },
  { id: 'series', nombre: 'Series', icono: 'claqueta', color: '#a78bfa' },
  { id: 'peliculas', nombre: 'Películas', icono: 'palomitas', color: '#2dd4bf' },
];

interface Props {
  perfil: Perfil;
  focoPerfil: boolean;
  children?: ComponentChildren;
}

export function Encabezado({ perfil, focoPerfil, children }: Props) {
  return (
    <header class="encabezado">
      <Logo pequeno />
      <div class="encabezado-centro">{children}</div>
      <div class={'chip-perfil' + (focoPerfil ? ' con-foco' : '')}>
        <span class="chip-avatar" style={{ color: perfil.color }}>
          <IconoPerfil grupal={perfil.grupal} tamano={38} />
        </span>
        <span>{perfil.nombre}</span>
      </div>
    </header>
  );
}
