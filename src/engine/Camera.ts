import mod from '../util/mod';
import Entity from './Entity';


// units are in cm
export default class Camera {
    x = 0;
    y = 0;
    scaling = 0.6;
    gridSize = 100;

    ctx: CanvasRenderingContext2D;
    private tempEntities: Entity[] = [];

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
    }

    addTempEntity(entity: Entity) {
        this.tempEntities.push(entity);
    }
    clearTempEntities() {
        this.tempEntities = [];
    }

    render(entities: Entity[]) {
        const cWidth = this.ctx.canvas.width;
        const cHeight = this.ctx.canvas.height;
        this.ctx.resetTransform();
        this.ctx.clearRect(0, 0, cWidth, cHeight);

        this.drawGrid();

        this.ctx.translate((-this.x * this.scaling) + (cWidth / 2), (-this.y * this.scaling) + (cHeight / 2));
        this.ctx.scale(this.scaling, this.scaling);

        this.ctx.strokeStyle = 'purple';
        this.ctx.lineWidth = 1;
        this.ctx.fillStyle = 'purple';
        this.ctx.lineCap = 'square';

        for (const entity of entities.concat(this.tempEntities)) {
            this.ctx.save();
            this.ctx.strokeStyle = entity.strokeStyle;
            this.ctx.fillStyle = entity.fillStyle;
            this.ctx.translate(entity.x, entity.y);
            this.ctx.rotate(entity.rotation);
            entity.draw(this.ctx);
            this.ctx.restore();
        }
    }

    private drawGrid() {
        const gridSizeCanvas = this.gridSize * this.scaling;
        const cWidth = this.ctx.canvas.width;
        const cHeight = this.ctx.canvas.height;
        const gWidth = cWidth / this.scaling;
        const gHeight = cHeight / this.scaling;

        this.ctx.beginPath();
        for (let i = (mod((gWidth / 2) - this.x, this.gridSize) - this.gridSize) * this.scaling; i < cWidth; i += gridSizeCanvas) {
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, cHeight);
        }
        for (let i = (mod((gHeight / 2) - this.y, this.gridSize) - this.gridSize) * this.scaling; i < cHeight; i += gridSizeCanvas) {
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(cWidth, i);
        }

        this.ctx.strokeStyle = `rgba(0,0,0,${Math.min(0.5, this.scaling * 0.2)})`;
        this.ctx.lineWidth = Math.min(2, this.scaling);
        this.ctx.stroke();
    }
}
