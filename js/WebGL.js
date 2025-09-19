const canvas = document.getElementById('glcanvas');
const gl = canvas.getContext('webgl');

if (!gl) {
  alert("WebGL not supported");
}

// Shaders
const vsSource = `
  attribute vec2 a_position;
  void main(void) {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fsSource = `
  void main(void) {
    gl_FragColor = vec4(0.9, 0.9, 0.3, 1.0);  // yellow-ish color
  }
`;

function compileShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

const vertexShader = compileShader(gl.VERTEX_SHADER, vsSource);
const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fsSource);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  throw new Error(gl.getProgramInfoLog(program));
}

gl.useProgram(program);

// ---------- Generate Sierpinski Gasket vertices ----------
let points = [];

// Recursive subdivision
function divideTriangle(a, b, c, count) {
  if (count === 0) {
    // Push one small triangle
    points.push(...a, ...b, ...c);
  } else {
    // Midpoints
    let ab = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    let ac = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2];
    let bc = [(b[0] + c[0]) / 2, (b[1] + c[1]) / 2];

    count--;

    // Recurse on 3 corner triangles
    divideTriangle(a, ab, ac, count);
    divideTriangle(c, ac, bc, count);
    divideTriangle(b, bc, ab, count);
  }
}

// Main triangle
const a = [-1, -1];
const b = [ 0,  1];
const c = [ 1, -1];

// 5 levels deep → more triangles
divideTriangle(a, b, c, 4);

const vertices = new Float32Array(points);

// ---------- Send Data to GPU ----------
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const aPos = gl.getAttribLocation(program, "a_position");
gl.enableVertexAttribArray(aPos);
gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

// ---------- Render ----------
function render() {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
}
render();

