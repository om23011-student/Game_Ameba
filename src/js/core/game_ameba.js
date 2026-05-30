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
    const cols = config.cols || 5;
    const rows = config.rows || 5;

    // Vamos a dejar un pequeño margen (de -0.9 a 0.9)
    const xMin = -0.9;
    const xMax = 0.9;
    const yMin = -0.9;
    const yMax = 0.9;

    // Lineas verticales
    for(let i = 0; i <= cols; i++) {
        const x = xMin + (i / cols) * (xMax - xMin);
        const linea = generadorLineas.calcularDDA(x, yMin, x, yMax);
        puntosDelGrid.push(...linea);
    }

    // Lineas horizontales
    for(let i = 0; i <= rows; i++) {
        const y = yMin + (i / rows) * (yMax - yMin);
        const linea = generadorLineas.calcularDDA(xMin, y, xMax, y);
        puntosDelGrid.push(...linea);
    }

    // 4. Barremos la pantalla para que quede limpia y aventamos los dibujos al lienzo
    renderer.limpiar();

    // Dibujamos el grid oficial y quitamos los garabatos de prueba
    renderer.dibujar(puntosDelGrid, false);
}

import WinDetector from './WinDetector.js';

const juego = new WinDetector();
juego.iniciarJuego(5,5);

juego.colocarFicha(0, 0, true);
juego.colocarFicha(0, 1, false);


juego.mostrarTablero();
const resultado = juego.verificarGanador();

console.log("\nRESULTADO:\n");

if (resultado.estado === "ganador") {

    console.log(
        resultado.ganador === true
            ? "Ganó TRUE"
            : "Ganó FALSE"
    );

}
else if (resultado.estado === "continua") {

    console.log("Continúa el juego");

}
else if (resultado.estado === "empate") {

    console.log("Empate");

}