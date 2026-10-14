/**
 * Stall 5: Lenovo XR - Spatial Computing Simulation (XR-within-VR)
 */
import * as THREE from 'three';
import { progressManager, STAGES } from '../progress.js';
import { guidanceSystem } from '../guidance.js';
import { soundManager } from '../audio.js';

export function setupLenovoXR(scene, interactionManager) {
  const xrGroup = new THREE.Group();
  xrGroup.name = "XR_Interactive_System";
  xrGroup.position.set(-8.0, 0, -8.5);

  let isSpatialModeActive = false;
  const spatialElements = new THREE.Group();
  spatialElements.visible = false;
  xrGroup.add(spatialElements);

  // 1. Floating Holographic Spatial Rings & Windows
  const ring1 = new THREE.Mesh(
    new THREE.TorusGeometry(1.4, 0.02, 16, 64),
    new THREE.MeshBasicMaterial({ color: 0xb388ff, wireframe: true })
  );
  ring1.position.set(0, 1.8, 0);
  spatialElements.add(ring1);

  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(0.9, 0.02, 16, 64),
    new THREE.MeshBasicMaterial({ color: 0x00d2ff, wireframe: true })
  );
  ring2.position.set(0, 1.8, 0);
  ring2.rotation.x = Math.PI * 0.35;
  spatialElements.add(ring2);

  // Floating Spatial Window 1 (Left)
  const win1 = new THREE.Mesh(
    new THREE.PlaneGeometry(0.8, 0.6),
    new THREE.MeshBasicMaterial({ color: 0x1a237e, transparent: true, opacity: 0.85, side: THREE.DoubleSide })
  );
  win1.position.set(-1.2, 1.9, 0.4);
  win1.rotation.y = Math.PI * 0.25;
  spatialElements.add(win1);

  // Floating Spatial Window 2 (Right)
  const win2 = new THREE.Mesh(
    new THREE.PlaneGeometry(0.8, 0.6),
    new THREE.MeshBasicMaterial({ color: 0x4a148c, transparent: true, opacity: 0.85, side: THREE.DoubleSide })
  );
  win2.position.set(1.2, 1.9, 0.4);
  win2.rotation.y = -Math.PI * 0.25;
  spatialElements.add(win2);

  // Interactive 3D Spatial Holographic Globe/Atom in Center
  const coreHolo = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.28, 2),
    new THREE.MeshBasicMaterial({ color: 0x00e5ff, wireframe: true })
  );
  coreHolo.position.set(0, 1.8, 0);
  spatialElements.add(coreHolo);

  // Status HUD Canvas
  const hudCanvas = document.createElement('canvas');
  hudCanvas.width = 1024;
  hudCanvas.height = 512;
  const hudTexture = new THREE.CanvasTexture(hudCanvas);

  let statusMsg = "EXPERIENCE SPATIAL COMPUTING // 6DoF READY";

  const renderHUD = () => {
    const ctx = hudCanvas.getContext('2d');
    ctx.clearRect(0, 0, 1024, 512);

    ctx.fillStyle = 'rgba(18, 10, 30, 0.94)';
    ctx.fillRect(10, 10, 1004, 492);
    ctx.strokeStyle = '#b388ff';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, 1004, 492);

    ctx.fillStyle = '#b388ff';
    ctx.font = 'bold 34px Arial';
    ctx.fillText('LENOVO XR // SPATIAL COMPUTING', 40, 70);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(statusMsg, 40, 140);

    ctx.fillStyle = '#b0bec5';
    ctx.font = '22px Arial';
    ctx.fillText('• 4K Micro-OLED Per Eye: Retinal Pixel Density', 40, 210);
    ctx.fillText('• Sub-Millimeter Spatial Hand Tracking & 6DoF Passthrough', 40, 250);
    ctx.fillText('• Infinite Virtual Multi-Screen Spatial Canvas', 40, 290);

    hudTexture.needsUpdate = true;
  };

  renderHUD();

  const hudMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2.0, 1.0),
    new THREE.MeshBasicMaterial({ map: hudTexture, transparent: true, side: THREE.DoubleSide })
  );
  hudMesh.position.set(0, 2.4, -0.6);
  xrGroup.add(hudMesh);

  // Button to Launch Spatial Simulation
  const activateXRBtn = interactionManager.createWorldButton(
    "ACTIVATE SPATIAL MODE",
    1.4,
    0.35,
    () => {
      soundManager.playXRActivate();
      isSpatialModeActive = !isSpatialModeActive;
      spatialElements.visible = isSpatialModeActive;

      statusMsg = isSpatialModeActive
        ? "SPATIAL COMPUTING ACTIVE: Virtual Screens Spawned in 360°"
        : "SPATIAL MODE STANDBY";
      renderHUD();

      if (isSpatialModeActive) {
        progressManager.completeStage(STAGES.XR);
        guidanceSystem.showGuidance(
          "Lenovo XR Spatial Demo Active! Head to the grand finale at the Lenovo Future Lab.",
          new THREE.Vector3(0, 1.2, -18.5)
        );
      }
    },
    "#b388ff"
  );
  activateXRBtn.position.set(0, 1.15, 0.4);
  xrGroup.add(activateXRBtn);

  // Register interactive click on central spatial globe
  interactionManager.registerInteractable(coreHolo, () => {
    soundManager.playAIChime();
    coreHolo.scale.multiplyScalar(1.2);
    setTimeout(() => coreHolo.scale.set(1, 1, 1), 300);
  });

  scene.add(xrGroup);

  return {
    update: (time) => {
      if (spatialElements.visible) {
        ring1.rotation.z += 0.015;
        ring2.rotation.y += 0.02;
        coreHolo.rotation.y += 0.03;
        coreHolo.rotation.x += 0.01;
      }
    }
  };
}
