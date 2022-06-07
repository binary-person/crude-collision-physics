export interface EntityOptions {
    x?: number;
    y?: number;
    rotation?: number;
    strokeStyle?: string;
    fillStyle?: string;
}

export default abstract class Entity {
    x: number;
    y: number;
    rotation: number;
    strokeStyle: string;
    fillStyle: string;

    constructor({ x = 0, y = 0, rotation = 0, strokeStyle = 'black', fillStyle = 'black' }: EntityOptions = {}) {
        this.x = x;
        this.y = y;
        this.rotation = rotation;
        this.strokeStyle = strokeStyle;
        this.fillStyle = fillStyle;
    }
    abstract draw(ctx: CanvasRenderingContext2D): void;
}
