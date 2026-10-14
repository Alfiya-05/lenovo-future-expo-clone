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
