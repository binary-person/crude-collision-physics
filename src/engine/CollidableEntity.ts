import Entity, { EntityOptions } from './Entity';
import Circle from './shapes/Circle';
import { averagePoints, Point2D, pointsToPolar, Polar2D, polarToPoint, restitutionCollisionVf1, rotateVector } from '../util/vectorMath';

export interface CollidableEntityOptions extends EntityOptions {
    vX?: number;
    vY?: number;
    mass?: number;
    frozen?: boolean;
    restitution?: number;
    boundingRadius?: number;
    excludeFromQuadTree?: boolean;
}

export default abstract class CollidableEntity extends Entity {
    vX = 0;
    vY = 0;

    aX = 0; // acceleration values are cleared after every tick to prevent accumulation
    aY = 0;
    oX = 0; // offset values cleared every tick
    oY = 0;

    mass: number; // in grams
    restitution: number; // between 0 and 1
    boundingRadius: number;
    frozen: boolean;
    excludeFromQuadTree: boolean;

    constructor(options: CollidableEntityOptions = {}) {
        const { vX = 0, vY = 0, mass = 100, restitution = 1, frozen = false, excludeFromQuadTree = false, boundingRadius } = options;
        super(options);
        this.vX = vX;
        this.vY = vY;
        this.mass = mass;
        this.frozen = frozen;
        this.excludeFromQuadTree = excludeFromQuadTree;
        if (!boundingRadius) {
            throw new TypeError('must specify boundingRadius');
        }
        if (restitution < 0 || restitution > 1) {
            throw new TypeError('coefficient of restitution must be between 0 and 1');
        }
        this.restitution = restitution;
        this.boundingRadius = boundingRadius;
    }

    get vMagnitude(): number {
        return Math.hypot(this.vX, this.vY);
    }

    set vMagnitude(newMagnitude: number) {
        const changeFactor = newMagnitude / this.vMagnitude;
        this.vX *= changeFactor;
        this.vY *= changeFactor;
    }

    get vAngle(): number {
        return Math.atan2(this.vY, this.vX);
    }

    set vAngle(newAngle: number) {
        const mag = this.vMagnitude;
        this.vX = Math.cos(newAngle) * mag;
        this.vY = Math.sin(newAngle) * mag;
    }

    applyForce(force: Point2D) {
        this.aX += force.x / this.mass;
        this.aY += force.y / this.mass;
    }

    applyForcePolar(polar: Polar2D) {
        console.log(polar);
        this.aX += (Math.cos(polar.angle) * polar.magnitude) / this.mass;
        this.aY += (Math.sin(polar.angle) * polar.magnitude) / this.mass;
    }

    collisionTick(nearbyEntities: CollidableEntity[], deltaTime: number) {
        const collisions: { entity: CollidableEntity, intersections: Point2D[] }[] = [];
        for (const entity of nearbyEntities) {
            if (entity === this) {
                continue;
            }
            const intersections = this.getIntersectionsWith(entity);
            if (window.debug) {
                intersections.forEach(i => window.camera.addTempEntity(new Circle({ radius: 3, strokeStyle: 'blue', x: i.x, y: i.y })));
            }
            if (intersections.length !== 0) {
                collisions.push({ entity, intersections });
            }
        }

        for (const { entity, intersections } of collisions) {
            const collisionPos = averagePoints(intersections);
            const collisionAngle = Math.atan2(this.y - collisionPos.y, this.x - collisionPos.x);
            // rotate situation so that force velocity will always be pointing to right, and momentum impulse for y-axis is always 0
            const normalizedSelfVelocity = rotateVector({ x: this.vX, y: this.vY }, -collisionAngle);
            const normalizedEntityVelocity = rotateVector({ x: entity.vX, y: entity.vY }, -collisionAngle);
            const finalNormalizedVelocity = restitutionCollisionVf1({
                    m1: this.mass,
                    vi1: normalizedSelfVelocity.x,
                    m2: entity.frozen ? null : entity.mass,
                    vi2: normalizedEntityVelocity.x,
                    cor: this.restitution * entity.restitution // 0.5 and 0.5 to 0.25, 0 and 1 to 0
                });
            const vf = rotateVector({ x: finalNormalizedVelocity, y: normalizedSelfVelocity.y }, collisionAngle);
            this.applyForce({
                x: ((this.mass * (vf.x - this.vX)) / deltaTime) / collisions.length,
                y: ((this.mass * (vf.y - this.vY)) / deltaTime) / collisions.length
            });

            // also move away from collision point to avoid the object stuck chaos problem
            const polar = pointsToPolar(collisionPos, this);
            polar.magnitude = this.boundingRadius - polar.magnitude + 0.0001;
            const offset = polarToPoint(polar);
            this.oX += offset.x;
            this.oY += offset.y;
        }
    }
    tick(nearbyEntities: CollidableEntity[], deltaTime: number) {
        this.collisionTick(nearbyEntities, deltaTime);
    }
    afterTick(deltaTime: number) {
        this.vX += this.aX * deltaTime;
        this.vY += this.aY * deltaTime;

        this.x += this.vX * deltaTime;
        this.x += this.oX;
        this.y += this.vY * deltaTime;
        this.y += this.oY;

        this.aX = 0;
        this.aY = 0;
        this.oX = 0;
        this.oY = 0;
    }

    abstract withinBounds(point: Point2D): boolean;
    abstract getIntersectionsWith(entity: CollidableEntity): Point2D[];
}
