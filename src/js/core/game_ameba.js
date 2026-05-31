import WebGLRenderer from '../complements/webgl_renderer.js'; 
import GridBuilder from '../complements/grid_builder.js';
import LineaBresenham from '../complements/algoritmo_bresenham.js'; 
import DibujarArcos from '../complements/algoritmo_arcos.js'; 
import AlgoritmoElipse from '../complements/algoritmo_elipse.js';
import WinDetector from './WinDetector.js';

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

    // 2. Instanciamos a nuestro trabajador estrella (el renderizador)
    const renderer = new WebGLRenderer(gl);
    renderer.setColor(0.8, 0.8, 0.8, 1.0);

    // 3. Traemos a la banda de los algoritmos (LineaDDA ya no está aquí)
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

    // 1. Destruimos los eventos de la partida anterior (si existen)
    if (window.gameAborter) {
        window.gameAborter.abort(); // ¡Mata los eventos viejos!
    }
    // Creamos un nuevo controlador para esta partida
    window.gameAborter = new AbortController();
    const signal = window.gameAborter.signal;


    // 2. Le pasamos el 'signal' al evento del canvas
    canvas.addEventListener('click', (e) => {
        if(cellHoverInfo.fila !== -1 && cellHoverInfo.col !== -1) {
            
            const colocado = juego.colocarFicha(cellHoverInfo.fila, cellHoverInfo.col, turnoJugador);

            if (colocado) {
                const resultado = juego.verificarGanador();
                const figuraSeleccionada = document.getElementById('player-symbol').value;
                
                if (resultado.estado === "ganador") {
                    
                    if (resultado.fichaGanadora === figuraSeleccionada) {
                        setTimeout(() => {
                            alert("¡Ganador: Jugador 1!");
                            juego.reiniciarTablero(); 
                        }, 50);
                    } else {
                        setTimeout(() => {
                            alert("¡Ganador: Jugador 2!");
                            juego.reiniciarTablero(); 
                        }, 50);
                    }
                } else if (resultado.estado === "empate") {
                    setTimeout(() => {
                        alert("¡Empate!");
                        juego.reiniciarTablero(); 
                    }, 50);
                }

                if (resultado.estado !== "ganador") {
                    turnoJugador = !turnoJugador;
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

                    // 3. Verificamos qué figura es
                    if (ficha === true) {
                        // === ES EL TURNO DEL JUGADOR 1 (CERO) ===
                        renderer.setColor(0.0, 1.0, 0.0, 1.0); // Verde
                        
                        const dibujarElipse = generadorElipses.calcularElipse(cx, cy, sizeX, sizeY, 50);
                        renderer.dibujar(dibujarElipse, false);

                    } else if (ficha === false) {
                        // === ES EL TURNO DEL JUGADOR 2 (EQUIS) ===
                        renderer.setColor(0.0, 0.0, 1.0, 1.0); // Azul
                        
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