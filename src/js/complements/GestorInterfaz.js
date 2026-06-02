export default class GestorInterfaz {
    /**
     * Constructor de la clase.
     * Inicializa las referencias a los elementos del DOM que muestran los turnos.
     */
    constructor() {
        this.tbP1 = document.getElementById('turn-p1');
        this.tbP2 = document.getElementById('turn-p2');
    }

    /**
     * Configura los nombres de los jugadores en los tableros superiores según el modo de juego.
     * @param {string} mode - El modo de juego actual ('pvp', 'pve', 'eve').
     */
    configurarNombres(mode) {
        // Limpiamos las clases en caso de venirse arrastrando de la partida anterior
        this.tbP1.classList.remove('turn-active-p1', 'turn-active-p2');
        this.tbP2.classList.remove('turn-active-p1', 'turn-active-p2');

        // Asignamos el texto adecuado según contra quién estemos jugando
        if (mode === 'eve') {
            this.tbP1.textContent = 'Motor 1 (P1)';
            this.tbP2.textContent = 'Motor 2 (P2)';
        } else if (mode === 'pve') {
            this.tbP1.textContent = 'Jugador (P1)';
            this.tbP2.textContent = 'Máquina (P2)';
        } else {
            this.tbP1.textContent = 'Jugador 1';
            this.tbP2.textContent = 'Jugador 2';
        }
    }

    /**
     * Actualiza las luces neón de la interfaz para indicar de quién es el turno.
     * @param {boolean} esTurnoJugador1 - true si es el turno del P1, false si es del P2.
     */
    actualizarTurno(esTurnoJugador1) {
        if (!this.tbP1 || !this.tbP2) return;

        // Removemos los brillos de ambos lados primero para evitar que se queden atascados
        this.tbP1.classList.remove('turn-active-p1', 'turn-active-p2');
        this.tbP2.classList.remove('turn-active-p1', 'turn-active-p2');

        // Aplicamos el color correspondiente al jugador activo
        if (esTurnoJugador1) {
            this.tbP1.classList.add('turn-active-p1'); // Efecto Cyan para el Jugador 1
        } else {
            this.tbP2.classList.add('turn-active-p2'); // Efecto Fucsia para el Jugador 2
        }
    }

}
