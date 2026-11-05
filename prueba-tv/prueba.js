(function () {
  var KEY = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, ENTER: 13, RETURN: 10009 };
  var SEEK_MS = 30000;
  var pruebas = window.PRUEBAS || [];
  var avplay = window.webapis && window.webapis.avplay;

  var menu = document.getElementById('menu');
  var lista = document.getElementById('lista');
  var info = document.getElementById('info');
  var subtitulo = document.getElementById('subtitulo');

  var seleccion = 0;
  var actual = null;
  var estado = '';
  var error = '';
  var buffer = '';
  var pausado = false;
  var tracks = { VIDEO: [], AUDIO: [], TEXT: [] };
  var audioIndice = 0;
  var textoIndice = -1;
  var silencio = false;
  var subEventos = 0;
  var subUltimo = '';
  var aperturas = contarAperturas();

  function contarAperturas() {
    try {
      var total = parseInt(localStorage.getItem('aperturas') || '0', 10) + 1;
      localStorage.setItem('aperturas', String(total));
      return total;
    } catch (e) {
      return 'sin almacenamiento';
    }
  }

  function pintarMenu() {
    document.getElementById('ayuda').textContent =
      'Arriba/Abajo elegir, Enter reproducir, Volver salir. Aperturas de la app: ' + aperturas;
    lista.innerHTML = '';
    pruebas.forEach(function (prueba, i) {
      var fila = document.createElement('div');
      fila.className = 'item' + (i === seleccion ? ' activo' : '');
      var tipo = document.createElement('span');
      tipo.className = 'tipo';
      tipo.textContent = prueba.tipo;
      fila.appendChild(tipo);
      fila.appendChild(document.createTextNode(prueba.nombre));
      lista.appendChild(fila);
    });
  }

  function reloj(ms) {
    var s = Math.floor((ms || 0) / 1000);
    var m = Math.floor(s / 60);
    return Math.floor(m / 60) + ':' + ('0' + (m % 60)).slice(-2) + ':' + ('0' + (s % 60)).slice(-2);
  }

  function extra(track) {
    try {
      return JSON.parse(track.extra_info);
    } catch (e) {
      return {};
    }
  }

  function describir(track) {
    var d = extra(track);
    if (track.type === 'VIDEO') {
      return (d.fourCC || '?') + ' ' + (d.Width || '?') + 'x' + (d.Height || '?');
    }
    if (track.type === 'AUDIO') {
      return (d.fourCC || '?') + ' ' + (d.language || '?') + ' ' + (d.channels || '?') + 'ch';
    }
    return (d.fourCC || d.subtitle_type || '?') + ' ' + (d.track_lang || '?');
  }

  function listar(tipo, indice) {
    if (!tracks[tipo].length) {
      return 'ninguna';
    }
    return tracks[tipo].map(function (track, i) {
      return (i === indice ? '>' : '') + describir(track);
    }).join(' | ');
  }

  function pintarInfo() {
    var tiempo = '-';
    var duracion = 0;
    try {
      tiempo = reloj(avplay.getCurrentTime());
      duracion = avplay.getDuration();
    } catch (e) {
      tiempo = '-';
    }
    info.textContent =
      actual.tipo + ': ' + actual.nombre + '\n' +
      'Estado: ' + estado + (pausado ? ' (pausa)' : '') + (buffer ? '  Buffer: ' + buffer : '') + '\n' +
      'Tiempo: ' + tiempo + ' / ' + reloj(duracion) + '\n' +
      'Video: ' + listar('VIDEO', 0) + '\n' +
      'Audio: ' + listar('AUDIO', audioIndice) + '\n' +
      'Subtitulos: ' + listar('TEXT', textoIndice) + '\n' +
      'Prueba subt.: pista ' + (textoIndice < 0 ? 'ninguna' : textoIndice + 1) + ', silencio=' + silencio +
      ', eventos=' + subEventos + ', ultimo=' + subUltimo.slice(0, 70) + '\n' +
      (error ? 'ERROR: ' + error + '\n' : '') +
      'Enter pausa | Izq/Der 30 s | Arriba audio | Abajo subtitulos | Volver lista';
    info.className = error ? 'error' : '';
  }

  function leerTracks() {
    tracks = { VIDEO: [], AUDIO: [], TEXT: [] };
    try {
      avplay.getTotalTrackInfo().forEach(function (track) {
        if (tracks[track.type]) {
          tracks[track.type].push(track);
        }
      });
    } catch (e) {
      error = 'pistas: ' + e.message;
    }
  }

  function fallar(mensaje) {
    error = mensaje;
    estado = 'fallo';
    pintarInfo();
  }

  function reproducir(prueba) {
    actual = prueba;
    estado = 'preparando';
    error = '';
    buffer = '';
    pausado = false;
    audioIndice = 0;
    textoIndice = -1;
    silencio = false;
    subEventos = 0;
    subUltimo = '';
    tracks = { VIDEO: [], AUDIO: [], TEXT: [] };
    menu.style.display = 'none';
    info.style.display = 'block';
    subtitulo.style.display = 'none';
    pintarInfo();

    try {
      avplay.open(prueba.url);
      avplay.setDisplayRect(0, 0, 1920, 1080);
      avplay.setDisplayMethod('PLAYER_DISPLAY_MODE_AUTO_ASPECT_RATIO');
      avplay.setListener({
        onbufferingstart: function () { buffer = '0%'; pintarInfo(); },
        onbufferingprogress: function (p) { buffer = p + '%'; pintarInfo(); },
        onbufferingcomplete: function () { buffer = ''; pintarInfo(); },
        oncurrentplaytime: function () { pintarInfo(); },
        onstreamcompleted: function () { estado = 'terminado'; pintarInfo(); },
        onerror: function (tipo) { fallar(String(tipo)); },
        onsubtitlechange: function (duracion, texto) {
          subEventos += 1;
          subUltimo = String(texto);
          subtitulo.textContent = texto;
          subtitulo.style.display = 'block';
          pintarInfo();
        }
      });
      avplay.prepareAsync(function () {
        leerTracks();
        avplay.play();
        estado = 'reproduciendo';
        pintarInfo();
      }, function (e) {
        fallar('preparar: ' + (e.name || e.message || e));
      });
    } catch (e) {
      fallar('abrir: ' + e.message);
    }
  }

  function detener() {
    try {
      avplay.stop();
      avplay.close();
    } catch (e) {
      error = '';
    }
    actual = null;
    info.style.display = 'none';
    subtitulo.style.display = 'none';
    menu.style.display = 'block';
    pintarMenu();
  }

  function siguienteAudio() {
    if (tracks.AUDIO.length < 2) {
      return;
    }
    audioIndice = (audioIndice + 1) % tracks.AUDIO.length;
    try {
      avplay.setSelectTrack('AUDIO', tracks.AUDIO[audioIndice].index);
    } catch (e) {
      error = 'cambiar audio: ' + e.message;
    }
  }

  function siguienteTexto() {
    if (!tracks.TEXT.length) {
      return;
    }
    // The docs are ambiguous about setSilentSubtitle, so each track is tried with both values.
    if (textoIndice >= 0 && !silencio) {
      silencio = true;
    } else {
      silencio = false;
      textoIndice = textoIndice + 1 >= tracks.TEXT.length ? -1 : textoIndice + 1;
    }
    subEventos = 0;
    subUltimo = '';
    subtitulo.style.display = 'none';
    try {
      if (textoIndice < 0) {
        avplay.setSilentSubtitle(true);
      } else {
        avplay.setSelectTrack('TEXT', tracks.TEXT[textoIndice].index);
        avplay.setSilentSubtitle(silencio);
      }
    } catch (e) {
      error = 'cambiar subtitulos: ' + e.message;
    }
  }

  function saltar(ms) {
    var ok = function () { pintarInfo(); };
    var mal = function (e) { error = 'saltar: ' + (e.name || e); pintarInfo(); };
    try {
      if (ms > 0) {
        avplay.jumpForward(ms, ok, mal);
      } else {
        avplay.jumpBackward(-ms, ok, mal);
      }
    } catch (e) {
      error = 'saltar: ' + e.message;
    }
  }

  function pausarOContinuar() {
    try {
      if (pausado) {
        avplay.play();
      } else {
        avplay.pause();
      }
      pausado = !pausado;
    } catch (e) {
      error = 'pausa: ' + e.message;
    }
  }

  function teclaMenu(tecla) {
    if (tecla === KEY.UP || tecla === KEY.DOWN) {
      var paso = tecla === KEY.UP ? -1 : 1;
      seleccion = (seleccion + paso + pruebas.length) % pruebas.length;
      pintarMenu();
    } else if (tecla === KEY.ENTER && pruebas.length) {
      reproducir(pruebas[seleccion]);
    } else if (tecla === KEY.RETURN) {
      tizen.application.getCurrentApplication().exit();
    }
  }

  function teclaReproductor(tecla) {
    if (tecla === KEY.RETURN) {
      detener();
      return;
    }
    if (tecla === KEY.ENTER) {
      pausarOContinuar();
    } else if (tecla === KEY.LEFT) {
      saltar(-SEEK_MS);
    } else if (tecla === KEY.RIGHT) {
      saltar(SEEK_MS);
    } else if (tecla === KEY.UP) {
      siguienteAudio();
    } else if (tecla === KEY.DOWN) {
      siguienteTexto();
    }
    pintarInfo();
  }

  document.addEventListener('keydown', function (event) {
    if (actual) {
      teclaReproductor(event.keyCode);
    } else {
      teclaMenu(event.keyCode);
    }
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden && actual) {
      detener();
    }
  });

  pintarMenu();
})();
