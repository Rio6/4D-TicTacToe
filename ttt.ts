/// <reference path="./model_data.ts" />
/// <reference path="./math.ts" />

const config = {
    fov: 60,
    rot_speed: 0.01,
    zoom_speed: 0.25,
    project_dist: 3,
};

window.onload = init;

const vertex_shader_src = `
    precision mediump float;

    uniform vec4 model_pos;
    uniform mat4 transform;
    uniform mat4 rotation;
    uniform mat4 projection;
    uniform float project_dist;

    attribute vec4 position;
    attribute vec4 next_position;

    void main() {
        vec4 projected = projection * rotation * (position + model_pos);
        projected *= project_dist / (projected.w + project_dist);
        projected.w = 1.0;
        gl_Position = transform * projected;
    }
`;

const frag_shader_src = `
    precision mediump float;

    uniform vec4 color;

    void main() {
        gl_FragColor = color;
    }
`;

enum Piece {
    EMPTY, X, O
}

enum Dimension {
    TWO, THREE, FOUR
}

type Board = {
    dimension: number,
    pieces: Piece[] | Piece[][] | Piece[][][] | Piece[][][][];
}

class Model {
    private vbo: WebGLBuffer;
    private vao: WebGLVertexArrayObject;
    private ebo: WebGLBuffer;
    private color: Vec4;
    private elem_count: number;

    constructor({color, elems, verts}: {color: Vec4, elems: number[], verts: number[]}) {
        const gl = ctx.gl;

        this.color = color;
        this.elem_count = elems.length;

        this.vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);
        gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);

        this.ebo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int32Array(elems), gl.STATIC_DRAW);
    }

    draw(position: Vec4) {
        const gl = ctx.gl;

        gl.uniform4fv(ctx.uniform.model_pos, position);
        gl.uniform4fv(ctx.uniform.color, this.color);
        gl.bindVertexArray(this.vao);
        gl.drawElements(gl.LINES, this.elem_count, gl.UNSIGNED_INT, 0);
    }
}

let models: {
    [key in Dimension]: {
        pieces: {
            [Piece.X]: Model
            [Piece.O]: Model
        }
        grid: Model
    }
};

let ctx: {
    gl: WebGL2RenderingContext,

    uniform: {
        model_pos:    WebGLUniformLocation,
        transform:    WebGLUniformLocation,
        rotation:     WebGLUniformLocation,
        projection:   WebGLUniformLocation,
        color:        WebGLUniformLocation,
        project_dist: WebGLUniformLocation,
    }
};

const camera = {
    rotation: [ 0, 0, 0 ],
    distance: 2,
    dimension: Dimension.FOUR
};

const board = {
    dimension: Dimension.FOUR,
    pieces: []
}

function init() {
    const can = document.getElementById("canvas") as HTMLCanvasElement;
    const gl = can.getContext('webgl2');

    can.addEventListener('mousemove', mousemove);
    can.addEventListener('wheel', wheel);
    can.addEventListener('contextmenu', e => {
        e.preventDefault();
        return false
    });

    can.addEventListener('mousedown', () => can.requestPointerLock());
    can.addEventListener('mouseup', () => document.exitPointerLock());

    const vertex_shader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertex_shader, vertex_shader_src);
    gl.compileShader(vertex_shader);
    if(!gl.getShaderParameter(vertex_shader, gl.COMPILE_STATUS))
        throw gl.getShaderInfoLog(vertex_shader);

    const frag_shader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(frag_shader, frag_shader_src);
    gl.compileShader(frag_shader);
    if(!gl.getShaderParameter(frag_shader, gl.COMPILE_STATUS))
        throw gl.getShaderInfoLog(frag_shader);

    const program = gl.createProgram();
    gl.attachShader(program, vertex_shader);
    gl.attachShader(program, frag_shader);
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw gl.getProgramInfoLog(program);

    gl.useProgram(program);

    ctx = {
        gl: gl,
        uniform: {
            model_pos:    gl.getUniformLocation(program, 'model_pos'),
            transform:    gl.getUniformLocation(program, 'transform'),
            rotation:     gl.getUniformLocation(program, 'rotation'),
            projection:   gl.getUniformLocation(program, 'projection'),
            color:        gl.getUniformLocation(program, 'color'),
            project_dist: gl.getUniformLocation(program, 'project_dist'),
        }
    };

    gl.lineWidth(20);
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);

    models = {
        [Dimension.TWO]: {
            pieces: {
                [Piece.X]: new Model(model_data.x[0]),
                [Piece.O]: new Model(model_data.o[0]),
            },
            grid: new Model(model_data.grid[0])
        },
        [Dimension.THREE]: {
            pieces: {
                [Piece.X]: new Model(model_data.x[1]),
                [Piece.O]: new Model(model_data.o[1]),
            },
            grid: new Model(model_data.grid[1])
        },
        [Dimension.FOUR]: {
            pieces: {
                [Piece.X]: new Model(model_data.x[2]),
                [Piece.O]: new Model(model_data.o[2]),
            },
            grid: new Model(model_data.grid[2])
        }
    };

    board.pieces = [
        Piece.X, Piece.O, Piece.X, Piece.O, Piece.X, Piece.O, Piece.X, Piece.O, Piece.X,
        Piece.O, Piece.X, Piece.O, Piece.X, Piece.O, Piece.X, Piece.O, Piece.X, Piece.O,
        Piece.X, Piece.O, Piece.X, Piece.O, Piece.X, Piece.O, Piece.X, Piece.O, Piece.X,
        Piece.O, Piece.X, Piece.O, Piece.X, Piece.O, Piece.X, Piece.O, Piece.X, Piece.O,
        Piece.X, Piece.O, Piece.X, Piece.O, Piece.X, Piece.O, Piece.X, Piece.O, Piece.X,
        Piece.O, Piece.X, Piece.O, Piece.X, Piece.O, Piece.X, Piece.O, Piece.X, Piece.O,
        Piece.X, Piece.O, Piece.X, Piece.O, Piece.X, Piece.O, Piece.X, Piece.O, Piece.X,
        Piece.O, Piece.X, Piece.O, Piece.X, Piece.O, Piece.X, Piece.O, Piece.X, Piece.O,
        Piece.X, Piece.O, Piece.X, Piece.O, Piece.X, Piece.O, Piece.X, Piece.O, Piece.X,
    ];

    draw(board);
}

function draw(board: Board) {
    const gl = ctx.gl;

    const dimension = Math.min(camera.dimension, board.dimension);
    const dim_models = models[dimension];

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform1f(ctx.uniform.project_dist, config.project_dist);

    switch(dimension) {
        case Dimension.TWO:
            gl.uniformMatrix4fv(ctx.uniform.transform, false, identity());
            gl.uniformMatrix4fv(ctx.uniform.projection, false, project2D());
            gl.uniformMatrix4fv(ctx.uniform.rotation, false, identity());
            break;
        case Dimension.THREE:
            gl.uniformMatrix4fv(ctx.uniform.transform, false, mul(perspective(config.fov, 1, 0.1, 5), translate(0, 0, -camera.distance)));
            gl.uniformMatrix4fv(ctx.uniform.projection, false, project3D(1));
            gl.uniformMatrix4fv(ctx.uniform.rotation, false, mul(rotate3D(camera.rotation[1], [1, 0, 0]), rotate3D(camera.rotation[0], [0, 1, 0])));
            break;
        case Dimension.FOUR:
            gl.uniformMatrix4fv(ctx.uniform.transform, false, mul(perspective(config.fov, 1, 0.1, 100), translate(0, 0, -camera.distance)));
            gl.uniformMatrix4fv(ctx.uniform.projection, false, identity());
            gl.uniformMatrix4fv(ctx.uniform.rotation, false, mul(rotate4D(camera.rotation[2]), rotate3D(camera.rotation[1], [1, 0, 0]), rotate3D(camera.rotation[0], [0, 1, 0])));
            break;
    }

    dim_models.grid.draw([0, 0, 0, 0]);

    board.pieces.forEach((piece, i) => {
        const div = (a, b) => (a-a%b) / b;

        if(piece != Piece.EMPTY) {

            const x = i % 3;
            const y = div(i % 9, 3);
            const z = div(i % 27, 9);
            const w = div(i, 27);

            gl.uniformMatrix4fv(ctx.uniform.projection, false, project3D(w));

            const pos = [
                (x - 1) * 2/3,
                (y - 1) * 2/3,
                (z - 1) * 2/3,
                (w - 1) * 2/3,
            ] as Vec4;

            dim_models.pieces[piece].draw(pos);
        }
    });
}

function mousemove(e: MouseEvent) {
    let to_draw = false;

    if(e.buttons & 1) {
        camera.rotation[0] += -config.rot_speed * e.movementX;
        camera.rotation[1] += -config.rot_speed * e.movementY;

        /*
        if(camera.rotation[1] > Math.PI/2)
            camera.rotation[1] = Math.PI/2;
        if(camera.rotation[1] < -Math.PI/2)
            camera.rotation[1] = -Math.PI/2;
        */

        to_draw = true;
    }

    if(e.buttons & 2) {
        camera.rotation[2] += config.rot_speed * e.movementX;
        to_draw = true;
    }

    if(to_draw)
        draw(board);
}

function wheel(e: WheelEvent) {
    camera.distance += config.zoom_speed * e.deltaY;
    if(camera.distance < 0)
        camera.distance = 0;
    draw(board);
}
