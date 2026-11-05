const TRAZOS: Record<string, string> = {
  todos: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  tv: 'M3 8h18v12H3zM8 3l4 5 4-5',
  noticias: 'M4 5h16v14H4zM8 9h8M8 13h8M8 16h5',
  deportes: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8l4 3-1.5 5h-5L8 11zM12 3v5M21 11l-5 0M3 11l5 0M14.5 16l3 4M9.5 16l-3 4',
  infantil: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 14c1 2 2.500 3 4 3s3-1 4-3M9 9.500v.500M15 9.500v.500',
  cine: 'M4 4h16v16H4zM8 4v16M16 4v16M4 9h4M4 15h4M16 9h4M16 15h4',
  cultura: 'M3 9l9-5 9 5zM5 9v8M10 9v8M14 9v8M19 9v8M3 20h18',
  musica: 'M9 18V6l10-2v12M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM19 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  drama: 'M4 5c5 2 11 2 16 0v7c0 5-4 8-8 9-4-1-8-4-8-9zM8 10h2M14 10h2M9 15c2 1.500 4 1.500 6 0',
  accion: 'M13 3L5 14h6l-1 7 9-12h-6z',
  documental: 'M3 7h13v11H3zM16 11l5-3v9l-5-3zM6 7a2 2 0 1 1 4 0M10 7a2 2 0 1 1 4 0',
  envivo: 'M12 11a1.500 1.500 0 1 0 0 3 1.500 1.500 0 0 0 0-3zM8 8c-2.500 2.500-2.500 6.500 0 9M16 8c2.500 2.500 2.500 6.500 0 9M5 5C.5 9.500.5 15.500 5 20M19 5c4.500 4.500 4.500 10.500 0 15',
  claqueta: 'M4 10h16v10H4zM4 10L3 6l16-4 1 4zM7.500 5l2 4M12.500 4l2 4M10 13l5 2.500L10 18z',
  palomitas: 'M6 10l2 11h8l2-11zM6 10a3 3 0 0 1 1-6 3 3 0 0 1 5-2 3 3 0 0 1 5 2 3 3 0 0 1 1 6zM10 10l1 11M14 10l-1 11',
  ajustes: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2',
  serie: 'M3 7h18v12H3zM8 3l4 4 4-4M10 10l5 3-5 3z',
};

export function Icono({ nombre, tamano = 40 }: { nombre: string; tamano?: number }) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="icono">
      <path d={TRAZOS[nombre] || TRAZOS.todos} />
    </svg>
  );
}

export function IconoPerfil({ grupal, tamano = 96 }: { grupal?: boolean; tamano?: number }) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 48 48" fill="currentColor">
      {grupal ? (
        <path d="M17 22a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM33 22a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM4 40c0-8 5-14 13-14s13 6 13 14zM33 40h11c0-8-4-12-11-12-1 0-3 .200-4 .500 3 3 4 7 4 11.500z" />
      ) : (
        <path d="M24 23a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM6 43c0-10 7-16 18-16s18 6 18 16z" />
      )}
    </svg>
  );
}

const CATEGORIAS: [RegExp, string][] = [
  [/todos|todas/i, 'todos'],
  [/nacional|tv abierta/i, 'tv'],
  [/notici/i, 'noticias'],
  [/deport/i, 'deportes'],
  [/infantil|nino|niño|kids|animad/i, 'infantil'],
  [/cultura/i, 'cultura'],
  [/m[uú]sica/i, 'musica'],
  [/drama/i, 'drama'],
  [/acci[oó]n/i, 'accion'],
  [/document/i, 'documental'],
  [/cine|pel[ií]cula|estreno|serie/i, 'cine'],
];

export function iconoCategoria(nombre: string): string {
  const encontrada = CATEGORIAS.filter(([patron]) => patron.test(nombre))[0];
  return encontrada ? encontrada[1] : 'tv';
}

export function Logo({ pequeno }: { pequeno?: boolean }) {
  return (
    <div class={pequeno ? 'logo logo-pequeno' : 'logo'}>
      <svg viewBox="0 0 120 100" class="logo-svg">
        <defs>
          <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#67f3ff" />
            <stop offset="1" stop-color="#1f6bff" />
          </linearGradient>
        </defs>
        <path d="M40 10l18 16M80 10L62 26" stroke="url(#logo-g)" stroke-width="5" stroke-linecap="round" />
        <circle cx="39" cy="9" r="6" fill="#67f3ff" />
        <circle cx="81" cy="9" r="6" fill="#67f3ff" />
        <rect x="24" y="26" width="72" height="56" rx="12" fill="none" stroke="url(#logo-g)" stroke-width="6" />
        <path d="M52 41v26l22-13z" fill="url(#logo-g)" stroke="url(#logo-g)" stroke-width="3" stroke-linejoin="round" />
        <path d="M100 42c20 8 16 22-22 32S2 90 10 76c2-3 6-6 12-9-5 6-3 11 10 11 22 0 72-14 68-36z" fill="#22e6ff" />
      </svg>
      <span class="logo-texto">Play Home <b>TV</b></span>
    </div>
  );
}
