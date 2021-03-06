import * as THREE from 'three';
import { OrbitControls } from 'src/js/OrbitControls.js';
import { TubePainter } from 'src/js/TubePainter.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { createRandomColorMaterial } from "src/material.js";
import { randomCubeOn } from "src/functions.js";
import { ColorGUIHelper } from "src/classes.js";
import { GUI } from 'src/third_party/dat-gui.js';

let gui = new GUI();

let camera, scene, session, renderer;
let controller1, controller2;
let controllers = {'left': controller1, 'right': controller2};

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
  // scene.add(gui)

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
  scene.add( grid );

  scene.add( new THREE.HemisphereLight( 0x888877, 0x777788 ) );

  const light = new THREE.DirectionalLight( 0xffffff, 0.5 );
  light.position.set( 0, 4, 0 );
  scene.add( light );

  const painter1 = new TubePainter();
  scene.add( painter1.mesh );

  const painter2 = new TubePainter();
  scene.add( painter2.mesh );

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

  controllers['left'] = renderer.xr.getController( 1 );
  controllers['right'] = renderer.xr.getController( 0 );

  for ( var key in controllers ) {
    controllers[key].addEventListener( 'selectstart', onSelectStart );
    controllers[key].addEventListener( 'selectend', onSelectEnd );
    controllers[key].addEventListener( 'squeezestart', onSqueezeStart );
    controllers[key].addEventListener( 'squeezeend', onSqueezeEnd );
  }

  controllers['left'].userData.painter = painter1;
  controllers['right'].userData.painter = painter2;
  scene.add( controllers['left'] );
  scene.add( controllers['right'] );

  for ( var key in controllers ) {
    const geometry = new THREE.CylinderGeometry( 0.01, 0.02, 0.08, 5 );
    geometry.rotateX( - Math.PI / 2 );
    // const material = new THREE.MeshStandardMaterial( { flatShading: true } );
    const material = createRandomColorMaterial();
    const mesh = new THREE.Mesh( geometry, material );

    const pivot = new THREE.Mesh( new THREE.IcosahedronGeometry( 0.01, 3 ) );
    pivot.name = 'pivot';
    pivot.position.z = - 0.05;
    mesh.add( pivot );

    controllers[key].add( mesh.clone() );
    controllers[key].userData.painter.color = material.color
    gui.addColor(new ColorGUIHelper(controllers[key].userData.painter, 'color'), 'value').name(key);
  }

  for (key in controllers ) {
    for (let i = 0; i < 16; ++i) {
      const material = createRandomColorMaterial();
      const cube = randomCubeOn(material, BOX_SEPARATION, BOX_SIZE)
      controllers[key].add(cube);
    }
  }

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

  for ( var key in controllers ) {
    handleController( controllers[key] );
  }

  renderer.render( scene, camera );
}


function ProcessGamepad(gamepad, hand, pose) {
  update_state(gamepad, hand)
};

function update_state (gamepad, hand) {
  let buttonFuncs = {
    // 0: selectFunc,
    // 1: squeezeFunc,
    // 2: unknownFunc,
    3: joystickFunc,
    4: buttonAFunc,
    5: buttonBFunc,
  }
  for (let i = 0; i < gamepad.buttons.length; ++i) {
    if (gamepad.buttons[i].pressed){
      if (buttonFuncs[i]){
        buttonFuncs[i](hand)
      } else {
        console.log('No function defined for button ' + i + '!')
      }
    }
  }
  // for (let i = 0, j = 0; i < gamepad.axes.length; i+=2, ++j) {
  //   console.log(gamepad.axes[i], i + 1 < gamepad.axes.length ? gamepad.axes[i + 1] : 0);
  // }
}

function buttonAFunc(hand) {
  const material = createRandomColorMaterial()
  controllers[hand].userData.painter.color = material.color
  controllers[hand].children[0].material.color = material.color
}

function buttonBFunc(hand) {
  const material = createRandomColorMaterial()
  controllers[hand].userData.painter.color = material.color
  controllers[hand].children.forEach(function (item, index) {
    item.material.color = material.color
  })
}

function joystickFunc() {
  GUI.toggleHidden()
}
