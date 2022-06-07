import CollidableEntity, { CollidableEntityOptions } from '../CollidableEntity';
import { CircleEquation, Point2D, pointsToPolar, withinCircleBounds } from '../../util/vectorMath';
import Line from './Line';

export default class Circle extends CollidableEntity {
    constructor(options: { radius: number } & CollidableEntityOptions) {
        options.boundingRadius = options.radius;
        super(options);
    }

    get radius(): number {
        return this.boundingRadius;
    }
    set radius(newVal: number) {
        this.boundingRadius = newVal;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    getCircleEquation(): CircleEquation {
        return { x: this.x, y: this.y, radius: this.radius };
    }

    withinBounds(point: Point2D): boolean {
        const polar = pointsToPolar(this, point);
        if (window.debug) {
            window.camera.addTempEntity(new Line({ x: this.x, y: this.y, length: polar.magnitude, rotation: polar.angle }));
        }
        return withinCircleBounds(point, this, this.radius);
    }

    getIntersectionsWith(entity: CollidableEntity): Point2D[] {
        if (entity instanceof Circle) {
            const polar = pointsToPolar(this, entity);
            if (this.radius + entity.radius >= polar.magnitude) {
                return [{
                    x: (Math.cos(polar.angle) * (polar.magnitude - entity.radius)) + this.x,
                    y: (Math.sin(polar.angle) * (polar.magnitude - entity.radius)) + this.y
                }];
            }
            return [];
        } else if (entity instanceof Line) {
            return entity.getIntersectionsWith(this);
        } else {
            return entity.getIntersectionsWith(this);
        }
    }
}
