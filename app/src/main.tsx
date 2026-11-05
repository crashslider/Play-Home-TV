import { render } from 'preact';
import { App } from './App';
import './estilos.css';

const ANCHO = 1920;
const ALTO = 1080;
const escenario = document.getElementById('escenario') as HTMLElement;

// The UI is designed for a 1920x1080 TV; on a PC it scales to fit the window.
function ajustar() {
  const escala = Math.min(window.innerWidth / ANCHO, window.innerHeight / ALTO);
  const x = (window.innerWidth - ANCHO * escala) / 2;
  const y = (window.innerHeight - ALTO * escala) / 2;
  escenario.style.transform = `translate(${x}px, ${y}px) scale(${escala})`;
}

window.addEventListener('resize', ajustar);
ajustar();
render(<App />, escenario);
