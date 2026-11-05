# PlayHome TV --- Plan de desarrollo para Samsung Smart TV

**Documento de trabajo --- versión 0.2 (1 de noviembre de 2026)**\
**Objetivo:** una aplicación simple para ver una lista M3U propia en el
televisor de la casa, con perfiles y progreso de películas y series.
Reemplaza a M3U IPTV, que no tiene perfiles.

**Uso:** solo doméstico. No se publicará en ninguna tienda.

------------------------------------------------------------------------

## 1. Equipo objetivo

  Dato               Información
  ------------------ ------------------------------
  Modelo             Samsung UN55RU7100GXZS (2019)
  Firmware informado T-MSLUABC-1501.1
  Plataforma         Tizen 5.0
  Motor web          M63 (Chromium 63)
  Región             Chile

## 2. Qué hace la aplicación

-   **Configuración:** se escribe la URL de la lista una sola vez.
-   **Menú principal:** TV En Vivo, Películas y Series.
-   **Categorías:** salen de los grupos de la lista.
-   **Actualización:** la lista se descarga al abrir la aplicación. Si
    la descarga falla, se usa la última copia guardada.
-   **Perfiles:** todos usan la misma lista. Cada perfil tiene su
    progreso, «Continuar viendo», favoritos e historial.
-   **Películas y series:** retoman donde quedaron, marcan lo visto y
    ofrecen el siguiente episodio.
-   **Control remoto:** toda la navegación se hace con el control
    Samsung.

### Fuera de alcance por ahora

-   Xtream Codes.
-   Varias listas.
-   Sincronización entre televisores.
-   Guía de programación (EPG). `canales.m3u` trae un enlace de guía,
    así que se puede agregar más adelante.
-   Backend. Se agregará solo si las pruebas lo justifican (sección 5).

## 3. Cómo se interpreta la lista

Datos revisados en `canales.m3u` (207 canales), `personalizada.m3u`
(2 películas y 2 episodios) y `nueva.m3u` (2 películas). La lista final
tendrá todo junto.

### Separar las secciones

La sección se decide por la **ruta de la URL**, no por el nombre del
grupo:

  Ruta de la URL contiene   Sección
  ------------------------- ------------
  `/movie/`                 Películas
  `/series/`                Series
  Cualquier otra            TV En Vivo

Con esta regla, grupos en vivo como «Cine y Series» o «Peliculas» siguen
en TV En Vivo, sin renombrar nada.

### Armar las series

-   El grupo es la categoría, por ejemplo `SERIES APPLE TV+`.
-   El nombre de la entrada entrega la serie, la temporada y el episodio.
    Por ejemplo, `See (2019) S01 E02` es la serie `See (2019)`, temporada
    1, episodio 2.
-   Se acepta `S01E02` con o sin espacio.
-   Un episodio cuyo nombre no siga el patrón queda visible en una
    categoría «Sin clasificar», para no perder contenido.

### Limpiar lo que se muestra

-   En los canales se oculta el prefijo: `Nacionales | Canal 13` se
    muestra como `Canal 13`.
-   Si falta el logo se muestra un ícono de reemplazo. Hoy 64 de los 207
    canales no tienen logo.

## 4. Progreso

-   **Clave:** el nombre, no la URL.
    -   Película: nombre y año.
    -   Episodio: serie, temporada y episodio.
-   **Efecto:** si cambia una URL, el progreso se conserva. Si se renombra
    el contenido en la lista, su progreso vuelve a cero.
-   **Cuándo se guarda:** cada 15 segundos, al pausar, al salir del
    reproductor y cuando la aplicación queda oculta.
-   **Visto:** al superar el 90 % de la duración. Es un valor inicial y se
    puede ajustar.

## 5. Arquitectura

### Aplicación

-   Aplicación web empaquetada para Tizen.
-   TypeScript y Vite, compilando para Chromium 63. Ese motor no tiene
    `?.`, `??`, `gap` en flexbox ni `aspect-ratio`.
-   Preact para la interfaz, con listas virtualizadas.
-   AVPlay detrás de una interfaz `Player`. Así la interfaz se puede
    desarrollar en el navegador del PC, con hls.js como reproductor
    alternativo. La reproducción real se prueba siempre en el televisor.

### Datos

Todo se guarda en el televisor: copia de la lista, perfiles y progreso.

Se agregará un servicio pequeño en un LXC de Proxmox solo si ocurre
alguna de estas dos cosas:

1.  Reinstalar la aplicación o renovar el certificado borra los datos.
    Para ese caso también sirve una opción de exportar e importar.
2.  La lista final deja lento el televisor. Se medirá con el tamaño real,
    porque hoy solo hay 211 entradas de prueba.

## 6. Etapas

### Paso 1 --- Conectar el televisor

Instalar las herramientas (sección 7) y abrir una aplicación mínima.

**Listo cuando:** la aplicación se instala y abre en el televisor.

**Estado: terminado el 3 de noviembre de 2026.** Se comprobó Tizen 5.0 en
el televisor, la instalación, la apertura, el control remoto y la salida.

-   **Red:** por Wi-Fi el PC no veía el televisor, aunque ambos tenían el
    mismo gateway. Por cable funcionó de inmediato. Durante el desarrollo
    se usa cable. Si cambia la IP, hay que corregirla en Device Manager.
-   **Certificados:** el perfil `PlayHomeTV` vence el 3 de noviembre de
    2027. Hay que renovarlo antes de esa fecha.
-   **Empaquetado:** el archivo `.wgt` no debe tener espacios en el nombre,
    porque la instalación falla sin dar detalles.

### Paso 2 --- Probar la reproducción

Probar con AVPlay una muestra de cada tipo:

  Prueba                               Qué comprobar
  ------------------------------------ -------------------------------
  Canal `http` sin extensión           Imagen, audio, reconexión
  Canal `https` `.m3u8`                Imagen, audio, reconexión
  Película `.mp4`                      Audio, avance, retomar
  Película `.mkv`                      Audio, pistas, subtítulos
  Episodio `.mkv`                      Audio, pistas, subtítulos

También comprobar:

-   Qué pasa con los datos guardados al reinstalar la aplicación.
-   La fecha de vencimiento del certificado.

**Listo cuando:** se sabe qué se reproduce y qué no. Los resultados se
anotan en este documento.

**Estado: casi terminado (3 de noviembre de 2026).** La prueba está en
`prueba-tv/`, y `herramientas/instalar_prueba.ps1` la firma, instala y abre.

  Resultado                    Detalle
  ---------------------------- ----------------------------------------
  Canales en vivo              Funcionan (HLS y `http` sin extensión)
  Película `.mkv`              Funciona (H.264 y AAC)
  Cambio de idioma de audio    Funciona (español e inglés)
  Subtítulos integrados ASS    Se muestran con la app de prueba
  Proporción de imagen         Correcta con `AUTO_ASPECT_RATIO`

Lo aprendido:

-   **Proporción:** usar `setDisplayMethod` con
    `PLAYER_DISPLAY_MODE_AUTO_ASPECT_RATIO`. Sin esa llamada la imagen no
    respetaba las franjas negras de la película.
-   **Subtítulos:** llamar a `setSelectTrack('TEXT', índice)` y después a
    `setSilentSubtitle`. La app dibuja el texto que recibe en
    `onsubtitlechange`.
-   **HTTP 503:** significa que el servidor no entrega ese contenido, no
    que el televisor falle. Ocurrió con `personalizada.m3u`, y esas mismas
    películas tampoco funcionaron en VLC. La aplicación debe mostrar un
    mensaje claro en ese caso.

Queda pendiente:

-   Confirmar qué valor de `setSilentSubtitle` hizo aparecer los subtítulos
    y si el texto se ve limpio, sin códigos de formato.
-   Probar la película `.mp4`, avanzar, retroceder y pausar.
-   Probar un archivo con audio DTS, si aparece alguno en la lista.
-   Comprobar si los datos guardados sobreviven a reinstalar y a
    desinstalar. La prueba muestra el contador «Aperturas de la app».
-   Observar la sincronía de audio y video en sesiones largas de TV en
    vivo.

### Paso 3 --- Aplicación base

-   Configuración con la URL de la lista.
-   Descarga, lectura y copia local de la lista.
-   Menú con las tres secciones y navegación con el control remoto.

**Estado: en curso (4 de noviembre de 2026).** La interfaz está en `app/` y
se puede ver en el PC. Falta probarla en el televisor.

-   **Ver en el PC:** en `app/`, ejecutar `npm run dev` y abrir
    `http://localhost:5173`. Flechas, Enter y Esc reemplazan al control.
-   **Perfiles:** cuatro fijos, con los nombres en
    `app/src/datos/perfiles.local.json`, que no se sube al repositorio. La
    aplicación pregunta quién está viendo cada vez que se abre, como Netflix,
    con el foco en el último perfil usado.
-   **Menú:** En Vivo, Series y Películas, en el orden del diseño.
-   **Ícono:** `app/public/icon.png`, generado a partir de `icon.png`.
-   **Lista en el PC:** el servidor de desarrollo une las listas locales de
    la carpeta. Esa ruta no existe en la versión del televisor.
-   **Reproducción en el PC:** usa `<video>` y es limitada. AVPlay se conecta
    en el paso 4.

Queda para los pasos siguientes:

-   Empaquetar `app/` para el televisor y comprobar que funcione en Chromium
    63.
-   Video en vivo dentro de la vista previa, en vez del logo.
-   Búsqueda (paso 5). No se incluyó el ícono del diseño hasta que funcione.
-   Guía de programación, que aparece en el diseño pero sigue fuera de
    alcance.
-   Guardar la copia de la lista en IndexedDB si la lista real no cabe en
    `localStorage`.

### Paso 4 --- TV En Vivo

-   Categorías y canales.
-   Reproductor con reconexión automática.
-   Opción simple para recargar el canal actual, por si el audio y el video
    se desincronizan. En M3U IPTV esto se corrige cambiando de canal y
    volviendo.

### Paso 5 --- Películas y series

-   Categorías, ficha, temporadas y episodios.
-   Búsqueda.
-   Selección de audio y subtítulos.
-   Progreso por perfil y «Continuar viendo». Durante este paso existe un
    único perfil predeterminado.
-   Siguiente episodio.

### Paso 6 --- Perfiles

-   Crear, cambiar y eliminar perfiles.
-   Favoritos e historial por perfil.

## 7. Guía del paso 1

### Requisitos

-   PC con Windows y televisor en la misma red.
-   Firmware del televisor actualizado.
-   Cuenta Samsung, necesaria para crear el certificado.

### Instalar en Windows

1.  Revisar los
    [requisitos](https://developer.samsung.com/smarttv/develop/tools/prerequisites.html).
2.  Instalar Tizen Studio desde el
    [instalador oficial](https://download.tizen.org/sdk/Installer/tizen-studio_6.1/).
3.  Abrir **Package Manager**, ir a la pestaña **Extension SDK** e
    instalar **TV Extensions** y **Samsung Certificate Extension**.
    Esta última debe ser la versión 2.0.73 o posterior, porque las
    anteriores ya no pueden crear certificados.

Se usará Tizen Studio para conectar el televisor y firmar. El código se
puede editar en VS Code. La documentación de la extensión de VS Code no
confirma que sirva para Tizen 5.0, por lo que no se depende de ella.

### Preparar el televisor

1.  Abrir **Smart Hub** y entrar a **Apps**.
2.  Ingresar **12345** con el control remoto o el teclado en pantalla
    (botón **123**). Si no funciona en **Apps**, probar en **App Settings**,
    al final de esa pantalla.
3.  Si el control no sirve, probar con el teclado de la app SmartThings o
    con un teclado USB.
4.  Activar **Developer mode** e ingresar la IP local del PC.
5.  Reiniciar el televisor. Al volver, debe aparecer «Develop Mode» en
    Apps.
6.  Anotar la IP del televisor desde los ajustes de red.

### Conectar

1.  En Tizen Studio, abrir **Tools > Device Manager**.
2.  Abrir **Remote Device Manager** y pulsar **+**.
3.  Ingresar nombre, IP y puerto del televisor, y luego **Add**.
4.  Seleccionarlo y activar **Connection**.

### Crear el certificado

1.  Abrir **Certificate Manager** y crear un perfil de tipo Samsung con
    la cuenta Samsung.
2.  Incluir el DUID del televisor. **No confundir** con el Unique ID: el
    dato correcto es el Unique Device ID.
3.  Respaldar el certificado, fuera del repositorio.

Los problemas de certificado son una causa común del error
`1010 : App install fail`.

### Probar

1.  Crear un proyecto web básico para TV.
2.  Clic derecho en el proyecto, **Run As > Tizen Web Application**.

## 8. Riesgos conocidos

-   **Audio DTS:** la documentación de Samsung indica que DTS no es
    compatible en los televisores de 2019. Un archivo con solo pista DTS
    se vería sin sonido. Las películas probadas hasta ahora no tienen DTS,
    por lo que sigue sin comprobarse. Si hay otra pista de audio se puede
    seleccionar. Si no, la aplicación mostrará un aviso claro, porque no
    se transcodifica.
-   **Desincronización en TV en vivo:** ocurre a veces en M3U IPTV y aún no
    se sabe si viene del stream o de esa aplicación. No se puede garantizar
    que no ocurra aquí, por lo que se incluye la recarga del canal (paso 4).
-   **Certificado:** no se encontró documentación oficial sobre qué pasa
    con una aplicación instalada cuando vence. Se debe anotar la fecha y
    probar la renovación antes de esa fecha.
-   **Modo desarrollador:** queda solo en la red local. No se expone el
    televisor ni el puerto a Internet.

## 9. Privacidad de la lista

-   El repositorio de GitHub es **público**. Antes de cada subida hay que
    revisar qué se incluye.
-   Las listas nunca se incluyen en el código ni en el repositorio, porque
    sus URLs pueden contener credenciales. Cada persona ingresa su propia URL
    en Configuración.
-   Tampoco se suben los certificados, sus contraseñas, los nombres reales de
    los perfiles ni las muestras de `prueba-tv/streams.local.js`.
-   `.gitignore` excluye todo lo anterior.

## 10. Documentación oficial

-   [Instalar el SDK de TV](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk.html)
-   [Probar en un televisor](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html)
-   [Motor web por año](https://developer.samsung.com/smarttv/develop/specifications/web-engine-specifications.html)
-   [Formatos de video de 2019](https://developer.samsung.com/smarttv/develop/specifications/media-specifications/2019-tv-video-specifications.html)

------------------------------------------------------------------------

**Estado actual:** paso 1 terminado, paso 2 casi terminado y paso 3 en curso.\
**Próximo hito:** cerrar lo pendiente del paso 2 con la lista real e instalar
la nueva interfaz en el televisor.
