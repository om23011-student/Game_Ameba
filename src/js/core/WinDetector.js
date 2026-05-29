export default class Ameba {

    constructor() {
        this.tablero = [];
        this.filas = 0;
        this.columnas = 0;
    }

    // ========================================
    // INICIAR JUEGO
    // ========================================

    iniciarJuego(filas, columnas) {

        this.filas = filas;
        this.columnas = columnas;

        this.tablero = [];

        for (let i = 0; i < filas; i++) {

            let fila = [];

            for (let j = 0; j < columnas; j++) {
                fila.push(null);
            }

            this.tablero.push(fila);
        }
    }

    // ========================================
    // COLOCAR FICHA
    // ========================================

    colocarFicha(fila, columna, valor) {

        // Validar límites
        if (
            fila < 0 ||
            fila >= this.filas ||
            columna < 0 ||
            columna >= this.columnas
        ) {
            console.log("Posición fuera del tablero");
            return false;
        }

        // Validar valor
        if (valor !== true && valor !== false) {
            console.log("El valor debe ser true o false");
            return false;
        }

        // Validar si ya existe ficha
        if (this.tablero[fila][columna] !== null) {
            console.log("La casilla ya está ocupada");
            return false;
        }

        // Colocar ficha
        this.tablero[fila][columna] = valor;

        return true;
    }

    // ========================================
    // VERIFICAR GANADOR
    // ========================================

    verificarGanador() {

        const direcciones = [
            [0, 1],   // Horizontal →
            [1, 0],   // Vertical ↓
            [1, 1],   // Diagonal ↘
            [1, -1]   // Diagonal ↙
        ];

        let hayEspaciosVacios = false;

        for (let i = 0; i < this.filas; i++) {

            for (let j = 0; j < this.columnas; j++) {

                const valor = this.tablero[i][j];

                // Detectar espacios vacíos
                if (valor === null) {
                    hayEspaciosVacios = true;
                    continue;
                }

                // Revisar direcciones
                for (const [dx, dy] of direcciones) {

                    let contador = 1;

                    for (let k = 1; k < 5; k++) {

                        const nuevaFila = i + (dx * k);
                        const nuevaColumna = j + (dy * k);

                        // Verificar límites
                        if (
                            nuevaFila < 0 ||
                            nuevaFila >= this.filas ||
                            nuevaColumna < 0 ||
                            nuevaColumna >= this.columnas
                        ) {
                            break;
                        }

                        // Verificar coincidencia
                        if (this.tablero[nuevaFila][nuevaColumna] === valor) {
                            contador++;
                        }
                        else {
                            break;
                        }
                    }

                    // Ganador encontrado
                    if (contador === 5) {

                        return {
                            estado: "ganador",
                            ganador: valor,
                            filaInicio: i,
                            columnaInicio: j,
                            direccion: [dx, dy]
                        };
                    }
                }
            }
        }

        // Si todavía hay espacios
        if (hayEspaciosVacios) {

            return {
                estado: "continua"
            };
        }

        // Si no hay espacios y nadie ganó
        return {
            estado: "empate"
        };
    }

    // ========================================
    // MOSTRAR TABLERO
    // ========================================

    mostrarTablero() {

        console.log("\nTABLERO:\n");

        for (let i = 0; i < this.filas; i++) {

            let textoFila = "";

            for (let j = 0; j < this.columnas; j++) {

                const valor = this.tablero[i][j];

                if (valor === true) {
                    textoFila += " T ";
                }
                else if (valor === false) {
                    textoFila += " F ";
                }
                else {
                    textoFila += " . ";
                }
            }

            console.log(textoFila);
        }
    }
}