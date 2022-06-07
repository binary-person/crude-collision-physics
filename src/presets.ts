import CollidableEntity from './engine/CollidableEntity';
import Circle from './engine/shapes/Circle';
import Line from './engine/shapes/Line';

function addBoxArena(entities: CollidableEntity[]) {
    const size = 500;
    entities.push(new Line({
        length: size, frozen: true,
        x: -(size / 2), y: -(size / 2), rotation: 0
    }));
    entities.push(new Line({
        length: size, frozen: true,
        x: (size / 2), y: -(size / 2), rotation: Math.PI / 2
    }));
    entities.push(new Line({
        length: size, frozen: true,
        x: -(size / 2), y: (size / 2), rotation: 0
    }));
    entities.push(new Line({
        length: size, frozen: true,
        x: -(size / 2), y: -(size / 2), rotation: Math.PI / 2
    }));
}

export function presetManyCircles(entities: CollidableEntity[]) {
    addBoxArena(entities);
    const boxSize = 500;
    const margin = 20;
    const size = 5;

    entities.push(new Circle({
        radius: 50,
        x: 120,
        y: -30,
        vX: 500,
        mass: 1000,
        excludeFromQuadTree: true
    }));
    entities.push(new Circle({
        radius: 50,
        x: 30,
        y: -120,
        mass: 1000,
        excludeFromQuadTree: true
    }));
    for (let i = -(boxSize / 2) + margin; i <= (boxSize / 2) - margin; i += size * 3) {
        entities.push(new Circle({
            radius: size,
            x: i,
            y: i,
            mass: 100
        }));
    }
}

export function presetTwoCircles(entities: CollidableEntity[]) {
    addBoxArena(entities);
    entities.push(new Circle({
        x: -20,
        y: 0,
        radius: 10,
        vX: -100
    }));
    entities.push(new Circle({
        x: 20,
        y: 0,
        radius: 10,
        vX: 10
    }));
}

export function presetTwoDifferentCircles(entities: CollidableEntity[]) {
    addBoxArena(entities);
    entities.push(new Circle({
        x: -40,
        y: 0,
        radius: 10
    }));
    entities.push(new Circle({
        x: 40,
        y: 0,
        radius: 10,
        vX: -100
    }));
}
export function presetTwoDifferentMassCircles(entities: CollidableEntity[]) {
    addBoxArena(entities);
    entities.push(new Circle({
        x: -40,
        y: 0,
        radius: 10,
        strokeStyle: 'gray'
    }));
    entities.push(new Circle({
        x: 40,
        y: 0,
        radius: 10,
        vX: -100,
        mass: 200
    }));
}

export function presetOneCircleTwoLines(entities: CollidableEntity[]) {
    entities.push(new Line({
        x: -1000,
        y: -100,
        length: 3000,
        rotation: Math.PI / 12,
        frozen: true
    }));
    entities.push(new Line({
        x: 100,
        y: -100,
        length: 500,
        rotation: Math.PI / 2.03,
        frozen: true
    }));
    entities.push(new Circle({
        x: 0,
        y: 0,
        radius: 30
    }));
}

export function presetCircleOnHill(entities: CollidableEntity[]) {
    entities.push(new Line({
        x: -200,
        y: 100,
        length: 3000,
        rotation: Math.PI / 12,
        frozen: true
    }));
    entities.push(new Circle({
        x: 0,
        y: 0,
        radius: 30
    }));
}

export function presetBouncingCircle(entities: CollidableEntity[]) {
    entities.push(new Line({
        x: -200,
        y: 100,
        length: 3000,
        frozen: true
    }));
    entities.push(new Circle({
        x: 0,
        y: 0,
        radius: 30
    }));
}

export function presetManyCirclesBenchmark(entities: CollidableEntity[]) {
    addBoxArena(entities);
    const halfBoxSize = 250;
    const size = 4;
    const margin = size + 10;
    for (let i = -halfBoxSize + margin; i <= halfBoxSize - margin; i += size * 8) {
        for (let j = -halfBoxSize + margin; j <= halfBoxSize - margin; j += size * 8) {
            entities.push(new Circle({
                x: i,
                y: j,
                radius: size
            }));
        }
    }
    entities[entities.length - 1].vX = 100;
}
