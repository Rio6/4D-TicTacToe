/*
 * math for mul, frustum, perspective, and rotate3D from
 * https://github.com/treeform/vmath
 */

type Vec3 = [number, number, number];
type Vec4 = [number, number, number, number];
type Mat4 = [
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
    number, number, number, number,
];

function zero_mat(): Mat4 {
    return [
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
    ];
}

function identity(): Mat4 {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ];
}

function mul(...mats: Mat4[]): Mat4 {
    const do_mul = (a: Mat4, b: Mat4): Mat4 => {
        const [
            a00, a01, a02, a03,
            a10, a11, a12, a13,
            a20, a21, a22, a23,
            a30, a31, a32, a33,
        ] = a;

        const [
            b00, b01, b02, b03,
            b10, b11, b12, b13,
            b20, b21, b22, b23,
            b30, b31, b32, b33,
        ] = b;

        return [
            b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
            b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
            b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
            b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
            b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
            b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
            b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
            b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
            b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
            b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
            b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
            b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
            b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
            b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
            b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
            b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
        ];
    };

    return mats.reduceRight((a, b) => do_mul(b, a));
}

function frustum(left: number, right: number, bottom: number, top: number, near: number, far: number): Mat4 {
    const rl = (right - left);
    const tb = (top - bottom);
    const fn = (far - near);

    return [
        (near*2) / rl, 0, 0, 0,
        0, (near*2) / tb, 0, 0,
        (right + left) / rl, (top + bottom) / tb, -(far + near) / fn, -1, 0,
        0, -(far*near*2) / fn, 0,
    ]
}

function perspective(fovy: number, aspect: number, near: number, far: number): Mat4 {
    const top = near * Math.tan(fovy*Math.PI / 360.0);
    const right = top * aspect;
    return frustum(-right, right, -top, top, near, far);
}

function translate(x: number, y: number, z: number): Mat4 {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, y, z, 1,
    ];
}

function scale(f: number): Mat4 {
    return [
        f, 0, 0, 0,
        0, f, 0, 0,
        0, 0, f, 0,
        0, 0, 0, 1,
    ];
}

function rotate3D(th: number, axis: Vec3): Mat4 {
    const s = Math.sin(th/2);
    const c = Math.cos(th/2);

    let
        x = s * axis[0],
        y = s * axis[1],
        z = s * axis[2],
        w = c,

        xx = x * x,
        xy = x * y,
        xz = x * z,
        xw = x * w,
        yy = y * y,
        yz = y * z,
        yw = y * w,
        zz = z * z,
        zw = z * w;

    return [
        1 - 2 * (yy + zz),
        0 + 2 * (xy - zw),
        0 + 2 * (xz + yw),
        0,
        0 + 2 * (xy + zw),
        1 - 2 * (xx + zz),
        0 + 2 * (yz - xw),
        0,
        0 + 2 * (xz - yw),
        0 + 2 * (yz + xw),
        1 - 2 * (xx + yy),
        0,
        0, 0, 0, 1,
    ];
}

function rotate4D(th: number): Mat4 {
    const s = Math.sin(th);
    const c = Math.cos(th);

    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, c, s,
        0, 0, -s, c,
    ]
}

function project2D(): Mat4 {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
    ];
}

function project3D(w): Mat4 {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 0,
    ];
}
