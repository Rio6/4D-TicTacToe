import * as m from './math';

export type Config = {
    dimension: Dimension,
    rot_speed: number,
    zoom_speed: number,
    camera_dist: number,
    project_dist: number,
    point_size: number,
    fov: number,
    code: string,
};

export type Winner = {
    indexes: number[],
    piece: Piece
};

export enum Piece {
    X, O
}

export enum Dimension {
    TWO, THREE, FOUR
}

export class Board {
    public dimension: number;
    public pieces: Piece[];
    public cur_piece: Piece;
    public select: number;
    public winners: Winner[];

    constructor(dimension: Dimension) {
        this.reset(dimension);
    }

    reset(dimension: Dimension = this.dimension ?? Dimension.FOUR) {
        this.dimension = dimension;
        this.pieces = [];
        this.cur_piece = Piece.X;
        this.select = 0;
        this.winners = [];
    }

    swap_piece() {
        if(this.cur_piece == Piece.X)
            this.cur_piece = Piece.O;
        else
            this.cur_piece = Piece.X;
    }

    put_piece() {
        if(this.pieces[this.select] == null) {
            this.pieces[this.select] = this.cur_piece;
            this.swap_piece();
        }
    }

    move(dir: m.Vec4) {
        this.select = m.pos_to_index(
            m.addv4(dir, m.index_to_pos(this.select))
        );

        if(this.dimension == Dimension.TWO)
            this.select %= 9;
        else if(this.dimension == Dimension.THREE)
            this.select %= 27;
    }

    check_winners() {

        this.winners = [];

        const line_directions = function(pos: m.Vec4): m.Vec4[] {
            const forms_line = [0, 1, 2, 3].filter(i => pos[i] != 1);

            const rst = [];

            for(let comb = 1; comb < (1 << forms_line.length); comb++) {
                const dir: m.Vec4 = [0, 0, 0, 0];

                forms_line.filter((_, i) => ((1<<i) & comb) != 0).forEach(i => {
                    if(pos[i] == 0)
                        dir[i] = 1
                    else
                        dir[i] = -1
                });

                rst.push(dir);
            }

            return rst;
        };

        const dir_to_indexes = function(pos: m.Vec4, dir: m.Vec4): number[] {
            const indexes = [];
            while(Math.max(...pos.map(Math.abs)) < 3) {
                indexes.push(m.pos_to_index(pos));
                pos = m.addv4(pos, dir);
            }
            return indexes;
        };

        for(let i = 0; i < 81; i++) {

            const pos = m.index_to_pos(i);
            for(let dir of line_directions(pos)) {

                const inds = dir_to_indexes(pos, dir);
                const first_piece = this.pieces[inds[0]];

                if(first_piece != null && inds.every(i => this.pieces[i] == first_piece)) {
                    this.winners.push({
                        indexes: inds, 
                        piece: this.pieces[inds[0]]
                    });
                }

            }
        }
    }

    serialize(): string {
        return JSON.stringify({
            dimension: this.dimension,
            pieces: this.pieces,
            cur_piece: this.cur_piece
        });
    }

    deserialize(json: string) {
        const data = JSON.parse(json);
        this.dimension = data.dimension;
        this.pieces = data.pieces;
        this.cur_piece = data.cur_piece;
    }
}
