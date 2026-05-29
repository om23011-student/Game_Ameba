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

    // Le ponemos un colorcito guapo rojo para las líneas (R, G, B, A).
    renderer.setColor(1.0, 0.0, 0.0, 1.0);

    // 3. Traemos a la banda de los algoritmos (Temporal nomás para ver que anden finos)
    const generadorLineas = new LineaDDA();
    const generadorLineasBresenham = new LineaBresenham();
    const generadorArcos = new DibujarArcos();
    const generadorElipses = new AlgoritmoElipse();

    // Unos garabatos temporales para asegurar que el WebGL esté al cien.
    // Ya lueguito dibujamos el Grid chido de NxN aquí.
    const puntosDeLinea = generadorLineas.calcularDDA(-0.8, -0.8, 0.8, 0.8);
    const puntosDeLineaBresenham = generadorLineasBresenham.calcularBresenham(-0.8, 0.8, 0.8, -0.8);
    const puntosDeArco = generadorArcos.calcularArco(0, 0, 0.5, 0, Math.PI*2);
    const puntosDeElipse = generadorElipses.calcularElipse(0, 0, 0.8, 0.4);

    // 4. Barremos la pantalla para que quede limpia y aventamos los dibujos al lienzo
    renderer.limpiar();

    renderer.dibujar(puntosDeLinea, false);
    renderer.dibujar(puntosDeLineaBresenham, false);
    renderer.dibujar(puntosDeArco, false);
    renderer.dibujar(puntosDeElipse, false);
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