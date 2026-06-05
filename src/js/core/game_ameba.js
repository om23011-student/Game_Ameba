import WebGLRenderer from '../complements/webgl_renderer.js'; 
import GridBuilder from '../complements/grid_builder.js';
import LineaBresenham from '../complements/algoritmo_bresenham.js'; 
import DibujarArcos from '../complements/algoritmo_arcos.js'; 
import AlgoritmoElipse from '../complements/algoritmo_elipse.js';
import WinDetector from './WinDetector.js';
import Motor from './Motor.js';
import GestorInterfaz from '../complements/GestorInterfaz.js';
import GestorEntradas from '../complements/GestorEntradas.js';

// =====================================================================
// INICIALIZADOR DEL JUEGO DESDE EL HTML
// =====================================================================
// Nos quedamos esperando a que el HTML nos pegue el grito de "startGame" para arrancar
window.addEventListener('startGame', (e) => {
    const config = e.detail;
    console.log("¡Dándole fuego al motor WebGL con esta config!:", config);
    iniciarJuegoWebGL(config);
});

function iniciarJuegoWebGL(config) {
    // =====================================================================
    // 1. CONFIGURACIÓN DEL CANVAS Y WEBGL
    // =====================================================================
    // Agarramos el canvas del DOM y le sacamos los poderes de WebGL
    const canvas = document.getElementById('miCanvas');
    const gl = canvas.getContext('webgl');
    // Por si alguien entra desde una tostadora sin soporte gráfico
    
    // =====================================================================
    // 2. INSTANCIACIÓN DE CLASES PRINCIPALES (LÓGICA Y RENDER)
    // =====================================================================
    // Instanciamos el modelo lógico de nuestro juego
    const juego = new WinDetector();
    juego.iniciarJuego(config.rows || 5, config.cols || 5);
    const motor = new Motor();
    
    // Instanciamos a nuestro trabajador estrella (el renderizador)
    const renderer = new WebGLRenderer(gl);
    renderer.setColor(0.8, 0.8, 0.8, 1.0);
    
    // Traemos a la banda de los algoritmos
    const generadorLineasBresenham = new LineaBresenham();
    const generadorArcos = new DibujarArcos();
    const generadorElipses = new AlgoritmoElipse();

    // =====================================================================
    // 3. IMPLEMENTACIÓN DEL GRID BUILDER
    // =====================================================================
    const gridBuilder = new GridBuilder(-0.9, 0.9, -0.9, 0.9);
    
    // Obtenemos los puntos para dibujar
    const puntosDelGrid = gridBuilder.generarPuntos(config.rows, config.cols);
    
    // Obtenemos las dimensiones de las celdas
    const { cellWidth, cellHeight } = gridBuilder.calcularDimensionesCelda(config.rows, config.cols);
    
    // Mantenemos las variables límite para que el mouse siga funcionando igual
    const xMin = gridBuilder.xMin;
    const xMax = gridBuilder.xMax;
    const yMin = gridBuilder.yMin;
    const yMax = gridBuilder.yMax;

    // =====================================================================
    // 4. ESTADO DE ANIMACIONES Y TABLERO
    // =====================================================================
    // === MATRIZ PARA CONTROLAR LA ANIMACIÓN DE CADA FICHA ===
    const reiniciarAlphas = () => {
        return Array(config.rows).fill().map(() => Array(config.cols).fill(0.0));
    };
    let alphaFichas = reiniciarAlphas(); // Inician todas invisibles (0.0)

    // Instanciamos el manejador de inputs (Mapeo WebGL -> Cuadrícula)
    const gestorEntradas = new GestorEntradas(canvas, xMin, xMax, yMin, yMax, cellWidth, cellHeight, config.rows, config.cols);

    // Variables para el evento Hover
    let cellHoverInfo = { fila: -1, col: -1 };

    // Evento de movimiento de ratón
    canvas.addEventListener('mousemove', (e) => {
        cellHoverInfo = gestorEntradas.obtenerCelda(e.clientX, e.clientY);
        renderizar(); // Redibujamos para mostrar el hover actualizado
    });

    // =====================================================================
    // 5. GESTIÓN DE TURNOS E INTERFAZ
    // =====================================================================
    let turnoJugador = true; // true = Jugador 1 (O), false = Jugador 2 (X)

    // Lógica del tablero UI de Turnos (ABSTRAÍDO)
    const gestorInterfaz = new GestorInterfaz();
    gestorInterfaz.configurarNombres(config.mode);
    gestorInterfaz.actualizarTurno(turnoJugador);

    // =====================================================================
    // 6. FUNCIONES PRINCIPALES DEL FLUJO DE JUEGO
    // =====================================================================
    // Función auxiliar para verificar ganador y cambiar turno
    const checkWinStateAndToggle = () => {
        const resultado = juego.verificarGanador();
        renderizar(); // Redibujamos para mostrar la ficha recién colocada antes de mostrar el resultado

        // Elementos del DOM
        const pantallaResultado = document.getElementById('pantallaResultado');
        const lblResultado = document.getElementById('lblResultado');

        // Extraemos la información del HTML para cotejarla
        const comboBox = document.getElementById('player-symbol');
        const simboloJ1DOM = comboBox ? comboBox.value : config.symbol;

        if (resultado.estado === "ganador") {
            // Internamente 'true' representa los movimientos del Jugador 1
            const esGanadorJugador1 = (resultado.ganador === true);

            setTimeout(() => {
                // 1. Inyectamos el texto correspondiente en el label
                if (esGanadorJugador1) {
                    lblResultado.textContent = "¡Ganador: Jugador 1!";
                } else {
                    lblResultado.textContent = `¡Ganador: Jugador 2${config.mode !== 'pvp' ? ' (Motor)' : ''}!`;
                }

                // 2. Volvemos activo el mensaje quitando la clase 'oculto'
                pantallaResultado.classList.remove('oculto');

                // Reinicios de lógica interna (solo si no es EvE)
                if (config.mode !== 'eve') {
                    juego.reiniciarTablero();
                    alphaFichas = reiniciarAlphas(); 
                    turnoJugador = true;
                    gestorInterfaz.actualizarTurno(turnoJugador);
                }
            }, 50);

        } else if (resultado.estado === "empate") {
            setTimeout(() => {
                // 1. Inyectamos el texto de empate
                lblResultado.textContent = "¡Empate!";

                // 2. Mostramos la pantalla quitando 'oculto'
                pantallaResultado.classList.remove('oculto');

                if (config.mode !== 'eve') {
                    juego.reiniciarTablero();
                    alphaFichas = reiniciarAlphas(); 
                    turnoJugador = true;
                    gestorInterfaz.actualizarTurno(turnoJugador);
                }
            }, 50);

        } else {
            // Si no hay fin de juego, cambiamos de turno normalmente
            turnoJugador = !turnoJugador;
            gestorInterfaz.actualizarTurno(turnoJugador);
        }

        return resultado;
    };

    // Evento para cerrar la pantalla de resultados
    document.getElementById('btnReiniciar').addEventListener('click', () => {
        document.getElementById('pantallaResultado').classList.add('oculto');
        // Aquí puedes añadir lógica extra si necesitas limpiar el canvas antes de la próxima ronda
    });

    // Función para que la IA (Motor) haga su jugada automáticamente
    const jugarTurnoIA = () => {
        // Invocamos nuestra función para obtener el rango de tiempo (humanizado o de exhibición)
        const tiempoDeEspera = motor.obtenerTiempoPensamiento(config.mode);
        
        setTimeout(() => {
            // Evaluamos si el juego fue abortado por un reinicio manual
            if (signal.aborted) return;
            
            const movimientoIA = motor.obtenerMejorMovimiento(juego.tablero);
            
            if (movimientoIA) {
                const colocado = juego.colocarFicha(movimientoIA.fila, movimientoIA.columna, turnoJugador);
                if (colocado) {
                    tiempoFrameAnterior = performance.now(); // Reseteamos el reloj
                    renderizar();                            // Despertamos el canvas
                    const resultado = checkWinStateAndToggle();
                    // Si estamos en demo (eve) y el juego sigue, mandamos el siguiente turno de IA
                    if (resultado.estado !== "ganador" && resultado.estado !== "empate" && config.mode === 'eve') {
                        jugarTurnoIA();
                    }
                }
            }
        }, tiempoDeEspera); // <- Le pasamos el tiempo generado de forma humana
    };

    // Función para arrancar el choque IA vs IA
    const iniciarCicloDemo = () => {
        if (config.mode === 'eve' && !signal.aborted) {
            jugarTurnoIA();
        }
    };

    // =====================================================================
    // 7. CONTROLADORES DE EVENTOS Y ABORTOS (LIMPIEZA)
    // =====================================================================
    // Destruimos los eventos de la partida anterior (si existen)
    if (window.gameAborter) {
        window.gameAborter.abort(); // ¡Mata los eventos viejos!
    }
    
    // Creamos un nuevo controlador para esta partida
    window.gameAborter = new AbortController();
    const signal = window.gameAborter.signal;
    
    // Si empezó el modo EVE (Demo), disparamos la primera jugada directamente
    if (config.mode === 'eve') {
        setTimeout(iniciarCicloDemo, 500); // Un pequeño retardo inicial para la primera ficha
    }

    // =====================================================================
    // 8. EVENTOS DE INTERACCIÓN DEL USUARIO
    // =====================================================================
    // Le pasamos el 'signal' al evento del canvas
    canvas.addEventListener('click', (e) => {
        // VERIFICACIONES CONDICIONALES PARA SEPARAR LA LÓGICA DE MODOS
        
        // MODO Máquina vs Máquina (eve): Ignorar totalmente los clicks del usuario
        if (config.mode === 'eve') {
            return; 
        }
        
        // MODO 1vsMáquina (pve): Solo se permite jugar si es turno del humano
        if (config.mode === 'pve' && turnoJugador === false) {
            return;
        }
        
        // MODO 1vs1 (pvp) o 1vsMáquina (turno válido del humano): Realizar la jugada
        if(cellHoverInfo.fila !== -1 && cellHoverInfo.col !== -1) {
            const colocado = juego.colocarFicha(cellHoverInfo.fila, cellHoverInfo.col, turnoJugador);
            
            if (colocado) {
                const resultado = checkWinStateAndToggle();
                // Si el juego continuó y estamos en modo PVE y es el turno del AI
                if (resultado.estado !== "ganador" && resultado.estado !== "empate" && config.mode === 'pve' && !turnoJugador) {
                    jugarTurnoIA(); // Mandamos a llamar a la IA
                }
            }
        }
        
        tiempoFrameAnterior = performance.now(); // Reseteamos el reloj
        renderizar();

    }, { signal: signal }); 

    // También le pasamos el 'signal' a tu botón de reinicio
    const btnRestart = document.getElementById('btn-restart');
    btnRestart.addEventListener('click', () => {
        juego.reiniciarTablero(); 
        alphaFichas = reiniciarAlphas(); // Reiniciamos animaciones al limpiar el tablero
        turnoJugador = true; 
        gestorInterfaz.actualizarTurno(turnoJugador);
        cellHoverInfo.col = -1;
        cellHoverInfo.fila = -1;
    }, { signal: signal }); 



    // =====================================================================
    // 9. Dibujado y animación basada en tiempo (Delta Time)
    // =====================================================================
    // Variables globales (o de clase) para controlar el tiempo y el estado del render
    const duracionAnimacionMs = 800; // La ficha tardará 400 milisegundos en aparecer al 100%
    let animacionActiva = false;     // Bandera para saber si el loop está corriendo
    let tiempoFrameAnterior = 0;     // Para calcular el Delta Time
    function renderizar(tiempoActual = performance.now()) {
        renderer.limpiar();
        
        // Calculamos cuánto tiempo pasó desde la última vez que se llamó la función
        const deltaTime = tiempoActual - tiempoFrameAnterior;
        tiempoFrameAnterior = tiempoActual;
        
        // Bandera local: si encontramos al menos una ficha que no ha llegado a alpha 1.0, se pondrá en true
        let hayAnimacionesPendientes = false;

        // =====================================================================
        // 9.1 Dibujamos el Hover (Igual que antes)
        // =====================================================================
        if(cellHoverInfo.fila !== -1 && cellHoverInfo.col !== -1) {
            if(juego.tablero[cellHoverInfo.fila][cellHoverInfo.col] === null) {
                const cx1 = xMin + cellHoverInfo.col * cellWidth;
                const cx2 = cx1 + cellWidth;
                const cy1 = yMax - cellHoverInfo.fila * cellHeight; 
                const cy2 = cy1 - cellHeight; 
                
                const puntosHover = [
                    cx1, cy1, 0,  cx2, cy1, 0,  cx1, cy2, 0,
                    cx1, cy2, 0,  cx2, cy1, 0,  cx2, cy2, 0
                ];
                
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                
                if (turnoJugador) {
                    renderer.setColor(0.0, 1.0, 0.0, 0.3);
                } else {
                    renderer.setColor(0.0, 0.0, 1.0, 0.3);
                }
                
                renderer.dibujar(puntosHover, true, gl.TRIANGLES);
                gl.disable(gl.BLEND);
            }
        }

        // =====================================================================
        // 9.2 Dibujamos la cuadrícula oficial
        // =====================================================================
        renderer.setColor(0.8, 0.8, 0.8, 1.0);
        renderer.dibujar(puntosDelGrid, false, gl.POINTS);
        
        // =====================================================================
        // 9.3 DIBUJAMOS LAS PIEZAS X y O EN EL TABLERO
        // =====================================================================
        for (let r = 0; r < config.rows; r++) {
            for (let c = 0; c < config.cols; c++) {
                
                const ficha = juego.tablero[r][c];
                
                if (ficha !== null) {
                    const cx = xMin + (c * cellWidth) + (cellWidth / 2);
                    const cy = yMax - (r * cellHeight) - (cellHeight / 2);
                    const sizeX = cellWidth * 0.35; 
                    const sizeY = cellHeight * 0.35;
                    let puntosFigura = []; 

                    // ---------------------------------------------------------
                    // LÓGICA DE ANIMACIÓN BASADA EN TIEMPO (Delta Time)
                    // ---------------------------------------------------------
                    if (alphaFichas[r][c] < 1.0) {
                        // Incrementamos el alpha según los milisegundos que pasaron
                        alphaFichas[r][c] += deltaTime / duracionAnimacionMs; 
                        
                        if (alphaFichas[r][c] >= 1.0) {
                            alphaFichas[r][c] = 1.0; // Tope
                        } else {
                            hayAnimacionesPendientes = true; // Avisamos que esta ficha sigue animándose
                        }
                    }
                    const alfaActual = alphaFichas[r][c];

                    // ---------------------------------------------------------
                    // PASOS RESTANTES: COLOR, GEOMETRÍA Y RENDER
                    // ---------------------------------------------------------
                    const esJugador1 = (ficha === true);
                    const dibujaEquis = (config.symbol === 'X' && esJugador1) || 
                                        (config.symbol === '0' && !esJugador1);

                    gl.enable(gl.BLEND);
                    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

                    if (esJugador1) {
                        renderer.setColor(0.0, 1.0, 0.0, alfaActual); 
                    } else {
                        renderer.setColor(0.0, 0.0, 1.0, alfaActual); 
                    }

                    if (!dibujaEquis) {
                        puntosFigura = generadorElipses.calcularCirculo(cx, cy, sizeX - 0.01);
                    } else {
                        const linea1 = generadorLineasBresenham.calcularBresenham(cx - sizeX, cy + sizeY, cx + sizeX, cy - sizeY);
                        const linea2 = generadorLineasBresenham.calcularBresenham(cx - sizeX, cy - sizeY, cx + sizeX, cy + sizeY);
                        puntosFigura = [...linea1, ...linea2];
                    }

                    if (puntosFigura.length > 0) {
                        renderer.dibujar(puntosFigura, false, gl.POINTS);
                    }

                    gl.disable(gl.BLEND);
                }
            }
        }

        // =====================================================================
        // CONTROL DEL MOTOR DE RENDERIZADO (El "Despertador")
        // =====================================================================
        if (hayAnimacionesPendientes) {
            animacionActiva = true;
            // Pide el siguiente frame y le pasa el tiempo actual automáticamente
            requestAnimationFrame(renderizar); 
        } else {
            // Cuando todas las fichas están en alpha 1.0, se apaga para no consumir recursos
            animacionActiva = false;
        }
    }

    
}