// algoritmo_elipse.js
export default class AlgoritmoElipse {
    
    // Le quitamos el 'static' y agregamos la resolución
    calcularElipse(xc, yc, rx, ry, resolucion = 100) {
        const puntos = [];

        // 1. Convertimos todo a "enteros" (espacio de píxeles)
        let xcInt = Math.round(xc * resolucion);
        let ycInt = Math.round(yc * resolucion);
        let rxInt = Math.round(rx * resolucion);
        let ryInt = Math.round(ry * resolucion);

        const rx2 = rxInt * rxInt;
        const ry2 = ryInt * ryInt;

        let x = 0;
        let y = ryInt;

        let dx = 2 * ry2 * x;
        let dy = 2 * rx2 * y;

        let p1 = ry2 - (rx2 * ryInt) + (0.25 * rx2);

        // 2. Al hacer el push, devolvemos los puntos al espacio flotante de WebGL
        const agregarSimetria = (px, py) => {
            puntos.push((xcInt + px) / resolucion, (ycInt + py) / resolucion, 0.0);
            puntos.push((xcInt - px) / resolucion, (ycInt + py) / resolucion, 0.0);
            puntos.push((xcInt + px) / resolucion, (ycInt - py) / resolucion, 0.0);
            puntos.push((xcInt - px) / resolucion, (ycInt - py) / resolucion, 0.0);
        };

        // --- REGIÓN 1 ---
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
        let p2 = (ry2 * ((x + 0.5) * (x + 0.5))) + (rx2 * ((y - 1) * (y - 1))) - (rx2 * ry2);

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