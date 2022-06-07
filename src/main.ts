import createControl from './createControl';
import Camera from './engine/Camera';
import CollidableEntity from './engine/CollidableEntity';
import Entity from './engine/Entity';
import PhysicsWorld from './engine/PhysicsWorld';
import Circle from './engine/shapes/Circle';
import Line from './engine/shapes/Line';
import addMouseControl from './util/addMouseControl';
import { presetBouncingCircle, presetCircleOnHill, presetManyCircles, presetManyCirclesBenchmark, presetOneCircleTwoLines, presetTwoCircles, presetTwoDifferentCircles, presetTwoDifferentMassCircles } from './presets';
import './style.css'
import formatTime from './util/formatTime';

declare global {
  interface Window {
    debug: boolean;
    camera: Camera;
    world: PhysicsWorld;
    entities: Entity[];
    collidableEntities: CollidableEntity[];
  }
}

const canvas = document.querySelector('canvas')!;
const camera = new Camera(canvas.getContext('2d')!);
const world = new PhysicsWorld();

const entities: Entity[] = [];
const collidableEntities: CollidableEntity[] = [];

window.camera = camera;
window.world = world;
window.entities = entities;
window.collidableEntities = collidableEntities;
window.debug = false;

// paint center
entities.push(new Circle({
  radius: 2,
  x: 0,
  y: 0,
  strokeStyle: 'red'
}));

// world.gravity = 0;
// presetTwoCircles(collidableEntities);
// presetTwoDifferentCircles(collidableEntities);
// presetTwoDifferentMassCircles(collidableEntities);
presetManyCircles(collidableEntities);
// presetOneCircleTwoLines(collidableEntities);
// presetCircleOnHill(collidableEntities);
// presetBouncingCircle(collidableEntities);
// presetManyCirclesBenchmark(collidableEntities);

world.updateQuadtreeSettings(collidableEntities);

addMouseControl(canvas, camera);

let simSpeed = 1;
createControl({
  name: 'speed',
  startingValue: 1,
  min: 1,
  max: 500,
  step: 1,
  onChange(val) {
    simSpeed = val;
  }
});


const tickCount = document.querySelector('#tick-count')!;
const tickTime = document.querySelector('#tick-time')!;
const pauseResumeBtn = document.querySelector<HTMLButtonElement>('#tick-pause-resume-btn')!;

let paused = false;
pauseResumeBtn.onclick = () => {
  paused = !paused;
  pauseResumeBtn.textContent = paused ? 'Resume tick' : 'Pause tick';
};
pauseResumeBtn.textContent = paused ? 'Resume tick' : 'Pause tick';

document.querySelector<HTMLButtonElement>('#tick-next-btn')!.onclick = () => {
  for (let i = 0; i < simSpeed; i++) {
    world.update(collidableEntities);
  }
  tickCount.textContent = world.tick.toString();
  tickTime.textContent = formatTime(world.tick * world.secondsPerTick * 1000);
};

let lastTime = performance.now();
const loop = () => {
  window.requestAnimationFrame(loop);
  
  const now = performance.now();

  if (!paused) {
    let timeSinceLastPaint = (now - lastTime) / 1000;
    if (timeSinceLastPaint > 0.2) {
      lastTime = now;
      return;
    }
    while (timeSinceLastPaint > world.secondsPerTick) {
      timeSinceLastPaint -= world.secondsPerTick;
      for (let i = 0; i < simSpeed; i++) {
        world.update(collidableEntities);
      }
    }
    lastTime = now - (timeSinceLastPaint * 1000);
    tickCount.textContent = world.tick.toString();
    tickTime.textContent = formatTime(world.tick * world.secondsPerTick * 1000);
  } else {
    lastTime = now;
  }

  camera.render(entities.concat(collidableEntities));
};
loop();
