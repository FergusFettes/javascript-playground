import * as THREE from "three";
import { createYouCube } from 'src/youcube.js';
import { canvas, scene, mainCamera, makeCamera, cameras, controls } from "src/background.js";
import { materials, loadManager, imageMap, createMaterial } from "src/material.js";
import "src/lights.js";
import { render } from "src/render.js";

const loadingElem = document.querySelector('#loading');
var progressBarElem = null;
if (loadingElem !== null) {
  const progressBarElem = loadingElem.querySelector('.progressbar');
}

const multiply = 7;
const spread = 80 * multiply;

const logo = 'https://blog.schau-wien.at/wp-content/uploads/2020/04/logo.jpg'
const logos = []
for (let i = 0; i < 3; i ++) {
  logos.push(logo);
}


init();
requestAnimationFrame(render);
function init() {
  loadManager.onLoad = () => {
    if (loadingElem !== null) {
      loadingElem.style.display = 'none';
    }
    materials.forEach((material, ndx) => {
      const cube = randomCameraCube(material, spread);
      // const youcube = createYouCube(0, 0, 0, 100, 0.8, logos, 'image');
      // cube.add(youcube);
      cube.layers.set(0);
      scene.add(cube);
    });
  };

  if (progressBarElem !== null) {
    loadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
    const progress = itemsLoaded / itemsTotal;
    progressBarElem.style.transform = `scaleX(${progress})`;
    }
  };

  for (let i = 0; i < 80; ++i) {
    const material = createMaterial();
    const cube = randomCubeIn(material, spread)
    cube.layers.set(2);
    scene.add(cube);
  }

}

function randomCubeIn(material, spread) {
  const geometry = new THREE.BoxBufferGeometry(4 * multiply, 4 * multiply, 4 * multiply);
  const cube = new THREE.Mesh(geometry, material);
  const point = getPointInSphere(0.6);
  cube.position.set(
    point['x'] * spread,
    point['y'] * spread,
    point['z'] * spread
)
  cube.rotation.set(rand(Math.PI), rand(Math.PI), 0);
  return cube
}

function randomCubeOn(material, spread) {
  const geometry = new THREE.BoxBufferGeometry(14 * multiply, 14 * multiply, 14 * multiply);
  const cube = new THREE.Mesh(geometry, material);
  const point = getPointOnSphere();
  cube.position.set(
    point['x'] * spread,
    point['y'] * spread,
    point['z'] * spread
)
  cube.rotation.set(rand(Math.PI), rand(Math.PI), 0);
  return cube
}

function randomCameraCube(material, spread) {
  const cube = randomCubeOn(material, spread);
  const camera = makeCamera(120)
  camera.layers.enable(0);
  camera.layers.enable(1);
  camera.layers.enable(2);
  camera.layers.enable(5);

  const color = 0xFFFFFF;
  const intensity = 0.1;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(10, 10, 30);
  light.target.position.set(-50, 0, 0);
  light.layers.set(5)
  camera.add(light);
  scene.add(light.target);

  cube.add(camera)
  cameras.set(camera, `welcome to the cube of ${imageMap.get(material)}`)
  return cube
}

function getPointInSphere(r = 0.8) {
  let d, x, y, z;
  do {
      x = Math.random() * 2.0 - 1.0;
      y = Math.random() * 2.0 - 1.0;
      z = Math.random() * 2.0 - 1.0;
      d = x*x + y*y + z*z;
  } while(d > r);
  return {x: x, y: y, z: z};
}

function getPointOnSphere() {
  let d, x, y, z;
  do {
      x = Math.random() * 2.0 - 1.0;
      y = Math.random() * 2.0 - 1.0;
      z = Math.random() * 2.0 - 1.0;
      d = x*x + y*y + z*z;
  } while((d > 1.1) || (d < 0.9));
  return {x: x, y: y, z: z};
}

function rand(min, max) {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return min + (max - min) * Math.random();
}
