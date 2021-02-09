import * as THREE from "three";
export { createMaterial, createRandomColorMaterial, loader, loadManager, materials, imageMap };

let imageMap, materials, loadManager, loader;

function createMaterial() {
  return createRandomColorMaterial();
}

function createRandomColorMaterial() {
  const material = new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide,
  });

  const hue = Math.random();
  const saturation = 1;
  const luminance = 0.5;
  material.color.setHSL(hue, saturation, luminance);

  return material;
}

loadManager = new THREE.LoadingManager();
loader = new THREE.TextureLoader(loadManager);
loader.crossOrigin = "";

const imageDict = {
  "https://storage.googleapis.com/schau-wien-images/media/sope2.jpg": "sophie",
  "https://storage.googleapis.com/schau-wien-images/media/kiki1.jpg": "kiki",
  "https://storage.googleapis.com/schau-wien-images/media/fergus.jpeg": "fergus",
  "https://storage.googleapis.com/schau-wien-images/media/reeks2.jpg": "enrique",
  "https://storage.googleapis.com/schau-wien-images/media/alexandru.jpg": "alexandru",
  "https://storage.googleapis.com/schau-wien-images/media/annar.jpg": "anna",
  "https://storage.googleapis.com/schau-wien-images/media/luise.jpg": "luise",
  "https://storage.googleapis.com/schau-wien-images/media/paula.jpg": "paula",
};

imageMap = new WeakMap();

materials = [];
for (const [key, value] of Object.entries(imageDict)) {
  const material = new THREE.MeshPhongMaterial({
    map: loader.load(key),
    side: THREE.DoubleSide,
  });
  materials.push(material);
  imageMap.set(material, value);
}
