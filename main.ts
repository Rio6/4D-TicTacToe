import { Config, Piece, Dimension, Direction, Board } from './ttt';
import * as graphics from './graphics'

declare var config: Config;
globalThis.config = {
    fov: 60,
    rot_speed: 0.01,
    zoom_speed: 0.25,
    camera_dist: 3,
    project_dist: 3,
    select_size: 10,
};

const board = new Board(Dimension.FOUR);

function init() {
    const can = document.getElementById("canvas") as HTMLCanvasElement;

    can.addEventListener('mousemove', mousemove);
    can.addEventListener('wheel', wheel);
    can.addEventListener('keydown', keydown);
    can.addEventListener('contextmenu', e => {
        e.preventDefault();
        return false
    });

    can.addEventListener('mousedown', () => can.requestPointerLock());
    can.addEventListener('mouseup', () => document.exitPointerLock());

    graphics.init(can);
    graphics.draw(board);
}

function mousemove(e: MouseEvent) {
    let to_draw = false;

    if(e.buttons & 1) {
        graphics.camera.rotation[0] += -config.rot_speed * e.movementX;
        graphics.camera.rotation[1] += -config.rot_speed * e.movementY;

        /*
        if(graphics.camera.rotation[1] > Math.PI/2)
            graphics.camera.rotation[1] = Math.PI/2;
        if(graphics.camera.rotation[1] < -Math.PI/2)
            graphics.camera.rotation[1] = -Math.PI/2;
        */

        to_draw = true;
    }

    if(e.buttons & 2) {
        graphics.camera.rotation[2] += config.rot_speed * e.movementX;
        to_draw = true;
    }

    if(to_draw)
        graphics.draw(board);
}

function wheel(e: WheelEvent) {
    graphics.camera.distance += config.zoom_speed * e.deltaY;
    if(graphics.camera.distance < 0)
        graphics.camera.distance = 0;
    graphics.draw(board);
}

function keydown(e: KeyboardEvent) {
    switch(e.key) {
        case '[':
            if(graphics.camera.dimension > Dimension.TWO)
                graphics.camera.dimension -= 1;
            break;
        case ']':
            if(e.key == "]" && graphics.camera.dimension < board.dimension)
                graphics.camera.dimension += 1;
            break;
        case ' ':
            board.put_piece();
            break;
        case 'ArrowLeft':
            board.move(Direction.LEFT);
            break;
        case 'ArrowRight':
            board.move(Direction.RIGHT);
            break;
        case 'ArrowUp':
            board.move(Direction.UP);
            break;
        case 'ArrowDown':
            board.move(Direction.DOWN);
            break;
        case 'w':
            board.move(Direction.FRONT);
            break;
        case 's':
            board.move(Direction.BACK);
            break;
        case 'd':
            board.move(Direction.ANA);
            break;
        case 'a':
            board.move(Direction.KATA);
            break;
    }

    graphics.draw(board);
}

window.onload = init;
