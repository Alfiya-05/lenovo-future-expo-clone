/**
 * Lenovo Future Expo - VR World-Space Options Menu
 */
import * as THREE from 'three';
import { soundManager } from '../audio.js';
import { progressManager } from '../progress.js';
import { guidanceSystem } from '../guidance.js';

export class VRMenu {
  constructor(scene, camera, interactionManager, locomotionManager) {
    this.scene = scene;
    this.camera = camera;
    this.interactionManager = interactionManager;
    this.locomotionManager = locomotionManager;

    this.menuGroup = new THREE.Group();
    this.menuGroup.name = "VR_Options_Menu";
    this.menuGroup.visible = false;
    this.scene.add(this.menuGroup);

    this.initMenu();
  }

  initMenu() {
    // Menu Background Panel
    const panelGeo = new THREE.PlaneGeometry(1.6, 1.4);
    const panelMat = new THREE.MeshBasicMaterial({
      color: 0x0c121a,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.94
    });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    this.menuGroup.add(panel);

    // Title Canvas
    const titleCanvas = document.createElement('canvas');
    titleCanvas.width = 512;
    titleCanvas.height = 128;
    const ctx = titleCanvas.getContext('2d');
    ctx.fillStyle = '#e2231a';
    ctx.fillRect(10, 10, 140, 40);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Lenovo', 35, 38);
    ctx.fillStyle = '#00d2ff';
    ctx.font = 'bold 28px Arial';
    ctx.fillText('VR OPTIONS MENU', 170, 38);

    const titleTex = new THREE.CanvasTexture(titleCanvas);
    const titleMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.4, 0.35),
      new THREE.MeshBasicMaterial({ map: titleTex, transparent: true, side: THREE.DoubleSide })
    );
    titleMesh.position.set(0, 0.48, 0.02);
    this.menuGroup.add(titleMesh);

    // 1. Resume Button
    const resumeBtn = this.interactionManager.createWorldButton("RESUME EXPO", 1.2, 0.22, () => {
      this.toggle();
    }, "#00d2ff");
    resumeBtn.position.set(0, 0.22, 0.02);
    this.menuGroup.add(resumeBtn);

    // 2. Restart from Entrance Button
    const restartBtn = this.interactionManager.createWorldButton("TELEPORT TO ENTRANCE", 1.2, 0.22, () => {
      this.locomotionManager.teleportTo(0, 21.0);
      guidanceSystem.showGuidance("Teleported to Entrance.");
      this.toggle();
    }, "#ffb300");
    restartBtn.position.set(0, -0.05, 0.02);
    this.menuGroup.add(restartBtn);

    // 3. Reset All Progress Button
    const resetBtn = this.interactionManager.createWorldButton("RESET ALL PROGRESS", 1.2, 0.22, () => {
      progressManager.reset();
      guidanceSystem.showGuidance("All expo progress reset.");
      this.toggle();
    }, "#e2231a");
    resetBtn.position.set(0, -0.32, 0.02);
    this.menuGroup.add(resetBtn);

    // 4. Mute Audio Button
    let isMuted = false;
    const muteBtn = this.interactionManager.createWorldButton("TOGGLE MUTE AUDIO", 1.2, 0.22, () => {
      isMuted = soundManager.toggleMute();
      guidanceSystem.showGuidance(isMuted ? "Audio Muted." : "Audio Unmuted.");
    }, "#9c27b0");
    muteBtn.position.set(0, -0.58, 0.02);
    this.menuGroup.add(muteBtn);
  }

  toggle() {
    this.menuGroup.visible = !this.menuGroup.visible;
    if (this.menuGroup.visible) {
      soundManager.playClick();
      // Position menu directly in front of camera
      const dir = new THREE.Vector3();
      this.camera.getWorldDirection(dir);
      this.menuGroup.position.copy(this.camera.position).add(dir.multiplyScalar(2.0));
      this.menuGroup.lookAt(this.camera.position);
    }
  }
}
