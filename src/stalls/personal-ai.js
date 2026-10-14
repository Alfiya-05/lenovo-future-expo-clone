/**
 * Stall 4: Personal AI - Cross-Device Continuity (Lenovo + Motorola)
 */
import * as THREE from 'three';
import { progressManager, STAGES } from '../progress.js';
import { guidanceSystem } from '../guidance.js';
import { soundManager } from '../audio.js';

export function setupPersonalAI(scene, interactionManager) {
  const personalGroup = new THREE.Group();
  personalGroup.name = "PersonalAI_Interactive_System";
  personalGroup.position.set(8.0, 0, 2.5);

  // 1. Laptop on left plinth
  const laptopMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.02, 0.25),
    new THREE.MeshStandardMaterial({ color: 0x1c2028, metalness: 0.8, roughness: 0.3 })
  );
  laptopMesh.position.set(-0.8, 1.25, -0.6);
  personalGroup.add(laptopMesh);

  // 2. Motorola Smartphone on right plinth
  const phoneMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.16, 0.012),
    new THREE.MeshStandardMaterial({ color: 0x00d2ff, metalness: 0.5, roughness: 0.1 })
  );
  phoneMesh.position.set(0.8, 1.28, -0.6);
  phoneMesh.rotation.x = -Math.PI * 0.2;
  personalGroup.add(phoneMesh);

  // 3. Animated Glowing Data Packet Orb
  const orbGeo = new THREE.SphereGeometry(0.06, 16, 16);
  const orbMat = new THREE.MeshBasicMaterial({ color: 0x00ff96 });
  const dataOrb = new THREE.Mesh(orbGeo, orbMat);
  dataOrb.position.set(-0.8, 1.35, -0.6);
  dataOrb.visible = false;
  personalGroup.add(dataOrb);

  let isTransmitting = false;
  let transmitProgress = 0;
  let transmitDir = 1; // 1 = Laptop -> Phone, -1 = Phone -> Laptop

  // Status HUD Canvas
  const hudCanvas = document.createElement('canvas');
  hudCanvas.width = 1024;
  hudCanvas.height = 512;
  const hudTexture = new THREE.CanvasTexture(hudCanvas);

  let statusMsg = "ONE PERSONAL AI EXPERIENCE ACROSS DEVICES";

  const renderHUD = () => {
    const ctx = hudCanvas.getContext('2d');
    ctx.clearRect(0, 0, 1024, 512);

    ctx.fillStyle = 'rgba(8, 20, 24, 0.94)';
    ctx.fillRect(10, 10, 1004, 492);
    ctx.strokeStyle = '#00ff96';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, 1004, 492);

    ctx.fillStyle = '#00ff96';
    ctx.font = 'bold 34px Arial';
    ctx.fillText('PERSONAL AI // SEAMLESS ECOSYSTEM', 40, 70);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(statusMsg, 40, 140);

    ctx.fillStyle = '#b0bec5';
    ctx.font = '22px Arial';
    ctx.fillText('• Cross-Device Smart Clipboard: Zero-Cloud Instant Sync', 40, 210);
    ctx.fillText('• Ambient Presence: Auto-transfers active workspace as you move', 40, 250);
    ctx.fillText('• Multi-Device Compute: Distributed NPU task sharing', 40, 290);

    hudTexture.needsUpdate = true;
  };

  renderHUD();

  const hudMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2.0, 1.0),
    new THREE.MeshBasicMaterial({ map: hudTexture, transparent: true, side: THREE.DoubleSide })
  );
  hudMesh.position.set(0, 2.4, -0.6);
  personalGroup.add(hudMesh);

  // Buttons: "SEND TO PHONE" & "CONTINUE ON LAPTOP"
  const sendToPhoneBtn = interactionManager.createWorldButton(
    "SEND TO PHONE ➔",
    1.1,
    0.32,
    () => {
      soundManager.playDataTransmit();
      isTransmitting = true;
      transmitProgress = 0;
      transmitDir = 1;
      dataOrb.visible = true;
      statusMsg = "TRANSMITTING CONTEXT: Laptop ➔ Motorola Smartphone";
      renderHUD();
    },
    "#00d2ff"
  );
  sendToPhoneBtn.position.set(-0.6, 1.15, 0.3);
  personalGroup.add(sendToPhoneBtn);

  const continueOnLaptopBtn = interactionManager.createWorldButton(
    "⬅ CONTINUE ON LAPTOP",
    1.1,
    0.32,
    () => {
      soundManager.playDataTransmit();
      isTransmitting = true;
      transmitProgress = 0;
      transmitDir = -1;
      dataOrb.visible = true;
      statusMsg = "SYNCING BACK: Motorola Smartphone ➔ Laptop";
      renderHUD();

      progressManager.completeStage(STAGES.PERSONAL_AI);
      guidanceSystem.showGuidance(
        "Personal AI Complete! Walk ahead to Zone 05: Lenovo XR.",
        new THREE.Vector3(-8.0, 1.2, -8.5)
      );
    },
    "#00ff96"
  );
  continueOnLaptopBtn.position.set(0.6, 1.15, 0.3);
  personalGroup.add(continueOnLaptopBtn);

  scene.add(personalGroup);

  return {
    update: (time) => {
      if (isTransmitting) {
        transmitProgress += 0.04;
        const startX = transmitDir === 1 ? -0.8 : 0.8;
        const endX = transmitDir === 1 ? 0.8 : -0.8;

        dataOrb.position.x = THREE.MathUtils.lerp(startX, endX, transmitProgress);
        dataOrb.position.y = 1.35 + Math.sin(transmitProgress * Math.PI) * 0.35;

        if (transmitProgress >= 1.0) {
          isTransmitting = false;
          dataOrb.visible = false;
          statusMsg = transmitDir === 1 ? "✓ CONTEXT TRANSFERRED TO SMARTPHONE" : "✓ WORKSPACE RESTORED ON LAPTOP";
          renderHUD();
        }
      }
    }
  };
}
