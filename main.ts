import { Config, Piece, Dimension, Board } from './ttt';
import * as graphics from './graphics'

declare var config: Config;
globalThis.config = {
    fov: 60,
    rot_speed: 0.01,
    zoom_speed: 0.25,
    camera_dist: 3,
    project_dist: 3,
    point_size: 10,
};

const board = new Board(Dimension.FOUR);

function init() {
    const can = document.getElementById("canvas") as HTMLCanvasElement;

    can.addEventListener('keydown', keydown);
    can.addEventListener('contextmenu', e => {
        e.preventDefault();
        return false
    });

    graphics.init(can);
    graphics.draw(board);
}

function keydown(e: KeyboardEvent) {
    const camera = graphics.camera;

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
        case 'ArrowRight':
            board.move([1, 0, 0, 0]);
            break;
        case 'ArrowLeft':
            board.move([-1, 0, 0, 0]);
            break;
        case 'ArrowUp':
            board.move([0, 1, 0, 0]);
            break;
        case 'ArrowDown':
            board.move([0, -1, 0, 0]);
            break;
        case 'w':
            board.move([0, 0, 1, 0]);
            break;
        case 's':
            board.move([0, 0, -1, 0]);
            break;
        case 'd':
            board.move([0, 0, 0, 1]);
            break;
        case 'a':
            board.move([0, 0, 0, -1]);
            break;
    }

    if(!board.winner)
        board.check_winner();

    graphics.draw(board);
}

window.onload = init;
