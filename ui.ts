import { Config, Dimension } from './ttt';

declare var config: Config;

export function init() {
    const menu = document.querySelector('#menu');

    for(let key in config) {

        menu.innerHTML += `
            <label for="config-${key}">${key}</label>
        `;

        if(key == 'dimension') {
            const dimensions = { "2D": Dimension.TWO, "3D": Dimension.THREE, "4D": Dimension.FOUR };
            const option = document.createElement('select');
            option.id = 'config-dimension';

            for(let dim in dimensions) {
                option.innerHTML += `
                    <option value="${dimensions[dim]}" ${dimensions[dim] == config.dimension ? 'selected="selected"' : ''}>
                        ${dim}
                    </option>
                `;
            }
            menu.appendChild(option);

            menu.innerHTML += '<br />';
            continue;
        }

        menu.innerHTML += `
            <input id="config-${key}" type="number" value="${config[key]}" />
            <br />
        `;
    }
}
