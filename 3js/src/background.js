import * as THREE from "three";
// import {GUI} from 'src/third_party/dat-gui.js';
import { OrbitControls } from 'src/js/OrbitControls.js';
import { MinMaxGUIHelper } from "src/classes.js";

export { canvas, container, renderer, cssRenderer, mainCamera, cameras, cameraPole, scene, gui, makeCamera, makeCameraControls };
let canvas, container, renderer, cssRenderer, mainCamera, cameras, cameraPole, scene, gui;

// gui = new GUI();

makeBackground();
function makeBackground() {

  canvas = document.querySelector('#c');
  renderer = new THREE.WebGLRenderer({canvas, alpha: true});
  // renderer.physicallyCorrectLights = true;


  mainCamera = makeCamera(80);
  mainCamera.position.set(0, 0, 150).multiplyScalar(5);
  mainCamera.lookAt(0, 0, 0);
  mainCamera.layers.enable(0);
  mainCamera.layers.enable(1);
  mainCamera.layers.enable(2);
  mainCamera.layers.enable(5);
  cameras = new WeakMap();
  cameras.set(mainCamera, 'main camera')

  // let control = new OrbitControls(mainCamera, renderer.domElement);
  // control.target.set(0, 0, 0);
  // control.update();

  scene = new THREE.Scene();

  cameraPole = new THREE.Object3D();
  scene.add(cameraPole);
  cameraPole.add(mainCamera);

  // const gui = new GUI();
  // gui.add(mainCamera, 'fov', 1, 180).onChange(updateCamera);
  // const minMaxGUIHelper = new MinMaxGUIHelper(mainCamera, 'near', 'far', 0.1);
  // gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
  // gui.add(minMaxGUIHelper, 'max', 0.1, 1000, 0.1).name('far').onChange(updateCamera);

}

function makeCamera(fov = 40) {
  const aspect = window.innerWidth / window.innerHeight;  // the canvas default
  const zNear = 0.1;
  const zFar = 3000;
  return new THREE.PerspectiveCamera(fov, aspect, zNear, zFar);
}
