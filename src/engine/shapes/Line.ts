import CollidableEntity, { CollidableEntityOptions } from '../CollidableEntity';
import { add, lineCircleIntersection, LineEquation, lineIntersection, Point2D, polarToPoint, twoPointsLineEquation, withinBoxBounds } from '../../util/vectorMath';
import Circle from './Circle';

export default class Line extends CollidableEntity {
    constructor(options: { length: number } & CollidableEntityOptions) {
        options.boundingRadius = options.length;
        if (options.excludeFromQuadTree === false) {
            throw new TypeError('quadtree optimization for Line is not supported');
        }
        options.excludeFromQuadTree = true;
        super(options);
    }

    get length(): number {
        return this.boundingRadius;
    }
    set length(newVal: number) {
        this.boundingRadius = newVal;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.length, 0);
        ctx.stroke();
    }

    getEndpoint(): Point2D {
        return add(this, polarToPoint({ magnitude: this.length, angle: this.rotation }));
    }

    getLineEquation(): LineEquation {
        return twoPointsLineEquation(this, this.getEndpoint());
    }
    withinBounds(point: Point2D): boolean {
        return withinBoxBounds(point, this, this.getEndpoint());
    }

    getIntersectionsWith(entity: CollidableEntity): Point2D[] {
        if (entity instanceof Line) {
            const intersection = lineIntersection(this.getLineEquation(), entity.getLineEquation());
            if (this.withinBounds(intersection) && entity.withinBounds(intersection)) {
                return [intersection];
            }
            return [];
        } else if (entity instanceof Circle) {
            const intersections = lineCircleIntersection(this.getLineEquation(), entity.getCircleEquation());
            return intersections.filter(intersection => this.withinBounds(intersection) && entity.withinBounds(intersection));
        } else {
            return entity.getIntersectionsWith(this);
        }
    }
}
