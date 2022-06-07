export default function formatTime(time: number) {
    const milliseconds = time % 1000;
    time = Math.floor(time / 1000);
    const seconds = time % 60;
    time = Math.floor(time / 60);
    const minutes = time % 60;
    time = Math.floor(time / 60);
    const hours = time % 24;
    time = Math.floor(time / 24);
    const days = time;

    const show = function (value: number, units: string) {
        if (value)
            return value + " " + units + (value === 1 ? "" : "s") + " ";
        return ""
    };
    const pad = (num: number | string, amt = 2) => num.toString().padStart(amt, '0');
    const m = milliseconds.toFixed(4).split('.');
    return `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(m[0], 3)}.${m[1]}`;
}
