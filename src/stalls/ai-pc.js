/**
 * Stall 2: Lenovo AI PC - Production 3D Laptop Simulation, WebXR Hand Grab / Lid Hinge & Neural NPU Socket System
 * [BUILD: AI-PC-LAPTOP-REAL-002]
 *
 * Configures:
 *  - Loads actual Lenovo AI Laptop 3D Model: `./assets/models/lenovo_ai_laptop.glb`
 *  - Places laptop directly on the AI PC booth pedestal in Zone 02 (X=7.2, Y=1.215, Z=14.35)
 *  - Default state: Screen/Lid open at 105° facing visitor in the main aisle
 *  - PureSight Pro OLED active emissive display & backlit keyboard
 *  - Reusable Hinge interaction constrained between 0° (closed) and 125° (max open)
 *  - Grabbable laptop base with return-to-pedestal
 *  - Grabbable PROJECT_REPORT document & AI PROCESSING drop socket
 *  - Floating 3D label: "LENOVO AI PC // PINCH TO INTERACT"
 *  - Real-time telemetry logging
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { progressManager, STAGES } from '../progress.js';
import { guidanceSystem } from '../guidance.js';
import { soundManager } from '../audio.js';

export function setupLenovoAIPC(scene, interactionManager, grabManager = null) {
  const aipcGroup = new THREE.Group();
  aipcGroup.name = "AIPC_Interactive_System";
  // Zone 02: Exact AI PC Pedestal Center (X = 7.5, Y = 0.0, Z = 14.2)
  aipcGroup.position.set(7.5, 0.0, 14.2);

  // 1. Floating Neural AI Interface HUD (Above booth counter)
  const hudCanvas = document.createElement('canvas');
  hudCanvas.width = 1024;
  hudCanvas.height = 640;
  const hudTexture = new THREE.CanvasTexture(hudCanvas);

  let currentStatus = "AI PC READY: Screen Active @ 105° • Grab laptop lid to adjust or drag PROJECT_REPORT";
  let statusColor = "#00d2ff";
  let isAnalyzing = false;
  let isSummaryReady = false;

  const renderHUD = () => {
    const ctx = hudCanvas.getContext('2d');
    ctx.clearRect(0, 0, 1024, 640);

    ctx.fillStyle = 'rgba(8, 14, 22, 0.94)';
    ctx.fillRect(10, 10, 1004, 620);
    ctx.strokeStyle = '#00d2ff';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, 1004, 620);

    // Lenovo Header
    ctx.fillStyle = '#e2231a';
    ctx.fillRect(40, 40, 180, 50);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px Arial';
    ctx.fillText('Lenovo', 65, 75);

    ctx.fillStyle = '#00d2ff';
    ctx.font = 'bold 32px Arial';
    ctx.fillText('LENOVO AI PC // NEURAL COPILOT HUB', 250, 75);

    ctx.strokeStyle = 'rgba(0, 210, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 105);
    ctx.lineTo(984, 105);
    ctx.stroke();

    // Status Message
    ctx.fillStyle = statusColor;
    ctx.font = 'bold 26px Arial';
    ctx.fillText(currentStatus, 40, 150);

    // Specifications & Live Insights
    if (!isSummaryReady) {
      ctx.fillStyle = '#b0bec5';
      ctx.font = '22px Arial';
      ctx.fillText('• NPU Engine: 45.2 Dedicated TOPS Neural Acceleration', 40, 210);
      ctx.fillText('• Privacy: 100% Zero-Cloud On-Device LLM & Vision Processing', 40, 250);
      ctx.fillText('• Display: PureSight Pro 3.2K OLED with Dynamic HDR (Active @ 105°)', 40, 290);
      ctx.fillText('• Interaction: Pinch & Grab PROJECT_REPORT -> Drop into Socket', 40, 330);
    } else {
      ctx.fillStyle = '#00ff96';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('✓ NPU INFERENCE COMPLETE (0.38s Latency @ 45.2 TOPS)', 40, 210);

      ctx.fillStyle = '#ffffff';
      ctx.font = '20px Arial';
      ctx.fillText('• Document: PROJECT_REPORT_Q4_2026.DOCX (16 Pages)', 40, 250);
      ctx.fillText('• Key Finding 1: On-device NPU delivers 3.8x faster LLM execution', 40, 285);
      ctx.fillText('• Key Finding 2: Zero data leakage with local multimodal weights', 40, 320);
      ctx.fillText('• Power Efficiency: 78% lower battery consumption vs CPU inference', 40, 355);
    }

    // Interaction hint
    ctx.fillStyle = '#ffb300';
    ctx.font = 'italic 18px Arial';
    ctx.fillText('Hand Controls: Grab lid to adjust angle (0°-125°) • Grab document to process', 40, 580);

    hudTexture.needsUpdate = true;
  };

  renderHUD();

  const hudMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2.0, 1.25),
    new THREE.MeshBasicMaterial({ map: hudTexture, transparent: true, side: THREE.DoubleSide })
  );
  hudMesh.position.set(0.3, 2.35, -1.8);
  aipcGroup.add(hudMesh);

  // 2. Load Actual 3D Lenovo AI Laptop Model
  const laptopRootGroup = new THREE.Group();
  laptopRootGroup.name = "Lenovo_AI_Laptop_Root_Assembly";
  // Positioned directly on the front pedestal top surface
  laptopRootGroup.position.set(-0.35, 1.215, 0.15);
  // Scale 1.2 for clear prominence and ease of hand interaction
  laptopRootGroup.scale.set(1.2, 1.2, 1.2);
  // Angle towards the main aisle approach for immediate recognition
  laptopRootGroup.rotation.y = -Math.PI * 0.55;

  // Dedicated hinge pivot group for the lid
  const lidHingeGroup = new THREE.Group();
  lidHingeGroup.name = "Laptop_Lid_Hinge_Assembly";
  // Exact hinge pivot translation from GLB metadata: [0, 0.0127, -0.0995]
  lidHingeGroup.position.set(0, 0.0127, -0.0995);

  const defaultLidAngle = (105 * Math.PI) / 180; // ~1.8326 rad
  lidHingeGroup.rotation.x = -defaultLidAngle;

  let isLaptopLoaded = false;
  let isLidFound = false;

  // Floating 3D Label directly above the laptop
  const labelCanvas = document.createElement('canvas');
  labelCanvas.width = 512;
  labelCanvas.height = 256;
  const lCtx = labelCanvas.getContext('2d');
  lCtx.clearRect(0, 0, 512, 256);
  lCtx.fillStyle = 'rgba(10, 16, 26, 0.94)';
  lCtx.fillRect(10, 10, 492, 236);
  lCtx.strokeStyle = '#00d2ff';
  lCtx.lineWidth = 4;
  lCtx.strokeRect(10, 10, 492, 236);

  lCtx.fillStyle = '#e2231a';
  lCtx.fillRect(30, 26, 140, 36);
  lCtx.fillStyle = '#ffffff';
  lCtx.font = 'bold 22px Arial';
  lCtx.fillText('Lenovo', 45, 52);

  lCtx.fillStyle = '#00d2ff';
  lCtx.font = 'bold 28px Arial';
  lCtx.textAlign = 'center';
  lCtx.fillText('LENOVO AI PC', 256, 115);

  lCtx.fillStyle = '#00ff96';
  lCtx.font = 'bold 24px Arial';
  lCtx.fillText('PINCH TO INTERACT', 256, 165);

  lCtx.fillStyle = '#ffb300';
  lCtx.font = 'italic 18px Arial';
  lCtx.fillText('Grab Lid (105°) / Grab Laptop', 256, 205);

  const labelTex = new THREE.CanvasTexture(labelCanvas);
  const labelMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.55, 0.28),
    new THREE.MeshBasicMaterial({ map: labelTex, transparent: true, side: THREE.DoubleSide })
  );
  labelMesh.position.set(0, 0.42, 0);
  labelMesh.rotation.y = Math.PI * 0.55; // Face visitor aisle
  laptopRootGroup.add(labelMesh);

  // Pedestal Glowing Base Halo
  const haloGeo = new THREE.RingGeometry(0.28, 0.38, 32);
  const haloMat = new THREE.MeshBasicMaterial({ color: 0x00d2ff, side: THREE.DoubleSide, transparent: true, opacity: 0.65 });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = 0.002;
  laptopRootGroup.add(halo);

  const loader = new GLTFLoader();
  loader.load(
    './assets/models/lenovo_ai_laptop.glb',
    (gltf) => {
      const laptopModel = gltf.scene;
      laptopModel.name = "Lenovo_AI_Laptop_Model";

      const lidNodeNames = ['Display_Frame', 'Display_Glass', 'Lenovo_Logo'];
      const nodesToReparent = [];

      laptopModel.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = false;
          child.receiveShadow = false;

          // PureSight OLED Screen Glow
          if (child.name === 'Display_Glass' || (child.material && child.material.name === 'M_Display_AI')) {
            if (child.material) {
              child.material.emissive = new THREE.Color(0x00d2ff);
              child.material.emissiveIntensity = 0.6;
              if (child.material.map) {
                child.material.emissiveMap = child.material.map;
              }
            }
          }
        }

        if (lidNodeNames.includes(child.name)) {
          nodesToReparent.push(child);
        }
      });

      if (nodesToReparent.length > 0) {
        isLidFound = true;
        nodesToReparent.forEach((node) => {
          // Reset local translation since lidHingeGroup handles hinge pivot translation
          node.position.set(0, 0, 0);
          node.rotation.set(0, 0, 0);
          lidHingeGroup.add(node);
        });
      }

      // Add remaining base chassis & components
      laptopRootGroup.add(laptopModel);
      laptopRootGroup.add(lidHingeGroup);
      aipcGroup.add(laptopRootGroup);

      isLaptopLoaded = true;

      // Register with GrabInteractionManager
      if (grabManager) {
        // A. Laptop Base (Free grab with return to pedestal on release)
        grabManager.registerInteractable(laptopRootGroup, {
          id: 'ai_pc_laptop',
          name: 'Lenovo AI PC Laptop',
          type: 'free_grab',
          grabRadius: 0.38,
          returnToHomeOnRelease: true,
          onGrabStart: () => {
            soundManager.playClick();
            currentStatus = "GRABBED: Lenovo AI PC Laptop in hand";
            statusColor = "#00ff96";
            renderHUD();
          },
          onGrabEnd: () => {
            currentStatus = "RELEASED: Laptop returned to pedestal";
            statusColor = "#00d2ff";
            renderHUD();
          }
        });

        // B. Laptop Screen Lid (Hinge: 0° closed to 125° max open, starts at ~105°)
        grabManager.registerInteractable(lidHingeGroup, {
          id: 'ai_pc_lid',
          name: 'Laptop Screen Lid',
          type: 'hinge',
          hingeAxis: new THREE.Vector3(1, 0, 0),
          initialAngle: defaultLidAngle,
          minAngle: 0,
          maxAngle: (125 * Math.PI) / 180, // 125° max
          grabRadius: 0.35,
          onGrabMove: (obj, angle) => {
            const deg = Math.round((angle * 180) / Math.PI);
            currentStatus = `LAPTOP HINGE: ${deg}° Open [${deg > 15 ? 'SCREEN ACTIVE' : 'STANDBY'}]`;
            statusColor = deg > 15 ? '#00ff96' : '#ffb300';
            renderHUD();
          }
        });
      }

      // Diagnostics Telemetry Log
      const worldPos = new THREE.Vector3();
      laptopRootGroup.getWorldPosition(worldPos);

      console.log('=== LENOVO AI PC LAPTOP TELEMETRY ===');
      console.log('laptop model loaded: YES');
      console.log('laptop world position:', `X=${worldPos.x.toFixed(2)}, Y=${worldPos.y.toFixed(2)}, Z=${worldPos.z.toFixed(2)}`);
      console.log('laptop scale:', `(${laptopRootGroup.scale.x}, ${laptopRootGroup.scale.y}, ${laptopRootGroup.scale.z})`);
      console.log('laptop visible: YES');
      console.log('laptop added to scene: YES');
      console.log('lid mesh found:', isLidFound ? 'YES' : 'NO');
      console.log('default lid angle: 105° (1.833 rad)');
      console.log('======================================');
    },
    undefined,
    (error) => {
      console.error('Error loading lenovo_ai_laptop.glb:', error);
      console.log('laptop model loaded: NO');
      currentStatus = "ERROR: Failed to load lenovo_ai_laptop.glb";
      statusColor = "#e2231a";
      renderHUD();
    }
  );

  // 3. Holographic Drop Zone / Socket: "AI PROCESSING"
  const socketGroup = new THREE.Group();
  socketGroup.name = "AI_Processing_Drop_Socket";
  socketGroup.position.set(0.55, 1.215, -0.2);

  // Socket base ring & dotted frame
  const socketRingGeo = new THREE.RingGeometry(0.18, 0.22, 32);
  const socketRingMat = new THREE.MeshBasicMaterial({
    color: 0x00d2ff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.6
  });
  const socketRing = new THREE.Mesh(socketRingGeo, socketRingMat);
  socketRing.rotation.x = -Math.PI / 2;
  socketGroup.add(socketRing);

  // Socket Label Quad
  const socketLabelCanvas = document.createElement('canvas');
  socketLabelCanvas.width = 512;
  socketLabelCanvas.height = 256;
  const sCtx = socketLabelCanvas.getContext('2d');
  sCtx.clearRect(0, 0, 512, 256);
  sCtx.fillStyle = 'rgba(8, 16, 28, 0.9)';
  sCtx.fillRect(10, 10, 492, 236);
  sCtx.strokeStyle = '#00d2ff';
  sCtx.lineWidth = 4;
  sCtx.strokeRect(10, 10, 492, 236);

  sCtx.fillStyle = '#00d2ff';
  sCtx.font = 'bold 36px Arial';
  sCtx.textAlign = 'center';
  sCtx.fillText('AI PROCESSING', 256, 80);

  sCtx.fillStyle = '#cfd8dc';
  sCtx.font = '22px Arial';
  sCtx.fillText('DROP ZONE / SOCKET', 256, 130);

  sCtx.fillStyle = '#ffb300';
  sCtx.font = 'italic 20px Arial';
  sCtx.fillText('Drop PROJECT_REPORT here', 256, 180);

  const socketLabelTex = new THREE.CanvasTexture(socketLabelCanvas);
  const socketLabelMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.36, 0.18),
    new THREE.MeshBasicMaterial({ map: socketLabelTex, transparent: true, side: THREE.DoubleSide })
  );
  socketLabelMesh.position.set(0, 0.22, 0);
  socketLabelMesh.rotation.y = -Math.PI * 0.25;
  socketGroup.add(socketLabelMesh);

  aipcGroup.add(socketGroup);

  // 4. Grabbable 3D Document: "PROJECT_REPORT"
  const docGroup = new THREE.Group();
  docGroup.name = "Grabbable_Project_Report";
  docGroup.position.set(0.55, 1.215, 0.3);

  // Document Card Quad / Box
  const docGeo = new THREE.BoxGeometry(0.22, 0.008, 0.16);
  const docMat = new THREE.MeshStandardMaterial({
    color: 0x101a28,
    metalness: 0.4,
    roughness: 0.3
  });
  const docMesh = new THREE.Mesh(docGeo, docMat);
  docGroup.add(docMesh);

  // Document Cover Graphic
  const docCanvas = document.createElement('canvas');
  docCanvas.width = 512;
  docCanvas.height = 360;
  const dCtx = docCanvas.getContext('2d');
  dCtx.fillStyle = '#0a121e';
  dCtx.fillRect(0, 0, 512, 360);
  dCtx.strokeStyle = '#00d2ff';
  dCtx.lineWidth = 6;
  dCtx.strokeRect(6, 6, 500, 348);

  dCtx.fillStyle = '#e2231a';
  dCtx.fillRect(20, 20, 140, 36);
  dCtx.fillStyle = '#ffffff';
  dCtx.font = 'bold 22px Arial';
  dCtx.fillText('Lenovo AI', 35, 46);

  dCtx.fillStyle = '#00d2ff';
  dCtx.font = 'bold 28px Arial';
  dCtx.fillText('PROJECT_REPORT', 20, 110);

  dCtx.fillStyle = '#ffffff';
  dCtx.font = '20px Arial';
  dCtx.fillText('Q4_2026_NEURAL_BENCHMARK', 20, 145);

  dCtx.fillStyle = '#78909c';
  dCtx.font = '16px Arial';
  dCtx.fillText('CONFIDENTIAL • 16 PAGES • LOCAL NPU', 20, 185);
  dCtx.fillText('Status: Awaiting Neural Summarization', 20, 215);

  const docTex = new THREE.CanvasTexture(docCanvas);
  const docCoverMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.21, 0.15),
    new THREE.MeshBasicMaterial({ map: docTex, side: THREE.DoubleSide })
  );
  docCoverMesh.rotation.x = -Math.PI / 2;
  docCoverMesh.position.y = 0.005;
  docGroup.add(docCoverMesh);

  aipcGroup.add(docGroup);

  // 5. Register Grabbable Document and Socket with GrabInteractionManager
  if (grabManager) {
    // Grabbable Document
    grabManager.registerInteractable(docGroup, {
      id: 'doc_project_report',
      name: 'PROJECT_REPORT Document',
      tag: 'document',
      type: 'free_grab',
      grabRadius: 0.30,
      returnToHomeOnRelease: false,
      onGrabStart: () => {
        soundManager.playClick();
        currentStatus = "GRABBED: PROJECT_REPORT -> Move into AI PROCESSING socket";
        statusColor = "#ffb300";
        renderHUD();
      },
      onGrabEnd: (obj, socket) => {
        if (!socket) {
          currentStatus = "RELEASED: Document dropped. Move to AI PROCESSING socket.";
          statusColor = "#00d2ff";
          renderHUD();
        }
      }
    });

    // Drop Zone Socket
    grabManager.registerSocket(socketGroup, {
      id: 'socket_ai_processing',
      name: 'AI Processing Socket',
      acceptedTag: 'document',
      snapRadius: 0.38,
      haloRing: socketRing,
      onAccepted: (socket, doc) => {
        soundManager.playAIChime();
        isAnalyzing = true;
        currentStatus = "ANALYZING... [Running On-Device NPU @ 45.2 TOPS]";
        statusColor = "#ffb300";
        renderHUD();

        setTimeout(() => {
          soundManager.playAIChime();
          isAnalyzing = false;
          isSummaryReady = true;
          currentStatus = "✓ AI SUMMARY READY // NPU Multi-modal Inference Complete";
          statusColor = "#00ff96";
          renderHUD();

          progressManager.completeStage(STAGES.AI_PC);
          guidanceSystem.showGuidance(
            "AI PC Neural Processing Complete! Proceed to Zone 03: Adaptive Computing.",
            new THREE.Vector3(-8.0, 1.2, 2.5)
          );
        }, 1200);
      }
    });
  }

  // 6. Action Button Fallback (Click / Controller Ray)
  const summarizeBtn = interactionManager.createWorldButton(
    "PROCESS REPORT",
    1.3,
    0.35,
    () => {
      soundManager.playAIChime();
      currentStatus = "ANALYZING... [Running On-Device NPU @ 45.2 TOPS]";
      statusColor = "#ffb300";
      renderHUD();

      setTimeout(() => {
        soundManager.playAIChime();
        isSummaryReady = true;
        currentStatus = "✓ AI SUMMARY READY";
        statusColor = "#00ff96";
        renderHUD();

        progressManager.completeStage(STAGES.AI_PC);
        guidanceSystem.showGuidance(
          "AI PC Simulation Complete! Proceed to Zone 03: Adaptive Computing.",
          new THREE.Vector3(-8.0, 1.2, 2.5)
        );
      }, 1200);
    },
    "#00d2ff"
  );
  summarizeBtn.position.set(-0.7, 1.45, 0.1);
  aipcGroup.add(summarizeBtn);

  scene.add(aipcGroup);

  return {
    update: (time) => {
      if (halo) {
        halo.rotation.z += 0.01;
      }
      if (socketRing) {
        socketRing.rotation.z -= isAnalyzing ? 0.08 : 0.015;
      }
    }
  };
}
