/**
 * Stall 0: Entrance Experience & Holographic Assistant
 */
import * as THREE from 'three';
import { progressManager, STAGES } from '../progress.js';
import { guidanceSystem } from '../guidance.js';
import { soundManager } from '../audio.js';

export function setupEntranceExperience(scene, interactionManager) {
  const entranceGroup = new THREE.Group();
  entranceGroup.name = "Entrance_Interactive_System";
  entranceGroup.position.set(0, 0, 20.5);

  // 1. Holographic Virtual Guide Assistant (Animated stylized 3D hologram)
  const holoGeo = new THREE.CylinderGeometry(0.35, 0.45, 1.8, 16);
  const holoMat = new THREE.MeshBasicMaterial({
    color: 0x00d2ff,
    wireframe: true,
    transparent: true,
    opacity: 0.75
  });
  const holoAvatar = new THREE.Mesh(holoGeo, holoMat);
  holoAvatar.position.set(0, 1.1, 0);
  entranceGroup.add(holoAvatar);

  // Glowing base ring beneath hologram
  const ringGeo = new THREE.RingGeometry(0.5, 0.65, 32);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x00d2ff, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.05;
  entranceGroup.add(ring);

  // 2. Interactive "START TOUR" 3D Button
  const startBtn = interactionManager.createWorldButton(
    "START TOUR",
    1.4,
    0.45,
    () => {
      soundManager.playAIChime();
      guidanceSystem.showGuidance(
        "Welcome to Lenovo Future Expo! Explore Zone 01: Legion Gaming on your left or Zone 02: Lenovo AI PC on your right.",
        new THREE.Vector3(8.0, 1.2, 13.8)
      );
      progressManager.completeStage(STAGES.ENTRANCE);
      startBtn.visible = false;
    },
    "#e2231a"
  );
  startBtn.position.set(0, 0.9, -0.8);
  entranceGroup.add(startBtn);

  scene.add(entranceGroup);

  return {
    update: (time) => {
      if (holoAvatar) {
        holoAvatar.rotation.y += 0.015;
        holoAvatar.position.y = 1.1 + Math.sin(time * 2.5) * 0.05;
      }
    }
  };
}
