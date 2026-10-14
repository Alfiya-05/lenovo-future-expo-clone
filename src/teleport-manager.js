/**
 * Lenovo Future Expo - Safe Teleportation Manager
 * Handles WebXR Player Rig & Desktop camera repositioning, orientation alignment,
 * visual comfort fade transitions, audio feedback, and guidance announcements.
 */
import * as THREE from 'three';
import { getDestinationById } from './expo-destinations.js';
import { soundManager } from './audio.js';
import { guidanceSystem } from './guidance.js';

export class TeleportManager {
  constructor(scene, camera, renderer, userGroup, locomotionManager) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.userGroup = userGroup;
    this.locomotionManager = locomotionManager;

    this.isTransitioning = false;
    this.fadeProgress = 0; // 0 (clear) to 1 (black)
    this.fadeState = 'IDLE'; // 'IDLE' | 'FADING_IN' | 'FADING_OUT'
    this.pendingDestination = null;
    this.onTeleportCompleteCallbacks = [];

    this.initComfortFadeSphere();
  }

  /**
   * Builds an inverted sphere attached directly to camera for comfort blackout fade.
   */
  initComfortFadeSphere() {
    const geo = new THREE.SphereGeometry(0.15, 16, 16);
    this.fadeMaterial = new THREE.MeshBasicMaterial({
      color: 0x06090e,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.0,
      depthTest: false,
      depthWrite: false
    });

    this.fadeMesh = new THREE.Mesh(geo, this.fadeMaterial);
    this.fadeMesh.name = "WebXR_Comfort_Fade_Sphere";
    this.fadeMesh.renderOrder = 999999;
    this.camera.add(this.fadeMesh);
  }

  onTeleportComplete(callback) {
    this.onTeleportCompleteCallbacks.push(callback);
  }

  /**
   * Main entry point to teleport to any stall safely.
   */
  teleportToStall(stallId) {
    const dest = getDestinationById(stallId);
    if (!dest) {
      console.warn(`[TeleportManager] Unknown stall destination ID: ${stallId}`);
      return false;
    }

    if (this.isTransitioning) {
      console.log(`[TeleportManager] Teleport already in progress, ignoring duplicate call.`);
      return false;
    }

    this.isTransitioning = true;
    this.fadeState = 'FADING_IN';
    this.pendingDestination = dest;
    this.fadeProgress = 0;

    soundManager.playClick();
    return true;
  }

  /**
   * Executes the actual coordinate repositioning at maximum fade opacity.
   */
  executeTeleport(dest) {
    if (!dest) return;

    const targetPos = dest.landingPosition;
    const targetRotY = dest.landingRotationY;

    if (this.renderer.xr.isPresenting && this.userGroup) {
      // 1. WebXR Mode:
      // Adjust rig rotation so user's head gaze aligns to booth orientation
      const currentCamYaw = this.camera.rotation.y;
      this.userGroup.rotation.y = targetRotY - currentCamYaw;
      this.userGroup.updateMatrixWorld(true);

      // Reposition userGroup while preserving physical local offset of tracked camera
      const camWorldPos = new THREE.Vector3();
      this.camera.getWorldPosition(camWorldPos);

      this.userGroup.position.x += (targetPos.x - camWorldPos.x);
      this.userGroup.position.z += (targetPos.z - camWorldPos.z);
      this.userGroup.position.y = 0; // Lock strictly to floor level
      this.userGroup.updateMatrixWorld(true);
    } else {
      // 2. Desktop PC Mode:
      if (this.locomotionManager) {
        this.locomotionManager.teleportTo(0, 0);
      }
      this.camera.position.set(targetPos.x, 1.70, targetPos.z);
      this.camera.rotation.set(0, targetRotY, 0, 'YXZ');
    }

    // Play chime & announce guidance
    soundManager.playAIChime();
    guidanceSystem.showGuidance(
      `You have arrived at ${dest.name} (${dest.zone}). ${dest.description}`,
      dest.boothCenter
    );

    // Notify listeners (e.g. map closing, marker updating)
    this.onTeleportCompleteCallbacks.forEach(cb => cb(dest));
  }

  /**
   * Per-frame animation update for smooth comfort fade.
   */
  update(delta) {
    if (!this.isTransitioning) return;

    const fadeSpeed = 7.0; // ~140ms fade duration

    if (this.fadeState === 'FADING_IN') {
      this.fadeProgress += delta * fadeSpeed;
      if (this.fadeProgress >= 1.0) {
        this.fadeProgress = 1.0;
        // Peak of blackout: perform instantaneous safe jump
        this.executeTeleport(this.pendingDestination);
        this.fadeState = 'FADING_OUT';
      }
    } else if (this.fadeState === 'FADING_OUT') {
      this.fadeProgress -= delta * fadeSpeed;
      if (this.fadeProgress <= 0.0) {
        this.fadeProgress = 0.0;
        this.fadeState = 'IDLE';
        this.isTransitioning = false;
        this.pendingDestination = null;
      }
    }

    if (this.fadeMaterial) {
      this.fadeMaterial.opacity = Math.max(0.0, Math.min(1.0, this.fadeProgress * 0.98));
      this.fadeMesh.visible = this.fadeMaterial.opacity > 0.005;
    }
  }
}
