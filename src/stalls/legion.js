/**
 * Stall 1: Legion Gaming - Interactive Target Challenge (0/5 Hits)
 */
import * as THREE from 'three';
import { progressManager, STAGES } from '../progress.js';
import { guidanceSystem } from '../guidance.js';
import { soundManager } from '../audio.js';

export function setupLegionGaming(scene, interactionManager) {
  const legionGroup = new THREE.Group();
  legionGroup.name = "Legion_Interactive_System";
  legionGroup.position.set(-8.0, 0, 13.8);

  let hitsCount = 0;
  const targetGoal = 5;
  const activeTargets = [];

  // Score HUD Canvas
  const scoreCanvas = document.createElement('canvas');
  scoreCanvas.width = 512;
  scoreCanvas.height = 256;
  const scoreTexture = new THREE.CanvasTexture(scoreCanvas);

  const updateScoreBoard = () => {
    const ctx = scoreCanvas.getContext('2d');
    ctx.clearRect(0, 0, 512, 256);
    ctx.fillStyle = 'rgba(20, 10, 25, 0.9)';
    ctx.fillRect(8, 8, 496, 240);
    ctx.strokeStyle = '#e2231a';
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, 496, 240);

    ctx.fillStyle = '#ff2a6d';
    ctx.font = 'bold 36px Arial';
    ctx.fillText('LEGION GAMING CHALLENGE', 30, 60);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.fillText(`TARGETS HIT: ${hitsCount} / ${targetGoal}`, 30, 130);

    if (hitsCount >= targetGoal) {
      ctx.fillStyle = '#00ff96';
      ctx.font = 'bold 34px Arial';
      ctx.fillText('✓ EXPERIENCE COMPLETE', 30, 200);
    } else {
      ctx.fillStyle = '#00d2ff';
      ctx.font = '24px Arial';
      ctx.fillText('Point & Click / Pull Trigger on floating targets!', 30, 200);
    }
    scoreTexture.needsUpdate = true;
  };

  updateScoreBoard();

  const scoreBoardMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.6, 0.8),
    new THREE.MeshBasicMaterial({ map: scoreTexture, transparent: true, side: THREE.DoubleSide })
  );
  scoreBoardMesh.position.set(0, 2.4, -0.6);
  legionGroup.add(scoreBoardMesh);

  // Spawn 5 Floating Interactive Targets around gaming desk
  const targetOffsets = [
    [-1.5, 1.6, -0.8],
    [ 1.5, 1.8, -0.6],
    [-0.8, 2.1,  0.2],
    [ 0.9, 1.5,  0.4],
    [ 0.0, 1.9, -1.2]
  ];

  targetOffsets.forEach((pos, idx) => {
    const targetGroup = new THREE.Group();
    targetGroup.position.set(pos[0], pos[1], pos[2]);

    const sphereGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const sphereMat = new THREE.MeshBasicMaterial({ color: 0xff2a6d, wireframe: true });
    const mesh = new THREE.Mesh(sphereGeo, sphereMat);
    targetGroup.add(mesh);

    const coreGeo = new THREE.OctahedronGeometry(0.09);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x00d2ff });
    const core = new THREE.Mesh(coreGeo, coreMat);
    targetGroup.add(core);

    interactionManager.registerInteractable(targetGroup, () => {
      if (targetGroup.visible) {
        targetGroup.visible = false;
        soundManager.playLaserHit();
        hitsCount++;
        updateScoreBoard();

        if (hitsCount >= targetGoal) {
          soundManager.playAIChime();
          progressManager.completeStage(STAGES.LEGION);
          guidanceSystem.showGuidance(
            "Legion Gaming Complete! Cross the aisle to Zone 02: Lenovo AI PC.",
            new THREE.Vector3(8.0, 1.2, 13.8)
          );
        }
      }
    });

    legionGroup.add(targetGroup);
    activeTargets.push(targetGroup);
  });

  // 3D Lenovo Legion Pro 7i Gaming Laptop Showcase
  const laptopGroup = new THREE.Group();
  laptopGroup.name = "Legion_Pro_7i_Laptop";
  laptopGroup.position.set(0, 1.15, 0.0);
  laptopGroup.rotation.y = Math.PI * 0.5; // Face visitors approaching from main aisle

  // Pedestal glowing RGB base ring
  const ringGeo = new THREE.RingGeometry(0.35, 0.45, 32);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xff2a6d, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.002;
  laptopGroup.add(ring);

  // Laptop Base Chassis (Onyx Grey Metal)
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x181a20, metalness: 0.85, roughness: 0.2 });
  const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.022, 0.36), baseMat);
  laptopGroup.add(baseMesh);

  // RGB Backlit Keyboard Plate
  const kbCanvas = document.createElement('canvas');
  kbCanvas.width = 512;
  kbCanvas.height = 256;
  const kctx = kbCanvas.getContext('2d');
  kctx.fillStyle = '#101216';
  kctx.fillRect(0, 0, 512, 256);
  // RGB keyboard grid
  const grad = kctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, '#ff2a6d');
  grad.addColorStop(0.5, '#00d2ff');
  grad.addColorStop(1, '#00ff96');
  kctx.strokeStyle = grad;
  kctx.lineWidth = 3;
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 14; c++) {
      kctx.strokeRect(30 + c * 32, 25 + r * 30, 24, 20);
    }
  }
  // Trackpad
  kctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  kctx.strokeRect(180, 185, 150, 60);

  const kbTex = new THREE.CanvasTexture(kbCanvas);
  const kbMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.46, 0.28),
    new THREE.MeshStandardMaterial({ map: kbTex, emissive: 0x221133, emissiveIntensity: 0.5 })
  );
  kbMesh.rotation.x = -Math.PI / 2;
  kbMesh.position.set(0, 0.012, 0.02);
  laptopGroup.add(kbMesh);

  // Laptop Lid Assembly (105° tilt)
  const lidGroup = new THREE.Group();
  lidGroup.position.set(0, 0.011, -0.17);
  lidGroup.rotation.x = -Math.PI * 0.58; // 105 degrees open

  // Screen frame
  const lidMesh = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.35, 0.012), baseMat);
  lidMesh.position.set(0, 0.175, 0);
  lidGroup.add(lidMesh);

  // PureSight OLED Screen Display
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 1024;
  screenCanvas.height = 640;
  const sctx = screenCanvas.getContext('2d');
  sctx.fillStyle = '#080c14';
  sctx.fillRect(0, 0, 1024, 640);
  // Cyberpunk Gaming Visual
  const sgrad = sctx.createRadialGradient(512, 320, 50, 512, 320, 500);
  sgrad.addColorStop(0, '#ff2a6d');
  sgrad.addColorStop(0.7, '#1b0a2a');
  sgrad.addColorStop(1, '#05070e');
  sctx.fillStyle = sgrad;
  sctx.fillRect(20, 20, 984, 600);

  sctx.fillStyle = '#ffffff';
  sctx.font = 'bold 54px Arial';
  sctx.textAlign = 'center';
  sctx.fillText('LEGION PRO 7i', 512, 220);

  sctx.fillStyle = '#00d2ff';
  sctx.font = 'bold 36px Arial';
  sctx.fillText('240Hz PureSight Gaming Display', 512, 300);

  sctx.fillStyle = '#00ff96';
  sctx.font = 'bold 30px Arial';
  sctx.fillText('NVIDIA GeForce RTX 4090 • Intel Core i9-14900HX', 512, 370);

  sctx.fillStyle = '#ffb300';
  sctx.font = 'italic 26px Arial';
  sctx.fillText('Walk closer to check Minecraft / Roblox / Terraria compatibility!', 512, 450);

  const screenTex = new THREE.CanvasTexture(screenCanvas);
  const screenMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.50, 0.33),
    new THREE.MeshBasicMaterial({ map: screenTex, side: THREE.DoubleSide })
  );
  screenMesh.position.set(0, 0.175, 0.007);
  lidGroup.add(screenMesh);

  laptopGroup.add(lidGroup);
  legionGroup.add(laptopGroup);

  scene.add(legionGroup);

  return {
    update: (time) => {
      activeTargets.forEach((t, i) => {
        if (t.visible) {
          t.rotation.y += 0.02 + i * 0.005;
          t.position.y = targetOffsets[i][1] + Math.sin(time * 3 + i) * 0.06;
        }
      });
    },
    reset: () => {
      hitsCount = 0;
      activeTargets.forEach(t => t.visible = true);
      updateScoreBoard();
    }
  };
}
