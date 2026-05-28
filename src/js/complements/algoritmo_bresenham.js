export default class Bresenham {

    // Añadimos una "resolucion" (puede ser el tamaño de tu canvas, ej. 500)
    calcularBresenham(x0, y0, x1, y1, resolucion = 100) {
        const puntos = [];

        // 1. Convertimos el rango flotante de WebGL a "enteros"
        let x0Int = Math.round(x0 * resolucion);
        let y0Int = Math.round(y0 * resolucion);
        let x1Int = Math.round(x1 * resolucion);
        let y1Int = Math.round(y1 * resolucion);

        let dx = Math.abs(x1Int - x0Int);
        let dy = Math.abs(y1Int - y0Int);

        let sx = (x0Int < x1Int) ? 1 : -1;
        let sy = (y0Int < y1Int) ? 1 : -1;

        let err = dx - dy;

        while (true) {
            // 2. Volvemos a convertir a formato WebGL flotante para guardar el punto
            puntos.push(x0Int / resolucion, y0Int / resolucion, 0.0);

            // Ahora la comparación exacta sí funciona porque son enteros
            if (x0Int === x1Int && y0Int === y1Int) break;

            let e2 = 2 * err;

            if (e2 > -dy) {
                err -= dy;
                x0Int += sx;
            }

            if (e2 < dx) {
                err += dx;
                y0Int += sy;
            }
        }

        return puntos;
    }
}