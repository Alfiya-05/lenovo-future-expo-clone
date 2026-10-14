/**
 * Lenovo Future Expo - Genuine 3D Miniature Expo Model [BUILD: 3D-MAP-001]
 *
 * Implements:
 *  - 1:45 physical scale 3D replica of the real 48m x 28m Lenovo Expo Hall.
 *  - Architecturally accurate layout: Entrance Portal, Main Aisle, 6 Stalls + Future Lab Pavilion.
 *  - Visually distinct miniature stall geometry & themed holographic accents.
 *  - Interactive 3D raycastable hit-boxes on every stall with hover expansion & selection brackets.
 *  - Floating 3D "TELEPORT HERE" holographic plaques.
 *  - Live "YOU ARE HERE" visitor beacon tracking real-world player coordinates in real-time.
 *  - Pinned holographic tabletop projection that stays stable while user inspects destinations.
 */
import * as THREE from 'three';
import { EXPO_DESTINATIONS, STALL_IDS } from './expo-destinations.js';
import { soundManager } from './audio.js';

export const MAP_SCALE = 0.022; // 1 real meter = 2.2 cm in holographic miniature

export class ExpoMap3D {
  constructor(scene, camera, teleportManager) {
    this.scene = scene;
    this.camera = camera;
    this.teleportManager = teleportManager;

    this.rootGroup = new THREE.Group();
    this.rootGroup.name = "Miniature_3D_Expo_Hologram";
    this.rootGroup.visible = false;
    this.rootGroup.scale.set(0, 0, 0);

    this.isOpen = false;
    this.currentScale = 0;
    this.targetPos = new THREE.Vector3();
    this.targetQuat = new THREE.Quaternion();

    // Interactive stalls
    this.stallNodes = new Map();
    this.interactiveMeshes = [];
    this.hoveredStallId = null;

    // Animated elements
    this.rotatables = [];
    this.pulsables = [];

    // Build the miniature world
    this.buildMapPlinth();
    this.buildArchitecturalShell();
    this.buildMiniatureStalls();
    this.buildVisitorLocationMarker();
    this.buildMapHeaderAndControls();

    this.scene.add(this.rootGroup);
  }

  /**
   * Builds the high-tech plinth base with dark graphite bevels and Lenovo red chamfer lines.
   */
  buildMapPlinth() {
    this.plinthGroup = new THREE.Group();

    // 1. Base Plate (Dark graphite slab)
    const baseGeo = new THREE.BoxGeometry(0.70, 0.020, 1.14);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0e131d,
      roughness: 0.25,
      metalness: 0.8
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.010;
    this.plinthGroup.add(baseMesh);

    // 2. Lenovo Red Accent Border Frame
    const frameGeo = new THREE.BoxGeometry(0.704, 0.006, 1.144);
    const frameMat = new THREE.MeshBasicMaterial({ color: 0xe2231a });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.position.y = -0.002;
    this.plinthGroup.add(frameMesh);

    // 3. Hall Floor Grid (Interior floor)
    const floorGeo = new THREE.PlaneGeometry(0.66, 1.08);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x121722,
      roughness: 0.35,
      metalness: 0.6
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = 0.002;
    this.plinthGroup.add(floorMesh);

    // 4. Central Walking Aisle Glowing Stripe
    const aisleGeo = new THREE.PlaneGeometry(0.12, 1.06);
    const aisleMat = new THREE.MeshBasicMaterial({
      color: 0x00d2ff,
      transparent: true,
      opacity: 0.22,
      depthWrite: false
    });
    const aisleMesh = new THREE.Mesh(aisleGeo, aisleMat);
    aisleMesh.rotation.x = -Math.PI / 2;
    aisleMesh.position.y = 0.003;
    this.plinthGroup.add(aisleMesh);

    // Dashed guide center line
    const lineGeo = new THREE.PlaneGeometry(0.006, 1.02);
    const lineMat = new THREE.MeshBasicMaterial({
      color: 0x00d2ff,
      transparent: true,
      opacity: 0.75
    });
    const lineMesh = new THREE.Mesh(lineGeo, lineMat);
    lineMesh.rotation.x = -Math.PI / 2;
    lineMesh.position.y = 0.004;
    this.plinthGroup.add(lineMesh);

    this.rootGroup.add(this.plinthGroup);
  }

  /**
   * Miniature perimeter walls and entrance portal.
   */
  buildArchitecturalShell() {
    this.shellGroup = new THREE.Group();

    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x182436,
      transparent: true,
      opacity: 0.45,
      roughness: 0.2,
      metalness: 0.7
    });

    const wallH = 0.065; // ~3m scaled
    const wallT = 0.008;

    // West (Left) Wall
    const westGeo = new THREE.BoxGeometry(wallT, wallH, 1.08);
    const westMesh = new THREE.Mesh(westGeo, wallMat);
    westMesh.position.set(-0.33, wallH * 0.5, 0);
    this.shellGroup.add(westMesh);

    // East (Right) Wall
    const eastGeo = new THREE.BoxGeometry(wallT, wallH, 1.08);
    const eastMesh = new THREE.Mesh(eastGeo, wallMat);
    eastMesh.position.set(0.33, wallH * 0.5, 0);
    this.shellGroup.add(eastMesh);

    // North (Rear) Wall (behind Future Lab)
    const northGeo = new THREE.BoxGeometry(0.66, wallH, wallT);
    const northMesh = new THREE.Mesh(northGeo, wallMat);
    northMesh.position.set(0, wallH * 0.5, -0.54);
    this.shellGroup.add(northMesh);

    // South (Front) Entrance Wall with 8m Archway opening
    const southLGeo = new THREE.BoxGeometry(0.24, wallH, wallT);
    const southLMesh = new THREE.Mesh(southLGeo, wallMat);
    southLMesh.position.set(-0.21, wallH * 0.5, 0.54);
    this.shellGroup.add(southLMesh);

    const southRGeo = new THREE.BoxGeometry(0.24, wallH, wallT);
    const southRMesh = new THREE.Mesh(southRGeo, wallMat);
    southRMesh.position.set(0.21, wallH * 0.5, 0.54);
    this.shellGroup.add(southRMesh);

    // Entrance Overhead Arch Header
    const archGeo = new THREE.BoxGeometry(0.18, 0.018, wallT * 1.5);
    const archMat = new THREE.MeshBasicMaterial({ color: 0xe2231a });
    const archMesh = new THREE.Mesh(archGeo, archMat);
    archMesh.position.set(0, wallH - 0.009, 0.54);
    this.shellGroup.add(archMesh);

    this.rootGroup.add(this.shellGroup);
  }

  /**
   * Builds the 7 miniature 3D booths corresponding to the real expo layout.
   */
  buildMiniatureStalls() {
    this.stallsContainer = new THREE.Group();

    EXPO_DESTINATIONS.forEach(dest => {
      const stallGroup = new THREE.Group();
      stallGroup.name = `MiniStall_${dest.id}`;

      // Calculate miniature local position from real world coordinates
      const localX = dest.boothCenter.x * MAP_SCALE;
      const localZ = dest.boothCenter.z * MAP_SCALE;
      stallGroup.position.set(localX, 0, localZ);

      // 1. Themed Miniature Architecture & 3D Objects
      const visualModel = this.createStallVisualModel(dest);
      stallGroup.add(visualModel);

      // 2. Glowing Interactive Highlight Bracket (active on hover)
      const bracketGeo = new THREE.BoxGeometry(0.19, 0.11, 0.17);
      const bracketEdges = new THREE.EdgesGeometry(bracketGeo);
      const bracketMat = new THREE.LineBasicMaterial({
        color: dest.themeColor,
        transparent: true,
        opacity: 0.0,
        linewidth: 2
      });
      const bracketMesh = new THREE.LineSegments(bracketEdges, bracketMat);
      bracketMesh.position.y = 0.055;
      stallGroup.add(bracketMesh);

      // 3. Floating 3D Stall Name Badge (always visible)
      const badgeCanvas = document.createElement('canvas');
      badgeCanvas.width = 384;
      badgeCanvas.height = 112;
      const bCtx = badgeCanvas.getContext('2d');
      bCtx.fillStyle = 'rgba(10, 16, 26, 0.92)';
      bCtx.fillRect(4, 4, 376, 104);
      bCtx.strokeStyle = '#' + dest.themeColor.toString(16).padStart(6, '0');
      bCtx.lineWidth = 4;
      bCtx.strokeRect(4, 4, 376, 104);

      bCtx.fillStyle = '#' + dest.themeColor.toString(16).padStart(6, '0');
      bCtx.font = 'bold 26px Arial';
      bCtx.fillText(dest.zone.toUpperCase(), 18, 40);

      bCtx.fillStyle = '#ffffff';
      bCtx.font = 'bold 30px Arial';
      bCtx.fillText(dest.shortName, 18, 85);

      const badgeTex = new THREE.CanvasTexture(badgeCanvas);
      badgeTex.generateMipmaps = true;
      const badgeGeo = new THREE.PlaneGeometry(0.12, 0.035);
      const badgeMat = new THREE.MeshBasicMaterial({
        map: badgeTex,
        transparent: true,
        side: THREE.DoubleSide
      });
      const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
      badgeMesh.position.set(0, 0.095, 0);
      badgeMesh.rotation.x = -0.35; // Tilt towards camera
      stallGroup.add(badgeMesh);

      // 4. Floating 3D "TELEPORT HERE" Plaque (pops up on hover)
      const tpCanvas = document.createElement('canvas');
      tpCanvas.width = 440;
      tpCanvas.height = 130;
      const tpCtx = tpCanvas.getContext('2d');
      tpCtx.fillStyle = 'rgba(0, 210, 255, 0.95)';
      tpCtx.fillRect(4, 4, 432, 122);
      tpCtx.strokeStyle = '#ffffff';
      tpCtx.lineWidth = 6;
      tpCtx.strokeRect(4, 4, 432, 122);

      tpCtx.fillStyle = '#0a101a';
      tpCtx.font = 'bold 32px Arial';
      tpCtx.textAlign = 'center';
      tpCtx.fillText('⚡ TELEPORT HERE', 220, 52);

      tpCtx.fillStyle = '#052a38';
      tpCtx.font = 'bold 24px Arial';
      tpCtx.fillText('PINCH TO ARRIVE', 220, 95);

      const tpTex = new THREE.CanvasTexture(tpCanvas);
      const tpGeo = new THREE.PlaneGeometry(0.14, 0.042);
      const tpMat = new THREE.MeshBasicMaterial({
        map: tpTex,
        transparent: true,
        opacity: 0.0,
        side: THREE.DoubleSide
      });
      const tpMesh = new THREE.Mesh(tpGeo, tpMat);
      tpMesh.position.set(0, 0.145, 0);
      tpMesh.rotation.x = -0.35;
      tpMesh.visible = false;
      stallGroup.add(tpMesh);

      // 5. Precise Hit-Box for Raycasting
      const hitGeo = new THREE.BoxGeometry(0.22, 0.16, 0.20);
      const hitMat = new THREE.MeshBasicMaterial({
        visible: false,
        wireframe: true
      });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.position.y = 0.06;
      hitMesh.userData.isStallHitBox = true;
      hitMesh.userData.stallId = dest.id;
      hitMesh.userData.dest = dest;
      hitMesh.userData.stallGroup = stallGroup;
      stallGroup.add(hitMesh);

      // Add all stall meshes to interactive raycasting target list
      stallGroup.traverse(child => {
        if (child.isMesh && child !== bracketMesh) {
          child.userData.stallId = dest.id;
          child.userData.dest = dest;
          this.interactiveMeshes.push(child);
        }
      });
      this.stallNodes.set(dest.id, {
        dest,
        group: stallGroup,
        hitMesh,
        bracketMesh,
        bracketMat,
        tpMesh,
        tpMat,
        visualModel,
        isHovered: false
      });

      this.stallsContainer.add(stallGroup);
    });

    this.rootGroup.add(this.stallsContainer);
  }

  /**
   * Creates recognizable miniature 3D geometries for each stall.
   */
  createStallVisualModel(dest) {
    const group = new THREE.Group();

    // Standard booth platform
    const platGeo = new THREE.BoxGeometry(0.16, 0.008, 0.13);
    const platMat = new THREE.MeshStandardMaterial({
      color: 0x141b26,
      metalness: 0.6,
      roughness: 0.3
    });
    const platMesh = new THREE.Mesh(platGeo, platMat);
    platMesh.position.y = 0.004;
    group.add(platMesh);

    // Miniature perimeter accent glow
    const trimGeo = new THREE.BoxGeometry(0.162, 0.002, 0.132);
    const trimMat = new THREE.MeshBasicMaterial({ color: dest.themeColor });
    const trimMesh = new THREE.Mesh(trimGeo, trimMat);
    trimMesh.position.y = 0.007;
    group.add(trimMesh);

    switch (dest.id) {
      case STALL_IDS.ENTRANCE: {
        // Miniature Entrance Arch + Holographic avatar
        const archL = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.06, 12), new THREE.MeshBasicMaterial({ color: 0xe2231a }));
        archL.position.set(-0.04, 0.03, 0);
        group.add(archL);

        const archR = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.06, 12), new THREE.MeshBasicMaterial({ color: 0xe2231a }));
        archR.position.set(0.04, 0.03, 0);
        group.add(archR);

        const archTop = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.008, 0.012), new THREE.MeshBasicMaterial({ color: 0x00d2ff }));
        archTop.position.set(0, 0.06, 0);
        group.add(archTop);

        // Guide hologram
        const holo = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.012, 0.038, 12), new THREE.MeshBasicMaterial({ color: 0x00d2ff, wireframe: true }));
        holo.position.set(0, 0.024, -0.01);
        group.add(holo);
        this.rotatables.push({ mesh: holo, speed: 1.5 });
        break;
      }

      case STALL_IDS.LEGION_GAMING: {
        // Miniature angled desk & glowing multi-monitors
        const desk = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.022, 0.035), new THREE.MeshStandardMaterial({ color: 0x0a0c10 }));
        desk.position.set(0, 0.015, -0.01);
        group.add(desk);

        const screen = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.028, 0.004), new THREE.MeshBasicMaterial({ color: 0xff2a6d }));
        screen.position.set(0, 0.038, -0.018);
        group.add(screen);

        // Floating mini target orbs
        for (let i = 0; i < 3; i++) {
          const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.007), new THREE.MeshBasicMaterial({ color: 0xff2a6d, wireframe: true }));
          orb.position.set(-0.035 + i * 0.035, 0.055, 0.015);
          group.add(orb);
          this.rotatables.push({ mesh: orb, speed: 2.0 + i });
        }
        break;
      }

      case STALL_IDS.AI_PC: {
        // Pedestal with miniature open laptop
        const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.028, 0.032, 16), new THREE.MeshStandardMaterial({ color: 0x182436 }));
        ped.position.set(0, 0.016, 0);
        group.add(ped);

        // Laptop base
        const lapBase = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.003, 0.024), new THREE.MeshStandardMaterial({ color: 0x223044, metalness: 0.8 }));
        lapBase.position.set(0, 0.033, 0);
        group.add(lapBase);

        // Laptop lid open at ~105 deg
        const lapLid = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.022, 0.002), new THREE.MeshBasicMaterial({ color: 0x00d2ff }));
        lapLid.position.set(0, 0.044, -0.011);
        lapLid.rotation.x = -0.25;
        group.add(lapLid);

        // Glowing NPU socket
        const npu = new THREE.Mesh(new THREE.RingGeometry(0.008, 0.014, 16), new THREE.MeshBasicMaterial({ color: 0x00ff96, side: THREE.DoubleSide }));
        npu.rotation.x = -Math.PI / 2;
        npu.position.set(0.035, 0.033, 0.015);
        group.add(npu);
        break;
      }

      case STALL_IDS.ADAPTIVE_COMPUTING: {
        // Dual screen morphing device & dial
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.004, 0.028), new THREE.MeshStandardMaterial({ color: 0x241d10 }));
        base.position.set(0, 0.022, 0);
        group.add(base);

        const screenA = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.026, 0.002), new THREE.MeshBasicMaterial({ color: 0xffb300 }));
        screenA.position.set(0, 0.034, -0.012);
        screenA.rotation.x = -0.3;
        group.add(screenA);

        // Mode Dial
        const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.006, 16), new THREE.MeshBasicMaterial({ color: 0xff8c00 }));
        dial.position.set(-0.04, 0.020, 0.02);
        group.add(dial);
        this.rotatables.push({ mesh: dial, speed: 1.0 });
        break;
      }

      case STALL_IDS.PERSONAL_AI: {
        // Connected devices (mini laptop, mini phone, and glowing arc)
        const lap = new THREE.Mesh(new THREE.BoxGeometry(0.030, 0.004, 0.022), new THREE.MeshStandardMaterial({ color: 0x0f241a }));
        lap.position.set(-0.03, 0.020, 0);
        group.add(lap);

        const phone = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.003, 0.022), new THREE.MeshBasicMaterial({ color: 0x00ff96 }));
        phone.position.set(0.035, 0.020, 0);
        group.add(phone);

        // Floating data transmission orb
        const orb = new THREE.Mesh(new THREE.SphereGeometry(0.007, 12, 12), new THREE.MeshBasicMaterial({ color: 0x00ff96 }));
        orb.position.set(0, 0.038, 0);
        group.add(orb);
        this.pulsables.push({ mesh: orb, axis: 'x', amp: 0.03, freq: 3.0 });
        break;
      }

      case STALL_IDS.LENOVO_XR: {
        // Spatial XR Headset with glowing concentric rings
        const headset = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.016, 0.018), new THREE.MeshStandardMaterial({ color: 0x181228 }));
        headset.position.set(0, 0.030, 0);
        group.add(headset);

        const visor = new THREE.Mesh(new THREE.BoxGeometry(0.030, 0.012, 0.004), new THREE.MeshBasicMaterial({ color: 0xb388ff }));
        visor.position.set(0, 0.030, 0.010);
        group.add(visor);

        // Concentric holographic rings
        const r1 = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.0018, 8, 24), new THREE.MeshBasicMaterial({ color: 0xb388ff }));
        r1.position.set(0, 0.030, 0);
        group.add(r1);
        this.rotatables.push({ mesh: r1, speed: -1.8, axis: 'y' });

        const r2 = new THREE.Mesh(new THREE.TorusGeometry(0.034, 0.0018, 8, 24), new THREE.MeshBasicMaterial({ color: 0x00d2ff }));
        r2.position.set(0, 0.030, 0);
        group.add(r2);
        this.rotatables.push({ mesh: r2, speed: 1.2, axis: 'x' });
        break;
      }

      case STALL_IDS.FUTURE_LAB: {
        // Rear Pavilion: Curved 14m video wall miniature + 5 concept node pillars
        const wallCurveGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.055, 32, 1, true, -Math.PI * 0.45, Math.PI * 0.90);
        const wallMat = new THREE.MeshBasicMaterial({
          color: 0x00d2ff,
          side: THREE.DoubleSide
        });
        const wallMesh = new THREE.Mesh(wallCurveGeo, wallMat);
        wallMesh.position.set(0, 0.030, 0.04);
        group.add(wallMesh);

        // 5 miniature concept node pillars
        const nodeColors = [0x00d2ff, 0xffb300, 0x00ff96, 0xb388ff, 0xff2a6d];
        const angles = [-0.6, -0.3, 0.0, 0.3, 0.6];
        angles.forEach((ang, idx) => {
          const nx = Math.sin(ang) * 0.07;
          const nz = Math.cos(ang) * 0.07 - 0.03;
          const pillar = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.0065),
            new THREE.MeshBasicMaterial({ color: nodeColors[idx] })
          );
          pillar.position.set(nx, 0.025, nz);
          group.add(pillar);
          this.rotatables.push({ mesh: pillar, speed: 2.0 });
        });
        break;
      }
    }

    return group;
  }

  /**
   * Real-time visitor indicator: Pulsing beacon ring + diamond pin + "YOU ARE HERE".
   */
  buildVisitorLocationMarker() {
    this.visitorGroup = new THREE.Group();
    this.visitorGroup.name = "Visitor_Live_Location_Marker";

    // Pulsing floor ring
    const ringGeo = new THREE.RingGeometry(0.016, 0.025, 24);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00ff96,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    this.visitorRing = new THREE.Mesh(ringGeo, ringMat);
    this.visitorRing.rotation.x = -Math.PI / 2;
    this.visitorRing.position.y = 0.008;
    this.visitorGroup.add(this.visitorRing);

    // Downward pointing diamond / pin head
    const pinGeo = new THREE.OctahedronGeometry(0.012);
    const pinMat = new THREE.MeshBasicMaterial({ color: 0x00ff96 });
    this.visitorPin = new THREE.Mesh(pinGeo, pinMat);
    this.visitorPin.position.y = 0.036;
    this.visitorGroup.add(this.visitorPin);

    // Floating "YOU ARE HERE" tag
    const tagCanvas = document.createElement('canvas');
    tagCanvas.width = 256;
    tagCanvas.height = 72;
    const tCtx = tagCanvas.getContext('2d');
    tCtx.fillStyle = '#00ff96';
    tCtx.fillRect(4, 4, 248, 64);
    tCtx.fillStyle = '#0a101a';
    tCtx.font = 'bold 24px Arial';
    tCtx.textAlign = 'center';
    tCtx.fillText('YOU ARE HERE', 128, 44);

    const tagTex = new THREE.CanvasTexture(tagCanvas);
    const tagGeo = new THREE.PlaneGeometry(0.075, 0.022);
    const tagMat = new THREE.MeshBasicMaterial({ map: tagTex, transparent: true, side: THREE.DoubleSide });
    const tagMesh = new THREE.Mesh(tagGeo, tagMat);
    tagMesh.position.set(0, 0.058, 0);
    tagMesh.rotation.x = -0.35;
    this.visitorGroup.add(tagMesh);

    this.rootGroup.add(this.visitorGroup);
  }

  /**
   * Builds the title banner and 3D Close button on the miniature map frame.
   */
  buildMapHeaderAndControls() {
    // 1. Top Header Plate
    const headerCanvas = document.createElement('canvas');
    headerCanvas.width = 1024;
    headerCanvas.height = 140;
    const hCtx = headerCanvas.getContext('2d');
    hCtx.fillStyle = 'rgba(8, 12, 18, 0.96)';
    hCtx.fillRect(4, 4, 1016, 132);
    hCtx.strokeStyle = '#00d2ff';
    hCtx.lineWidth = 6;
    hCtx.strokeRect(4, 4, 1016, 132);

    hCtx.fillStyle = '#e2231a';
    hCtx.fillRect(20, 20, 160, 48);
    hCtx.fillStyle = '#ffffff';
    hCtx.font = 'bold 30px Arial';
    hCtx.fillText('Lenovo', 48, 55);

    hCtx.fillStyle = '#00d2ff';
    hCtx.font = 'bold 32px Arial';
    hCtx.fillText('3D SPATIAL EXPO MAP // TOUCH / PINCH ANY STALL TO TELEPORT', 205, 55);

    hCtx.fillStyle = '#90a4ae';
    hCtx.font = '22px Arial';
    hCtx.fillText('Exact 1:45 physical scale model of the 48m x 28m exhibition hall', 205, 98);

    const hTex = new THREE.CanvasTexture(headerCanvas);
    const hGeo = new THREE.PlaneGeometry(0.66, 0.09);
    const hMat = new THREE.MeshBasicMaterial({ map: hTex, transparent: true, side: THREE.DoubleSide });
    const hMesh = new THREE.Mesh(hGeo, hMat);
    hMesh.position.set(0, 0.08, -0.57);
    hMesh.rotation.x = 0.25;
    this.rootGroup.add(hMesh);

    // 2. 3D Close Button on bottom frame
    const closeBtnGroup = new THREE.Group();
    closeBtnGroup.name = "Map_3D_Close_Button";

    const cBaseGeo = new THREE.BoxGeometry(0.24, 0.028, 0.045);
    const cBaseMat = new THREE.MeshStandardMaterial({
      color: 0x221014,
      metalness: 0.7,
      roughness: 0.3
    });
    this.closeBtnMesh = new THREE.Mesh(cBaseGeo, cBaseMat);
    closeBtnGroup.add(this.closeBtnMesh);

    const cCanvas = document.createElement('canvas');
    cCanvas.width = 384;
    cCanvas.height = 96;
    const cCtx = cCanvas.getContext('2d');
    cCtx.fillStyle = '#e2231a';
    cCtx.fillRect(4, 4, 376, 88);
    cCtx.fillStyle = '#ffffff';
    cCtx.font = 'bold 34px Arial';
    cCtx.textAlign = 'center';
    cCtx.fillText('✕  CLOSE MAP', 192, 58);

    const cTex = new THREE.CanvasTexture(cCanvas);
    const cLabelGeo = new THREE.PlaneGeometry(0.22, 0.024);
    const cLabelMat = new THREE.MeshBasicMaterial({ map: cTex, transparent: true, side: THREE.DoubleSide });
    const cLabelMesh = new THREE.Mesh(cLabelGeo, cLabelMat);
    cLabelMesh.position.set(0, 0.015, 0);
    cLabelMesh.rotation.x = -Math.PI / 2;
    closeBtnGroup.add(cLabelMesh);

    // Hit-box for Close Button
    const cHitGeo = new THREE.BoxGeometry(0.26, 0.05, 0.06);
    const cHitMesh = new THREE.Mesh(cHitGeo, new THREE.MeshBasicMaterial({ visible: false }));
    cHitMesh.userData.isMapCloseBtn = true;
    closeBtnGroup.add(cHitMesh);

    closeBtnGroup.position.set(0, 0.015, 0.60);
    this.closeBtnGroup = closeBtnGroup;
    this.rootGroup.add(closeBtnGroup);
    this.interactiveMeshes.push(cHitMesh);
  }

  /**
   * Opens the miniature 3D map, anchoring it stably in front of the viewer.
   */
  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.rootGroup.visible = true;
    soundManager.playClick();

    // Position map stably in front of user's camera
    const camPos = new THREE.Vector3();
    const camDir = new THREE.Vector3();
    this.camera.getWorldPosition(camPos);
    this.camera.getWorldDirection(camDir);

    // Flat horizontal look direction
    const flatDir = new THREE.Vector3(camDir.x, 0, camDir.z).normalize();
    if (flatDir.lengthSq() < 0.01) flatDir.set(0, 0, -1);

    // Place ~0.60m in front, ~0.18m below eye level
    this.targetPos.copy(camPos)
      .addScaledVector(flatDir, 0.62)
      .add(new THREE.Vector3(0, -0.16, 0));

    this.rootGroup.position.copy(this.targetPos);

    // Tilt ~26° towards user for comfortable tabletop viewing
    this.rootGroup.lookAt(camPos.x, this.rootGroup.position.y, camPos.z);
    this.rootGroup.rotation.x += 0.45; // ~26 deg tilt
    this.targetQuat.copy(this.rootGroup.quaternion);

    this.currentScale = 0.01;
    this.rootGroup.scale.setScalar(this.currentScale);
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.hoveredStallId = null;
    this.resetAllStallHighlights();
    soundManager.playClick();
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  /**
   * Raycast testing for stalls and close button.
   */
  evaluateRayIntersection(raycaster) {
    if (!this.isOpen || this.currentScale < 0.2) return null;

    const hits = raycaster.intersectObjects(this.interactiveMeshes, true);
    if (hits.length > 0) {
      const topHit = hits[0].object;
      if (topHit.userData.isMapCloseBtn) {
        this.setHoveredStall(null);
        return { type: 'close' };
      }
      if (topHit.userData.stallId) {
        this.setHoveredStall(topHit.userData.stallId);
        return {
          type: 'stall',
          stallId: topHit.userData.stallId,
          dest: topHit.userData.dest || getDestinationById(topHit.userData.stallId)
        };
      }
    }

    this.setHoveredStall(null);
    return null;
  }

  setHoveredStall(stallId) {
    if (this.hoveredStallId === stallId) return;

    this.hoveredStallId = stallId;

    if (stallId) {
      soundManager.playClick();
    }

    this.stallNodes.forEach((node, id) => {
      const isHovered = id === stallId;
      node.isHovered = isHovered;

      // Highlight bracket
      node.bracketMat.opacity = isHovered ? 0.95 : 0.0;

      // Teleport plaque
      node.tpMesh.visible = isHovered;
      node.tpMat.opacity = isHovered ? 1.0 : 0.0;

      // Visual model elevation
      const targetY = isHovered ? 0.012 : 0.0;
      node.visualModel.position.y = targetY;
    });
  }

  resetAllStallHighlights() {
    this.stallNodes.forEach((node) => {
      node.bracketMat.opacity = 0.0;
      node.tpMesh.visible = false;
      node.tpMat.opacity = 0.0;
      node.visualModel.position.y = 0.0;
    });
  }

  /**
   * Selects the currently hovered stall and triggers safe teleportation.
   */
  selectCurrentHovered() {
    if (!this.isOpen) return false;

    if (this.hoveredStallId) {
      const stallId = this.hoveredStallId;
      const success = this.teleportManager.teleportToStall(stallId);
      if (success) {
        this.close(); // Smoothly dismiss map after teleport
      }
      return success;
    }
    return false;
  }

  /**
   * Per-frame update: Smooth scaling, beacon tracking, micro-animations.
   */
  update(delta, time, userWorldX, userWorldZ) {
    // 1. Scale Interpolation
    const targetScale = this.isOpen ? 1.0 : 0.0;
    this.currentScale = THREE.MathUtils.lerp(this.currentScale, targetScale, Math.min(1.0, delta * 12.0));

    if (this.currentScale > 0.005) {
      this.rootGroup.visible = true;
      this.rootGroup.scale.setScalar(this.currentScale);
    } else {
      this.rootGroup.visible = false;
      return;
    }

    // 2. Real-Time "YOU ARE HERE" Visitor Marker Positioning
    if (this.visitorGroup) {
      const miniX = userWorldX * MAP_SCALE;
      const miniZ = userWorldZ * MAP_SCALE;
      this.visitorGroup.position.set(miniX, 0, miniZ);

      // Pulsing ring effect
      if (this.visitorRing) {
        const pulse = 1.0 + Math.sin(time * 4.0) * 0.25;
        this.visitorRing.scale.set(pulse, pulse, 1.0);
      }
      if (this.visitorPin) {
        this.visitorPin.rotation.y += delta * 2.0;
        this.visitorPin.position.y = 0.036 + Math.sin(time * 3.0) * 0.005;
      }
    }

    // 3. Stall Micro-Animations
    this.rotatables.forEach(item => {
      if (item.axis === 'x') item.mesh.rotation.x += delta * item.speed;
      else item.mesh.rotation.y += delta * item.speed;
    });

    this.pulsables.forEach(item => {
      item.mesh.position.x = Math.sin(time * item.freq) * item.amp;
    });
  }
}
