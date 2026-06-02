//mi clase para generar la puadricula en el grid
import LineaDDA from './algoritmo_dda.js'; 

export default class GridBuilder {
    constructor(xMin, xMax, yMin, yMax) {
        this.xMin = xMin;
        this.xMax = xMax;
        this.yMin = yMin;
        this.yMax = yMax;
        this.generadorLineas = new LineaDDA();
    }

    // Retorna todos los puntos WebGL para dibujar las líneas
    generarPuntos(filas, columnas) {
        const puntosDelGrid = [];

        // Líneas verticales
        for (let i = 0; i <= columnas; i++) {
            const x = this.xMin + (i / columnas) * (this.xMax - this.xMin);
            const linea = this.generadorLineas.calcularDDA(x, this.yMin, x, this.yMax);
            puntosDelGrid.push(...linea);
        }

        // Líneas horizontales
        for (let i = 0; i <= filas; i++) {
            const y = this.yMin + (i / filas) * (this.yMax - this.yMin);
            const linea = this.generadorLineas.calcularDDA(this.xMin, y, this.xMax, y);
            puntosDelGrid.push(...linea);
        }

        return puntosDelGrid;
    }

    // Utilidad extra: Nos devuelve el tamaño exacto de las celdas
    calcularDimensionesCelda(filas, columnas) {
        return {
            cellWidth: (this.xMax - this.xMin) / columnas,
            cellHeight: (this.yMax - this.yMin) / filas
        };
    }
}