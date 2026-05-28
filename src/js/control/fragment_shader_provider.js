class FragmentShaderProvide {
    get theFragmentShader() {
        return `
        precision mediump float;

        uniform vec4 u_color;

        void main(void) {
            gl_FragColor = u_color;
        }
        `;
    }
}

export default FragmentShaderProvide;
