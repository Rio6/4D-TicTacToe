import { model_data, ModelData } from './model_data';
import { Config, Piece, Dimension, Direction, Board } from './ttt';
import * as m from './math';

declare const config: Config;

const vertex_shader_src = `
    precision mediump float;

    uniform vec4 model_pos;
    uniform mat4 transform;
    uniform mat4 rotation;
    uniform mat4 projection;

    uniform float project_dist;
    uniform float select_size;

    attribute vec4 position;

    void main() {
        vec4 projected = projection * rotation * (position + model_pos);
        projected *= project_dist / (projected.w + project_dist);
        projected.w = 1.0;
        gl_Position = transform * projected;
        gl_PointSize = select_size;
    }
`;

const frag_shader_src = `
    precision mediump float;

    uniform vec4 color;

    void main() {
        gl_FragColor = color;
    }
`;

class Model {
    private vbo: WebGLBuffer;
    private vao: WebGLVertexArrayObject;
    private ebo: WebGLBuffer;
    private color: m.Vec4;
    private mode: GLenum;
    private elem_count: number;

    constructor({mode, color, elems, verts}: ModelData) {
        const gl = ctx.gl;

        this.color = color;
        this.mode = gl[mode];
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

    draw(position: m.Vec4) {
        const gl = ctx.gl;

        gl.uniform4fv(ctx.uniform.model_pos, position);
        gl.uniform4fv(ctx.uniform.color, this.color);
        gl.bindVertexArray(this.vao);
        gl.drawElements(this.mode, this.elem_count, gl.UNSIGNED_INT, 0);
    }
}

let models: {
    pieces: {
        [Piece.X]: Model
        [Piece.O]: Model
    }
    grid: Model,
    select: Model
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
        select_size:  WebGLUniformLocation,
    }
};

export let camera: {
    rotation: [ number, number, number ],
    distance: number,
    dimension: Dimension,
};

function index_to_pos(i: number): m.Vec4 {
    return [
        i % 3,
        m.div(i % 9, 3),
        m.div(i % 27, 9),
        m.div(i, 27),
    ];
}

export function init(can: HTMLCanvasElement) {
    const gl = can.getContext('webgl2');

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
            select_size:  gl.getUniformLocation(program, 'select_size'),
        }
    };

    camera = {
        rotation: [0, 0, 0],
        dimension: Dimension.TWO,
        distance: config.camera_dist,
    };

    gl.lineWidth(20);
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);

    models = {
        pieces: {
            [Piece.X]: new Model(model_data.x),
            [Piece.O]: new Model(model_data.o),
        },
        grid: new Model(model_data.grid),
        select: new Model(model_data.select),
    };
}

export function draw(board: Board) {
    const gl = ctx.gl;

    const dimension = Math.min(camera.dimension, board.dimension);

    const unfold = board.dimension - camera.dimension;
    const cols = unfold >= 1 ? 3 : 1;
    const rows = unfold >= 2 ? 3 : 1;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform1f(ctx.uniform.project_dist, config.project_dist);
    gl.uniform1f(ctx.uniform.select_size, config.select_size);

    let transform = m.identity();

    switch(dimension) {
        case Dimension.TWO:
            gl.uniformMatrix4fv(ctx.uniform.transform, false, m.identity());
            gl.uniformMatrix4fv(ctx.uniform.projection, false, m.project2D());
            gl.uniformMatrix4fv(ctx.uniform.rotation, false, m.identity());
            break;
        case Dimension.THREE:
            transform = m.mul(m.perspective(config.fov, 1, 0.1, 5), m.translate(0, 0, -camera.distance), transform);
            gl.uniformMatrix4fv(ctx.uniform.projection, false, m.project3D());
            gl.uniformMatrix4fv(ctx.uniform.rotation, false,
                m.mul(m.rotate3D(camera.rotation[1], [1, 0, 0]), m.rotate3D(camera.rotation[0], [0, 1, 0])));
            break;
        case Dimension.FOUR:
            transform = m.mul(m.perspective(config.fov, 1, 0.1, 5), m.translate(0, 0, -camera.distance), transform);
            gl.uniformMatrix4fv(ctx.uniform.projection, false, m.identity());
            gl.uniformMatrix4fv(ctx.uniform.rotation, false,
                m.mul(m.rotate4D(camera.rotation[2]), m.rotate3D(camera.rotation[1], [1, 0, 0]), m.rotate3D(camera.rotation[0], [0, 1, 0])));
            break;
    }

    transform = m.mul(m.scale(1/Math.max(rows, cols) * 0.9), transform);

    for(let col = 0; col < cols; col++) {
        for(let row = 0; row < rows; row++) {

            const should_draw = function([x, y, z, w]: m.Vec4): boolean {
                switch(camera.dimension) {
                    case Dimension.TWO:
                        return row == z && col == w;
                    case Dimension.THREE:
                        return col == w;
                    case Dimension.FOUR:
                    default:
                        return true;
                }
            };

            gl.uniformMatrix4fv(ctx.uniform.transform, false,
                m.mul(m.translate(cols == 1 ? 0 : (col-1) * 2/3, rows == 1 ? 0 : (row-1) * 2/3, 0), transform));

            models.grid.draw([0, 0, 0, 0]);

            const select_pos = index_to_pos(board.select);
            if(should_draw(select_pos))
                models.select.draw(m.grid_to_world(select_pos));

            board.pieces.forEach((piece, i) => {

                if(piece != null) {
                    const pos = index_to_pos(i);
                    if(should_draw(pos))
                        models.pieces[piece].draw(m.grid_to_world(pos));
                }
            });
        }
    }
}
