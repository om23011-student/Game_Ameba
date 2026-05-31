import WebGLRenderer from '../complements/webgl_renderer.js'; 
import GridBuilder from '../complements/grid_builder.js';
import LineaBresenham from '../complements/algoritmo_bresenham.js'; 
import DibujarArcos from '../complements/algoritmo_arcos.js'; 
import AlgoritmoElipse from '../complements/algoritmo_elipse.js';
import WinDetector from './WinDetector.js';
import Motor from './Motor.js';
// Nos quedamos esperando a que el HTML nos pegue el grito de "startGame" para arrancar
window.addEventListener('startGame', (e) => {
    const config = e.detail;
    console.log("¡Dándole fuego al motor WebGL con esta config!:", config);
    iniciarJuegoWebGL(config);
});
function iniciarJuegoWebGL(config) {
    // 1. Agarramos el canvas del DOM y le sacamos los poderes de WebGL
    const canvas = document.getElementById('miCanvas');
    const gl = canvas.getContext('webgl');
    // Por si alguien entra desde una tostadora sin soporte gráfico
    if (!gl) {
        console.error("Uy, tu navegador no aguanta WebGL bro :(");
        return;
    }
    // Instanciamos el modelo lógico de nuestro juego!
    const juego = new WinDetector();
    juego.iniciarJuego(config.rows || 5, config.cols || 5);
    const motor = new Motor();
    // 2. Instanciamos a nuestro trabajador estrella (el renderizador)
    const renderer = new WebGLRenderer(gl);
    renderer.setColor(0.8, 0.8, 0.8, 1.0);
    // 3. Traemos a la banda de los algoritmos
    const generadorLineasBresenham = new LineaBresenham();
    const generadorArcos = new DibujarArcos();
    const generadorElipses = new AlgoritmoElipse();
    // =====================================================================
    // 4. NUEVA IMPLEMENTACIÓN DEL GRID BUILDER
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
    // Variables para el evento Hover
    let cellHoverInfo = { fila: -1, col: -1 };
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        // Coordenadas locales dentro del canvas
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        // Convertir de px a rango Normalizado (-1, 1) para cuadrar con WebGL
        const normX = (mouseX / canvas.width) * 2 - 1;
        const normY = (1 - (mouseY / canvas.height)) * 2 - 1; // Invertimos Y en WebGL
        // Verificar si click está dentro de los márgenes del Grid (0.9 limit)
        if(normX >= xMin && normX <= xMax && normY >= yMin && normY <= yMax) {
            // X recorre las columnas de izq a der
            const c = Math.floor((normX - xMin) / cellWidth);
            // Y recorre las filas de arriba a abajo, normY decrece.
            // Para indexarlo de top(0) a bottom(rows), hacemos:
            const r = Math.floor((yMax - normY) / cellHeight);
            // Asegurar que no nos pasemos de array (por ejemplo col=cols por culpa del borde exacto)
            const finalCol = Math.min(c, config.cols - 1);
            const finalFila = Math.min(r, config.rows - 1);
            cellHoverInfo.col = finalCol;
            cellHoverInfo.fila = finalFila;
        } else {
            // Fuera de limites
            cellHoverInfo.col = -1;
            cellHoverInfo.fila = -1;
        }
    });
    let turnoJugador = true; // true = Jugador 1 (O), false = Jugador 2 (X)
    // Agregamos una función auxiliar para mostrar mensajes (para no bloquear en modo DEMO)
    const mostrarMensaje = (msg) => {
        alert(msg);
    };
    // Agregamos una función auxiliar para verificar ganador y cambiar turno
    const checkWinStateAndToggle = () => {
        const resultado = juego.verificarGanador();
        
        if (resultado.estado === "ganador") {
            // El WinDetector determina quién gana devolviendo el mismo valor booleano con el que se colocó la ficha
            // Como 'turnoJugador = true' siempre se asigna al Jugador 1, si 'resultado.ganador === true' ganó el 1
            if (resultado.ganador === true) {
                setTimeout(() => {
                    mostrarMensaje("¡Ganador: Jugador 1!");
                    
                    if (config.mode !== 'eve') {
                        juego.reiniciarTablero();
                        turnoJugador = true;
                    }
                }, 50);
            } else {
                setTimeout(() => {
                    mostrarMensaje(`¡Ganador: Jugador 2${config.mode !== 'pvp' ? ' (Motor)' : ''}!`);
                    
                    if (config.mode !== 'eve') {
                        juego.reiniciarTablero();
                        turnoJugador = true;
                    }
                }, 50);
            }
        } else if (resultado.estado === "empate") {
            setTimeout(() => {
                mostrarMensaje("¡Empate!");
                if (config.mode !== 'eve') {
                    juego.reiniciarTablero();
                    turnoJugador = true;
                }
            }, 50);
        } else {
            turnoJugador = !turnoJugador;
        }
        return resultado;
    };
    // Función para que la IA (Motor) haga su jugada automáticamente
    const jugarTurnoIA = () => {
        // C) Invocamos nuestra función para obtener el rango de tiempo (humanizado o de exhibición)
        const tiempoDeEspera = motor.obtenerTiempoPensamiento(config.mode);
        setTimeout(() => {
            // Evaluamos si el juego fue abortado por un reinicio manual
            if (signal.aborted) return;
            const movimientoIA = motor.obtenerMejorMovimiento(juego.tablero);
            if (movimientoIA) {
                const colocado = juego.colocarFicha(movimientoIA.fila, movimientoIA.columna, turnoJugador);
                if (colocado) {
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
    // 1. Destruimos los eventos de la partida anterior (si existen)
    if (window.gameAborter) {
        window.gameAborter.abort(); // ¡Mata los eventos viejos!
    }
    // Creamos un nuevo controlador para esta partida
    window.gameAborter = new AbortController();
    const signal = window.gameAborter.signal;
    // Si empezó el modo EVE (Demo), disparamos la primera jugada directamente!
    if (config.mode === 'eve') {
        setTimeout(iniciarCicloDemo, 500); // Un pequeño retardo inicial para la primera ficha
    }
    // 2. Le pasamos el 'signal' al evento del canvas
    canvas.addEventListener('click', (e) => {
        // B) VERIFICACIONES CONDICIONALES PARA SEPARAR LA LÓGICA DE MODOS
        // MODO Máquina vs Máquina (eve): Ignorar totalmente los clicks del usuario
        if (config.mode === 'eve') {
            return; 
        }
        // MODO 1vsMáquina (pve): Solo se permite jugar si el valor es true (turno del humano), ignorarlo si es falso
        if (config.mode === 'pve' && turnoJugador === false) {
            return;
        }
        // MODO 1vs1 (pvp) o 1vsMáquina (turno válido del humano): Procederemos a realizar la jugada
        if(cellHoverInfo.fila !== -1 && cellHoverInfo.col !== -1) {
            const colocado = juego.colocarFicha(cellHoverInfo.fila, cellHoverInfo.col, turnoJugador);
            if (colocado) {
                const resultado = checkWinStateAndToggle();
                // Si el juego continuó y estamos en modo Jugador vs PC (PVE) y es el turno del AI (false)
                if (resultado.estado !== "ganador" && resultado.estado !== "empate" && config.mode === 'pve' && !turnoJugador) {
                    jugarTurnoIA(); // Mandamos a llamar a la Inteligencia Artificial para que ejecute su acción
                }
            }
        }
    }, { signal: signal }); 
    // 3. También le pasamos el 'signal' a tu botón de reinicio
    const btnRestart = document.getElementById('btn-restart');
    btnRestart.addEventListener('click', () => {
        juego.reiniciarTablero(); 
        turnoJugador = true; 
        cellHoverInfo.col = -1;
        cellHoverInfo.fila = -1;
    }, { signal: signal }); 
    // 4. Ciclo de Animación / Redibujado
    function renderLoop() {
        renderer.limpiar();
        // 4.1 Dibujamos el Hover (Si existe, y si está vacío el tablero en esa posición)
        if(cellHoverInfo.fila !== -1 && cellHoverInfo.col !== -1) {
            // Revisa el core a ver si está vacía
            if(juego.tablero[cellHoverInfo.fila][cellHoverInfo.col] === null) {
                // Calculamos las 4 esquinas del cuadrito que tenemos enfocado
                const cx1 = xMin + cellHoverInfo.col * cellWidth;
                const cx2 = cx1 + cellWidth;
                const cy1 = yMax - cellHoverInfo.fila * cellHeight; // Esquina superior
                const cy2 = cy1 - cellHeight; // Esquina inferior
                // Puntos para un cuadrado (2 triangulos)
                const puntosHover = [
                    cx1, cy1, 0,  cx2, cy1, 0,  cx1, cy2, 0,
                    cx1, cy2, 0,  cx2, cy1, 0,  cx2, cy2, 0
                ];
                // Color según el turno
                if (turnoJugador) {
                    renderer.setColor(0.0, 1.0, 0.0, 0.3); // Verde - Jugador 1
                } else {
                    renderer.setColor(0.0, 0.0, 1.0, 0.3); // Azul - Jugador 2
                }
                renderer.dibujar(puntosHover, true, gl.TRIANGLES);
            }
        }
        // 4.2 Dibujamos la cuadrícula oficial
        renderer.setColor(0.8, 0.8, 0.8, 1.0); // Retomamos gris claro para grid
        renderer.dibujar(puntosDelGrid, false, gl.POINTS);
        // =====================================================================
        // 4.3 DIBUJAMOS LAS PIEZAS X y O EN EL TABLERO
        // =====================================================================
        // Iteramos por todas las filas y columnas de nuestro tablero lógico
        for (let r = 0; r < config.rows; r++) {
            for (let c = 0; c < config.cols; c++) {
                const ficha = juego.tablero[r][c];
                // Si la celda no está vacía, calculamos su centro y dibujamos
                if (ficha !== null) {
                    // 1. Calculamos el CENTRO EXACTO de la celda (cx, cy)
                    const cx = xMin + (c * cellWidth) + (cellWidth / 2);
                    const cy = yMax - (r * cellHeight) - (cellHeight / 2);
                    // 2. Definimos un tamaño para la figura
                    const sizeX = cellWidth * 0.35; 
                    const sizeY = cellHeight * 0.35;

                    let puntosFigura = []; 

                    // 3. Verificamos qué figura dibujar de acuerdo al input del usuario (config.symbol)
                    const esJugador1 = (ficha === true);
                    const dibujaEquis = (config.symbol === 'X' && esJugador1) || (config.symbol === '0' && !esJugador1);

                    if (!dibujaEquis) {
                        // === DIBUJAR CERO ===
                        // Jugador 1 es verde y 2 es azul para diferenciar, aunque combinen la figura
                        if (esJugador1) renderer.setColor(0.0, 1.0, 0.0, 1.0); 
                        else renderer.setColor(0.0, 0.0, 1.0, 1.0);
                        
                        const dibujarElipse = generadorElipses.calcularElipse(cx, cy, sizeX, sizeY, 50);
                        renderer.dibujar(dibujarElipse, false);

                    } else {
                        // === DIBUJAR EQUIS ===
                        if (esJugador1) renderer.setColor(0.0, 1.0, 0.0, 1.0); 
                        else renderer.setColor(0.0, 0.0, 1.0, 1.0);
                        
                        const linea1 = generadorLineasBresenham.calcularBresenham(cx - sizeX, cy + sizeY, cx + sizeX, cy - sizeY);
                        const linea2 = generadorLineasBresenham.calcularBresenham(cx - sizeX, cy - sizeY, cx + sizeX, cy + sizeY);
                        puntosFigura = [...linea1, ...linea2];
                        renderer.dibujar(puntosFigura, false);
                    }

                    // 4. Mandamos a dibujar la figura que hayamos cargado
                    if (puntosFigura.length > 0) {
                        renderer.dibujar(puntosFigura, false, gl.POINTS);
                    }
                }
            }
        }
        requestAnimationFrame(renderLoop);
    }
    // Inicia el render loop
    renderLoop();
}
