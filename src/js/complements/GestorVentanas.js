/**
 * GestorVentanas.js
 *
 * Este archivo controla el flujo general de la página web sin tocar WebGL.
 * Manipula qué pantallas se muestran u ocultan (loader, menú y canvas)
 * y pasa la configuración del usuario desde los inputs HTML hacia el motor del juego.
 */

// 1) Simulamos una pantalla de carga para darle estilo arcade al arranque
setTimeout(() => {
    // Quitamos la visibilidad del componente de carga y mostramos el menú de configuración principal
    document.getElementById('loading-screen').classList.remove('active');
    document.getElementById('menu-screen').classList.add('active');
}, 1200);

// 2) Capturamos el evento click del botón de "Iniciar Partida"
document.getElementById('btn-start').addEventListener('click', () => {
    // Obtenemos todos los valores proporcionados en el formulario de configuración
    const mode = document.getElementById('game-mode').value;
    const cols = parseInt(document.getElementById('grid-cols').value, 10);
    const rows = parseInt(document.getElementById('grid-rows').value, 10);
    const symbol = document.getElementById('player-symbol').value;

    // Validación rigurosa del tamaño del Grid: este juego no tiene sentido en menos de 5x5 espacios
    if (isNaN(cols) || isNaN(rows) || cols < 5 || rows < 5) {
        alert("¡Tranquilo mi pa, que hace, no vio que esa vaina es de 5x5 para arriba?");
        // Corregimos los inputs visualmente para forzar al menos el 5x5 la próxima vez
        document.getElementById('grid-cols').value = Math.max(5, isNaN(cols) ? 5 : cols);
        document.getElementById('grid-rows').value = Math.max(5, isNaN(rows) ? 5 : rows);
        return; // Interrumpimos la ejecución para no cargar un juego miniatura/corrupto.
    }

    // Ocultamos el menú principal y volvemos visible la pantalla donde radica nuestro tag <canvas>
    document.getElementById('menu-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');

    // Actualizamos el título usando template literals
    document.getElementById('game-title').textContent = `Partida Ameba: ${cols}x${rows}`;

    // Disparamos un evento personalizado a nivel global (`window`) llamado 'startGame'.
    // Esto funciona como un radio-transmisor. El archivo core `game_ameba.js` estará escuchando
    // este grito para instanciar WebGL usando la propiedad `detail` inyectada aquí.
    window.dispatchEvent(new CustomEvent('startGame', {
        detail: { mode, cols: parseInt(cols), rows: parseInt(rows), symbol }
    }));
});

// 3) Comportamiento del botón de "Volver al Menú"
document.getElementById('btn-restart').addEventListener('click', () => {
    // Simplemente revierte las clases "active" para esconder WebGL y mostrar las opciones de nuevo
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('menu-screen').classList.add('active');

    // Nota arquitectónica: Actualmente, al darle a start de nuevo, WebGL sobrescribe el gameLoop, pero
    // más adelante sería prudente tener un método que destruya o congele explícitamente la memoria en VRAM
    // de la partida abandonada.
});
