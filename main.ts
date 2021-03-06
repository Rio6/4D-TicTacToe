import { Config, Piece, Dimension, Board } from './ttt';
import { ClientBoard } from './client';
import * as ui from './ui';
import * as graphics from './graphics';

declare var config: Config;
declare const window: any;
window.config = {
    dimension: Dimension.FOUR,
    rot_speed: 0.01,
    zoom_speed: 0.25,
    camera_dist: 3,
    project_dist: 3,
    point_size: 10,
    fov: 60,
    code: '',
};

let board = new Board(config.dimension);

function init() {
    const can = document.getElementById('canvas') as HTMLCanvasElement;

    can.addEventListener('keydown', keydown);
    can.addEventListener('contextmenu', e => {
        e.preventDefault();
        return false
    });

    ui.init();

    graphics.init(can);
    graphics.draw(board);
    ui.update_status(board);
}

function keydown(e: KeyboardEvent) {
    const camera = graphics.camera;

    switch(e.key) {
        case '[':
            if(camera.dimension > Dimension.TWO)
                camera.dimension -= 1;
            break;
        case ']':
            if(camera.dimension < board.dimension)
                camera.dimension += 1;
            break;
        case 't':
            ui.toggle_menu();
            break;
        case ' ':
            board.put_piece();
            break;
        case 'r':
            board.reset(config.dimension);
            break;
        case 'c':
            if(board instanceof ClientBoard)
                board.disconnect();

            if(config.code != '') {
                board = new ClientBoard(config.dimension, config.code, (board: Board) => {
                    ui.update_status(board);
                    graphics.draw(board);
                });
            } else {
                board = new Board(config.dimension);
            }
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

    board.check_winners();

    graphics.draw(board);
    ui.update_status(board);
}

window.onload = init;
