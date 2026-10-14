/**
 * Stall 6: Lenovo Future Lab - Grand Finale Pavilion
 * 5 Concept Nodes + 14m Curved Video Wall Sequential Presentation.
 */
import * as THREE from 'three';
import { progressManager, STAGES } from '../progress.js';
import { guidanceSystem } from '../guidance.js';
import { soundManager } from '../audio.js';

export function setupFutureLab(scene, interactionManager) {
  const futureLabGroup = new THREE.Group();
  futureLabGroup.name = "FutureLab_Interactive_System";
  futureLabGroup.position.set(0, 0, -18.5);

  // 1. 5 Concept Node Pillars (Intelligent, Adaptive, Connected, Immersive, Personal)
  const conceptData = [
    { title: "INTELLIGENT", sub: "Neuromorphic AI & 100+ TOPS Silicon", pos: [-4.2, 1.2, 0.0], color: "#00d2ff" },
    { title: "ADAPTIVE", sub: "Morphing Form Factors & Self-Balancing Power", pos: [-2.1, 1.2, -1.8], color: "#ffb300" },
    { title: "CONNECTED", sub: "Quantum Secured Mesh Across Devices", pos: [0.0, 1.2, -2.8], color: "#00ff96" },
    { title: "IMMERSIVE", sub: "Photorealistic Spatial XR Holograms", pos: [2.1, 1.2, -1.8], color: "#b388ff" },
    { title: "PERSONAL", sub: "Context-Aware Agent Centered on You", pos: [4.2, 1.2, 0.0], color: "#ff2a6d" }
  ];

  const activatedConcepts = new Set();
  const conceptMeshes = [];

  // Hero Presentation Video Wall Canvas
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 2048;
  screenCanvas.height = 768;
  const screenTexture = new THREE.CanvasTexture(screenCanvas);

  let finaleStep = 0;
  const finaleLines = [
    "THE FUTURE OF COMPUTING IS NOT ONE DEVICE.",
    "IT IS INTELLIGENT.",
    "ADAPTIVE.",
    "CONNECTED.",
    "IMMERSIVE.",
    "AND PERSONAL.",
    "THANK YOU FOR VISITING LENOVO FUTURE EXPO"
  ];

  const renderPresentationWall = () => {
    const ctx = screenCanvas.getContext('2d');
    ctx.clearRect(0, 0, 2048, 768);

    ctx.fillStyle = 'rgba(8, 12, 18, 0.96)';
    ctx.fillRect(10, 10, 2028, 748);
    ctx.strokeStyle = '#e2231a';
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, 2028, 748);

    // Header
    ctx.fillStyle = '#e2231a';
    ctx.fillRect(50, 40, 240, 65);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px Arial';
    ctx.fillText('Lenovo', 85, 88);

    ctx.fillStyle = '#00d2ff';
    ctx.font = 'bold 44px Arial';
    ctx.fillText('FUTURE LAB // GRAND FINALE SHOWCASE', 330, 88);

    if (activatedConcepts.size < 5) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px Arial';
      ctx.fillText(`ACTIVATE ALL 5 CONCEPT NODES: (${activatedConcepts.size} / 5 ACTIVATED)`, 50, 200);

      ctx.fillStyle = '#90a4ae';
      ctx.font = '26px Arial';
      ctx.fillText('Approach each floating pedestal node to synchronize the future architecture.', 50, 260);

      conceptData.forEach((c, idx) => {
        const isDone = activatedConcepts.has(c.title);
        ctx.fillStyle = isDone ? '#00ff96' : '#546e7a';
        ctx.font = 'bold 28px Arial';
        ctx.fillText(`${isDone ? '✓' : '○'} ${c.title} — ${c.sub}`, 50, 340 + idx * 60);
      });
    } else {
      // Cinematic Presentation Sequence
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 52px Arial';
      ctx.textAlign = 'center';
      
      const lineToShow = finaleLines[Math.min(finaleStep, finaleLines.length - 1)];
      ctx.fillText(lineToShow, 1024, 380);

      ctx.fillStyle = '#00d2ff';
      ctx.font = 'bold 32px Arial';
      ctx.fillText('LENOVO FUTURE EXPO // ALL ZONES FULLY EXPLORED', 1024, 520);
      ctx.textAlign = 'left';
    }

    screenTexture.needsUpdate = true;
  };

  renderPresentationWall();

  const presentationWallMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(8.0, 3.0),
    new THREE.MeshBasicMaterial({ map: screenTexture, side: THREE.DoubleSide })
  );
  presentationWallMesh.position.set(0, 3.2, 3.8);
  futureLabGroup.add(presentationWallMesh);

  // Spawn the 5 Interactive Concept Nodes
  conceptData.forEach((c) => {
    const nodeGroup = new THREE.Group();
    nodeGroup.position.set(c.pos[0], c.pos[1], c.pos[2]);

    // Floating Prism Node
    const prism = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.28),
      new THREE.MeshBasicMaterial({ color: c.color, wireframe: true })
    );
    nodeGroup.add(prism);

    // Node Pedestal Button
    const btn = interactionManager.createWorldButton(
      c.title,
      0.9,
      0.30,
      () => {
        soundManager.playAIChime();
        activatedConcepts.add(c.title);
        prism.material.wireframe = false;
        renderPresentationWall();

        if (activatedConcepts.size >= 5) {
          soundManager.playFinale();
          progressManager.completeStage(STAGES.FUTURE_LAB);
          guidanceSystem.showGuidance("Congratulations! You have completed the Lenovo Future Expo.");

          // Start sequential finale presentation
          let step = 0;
          const interval = setInterval(() => {
            step++;
            finaleStep = step;
            renderPresentationWall();
            if (step >= finaleLines.length) {
              clearInterval(interval);
            }
          }, 1800);
        }
      },
      c.color
    );
    btn.position.set(0, -0.4, 0.2);
    nodeGroup.add(btn);

    futureLabGroup.add(nodeGroup);
    conceptMeshes.push(prism);
  });

  // Action Buttons: "RESTART EXPO" & "RESET EXPERIENCE"
  const restartBtn = interactionManager.createWorldButton(
    "RESTART EXPO",
    1.2,
    0.35,
    () => {
      soundManager.playClick();
      progressManager.reset();
      activatedConcepts.clear();
      finaleStep = 0;
      conceptMeshes.forEach(m => m.material.wireframe = true);
      renderPresentationWall();
      guidanceSystem.showGuidance("Expo reset. Return to the entrance to start a new tour.");
    },
    "#e2231a"
  );
  restartBtn.position.set(0, 0.9, -0.8);
  futureLabGroup.add(restartBtn);

  scene.add(futureLabGroup);

  return {
    update: (time) => {
      conceptMeshes.forEach((m, i) => {
        m.rotation.y += 0.02 + i * 0.005;
        m.rotation.x += 0.01;
      });
    }
  };
}
