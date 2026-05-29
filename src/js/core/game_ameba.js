import WebGLRenderer from '../complements/webgl_renderer.js'; 
import LineaDDA from '../complements/algoritmo_dda.js'; 
import LineaBresenham from '../complements/algoritmo_bresenham.js'; 
import DibujarArcos from '../complements/algoritmo_arcos.js'; 
import AlgoritmoElipse from '../complements/algoritmo_elipse.js';

// 1. Obtenemos el canvas y el contexto de WebGL 
const canvas = document.getElementById('miCanvas'); 
const gl = canvas.getContext('webgl'); 

if (!gl) { 
    console.error("Tu navegador no soporta WebGL bro :("); 
} 

// 2. Instanciamos el renderizador optimizado 
const renderer = new WebGLRenderer(gl); 

// Configuramos el color de los puntos (R, G, B, A). Vamos a pintarlos de rojo. 
renderer.setColor(1.0, 0.0, 0.0, 1.0);  

// 3. Calculamos los puntos de la línea usando las clases de algoritmos.
const generadorLineas = new LineaDDA(); 
const generadorLineasBresenham = new LineaBresenham(); 
const generadorArcos = new DibujarArcos(); 
const generadorElipses = new AlgoritmoElipse();

// OJO: En WebGL puro, el centro del canvas es (0,0) y los bordes son 1.0 y -1.0 
// Así que vamos a hacer una línea en diagonal que cruce la pantalla. 
const puntosDeLinea = generadorLineas.calcularDDA(-0.8, -0.8, 0.8, 0.8); 
const puntosDeLineaBresenham = generadorLineasBresenham.calcularBresenham(-0.8, 0.8, 0.8, -0.8); 
const puntosDeArco = generadorArcos.calcularArco(0, 0, 0.5,0, Math.PI*2); 
const puntosDeElipse = generadorElipses.calcularElipse(0, 0, 0.8, 0.4);

// 4. Limpiamos la pantalla y dibujamos 
renderer.limpiar();  

// Le pasamos 'false' en el segundo parámetro porque la línea es estática 
// (no se va a estar moviendo o recalculando en cada frame de una animación). 
// Esto le dice a WebGL que la guarde de forma más eficiente (STATIC_DRAW). 
renderer.dibujar(puntosDeLinea, false); 
renderer.dibujar(puntosDeLineaBresenham, false); 
renderer.dibujar(puntosDeArco, false); 
renderer.dibujar(puntosDeElipse, false); 


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