import { Config, Dimension } from './ttt';

declare var config: Config;

export function init() {
    const config_menu = document.querySelector('#config');

    for(let key in config) {

        config_menu.innerHTML += `
            <label for="config-${key}">${key}</label>
        `;

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

            config_menu.innerHTML += '<br />';

        } else if(key == 'code') {
            config_menu.innerHTML += `
            <input id="config-${key}" type="text" value="${config[key]}" />
            <br />
        `;

        } else {
        config_menu.innerHTML += `
            <input id="config-${key}" type="number" value="${config[key]}" />
            <br />
        `;
        }
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
    const menu = document.querySelector('#menu') as HTMLElement;
    if(menu.style.right != '-500px') {
        menu.style.right = '-500px';
    } else {
        menu.style.right = '0px';
    }
}
