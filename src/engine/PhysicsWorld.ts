import CollidableEntity from './CollidableEntity';
import { QuadTree, Box, Point, Circle } from 'js-quadtree';

export default class PhysicsWorld {
    gravity: number;
    secondsPerTick: number;
    tick = 0;

    quadtree = new QuadTree(new Box(0, 0, 1000, 1000));

    constructor({ gravity = 981, secondsPerTick = 0.001 } = {}) {
        this.gravity = gravity;
        this.secondsPerTick = secondsPerTick;
    }

    updateQuadtreeSettings(entities: CollidableEntity[]) {
        const margin = 10;
        const topLeft = { x: -1, y: -1 };
        const bottomRight = { x: 1, y: 1 };

        for (const entity of entities) {
            if (entity.x - entity.boundingRadius < topLeft.x) {
                topLeft.x = entity.x - entity.boundingRadius;
            } else if (entity.x + entity.boundingRadius > bottomRight.x) {
                bottomRight.x = entity.x + entity.boundingRadius;
            }
            if (entity.y - entity.boundingRadius < topLeft.y) {
                topLeft.y = entity.y - entity.boundingRadius;
            } else if (entity.y + entity.boundingRadius > bottomRight.y) {
                bottomRight.y = entity.y + entity.boundingRadius;
            }
        }

        this.quadtree = new QuadTree(new Box(topLeft.x - margin, topLeft.y - margin, bottomRight.x - topLeft.x + margin, bottomRight.y - topLeft.y + margin), {
            capacity: 20
        });
    }

    update(entities: CollidableEntity[]) {
        this.tick++;
        if (window.debug) {
            window.camera.clearTempEntities();
        }

        // build quadtree
        this.quadtree.clear();
        let maxBoundingRadius = 0;
        const unsupportedQTEntities: CollidableEntity[] = [];
        for (const entity of entities) {
            if (entity.excludeFromQuadTree) {
                unsupportedQTEntities.push(entity);
            } else {
                this.quadtree.insert(new Point(entity.x, entity.y, entity));
                if (entity.boundingRadius > maxBoundingRadius) {
                    maxBoundingRadius = entity.boundingRadius;
                }
            }
        }

        for (const entity of entities) {
            if (!entity.frozen) {
                entity.applyForce({ x: 0, y: entity.mass * this.gravity });
                if (entity.excludeFromQuadTree) {
                    entity.tick(entities, this.secondsPerTick);
                } else {
                    entity.tick(this.quadtree.query(new Circle(entity.x, entity.y, maxBoundingRadius * 2.1)).map(pt => pt.data).concat(unsupportedQTEntities), this.secondsPerTick);
                }
            }
        }
        // only apply acceleration and velocity after all the ticks
        for (const entity of entities) {
            if (!entity.frozen) {
                entity.afterTick(this.secondsPerTick);
            }
        }
    }
}
