import { renderer, canvas, cameras, mainCamera, cameraPole, scene } from "src/background.js";
import { imageMap } from "src/material.js";
import { PickHelper } from "src/classes.js";

export {
  render,
};

const infoElem = document.querySelector('#info');
const infoElemBottom = document.querySelector('#info-bottom');

let pickPosition = {x: 0, y: 0};
const pickHelper = new PickHelper();
clearPickPosition();
touchListeners();
elementListeners();
keyListeners();

let currentCube = '';
let camera = mainCamera
if (infoElemBottom) {
  infoElemBottom.textContent = cameras.get(mainCamera);
}

function render(time) {
  time *= 0.001;

  conditionalPickerResizer(time, camera);

  cameraPole.rotation.y = time * .1;

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

function conditionalPickerResizer(time, camera) {
  if (pickHelper) {
    pickHelper.pick(pickPosition, scene, camera, time);
    showLink();
  }
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
}

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

function touchListeners() {
  window.addEventListener('mousemove', setPickPosition);
  window.addEventListener('mouseout', clearPickPosition);
  window.addEventListener('mouseleave', clearPickPosition);
  window.addEventListener('mouseup', (event) => {
    event.preventDefault();
    clearPickPosition();
    changeCamera();
  }, {passive: false});
  window.addEventListener('touchstart', (event) => {
    // prevent the window from scrolling
    event.preventDefault();
    setPickPosition(event.touches[0]);
  }, {passive: false});
  window.addEventListener('touchmove', (event) => {
    setPickPosition(event.touches[0]);
  });
  window.addEventListener('touchend', (event) => {
    clearPickPosition();
    changeCamera();
  }, {passive: false});
}

function elementListeners() {

  if (document.querySelector('.home-icon') !== null) {
    const el1 = document.querySelector(".home-icon")
    el1.addEventListener("click", (event) => {
      resetCamera();
    }, {passive: false});
    el1.addEventListener('touchend', (event) => {
      resetCamera();
    }, {passive: false});
  }

  if (document.querySelector(".other-icon") !== null) {
    const el2 = document.querySelector(".other-icon")
    el2.addEventListener("click", (event) => {
      mainCamera.layers.toggle(0);
    }, {passive: false});
    el2.addEventListener('touchend', (event) => {
      mainCamera.layers.toggle(0);
    }, {passive: false});
  }

  if (document.querySelector(".third-icon") !== null) {
    const el3 = document.querySelector(".third-icon")
    el3.addEventListener("click", (event) => {
      mainCamera.layers.toggle(1);
    }, {passive: false});
    el3.addEventListener('touchend', (event) => {
      mainCamera.layers.toggle(1);
    }, {passive: false});
  }

}

function keyListeners() {
  document.addEventListener('keyup', (e) => {
    if (e.code === "Space")    camera.layers.toggle(2)
    else if (e.key === "e")   camera.layers.toggle(1)
    else if (e.key === "m")   camera.layers.toggle(0)
    else if (e.key === "h")   resetCamera();
  });
}

function resetCamera() {
  camera = mainCamera;
  if (infoElemBottom) {
    infoElemBottom.textContent = cameras.get(mainCamera);
  }
  pickHelper.index = 0;
  currentCube.material.opacity = 1;
  currentCube.material.transparent = false;
  currentCube = '';
}

function clearPickPosition() {
  pickPosition.x = -100000;
  pickPosition.y = -100000;
}

function setPickPosition(event) {
  const pos = getCanvasRelativePosition(event);
  pickPosition.x = (pos.x / canvas.width ) *  2 - 1;
  pickPosition.y = (pos.y / canvas.height) * -2 + 1;  // note we flip Y
}

function getCanvasRelativePosition(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * canvas.width  / rect.width,
    y: (event.clientY - rect.top ) * canvas.height / rect.height,
  };
}

function showLink() {
  if (pickHelper.pickedObject) {
    if (infoElem) {
      infoElem.textContent = imageMap.get(pickHelper.pickedObject.material);
    }
  } else {
    if (infoElem) {
      infoElem.textContent = ''
    }
  }
}

function goToLink() {
  if (pickHelper.pickedObject) {
      const link = imageMap.get(pickHelper.pickedObject.material);
      window.open(link);
  }
  if (infoElem) {
    infoElem.textContent = ''
  }
}

function changeCamera() {
  if (pickHelper.pickedObject) {
    if (currentCube !== '') {
      currentCube.material.opacity = 1;
      currentCube.material.transparent = false;
    }
    currentCube = pickHelper.pickedObject;
    if (currentCube.children.length > 0) {
      camera = currentCube.children[0]
      if (infoElemBottom) {
        infoElemBottom.textContent = cameras.get(camera);
      }
      pickHelper.index = 1;
      currentCube.material.opacity = 0.65;
      currentCube.material.transparent = true;
    }
  }
}
