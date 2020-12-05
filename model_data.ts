const model_data : {
    x: { color: [number, number, number, number], elems: number[], verts: number[] }[],
    o: { color: [number, number, number, number], elems: number[], verts: number[] }[],
    grid: { color: [number, number, number, number], elems: number[], verts: number[] }[],
} = {
    x: [
        {
            color: [1, 0, 0, 1],
            elems: [0, 1, 2, 3],
            verts: [
                -.25, -.25, 0, 1,
                 .25,  .25, 0, 1,
                -.25,  .25, 0, 1,
                 .25, -.25, 0, 1,
            ]
        },
        {
            color: [1, 0, 0, 1],
            elems: [0, 1, 2, 3, 4, 5, 6, 7],
            verts: [
                 .25,  .25,  .25, 1,
                -.25, -.25, -.25, 1,
                -.25, -.25,  .25, 1,
                 .25,  .25, -.25, 1,
                 .25, -.25, -.25, 1,
                -.25,  .25,  .25, 1,
                 .25, -.25,  .25, 1,
                -.25,  .25, -.25, 1,
            ]
        },
        {
            color: [1, 0, 0, 1],
            elems: [0, 1, 2, 3, 4, 5, 6, 7],
            verts: [
                 .25,  .25,  .25, 1,
                -.25, -.25, -.25, 1,
                -.25, -.25,  .25, 1,
                 .25,  .25, -.25, 1,
                 .25, -.25, -.25, 1,
                -.25,  .25,  .25, 1,
                 .25, -.25,  .25, 1,
                -.25,  .25, -.25, 1,
            ]
        }
    ],
    o: [
        {
            color: [0, 0, 1, 1],
            elems: [0, 1, 1, 2, 2, 3, 3, 0],
            verts: [
                -.25, -.25, 0, 1,
                -.25,  .25, 0, 1,
                 .25,  .25, 0, 1,
                 .25, -.25, 0, 1,
            ]
        },
        {
            color: [0, 0, 1, 1],
            elems: [0, 1, 1, 2, 2, 3, 3, 0, 0, 4, 1, 5, 2, 6, 3, 7, 4, 5, 5, 6, 6, 7, 7, 4],
            verts: [
                -.25, -.25, -.25, 1,
                -.25,  .25, -.25, 1,
                 .25,  .25, -.25, 1,
                 .25, -.25, -.25, 1,
                -.25, -.25,  .25, 1,
                -.25,  .25,  .25, 1,
                 .25,  .25,  .25, 1,
                 .25, -.25,  .25, 1,
            ]
        },
        {
            color: [0, 0, 1, 1],
            elems: [0, 1, 1, 2, 2, 3, 3, 0],
            verts: [
                -.25, -.25, 0, 1,
                -.25,  .25, 0, 1,
                 .25,  .25, 0, 1,
                 .25, -.25, 0, 1,
            ]
        }
    ],
    grid: [
        {
            color: [1, 1, 1, 1],
            elems: [0, 1, 2, 3, 4, 5, 6, 7],
            verts: [
                -1/3, -1, 0, 1,
                -1/3,  1, 0, 1,
                 1/3, -1, 0, 1,
                 1/3,  1, 0, 1,
                -1, -1/3, 0, 1,
                 1, -1/3, 0, 1,
                -1,  1/3, 0, 1,
                 1,  1/3, 0, 1,
            ]
        },
        {
            color: [1, 1, 1, 1],
            elems: Array(24).fill(0).map((_, i) => i),
            verts: [
                 1,  1/3,  1/3, 1,
                -1,  1/3,  1/3, 1,
                 1, -1/3,  1/3, 1,
                -1, -1/3,  1/3, 1,
                 1,  1/3,  -1/3, 1,
                -1,  1/3,  -1/3, 1,
                 1, -1/3,  -1/3, 1,
                -1, -1/3,  -1/3, 1,

                 1/3,  1,  1/3, 1,
                 1/3, -1,  1/3, 1,
                 1/3,  1, -1/3, 1,
                 1/3, -1, -1/3, 1,
                -1/3,  1,  1/3, 1,
                -1/3, -1,  1/3, 1,
                -1/3,  1, -1/3, 1,
                -1/3, -1, -1/3, 1,

                 1/3,  1/3,  1, 1,
                 1/3,  1/3, -1, 1,
                -1/3,  1/3,  1, 1,
                -1/3,  1/3, -1, 1,
                 1/3,  -1/3,  1, 1,
                 1/3,  -1/3, -1, 1,
                -1/3,  -1/3,  1, 1,
                -1/3,  -1/3, -1, 1,
            ]
        },
        {
            color: [1, 1, 1, 1],
            elems: [0, 1, 2, 3, 4, 5, 6, 7],
            verts: [
                -1/3, -1, 0, 1,
                -1/3,  1, 0, 1,
                 1/3, -1, 0, 1,
                 1/3,  1, 0, 1,
                -1, -1/3, 0, 1,
                 1, -1/3, 0, 1,
                -1,  1/3, 0, 1,
                 1,  1/3, 0, 1,
            ]
        }
    ]
};
