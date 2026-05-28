export default class LineaDDA {
    calcularDDA(xInicio, yInicio, xFinal, yFinal) {
        const puntos = [];

        const dx = xFinal - xInicio;
        const dy = yFinal - yInicio;
        const pasos = Math.max(Math.abs(dx), Math.abs(dy)) * 100;

        const xInc = dx / pasos;
        const yInc = dy / pasos;

        let x = xInicio;
        let y = yInicio;

        for (let i = 0; i <= pasos; i++) {
            puntos.push(x, y, 0.0);
            x += xInc;
            y += yInc;
        }

        return puntos;
    }
}
