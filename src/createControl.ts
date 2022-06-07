import './controls.css';

const controlsContainer = document.querySelector<HTMLDivElement>('.controls-container')!;

export default function createControl(options: { name: string, startingValue: number, min: number, max: number, step: number, onChange: (val: number) => void }): HTMLInputElement {    
    const p = document.createElement('p');
    p.textContent = `${options.name}: ${options.startingValue}`;

    const input = document.createElement('input');
    input.type = 'range';
    input.min = options.min.toString();
    input.max = options.max.toString();
    input.step = options.step.toString();
    input.width = 500;
    input.value = options.startingValue.toString();

    const onchange = () => {
        options.onChange(parseFloat(input.value));
        p.textContent = `${options.name}: ${input.value}`;
    };
    input.onchange = onchange;
    input.oninput = onchange;
    onchange();

    const div = document.createElement('div');
    div.className = 'control-container';
    div.appendChild(p);
    div.appendChild(input);
    controlsContainer.appendChild(div);

    return input;
}
