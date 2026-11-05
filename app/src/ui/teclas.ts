import { useEffect, useRef } from 'preact/hooks';

export type Tecla = 'arriba' | 'abajo' | 'izq' | 'der' | 'ok' | 'volver';

const TECLAS: Record<number, Tecla> = {
  38: 'arriba',
  40: 'abajo',
  37: 'izq',
  39: 'der',
  13: 'ok',
  10009: 'volver', // Return on the Samsung remote
  27: 'volver', // Esc on the PC
  8: 'volver', // Backspace on the PC
};
const TECLAS_AL_ESCRIBIR = [13, 27, 10009];

export function useTeclas(manejar: (tecla: Tecla) => void) {
  const actual = useRef(manejar);
  actual.current = manejar;

  useEffect(() => {
    const alPulsar = (evento: KeyboardEvent) => {
      const activo = document.activeElement;
      const escribiendo = !!activo && activo.tagName === 'INPUT';
      if (escribiendo && TECLAS_AL_ESCRIBIR.indexOf(evento.keyCode) < 0) return;
      const tecla = TECLAS[evento.keyCode];
      if (tecla) {
        evento.preventDefault();
        actual.current(tecla);
      }
    };
    document.addEventListener('keydown', alPulsar);
    return () => document.removeEventListener('keydown', alPulsar);
  }, []);
}

export const limitar = (valor: number, minimo: number, maximo: number) =>
  Math.max(minimo, Math.min(maximo, valor));

// First visible position of a list that only renders the items around the focus.
export function inicioVentana(foco: number, total: number, visibles: number): number {
  return limitar(foco - Math.floor(visibles / 2), 0, Math.max(0, total - visibles));
}
