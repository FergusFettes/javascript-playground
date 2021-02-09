import * as THREE from "three";
import { DegRadHelper, ColorGUIHelper } from "src/classes.js";
import { canvas, renderer, mainCamera, scene, gui } from "src/background.js";

export { makeLights };

function makeLights(lights) {
  if (lights.includes("ambient")) {
    // Ambient
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.AmbientLight(color, intensity);
    light.layers.enable(1);
    scene.add(light);

    // gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
    // gui.add(light, 'intensity', 0, 2, 0.01);
  }

  if (lights.includes("directional")) {
    // Directional
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(10, 10, 0);
    light.target.position.set(-5, 0, 0);
    scene.add(light);
    scene.add(light.target);

    const helper = new THREE.DirectionalLightHelper(light);
    scene.add(helper);

    // gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('culoure');
    // gui.add(light, 'intensity', 0, 2, 0.01);

    // makeXYZGUI(gui, light.position, 'position', updateLight);
    // makeXYZGUI(gui, light.target.position, 'target', updateLight);
  }

  if (lights.includes("spotlight")) {
    // Spotlight
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.SpotLight(color, intensity);
    light.position.set(0, 10, 0);
    light.power = 800;
    light.decay = 2;
    light.distance = Infinity;
    scene.add(light);

    const helper = new THREE.SpotLightHelper(light);
    scene.add(helper);

    // gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('culoure');
    // gui.add(light, 'intensity', 0, 2, 0.01);
    // gui.add(light, 'power', 0, 2000);
    // gui.add(light, 'distance', 0, 40).onChange(updateLight);
    // gui.add(new DegRadHelper(light, 'angle'), 'value', 0, 90).name('angle').onChange(updateLight);
    // gui.add(light, 'penumbra', 0, 1, 0.01);
    // gui.add(light, 'decay', 0, 4, 0.01);

    // makeXYZGUI(gui, light.position, 'position', updateLight);
  }

  if (lights.includes("skycolor")) {
    const skyColor = 0xb1e1ff; // light blue
    const groundColor = 0xb97a20; // brownish orange
    const intensity = 1;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);

    // gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('skyColor');
    // gui.addColor(new ColorGUIHelper(light, 'groundColor'), 'value').name('groundColor');
    // gui.add(light, 'intensity', 0, 2, 0.01);
    //
    // makeXYZGUI(gui, light.position, 'position', updateLight);
  }
}

function updateLight(light) {
  light.target.updateMatrixWorld();
  helper.update();
}

function makeXYZGUI(gui, vector3, name, onChangeFn) {
  const folder = gui.addFolder(name);
  folder.add(vector3, "x", -30, 30).onChange(onChangeFn);
  folder.add(vector3, "y", -30, 30).onChange(onChangeFn);
  folder.add(vector3, "z", -30, 30).onChange(onChangeFn);
  folder.open();
}
