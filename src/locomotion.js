/**
 * Lenovo Future Expo - Authoritative Locomotion System [BUILD: SMOOTH-001]
 *
 * Exclusively provides:
 *  - Primary: Continuous smooth camera-relative VR joystick movement on Left Quest Controller
 *  - Primary: Comfort 45° snap turning on Right Quest Controller
 *  - In-VR Real-Time Diagnostics HUD showing live raw controller axes & locomotion state
 *  - Desktop WASD + PointerLock preview
 *  - ZERO joystick-triggered teleportation
 */
import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

export const LOCOMOTION_CONFIG = {
  BUILD_ID: 'SMOOTH-001',
  WALK_SPEED: 1.8,            // Walking speed (1.5 - 2.0 m/s)
  SPRINT_MULTIPLIER: 1.6,     // Sprint multiplier when stick is pressed
  JOYSTICK_DEADZONE: 0.12,    // Low deadzone to prevent drift while ensuring responsive response
  ACCELERATION: 9.0,          // Rapid, smooth acceleration
  DECELERATION: 11.0,         // Clean deceleration on stick release
  SNAP_TURN_ANGLE: Math.PI / 4, // 45-degree snap turn
  SNAP_COOLDOWN: 0.25,        // 250ms snap turn cooldown
  PLAYER_RADIUS: 0.35         // Collision cylinder radius
};

export class LocomotionManager {
  constructor(scene, camera, renderer, userGroup) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.userGroup = userGroup; // VR Rig / Camera Parent

    // VR Smooth Locomotion State
    this.vrVelocity = new THREE.Vector3();
    this.targetVelocity = new THREE.Vector3();
    this.moveVector = new THREE.Vector3();
    this.cameraForward = new THREE.Vector3();
    this.cameraRight = new THREE.Vector3();
    this.worldUp = new THREE.Vector3(0, 1, 0);

    // VR Snap Turning State
    this.canSnapTurn = true;
    this.snapCooldownTimer = 0;

    // Live Diagnostics State for In-VR HUD
    this.diagState = {
      build: LOCOMOTION_CONFIG.BUILD_ID,
      leftDetected: false,
      rightDetected: false,
      leftRawAxes: [0, 0, 0, 0],
      rightRawAxes: [0, 0, 0, 0],
      leftStickStatus: 'IDLE',
      rightStickStatus: 'IDLE',
      currentSpeed: 0,
      teleportStatus: 'DISABLED (0 calls)',
      locomotionMode: 'SMOOTH JOYSTICK ONLY'
    };

    // Outer Hall Boundaries (48m x 28m) + Grand Entrance Zone
    this.hallBounds = {
      minX: -12.5,
      maxX: 12.5,
      minZ: -23.0,
      maxZ: 29.5
    };

    // Major Booth Obstacle Boxes [minX, maxX, minZ, maxZ]
    this.obstacleBoxes = [
      { minX: -10.5, maxX: -6.5, minZ: 12.0, maxZ: 15.5 }, // Legion Gaming
      { minX: 6.5, maxX: 10.5, minZ: 12.0, maxZ: 15.5 },  // AI PC
      { minX: -10.5, maxX: -6.5, minZ: 1.0, maxZ: 4.5 },   // Adaptive Computing
      { minX: 6.5, maxX: 10.5, minZ: 1.0, maxZ: 4.5 },    // Personal AI
      { minX: -10.5, maxX: -6.5, minZ: -10.0, maxZ: -6.5 },     // Lenovo XR
      { minX: -3.5, maxX: 3.5, minZ: -20.5, maxZ: -16.5 }      // Future Lab Core
    ];

    // Desktop WASD Controls
    this.desktopControls = null;
    this.moveState = { forward: false, backward: false, left: false, right: false, sprint: false };
    this.desktopVelocity = new THREE.Vector3();
    this.desktopDirection = new THREE.Vector3();

    // Create the In-VR Real-Time Diagnostics HUD
    this.initVRDiagnosticsHUD();
    this.initDesktopControls();
  }

  /**
   * Builds an in-VR floating Diagnostics HUD showing live raw controller axes & movement state.
   */
  initVRDiagnosticsHUD() {
    this.diagCanvas = document.createElement('canvas');
    this.diagCanvas.width = 1024;
    this.diagCanvas.height = 640;
    this.diagCtx = this.diagCanvas.getContext('2d');
    this.diagTexture = new THREE.CanvasTexture(this.diagCanvas);

    const hudGeo = new THREE.PlaneGeometry(1.2, 0.75);
    const hudMat = new THREE.MeshBasicMaterial({
      map: this.diagTexture,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide
    });

    this.vrHudMesh = new THREE.Mesh(hudGeo, hudMat);
    this.vrHudMesh.name = "VR_Locomotion_Diagnostics_HUD";
    // Place floating at lower-left relative to user rig
    this.vrHudMesh.position.set(-0.75, 0.85, -1.6);
    this.vrHudMesh.rotation.y = 0.25;
    this.userGroup.add(this.vrHudMesh);

    this.renderVRDiagnosticsHUD();
  }

  /**
   * Renders the in-VR diagnostics texture with real-time controller data.
   */
  renderVRDiagnosticsHUD() {
    if (!this.diagCtx) return;
    const ctx = this.diagCtx;

    ctx.clearRect(0, 0, 1024, 640);

    // Dark HUD panel background
    ctx.fillStyle = 'rgba(10, 16, 26, 0.95)';
    ctx.fillRect(8, 8, 1008, 624);

    // Border
    ctx.strokeStyle = '#00d2ff';
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, 1008, 624);

    // Header badge
    ctx.fillStyle = '#e2231a';
    ctx.fillRect(30, 30, 160, 44);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px Arial';
    ctx.fillText('Lenovo', 55, 62);

    ctx.fillStyle = '#00d2ff';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(`VR LOCOMOTION DIAGNOSTICS [BUILD: ${this.diagState.build}]`, 210, 62);

    ctx.strokeStyle = 'rgba(0, 210, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(30, 95);
    ctx.lineTo(994, 95);
    ctx.stroke();

    // Mode Status
    ctx.fillStyle = '#00ff96';
    ctx.font = 'bold 26px Arial';
    ctx.fillText(`▶ ACTIVE LOCOMOTION: ${this.diagState.locomotionMode}`, 30, 140);

    ctx.fillStyle = '#ffb300';
    ctx.font = 'bold 22px Arial';
    ctx.fillText(`• Teleportation System: ${this.diagState.teleportStatus}`, 30, 180);

    // Left Controller
    ctx.fillStyle = this.diagState.leftDetected ? '#00ff96' : '#ff5252';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Left Controller: ${this.diagState.leftDetected ? '✓ CONNECTED' : '✗ NOT DETECTED'} (Handedness: left)`, 30, 230);

    ctx.fillStyle = '#cfd8dc';
    ctx.font = '22px Arial';
    const leftAxesStr = this.diagState.leftRawAxes.map(v => v.toFixed(2)).join(', ');
    ctx.fillText(`  Raw Axes [0, 1, 2, 3]: [ ${leftAxesStr} ]`, 30, 265);

    ctx.fillStyle = '#00d2ff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`  Left Stick Action: ${this.diagState.leftStickStatus}`, 30, 305);

    // Right Controller
    ctx.fillStyle = this.diagState.rightDetected ? '#00ff96' : '#ff5252';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Right Controller: ${this.diagState.rightDetected ? '✓ CONNECTED' : '✗ NOT DETECTED'} (Handedness: right)`, 30, 360);

    ctx.fillStyle = '#cfd8dc';
    ctx.font = '22px Arial';
    const rightAxesStr = this.diagState.rightRawAxes.map(v => v.toFixed(2)).join(', ');
    ctx.fillText(`  Raw Axes [0, 1, 2, 3]: [ ${rightAxesStr} ]`, 30, 395);

    ctx.fillStyle = '#ffb300';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`  Right Stick Action: ${this.diagState.rightStickStatus}`, 30, 435);

    // Real-Time Speed & Position
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Avatar Speed: ${this.diagState.currentSpeed.toFixed(2)} m/s (Walk: ${LOCOMOTION_CONFIG.WALK_SPEED} m/s)`, 30, 490);

    if (this.userGroup) {
      ctx.fillStyle = '#90a4ae';
      ctx.font = '20px Arial';
      ctx.fillText(`Position: X=${this.userGroup.position.x.toFixed(2)}, Z=${this.userGroup.position.z.toFixed(2)} (Floor Locked Y=0)`, 30, 525);
    }

    ctx.fillStyle = '#00ff96';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`Push LEFT STICK Forward/Back/Left/Right to Walk Smoothly`, 30, 580);

    this.diagTexture.needsUpdate = true;
  }

  initDesktopControls() {
    this.desktopControls = new PointerLockControls(this.camera, document.body);

    const onKeyDown = (event) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.moveState.forward = true;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.moveState.left = true;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.moveState.backward = true;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.moveState.right = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.moveState.sprint = true;
          break;
        case 'KeyQ':
          this.snapTurn(1);
          break;
        case 'KeyE':
          this.snapTurn(-1);
          break;
      }
    };

    const onKeyUp = (event) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          this.moveState.forward = false;
          break;
        case 'KeyA':
        case 'ArrowLeft':
          this.moveState.left = false;
          break;
        case 'KeyS':
        case 'ArrowDown':
          this.moveState.backward = false;
          break;
        case 'KeyD':
        case 'ArrowRight':
          this.moveState.right = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this.moveState.sprint = false;
          break;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
  }

  /**
   * Performs comfortable snap turning around the Y axis on the VR rig / camera parent.
   */
  snapTurn(direction) {
    if (this.userGroup) {
      this.userGroup.rotation.y += LOCOMOTION_CONFIG.SNAP_TURN_ANGLE * direction;
    }
  }

  /**
   * Checks if a 2D world position (X, Z) is within hall bounds and not colliding with solid booth obstacles.
   */
  isValidPosition(x, z) {
    const r = LOCOMOTION_CONFIG.PLAYER_RADIUS;

    // Check outer hall boundary
    if (
      x - r < this.hallBounds.minX ||
      x + r > this.hallBounds.maxX ||
      z - r < this.hallBounds.minZ ||
      z + r > this.hallBounds.maxZ
    ) {
      return false;
    }

    // Check solid booth obstacles
    for (const box of this.obstacleBoxes) {
      if (
        x + r > box.minX &&
        x - r < box.maxX &&
        z + r > box.minZ &&
        z - r < box.maxZ
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Robust Thumbstick Axis Extractor.
   * Handles WebXR standard axes [2, 3] and fallback axes [0, 1].
   */
  extractThumbstick(gamepad) {
    if (!gamepad || !gamepad.axes) return { x: 0, y: 0, raw: [0, 0, 0, 0] };

    const raw = Array.from(gamepad.axes || []).map(v => Number(v.toFixed(3)));
    while (raw.length < 4) raw.push(0);

    let x = 0;
    let y = 0;

    // Check axes 2 & 3 first (Standard Oculus Touch mapping for thumbstick)
    const mag23 = Math.hypot(gamepad.axes[2] || 0, gamepad.axes[3] || 0);
    const mag01 = Math.hypot(gamepad.axes[0] || 0, gamepad.axes[1] || 0);

    if (mag23 >= mag01 && mag23 > LOCOMOTION_CONFIG.JOYSTICK_DEADZONE) {
      x = gamepad.axes[2] || 0;
      y = gamepad.axes[3] || 0;
    } else if (mag01 > LOCOMOTION_CONFIG.JOYSTICK_DEADZONE) {
      x = gamepad.axes[0] || 0;
      y = gamepad.axes[1] || 0;
    }

    // Apply deadzone threshold
    if (Math.abs(x) < LOCOMOTION_CONFIG.JOYSTICK_DEADZONE) x = 0;
    if (Math.abs(y) < LOCOMOTION_CONFIG.JOYSTICK_DEADZONE) y = 0;

    return { x, y, raw };
  }

  /**
   * Main WebXR Controller Input Handler:
   *  - Left Controller: ONLY Continuous Smooth Locomotion (Forward/Back + Strafe)
   *  - Right Controller: ONLY 45° Snap Turning
   *  - ZERO Teleportation
   */
  updateVRInput(inputSources, delta) {
    if (!inputSources || inputSources.length === 0) {
      this.diagState.leftDetected = false;
      this.diagState.rightDetected = false;
      return;
    }

    let leftStickX = 0;
    let leftStickY = 0;
    let rightTurnX = 0;
    let sprintActive = false;

    this.diagState.leftDetected = false;
    this.diagState.rightDetected = false;

    for (const source of inputSources) {
      const gp = source.gamepad;
      if (!gp) continue;

      const { x, y, raw } = this.extractThumbstick(gp);

      if (source.handedness === 'left') {
        this.diagState.leftDetected = true;
        this.diagState.leftRawAxes = raw;
        leftStickX = x;
        leftStickY = y;

        // Stick click sprint (button 3)
        if (gp.buttons && gp.buttons[3] && gp.buttons[3].pressed) {
          sprintActive = true;
        }
      } else if (source.handedness === 'right') {
        this.diagState.rightDetected = true;
        this.diagState.rightRawAxes = raw;
        rightTurnX = x;
      }
    }

    // 1. Process Right Stick Snap Turning
    if (this.snapCooldownTimer > 0) {
      this.snapCooldownTimer -= delta;
    }

    if (Math.abs(rightTurnX) > 0.55) {
      if (this.canSnapTurn && this.snapCooldownTimer <= 0) {
        // rightTurnX > 0 -> turn right (clockwise -1)
        // rightTurnX < 0 -> turn left (counter-clockwise +1)
        const dir = rightTurnX > 0 ? -1 : 1;
        this.snapTurn(dir);
        this.canSnapTurn = false;
        this.snapCooldownTimer = LOCOMOTION_CONFIG.SNAP_COOLDOWN;
        this.diagState.rightStickStatus = `SNAP TURN (${dir < 0 ? 'Right -45°' : 'Left +45°'})`;
      }
    } else if (Math.abs(rightTurnX) < 0.2) {
      this.canSnapTurn = true;
      this.diagState.rightStickStatus = 'IDLE (Neutral)';
    }

    // 2. Process Left Stick Smooth Locomotion (Camera-Relative)
    this.targetVelocity.set(0, 0, 0);

    if (leftStickX !== 0 || leftStickY !== 0) {
      // Get horizontal camera forward direction
      this.camera.getWorldDirection(this.cameraForward);
      this.cameraForward.y = 0;
      this.cameraForward.normalize();

      // Get horizontal camera right direction
      this.cameraRight.crossVectors(this.cameraForward, this.worldUp).normalize();

      // Calculate camera-relative movement vector
      this.moveVector.set(0, 0, 0);
      this.moveVector.addScaledVector(this.cameraForward, -leftStickY); // -leftStickY: -1 stick is forward
      this.moveVector.addScaledVector(this.cameraRight, leftStickX);   // +leftStickX: +1 stick is right

      if (this.moveVector.lengthSq() > 1.0) {
        this.moveVector.normalize();
      }

      const speed = LOCOMOTION_CONFIG.WALK_SPEED * (sprintActive ? LOCOMOTION_CONFIG.SPRINT_MULTIPLIER : 1.0);
      this.targetVelocity.copy(this.moveVector).multiplyScalar(speed);

      const fwdVal = -leftStickY;
      const strVal = leftStickX;
      this.diagState.leftStickStatus = `LEFT STICK → SMOOTH MOVE (Fwd: ${fwdVal > 0 ? '+' : ''}${fwdVal.toFixed(2)}, Strafe: ${strVal > 0 ? '+' : ''}${strVal.toFixed(2)})`;
    } else {
      this.diagState.leftStickStatus = 'IDLE (Neutral)';
    }

    this.diagState.currentSpeed = this.vrVelocity.length();
    this.renderVRDiagnosticsHUD();
  }

  /**
   * Physics & Velocity integration update each frame.
   */
  update(delta) {
    // 1. VR Smooth Locomotion Integration
    if (this.renderer.xr.isPresenting && this.userGroup) {
      const isMoving = this.targetVelocity.lengthSq() > 0.001;
      const rate = isMoving ? LOCOMOTION_CONFIG.ACCELERATION : LOCOMOTION_CONFIG.DECELERATION;
      this.vrVelocity.lerp(this.targetVelocity, Math.min(1.0, rate * delta));

      if (this.vrVelocity.lengthSq() > 0.0001) {
        const displacement = this.vrVelocity.clone().multiplyScalar(delta);

        const currentX = this.userGroup.position.x;
        const currentZ = this.userGroup.position.z;
        const nextX = currentX + displacement.x;
        const nextZ = currentZ + displacement.z;

        // Independent axis movement for smooth wall sliding
        if (this.isValidPosition(nextX, currentZ)) {
          this.userGroup.position.x = nextX;
        }
        if (this.isValidPosition(this.userGroup.position.x, nextZ)) {
          this.userGroup.position.z = nextZ;
        }

        // Lock vertical axis to floor level
        this.userGroup.position.y = 0;
      }
    }

    // 2. Desktop WASD Locomotion
    if (this.desktopControls && this.desktopControls.isLocked) {
      this.desktopVelocity.x -= this.desktopVelocity.x * 10.0 * delta;
      this.desktopVelocity.z -= this.desktopVelocity.z * 10.0 * delta;

      this.desktopDirection.z = Number(this.moveState.forward) - Number(this.moveState.backward);
      this.desktopDirection.x = Number(this.moveState.right) - Number(this.moveState.left);
      this.desktopDirection.normalize();

      const speed = this.moveState.sprint ? 9.0 : 4.5;
      if (this.moveState.forward || this.moveState.backward) {
        this.desktopVelocity.z -= this.desktopDirection.z * speed * 10.0 * delta;
      }
      if (this.moveState.left || this.moveState.right) {
        this.desktopVelocity.x -= this.desktopDirection.x * speed * 10.0 * delta;
      }

      this.desktopControls.moveRight(-this.desktopVelocity.x * delta);
      this.desktopControls.moveForward(-this.desktopVelocity.z * delta);

      this.camera.position.x = Math.max(this.hallBounds.minX, Math.min(this.hallBounds.maxX, this.camera.position.x));
      this.camera.position.z = Math.max(this.hallBounds.minZ, Math.min(this.hallBounds.maxZ, this.camera.position.z));
      this.camera.position.y = 1.70;
    }
  }

  teleportTo(x, z) {
    if (this.userGroup) {
      this.userGroup.position.set(x, 0, z);
    }
    if (this.camera && (!this.renderer || !this.renderer.xr || !this.renderer.xr.isPresenting)) {
      this.camera.position.set(x, 1.70, z);
    }
  }
}


