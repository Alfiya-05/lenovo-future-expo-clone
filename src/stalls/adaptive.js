/**
 * Stall 3: Adaptive Computing - 4 Modes (Work, Creative, Gaming, Mobile)
 */
import * as THREE from 'three';
import { progressManager, STAGES } from '../progress.js';
import { guidanceSystem } from '../guidance.js';
import { soundManager } from '../audio.js';

export function setupAdaptiveComputing(scene, interactionManager) {
  const adaptiveGroup = new THREE.Group();
  adaptiveGroup.name = "Adaptive_Interactive_System";
  adaptiveGroup.position.set(-8.0, 0, 2.5);

  let currentMode = "WORK";
  const modes = ["WORK", "CREATIVE", "GAMING", "MOBILE"];

  // Central showcase transformable 3D display model
  const morphModelGroup = new THREE.Group();
  morphModelGroup.position.set(0, 1.35, -0.6);

  const screenBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.02, 0.35),
    new THREE.MeshStandardMaterial({ color: 0x141820, metalness: 0.8, roughness: 0.2 })
  );
  morphModelGroup.add(screenBase);

  const screenHinge = new THREE.Group();
  screenHinge.position.set(0, 0.01, -0.16);

  const screenDisplay = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.35, 0.012),
    new THREE.MeshStandardMaterial({ color: 0x00d2ff, roughness: 0.1, emissive: 0x004466, emissiveIntensity: 0.6 })
  );
  screenDisplay.position.set(0, 0.175, 0);
  screenHinge.add(screenDisplay);
  morphModelGroup.add(screenHinge);

  adaptiveGroup.add(morphModelGroup);

  // Status HUD Canvas
  const hudCanvas = document.createElement('canvas');
  hudCanvas.width = 1024;
  hudCanvas.height = 512;
  const hudTexture = new THREE.CanvasTexture(hudCanvas);

  const renderHUD = () => {
    const ctx = hudCanvas.getContext('2d');
    ctx.clearRect(0, 0, 1024, 512);

    ctx.fillStyle = 'rgba(10, 18, 28, 0.94)';
    ctx.fillRect(10, 10, 1004, 492);
    ctx.strokeStyle = '#ffb300';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, 1004, 492);

    ctx.fillStyle = '#ffb300';
    ctx.font = 'bold 34px Arial';
    ctx.fillText('ADAPTIVE COMPUTING // MULTI-MODE MATRIX', 40, 70);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px Arial';
    ctx.fillText(`CURRENT FORM FACTOR: [ ${currentMode} MODE ]`, 40, 140);

    const descriptions = {
      WORK: "• Traditional Ultrabook Form: 105° Viewing Angle, Dual Tasking",
      CREATIVE: "• Canvas Stand Mode: 20° Flat Incline, Precision Stylus Latency < 2ms",
      GAMING: "• High Performance Mode: 175W Thermal Envelope & 240Hz Refresh",
      MOBILE: "• Folded Tablet Mode: 360° Fold, Compact Handheld Mobility"
    };

    ctx.fillStyle = '#cfd8dc';
    ctx.font = '24px Arial';
    ctx.fillText(descriptions[currentMode] || "", 40, 210);

    ctx.fillStyle = '#00ff96';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Select any mode below to trigger 3D mechanical morphing animation', 40, 310);

    hudTexture.needsUpdate = true;
  };

  renderHUD();

  const hudMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2.0, 1.0),
    new THREE.MeshBasicMaterial({ map: hudTexture, transparent: true, side: THREE.DoubleSide })
  );
  hudMesh.position.set(0, 2.4, -0.6);
  adaptiveGroup.add(hudMesh);

  // 4 Mode Buttons along the plinth
  const buttonConfigs = [
    { label: "WORK", x: -1.2, angle: Math.PI * 0.58, color: "#00d2ff" },
    { label: "CREATIVE", x: -0.4, angle: Math.PI * 0.15, color: "#ffb300" },
    { label: "GAMING", x: 0.4, angle: Math.PI * 0.65, color: "#ff2a6d" },
    { label: "MOBILE", x: 1.2, angle: Math.PI * 0.98, color: "#00ff96" }
  ];

  let visitedModesCount = 0;
  const visitedModes = new Set();

  buttonConfigs.forEach((cfg) => {
    const btn = interactionManager.createWorldButton(
      cfg.label,
      0.75,
      0.30,
      () => {
        soundManager.playModeSwitch();
        currentMode = cfg.label;
        renderHUD();

        // Animate screen hinge rotation
        screenHinge.rotation.x = cfg.angle;

        visitedModes.add(cfg.label);
        if (visitedModes.size >= 2) {
          progressManager.completeStage(STAGES.ADAPTIVE);
          guidanceSystem.showGuidance(
            "Adaptive Computing Complete! Cross the aisle to Zone 04: Personal AI.",
            new THREE.Vector3(8.0, 1.2, 2.5)
          );
        }
      },
      cfg.color
    );
    btn.position.set(cfg.x, 1.15, 0.4);
    adaptiveGroup.add(btn);
  });

  scene.add(adaptiveGroup);

  return {
    update: (time) => {}
  };
}
