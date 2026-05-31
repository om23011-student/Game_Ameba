export default class Motor {

    /**
     * Evalúa el tablero actual y decide la mejor jugada posible.
     * En esta versión, busca una casilla vacía que tenga vecinos ocupados.
     * @param {Array} tablero - Matriz bidimensional que representa el tablero actual.
     * @returns {Object} Un objeto con {fila, columna} de la jugada elegida.
     */
    obtenerMejorMovimiento(tablero) {

        const candidatos = [];
        const candidatosDefensivos = []; // Array adicional para priorizar posiciones que bloqueen o agrupen

        // Iterar sobre las filas del tablero
        for (let fila = 0; fila < tablero.length; fila++) {

            // Iterar sobre las columnas del tablero
            for (let columna = 0; columna < tablero[fila].length; columna++) {

                // Verificar si la celda actual se encuentra desocupada
                if (
                    tablero[fila][columna] === null ||
                    tablero[fila][columna] === ""
                ) {

                    // Solo añadimos la casilla a los candidatos si tiene alguna ficha colindante
                    if (this.tieneVecino(tablero, fila, columna)) {

                        candidatos.push({
                            fila,
                            columna
                        });

                        // Si además esa celda vacía tiene MÁS de un vecino, la consideramos una jugada "defensiva/agresiva" mejor
                        if (this.contarVecinos(tablero, fila, columna) > 1) {
                            candidatosDefensivos.push({
                                fila,
                                columna
                            });
                        }
                    }
                }
            }
        }

        // Si no hay candidatos (por ejemplo, el primer movimiento del juego)
        // Optamos por tomar el centro del tablero para empezar la acción
        if (candidatos.length === 0) {

            return {
                fila: Math.floor(tablero.length / 2),
                columna: Math.floor(tablero[0].length / 2)
            };
        }

        // 1. Si hay posiciones "calientes" (con múltiples vecinos), priorizamos tirar ahí para intentar bloquear o conectar
        if (candidatosDefensivos.length > 0) {
            const indiceDefensivo = Math.floor(Math.random() * candidatosDefensivos.length);
            return candidatosDefensivos[indiceDefensivo];
        }

        // 2. Si no, seleccionar aleatoriamente una de las posiciones posibles válidas entre los candidatos de 1 vecino
        const indice = Math.floor(Math.random() * candidatos.length);

        return candidatos[indice];
    }

    /**
     * Verifica si una casilla específica tiene al menos una ficha adyacente (en cualquiera de las 8 direcciones).
     * @param {Array} tablero - El tablero de juego.
     * @param {number} fila - Fila actual a evaluar.
     * @param {number} columna - Columna actual a evaluar.
     * @returns {boolean} True si tiene algún vecino, False en caso contrario.
     */
    tieneVecino(tablero, fila, columna) {

        // Recorrer las filas adyacentes (-1: arriba, 0: centro, 1: abajo)
        for (let df = -1; df <= 1; df++) {

            // Recorrer las columnas adyacentes (-1: izquierda, 0: centro, 1: derecha)
            for (let dc = -1; dc <= 1; dc++) {

                // Omitir la coordenada de la propia celda que evaluamos
                if (df === 0 && dc === 0) {
                    continue;
                }

                const nf = fila + df;
                const nc = columna + dc;

                // Asegurar de que la posición vecina no rebase los límites del tablero
                if (
                    nf >= 0 &&
                    nf < tablero.length &&
                    nc >= 0 &&
                    nc < tablero[0].length
                ) {

                    // Verificar que esté ocupada con alguna ficha
                    if (
                        tablero[nf][nc] !== null &&
                        tablero[nf][nc] !== ""
                    ) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Cuenta cuántas fichas adyacentes tiene una casilla específica (en las 8 direcciones).
     * @param {Array} tablero - El tablero de juego.
     * @param {number} fila - Fila actual a evaluar.
     * @param {number} columna - Columna actual a evaluar.
     * @returns {number} Cantidad de fichas vecinas.
     */
    contarVecinos(tablero, fila, columna) {
        let contador = 0;

        for (let df = -1; df <= 1; df++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (df === 0 && dc === 0) {
                    continue;
                }

                const nf = fila + df;
                const nc = columna + dc;

                if (
                    nf >= 0 &&
                    nf < tablero.length &&
                    nc >= 0 &&
                    nc < tablero[0].length
                ) {
                    if (
                        tablero[nf][nc] !== null &&
                        tablero[nf][nc] !== ""
                    ) {
                        contador++;
                    }
                }
            }
        }

        return contador;
    }

    /**
     * C) Calcula un tiempo de espera aleatorio para simular la velocidad de reacción de un humano.
     * @param {string} modo - El modo actual de juego.
     * @returns {number} Milisegundos de espera ajustados para parecer un "pensamiento".
     */
    obtenerTiempoPensamiento(modo) {
        if (modo === 'eve') {
            // En MaquinavsMaquina es ligeramente más rápido (300 a 800 ms) para que el espectáculo sea fluido
            return Math.floor(Math.random() * 500) + 300;
        }

        // En 1vsMaquina aplicamos un retraso más humano (entre 600 y 1600 milisegundos)
        return Math.floor(Math.random() * 1000) + 600;
    }
}
