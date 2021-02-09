import * as THREE from "three";
export { randomCubeIn, randomCubeOn, getPointInSphere, getPointOnSphere };

function randomCubeIn(material, spread, size) {
  const geometry = new THREE.BoxBufferGeometry(size, size, size);
  const cube = new THREE.Mesh(geometry, material);
  const point = getPointInSphere(0.6);
  cube.position.set(point["x"] * spread, point["y"] * spread, point["z"] * spread);
  cube.rotation.set(rand(Math.PI), rand(Math.PI), 0);
  return cube;
}

function randomCubeOn(material, spread, size) {
  const geometry = new THREE.BoxBufferGeometry(size, size, size);
  const cube = new THREE.Mesh(geometry, material);
  const point = getPointOnSphere();
  cube.position.set(point["x"] * spread, point["y"] * spread, point["z"] * spread);
  cube.rotation.set(rand(Math.PI), rand(Math.PI), 0);
  return cube;
}

function getPointInSphere(r = 0.8) {
  let d, x, y, z;
  do {
    x = Math.random() * 2.0 - 1.0;
    y = Math.random() * 2.0 - 1.0;
    z = Math.random() * 2.0 - 1.0;
    d = x * x + y * y + z * z;
  } while (d > r);
  return { x: x, y: y, z: z };
}

function getPointOnSphere() {
  let d, x, y, z;
  do {
    x = Math.random() * 2.0 - 1.0;
    y = Math.random() * 2.0 - 1.0;
    z = Math.random() * 2.0 - 1.0;
    d = x * x + y * y + z * z;
  } while (d > 1.1 || d < 0.9);
  return { x: x, y: y, z: z };
}

function rand(min, max) {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return min + (max - min) * Math.random();
}
