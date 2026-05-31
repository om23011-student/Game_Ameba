import WebGLRenderer from '../complements/webgl_renderer.js'; 
import LineaDDA from '../complements/algoritmo_dda.js'; 
import LineaBresenham from '../complements/algoritmo_bresenham.js'; 
import DibujarArcos from '../complements/algoritmo_arcos.js'; 
import AlgoritmoElipse from '../complements/algoritmo_elipse.js';

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

    // 3. Traemos a la banda de los algoritmos
    const generadorLineas = new LineaDDA();
    const generadorLineasBresenham = new LineaBresenham();
    const generadorArcos = new DibujarArcos();
    const generadorElipses = new AlgoritmoElipse();

    // Implementamos la cuadrícula (Grid) usando el algoritmo DDA
    const puntosDelGrid = [];

    // Vamos a dejar un pequeño margen (de -0.9 a 0.9)
    const xMin = -0.9;
    const xMax = 0.9;
    const yMin = -0.9;
    const yMax = 0.9;

    // Lineas verticales
    for(let i = 0; i <= config.cols; i++) {
        const x = xMin + (i / config.cols) * (xMax - xMin);
        const linea = generadorLineas.calcularDDA(x, yMin, x, yMax);
        puntosDelGrid.push(...linea);
    }

    // Lineas horizontales
    for(let i = 0; i <= config.rows; i++) {
        const y = yMin + (i / config.rows) * (yMax - yMin);
        const linea = generadorLineas.calcularDDA(xMin, y, xMax, y);
        puntosDelGrid.push(...linea);
    }

    // Variables para el evento Hover
    let cellHoverInfo = { fila: -1, col: -1 };

    // Calcular tamaño de celdas
    const cellWidth = (xMax - xMin) / config.cols;
    const cellHeight = (yMax - yMin) / config.rows;

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

    canvas.addEventListener('click', (e) => {
        if(cellHoverInfo.fila !== -1 && cellHoverInfo.col !== -1) {
            // Intentar colocar la ficha
            const colocado = juego.colocarFicha(cellHoverInfo.fila, cellHoverInfo.col, turnoJugador);

            if (colocado) {
                // Verificar si hay ganador inmediatamente despues de colocar
                const resultado = juego.verificarGanador();
                if (resultado.estado === "ganador") {
                    const ganadorTxt = resultado.ganador ? "Jugador 1" : "Jugador 2";
                    setTimeout(() => alert("¡Ganador: " + ganadorTxt + "!"), 50);
                } else if (resultado.estado === "empate") {
                    setTimeout(() => alert("¡Empate!"), 50);
                }

                // Cambiar de turno si el juego continua
                if (resultado.estado !== "ganador") {
                    turnoJugador = !turnoJugador;
                }
            }
        }
    });

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
        renderer.setColor(0.8, 0.8, 0.8, 1.0); // Retomamos gris claro para grid (será mejor cambiarlo)
        renderer.dibujar(puntosDelGrid, false, gl.POINTS);

        // * Aquí luego dibujaremos las piezas X y O!

        requestAnimationFrame(renderLoop);
    }

    // Inicia el render loop
    renderLoop();
}

import WinDetector from './WinDetector.js';
