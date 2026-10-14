/**
 * Lenovo Future Expo - Reusable Hand Grab + Release Interaction Architecture
 * [BUILD: GRAB-001]
 *
 * Provides:
 *  - InteractableObject: Hover detection, outline highlight, 6-DOF free grab, hinge rotation (laptop lid), physics damping
 *  - InteractionSocket: Target drop zones with proximity highlights, magnetic snap-in, and accepted callbacks
 *  - GrabInteractionManager: Reusable manager consuming unified HandInputProvider (WebXR XRHand + PC Test Mode)
 *  - Dual-Platform: Meta Quest 3S (Index proximity + Thumb/Index Pinch) & PC Desktop (Mouse Raycast + Left Click / P key)
 */
import * as THREE from 'three';
import { soundManager } from './audio.js';

export class InteractableObject {
  constructor(meshOrGroup, options = {}) {
    this.root = meshOrGroup;
    this.root.userData.interactableObject = this;

    // Configuration
    this.id = options.id || `interactable_${Math.random().toString(36).substr(2, 9)}`;
    this.name = options.name || 'Interactable Object';
    this.tag = options.tag || 'general';
    this.type = options.type || 'free_grab'; // 'free_grab' | 'hinge' | 'constrained'
    this.grabRadius = options.grabRadius || 0.25; // meters

    // Hinge options (e.g. laptop lid)
    this.hingeAxis = options.hingeAxis || new THREE.Vector3(1, 0, 0); // Local X
    this.minAngle = options.minAngle !== undefined ? options.minAngle : 0;
    this.maxAngle = options.maxAngle !== undefined ? options.maxAngle : Math.PI * 0.70; // ~125 deg
    this.currentAngle = options.initialAngle || 0;

    // Event hooks
    this.onHoverEnter = options.onHoverEnter || null;
    this.onHoverExit = options.onHoverExit || null;
    this.onGrabStart = options.onGrabStart || null;
    this.onGrabMove = options.onGrabMove || null;
    this.onGrabEnd = options.onGrabEnd || null;
    this.onSocketEnter = options.onSocketEnter || null;
    this.onSocketExit = options.onSocketExit || null;
    this.onSocketAccepted = options.onSocketAccepted || null;

    // State
    this.state = 'IDLE'; // 'IDLE' | 'HOVERED' | 'GRABBED' | 'SOCKETED'
    this.isGrabbed = false;
    this.isHovered = false;
    this.activeSocket = null;

    // Home transform (for return on release)
    this.homePosition = this.root.position.clone();
    this.homeQuaternion = this.root.quaternion.clone();
    this.homeScale = this.root.scale.clone();
    this.returnToHomeOnRelease = options.returnToHomeOnRelease !== undefined ? options.returnToHomeOnRelease : false;

    // Grab offset
    this.grabOffsetPos = new THREE.Vector3();
    this.grabOffsetQuat = new THREE.Quaternion();
    this.handInitialPos = new THREE.Vector3();
    this.handInitialQuat = new THREE.Quaternion();

    // Visual highlight helpers
    this.highlightMaterials = new Map();
    this.originalMaterials = new Map();
    this.initVisualHighlights();
  }

  initVisualHighlights() {
    this.root.traverse((child) => {
      if (child.isMesh && child.material) {
        this.originalMaterials.set(child, child.material);
        let highlightMat;
        if (child.material.clone) {
          highlightMat = child.material.clone();
          if (highlightMat.emissive) {
            highlightMat.emissive = new THREE.Color(0x00d2ff);
            highlightMat.emissiveIntensity = 0.35;
          }
        } else {
          highlightMat = new THREE.MeshBasicMaterial({ color: 0x00d2ff, wireframe: true });
        }
        this.highlightMaterials.set(child, highlightMat);
      }
    });
  }

  setHighlighted(highlighted, isGrabbed = false) {
    this.root.traverse((child) => {
      if (child.isMesh && this.originalMaterials.has(child)) {
        if (highlighted) {
          const mat = this.highlightMaterials.get(child);
          if (mat) {
            if (mat.emissive) {
              mat.emissive.setHex(isGrabbed ? 0x00ff96 : 0x00d2ff);
              mat.emissiveIntensity = isGrabbed ? 0.6 : 0.3;
            }
            child.material = mat;
          }
        } else {
          child.material = this.originalMaterials.get(child);
        }
      }
    });
  }

  onHover(handPos) {
    if (this.isGrabbed || this.state === 'SOCKETED') return;
    if (!this.isHovered) {
      this.isHovered = true;
      this.state = 'HOVERED';
      this.setHighlighted(true, false);
      if (this.onHoverEnter) this.onHoverEnter(this);
    }
  }

  onUnhover() {
    if (this.isGrabbed || this.state === 'SOCKETED') return;
    if (this.isHovered) {
      this.isHovered = false;
      this.state = 'IDLE';
      this.setHighlighted(false, false);
      if (this.onHoverExit) this.onHoverExit(this);
    }
  }

  startGrab(handPos, handQuat) {
    if (this.isGrabbed) return;
    this.isGrabbed = true;
    this.state = 'GRABBED';
    this.setHighlighted(true, true);
    soundManager.playClick();

    this.handInitialPos.copy(handPos);
    if (handQuat) this.handInitialQuat.copy(handQuat);

    // Compute relative offset
    const worldPos = new THREE.Vector3();
    this.root.getWorldPosition(worldPos);
    this.grabOffsetPos.subVectors(worldPos, handPos);

    if (this.onGrabStart) this.onGrabStart(this, handPos);
  }

  updateGrab(handPos, handQuat, delta = 0.016) {
    if (!this.isGrabbed) return;

    if (this.type === 'hinge') {
      // Hinge rotation (e.g. Laptop Lid)
      const deltaY = (handPos.y - this.handInitialPos.y) * 4.0;
      const deltaZ = (this.handInitialPos.z - handPos.z) * 4.0;
      const targetAngle = THREE.MathUtils.clamp(
        this.currentAngle + deltaY + deltaZ,
        this.minAngle,
        this.maxAngle
      );

      this.root.rotation.x = -targetAngle;
      if (this.onGrabMove) this.onGrabMove(this, targetAngle);
    } else {
      // Free Grab (6-DOF object movement)
      const targetWorldPos = handPos.clone().add(this.grabOffsetPos);

      // Keep above floor (Y >= 0.1)
      targetWorldPos.y = Math.max(0.1, targetWorldPos.y);

      // Smoothly update position
      if (this.root.parent) {
        const localTarget = this.root.parent.worldToLocal(targetWorldPos.clone());
        this.root.position.lerp(localTarget, Math.min(1.0, delta * 25.0));
      } else {
        this.root.position.lerp(targetWorldPos, Math.min(1.0, delta * 25.0));
      }

      if (this.onGrabMove) this.onGrabMove(this, targetWorldPos);
    }
  }

  endGrab() {
    if (!this.isGrabbed) return;
    this.isGrabbed = false;
    this.setHighlighted(false, false);
    soundManager.playClick();

    if (this.type === 'hinge') {
      this.currentAngle = -this.root.rotation.x;
      this.state = 'IDLE';
      if (this.onGrabEnd) this.onGrabEnd(this, null);
      return;
    }

    // Check if released inside an active socket
    if (this.activeSocket && this.activeSocket.canAccept(this)) {
      this.activeSocket.accept(this);
      this.state = 'SOCKETED';
      if (this.onGrabEnd) this.onGrabEnd(this, this.activeSocket);
      return;
    }

    this.state = 'IDLE';

    // If returnToHomeOnRelease is true, glide back to home
    if (this.returnToHomeOnRelease) {
      this.returnHome();
    }

    if (this.onGrabEnd) this.onGrabEnd(this, null);
  }

  returnHome() {
    this.root.position.copy(this.homePosition);
    this.root.quaternion.copy(this.homeQuaternion);
  }
}

export class InteractionSocket {
  constructor(meshOrGroup, options = {}) {
    this.root = meshOrGroup;
    this.root.userData.interactionSocket = this;

    this.id = options.id || `socket_${Math.random().toString(36).substr(2, 9)}`;
    this.name = options.name || 'Interaction Socket';
    this.acceptedTag = options.acceptedTag || 'general';
    this.snapRadius = options.snapRadius || 0.38; // meters

    this.onSocketHoverEnter = options.onSocketHoverEnter || null;
    this.onSocketHoverExit = options.onSocketHoverExit || null;
    this.onAccepted = options.onAccepted || null;

    this.isHovered = false;
    this.occupiedObject = null;

    // Visual elements
    this.haloRing = options.haloRing || null;
    this.snapTargetPosition = new THREE.Vector3();
    this.root.getWorldPosition(this.snapTargetPosition);
  }

  canAccept(interactable) {
    if (this.occupiedObject) return false;
    if (this.acceptedTag !== 'any' && interactable.tag !== this.acceptedTag) return false;
    return true;
  }

  onProximityHover(interactable) {
    if (!this.canAccept(interactable)) return;
    if (!this.isHovered) {
      this.isHovered = true;
      this.setHighlighted(true);
      if (this.onSocketHoverEnter) this.onSocketHoverEnter(this, interactable);
    }
  }

  onProximityUnhover() {
    if (this.isHovered) {
      this.isHovered = false;
      this.setHighlighted(false);
      if (this.onSocketHoverExit) this.onSocketHoverExit(this);
    }
  }

  setHighlighted(highlighted) {
    if (this.haloRing && this.haloRing.material) {
      this.haloRing.material.opacity = highlighted ? 1.0 : 0.4;
      if (this.haloRing.material.color) {
        this.haloRing.material.color.setHex(highlighted ? 0x00ff96 : 0x00d2ff);
      }
    }
  }

  accept(interactable) {
    this.occupiedObject = interactable;
    interactable.activeSocket = this;

    // Snap to socket center
    this.root.getWorldPosition(this.snapTargetPosition);
    if (interactable.root.parent) {
      const localSnap = interactable.root.parent.worldToLocal(this.snapTargetPosition.clone());
      interactable.root.position.copy(localSnap);
    } else {
      interactable.root.position.copy(this.snapTargetPosition);
    }

    soundManager.playAIChime();
    this.setHighlighted(false);

    if (this.onAccepted) this.onAccepted(this, interactable);
    if (interactable.onSocketAccepted) interactable.onSocketAccepted(this);
  }

  releaseOccupied() {
    if (this.occupiedObject) {
      this.occupiedObject.activeSocket = null;
      this.occupiedObject.state = 'IDLE';
      this.occupiedObject = null;
    }
  }
}

/**
 * Core Grab Interaction Manager
 */
export class GrabInteractionManager {
  constructor(scene, camera, handUIManager) {
    this.scene = scene;
    this.camera = camera;
    this.handUIManager = handUIManager;

    this.interactables = [];
    this.sockets = [];

    this.hoveredObject = null;
    this.grabbedObject = null;

    this.handPointerPos = new THREE.Vector3();
    this.handThumbPos = new THREE.Vector3();
    this.handQuat = new THREE.Quaternion();

    this.raycaster = new THREE.Raycaster();
    this.wasPinching = false;
    this.debugEnabled = true;

    this.initKeyboardDebug();
  }

  registerInteractable(meshOrGroup, options = {}) {
    const obj = new InteractableObject(meshOrGroup, options);
    this.interactables.push(obj);
    return obj;
  }

  registerSocket(meshOrGroup, options = {}) {
    const socket = new InteractionSocket(meshOrGroup, options);
    this.sockets.push(socket);
    return socket;
  }

  initKeyboardDebug() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyG') {
        this.debugEnabled = !this.debugEnabled;
        soundManager.playClick();
      }
    });
  }

  update(delta) {
    const provider = this.handUIManager.getActiveProvider();
    if (!provider) return;

    // 1. Retrieve Current Hand Poses
    const hasPointer = provider.getIndexTipPose(this.handPointerPos);
    const isPinching = provider.isPinching();

    if (!hasPointer) {
      if (this.hoveredObject && !this.grabbedObject) {
        this.hoveredObject.onUnhover();
        this.hoveredObject = null;
      }
      return;
    }

    // 2. Evaluate Grabbed Object Movement
    if (this.grabbedObject) {
      this.grabbedObject.updateGrab(this.handPointerPos, this.handQuat, delta);

      // Check socket proximity while dragging
      const objWorldPos = new THREE.Vector3();
      this.grabbedObject.root.getWorldPosition(objWorldPos);

      let nearestSocket = null;
      let minSocketDist = Infinity;

      for (const socket of this.sockets) {
        const socketPos = new THREE.Vector3();
        socket.root.getWorldPosition(socketPos);
        const dist = objWorldPos.distanceTo(socketPos);

        if (dist < socket.snapRadius && dist < minSocketDist) {
          minSocketDist = dist;
          nearestSocket = socket;
        }
      }

      if (nearestSocket) {
        if (this.grabbedObject.activeSocket !== nearestSocket) {
          this.grabbedObject.activeSocket = nearestSocket;
          nearestSocket.onProximityHover(this.grabbedObject);
        }
      } else {
        if (this.grabbedObject.activeSocket) {
          this.grabbedObject.activeSocket.onProximityUnhover();
          this.grabbedObject.activeSocket = null;
        }
      }

      // Check Release Condition
      if (!isPinching && this.wasPinching) {
        this.grabbedObject.endGrab();
        this.grabbedObject = null;
      }

      this.wasPinching = isPinching;
      return;
    }

    // 3. Dual-Mode Hover Detection (PC Raycast + VR Proximity)
    let closestInteractable = null;
    let minDistance = Infinity;

    // PC Mode Raycast Detection: Raycast from camera cursor through interactable hierarchies
    if (provider === this.handUIManager.pcProvider && provider.mouseNormalized) {
      this.raycaster.setFromCamera(provider.mouseNormalized, this.camera);
      const rootMeshes = this.interactables.filter(o => o.state !== 'SOCKETED').map(o => o.root);
      const intersects = this.raycaster.intersectObjects(rootMeshes, true);

      if (intersects.length > 0 && intersects[0].distance < 4.0) {
        let hit = intersects[0].object;
        while (hit && !hit.userData.interactableObject && hit.parent) {
          hit = hit.parent;
        }
        if (hit && hit.userData.interactableObject) {
          closestInteractable = hit.userData.interactableObject;
        }
      }
    }

    // Physical Proximity Check (For VR Hand Tracking & Close Proximity)
    if (!closestInteractable) {
      for (const obj of this.interactables) {
        if (obj.state === 'SOCKETED') continue;

        const objWorldPos = new THREE.Vector3();
        obj.root.getWorldPosition(objWorldPos);
        const dist = this.handPointerPos.distanceTo(objWorldPos);

        if (dist < obj.grabRadius && dist < minDistance) {
          minDistance = dist;
          closestInteractable = obj;
        }
      }
    }

    // Update Hover State
    if (closestInteractable !== this.hoveredObject) {
      if (this.hoveredObject) {
        this.hoveredObject.onUnhover();
      }
      this.hoveredObject = closestInteractable;
      if (this.hoveredObject) {
        this.hoveredObject.onHover(this.handPointerPos);
      }
    }

    // 4. Trigger Grab on Pinch
    if (this.hoveredObject && isPinching && !this.wasPinching) {
      this.grabbedObject = this.hoveredObject;
      this.grabbedObject.startGrab(this.handPointerPos, this.handQuat);
    }

    this.wasPinching = isPinching;
  }
}
