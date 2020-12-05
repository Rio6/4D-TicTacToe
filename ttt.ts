import * as m from './math';

export type Config = {
    fov: number,
    rot_speed: number,
    zoom_speed: number,
    camera_dist: number,
    project_dist: number,
    select_size: number,
};

export enum Piece {
    X, O
}

export enum Dimension {
    TWO, THREE, FOUR
}

export enum Direction {
    RIGHT, LEFT, UP, DOWN, FRONT, BACK, ANA, KATA
}

export class Board {
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

    move(dir: Direction) {
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
        this.select = m.div(this.select, pow) * pow + m.mod(this.select + step * pow/3, pow);
    }
}
