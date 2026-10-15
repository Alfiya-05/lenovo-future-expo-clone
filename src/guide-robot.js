/**
 * Lenovo Future Expo - Friendly AI Guide Robot Companion
 * 
 * Features:
 * - Highly realistic, sleek modern companion robot built from simple geometries with Lenovo Red accents.
 * - Placed at start ~2m in front and slightly to the right of the user at eye height (X=0.85, Y=1.62, Z=25.5).
 * - Smoothly moves with the user as they move, staying at their side/front-right flank,
 *   never blocking the center view or clipping through walls or booths.
 * - Realistic banking and tilting when flying, hover bobbing, and glowing blinking eyes.
 * - Provides a comprehensive set of instructions about the expo (both via a floating holographic
 *   panel and spoken voice via Web Speech API & AI chime).
 * - When the user clicks or walks near an exhibit, the robot glides over to present full product specs.
 * - Console logs confirming creation and position.
 */
import * as THREE from 'three';
import { soundManager } from './audio.js';
import { guidanceSystem } from './guidance.js';

// ============================================================================
// 1. ACCURATE EXHIBIT & PRODUCT DATABASE (From Existing Project Data)
// ============================================================================
export const EXHIBIT_PROFILES = [
  {
    id: 'entrance',
    name: 'Grand Entrance Portal',
    productName: 'Lenovo Future Expo Gateway',
    zone: 'Zone 00 — Entrance Plaza',
    position: new THREE.Vector3(0.0, 1.2, 20.5),
    hitRadius: 4.5,
    robotStandOffset: new THREE.Vector3(1.8, 0.4, 1.2),
    specs: [
      '8.4m Grand Illuminated Dual-Color Archway',
      'Pulsing Red & White Emissive Optical Trims',
      'Interactive Virtual Guide & Spatial Tour Portal',
      'High-Gloss Reflective Runway with Light Beams'
    ],
    description: 'The official gateway to Lenovo Future Expo featuring dynamic illumination and tour initiation.'
  },
  {
    id: 'legion_gaming',
    name: 'Legion Gaming Booth',
    productName: 'Lenovo Legion Pro 7i Gen 9',
    zone: 'Zone 01 — Legion Gaming',
    position: new THREE.Vector3(-8.0, 1.15, 13.8),
    hitRadius: 4.0,
    robotStandOffset: new THREE.Vector3(1.6, 0.35, 1.0),
    specs: [
      'Intel Core i9-14900HX (24 Cores, 5.8 GHz Turbo)',
      'NVIDIA GeForce RTX 4090 16GB (175W Max TGP)',
      '16" PureSight Gaming 240Hz 2.5K WQXGA HDR Display',
      'Legion Coldfront 5.0 Vapor Chamber Cooling'
    ],
    description: 'Flagship high-performance esports gaming laptop engineered for pro gamers and streamers.'
  },
  {
    id: 'ai_pc',
    name: 'Lenovo AI PC Booth',
    productName: 'Lenovo Yoga Slim 7x / Aura Edition AI PC',
    zone: 'Zone 02 — Lenovo AI PC',
    position: new THREE.Vector3(7.5, 1.2, 14.2),
    hitRadius: 4.0,
    robotStandOffset: new THREE.Vector3(-1.6, 0.35, 1.0),
    specs: [
      '45+ TOPS Dedicated Neural Processing Unit (NPU)',
      '15.3" 2.8K PureSight Pro OLED 120Hz 500-nit Display',
      '100% On-Device Local LLM & Vision Privacy Processing',
      'Intelligent User-Sensing & Aura Smart Modes'
    ],
    description: 'Next-generation Copilot+ PC featuring 45+ TOPS local AI acceleration and smart user-sensing modes.'
  },
  {
    id: 'adaptive',
    name: 'Adaptive Computing Booth',
    productName: 'Lenovo Yoga Book 9i Multi-Mode',
    zone: 'Zone 03 — Adaptive Computing',
    position: new THREE.Vector3(-8.0, 1.35, 2.5),
    hitRadius: 4.0,
    robotStandOffset: new THREE.Vector3(1.6, 0.35, 1.0),
    specs: [
      'Dual 13.3" 2.8K PureSight OLED Multi-Touch Displays',
      'Intel Core Ultra 7 155H with Intel AI Boost NPU',
      '4 Form Factors: Work, Creative Canvas, Gaming, Mobile',
      'Precision Stylus Pen Pro 3 with < 2ms latency'
    ],
    description: 'Dynamic multi-mode architecture transforming between dual-screen laptop, canvas, and tablet form factors.'
  },
  {
    id: 'personal_ai',
    name: 'Personal AI Booth',
    productName: 'Smart Connect (Lenovo + Motorola)',
    zone: 'Zone 04 — Personal AI',
    position: new THREE.Vector3(8.0, 1.25, 2.5),
    hitRadius: 4.0,
    robotStandOffset: new THREE.Vector3(-1.6, 0.35, 1.0),
    specs: [
      'Smart Connect Instant Cross-Device Clipboard & File Share',
      'Zero-Cloud Peer-to-Peer Encrypted Synchronization',
      'Ambient Proximity Workspace Auto-Transfer',
      'Distributed Multi-Device NPU Compute Sharing'
    ],
    description: 'Seamless cross-device AI mesh synchronizing workflows instantly between Lenovo PCs and Motorola smartphones.'
  },
  {
    id: 'xr',
    name: 'Lenovo XR Booth',
    productName: 'Lenovo ThinkReality VRX Spatial Headset',
    zone: 'Zone 05 — Lenovo XR',
    position: new THREE.Vector3(-8.0, 1.5, -8.5),
    hitRadius: 4.0,
    robotStandOffset: new THREE.Vector3(1.6, 0.35, 1.0),
    specs: [
      'Dual 4K Micro-OLED Displays Per Eye (Retinal Density)',
      'Full-Color High-Resolution Stereo Video Passthrough',
      '6DoF Inside-Out Spatial Tracking & Precision Hands',
      'Infinite Multi-Screen Virtual Spatial Canvas'
    ],
    description: 'Enterprise spatial computing headset merging physical environments with interactive 3D virtual holographic canvases.'
  },
  {
    id: 'future_lab',
    name: 'Future Lab Pavilion',
    productName: 'Lenovo Future Lab Grand Finale Pavilion',
    zone: 'Zone 06 — Future Lab',
    position: new THREE.Vector3(0.0, 1.2, -18.5),
    hitRadius: 4.8,
    robotStandOffset: new THREE.Vector3(1.8, 0.4, 1.5),
    specs: [
      '14m Ultra-Wide Curved Presentation Video Wall',
      '5 Core Pillars: Intelligent, Adaptive, Connected, Immersive, Personal',
      'Neuromorphic AI & Quantum-Secured Mesh Architecture',
      'Next-Decade Computing Vision Showcase'
    ],
    description: 'Visionary showcase synthesizing next-decade technologies: neuromorphic computing, quantum mesh, and unified AI.'
  }
];

export class GuideRobotManager {
  constructor(scene, camera, interactionManager) {
    this.scene = scene;
    this.camera = camera;
    this.interactionManager = interactionManager;

    // Robot State: 'GREETING', 'FOLLOWING', 'PRESENTING'
    this.state = 'GREETING';
    this.activeExhibit = null;
    this.lastNearExhibit = null;
    this.hasGreeted = false;
    this.greetTimer = 0;
    this.isSpeaking = false;

    // Starting Position: ~2m in front of user (spawn Z=27.5), slightly to the right, eye level (Y=1.62m)
    this.robotWorldPos = new THREE.Vector3(0.85, 1.62, 25.5);
    this.targetFollowPos = new THREE.Vector3(0.85, 1.62, 25.5);
    this.currentVelocity = new THREE.Vector3();
    this.previousPos = this.robotWorldPos.clone();

    // Reusable math vectors
    this.tempPlayerPos = new THREE.Vector3();
    this.tempPlayerFwd = new THREE.Vector3();
    this.tempPlayerRight = new THREE.Vector3();
    this.worldUp = new THREE.Vector3(0, 1, 0);

    // Blinking eye animation state
    this.blinkTimer = 0;
    this.isBlinking = false;

    // Hall boundary clamp so robot stays within bounds
    this.hallBounds = {
      minX: -11.5,
      maxX: 11.5,
      minZ: -22.5,
      maxZ: 28.5
    };

    // Build the 3D Robot Model, Instruction Panel and Info Card
    this.initRealisticRobotModel();
    this.initInstructionPanel();
    this.initProductInfoCard();
    this.initExhibitInteractionTriggers();

    // Initial orientation: face the player spawn point at (0, 1.62, 27.5)
    this.robotGroup.lookAt(0, 1.62, 27.5);

    // Console log confirming robot creation and exact position as requested
    console.log(`%c[Lenovo Expo] AI Guide Robot created at position: X=${this.robotGroup.position.x.toFixed(2)}, Y=${this.robotGroup.position.y.toFixed(2)}, Z=${this.robotGroup.position.z.toFixed(2)} (2.0m in front of user, eye level, facing user)`, 'color: #00d2ff; font-weight: bold; font-size: 13px;');
  }

  // ==========================================================================
  // 2. 3D ROBOT MODEL (Realistic, Sleek, Futuristic Ceramic & Lenovo Red)
  // ==========================================================================
  initRealisticRobotModel() {
    this.robotGroup = new THREE.Group();
    this.robotGroup.name = "AI_Guide_Robot";
    this.robotGroup.position.copy(this.robotWorldPos);

    // Inner floating root for hover bobbing and smooth banking tilt
    this.innerModel = new THREE.Group();
    this.robotGroup.add(this.innerModel);

    // High-tech PBR materials
    const whiteChassisMat = new THREE.MeshStandardMaterial({
      color: 0xf4f7fc,
      roughness: 0.12,
      metalness: 0.52
    });

    const lenovoRedMat = new THREE.MeshStandardMaterial({
      color: 0xe2231a,
      emissive: 0xe2231a,
      emissiveIntensity: 1.5,
      roughness: 0.18,
      metalness: 0.25
    });

    const visorGlassMat = new THREE.MeshStandardMaterial({
      color: 0x050811,
      roughness: 0.04,
      metalness: 0.98
    });

    this.eyeMat = new THREE.MeshBasicMaterial({
      color: 0x00d2ff
    });

    // A. Main Torso: Sleek rounded aerodynamic capsule (radius 0.23m, height 0.50m)
    const torsoGeo = new THREE.SphereGeometry(0.23, 32, 28);
    this.torsoMesh = new THREE.Mesh(torsoGeo, whiteChassisMat);
    this.torsoMesh.scale.set(1.0, 1.18, 0.95);
    this.innerModel.add(this.torsoMesh);

    // B. Curved OLED Face Visor (Glossy curved black glass screen)
    const visorGeo = new THREE.SphereGeometry(0.19, 28, 24);
    const visorMesh = new THREE.Mesh(visorGeo, visorGlassMat);
    visorMesh.position.set(0, 0.035, 0.078);
    visorMesh.scale.set(0.92, 0.76, 0.88);
    this.innerModel.add(visorMesh);

    // C. Glowing High-Tech Ocular Lens Eyes (Concentric glowing aperture rings & pupils)
    this.leftEye = new THREE.Group();
    this.rightEye = new THREE.Group();

    [-0.068, 0.068].forEach((xPos, idx) => {
      const eyeGroup = idx === 0 ? this.leftEye : this.rightEye;
      eyeGroup.position.set(xPos, 0.05, 0.236);

      // Outer cyan luminous aperture ring
      const outerRing = new THREE.Mesh(
        new THREE.RingGeometry(0.020, 0.034, 24),
        new THREE.MeshBasicMaterial({ color: 0x00d2ff, side: THREE.DoubleSide })
      );
      eyeGroup.add(outerRing);

      // Inner bright pupil core
      const pupilCore = new THREE.Mesh(
        new THREE.CircleGeometry(0.015, 24),
        new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
      );
      pupilCore.position.z = 0.001;
      eyeGroup.add(pupilCore);

      this.innerModel.add(eyeGroup);
    });

    // Digital Audio Waveform / Mouth Bar (Animates when speaking)
    const mouthGeo = new THREE.PlaneGeometry(0.08, 0.012);
    this.mouthMat = new THREE.MeshBasicMaterial({ color: 0x00d2ff });
    this.mouthBar = new THREE.Mesh(mouthGeo, this.mouthMat);
    this.mouthBar.position.set(0, -0.045, 0.237);
    this.innerModel.add(this.mouthBar);

    // D. Lenovo Red Signature Halo Collar Ring
    const collarGeo = new THREE.TorusGeometry(0.22, 0.018, 16, 40);
    const collarMesh = new THREE.Mesh(collarGeo, lenovoRedMat);
    collarMesh.rotation.x = Math.PI / 2;
    collarMesh.position.y = -0.06;
    this.innerModel.add(collarMesh);

    // E. Aerodynamic Red Side Stabilizer Pods & Glowing Rings
    const podGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.035, 20);
    this.leftWing = new THREE.Group();
    this.rightWing = new THREE.Group();

    [-0.24, 0.24].forEach((xPos, idx) => {
      const podGroup = idx === 0 ? this.leftWing : this.rightWing;
      podGroup.position.set(xPos, 0.05, 0.0);

      const podMesh = new THREE.Mesh(podGeo, lenovoRedMat);
      podMesh.rotation.z = Math.PI / 2;
      podGroup.add(podMesh);

      // Glowing outer ring
      const podRing = new THREE.Mesh(
        new THREE.RingGeometry(0.025, 0.042, 20),
        new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
      );
      podRing.rotation.y = idx === 0 ? -Math.PI / 2 : Math.PI / 2;
      podRing.position.set(idx === 0 ? -0.02 : 0.02, 0, 0);
      podGroup.add(podRing);

      this.innerModel.add(podGroup);
    });

    // F. Lenovo Embossed Red Badge on Chest
    const badgeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.032, 0.012), lenovoRedMat);
    badgeMesh.position.set(0, -0.155, 0.224);
    this.innerModel.add(badgeMesh);

    // G. Top Holographic Projector Dome
    const domeGeo = new THREE.CylinderGeometry(0.04, 0.07, 0.025, 20);
    const domeMesh = new THREE.Mesh(domeGeo, whiteChassisMat);
    domeMesh.position.y = 0.26;
    this.innerModel.add(domeMesh);

    const emitterLens = new THREE.Mesh(
      new THREE.RingGeometry(0.01, 0.035, 18),
      new THREE.MeshBasicMaterial({ color: 0x00d2ff, side: THREE.DoubleSide })
    );
    emitterLens.rotation.x = -Math.PI / 2;
    emitterLens.position.y = 0.275;
    this.innerModel.add(emitterLens);

    // H. Bottom Ion Thruster & Dynamic Energy Glow
    const thrusterGeo = new THREE.ConeGeometry(0.075, 0.09, 20);
    const thrusterMat = new THREE.MeshStandardMaterial({ color: 0x141822, roughness: 0.5 });
    const thruster = new THREE.Mesh(thrusterGeo, thrusterMat);
    thruster.rotation.x = Math.PI;
    thruster.position.y = -0.28;
    this.innerModel.add(thruster);

    const plasmaRing = new THREE.Mesh(
      new THREE.RingGeometry(0.02, 0.06, 20),
      new THREE.MeshBasicMaterial({ color: 0x00d2ff, side: THREE.DoubleSide })
    );
    plasmaRing.rotation.x = Math.PI / 2;
    plasmaRing.position.y = -0.33;
    this.innerModel.add(plasmaRing);

    // Soft downward point light casting light onto the path beneath the robot
    this.thrusterLight = new THREE.PointLight(0x00d2ff, 1.2, 3.5, 2.0);
    this.thrusterLight.position.set(0, -0.35, 0);
    this.innerModel.add(this.thrusterLight);

    // Dedicated soft frontal fill light so robot chassis, eyes, and badges are always crisp and visible
    const robotFrontLight = new THREE.PointLight(0xffffff, 0.85, 3.5, 2.0);
    robotFrontLight.position.set(0, 0.1, 0.55);
    this.innerModel.add(robotFrontLight);

    // I. Floating Satellite Sensor Orbs (Mini companion drone hands)
    this.leftOrb = new THREE.Group();
    this.rightOrb = new THREE.Group();
    const orbGeo = new THREE.SphereGeometry(0.042, 18, 16);
    const orbMat = new THREE.MeshStandardMaterial({
      color: 0xf4f7fc,
      roughness: 0.1,
      metalness: 0.7
    });
    const orbRingMat = new THREE.MeshBasicMaterial({ color: 0xe2231a, side: THREE.DoubleSide });
    const orbThrusterMat = new THREE.MeshBasicMaterial({ color: 0x00d2ff, side: THREE.DoubleSide });

    [-0.34, 0.34].forEach((xOffset, idx) => {
      const orbGroup = idx === 0 ? this.leftOrb : this.rightOrb;
      orbGroup.position.set(xOffset, -0.06, 0.08);

      const orbMesh = new THREE.Mesh(orbGeo, orbMat);
      orbGroup.add(orbMesh);

      // Red equator band
      const band = new THREE.Mesh(new THREE.RingGeometry(0.038, 0.045, 18), orbRingMat);
      band.rotation.x = Math.PI / 2;
      orbGroup.add(band);

      // Bottom cyan micro thruster
      const thrusterCircle = new THREE.Mesh(new THREE.CircleGeometry(0.016, 16), orbThrusterMat);
      thrusterCircle.rotation.x = Math.PI / 2;
      thrusterCircle.position.y = -0.043;
      orbGroup.add(thrusterCircle);

      this.innerModel.add(orbGroup);
    });

    // Interactive click on robot body
    this.interactionManager.registerInteractable(this.torsoMesh, () => {
      soundManager.playAIChime();
      if (this.activeExhibit) {
        this.cardGroup.visible = !this.cardGroup.visible;
      } else {
        this.triggerGreeting();
      }
    });

    this.scene.add(this.robotGroup);
  }

  // ==========================================================================
  // 3. SET OF INSTRUCTIONS PANEL & SPEECH SYNTHESIS
  // ==========================================================================
  initInstructionPanel() {
    this.instructCanvas = document.createElement('canvas');
    this.instructCanvas.width = 1024;
    this.instructCanvas.height = 680;
    const ictx = this.instructCanvas.getContext('2d');

    // Translucent dark frosted panel
    ictx.fillStyle = 'rgba(10, 16, 26, 0.95)';
    ictx.beginPath();
    ictx.roundRect(10, 10, 1004, 660, 22);
    ictx.fill();

    // Lenovo Red & Cyan dual border
    ictx.strokeStyle = '#e2231a';
    ictx.lineWidth = 6;
    ictx.beginPath();
    ictx.roundRect(10, 10, 1004, 660, 22);
    ictx.stroke();

    ictx.strokeStyle = 'rgba(0, 210, 255, 0.4)';
    ictx.lineWidth = 2;
    ictx.beginPath();
    ictx.roundRect(18, 18, 988, 644, 16);
    ictx.stroke();

    // Header badge
    ictx.fillStyle = '#e2231a';
    ictx.fillRect(40, 36, 170, 42);
    ictx.fillStyle = '#ffffff';
    ictx.font = 'bold 24px Arial, sans-serif';
    ictx.textAlign = 'center';
    ictx.fillText('AI GUIDE', 125, 66);

    ictx.fillStyle = '#00d2ff';
    ictx.font = 'bold 22px monospace';
    ictx.textAlign = 'left';
    ictx.fillText('// LENOVO FUTURE EXPO 2026', 230, 66);

    // Title
    ictx.fillStyle = '#ffffff';
    ictx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
    ictx.fillText('WELCOME TO LENOVO FUTURE EXPO!', 40, 130);

    // Sub-title
    ictx.fillStyle = '#00ff96';
    ictx.font = 'bold 22px monospace';
    ictx.fillText('HOW TO EXPLORE & EXPERIENCE THE EXPO:', 40, 175);

    // Step-by-Step Instructions
    const steps = [
      { num: '1', title: 'WALK THROUGH THE ARCHWAY', desc: 'Step forward through the illuminated grand entrance arch into the main hall.' },
      { num: '2', title: 'EXPLORE 6 TECH ZONES', desc: 'Experience Legion Gaming, AI PC, Adaptive Computing, Personal AI, XR, and Future Lab.' },
      { num: '3', title: 'CLICK ANY PRODUCT FOR SPECS', desc: 'Click any laptop or exhibit and I will fly over to present detailed specifications.' },
      { num: '4', title: 'CONTROLS & 3D MAP', desc: 'Use WASD to move on PC (Left Stick on Quest 3). Press [ESC] or raise Left Palm for 3D Map.' }
    ];

    steps.forEach((st, idx) => {
      const y = 230 + idx * 85;

      // Number badge
      ictx.fillStyle = '#e2231a';
      ictx.beginPath();
      ictx.arc(60, y + 10, 18, 0, Math.PI * 2);
      ictx.fill();

      ictx.fillStyle = '#ffffff';
      ictx.font = 'bold 20px Arial';
      ictx.textAlign = 'center';
      ictx.fillText(st.num, 60, y + 17);

      // Step title & description
      ictx.textAlign = 'left';
      ictx.fillStyle = '#00d2ff';
      ictx.font = 'bold 22px "Segoe UI", Arial, sans-serif';
      ictx.fillText(st.title, 95, y + 5);

      ictx.fillStyle = '#cfd8dc';
      ictx.font = '19px "Segoe UI", Arial, sans-serif';
      ictx.fillText(st.desc, 95, y + 30);
    });

    // Start Exploring Action Hint
    ictx.fillStyle = 'rgba(226, 35, 26, 0.25)';
    ictx.fillRect(40, 575, 944, 55);
    ictx.strokeStyle = '#e2231a';
    ictx.lineWidth = 2;
    ictx.strokeRect(40, 575, 944, 55);

    ictx.fillStyle = '#ffffff';
    ictx.font = 'bold 22px monospace';
    ictx.textAlign = 'center';
    ictx.fillText('▶ CLICK ANY PRODUCT OR WALK FORWARD TO START ➔', 512, 610);

    this.instructTex = new THREE.CanvasTexture(this.instructCanvas);
    const panelGeo = new THREE.PlaneGeometry(1.20, 0.82);
    const panelMat = new THREE.MeshBasicMaterial({
      map: this.instructTex,
      transparent: true,
      side: THREE.DoubleSide
    });

    this.instructMesh = new THREE.Mesh(panelGeo, panelMat);
    // Float slightly to the right of the robot so it never blocks the center view towards the archway
    this.instructMesh.position.set(0.68, 0.15, 0);
    this.innerModel.add(this.instructMesh);

    // Interactive click on instruction panel to dismiss
    this.interactionManager.registerInteractable(this.instructMesh, () => {
      this.instructMesh.visible = false;
    });
  }

  // Voice narration & instruction trigger
  triggerGreeting() {
    this.hasGreeted = true;
    this.greetTimer = 0;
    this.state = 'GREETING';
    this.instructMesh.visible = true;

    try {
      soundManager.playAIChime();
    } catch (e) {}

    // 2D Desktop HUD
    guidanceSystem.showGuidance("Welcome to Lenovo Future Expo! Walk through the illuminated arch to begin. Click any product and I'll explain it.");

    // Web Speech API Voice Narration
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const speechText = "Welcome to Lenovo Future Expo. I am your AI Guide robot. Walk forward through the grand illuminated archway to enter the hall. Click any product or walk near an exhibit, and I will show you full specifications. Enjoy exploring the future of smarter technology!";
        const utterance = new SpeechSynthesisUtterance(speechText);
        utterance.pitch = 1.05;
        utterance.rate = 1.02;

        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          const preferredVoice = voices.find(v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Jenny')) && v.lang.startsWith('en')) || voices[0];
          if (preferredVoice) utterance.voice = preferredVoice;
        }

        this.isSpeaking = true;
        utterance.onend = () => {
          this.isSpeaking = false;
        };

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn("SpeechSynthesis error:", e);
      }
    }
  }

  // ==========================================================================
  // 4. FLOATING PRODUCT INFO CARD (Existing Project UI Style)
  // ==========================================================================
  initProductInfoCard() {
    this.cardGroup = new THREE.Group();
    this.cardGroup.name = "Robot_Product_Info_Card";
    // Float slightly to the right of the robot so it never blocks the exhibit
    this.cardGroup.position.set(0.68, 0.15, 0);
    this.cardGroup.scale.set(0.001, 0.001, 0.001);
    this.cardGroup.visible = false;
    this.innerModel.add(this.cardGroup);

    this.cardCanvas = document.createElement('canvas');
    this.cardCanvas.width = 1024;
    this.cardCanvas.height = 640;
    this.cardTexture = new THREE.CanvasTexture(this.cardCanvas);

    const cardGeo = new THREE.PlaneGeometry(1.20, 0.82);
    const cardMat = new THREE.MeshBasicMaterial({
      map: this.cardTexture,
      transparent: true,
      side: THREE.DoubleSide
    });
    this.cardMesh = new THREE.Mesh(cardGeo, cardMat);
    this.cardGroup.add(this.cardMesh);

    // Interactive Close Button on Card
    this.closeBtn = this.interactionManager.createWorldButton("✕ CLOSE", 0.45, 0.14, () => {
      this.dismissInfoCard();
    }, "#e2231a");
    this.closeBtn.position.set(0.40, -0.32, 0.02);
    this.cardGroup.add(this.closeBtn);
  }

  renderProductCard(exhibit) {
    if (!exhibit) return;
    const ctx = this.cardCanvas.getContext('2d');
    const w = this.cardCanvas.width;
    const h = this.cardCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Dark Frosted Obsidian Glass Background
    ctx.fillStyle = 'rgba(10, 16, 26, 0.94)';
    ctx.beginPath();
    ctx.roundRect(10, 10, w - 20, h - 20, 22);
    ctx.fill();

    // 2. Lenovo Red & Cyan Dual Border
    ctx.strokeStyle = '#e2231a';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(10, 10, w - 20, h - 20, 22);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0, 210, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(18, 18, w - 36, h - 36, 16);
    ctx.stroke();

    // 3. Lenovo Header Badge
    ctx.fillStyle = '#e2231a';
    ctx.fillRect(40, 36, 160, 42);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Lenovo', 120, 65);

    // Zone Badge
    ctx.fillStyle = '#00d2ff';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`// ${exhibit.zone.toUpperCase()}`, 220, 65);

    // 4. Product Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
    ctx.fillText(exhibit.productName, 40, 130);

    // Divider Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 155);
    ctx.lineTo(w - 40, 155);
    ctx.stroke();

    // 5. Key Specs (3 to 4 specs)
    ctx.fillStyle = '#00ff96';
    ctx.font = 'bold 22px monospace';
    ctx.fillText('KEY SPECIFICATIONS & HIGHLIGHTS:', 40, 195);

    exhibit.specs.forEach((spec, idx) => {
      // Bullet dot
      ctx.fillStyle = '#00d2ff';
      ctx.beginPath();
      ctx.arc(52, 235 + idx * 46, 6, 0, Math.PI * 2);
      ctx.fill();

      // Spec text
      ctx.fillStyle = '#f0f4f8';
      ctx.font = '22px "Segoe UI", Arial, sans-serif';
      ctx.fillText(spec, 72, 242 + idx * 46);
    });

    // 6. One-Line Description
    const descY = 445;
    ctx.fillStyle = 'rgba(226, 35, 26, 0.2)';
    ctx.fillRect(40, descY - 24, w - 80, 52);
    ctx.strokeStyle = 'rgba(226, 35, 26, 0.6)';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, descY - 24, w - 80, 52);

    ctx.fillStyle = '#e0e7ee';
    ctx.font = 'italic 20px "Segoe UI", Arial, sans-serif';
    ctx.fillText(`"${exhibit.description}"`, 55, descY + 8);

    // Subtle bottom footer hint
    ctx.fillStyle = '#90a4ae';
    ctx.font = '17px monospace';
    ctx.fillText('AI Guide Companion // Ready to answer questions', 40, 560);

    this.cardTexture.needsUpdate = true;
  }

  showProductInfo(exhibit) {
    if (!exhibit) return;
    this.activeExhibit = exhibit;
    this.state = 'PRESENTING';

    // Hide instruction panel
    this.instructMesh.visible = false;

    // Render & pop open info card
    this.renderProductCard(exhibit);
    this.cardGroup.visible = true;

    // Sound effect
    try {
      soundManager.playAIChime();
    } catch (e) {}

    // Update 2D guidance HUD
    guidanceSystem.showGuidance(
      `AI Guide: Presenting ${exhibit.productName} in ${exhibit.zone}.`,
      exhibit.position
    );

    // Speak product introduction
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(`This is the ${exhibit.productName}. ${exhibit.description}`);
        utter.rate = 1.02;
        this.isSpeaking = true;
        utter.onend = () => { this.isSpeaking = false; };
        window.speechSynthesis.speak(utter);
      } catch (e) {}
    }
  }

  dismissInfoCard() {
    this.activeExhibit = null;
    this.state = 'FOLLOWING';
    this.cardGroup.visible = false;
  }

  // ==========================================================================
  // 5. EXHIBIT CLICK BEACONS
  // ==========================================================================
  initExhibitInteractionTriggers() {
    this.beaconMeshes = [];
    EXHIBIT_PROFILES.forEach((profile) => {
      // Floating 3D Info Badge for direct clicks
      const beaconGroup = new THREE.Group();
      beaconGroup.position.copy(profile.position);
      beaconGroup.position.y += 1.45;
      if (profile.id === 'entrance') beaconGroup.position.z -= 0.6;

      const bCanvas = document.createElement('canvas');
      bCanvas.width = 384;
      bCanvas.height = 112;
      const bctx = bCanvas.getContext('2d');

      const drawBadge = (hovered = false) => {
        bctx.clearRect(0, 0, 384, 112);
        bctx.fillStyle = hovered ? 'rgba(226, 35, 26, 0.95)' : 'rgba(10, 16, 26, 0.90)';
        bctx.beginPath();
        bctx.roundRect(4, 4, 376, 104, 14);
        bctx.fill();

        bctx.strokeStyle = hovered ? '#ffffff' : '#e2231a';
        bctx.lineWidth = 4;
        bctx.beginPath();
        bctx.roundRect(4, 4, 376, 104, 14);
        bctx.stroke();

        bctx.fillStyle = '#ffffff';
        bctx.font = 'bold 24px Arial, sans-serif';
        bctx.textAlign = 'center';
        bctx.fillText('ℹ️ ASK AI GUIDE', 192, 45);

        bctx.fillStyle = hovered ? '#ffffff' : '#00d2ff';
        bctx.font = 'bold 18px monospace';
        bctx.fillText('CLICK FOR SPECS', 192, 82);
      };

      drawBadge(false);
      const bTex = new THREE.CanvasTexture(bCanvas);
      const bGeo = new THREE.PlaneGeometry(0.75, 0.22);
      const bMat = new THREE.MeshBasicMaterial({ map: bTex, transparent: true, side: THREE.DoubleSide });
      const bMesh = new THREE.Mesh(bGeo, bMat);
      beaconGroup.add(bMesh);

      this.interactionManager.registerInteractable(
        bMesh,
        () => {
          this.showProductInfo(profile);
        },
        () => {
          drawBadge(true);
          bTex.needsUpdate = true;
        },
        () => {
          drawBadge(false);
          bTex.needsUpdate = true;
        }
      );

      this.scene.add(beaconGroup);
      this.beaconMeshes.push({ group: beaconGroup, baseY: beaconGroup.position.y });
    });
  }

  // ==========================================================================
  // 6. FRAME-BY-FRAME UPDATE: SMOOTH FOLLOWING, COLLISION & ANIMATION
  // ==========================================================================
  update(time, delta = 0.016) {
    if (!this.camera || !this.robotGroup) return;

    // 1. Get true world position & orientation of the player
    this.camera.getWorldPosition(this.tempPlayerPos);
    this.camera.getWorldDirection(this.tempPlayerFwd);
    this.tempPlayerFwd.y = 0;
    this.tempPlayerFwd.normalize();

    this.tempPlayerRight.crossVectors(this.tempPlayerFwd, this.worldUp).normalize();

    // 2. Trigger initial greeting if not yet triggered
    if (!this.hasGreeted) {
      this.triggerGreeting();
    }

    // 3. Proximity detection: Did user walk near any exhibit?
    let closestExhibit = null;
    let closestDist = Infinity;

    EXHIBIT_PROFILES.forEach((exhibit) => {
      const dist = this.tempPlayerPos.distanceTo(exhibit.position);
      if (dist < exhibit.hitRadius && dist < closestDist) {
        closestDist = dist;
        closestExhibit = exhibit;
      }
    });

    if (closestExhibit && closestExhibit !== this.lastNearExhibit) {
      this.lastNearExhibit = closestExhibit;
      this.showProductInfo(closestExhibit);
    } else if (!closestExhibit && this.lastNearExhibit && closestDist > 5.5) {
      this.lastNearExhibit = null;
      if (this.state === 'PRESENTING') {
        this.dismissInfoCard();
      }
    }

    // 4. Calculate target position for the robot
    if (this.state === 'PRESENTING' && this.activeExhibit) {
      // Robot floats near the exhibit, offset to the side facing the player
      const standOffset = this.activeExhibit.robotStandOffset || new THREE.Vector3(1.6, 0.35, 1.0);
      this.targetFollowPos.copy(this.activeExhibit.position).add(standOffset);
      this.targetFollowPos.y = 1.62;
    } else if (this.state === 'GREETING') {
      // At start: exactly 2.0m in front of user and slightly to the right, eye level
      this.targetFollowPos.copy(this.tempPlayerPos);
      this.targetFollowPos.addScaledVector(this.tempPlayerRight, 0.85);
      this.targetFollowPos.addScaledVector(this.tempPlayerFwd, 2.0);
      this.targetFollowPos.y = 1.62;

      // Once player moves away from spawn by > 1.5m, transition to FOLLOWING
      if (this.tempPlayerPos.distanceTo(new THREE.Vector3(0, 1.70, 27.5)) > 1.5) {
        this.state = 'FOLLOWING';
        this.instructMesh.visible = false;
      }
    } else {
      // Following Mode: Smoothly moves with the user, staying at front-right companion position
      // Offset: 0.95m to the right, 1.3m forward, eye level
      this.targetFollowPos.copy(this.tempPlayerPos);
      this.targetFollowPos.addScaledVector(this.tempPlayerRight, 0.95);
      this.targetFollowPos.addScaledVector(this.tempPlayerFwd, 1.3);
      this.targetFollowPos.y = Math.max(1.4, this.tempPlayerPos.y - 0.08);
    }

    // 5. Boundary clamp to prevent clipping outside the hall
    this.targetFollowPos.x = Math.max(this.hallBounds.minX, Math.min(this.hallBounds.maxX, this.targetFollowPos.x));
    this.targetFollowPos.z = Math.max(this.hallBounds.minZ, Math.min(this.hallBounds.maxZ, this.targetFollowPos.z));

    // 6. Smooth physical movement (lerp)
    const followSpeed = this.state === 'PRESENTING' ? 3.5 : 4.5;
    this.robotWorldPos.lerp(this.targetFollowPos, Math.min(1.0, delta * followSpeed));
    this.robotGroup.position.copy(this.robotWorldPos);

    // Calculate velocity for realistic banking tilt
    this.currentVelocity.subVectors(this.robotWorldPos, this.previousPos).divideScalar(delta || 0.016);
    this.previousPos.copy(this.robotWorldPos);

    // Banking physics: tilt into turns
    const bankZ = THREE.MathUtils.clamp(-this.currentVelocity.x * 0.08, -0.22, 0.22);
    const bankX = THREE.MathUtils.clamp(this.currentVelocity.z * 0.06, -0.15, 0.15);
    this.innerModel.rotation.z = THREE.MathUtils.lerp(this.innerModel.rotation.z, bankZ, delta * 6.0);
    this.innerModel.rotation.x = THREE.MathUtils.lerp(this.innerModel.rotation.x, bankX, delta * 6.0);

    // 7. Face the player
    this.robotGroup.lookAt(this.tempPlayerPos.x, this.robotGroup.position.y, this.tempPlayerPos.z);

    // 8. Hover Floating Bobbing & Thruster Glow
    const hoverOffset = Math.sin(time * 3.2) * 0.045;
    this.innerModel.position.y = hoverOffset;

    if (this.thrusterLight) {
      this.thrusterLight.intensity = 1.0 + Math.sin(time * 4.0) * 0.3;
    }

    // Dynamic wing flap / tilt
    if (this.leftWing && this.rightWing) {
      const wingTilt = Math.sin(time * 2.8) * 0.08;
      this.leftWing.rotation.x = wingTilt;
      this.rightWing.rotation.x = -wingTilt;
    }

    // Floating satellite sensor orbs bobbing
    if (this.leftOrb && this.rightOrb) {
      this.leftOrb.position.y = -0.06 + Math.sin(time * 3.5) * 0.025;
      this.rightOrb.position.y = -0.06 + Math.cos(time * 3.5) * 0.025;
    }

    // 9. Card scaling animation
    if (this.cardGroup.visible) {
      const curScale = this.cardGroup.scale.x;
      const targetScale = 1.0;
      const newScale = THREE.MathUtils.lerp(curScale, targetScale, Math.min(1.0, delta * 8.0));
      this.cardGroup.scale.set(newScale, newScale, newScale);
    }

    // 10. Eye Blinking Animation (Blinks every 3 to 4.5 seconds)
    this.blinkTimer += delta;
    if (!this.isBlinking && this.blinkTimer > 3.5 + Math.sin(time) * 1.0) {
      this.isBlinking = true;
      this.blinkTimer = 0;
      this.leftEye.scale.y = 0.1;
      this.rightEye.scale.y = 0.1;
    } else if (this.isBlinking && this.blinkTimer > 0.12) {
      this.isBlinking = false;
      this.leftEye.scale.y = 1.0;
      this.rightEye.scale.y = 1.0;
    }

    // 11. Speech Waveform Bar Animation (Visualizes voice speaking)
    if (this.mouthBar) {
      if (this.isSpeaking) {
        const wave = 0.5 + Math.abs(Math.sin(time * 16.0)) * 2.5;
        this.mouthBar.scale.set(1.0 + Math.sin(time * 12.0) * 0.4, wave, 1.0);
      } else {
        this.mouthBar.scale.set(1.0, 1.0, 1.0);
      }
    }

    // 12. Animate floating exhibit info beacons
    if (this.beaconMeshes) {
      this.beaconMeshes.forEach((b, idx) => {
        if (b && b.group) {
          b.group.position.y = b.baseY + Math.sin(time * 2.5 + idx) * 0.03;
          b.group.lookAt(this.tempPlayerPos.x, b.group.position.y, this.tempPlayerPos.z);
        }
      });
    }
  }
}

export function setupGuideRobot(scene, camera, interactionManager) {
  return new GuideRobotManager(scene, camera, interactionManager);
}
