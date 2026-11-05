import { useEffect, useRef, useState } from 'preact/hooks';
import type { Catalogo } from '../datos/catalogo';
import { Logo } from './iconos';
import { limitar, useTeclas } from './teclas';

const ELEMENTOS = 2;
const CAMPO = 0;
const BOTON = 1;

interface Props {
  urlInicial: string;
  catalogo: Catalogo | null;
  estado: string;
  alGuardar: (url: string) => void;
  alVolver: () => void;
}

const total = (categorias: { items: unknown[] }[]) => (categorias[0] ? categorias[0].items.length : 0);

export function Configuracion({ urlInicial, catalogo, estado, alGuardar, alVolver }: Props) {
  const campo = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(urlInicial);
  const [foco, setFoco] = useState(CAMPO);
  const [escribiendo, setEscribiendo] = useState(false);

  useEffect(() => {
    if (escribiendo && campo.current) campo.current.focus();
    if (!escribiendo && campo.current) campo.current.blur();
  }, [escribiendo]);

  useTeclas((tecla) => {
    if (escribiendo) {
      if (tecla === 'ok' || tecla === 'volver') setEscribiendo(false);
      return;
    }
    if (tecla === 'volver') return alVolver();
    if (tecla === 'arriba') setFoco(limitar(foco - 1, 0, ELEMENTOS - 1));
    if (tecla === 'abajo') setFoco(limitar(foco + 1, 0, ELEMENTOS - 1));
    if (tecla === 'ok') {
      if (foco === CAMPO) setEscribiendo(true);
      else alGuardar(url.trim());
    }
  });

  return (
    <div class="pantalla pantalla-config">
      <Logo pequeno />
      <h1>Configuración</h1>
      <label class="config-etiqueta">URL de tu lista M3U</label>
      <input ref={campo} class={'config-campo' + (foco === CAMPO ? ' con-foco' : '')} type="text" value={url}
        spellcheck={false} placeholder="http://..." onInput={(e) => setUrl((e.target as HTMLInputElement).value)} />
      <div class={'config-boton' + (foco === BOTON ? ' con-foco' : '')}>Guardar y cargar lista</div>
      <p class="config-estado">{estado}</p>
      {catalogo && (
        <p class="config-estado">
          {total(catalogo.vivo)} canales · {total(catalogo.peliculas)} películas · {total(catalogo.series)} series
        </p>
      )}
      <p class="config-ayuda">OK para editar o confirmar · Volver para salir</p>
    </div>
  );
}
