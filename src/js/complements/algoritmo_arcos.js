export default class Arco {
    
    // Arco usando aproximación angular (simple y funcional)
    calcularArco(cx, cy, r, inicio, fin) {
        const puntos = [];

        const step = 0.04; // resolución

        for (let ang = inicio; ang <= fin; ang += step) {
            const x = cx + r * Math.cos(ang);
            const y = cy + r * Math.sin(ang);

            puntos.push(x, y, 0.0);
        }

        return puntos;
    }
}