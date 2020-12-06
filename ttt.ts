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

    move(dir: m.Vec4) {
        this.select = m.pos_to_index(
            m.addv4(dir, m.index_to_pos(this.select))
        );
    }
}
