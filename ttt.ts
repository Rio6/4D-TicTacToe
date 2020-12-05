import { model_data, ModelData } from './model_data';
import * as m from './math';

const config = {
    fov: 60,
    rot_speed: 0.01,
    zoom_speed: 0.25,
    camera_dist: 3,
    project_dist: 3,
    select_size: 10,
};

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

enum Piece {
    X, O
}

enum Dimension {
    TWO, THREE, FOUR
}

enum Direction {
    RIGHT, LEFT, UP, DOWN, FRONT, BACK, ANA, KATA
}

class Board {
    public dimension: number;
    public pieces: Piece[] = [];
    public cur_piece: Piece = Piece.X;
    public select: number = 0;

    constructor(dimension: Dimension) {
        this.dimension = dimension;
    }

    swap_piece() {
        if(this.cur_piece == Piece.X)
            this.cur_piece = Piece.O;
        else
            this.cur_piece = Piece.X;
    }

    put_piece(): boolean {
        if(this.pieces[this.select] == null) {
            this.pieces[this.select] = this.cur_piece;
            this.swap_piece();
            return true;
        }

        return false;
    }
}

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

const camera = {
    rotation: [ 0, 0, 0 ],
    distance: config.camera_dist,
    dimension: Dimension.TWO,
};

const board = new Board(Dimension.FOUR);

function index_to_pos(i: number): m.Vec4 {
    return [
        i % 3,
        m.div(i % 9, 3),
        m.div(i % 27, 9),
        m.div(i, 27),
    ];
}

export function next_index(index: number, dir: Direction): number {
    let step = 1, exp;

    switch(dir) {
        case Direction.LEFT: case Direction.DOWN: case Direction.BACK: case Direction.KATA:
            step = -1;
    }

    switch(dir) {
        case Direction.RIGHT: case Direction.LEFT:
            exp = 1;
            break;

        case Direction.UP: case Direction.DOWN:
            exp = 2;
            break;

        case Direction.FRONT: case Direction.BACK:
            exp = 3;
            break;

        case Direction.ANA: case Direction.KATA:
            exp = 4;
            break;
    }

    const pow = 3**exp;
    return m.div(index, pow) * pow + m.mod(index + step * pow/3, pow);
}

function init() {
    const can = document.getElementById("canvas") as HTMLCanvasElement;
    const gl = can.getContext('webgl2');

    can.addEventListener('mousemove', mousemove);
    can.addEventListener('wheel', wheel);
    can.addEventListener('keydown', keydown);
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
            select_size:  gl.getUniformLocation(program, 'select_size'),
        }
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

    draw(board);
}

function draw(board: Board) {
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

    transform = m.mul(m.scale(1/cols * 0.9), transform);

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

function keydown(e: KeyboardEvent) {
    switch(e.key) {
        case '[':
            if(camera.dimension > Dimension.TWO)
                camera.dimension -= 1;
            break;
        case ']':
            if(e.key == "]" && camera.dimension < board.dimension)
                camera.dimension += 1;
            break;
        case ' ':
            board.put_piece();
            break;
        case 'ArrowLeft':
            board.select = next_index(board.select, Direction.LEFT);
            break;
        case 'ArrowRight':
            board.select = next_index(board.select, Direction.RIGHT);
            break;
        case 'ArrowUp':
            board.select = next_index(board.select, Direction.UP);
            break;
        case 'ArrowDown':
            board.select = next_index(board.select, Direction.DOWN);
            break;
        case 'w':
            board.select = next_index(board.select, Direction.FRONT);
            break;
        case 's':
            board.select = next_index(board.select, Direction.BACK);
            break;
        case 'd':
            board.select = next_index(board.select, Direction.ANA);
            break;
        case 'a':
            board.select = next_index(board.select, Direction.KATA);
            break;
    }

    draw(board);
}

window.onload = init;

export {
    config, camera, board
};
