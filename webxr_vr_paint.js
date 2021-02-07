import * as THREE from 'three';
import { OrbitControls } from 'src/js/OrbitControls.js';
import { TubePainter } from 'src/js/TubePainter.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { createRandomColorMaterial } from "src/material.js";
import { randomCubeOn } from "src/functions.js";

let camera, scene, session, renderer;
let controller1, controller2;

const cursor = new THREE.Vector3();
const infoElemBottom = document.querySelector('#info-bottom');

let controls;
let boxTable = {};

const BOX_SIZE = 0.02;
const BOX_MOTION_RANGE = 0.010;
const BOX_SEPARATION = 0.08;
const BOX_SET_HEIGHT = 0.03;
const BOX_SET_DEPTH = -0.06;

init();
animate();

function init() {
  const container = document.createElement( 'div' );
  document.body.appendChild( container );

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x222222 );

  camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.01, 50 );
  camera.position.set( 0, 1.6, 3 );

  controls = new OrbitControls( camera, container );
  controls.target.set( 0, 1.6, 0 );
  controls.update();

  const tableGeometry = new THREE.BoxGeometry( 0.5, 0.8, 0.5 );
  const tableMaterial = new THREE.MeshStandardMaterial( {
    color: 0x444444,
    roughness: 1.0,
    metalness: 0.0
  } );
  const table = new THREE.Mesh( tableGeometry, tableMaterial );
  table.position.y = 0.35;
  table.position.z = 0.85;
  scene.add( table );

  const floorGometry = new THREE.PlaneGeometry( 4, 4 );
  const floorMaterial = new THREE.MeshStandardMaterial( {
    color: 0x222222,
    roughness: 1.0,
    metalness: 0.0
  } );
  const floor = new THREE.Mesh( floorGometry, floorMaterial );
  floor.rotation.x = - Math.PI / 2;
  scene.add( floor );

  const grid = new THREE.GridHelper( 10, 20, 0x111111, 0x111111 );
  // grid.material.depthTest = false; // avoid z-fighting
  scene.add( grid );

  scene.add( new THREE.HemisphereLight( 0x888877, 0x777788 ) );

  const light = new THREE.DirectionalLight( 0xffffff, 0.5 );
  light.position.set( 0, 4, 0 );
  scene.add( light );

  //

  const painter1 = new TubePainter();
  scene.add( painter1.mesh );

  const painter2 = new TubePainter();
  scene.add( painter2.mesh );

  //

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.xr.enabled = true;
  container.appendChild( renderer.domElement );

  document.body.appendChild( VRButton.createButton( renderer ) );

  // controllers

  function onSelectStart() {

    this.userData.isSelecting = true;

  }

  function onSelectEnd() {

    this.userData.isSelecting = false;

  }

  function onSqueezeStart() {

    this.userData.isSqueezing = true;
    this.userData.positionAtSqueezeStart = this.position.y;
    this.userData.scaleAtSqueezeStart = this.scale.x;

  }

  function onSqueezeEnd() {

    this.userData.isSqueezing = false;

  }

  controller1 = renderer.xr.getController( 0 );
  controller1.addEventListener( 'selectstart', onSelectStart );
  controller1.addEventListener( 'selectend', onSelectEnd );
  controller1.addEventListener( 'squeezestart', onSqueezeStart );
  controller1.addEventListener( 'squeezeend', onSqueezeEnd );
  controller1.userData.painter = painter1;
  scene.add( controller1 );

  controller2 = renderer.xr.getController( 1 );
  controller2.addEventListener( 'selectstart', onSelectStart );
  controller2.addEventListener( 'selectend', onSelectEnd );
  controller2.addEventListener( 'squeezestart', onSqueezeStart );
  controller2.addEventListener( 'squeezeend', onSqueezeEnd );
  controller2.userData.painter = painter2;
  scene.add( controller2 );

  {
    const geometry = new THREE.CylinderGeometry( 0.01, 0.02, 0.08, 5 );
    geometry.rotateX( - Math.PI / 2 );
    // const material = new THREE.MeshStandardMaterial( { flatShading: true } );
    const material = createRandomColorMaterial();
    const mesh = new THREE.Mesh( geometry, material );

    const pivot = new THREE.Mesh( new THREE.IcosahedronGeometry( 0.01, 3 ) );
    pivot.name = 'pivot';
    pivot.position.z = - 0.05;
    mesh.add( pivot );

    controller1.add( mesh.clone() );
    controller1.userData.painter.color = material.color
  }

  {
    const geometry = new THREE.CylinderGeometry( 0.01, 0.02, 0.08, 5 );
    geometry.rotateX( - Math.PI / 2 );
    // const material = new THREE.MeshStandardMaterial( { flatShading: true } );
    const material = createRandomColorMaterial();
    const mesh = new THREE.Mesh( geometry, material );

    const pivot = new THREE.Mesh( new THREE.IcosahedronGeometry( 0.01, 3 ) );
    pivot.name = 'pivot';
    pivot.position.z = - 0.05;
    mesh.add( pivot );

    controller2.add( mesh.clone() );
    controller2.userData.painter.color = material.color
  }

  for (let i = 0; i < 16; ++i) {
    const material = createRandomColorMaterial();
    const cube = randomCubeOn(material, BOX_SEPARATION, BOX_SIZE)
    controller1.add(cube);
  }

  for (let i = 0; i < 16; ++i) {
    const material = createRandomColorMaterial();
    const cube = randomCubeOn(material, BOX_SEPARATION, BOX_SIZE)
    controller2.add(cube);
  }

  //

  window.addEventListener( 'resize', onWindowResize );
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}

//

function handleController( controller ) {
  const userData = controller.userData;
  const painter = userData.painter;

  const pivot = controller.getObjectByName( 'pivot' );

  if ( userData.isSqueezing === true ) {

    const delta = ( controller.position.y - userData.positionAtSqueezeStart ) * 5;
    const scale = Math.max( 0.1, userData.scaleAtSqueezeStart + delta );

    pivot.scale.setScalar( scale );
    painter.setSize( scale );

  }

  cursor.setFromMatrixPosition( pivot.matrixWorld );

  if ( userData.isSelecting === true ) {

    painter.lineTo( cursor, painter.color );
    painter.update();

  } else {

    painter.moveTo( cursor );

  }
}

function animate() {
  renderer.setAnimationLoop( render );
}

function render() {
  session = renderer.xr.getSession();

  if (session) {
    for (let source of session.inputSources) {
      if (source.gamepad) {
        ProcessGamepad(source.gamepad, source.handedness);
      }
    }
  }

  handleController( controller1 );
  handleController( controller2 );

  renderer.render( scene, camera );
}


function ProcessGamepad(gamepad, hand, pose) {
  // if (!(hand in boxTable)) {
  //   boxTable[hand] = new GamepadBoxSet(gamepad.buttons.length, gamepad.axes.length);
  //   scene.add(boxTable[hand]);
  // }

  // boxTable[hand].update_state(gamepad);
  update_state(gamepad)

  // // Update the pose of the boxes to sync with the controller.
  // if (pose) {
  //   boxTable[hand].position = pose.transform.matrix;
  // }

};

function update_state (gamepad) {
  let buttonFuncs = {
    // 0: selectFunc,
    // 1: squeezeFunc,
    // 2: unknownFunc,
    // 3: joystickFunc,
    4: buttonAFunc,
    5: buttonBFunc,
  }
  for (let i = 0; i < gamepad.buttons.length; ++i) {
    if (gamepad.buttons[i].pressed){
      if (buttonFuncs[i]){
        buttonFuncs[i]
      } else {
        console.log('No function defined for button ' + i + '!')
      }
    }
  }
  // for (let i = 0, j = 0; i < gamepad.axes.length; i+=2, ++j) {
  //   console.log(gamepad.axes[i], i + 1 < gamepad.axes.length ? gamepad.axes[i + 1] : 0);
  // }
}

function buttonAFunc() {
  camera.layers.toggle(0)
}

function buttonBFunc() {
  camera.layers.toggle(1)
}

function update_state_old(gamepad) {
  // The boxes associated with any given button will turn green if
  // touched and red if pressed. The box height will also scale based
  // on the button's value to make it appear like a button being pushed.
  for (let i = 0; i < gamepad.buttons.length; ++i) {
    this.buttonBoxes[i].pressed = gamepad.buttons[i].pressed;
    this.buttonBoxes[i].value = gamepad.buttons[i].value;
    this.buttonBoxes[i].touched = gamepad.buttons[i].touched;
  }

  // Axes are assumed to come in X/Y pairs and will wiggle the
  // associated boxes around when moved.
  for (let i = 0, j = 0; i < gamepad.axes.length; i+=2, ++j) {
    this.axesBoxes[j].move(gamepad.axes[i], i + 1 < gamepad.axes.length ? gamepad.axes[i + 1] : 0);
  }
}

class GamepadBoxSet extends Node {
  constructor(buttonCount, axesCount) {
    super();

    let axesBoxCount = Math.ceil(axesCount / 2);
    let rowLength = Math.max(buttonCount, axesBoxCount);

    // Place the boxes in a horizontal line
    this.buttonBoxes = [];
    let hl = (rowLength - 1) * BOX_SEPARATION * 0.5;
    for (let x = 0; x < buttonCount; ++x) {
      let box = new GamepadBox([(x * BOX_SEPARATION) - hl, BOX_SET_HEIGHT, BOX_SET_DEPTH]);
      this.buttonBoxes.push(box);
      this.addNode(box);
    }

    this.axesBoxes = [];
    for (let x = 0; x < axesBoxCount; ++x) {
      let box = new GamepadBox([(x * BOX_SEPARATION) - hl, BOX_SET_HEIGHT, BOX_SET_DEPTH * 2]);
      this.axesBoxes.push(box);
      this.addNode(box);
    }
  }
}

class GamepadBox extends Node {
  constructor(position) {
    super();

    this.position = position;

    // create cubes
    const geometry = new THREE.BoxBufferGeometry(BOX_SIZE, BOX_SIZE, BOX_SIZE);
    const material = createMaterial();
    const cube = new THREE.Mesh(geometry, material);

    this._value = 0.0;
    this._pressed = false;
    this._touched = false;
    this._dx = 0.0;
    this._dy = 0.0;
  }

  _updateTransform() {
    mat4.identity(this.matrix);
    mat4.translate(this.matrix, this.matrix, this.position);
    mat4.translate(this.matrix, this.matrix, [
      this._dx * BOX_MOTION_RANGE,
      -this._value * BOX_SIZE * 0.5,
      this._dy * BOX_MOTION_RANGE
    ]);
    mat4.scale(this.matrix, this.matrix, [1.0, 1.05 - this._value, 1.0]);
  }

  _updateColor() {
    let color = null;
    if (this._pressed) {
      color = [1, 0, 0, 1]; // Red
    } else if (this._touched) {
      color = [0.1, 0.5, 0.1, 1]; // Dark Green
    } else {
      color = [0.1, 0.1, 0.1, 1];  // Grey
    }

    this.renderPrimitive.uniforms.baseColorFactor.value = color;
  }

  set value(value) {
    if (value != this._value) {
      this._value = value;
      this._updateTransform();
    }
  }

  get value() {
    return this._value;
  }

  set pressed(value) {
    if (value != this._pressed) {
      this._pressed = value;
      this._updateColor();
    }
  }

  get pressed() {
    return this._pressed;
  }

  set touched(value) {
    if (value != this._touched) {
      this._touched = value;
      this._updateColor();
    }
  }

  get touched() {
    return this._touched;
  }

  move(dx, dy) {
    this._dx = dx;
    this._dy = dy;
    this._updateTransform();
  }
}
