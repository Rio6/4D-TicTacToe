export type ModelData = {
    mode: string,
    color: [number, number, number, number],
    elems: number[],
    verts: number[]
};

const cube_vertices = [
     .25,  .25,  .25,  .25,
    -.25, -.25, -.25, -.25,
     .25,  .25,  .25, -.25,
    -.25, -.25, -.25,  .25,
     .25,  .25, -.25,  .25,
    -.25, -.25,  .25, -.25,
     .25,  .25, -.25, -.25,
    -.25, -.25,  .25,  .25,
     .25, -.25,  .25,  .25,
    -.25,  .25, -.25, -.25,
     .25, -.25,  .25, -.25,
    -.25,  .25, -.25,  .25,
     .25, -.25, -.25,  .25,
    -.25,  .25,  .25, -.25,
     .25, -.25, -.25, -.25,
    -.25,  .25,  .25,  .25,
];

export const model_data = {
    x: {
        mode: "LINES",
        color: [1, 0, 0, 1],
        elems: Array(8).fill(0).map((_, i) => i),
        verts: cube_vertices,
    },
    o: {
        mode: "LINES",
        color: [0, 0, 1, 1],
        elems: [
            0, 1, 1, 2, 2, 3, 3, 0,
            0, 4, 1, 5, 2, 6, 3, 7,
            4, 5, 5, 6, 6, 7, 7, 4,

            0, 8, 1, 9, 2, 10, 3, 11,
            4, 12, 5, 13, 6, 14, 7, 15,

            8, 9, 9, 10, 10, 11, 11, 8,
            8, 12, 9, 13, 10, 14, 11, 15,
            12, 13, 13, 14, 14, 15, 15, 12,
        ],
        verts: cube_vertices,
    },
    select: {
        mode: "POINTS",
        color: [0, 1, 0, 1],
        elems: [0],
        verts: [0, 0, 0, 0]
    },
    winner: {
        mode: "POINTS",
        color: [0, 1, 1, 1],
        elems: [0],
        verts: [0, 0, 0, 0]
    },
} as {
    x: ModelData,
    o: ModelData,
    select: ModelData,
    winner: ModelData,
};

export function grid_data(nxn: number): ModelData {
    const dist = 2 / nxn;
    const start = -1;

    const grid_pos: number[][] = [];
    for(let i = 1; i < nxn; i++) {
        for(let j = 1; j < nxn; j++) {
            for(let k = 1; k < nxn; k++) {
                grid_pos.push([
                    start + i * dist,
                    start + j * dist,
                    start + k * dist
                ]);
            }
        }
    }

    const verts: number[] = [];
    for(let i = 0; i < 4; i++) {
        for(let pos of grid_pos) {
            for(let end of [-1, 1]) {
                const vert = pos.slice();
                vert.splice(i, 0, end);
                verts.push(...vert);
            }
        }
    }

    return {
        mode: 'LINES',
        color: [1, 1, 1, 1],
        elems: Array(verts.length / 4).fill(0).map((_, i) => i),
        verts: verts,
    } as ModelData;
}
