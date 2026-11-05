export interface Perfil {
  id: string;
  nombre: string;
  color: string;
  grupal?: boolean;
}

// Real names live in perfiles.local.json, which stays out of the public repository.
const locales = import.meta.glob<{ default: Perfil[] }>('./perfiles.local.json', { eager: true });
const propios = locales['./perfiles.local.json'];

export const PERFILES: Perfil[] = propios ? propios.default : [
  { id: 'perfil1', nombre: 'Perfil 1', color: '#2dd4bf', grupal: true },
  { id: 'perfil2', nombre: 'Perfil 2', color: '#22d3ee' },
  { id: 'perfil3', nombre: 'Perfil 3', color: '#f472b6' },
  { id: 'perfil4', nombre: 'Perfil 4', color: '#a78bfa' },
];
