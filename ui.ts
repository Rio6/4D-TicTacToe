import { Config, Dimension, Board, Piece } from './ttt';
import { ClientBoard } from './client';

declare var config: Config;

const config_names = {
    dimension: "Board Dimension",
    rot_speed: "Rotation Speed",
    zoom_speed: "Zoom Speed",
    camera_dist: "Default Camera Distance",
    project_dist: "Projection Distance in 4D",
    point_size: "Point Size",
    fov: "Field of View",
    code: "Room Code",
};

function piece_to_text(piece: Piece) {
    return ["X", "O"][piece] ?? "spectator";
}

export function init() {
    const config_menu = document.querySelector('#config');

    for(let key in config) {

        if(key == 'dimension') {
            const dimensions = { "2D": Dimension.TWO, "3D": Dimension.THREE, "4D": Dimension.FOUR };
            const option = document.createElement('select');
            option.id = 'config-' + key;

            for(let dim in dimensions) {
                option.innerHTML += `
                    <option value="${dimensions[dim]}" ${dimensions[dim] == config.dimension ? 'selected="selected"' : ''}>
                        ${dim}
                    </option>
                `;
            }
            config_menu.appendChild(option);

        } else if(key == 'code') {
            config_menu.innerHTML += `
            <input id="config-${key}" type="text" value="${config[key]}" />
        `;

        } else {
            config_menu.innerHTML += `
            <input id="config-${key}" type="number" value="${config[key]}" />
        `;
        }


        config_menu.innerHTML += `
            <label for="config-${key}">${config_names[key] ?? key}</label>
        `;

        config_menu.innerHTML += '<br />';
    }

    for(let elem of Array.from(config_menu.children)) {
        elem.addEventListener('change', update_config);
    }
}

export function update_config() {
    for(let key in config) {
        const input = document.querySelector('#config-' + key) as HTMLInputElement;

        if(key == 'code')
            config[key] = input.value;
        else
            config[key] = Number(input.value);
    }
}

export function toggle_menu() {
    for(let elem of Array.from(document.querySelectorAll('.overlay')) as HTMLElement[]) {
        if(elem.style.top != '-100%') {
            elem.style.top = '-100%';
        } else {
            elem.style.top = '0px';
        }
    }
}

export function update_status(board: Board) {
    const status_elm = document.querySelector('#status');

    if(board instanceof ClientBoard && board.connected()) {
        status_elm.innerHTML = `
            your side: ${piece_to_text(board.side)}
            <br />
            waiting for: ${piece_to_text(board.cur_piece)}
            <br />
            ${board.url}
        `;
    } else {
        status_elm.innerHTML = 'not connected';
    }
}
