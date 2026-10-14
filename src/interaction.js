/**
 * Lenovo Future Expo - Interaction Architecture
 * Supports VR Controller Raycasting, Desktop Mouse Raycasting, Hover Highlights, and 3D UI Buttons.
 */
import * as THREE from 'three';
import { soundManager } from './audio.js';

export class InteractionManager {
  constructor(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;

    this.interactables = [];
    this.hoveredObject = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.initDesktopMouseEvents();
  }

  registerInteractable(object, onSelectCallback, onHoverCallback = null, onUnhoverCallback = null) {
    object.userData.isInteractable = true;
    object.userData.onSelect = onSelectCallback;
    object.userData.onHover = onHoverCallback;
    object.userData.onUnhover = onUnhoverCallback;
    this.interactables.push(object);
  }

  unregisterInteractable(object) {
    const idx = this.interactables.indexOf(object);
    if (idx !== -1) {
      this.interactables.splice(idx, 1);
    }
  }

  initDesktopMouseEvents() {
    window.addEventListener('mousemove', (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('click', (event) => {
      if (document.pointerLockElement === document.body) {
        // In pointer lock: raycast from screen center
        this.raycastAndSelect(new THREE.Vector2(0, 0));
      } else {
        // Normal cursor click
        this.raycastAndSelect(this.mouse);
      }
    });
  }

  setHandUIManager(handUIManager) {
    this.handUIManager = handUIManager;
  }

  raycastAndSelect(screenCoords) {
    if (this.handUIManager && (this.handUIManager.isArcMenuVisible || this.handUIManager.expoMap3D?.isOpen || this.handUIManager.currentView !== 'main')) {
      return; // Hand UI handles its own 3D interactions
    }
    this.raycaster.setFromCamera(screenCoords, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactables, true);

    if (intersects.length > 0) {
      let target = intersects[0].object;
      while (target && !target.userData.onSelect && target.parent) {
        target = target.parent;
      }
      if (target && target.userData.onSelect) {
        soundManager.playClick();
        target.userData.onSelect(intersects[0]);
      }
    }
  }

  updateVRControllerRay(controller) {
    if (!controller) return null;

    const tempMatrix = new THREE.Matrix4();
    tempMatrix.identity().extractRotation(controller.matrixWorld);

    this.raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    this.raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    const intersects = this.raycaster.intersectObjects(this.interactables, true);
    if (intersects.length > 0) {
      let target = intersects[0].object;
      while (target && !target.userData.isInteractable && target.parent) {
        target = target.parent;
      }

      if (target !== this.hoveredObject) {
        this.setHovered(target);
      }
      return intersects[0];
    } else {
      if (this.hoveredObject) {
        this.setHovered(null);
      }
      return null;
    }
  }

  triggerVRSelect(controller) {
    const hit = this.updateVRControllerRay(controller);
    if (hit) {
      let target = hit.object;
      while (target && !target.userData.onSelect && target.parent) {
        target = target.parent;
      }
      if (target && target.userData.onSelect) {
        soundManager.playClick();
        target.userData.onSelect(hit);
      }
    }
  }

  setHovered(object) {
    if (this.hoveredObject && this.hoveredObject.userData.onUnhover) {
      this.hoveredObject.userData.onUnhover();
    }

    this.hoveredObject = object;

    if (this.hoveredObject && this.hoveredObject.userData.onHover) {
      this.hoveredObject.userData.onHover();
    }
  }

  createWorldButton(text, width = 1.0, height = 0.35, onClickCallback = null, color = '#00d2ff') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');

    const drawButton = (isHovered = false) => {
      ctx.clearRect(0, 0, 512, 180);
      ctx.fillStyle = isHovered ? 'rgba(0, 210, 255, 0.45)' : 'rgba(15, 24, 36, 0.90)';
      ctx.fillRect(8, 8, 496, 164);

      ctx.strokeStyle = isHovered ? '#ffffff' : color;
      ctx.lineWidth = 6;
      ctx.strokeRect(8, 8, 496, 164);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 42px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 256, 90);
    };

    drawButton(false);
    const texture = new THREE.CanvasTexture(canvas);
    const geo = new THREE.PlaneGeometry(width, height);
    const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, mat);

    this.registerInteractable(
      mesh,
      () => {
        if (onClickCallback) onClickCallback();
      },
      () => {
        drawButton(true);
        texture.needsUpdate = true;
      },
      () => {
        drawButton(false);
        texture.needsUpdate = true;
      }
    );

    return mesh;
  }
}
