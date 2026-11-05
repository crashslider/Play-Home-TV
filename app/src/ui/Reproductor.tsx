import { useEffect, useRef, useState } from 'preact/hooks';
import { useTeclas } from './teclas';

const SALTO_SEGUNDOS = 30;
const OCULTAR_MS = 4000;

interface Props {
  titulo: string;
  url: string;
  enVivo: boolean;
  alVolver: () => void;
}

// PC version based on <video>. The TV version will use AVPlay behind the same screen (step 4).
export function Reproductor({ titulo, url, enVivo, alVolver }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const temporizador = useRef(0);
  const [visible, setVisible] = useState(true);
  const [pausado, setPausado] = useState(false);
  const [fallo, setFallo] = useState(false);

  const mostrar = () => {
    setVisible(true);
    clearTimeout(temporizador.current);
    temporizador.current = window.setTimeout(() => setVisible(false), OCULTAR_MS);
  };

  useEffect(() => {
    mostrar();
    return () => clearTimeout(temporizador.current);
  }, []);

  useTeclas((tecla) => {
    const elemento = video.current;
    if (tecla === 'volver') return alVolver();
    mostrar();
    if (!elemento || fallo) return;
    if (tecla === 'ok') {
      if (elemento.paused) elemento.play();
      else elemento.pause();
      setPausado(!elemento.paused);
    }
    if (!enVivo && tecla === 'izq') elemento.currentTime -= SALTO_SEGUNDOS;
    if (!enVivo && tecla === 'der') elemento.currentTime += SALTO_SEGUNDOS;
  });

  return (
    <div class="pantalla pantalla-reproductor">
      <video ref={video} class="video" src={url} autoPlay onError={() => setFallo(true)}
        onPause={() => setPausado(true)} onPlay={() => setPausado(false)} />
      {fallo && (
        <div class="aviso-reproductor">
          <h2>No se puede reproducir en el navegador del PC</h2>
          <p>Este formato o servidor no funciona aquí. La reproducción real se prueba en el televisor.</p>
          <p>Pulsa Volver para regresar.</p>
        </div>
      )}
      {visible && !fallo && (
        <div class="barra-reproductor">
          {enVivo && <span class="insignia-vivo">EN VIVO</span>}
          <span class="barra-titulo">{titulo}</span>
          <span class="barra-ayuda">
            {pausado ? 'En pausa · ' : ''}OK pausa{enVivo ? '' : ' · ◀ ▶ 30 s'} · Volver salir
          </span>
        </div>
      )}
    </div>
  );
}
