class VertexShaderProvider {
    /**
     * El Vertex Shader se encarga de posicionar los puntos en el espacio 3D.
     */
    get threePointShader() {
        return `
        attribute vec3 coordenadas; // Debe declararse fuera del main

        void main(void) {
            gl_PointSize = 5.0;
            gl_Position = vec4(coordenadas, 1.0);
        }
        `;
    }
}
export default VertexShaderProvider;