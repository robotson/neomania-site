/**
 * WebGL Grain Shader
 * Renders a procedural "Quicksilver" noise effect used for the Neomania background.
 */

const vsSource = `
    attribute vec4 aVertexPosition;
    void main(void) {
        gl_Position = aVertexPosition;
    }
`;

const fsSource = `
    precision mediump float;
    
    uniform float uTime;
    uniform vec2 uResolution;
    uniform float uScroll;
    uniform bool uDebug; // New Debug Uniform
    
    // TWEAKABLE PARAMETERS
    #define GRAIN_Scale 3.0  // Much finer (Was 1.5)
    #define GRAIN_Density 0.45   // Reduced from 0.6 for better transparency
    #define GRAIN_Speed 6.0  // Hyper fast (Was 4.0)
    
    float hash(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
        vec2 uv = gl_FragCoord.xy / uResolution;
        uv.x *= uResolution.x / uResolution.y;
        
        float scale = 400.0 * GRAIN_Scale; 
        
        // TIME INTERPOLATION
        float t = uTime * GRAIN_Speed;
        float seed_a = floor(t);
        float seed_b = seed_a + 1.0;
        float f = fract(t);
        f = f * f * (3.0 - 2.0 * f); // Ease curve
        
        // --- OCTAVE 1: Main Grain ---
        vec2 gridUV = floor(uv * scale);
        float n1_a = hash(gridUV + vec2(seed_a, 0.0));
        float n1_b = hash(gridUV + vec2(seed_b, 0.0));
        float n1 = mix(n1_a, n1_b, f);
        
        // --- OCTAVE 2: Cloud Variation (Variance) ---
        // Coarser scale (0.2x) to create "patches"
        vec2 gridUV2 = floor(uv * scale * 0.2);
        float n2_a = hash(gridUV2 + vec2(seed_a * 0.5, 99.0)); 
        float n2_b = hash(gridUV2 + vec2(seed_b * 0.5, 99.0));
        float n2 = mix(n2_a, n2_b, f);
        
        // Combine: Multiply them to create "clumps"
        float n = n1 * mix(0.5, 1.5, n2); 
        
        // VISIBILITY LOGIC
        float threshold = 1.0 - GRAIN_Density;
        float soft = 0.2; 
        
        float visibility = smoothstep(threshold - soft, threshold + 0.1, n);
        
        // VISIBILITY LOGIC
        // If uDebug is on: output RED, ignore scroll, ignore transparency
        if (uDebug) {
             // Red grid to prove shader runs
             float grid = mod(floor(uv.x * 10.0) + floor(uv.y * 10.0), 2.0);
             if (visibility > 0.5) {
                 gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Bright Red "Live" pixels
             } else {
                 gl_FragColor = vec4(0.2, 0.0, 0.0, 0.2); // Dim Red "Dead" pixels (so you see the grid)
             }
             return;
        }

        // Production Logic
        // Always at least 0.2 opacity to prove it's there? No, stick to logic.
        float opacity = uScroll * visibility;
        
        gl_FragColor = vec4(1.0, 1.0, 1.0, opacity);
    }
`;

function initGrainShader() {
    const canvas = document.getElementById('grain-canvas');
    if (!canvas) return;

    // DEBUG CHECK: Check URL param
    const urlParams = new URLSearchParams(window.location.search);
    const debugMode = urlParams.has('grain_debug');

    if (debugMode) console.log('WebGL Grain: Debug Mode Active');

    const gl = canvas.getContext('webgl', { alpha: true, depth: false, antialias: false });

    if (!gl) {
        console.warn('WebGL not supported, falling back to CSS grain.');
        return;
    }

    function loadShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, loadShader(gl, gl.VERTEX_SHADER, vsSource));
    gl.attachShader(shaderProgram, loadShader(gl, gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(shaderProgram);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
        -1.0, 1.0,
        1.0, 1.0,
        -1.0, -1.0,
        1.0, -1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        },
        uniformLocations: {
            resolution: gl.getUniformLocation(shaderProgram, 'uResolution'),
            time: gl.getUniformLocation(shaderProgram, 'uTime'),
            scroll: gl.getUniformLocation(shaderProgram, 'uScroll'),
            debug: gl.getUniformLocation(shaderProgram, 'uDebug'),
        },
    };

    function resize() {
        // Handle Retina displays correctly
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    window.addEventListener('resize', resize);
    resize();

    let startTime = performance.now();

    function render() {
        // Read CSS variable --p
        // If debug mode, force p = 1.0
        let p = 0;
        if (debugMode) {
            p = 1.0;
        } else {
            const cssP = getComputedStyle(document.body).getPropertyValue('--p').trim();
            p = parseFloat(cssP) || 0;
            // Ensure p is never purely 0 to avoid "it's broken" panic? 
            // Let's create a minimum visibility floor
            p = Math.max(p, 0.0);
        }

        gl.useProgram(programInfo.program);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

        gl.uniform2f(programInfo.uniformLocations.resolution, canvas.width, canvas.height);
        gl.uniform1f(programInfo.uniformLocations.time, (performance.now() - startTime) * 0.001);
        gl.uniform1f(programInfo.uniformLocations.scroll, p);
        gl.uniform1i(programInfo.uniformLocations.debug, debugMode ? 1 : 0);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

    // Console log to confirm init
    console.log("%c WebGL Grain Initialized ", "background: #222; color: #bada55");
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGrainShader);
} else {
    initGrainShader();
}
