// algoritmo_elipse.js
export default class AlgoritmoElipse {
    /**
     * Calcula los puntos de una elipse usando el algoritmo del Punto Medio.
     * @param {number} xc Coordenada X del centro
     * @param {number} yc Coordenada Y del centro
     * @param {number} rx Radio en el eje X
     * @param {number} ry Radio en el eje Y
     * @returns {number[]} Arreglo plano con los puntos [x1, y1, z1, x2, y2, z2, ...]
     */
    static calcularElipse(xc, yc, rx, ry) {
        const puntos = [];

        // Guardamos los cuadrados de los radios para optimizar los cálculos
        const rx2 = rx * rx;
        const ry2 = ry * ry;

        // PASO 2: Punto inicial en el origen local
        let x = 0;
        let y = ry;

        // Valores iniciales para las derivadas (usadas en las condiciones de parada)
        let dx = 2 * ry2 * x;
        let dy = 2 * rx2 * y;

        // --- REGIÓN 1 ---
        // PASO 1 y 3: Parámetro de decisión inicial para la región 1
        let p1 = ry2 - (rx2 * ry) + (0.25 * rx2);

        // Función auxiliar para agregar los 4 puntos simétricos (PASO 5 y 10)
        const agregarSimetria = (px, py) => {
            puntos.push(xc + px, yc + py, 0.0); // Cuadrante 1
            puntos.push(xc - px, yc + py, 0.0); // Cuadrante 2
            puntos.push(xc + px, yc - py, 0.0); // Cuadrante 3
            puntos.push(xc - px, yc - py, 0.0); // Cuadrante 4
        };

        // PASO 4 y 6: Iterar sobre X en la región 1
        while (dx < dy) {
            agregarSimetria(x, y);

            if (p1 < 0) {
                x++;
                dx = dx + (2 * ry2);
                p1 = p1 + dx + ry2;
            } else {
                x++;
                y--;
                dx = dx + (2 * ry2);
                dy = dy - (2 * rx2);
                p1 = p1 + dx - dy + ry2;
            }
        }

        // --- REGIÓN 2 ---
        // PASO 7 y 8: Punto inicial es el último de la región 1. Parámetro P2 inicial.
        let p2 = (ry2 * ((x + 0.5) * (x + 0.5))) + (rx2 * ((y - 1) * (y - 1))) - (rx2 * ry2);

        // PASO 9, 11: Iterar sobre Y hasta que y == 0
        while (y >= 0) {
            agregarSimetria(x, y);

            if (p2 > 0) {
                y--;
                dy = dy - (2 * rx2);
                p2 = p2 - dy + rx2;
            } else {
                x++;
                y--;
                dx = dx + (2 * ry2);
                dy = dy - (2 * rx2);
                p2 = p2 + dx - dy + rx2;
            }
        }

        return puntos;
    }
}