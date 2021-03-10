import * as THREE from "three";
import { OrbitControls } from "src/js/OrbitControls.js";
import { Terminal } from "xterm";

const container = document.createElement("div");
document.body.appendChild(container);

const term = new Terminal();
const terminal = document.createElement("terminal");
term.open(terminal);

const shellprompt = "$ ";
term.prompt = function() {
  term.write("\r\n" + shellprompt);
};

term.write("Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ");
term.writeln("");
term.prompt();
term.setOption("cursorBlink", true);

term.onKey(ev => {
  console.log(ev);
  term.write(ev.key);
  if (ev.key === "\r") {
    term.prompt();
  }
});

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 50);
camera.position.set(0, 1.6, -5);

const controls = new OrbitControls(camera, container);
controls.target.set(0, 1.6, 0);
controls.update();

{
  const tableGeometry = new THREE.BoxGeometry(0.5, 0.8, 0.5);
  const tableMaterial = new THREE.MeshStandardMaterial({
    color: 0x444444,
    roughness: 1.0,
    metalness: 0.0
  });
  const table = new THREE.Mesh(tableGeometry, tableMaterial);
  // This is z for some reason
  table.position.y = 0.5;
  table.position.z = 0.85;
  scene.add(table);
}

{
  const floorGometry = new THREE.PlaneGeometry(4, 4);
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x222222,
    roughness: 1.0,
    metalness: 0.0
  });
  const floor = new THREE.Mesh(floorGometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const grid = new THREE.GridHelper(10, 20, 0x111111, 0x111111);
  scene.add(grid);
}

{
  const termTexture = new THREE.Texture(term);
  termTexture.needsUpdate = true;
  termTexture.minFilter = THREE.LinearFilter;

  const termAreaMat = new THREE.MeshBasicMaterial({ map: termTexture, side: THREE.DoubleSide });
  termAreaMat.transparent = true;

  const terminalRepresentation = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(2, 2),
    new THREE.MeshBasicMaterial(termAreaMat)
  );
  terminalRepresentation.position.y = 1;
  terminalRepresentation.position.z = 1.9;
  terminalRepresentation.castShadow = true;
  scene.add(terminalRepresentation);
}

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// document.body.appendChild(VRButton.createButton(renderer));

{
  scene.add(new THREE.HemisphereLight(0x888877, 0x777788));

  const light = new THREE.DirectionalLight(0xffffff, 0.5);
  light.position.set(0, 4, 0);
  scene.add(light);
}

function render() {
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(render);
