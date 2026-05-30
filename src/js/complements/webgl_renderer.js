import VertexShaderProvider from "../control/vertex_shader_provider.js";
import FragmentShaderProvide from "../control/fragment_shader_provider.js";

export default class WebGLRenderer {
    constructor(gl) {
        this.gl = gl;
        this.color = [1.0, 1.0, 1.0, 1.0]; // Color blanco por defecto

        this.program = this._iniciarShaders();
        this.buffer = this.gl.createBuffer();

        // OPTIMIZACIN CLAVE: Buscamos las locaciones UNA SOLA VEZ en el constructor
        this.coordLocation = this.gl.getAttribLocation(this.program, "coordenadas");
        this.colorLocation = this.gl.getUniformLocation(this.program, "u_color");
    }

    _iniciarShaders() {
        const vertexProvider = new VertexShaderProvider();
        const fragmentProvider = new FragmentShaderProvide();

        const vShader = this._crearShader(this.gl.VERTEX_SHADER, vertexProvider.threePointShader);
        const fShader = this._crearShader(this.gl.FRAGMENT_SHADER, fragmentProvider.theFragmentShader);

        const program = this.gl.createProgram();
        this.gl.attachShader(program, vShader);
        this.gl.attachShader(program, fShader);
        this.gl.linkProgram(program);

        // Mantenemos el manejo de errores (¡Muy importante!)
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error("Error al linkear programa:", this.gl.getProgramInfoLog(program));
        }
        return program;
    }

    _crearShader(tipo, source) {
        const shader = this.gl.createShader(tipo);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        // Mantenemos el manejo de errores
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error("Error al compilar shader:", this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    setColor(r, g, b, a = 1.0) {
        this.color = [r, g, b, a];
    }

    limpiar() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    /**
     * @param {number[]} vertices Arreglo de coordenadas [x, y, z, ...]
     * @param {boolean} isDynamic true si los vértices cambian en cada frame, false si son estáticos
     */
    dibujar(vertices, isDynamic = true, mode = this.gl.POINTS) {
        if (!vertices || vertices.length === 0) return;

        this.gl.useProgram(this.program);

        // 1. Mandamos el color (si tu fragment shader usa u_color)
        if (this.colorLocation !== null) {
            this.gl.uniform4f(this.colorLocation, ...this.color);
        }


        // 2. Preparamos el buffer
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        
        // Usamos DYNAMIC_DRAW o STATIC_DRAW según lo que necesites
        const drawType = isDynamic ? this.gl.DYNAMIC_DRAW : this.gl.STATIC_DRAW;
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), drawType);

        // 3. Usamos la locación que ya guardamos en el constructor
        this.gl.vertexAttribPointer(this.coordLocation, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.coordLocation);

        // 4. Dibujar
        this.gl.drawArrays(mode, 0, vertices.length / 3);
    }
}