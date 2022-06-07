import Camera from '../engine/Camera';

export default function addMouseControl(canvas: HTMLCanvasElement, camera: Camera) {
    let mouseEnabled = true;
    let mousedown = false;
    let ctrlKey = false;
    let clientClickX = 0, clientClickY = 0;
    let cameraClickX = 0, cameraClickY = 0;

    canvas.addEventListener('mousemove', event => {
        if (mousedown && mouseEnabled) {
            const deltaX = clientClickX - event.clientX;
            const deltaY = clientClickY - event.clientY;
            camera.x = cameraClickX + (deltaX / camera.scaling);
            camera.y = cameraClickY + (deltaY / camera.scaling);
        }
    });
    canvas.addEventListener('mousedown', event => {
        clientClickX = event.clientX;
        clientClickY = event.clientY;
        cameraClickX = camera.x;
        cameraClickY = camera.y;
        mousedown = true;
    });
    canvas.addEventListener('mouseup', () => {
        mousedown = false;
    });
    document.addEventListener('keydown', event => ctrlKey = event.ctrlKey);
    document.addEventListener('keyup', event => ctrlKey = event.ctrlKey);
    canvas.addEventListener('wheel', event => {
        if (mouseEnabled) {
            event.preventDefault();
            if (!ctrlKey) {
                camera.scaling = Math.min(10, Math.max(0.2, camera.scaling + (-event.deltaY * 0.001)));
            } else {
                camera.x += event.deltaX / camera.scaling;
                camera.y += event.deltaY / camera.scaling;
            }
        }
    });

    return { disableMouse: () => mouseEnabled = false, enableMouse: () => mouseEnabled = true };
}
