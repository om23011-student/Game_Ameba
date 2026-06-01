export default class GestorEntradas {
    /**
     * Mapea las interacciones del hardware (mouse) al mundo matemático de WebGL.
     * @param {HTMLCanvasElement} canvas - El lienzo HTML donde se dibuja el juego.
     * @param {number} xMin - Límite izquierdo mínimo del grid en normalizado (-1 a 1).
     * @param {number} xMax - Límite derecho máximo.
     * @param {number} yMin - Límite inferior.
     * @param {number} yMax - Límite superior.
     * @param {number} cellWidth - Tamaño de ancho que ocupa cada celda en el espacio normalizado.
     * @param {number} cellHeight - Tamaño de alto que ocupa cada celda.
     * @param {number} rows - Total de filas del tablero.
     * @param {number} cols - Total de columnas del tablero.
     */
    constructor(canvas, xMin, xMax, yMin, yMax, cellWidth, cellHeight, rows, cols) {
        this.canvas = canvas;
        this.xMin = xMin;
        this.xMax = xMax;
        this.yMin = yMin;
        this.yMax = yMax;
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.rows = rows;
        this.cols = cols;
    }

    /**
     * Convierte las coordenadas del puntero de la pantalla física a las coordenadas internas lógicas de nuestra matriz.
     * @param {number} clientX - Coordenada X enviada por el evento del Mouse del navegador.
     * @param {number} clientY - Coordenada Y enviada por el evento del Mouse del navegador.
     * @returns {Object} Objeto literal {col, fila}. Devuelve -1 si el ratón está por fuera del grid permitido.
     */
    obtenerCelda(clientX, clientY) {
        // Obtenemos los límites físicos del canvas respecto a la pantalla del dispositivo
        const rect = this.canvas.getBoundingClientRect();

        // Trasladamos el eje de origen a la esquina superior izquierda real del Canvas
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;

        // Convertir de px a rango Normalizado (-1, 1) para cuadrar con WebGL
        const normX = (mouseX / this.canvas.width) * 2 - 1;
        const normY = (1 - (mouseY / this.canvas.height)) * 2 - 1; // Invertimos Y en WebGL

        // Verificar si click o hover está dentro de los márgenes del Grid
        if(normX >= this.xMin && normX <= this.xMax && normY >= this.yMin && normY <= this.yMax) {
            const c = Math.floor((normX - this.xMin) / this.cellWidth);
            const r = Math.floor((this.yMax - normY) / this.cellHeight);

            return {
                col: Math.min(c, this.cols - 1),
                fila: Math.min(r, this.rows - 1)
            };
        }

        // Si sale de los límites
        return { col: -1, fila: -1 };
    }
}
