/**
 * Lenovo Future Expo - Genuine 3D Spatial Hand UI Architecture [BUILD: 3D-HAND-UI-001]
 *
 * Exclusively provides:
 *  - 100% Genuine 3D floating interface (No flat 2D canvas screens).
 *  - 5 Layered 3D Arc Menu Buttons: MAP, PROGRESS, AI GUIDE, SETTINGS, CLOSE.
 *  - Distinctive 3D animated icons (Globe grid, 3D progress ring, AI visor, rotating gear, 3D close glyph).
 *  - Miniature 3D Expo Map model with 7 interactive stall miniatures and real-time visitor beacon.
 *  - Dedicated 3D Progress Pavilion and 3D Settings Console.
 *  - Direct safe teleportation to all 7 expo destinations.
 *  - Dual-Platform: Meta Quest 3S (XRHand joints + pinch gesture) & Desktop Preview (Simulated hand + mouse ray + click).
 */
import * as THREE from 'three';
import { XRHandModelFactory } from 'three/addons/webxr/XRHandModelFactory.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { soundManager } from './audio.js';
import { progressManager, STAGE_INFO, STAGES } from './progress.js';
import { guidanceSystem } from './guidance.js';
import { LOCOMOTION_CONFIG } from './locomotion.js';
import { ExpoMap3D } from './expo-map-3d.js';
import { TeleportManager } from './teleport-manager.js';
import { EXPO_DESTINATIONS, STALL_IDS } from './expo-destinations.js';

// Standard 25 WebXR Hand Joint names
const XR_HAND_JOINTS = [
  'wrist',
  'thumb-metacarpal',
  'thumb-phalanx-proximal',
  'thumb-phalanx-distal',
  'thumb-tip',
  'index-finger-metacarpal',
  'index-finger-phalanx-proximal',
  'index-finger-phalanx-intermediate',
  'index-finger-phalanx-distal',
  'index-finger-tip',
  'middle-finger-metacarpal',
  'middle-finger-phalanx-proximal',
  'middle-finger-phalanx-intermediate',
  'middle-finger-phalanx-distal',
  'middle-finger-tip',
  'ring-finger-metacarpal',
  'ring-finger-phalanx-proximal',
  'ring-finger-phalanx-intermediate',
  'ring-finger-phalanx-distal',
  'ring-finger-tip',
  'pinky-finger-metacarpal',
  'pinky-finger-phalanx-proximal',
  'pinky-finger-phalanx-intermediate',
  'pinky-finger-phalanx-distal',
  'pinky-finger-tip'
];

/**
 * Common Hand Input Provider Contract
 */
export class HandInputProvider {
  getPalmPose(outPos, outNormal, outUp) { return false; }
  getIndexTipPose(outPos) { return false; }
  getThumbTipPose(outPos) { return false; }
  getRaycaster(outRaycaster) { return false; }
  isPalmFacingUser() { return false; }
  isPinching() { return false; }
  getPinchDistance() { return 1.0; }
  isAvailable() { return false; }
  update(delta) {}
  getDiagnostics() {
    return {
      modeName: 'UNKNOWN',
      handTracking: 'NO',
      leftHand: 'NOT DETECTED',
      rightHand: 'NOT DETECTED',
      leftIndexTip: 'NOT DETECTED',
      thumbTip: 'NOT DETECTED',
      palmFacing: false,
      palmDot: 0,
      palmDist: 0,
      pinching: false,
      pinchDist: 1.0
    };
  }
}

/**
 * Mode A: WebXR Hand Input Provider (Meta Quest 3S)
 */
export class WebXRHandInputProvider extends HandInputProvider {
  constructor(renderer, userGroup, camera) {
    super();
    this.renderer = renderer;
    this.userGroup = userGroup;
    this.camera = camera;

    this.hand0 = null;
    this.hand1 = null;
    this.leftHand = null;
    this.rightHand = null;

    this.isLeftHandTracked = false;
    this.isRightHandTracked = false;

    this.palmPos = new THREE.Vector3();
    this.palmNormal = new THREE.Vector3();
    this.wristPos = new THREE.Vector3();
    this.middleBasePos = new THREE.Vector3();
    this.indexBasePos = new THREE.Vector3();
    this.toHeadVec = new THREE.Vector3();
    this.wristToMiddle = new THREE.Vector3();
    this.wristToIndex = new THREE.Vector3();

    this.indexTipWorldPos = new THREE.Vector3();
    this.raycaster = new THREE.Raycaster();

    this.palmFacingDot = 0;
    this.palmDistance = 0;
    this.pinchDist = 1.0;
    this.isPinchingState = false;

    this.initXRHands();
  }

  initXRHands() {
    const handModelFactory = new XRHandModelFactory();
    handModelFactory.setPath('./assets/hands/');

    // Hand 0 Space
    this.hand0 = this.renderer.xr.getHand(0);
    this.handModel0 = handModelFactory.createHandModel(this.hand0, 'mesh');
    this.hand0.add(this.handModel0);
    this.handVisuals0 = this.createJointVisualizerGroup();
    this.hand0.add(this.handVisuals0);
    this.userGroup.add(this.hand0);

    // Hand 1 Space
    this.hand1 = this.renderer.xr.getHand(1);
    this.handModel1 = handModelFactory.createHandModel(this.hand1, 'mesh');
    this.hand1.add(this.handModel1);
    this.handVisuals1 = this.createJointVisualizerGroup();
    this.hand1.add(this.handVisuals1);
    this.userGroup.add(this.hand1);

    const onConnected = (event) => {
      const data = event.data;
      if (data.handedness === 'left') {
        this.leftHand = event.target;
        this.isLeftHandTracked = true;
      } else if (data.handedness === 'right') {
        this.rightHand = event.target;
        this.isRightHandTracked = true;
      }
    };

    const onDisconnected = (event) => {
      const data = event.data;
      if (data.handedness === 'left') {
        this.leftHand = null;
        this.isLeftHandTracked = false;
      } else if (data.handedness === 'right') {
        this.rightHand = null;
        this.isRightHandTracked = false;
      }
    };

    this.hand0.addEventListener('connected', onConnected);
    this.hand0.addEventListener('disconnected', onDisconnected);
    this.hand1.addEventListener('connected', onConnected);
    this.hand1.addEventListener('disconnected', onDisconnected);
  }

  createJointVisualizerGroup() {
    const group = new THREE.Group();
    group.name = "WebXR_Hand_Joint_Nodes";

    const jointGeo = new THREE.SphereGeometry(0.006, 12, 12);
    const jointMat = new THREE.MeshBasicMaterial({ color: 0x00d2ff, transparent: true, opacity: 0.85 });
    const tipMat = new THREE.MeshBasicMaterial({ color: 0x00ff96, transparent: true, opacity: 0.95 });

    const nodesMap = new Map();
    XR_HAND_JOINTS.forEach(jointName => {
      const isTip = jointName.endsWith('-tip');
      const mesh = new THREE.Mesh(jointGeo, isTip ? tipMat : jointMat);
      mesh.name = `node_${jointName}`;
      mesh.visible = false;
      group.add(mesh);
      nodesMap.set(jointName, mesh);
    });

    group.userData.nodesMap = nodesMap;
    return group;
  }

  updateJointVisualizers(hand, visualGroup) {
    if (!hand || !hand.joints || !visualGroup) return;
    const nodesMap = visualGroup.userData.nodesMap;
    if (!nodesMap) return;

    XR_HAND_JOINTS.forEach(jointName => {
      const joint = hand.joints[jointName];
      const nodeMesh = nodesMap.get(jointName);
      if (joint && nodeMesh) {
        if (joint.visible) {
          nodeMesh.position.copy(joint.position);
          nodeMesh.quaternion.copy(joint.quaternion);
          const r = joint.jointRadius || 0.007;
          nodeMesh.scale.setScalar(r / 0.006);
          nodeMesh.visible = true;
        } else {
          nodeMesh.visible = false;
        }
      }
    });
  }

  update(delta) {
    const session = this.renderer.xr.getSession();
    if (session && session.inputSources) {
      let hasLeft = false;
      let hasRight = false;
      for (const source of session.inputSources) {
        if (source.hand) {
          if (source.handedness === 'left') {
            hasLeft = true;
            this.isLeftHandTracked = true;
            if (this.hand0.joints && this.hand0.joints['wrist']) this.leftHand = this.hand0;
            else if (this.hand1.joints && this.hand1.joints['wrist']) this.leftHand = this.hand1;
          } else if (source.handedness === 'right') {
            hasRight = true;
            this.isRightHandTracked = true;
            if (this.hand1.joints && this.hand1.joints['wrist']) this.rightHand = this.hand1;
            else if (this.hand0.joints && this.hand0.joints['wrist']) this.rightHand = this.hand0;
          }
        }
      }
      if (!hasLeft) this.isLeftHandTracked = false;
      if (!hasRight) this.isRightHandTracked = false;
    }

    this.updateJointVisualizers(this.hand0, this.handVisuals0);
    this.updateJointVisualizers(this.hand1, this.handVisuals1);
  }

  isAvailable() {
    return this.renderer.xr.isPresenting && (this.isLeftHandTracked || this.isRightHandTracked);
  }

  getPalmPose(outPos, outNormal, outUp) {
    if (!this.leftHand || !this.leftHand.joints) return false;
    const wrist = this.leftHand.joints['wrist'];
    const middleBase = this.leftHand.joints['middle-finger-phalanx-proximal'] || this.leftHand.joints['middle-finger-metacarpal'];
    const indexBase = this.leftHand.joints['index-finger-phalanx-proximal'] || this.leftHand.joints['index-finger-metacarpal'];

    if (!wrist || !middleBase || !indexBase || !wrist.visible) return false;

    wrist.getWorldPosition(this.wristPos);
    middleBase.getWorldPosition(this.middleBasePos);
    indexBase.getWorldPosition(this.indexBasePos);

    this.palmPos.copy(this.wristPos).add(this.middleBasePos).multiplyScalar(0.5);
    this.wristToMiddle.subVectors(this.middleBasePos, this.wristPos).normalize();
    this.wristToIndex.subVectors(this.indexBasePos, this.wristPos).normalize();
    this.palmNormal.crossVectors(this.wristToMiddle, this.wristToIndex).normalize();

    if (outPos) outPos.copy(this.palmPos);
    if (outNormal) outNormal.copy(this.palmNormal);
    if (outUp) outUp.copy(this.wristToMiddle);

    return true;
  }

  isPalmFacingUser() {
    if (!this.getPalmPose(this.palmPos, this.palmNormal, this.wristToMiddle)) return false;

    const camWorld = new THREE.Vector3();
    this.camera.getWorldPosition(camWorld);
    this.toHeadVec.subVectors(camWorld, this.palmPos);
    this.palmDistance = this.toHeadVec.length();
    this.toHeadVec.normalize();

    this.palmFacingDot = this.palmNormal.dot(this.toHeadVec);

    return (
      this.palmFacingDot > 0.45 &&
      this.palmDistance >= 0.15 &&
      this.palmDistance <= 0.85 &&
      this.palmPos.y > (camWorld.y - 0.70)
    );
  }

  getIndexTipPose(outPos) {
    if (this.rightHand && this.rightHand.joints) {
      const rIndex = this.rightHand.joints['index-finger-tip'];
      if (rIndex && rIndex.visible) {
        rIndex.getWorldPosition(outPos);
        return true;
      }
    }
    if (this.leftHand && this.leftHand.joints) {
      const lIndex = this.leftHand.joints['index-finger-tip'];
      if (lIndex && lIndex.visible) {
        lIndex.getWorldPosition(outPos);
        return true;
      }
    }
    return false;
  }

  getThumbTipPose(outPos) {
    if (this.rightHand && this.rightHand.joints) {
      const rThumb = this.rightHand.joints['thumb-tip'];
      if (rThumb && rThumb.visible) {
        rThumb.getWorldPosition(outPos);
        return true;
      }
    }
    if (this.leftHand && this.leftHand.joints) {
      const lThumb = this.leftHand.joints['thumb-tip'];
      if (lThumb && lThumb.visible) {
        lThumb.getWorldPosition(outPos);
        return true;
      }
    }
    return false;
  }

  getRaycaster(outRaycaster) {
    if (this.getIndexTipPose(this.indexTipWorldPos)) {
      const camWorld = new THREE.Vector3();
      this.camera.getWorldPosition(camWorld);
      const dir = new THREE.Vector3().subVectors(this.indexTipWorldPos, camWorld).normalize();

      outRaycaster.set(this.indexTipWorldPos, dir);
      return true;
    }
    return false;
  }

  isPinching() {
    let pinching = false;
    let minDist = 1.0;

    const checkPinch = (hand) => {
      if (!hand || !hand.joints) return;
      const thumb = hand.joints['thumb-tip'];
      const index = hand.joints['index-finger-tip'];
      if (thumb && index && thumb.visible && index.visible) {
        const p1 = new THREE.Vector3();
        const p2 = new THREE.Vector3();
        thumb.getWorldPosition(p1);
        index.getWorldPosition(p2);
        const d = p1.distanceTo(p2);
        minDist = Math.min(minDist, d);
        if (d < 0.026) pinching = true;
      }
    };

    checkPinch(this.rightHand);
    if (!pinching) checkPinch(this.leftHand);

    this.pinchDist = minDist;
    this.isPinchingState = pinching;
    return pinching;
  }

  getPinchDistance() {
    return this.pinchDist;
  }

  getDiagnostics() {
    return {
      modeName: 'META QUEST 3S WEBXR',
      handTracking: this.isAvailable() ? 'YES (XRHand Active)' : 'WAITING FOR XR HANDS',
      leftHand: this.isLeftHandTracked ? 'DETECTED' : 'NOT DETECTED',
      rightHand: this.isRightHandTracked ? 'DETECTED' : 'NOT DETECTED',
      leftIndexTip: (this.leftHand && this.leftHand.joints && this.leftHand.joints['index-finger-tip']?.visible) ? 'DETECTED' : 'NOT DETECTED',
      thumbTip: (this.leftHand && this.leftHand.joints && this.leftHand.joints['thumb-tip']?.visible) ? 'DETECTED' : 'NOT DETECTED',
      palmFacing: this.isPalmFacingUser(),
      palmDot: this.palmFacingDot,
      palmDist: this.palmDistance,
      pinching: this.isPinchingState,
      pinchDist: this.pinchDist
    };
  }
}

/**
 * Mode B: PC Simulated Hand Input Provider (Desktop Preview)
 */
export class PCHandInputProvider extends HandInputProvider {
  constructor(scene, camera) {
    super();
    this.scene = scene;
    this.camera = camera;

    this.isHandVisible = true;
    this.isPalmRaised = false; // Toggle with 'M'
    this.isPinchingState = false; // Trigger with 'P' or Left Click

    this.handGroup = new THREE.Group();
    this.handGroup.name = "PC_Simulated_Left_Hand";

    this.thumbNode = null;
    this.indexTipNode = null;
    this.thumbTipNode = null;
    this.simulatedPointerWorldPos = new THREE.Vector3();

    this.mouseNormalized = new THREE.Vector2(0, 0);
    this.raycaster = new THREE.Raycaster();

    this.buildSimulatedHandModel();
    this.initPCEventListeners();

    this.camera.add(this.handGroup);
    this.handGroup.position.set(-0.20, -0.16, -0.45);
    this.handGroup.rotation.set(0.2, 0.4, -0.15);
  }

  buildSimulatedHandModel() {
    const palmMat = new THREE.MeshStandardMaterial({
      color: 0x18202c,
      roughness: 0.35,
      metalness: 0.6
    });

    const jointMat = new THREE.MeshBasicMaterial({ color: 0x00d2ff });
    const tipMat = new THREE.MeshBasicMaterial({ color: 0x00ff96 });

    // 1. Palm Base
    const palmGeo = new THREE.BoxGeometry(0.08, 0.085, 0.022);
    const palmMesh = new THREE.Mesh(palmGeo, palmMat);
    this.handGroup.add(palmMesh);

    // Lenovo Accent Plate
    const badgeGeo = new THREE.BoxGeometry(0.05, 0.02, 0.005);
    const badgeMat = new THREE.MeshBasicMaterial({ color: 0xe2231a });
    const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
    badgeMesh.position.set(0, 0, -0.012);
    this.handGroup.add(badgeMesh);

    // 2. Articulated Fingers
    const fingerDefs = [
      { name: 'thumb', x: -0.045, y: -0.015, z: 0.005, len: 0.038, rotZ: 0.6, isThumb: true },
      { name: 'index', x: -0.028, y: 0.048, z: 0, len: 0.045, rotZ: 0.08, isIndex: true },
      { name: 'middle', x: -0.009, y: 0.052, z: 0, len: 0.050, rotZ: 0.0 },
      { name: 'ring', x: 0.010, y: 0.046, z: 0, len: 0.044, rotZ: -0.08 },
      { name: 'pinky', x: 0.028, y: 0.038, z: 0, len: 0.036, rotZ: -0.16 }
    ];

    fingerDefs.forEach(def => {
      const fingerGroup = new THREE.Group();
      fingerGroup.position.set(def.x, def.y, def.z);
      fingerGroup.rotation.z = def.rotZ;

      const p1Geo = new THREE.CylinderGeometry(0.007, 0.008, def.len * 0.55, 12);
      const p1Mesh = new THREE.Mesh(p1Geo, palmMat);
      p1Mesh.position.y = def.len * 0.28;
      fingerGroup.add(p1Mesh);

      const kGeo = new THREE.SphereGeometry(0.0075, 12, 12);
      const kMesh = new THREE.Mesh(kGeo, jointMat);
      fingerGroup.add(kMesh);

      const p2Group = new THREE.Group();
      p2Group.position.y = def.len * 0.55;

      const p2Geo = new THREE.CylinderGeometry(0.006, 0.007, def.len * 0.45, 12);
      const p2Mesh = new THREE.Mesh(p2Geo, palmMat);
      p2Mesh.position.y = def.len * 0.22;
      p2Group.add(p2Mesh);

      const tipGeo = new THREE.SphereGeometry(0.0065, 12, 12);
      const tipMesh = new THREE.Mesh(tipGeo, (def.isIndex || def.isThumb) ? tipMat : jointMat);
      tipMesh.position.y = def.len * 0.45;
      p2Group.add(tipMesh);

      fingerGroup.add(p2Group);
      this.handGroup.add(fingerGroup);

      if (def.isIndex) this.indexTipNode = tipMesh;
      if (def.isThumb) {
        this.thumbNode = fingerGroup;
        this.thumbTipNode = tipMesh;
      }
    });

    const loader = new GLTFLoader();
    loader.load('./assets/hands/left.glb', (gltf) => {
      const model = gltf.scene;
      model.visible = false;
      this.handGroup.add(model);
    }, undefined, () => {});
  }

  initPCEventListeners() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyH') {
        this.isHandVisible = !this.isHandVisible;
        this.handGroup.visible = this.isHandVisible;
        soundManager.playClick();
      } else if (e.code === 'KeyM') {
        this.isPalmRaised = !this.isPalmRaised;
        soundManager.playClick();
        if (this.isPalmRaised && document.pointerLockElement) {
          document.exitPointerLock();
        }
      } else if (e.code === 'KeyP') {
        this.isPinchingState = true;
        setTimeout(() => { this.isPinchingState = false; }, 200);
      } else if (e.code === 'Escape') {
        this.isPalmRaised = false;
      }
    });

    window.addEventListener('mousemove', (e) => {
      this.mouseNormalized.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouseNormalized.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.isPinchingState = true;
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.isPinchingState = false;
      }
    });
  }

  update(delta) {
    this.handGroup.visible = this.isHandVisible;

    const targetPos = this.isPalmRaised
      ? new THREE.Vector3(-0.16, -0.10, -0.38)
      : new THREE.Vector3(-0.22, -0.20, -0.50);

    const targetRot = this.isPalmRaised
      ? new THREE.Euler(0.35, 0.65, -0.10)
      : new THREE.Euler(0.15, 0.30, -0.20);

    this.handGroup.position.lerp(targetPos, Math.min(1.0, delta * 12.0));
    this.handGroup.rotation.x = THREE.MathUtils.lerp(this.handGroup.rotation.x, targetRot.x, delta * 12.0);
    this.handGroup.rotation.y = THREE.MathUtils.lerp(this.handGroup.rotation.y, targetRot.y, delta * 12.0);
    this.handGroup.rotation.z = THREE.MathUtils.lerp(this.handGroup.rotation.z, targetRot.z, delta * 12.0);

    if (this.thumbNode) {
      const targetThumbCurl = this.isPinchingState ? 0.9 : 0.0;
      this.thumbNode.rotation.x = THREE.MathUtils.lerp(this.thumbNode.rotation.x, targetThumbCurl, delta * 20.0);
    }
  }

  isAvailable() {
    return true;
  }

  getPalmPose(outPos, outNormal, outUp) {
    if (outPos) this.handGroup.getWorldPosition(outPos);
    if (outNormal) {
      this.handGroup.getWorldDirection(outNormal);
      outNormal.negate();
    }
    if (outUp) {
      outUp.set(0, 1, 0).applyQuaternion(this.handGroup.quaternion);
    }
    return true;
  }

  isPalmFacingUser() {
    return this.isPalmRaised;
  }

  getIndexTipPose(outPos) {
    if (!outPos) return false;
    this.raycaster.setFromCamera(this.mouseNormalized, this.camera);
    const pointerRayPos = this.raycaster.ray.origin.clone().addScaledVector(this.raycaster.ray.direction, 0.38);
    outPos.copy(pointerRayPos);
    this.simulatedPointerWorldPos.copy(pointerRayPos);
    return true;
  }

  getThumbTipPose(outPos) {
    if (this.thumbTipNode && outPos) {
      this.thumbTipNode.getWorldPosition(outPos);
      return true;
    }
    return false;
  }

  getRaycaster(outRaycaster) {
    if (document.pointerLockElement) {
      outRaycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    } else {
      outRaycaster.setFromCamera(this.mouseNormalized, this.camera);
    }
    return true;
  }

  isPinching() {
    return this.isPinchingState;
  }

  getPinchDistance() {
    return this.isPinchingState ? 0.015 : 0.060;
  }

  getDiagnostics() {
    return {
      modeName: 'PC 3D HAND UI TEST MODE',
      handTracking: 'SIMULATED (3D Hand Model)',
      leftHand: this.isHandVisible ? 'SIMULATED (Active)' : 'HIDDEN [Press H]',
      rightHand: 'MOUSE RAYCASTER',
      leftIndexTip: 'ACTIVE (Mouse Ray)',
      thumbTip: 'ACTIVE',
      palmFacing: this.isPalmRaised,
      palmDot: this.isPalmRaised ? 0.95 : 0.10,
      palmDist: 0.42,
      pinching: this.isPinchingState,
      pinchDist: this.isPinchingState ? 0.015 : 0.060
    };
  }
}

/**
 * Unified Hand UI Manager
 * Drives the Genuine 3D Menu, 3D Expo Map, 3D Progress, and 3D Settings.
 */
export class HandUIManager {
  constructor(scene, camera, renderer, userGroup, locomotionManager, interactionManager = null) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.userGroup = userGroup;
    this.locomotionManager = locomotionManager;
    this.interactionManager = interactionManager;

    // Teleport Manager
    this.teleportManager = new TeleportManager(scene, camera, renderer, userGroup, locomotionManager);

    // Input Providers
    this.webxrProvider = new WebXRHandInputProvider(renderer, userGroup, camera);
    this.pcProvider = new PCHandInputProvider(scene, camera);
    this.activeProvider = this.pcProvider;

    // View State: 'main' | 'map' | 'progress' | 'settings' | 'closed'
    this.currentView = 'main';
    this.isArcMenuVisible = false;
    this.menuOpenScale = 0;
    this.palmHoldTimer = 0;

    // Interactive 3D Objects & Raycasting
    this.activeRaycaster = new THREE.Raycaster();
    this.hoveredItem = null;
    this.pinchState = 'READY'; // 'READY' | 'PINCHED'

    // Micro-animations list
    this.menuAnimatables = [];

    // Transforms
    this.palmPos = new THREE.Vector3();
    this.palmNormal = new THREE.Vector3();
    this.palmUp = new THREE.Vector3();
    this.targetMenuPos = new THREE.Vector3();
    this.targetMenuQuat = new THREE.Quaternion();

    // Diagnostics State
    this.diag = {
      hoveredItemName: 'NONE'
    };

    // Subsystems
    this.init3DArcMenu();
    this.init3DProgressPavilion();
    this.init3DSettingsConsole();
    this.init3DExpoMap();
    this.initDesktopOnScreenHUD();

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') {
        this.closeAllMenus();
      } else if (this.expoMap3D && this.expoMap3D.isOpen) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= 7) {
          const dest = EXPO_DESTINATIONS[num - 1];
          if (dest) {
            this.expoMap3D.setHoveredStall(dest.id);
            this.teleportManager.teleportToStall(dest.id);
            this.expoMap3D.close();
          }
        }
      } else if (this.isArcMenuVisible && this.menuOpenScale > 0.2) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= 5 && this.buttons3D[num - 1]) {
          this.setButtonHovered(this.buttons3D[num - 1]);
          this.buttons3D[num - 1].action();
        }
      }
    });
  }

  getActiveProvider() {
    if (this.renderer.xr.isPresenting && this.webxrProvider.isAvailable()) {
      return this.webxrProvider;
    }
    return this.pcProvider;
  }

  /**
   * Builds the genuine 3D Arc Menu hovering above the left palm.
   */
  init3DArcMenu() {
    this.arcMenuGroup = new THREE.Group();
    this.arcMenuGroup.name = "Genuine_3D_Hand_Arc_Menu";
    this.arcMenuGroup.visible = false;
    this.arcMenuGroup.scale.set(0, 0, 0);

    // Subtle ambient glow emitter ring at base of menu
    const emitterRingGeo = new THREE.RingGeometry(0.045, 0.065, 32);
    const emitterRingMat = new THREE.MeshBasicMaterial({
      color: 0x00d2ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.65
    });
    this.emitterRing = new THREE.Mesh(emitterRingGeo, emitterRingMat);
    this.emitterRing.position.set(0, -0.05, 0);
    this.emitterRing.rotation.x = Math.PI / 2;
    this.arcMenuGroup.add(this.emitterRing);

    // 5 3D Buttons: MAP, PROGRESS, AI GUIDE, SETTINGS, CLOSE
    this.buttons3D = [];
    this.allMenuButtonMeshes = [];

    const buttonDefs = [
      {
        id: 'btn-map',
        label: 'MAP',
        sub: '3D SPATIAL',
        angleDeg: -50,
        color: 0x00d2ff,
        iconType: 'map',
        action: () => {
          this.open3DMap();
        }
      },
      {
        id: 'btn-progress',
        label: 'PROGRESS',
        sub: 'STAGE STATS',
        angleDeg: -25,
        color: 0x00ff96,
        iconType: 'progress',
        action: () => {
          this.open3DProgress();
        }
      },
      {
        id: 'btn-ai-guide',
        label: 'AI GUIDE',
        sub: 'COMPANION',
        angleDeg: 0,
        color: 0xffb300,
        iconType: 'ai-guide',
        action: () => {
          this.triggerAIGuide();
        }
      },
      {
        id: 'btn-settings',
        label: 'SETTINGS',
        sub: 'PREFERENCES',
        angleDeg: 25,
        color: 0xb388ff,
        iconType: 'settings',
        action: () => {
          this.open3DSettings();
        }
      },
      {
        id: 'btn-close',
        label: 'CLOSE',
        sub: 'DISMISS',
        angleDeg: 50,
        color: 0xff4040,
        iconType: 'close',
        action: () => {
          this.closeArcMenu();
        }
      }
    ];

    const arcRadius = 0.15; // 15 cm radius arc above palm

    buttonDefs.forEach((def) => {
      const btnGroup = new THREE.Group();
      btnGroup.name = `3D_Button_${def.id}`;

      const rad = THREE.MathUtils.degToRad(def.angleDeg);
      const bx = Math.sin(rad) * arcRadius;
      const by = Math.cos(rad) * 0.05 + 0.04;
      const bz = (1 - Math.cos(rad)) * 0.04; // Curved depth

      btnGroup.position.set(bx, by, bz);
      // Face towards user center
      btnGroup.rotation.y = -rad * 0.8;
      btnGroup.rotation.x = -0.15;

      // 1. Tactile 3D Platter Base (Dark graphite beveled box)
      const baseGeo = new THREE.BoxGeometry(0.062, 0.062, 0.016);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x121722,
        roughness: 0.25,
        metalness: 0.75
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      btnGroup.add(baseMesh);

      // 2. Glowing Accent Border Bezel
      const bezelGeo = new THREE.BoxGeometry(0.064, 0.064, 0.003);
      const bezelMat = new THREE.MeshBasicMaterial({ color: def.color });
      const bezelMesh = new THREE.Mesh(bezelGeo, bezelMat);
      bezelMesh.position.z = 0.008;
      btnGroup.add(bezelMesh);

      // 3. Frosted Glass Inset Face Plate
      const glassGeo = new THREE.BoxGeometry(0.056, 0.056, 0.002);
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x182436,
        roughness: 0.15,
        metalness: 0.5,
        transparent: true,
        opacity: 0.90
      });
      const glassMesh = new THREE.Mesh(glassGeo, glassMat);
      glassMesh.position.z = 0.010;
      btnGroup.add(glassMesh);

      // 4. Distinctive 3D Floating Icon Mesh
      const iconGroup = this.create3DIconMesh(def.iconType, def.color);
      iconGroup.position.set(0, 0.004, 0.024);
      btnGroup.add(iconGroup);

      // 5. Floating 3D Text Placard Badge
      const textCanvas = document.createElement('canvas');
      textCanvas.width = 256;
      textCanvas.height = 96;
      const tCtx = textCanvas.getContext('2d');
      tCtx.fillStyle = 'rgba(10, 16, 26, 0.92)';
      tCtx.fillRect(4, 4, 248, 88);
      tCtx.strokeStyle = '#' + def.color.toString(16).padStart(6, '0');
      tCtx.lineWidth = 4;
      tCtx.strokeRect(4, 4, 248, 88);

      tCtx.fillStyle = '#ffffff';
      tCtx.font = 'bold 30px Arial';
      tCtx.textAlign = 'center';
      tCtx.fillText(def.label, 128, 42);

      tCtx.fillStyle = '#' + def.color.toString(16).padStart(6, '0');
      tCtx.font = 'bold 20px Arial';
      tCtx.fillText(def.sub, 128, 74);

      const textTex = new THREE.CanvasTexture(textCanvas);
      textTex.generateMipmaps = true;
      const textGeo = new THREE.PlaneGeometry(0.058, 0.022);
      const textMat = new THREE.MeshBasicMaterial({ map: textTex, transparent: true, side: THREE.DoubleSide });
      const textMesh = new THREE.Mesh(textGeo, textMat);
      textMesh.position.set(0, -0.044, 0.012);
      btnGroup.add(textMesh);

      // 6. Hit-box for VR raycasting / fingertip intersection
      const hitGeo = new THREE.BoxGeometry(0.075, 0.095, 0.05);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.position.set(0, -0.015, 0.015);
      hitMesh.userData.is3DButton = true;
      hitMesh.userData.btnId = def.id;
      hitMesh.userData.btnDef = def;
      hitMesh.userData.btnGroup = btnGroup;
      btnGroup.add(hitMesh);

      const buttonRecord = {
        def,
        group: btnGroup,
        baseMesh,
        bezelMesh,
        bezelMat,
        iconGroup,
        hitMesh,
        action: def.action,
        homePos: btnGroup.position.clone(),
        isHovered: false
      };

      if (this.interactionManager) {
        this.interactionManager.registerInteractable(
          hitMesh,
          () => {
            def.action();
          },
          () => {
            this.setButtonHovered(buttonRecord);
          },
          () => {
            this.clearButtonHovers();
          }
        );
      }

      btnGroup.traverse(child => {
        if (child.isMesh) {
          child.userData.parentBtnRecord = buttonRecord;
          this.allMenuButtonMeshes.push(child);
        }
      });

      this.buttons3D.push(buttonRecord);
      this.arcMenuGroup.add(btnGroup);
    });

    this.scene.add(this.arcMenuGroup);
  }

  /**
   * Generates recognizable, distinct 3D icon geometries.
   */
  create3DIconMesh(type, colorHex) {
    const group = new THREE.Group();

    switch (type) {
      case 'map': {
        // Miniature 3D Spatial Wireframe Globe / Holographic Grid
        const sphereGeo = new THREE.IcosahedronGeometry(0.014, 1);
        const sphereMat = new THREE.MeshBasicMaterial({ color: colorHex, wireframe: true });
        const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
        group.add(sphereMesh);

        const ringGeo = new THREE.RingGeometry(0.016, 0.019, 16);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xe2231a, side: THREE.DoubleSide });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 3;
        group.add(ringMesh);

        this.menuAnimatables.push({ mesh: sphereMesh, rotSpeed: 1.5 });
        break;
      }

      case 'progress': {
        // Three-Dimensional Progress Torus Ring
        const ringOuter = new THREE.Mesh(
          new THREE.TorusGeometry(0.014, 0.003, 8, 24),
          new THREE.MeshBasicMaterial({ color: 0x1c2b3a })
        );
        group.add(ringOuter);

        const ringActive = new THREE.Mesh(
          new THREE.TorusGeometry(0.014, 0.0032, 8, 24, Math.PI * 1.5),
          new THREE.MeshBasicMaterial({ color: colorHex })
        );
        group.add(ringActive);

        // Center jewel
        const center = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.006),
          new THREE.MeshBasicMaterial({ color: colorHex })
        );
        group.add(center);
        this.menuAnimatables.push({ mesh: center, rotSpeed: -2.0 });
        break;
      }

      case 'ai-guide': {
        // 3D Stylized Robot Companion Visor / Core
        const headGeo = new THREE.BoxGeometry(0.024, 0.018, 0.014);
        const headMat = new THREE.MeshStandardMaterial({ color: 0x141e2a, metalness: 0.8, roughness: 0.2 });
        const headMesh = new THREE.Mesh(headGeo, headMat);
        group.add(headMesh);

        const visorGeo = new THREE.BoxGeometry(0.020, 0.008, 0.004);
        const visorMat = new THREE.MeshBasicMaterial({ color: colorHex });
        const visorMesh = new THREE.Mesh(visorGeo, visorMat);
        visorMesh.position.set(0, 0, 0.008);
        group.add(visorMesh);

        // Antenna
        const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.0015, 0.0015, 0.009, 8), new THREE.MeshBasicMaterial({ color: 0xe2231a }));
        ant.position.set(0, 0.012, 0);
        group.add(ant);
        break;
      }

      case 'settings': {
        // Genuine 3D Mechanical Rotating Gear
        const gearGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.004, 8);
        const gearMat = new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.9, roughness: 0.2 });
        const gearMesh = new THREE.Mesh(gearGeo, gearMat);
        gearMesh.rotation.x = Math.PI / 2;
        group.add(gearMesh);

        // Gear teeth
        for (let i = 0; i < 6; i++) {
          const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.006, 0.004), gearMat);
          const ang = (i / 6) * Math.PI * 2;
          tooth.position.set(Math.cos(ang) * 0.015, Math.sin(ang) * 0.015, 0);
          tooth.rotation.z = ang;
          group.add(tooth);
        }

        this.menuAnimatables.push({ mesh: group, rotSpeed: 1.2, axis: 'z' });
        break;
      }

      case 'close': {
        // 3D Crossed Bars Dismiss Icon
        const barMat = new THREE.MeshBasicMaterial({ color: 0xe2231a });
        const b1 = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.004, 0.004), barMat);
        b1.rotation.z = Math.PI / 4;
        group.add(b1);

        const b2 = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.004, 0.004), barMat);
        b2.rotation.z = -Math.PI / 4;
        group.add(b2);
        break;
      }
    }

    return group;
  }

  /**
   * Builds the 3D Progress Pavilion view.
   */
  init3DProgressPavilion() {
    this.progressGroup = new THREE.Group();
    this.progressGroup.name = "Genuine_3D_Progress_Pavilion";
    this.progressGroup.visible = false;
    this.progressGroup.scale.set(0, 0, 0);

    // Dark graphite pedestal
    const baseMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 0.015, 0.32),
      new THREE.MeshStandardMaterial({ color: 0x0c121a, metalness: 0.8, roughness: 0.25 })
    );
    this.progressGroup.add(baseMesh);

    // Title banner
    const tCanvas = document.createElement('canvas');
    tCanvas.width = 512;
    tCanvas.height = 110;
    const tCtx = tCanvas.getContext('2d');
    tCtx.fillStyle = 'rgba(8, 14, 22, 0.95)';
    tCtx.fillRect(4, 4, 504, 102);
    tCtx.strokeStyle = '#00ff96';
    tCtx.lineWidth = 4;
    tCtx.strokeRect(4, 4, 504, 102);
    tCtx.fillStyle = '#00ff96';
    tCtx.font = 'bold 30px Arial';
    tCtx.fillText('VISITOR EXPO PROGRESS', 20, 45);
    tCtx.fillStyle = '#cfd8dc';
    tCtx.font = '22px Arial';
    tCtx.fillText('7 Interactive Stall Milestones', 20, 85);

    const tTex = new THREE.CanvasTexture(tCanvas);
    const tMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.08), new THREE.MeshBasicMaterial({ map: tTex, transparent: true, side: THREE.DoubleSide }));
    tMesh.position.set(0, 0.12, -0.12);
    tMesh.rotation.x = -0.25;
    this.progressGroup.add(tMesh);

    // 7 Miniature status tokens arranged in an arc
    this.progressTokens = [];
    STAGE_INFO.forEach((stage, idx) => {
      const pGroup = new THREE.Group();
      const ang = ((idx - 3) / 3.5) * 0.85;
      const px = Math.sin(ang) * 0.17;
      const pz = Math.cos(ang) * 0.12 - 0.05;

      pGroup.position.set(px, 0.02, pz);

      const crystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.014),
        new THREE.MeshBasicMaterial({ color: 0x546e7a })
      );
      crystal.position.y = 0.02;
      pGroup.add(crystal);

      pGroup.userData.stageId = stage.id;
      pGroup.userData.crystal = crystal;

      this.progressTokens.push(pGroup);
      this.progressGroup.add(pGroup);
    });

    // Return Button
    this.progressReturnBtn = this.createReturnButton("⬅ RETURN TO MAIN MENU", () => {
      this.returnToMainMenu();
    });
    this.progressReturnBtn.position.set(0, 0.012, 0.12);
    this.progressGroup.add(this.progressReturnBtn);

    this.scene.add(this.progressGroup);
  }

  /**
   * Builds the 3D Settings Console view.
   */
  init3DSettingsConsole() {
    this.settingsGroup = new THREE.Group();
    this.settingsGroup.name = "Genuine_3D_Settings_Console";
    this.settingsGroup.visible = false;
    this.settingsGroup.scale.set(0, 0, 0);

    const baseMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.015, 0.36),
      new THREE.MeshStandardMaterial({ color: 0x120e20, metalness: 0.8, roughness: 0.25 })
    );
    this.settingsGroup.add(baseMesh);

    // 4 Setting Blocks:
    const settingDefs = [
      { id: 'set-audio', label: '🔊 AUDIO: ON / OFF', pos: [-0.11, 0.02, -0.06], action: () => {
        const isMuted = soundManager.toggleMute();
        guidanceSystem.showGuidance(isMuted ? "Audio Muted." : "Audio Unmuted.");
      }},
      { id: 'set-speed', label: `🏃 WALK SPEED: ${LOCOMOTION_CONFIG.WALK_SPEED} m/s`, pos: [0.11, 0.02, -0.06], action: () => {
        LOCOMOTION_CONFIG.WALK_SPEED = LOCOMOTION_CONFIG.WALK_SPEED === 1.8 ? 2.5 : 1.8;
        soundManager.playClick();
        guidanceSystem.showGuidance(`Walk speed set to ${LOCOMOTION_CONFIG.WALK_SPEED} m/s.`);
      }},
      { id: 'set-recenter', label: '📍 TELEPORT TO ENTRANCE', pos: [-0.11, 0.02, 0.03], action: () => {
        this.teleportManager.teleportToStall(STALL_IDS.ENTRANCE);
        this.closeAllMenus();
      }},
      { id: 'set-reset', label: '🔄 RESET EXPO PROGRESS', pos: [0.11, 0.02, 0.03], action: () => {
        progressManager.reset();
        guidanceSystem.showGuidance("All expo progress reset.");
      }}
    ];

    this.settingsButtons = [];

    settingDefs.forEach(def => {
      const blockGroup = new THREE.Group();
      blockGroup.position.set(def.pos[0], def.pos[1], def.pos[2]);

      const blockMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.20, 0.022, 0.06),
        new THREE.MeshStandardMaterial({ color: 0x241836, roughness: 0.3 })
      );
      blockGroup.add(blockMesh);

      const sCanvas = document.createElement('canvas');
      sCanvas.width = 320;
      sCanvas.height = 96;
      const sCtx = sCanvas.getContext('2d');
      sCtx.fillStyle = 'rgba(25, 16, 40, 0.95)';
      sCtx.fillRect(4, 4, 312, 88);
      sCtx.strokeStyle = '#b388ff';
      sCtx.lineWidth = 4;
      sCtx.strokeRect(4, 4, 312, 88);
      sCtx.fillStyle = '#ffffff';
      sCtx.font = 'bold 22px Arial';
      sCtx.textAlign = 'center';
      sCtx.fillText(def.label, 160, 52);

      const sTex = new THREE.CanvasTexture(sCanvas);
      const sLabelMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.19, 0.045),
        new THREE.MeshBasicMaterial({ map: sTex, transparent: true, side: THREE.DoubleSide })
      );
      sLabelMesh.position.set(0, 0.012, 0);
      sLabelMesh.rotation.x = -Math.PI / 2;
      blockGroup.add(sLabelMesh);

      const hitMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.21, 0.04, 0.07),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hitMesh.userData.isSettingsBtn = true;
      hitMesh.userData.action = def.action;
      hitMesh.userData.blockGroup = blockGroup;
      blockGroup.add(hitMesh);

      this.settingsButtons.push({ hitMesh, action: def.action, blockGroup });
      this.settingsGroup.add(blockGroup);
    });

    // Return button
    this.settingsReturnBtn = this.createReturnButton("⬅ RETURN TO MAIN MENU", () => {
      this.returnToMainMenu();
    });
    this.settingsReturnBtn.position.set(0, 0.012, 0.12);
    this.settingsGroup.add(this.settingsReturnBtn);

    this.scene.add(this.settingsGroup);
  }

  createReturnButton(label, onClick) {
    const group = new THREE.Group();

    const baseMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.022, 0.045),
      new THREE.MeshStandardMaterial({ color: 0x331014, roughness: 0.3 })
    );
    group.add(baseMesh);

    const rCanvas = document.createElement('canvas');
    rCanvas.width = 440;
    rCanvas.height = 96;
    const rCtx = rCanvas.getContext('2d');
    rCtx.fillStyle = '#e2231a';
    rCtx.fillRect(4, 4, 432, 88);
    rCtx.fillStyle = '#ffffff';
    rCtx.font = 'bold 28px Arial';
    rCtx.textAlign = 'center';
    rCtx.fillText(label, 220, 55);

    const rTex = new THREE.CanvasTexture(rCanvas);
    const rLabelMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.26, 0.024),
      new THREE.MeshBasicMaterial({ map: rTex, transparent: true, side: THREE.DoubleSide })
    );
    rLabelMesh.position.set(0, 0.012, 0);
    rLabelMesh.rotation.x = -Math.PI / 2;
    group.add(rLabelMesh);

    const hitMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.29, 0.04, 0.055),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hitMesh.userData.isReturnBtn = true;
    hitMesh.userData.action = onClick;
    hitMesh.userData.btnGroup = group;
    group.add(hitMesh);

    group.userData.hitMesh = hitMesh;
    return group;
  }

  /**
   * Builds the 3D Miniature Expo Map.
   */
  init3DExpoMap() {
    this.expoMap3D = new ExpoMap3D(this.scene, this.camera, this.teleportManager);

    if (this.interactionManager && this.expoMap3D) {
      this.expoMap3D.interactiveMeshes.forEach(mesh => {
        if (mesh.userData.isStallHitBox) {
          this.interactionManager.registerInteractable(
            mesh,
            () => {
              this.teleportManager.teleportToStall(mesh.userData.stallId);
              this.expoMap3D.close();
            },
            () => {
              this.expoMap3D.setHoveredStall(mesh.userData.stallId);
            },
            () => {
              this.expoMap3D.setHoveredStall(null);
            }
          );
        } else if (mesh.userData.isMapCloseBtn) {
          this.interactionManager.registerInteractable(
            mesh,
            () => {
              this.expoMap3D.close();
            }
          );
        }
      });
    }
  }

  /**
   * Action: Open 3D Miniature Expo Map.
   */
  open3DMap() {
    this.currentView = 'map';
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    this.expoMap3D.open();
    // Keep palm arc menu minimized while 3D map is open
    this.isArcMenuVisible = false;
  }

  /**
   * Action: Open 3D Progress Pavilion.
   */
  open3DProgress() {
    this.currentView = 'progress';
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    this.progressGroup.visible = true;
    this.update3DProgressVisuals();
    soundManager.playClick();
  }

  update3DProgressVisuals() {
    this.progressTokens.forEach(p => {
      const isDone = progressManager.isStageCompleted(p.userData.stageId);
      const isCurrent = progressManager.currentStage === p.userData.stageId;

      if (isDone) {
        p.userData.crystal.material.color.setHex(0x00ff96);
      } else if (isCurrent) {
        p.userData.crystal.material.color.setHex(0x00d2ff);
      } else {
        p.userData.crystal.material.color.setHex(0x546e7a);
      }
    });
  }

  /**
   * Action: Open 3D Settings Console.
   */
  open3DSettings() {
    this.currentView = 'settings';
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    this.settingsGroup.visible = true;
    soundManager.playClick();
  }

  /**
   * Action: Summon AI Companion.
   */
  triggerAIGuide() {
    soundManager.playAIChime();
    const curZ = this.renderer.xr.isPresenting && this.userGroup ? this.userGroup.position.z : this.camera.position.z;
    guidanceSystem.showGuidance(
      "🤖 AI Guide summoned! Follow the waypoint beacon along the main aisle.",
      new THREE.Vector3(0, curZ - 2.0, 0)
    );
  }

  returnToMainMenu() {
    this.currentView = 'main';
    this.progressGroup.visible = false;
    this.settingsGroup.visible = false;
    soundManager.playClick();
  }

  closeArcMenu() {
    this.isArcMenuVisible = false;
    this.menuOpenScale = 0;
    if (this.pcProvider) this.pcProvider.isPalmRaised = false;
    soundManager.playClick();
  }

  closeAllMenus() {
    this.closeArcMenu();
    this.currentView = 'main';
    this.progressGroup.visible = false;
    this.settingsGroup.visible = false;
    if (this.expoMap3D) this.expoMap3D.close();
  }

  /**
   * Desktop On-Screen HUD Overlay for live test feedback.
   */
  initDesktopOnScreenHUD() {
    let hud = document.getElementById('pc-hand-ui-hud');
    if (!hud) {
      hud = document.createElement('div');
      hud.id = 'pc-hand-ui-hud';
      hud.style.cssText = `
        position: fixed; bottom: 20px; right: 20px; z-index: 9999;
        background: rgba(10, 16, 26, 0.94); border: 2px solid #00d2ff;
        border-radius: 8px; padding: 12px 18px; color: #f0f4f8;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 13px; max-width: 390px; box-shadow: 0 4px 20px rgba(0, 210, 255, 0.35);
        pointer-events: none; transition: opacity 0.3s ease;
      `;
      document.body.appendChild(hud);
    }
    this.desktopHudEl = hud;
  }

  /**
   * Evaluates raycast intersection and hover states.
   */
  evaluateRayHoverAndPinch(delta) {
    if (!this.activeProvider.getRaycaster(this.activeRaycaster)) {
      this.clearAllHovers();
      return;
    }

    // 1. If 3D Expo Map is open, map takes interaction priority
    if (this.expoMap3D && this.expoMap3D.isOpen) {
      const mapHit = this.expoMap3D.evaluateRayIntersection(this.activeRaycaster);

      if (mapHit) {
        if (mapHit.type === 'stall') {
          this.diag.hoveredItemName = `MAP: ${mapHit.dest.name}`;
          this.hoveredItem = { type: 'map-stall', stallId: mapHit.stallId, dest: mapHit.dest };
        } else if (mapHit.type === 'close') {
          this.diag.hoveredItemName = 'MAP: [CLOSE BUTTON]';
          this.hoveredItem = { type: 'map-close' };
        }
      } else {
        this.diag.hoveredItemName = 'NONE';
        this.hoveredItem = null;
      }

      this.processPinchGesture();
      return;
    }

    // 2. If 3D Progress view is active
    if (this.currentView === 'progress' && this.progressReturnBtn) {
      const hits = this.activeRaycaster.intersectObject(this.progressReturnBtn.userData.hitMesh, true);
      if (hits.length > 0) {
        this.diag.hoveredItemName = 'PROGRESS: [RETURN BUTTON]';
        this.hoveredItem = { type: 'progress-return', action: this.progressReturnBtn.userData.hitMesh.userData.action };
      } else {
        this.diag.hoveredItemName = 'NONE';
        this.hoveredItem = null;
      }

      this.processPinchGesture();
      return;
    }

    // 3. If 3D Settings view is active
    if (this.currentView === 'settings') {
      const hits = this.activeRaycaster.intersectObjects(
        [...this.settingsButtons.map(s => s.hitMesh), this.settingsReturnBtn.userData.hitMesh],
        true
      );
      if (hits.length > 0) {
        const h = hits[0].object;
        this.diag.hoveredItemName = h.userData.isReturnBtn ? 'SETTINGS: [RETURN BUTTON]' : 'SETTINGS: OPTION';
        this.hoveredItem = { type: 'settings-option', action: h.userData.action };
      } else {
        this.diag.hoveredItemName = 'NONE';
        this.hoveredItem = null;
      }

      this.processPinchGesture();
      return;
    }

    // 4. Main 3D Arc Menu Buttons
    if (this.isArcMenuVisible && this.menuOpenScale > 0.2) {
      const hits = this.activeRaycaster.intersectObjects(this.allMenuButtonMeshes, true);

      if (hits.length > 0) {
        const topHit = hits[0].object;
        let btnRec = topHit.userData.parentBtnRecord;
        if (!btnRec) {
          btnRec = this.buttons3D.find(b => b.hitMesh === topHit);
        }

        if (btnRec) {
          if (!btnRec.isHovered) {
            this.setButtonHovered(btnRec);
          }
          this.hoveredItem = { type: 'arc-button', btnRec };
          this.diag.hoveredItemName = `3D MENU: ${btnRec.def.label}`;
        }
      } else {
        this.clearButtonHovers();
        this.hoveredItem = null;
        this.diag.hoveredItemName = 'NONE';
      }

      this.processPinchGesture();
      return;
    }

    this.clearAllHovers();
  }

  setButtonHovered(btnRec) {
    this.clearButtonHovers();
    btnRec.isHovered = true;
    soundManager.playClick();

    // Visual reaction: pop out along Z & scale up
    btnRec.group.scale.set(1.15, 1.15, 1.15);
    btnRec.group.position.z = btnRec.homePos.z + 0.015;
    btnRec.bezelMat.color.setHex(0xffffff);
  }

  clearButtonHovers() {
    this.buttons3D.forEach(b => {
      if (b.isHovered) {
        b.isHovered = false;
        b.group.scale.set(1.0, 1.0, 1.0);
        b.group.position.z = b.homePos.z;
        b.bezelMat.color.setHex(b.def.color);
      }
    });
  }

  clearAllHovers() {
    this.clearButtonHovers();
    this.hoveredItem = null;
    this.diag.hoveredItemName = 'NONE';
  }

  /**
   * Pinch Gesture Debouncer & Execution.
   */
  processPinchGesture() {
    const isPinching = this.activeProvider.isPinching();
    const pinchDist = this.activeProvider.getPinchDistance();

    if (this.pinchState === 'READY') {
      if (isPinching) {
        this.pinchState = 'PINCHED';
        this.executeHoveredItem();
      }
    } else if (this.pinchState === 'PINCHED') {
      if (!isPinching || pinchDist > 0.040) {
        this.pinchState = 'READY';
      }
    }
  }

  executeHoveredItem() {
    if (!this.hoveredItem) return;

    soundManager.playClick();

    switch (this.hoveredItem.type) {
      case 'map-stall':
        this.expoMap3D.selectCurrentHovered();
        break;

      case 'map-close':
        this.expoMap3D.close();
        break;

      case 'arc-button':
        if (this.hoveredItem.btnRec && this.hoveredItem.btnRec.action) {
          this.hoveredItem.btnRec.action();
        }
        break;

      case 'progress-return':
      case 'settings-option':
        if (this.hoveredItem.action) {
          this.hoveredItem.action();
        }
        break;
    }
  }

  /**
   * Fallback for VR Controllers: Raycast and select 3D Menu or Map items.
   */
  triggerVRSelect(controller) {
    if (!controller) return false;
    const tempMatrix = new THREE.Matrix4();
    tempMatrix.identity().extractRotation(controller.matrixWorld);
    const ray = new THREE.Raycaster();
    ray.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    ray.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    if (this.expoMap3D && this.expoMap3D.isOpen) {
      const hit = this.expoMap3D.evaluateRayIntersection(ray);
      if (hit) {
        if (hit.type === 'stall') {
          return this.expoMap3D.selectCurrentHovered();
        } else if (hit.type === 'close') {
          this.expoMap3D.close();
          return true;
        }
      }
    }

    if (this.currentView === 'progress' && this.progressReturnBtn) {
      const hits = ray.intersectObject(this.progressReturnBtn.userData.hitMesh, true);
      if (hits.length > 0) {
        this.returnToMainMenu();
        return true;
      }
    }

    if (this.currentView === 'settings') {
      const hits = ray.intersectObjects(
        [...this.settingsButtons.map(s => s.hitMesh), this.settingsReturnBtn.userData.hitMesh],
        true
      );
      if (hits.length > 0) {
        const h = hits[0].object;
        if (h.userData.action) h.userData.action();
        return true;
      }
    }

    if (this.isArcMenuVisible && this.menuOpenScale > 0.2) {
      const hits = ray.intersectObjects(this.buttons3D.map(b => b.hitMesh), true);
      if (hits.length > 0) {
        const top = hits[0].object;
        const btn = this.buttons3D.find(b => b.hitMesh === top);
        if (btn && btn.action) {
          soundManager.playClick();
          btn.action();
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Main Per-Frame Update Loop.
   */
  update(delta) {
    this.activeProvider = this.getActiveProvider();
    this.activeProvider.update(delta);

    const clockTime = performance.now() * 0.001;

    // 1. Evaluate Palm Presentation (Only when Map is not active)
    const isPalmFacing = this.activeProvider.isPalmFacingUser();

    if (this.currentView === 'map' && this.expoMap3D.isOpen) {
      // Map remains pinned stably in space while open!
      this.isArcMenuVisible = false;
    } else {
      if (isPalmFacing) {
        this.palmHoldTimer = Math.min(0.25, this.palmHoldTimer + delta);
        if (this.palmHoldTimer > 0.06) {
          this.isArcMenuVisible = true;
        }
      } else {
        this.palmHoldTimer = Math.max(-0.15, this.palmHoldTimer - delta);
        if (this.palmHoldTimer < 0.0) {
          this.isArcMenuVisible = false;
        }
      }
    }

    // 2. Smooth Scale & Anchor of 3D Arc Menu
    const targetScale = this.isArcMenuVisible ? 1.0 : 0.0;
    this.menuOpenScale = THREE.MathUtils.lerp(this.menuOpenScale, targetScale, Math.min(1.0, delta * 15.0));

    if (this.menuOpenScale > 0.01) {
      this.arcMenuGroup.visible = true;
      this.arcMenuGroup.scale.setScalar(this.menuOpenScale);

      if (this.activeProvider.getPalmPose(this.palmPos, this.palmNormal, this.palmUp)) {
        if (this.activeProvider === this.pcProvider) {
          // PC Mode: Anchor ~38cm in front of camera
          const camPos = new THREE.Vector3();
          const camDir = new THREE.Vector3();
          this.camera.getWorldPosition(camPos);
          this.camera.getWorldDirection(camDir);

          this.targetMenuPos.copy(camPos)
            .addScaledVector(camDir, 0.40)
            .add(new THREE.Vector3(-0.02, -0.04, 0).applyQuaternion(this.camera.quaternion));

          this.arcMenuGroup.position.lerp(this.targetMenuPos, Math.min(1.0, delta * 20.0));
          this.arcMenuGroup.quaternion.copy(this.camera.quaternion);
        } else {
          // WebXR Mode: Hover ~9cm above left palm
          this.targetMenuPos.copy(this.palmPos)
            .addScaledVector(this.palmNormal, 0.09)
            .addScaledVector(this.palmUp, 0.02);

          this.arcMenuGroup.position.lerp(this.targetMenuPos, Math.min(1.0, delta * 20.0));
          this.arcMenuGroup.lookAt(this.camera.position);
        }
      }

      if (this.emitterRing) {
        this.emitterRing.rotation.z += delta * 1.5;
      }
    } else {
      this.arcMenuGroup.visible = false;
    }

    // 3. Update Subsystems
    const userPosX = this.renderer.xr.isPresenting && this.userGroup ? this.userGroup.position.x : this.camera.position.x;
    const userPosZ = this.renderer.xr.isPresenting && this.userGroup ? this.userGroup.position.z : this.camera.position.z;

    if (this.expoMap3D) {
      this.expoMap3D.update(delta, clockTime, userPosX, userPosZ);
    }

    if (this.teleportManager) {
      this.teleportManager.update(delta);
    }

    // 4. Update 3D Progress / Settings Anchor if open
    if (this.currentView === 'progress' && this.progressGroup.visible) {
      this.anchorSubView(this.progressGroup, delta);
    }
    if (this.currentView === 'settings' && this.settingsGroup.visible) {
      this.anchorSubView(this.settingsGroup, delta);
    }

    // 5. Icon Micro-Animations
    this.menuAnimatables.forEach(item => {
      if (item.axis === 'z') item.mesh.rotation.z += delta * item.rotSpeed;
      else item.mesh.rotation.y += delta * item.rotSpeed;
    });

    // 6. Raycast Hover & Pinch Selection
    this.evaluateRayHoverAndPinch(delta);

    // 7. Update HUD Telemetry
    this.updateDesktopOnScreenHUD();
  }

  anchorSubView(viewGroup, delta) {
    const camPos = new THREE.Vector3();
    const camDir = new THREE.Vector3();
    this.camera.getWorldPosition(camPos);
    this.camera.getWorldDirection(camDir);

    const pos = camPos.clone().addScaledVector(camDir, 0.50).add(new THREE.Vector3(0, -0.10, 0));
    viewGroup.position.lerp(pos, Math.min(1.0, delta * 15.0));
    viewGroup.lookAt(camPos.x, viewGroup.position.y, camPos.z);
    viewGroup.rotation.x += 0.35; // Tilt towards eye
    viewGroup.scale.set(1, 1, 1);
  }

  updateDesktopOnScreenHUD() {
    if (!this.desktopHudEl) return;

    if (this.renderer.xr.isPresenting) {
      this.desktopHudEl.style.display = 'none';
      return;
    }

    this.desktopHudEl.style.display = 'block';
    const t = this.activeProvider.getDiagnostics();

    this.desktopHudEl.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #00d2ff; padding-bottom:6px; margin-bottom:8px;">
        <span style="background:#e2231a; color:#fff; font-weight:bold; padding:2px 8px; border-radius:4px; font-size:11px;">LENOVO</span>
        <span style="color:#00d2ff; font-weight:bold; font-size:12px;">3D HAND UI // ACTIVE</span>
      </div>
      <div style="line-height:1.6; font-size:12px;">
        <div><strong>View Mode:</strong> <span style="color:#00ff96; font-weight:bold;">${this.currentView.toUpperCase()} ${this.expoMap3D?.isOpen ? '(3D MINIATURE EXPO EXPANDED)' : ''}</span></div>
        <div><strong>Hand Tracking:</strong> <span style="color:#00ff96;">${t.handTracking}</span></div>
        <div><strong>Palm Menu (M):</strong> <span style="color:${t.palmFacing ? '#00ff96' : '#ff5252'};">${t.palmFacing ? 'OPEN' : 'CLOSED [Press M]'}</span></div>
        <div><strong>Pinch (P / Click):</strong> <span style="color:${t.pinching ? '#00ff96' : '#cfd8dc'};">${t.pinching ? 'YES (PINCHED)' : 'NO'}</span></div>
        <div><strong>Highlighted 3D Target:</strong> <span style="color:#ffb300; font-weight:bold;">${this.diag.hoveredItemName}</span></div>
      </div>
      <div style="margin-top:8px; padding-top:6px; border-top:1px solid rgba(255,255,255,0.15); font-size:11px; color:#90a4ae;">
        ⌨️ <strong>Keys:</strong> [M] Palm Menu • [Click / P] Pinch • [H] Hand • [ESC] Close
      </div>
    `;
  }
}
