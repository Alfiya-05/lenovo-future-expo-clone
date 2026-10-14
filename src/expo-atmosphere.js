/**
 * Lenovo Future Expo - Atmospheric Neon Architecture & Realistic Attendees
 * Based directly on Lenovo trade-show reference images:
 *  - Image 1: Massive angular entrance arch with cyan chevron roof header & magenta angled legs,
 *             hanging digital Legion banners, circular kiosks with blue base under-glow & overhead tiered canopies.
 *  - Image 2: Multi-tiered circular kiosk canopy rings with recessed magenta glow & cyan edge accents,
 *             overhead curved monitor rigging.
 *  - Image 3: Towering vertical illuminated Lenovo monolith totem (crimson red with glowing white typography),
 *             sweeping curved neon ribbons/splines looping across the ceiling perimeter, and glowing tech orb pod.
 *  - Realistic 3D attendees near devices with detailed clothes, styled hair, VIP lanyards, and natural idle breathing.
 */
import * as THREE from 'three';

export function setupExpoAtmosphere(scene) {
  const atmosphereGroup = new THREE.Group();
  atmosphereGroup.name = "Lenovo_Atmospheric_Lighting_And_People";

  // =========================================================================
  // 1. ICONIC ENTRANCE CHEVRON PORTAL ARCH (Matching User Reference Image 1)
  // =========================================================================
  const archGroup = new THREE.Group();
  archGroup.name = "Entrance_Neon_Chevron_Arch";
  archGroup.position.set(0, 0, 18.2);

  // A. Top Cyan Chevron Header (Glowing neon apex pointing upward)
  // Left slanted roof beam
  const cyanGlowMat = new THREE.MeshStandardMaterial({
    color: 0x00f0ff,
    emissive: 0x00d2ff,
    emissiveIntensity: 2.2,
    roughness: 0.15,
    metalness: 0.1
  });

  const cyanBeamGeo = new THREE.BoxGeometry(0.38, 0.42, 3.8);
  
  // Left top chevron beam (slanted up towards center)
  const leftRoof = new THREE.Mesh(cyanBeamGeo, cyanGlowMat);
  leftRoof.position.set(-1.6, 5.2, 0);
  leftRoof.rotation.z = Math.PI * 0.18; // Slanted up
  leftRoof.rotation.y = 0;
  archGroup.add(leftRoof);

  // Right top chevron beam (slanted up towards center to meet apex)
  const rightRoof = new THREE.Mesh(cyanBeamGeo, cyanGlowMat);
  rightRoof.position.set(1.6, 5.2, 0);
  rightRoof.rotation.z = -Math.PI * 0.18;
  rightRoof.rotation.y = 0;
  archGroup.add(rightRoof);

  // Chevron Apex Cap
  const apexGeo = new THREE.BoxGeometry(0.48, 0.48, 0.44);
  const apexCap = new THREE.Mesh(apexGeo, cyanGlowMat);
  apexCap.position.set(0, 5.75, 0);
  archGroup.add(apexCap);

  // Top Cyan Arch Spotlight illuminating the entrance walkway
  const archCyanLight = new THREE.PointLight(0x00f0ff, 3.2, 18, 1.8);
  archCyanLight.position.set(0, 5.4, 0.2);
  archGroup.add(archCyanLight);

  // B. Angled Neon Magenta / Pink Pylon Wings (Matching Image 1)
  const magentaGlowMat = new THREE.MeshStandardMaterial({
    color: 0xff007f,
    emissive: 0xff0066,
    emissiveIntensity: 2.4,
    roughness: 0.15,
    metalness: 0.1
  });

  const pylonGeo = new THREE.BoxGeometry(0.42, 4.4, 0.42);

  // Left Angled Leg (tilted outward towards floor)
  const leftLeg = new THREE.Mesh(pylonGeo, magentaGlowMat);
  leftLeg.position.set(-3.65, 2.3, 0);
  leftLeg.rotation.z = -Math.PI * 0.08;
  archGroup.add(leftLeg);

  // Right Angled Leg (tilted outward towards floor)
  const rightLeg = new THREE.Mesh(pylonGeo, magentaGlowMat);
  rightLeg.position.set(3.65, 2.3, 0);
  rightLeg.rotation.z = Math.PI * 0.08;
  archGroup.add(rightLeg);

  // Pylon Base Pedestals (Onyx black metal with neon trims)
  const darkPedMat = new THREE.MeshStandardMaterial({ color: 0x11141a, roughness: 0.3, metalness: 0.8 });
  [-4.0, 4.0].forEach(px => {
    const ped = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.35, 0.7), darkPedMat);
    ped.position.set(px, 0.175, 0);
    archGroup.add(ped);

    // Neon accent ring around base
    const pedRing = new THREE.Mesh(
      new THREE.RingGeometry(0.4, 0.48, 32),
      new THREE.MeshBasicMaterial({ color: 0xff007f, side: THREE.DoubleSide })
    );
    pedRing.rotation.x = -Math.PI / 2;
    pedRing.position.set(px, 0.01, 0);
    archGroup.add(pedRing);
  });

  // Magenta Point Lights on both legs
  const leftPinkLight = new THREE.PointLight(0xff007f, 2.5, 12, 1.8);
  leftPinkLight.position.set(-3.8, 2.0, 0.2);
  archGroup.add(leftPinkLight);

  const rightPinkLight = new THREE.PointLight(0xff007f, 2.5, 12, 1.8);
  rightPinkLight.position.set(3.8, 2.0, 0.2);
  archGroup.add(rightPinkLight);

  // C. Hanging Vertical Digital Screens beneath the Arch (Matching Image 1)
  const hangingScreenOffsets = [-1.4, -0.45, 0.45, 1.4];
  hangingScreenOffsets.forEach((hx, idx) => {
    const sCanvas = document.createElement('canvas');
    sCanvas.width = 256;
    sCanvas.height = 512;
    const sctx = sCanvas.getContext('2d');
    
    // Digital cyan/purple cyber gradient
    const sgrad = sctx.createLinearGradient(0, 0, 0, 512);
    sgrad.addColorStop(0, '#00d2ff');
    sgrad.addColorStop(0.5, '#1a103c');
    sgrad.addColorStop(1, '#ff007f');
    sctx.fillStyle = sgrad;
    sctx.fillRect(0, 0, 256, 512);

    // Legion / Lenovo Cyber Shield Icon
    sctx.strokeStyle = '#ffffff';
    sctx.lineWidth = 6;
    sctx.beginPath();
    sctx.arc(128, 180, 54, 0, Math.PI * 2);
    sctx.stroke();

    sctx.fillStyle = '#ffffff';
    sctx.beginPath();
    sctx.arc(128, 180, 24, 0, Math.PI * 2);
    sctx.fill();

    sctx.font = 'bold 24px Arial';
    sctx.textAlign = 'center';
    sctx.fillText('LEGION', 128, 290);
    sctx.font = '16px Arial';
    sctx.fillStyle = '#00f0ff';
    sctx.fillText('FUTURE EXPO', 128, 330);

    const sTex = new THREE.CanvasTexture(sCanvas);
    const sMat = new THREE.MeshBasicMaterial({ map: sTex, side: THREE.DoubleSide });
    const sMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 1.5), sMat);
    sMesh.position.set(hx, 3.8 - (idx % 2 === 0 ? 0.15 : 0), -0.05);
    archGroup.add(sMesh);

    // Metal suspension cables from arch
    const cableGeo = new THREE.CylinderGeometry(0.005, 0.005, 1.2, 8);
    const cableMat = new THREE.MeshBasicMaterial({ color: 0x556677 });
    [-0.32, 0.32].forEach(cx => {
      const cable = new THREE.Mesh(cableGeo, cableMat);
      cable.position.set(hx + cx, 4.8, -0.05);
      archGroup.add(cable);
    });
  });

  atmosphereGroup.add(archGroup);

  // =========================================================================
  // 2. CIRCULAR KIOSK OVERHEAD CANOPIES & BASE UNDERGLOW (Matching Images 1 & 2)
  // =========================================================================
  // Configured for the key demo islands: Legion Gaming (-8, 0, 13.8) and AI PC (7.15, 0, 14.35)
  const kioskLocations = [
    { x: -8.0, z: 13.8, title: 'LEGION GAMING', primaryCol: 0xff007f, secCol: 0x00d2ff },
    { x: 7.15, z: 14.35, title: 'LENOVO AI PC', primaryCol: 0x00d2ff, secCol: 0x9900ff },
    { x: -8.0, z: 2.5,  title: 'ADAPTIVE COMPUTING', primaryCol: 0x00ff96, secCol: 0x00d2ff },
    { x: 7.2,  z: 1.9,  title: 'PERSONAL AI', primaryCol: 0xff0055, secCol: 0x00f0ff }
  ];

  kioskLocations.forEach((loc) => {
    const kioskGroup = new THREE.Group();
    kioskGroup.position.set(loc.x, 0, loc.z);

    // A. Neon Base Underglow Ring resting on dark floor
    const underglowCanvas = document.createElement('canvas');
    underglowCanvas.width = 256;
    underglowCanvas.height = 256;
    const uctx = underglowCanvas.getContext('2d');
    const ugrad = uctx.createRadialGradient(128, 128, 40, 128, 128, 128);
    ugrad.addColorStop(0, '#00d2ff');
    ugrad.addColorStop(0.6, '#0055ff');
    ugrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    uctx.fillStyle = ugrad;
    uctx.fillRect(0, 0, 256, 256);

    const underglowTex = new THREE.CanvasTexture(underglowCanvas);
    const underglowMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 3.6),
      new THREE.MeshBasicMaterial({ map: underglowTex, transparent: true, side: THREE.DoubleSide, opacity: 0.9 })
    );
    underglowMesh.rotation.x = -Math.PI / 2;
    underglowMesh.position.y = 0.015;
    kioskGroup.add(underglowMesh);

    // Concentric Neon Ring edge
    const ringEdge = new THREE.Mesh(
      new THREE.RingGeometry(1.4, 1.48, 48),
      new THREE.MeshBasicMaterial({ color: 0x00d2ff, side: THREE.DoubleSide })
    );
    ringEdge.rotation.x = -Math.PI / 2;
    ringEdge.position.y = 0.02;
    kioskGroup.add(ringEdge);

    // Underglow Point Light bathing the floor
    const floorLight = new THREE.PointLight(0x00d2ff, 2.0, 6.0, 2.0);
    floorLight.position.set(0, 0.25, 0);
    kioskGroup.add(floorLight);

    // B. Central Pillar to Overhead Canopy (Matching Image 2)
    const colGeo = new THREE.CylinderGeometry(0.12, 0.14, 3.8, 24);
    const colMat = new THREE.MeshStandardMaterial({ color: 0x151822, metalness: 0.8, roughness: 0.2 });
    const colMesh = new THREE.Mesh(colGeo, colMat);
    colMesh.position.set(0, 1.9, 0);
    kioskGroup.add(colMesh);

    // C. Multi-Tiered Layered Overhead Canopy Discs (Matching Image 2)
    // Tier 1 (Lower Disc Petal): Vivid Magenta Recessed Underside
    const lowerCanopyGeo = new THREE.CylinderGeometry(1.65, 1.75, 0.12, 48);
    const lowerCanopyMat = new THREE.MeshStandardMaterial({
      color: 0x181c26,
      roughness: 0.3,
      metalness: 0.7
    });
    const lowerCanopy = new THREE.Mesh(lowerCanopyGeo, lowerCanopyMat);
    lowerCanopy.position.set(0, 3.25, 0);
    kioskGroup.add(lowerCanopy);

    // Underside Magenta Glow Panel
    const underCanopyGlow = new THREE.Mesh(
      new THREE.CircleGeometry(1.60, 48),
      new THREE.MeshBasicMaterial({ color: loc.primaryCol, side: THREE.DoubleSide })
    );
    underCanopyGlow.rotation.x = Math.PI / 2;
    underCanopyGlow.position.set(0, 3.18, 0);
    kioskGroup.add(underCanopyGlow);

    // Canopy Downward Point Light casting colorful glow onto device counters!
    const canopyDownLight = new THREE.PointLight(loc.primaryCol, 2.8, 8.0, 1.8);
    canopyDownLight.position.set(0, 3.1, 0);
    kioskGroup.add(canopyDownLight);

    // Tier 2 (Upper Disc Petal): Cyan Edge Accent (Matching Image 2)
    const upperCanopyGeo = new THREE.CylinderGeometry(1.35, 1.45, 0.10, 48);
    const upperCanopyMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00d2ff,
      emissiveIntensity: 1.5,
      roughness: 0.2
    });
    const upperCanopy = new THREE.Mesh(upperCanopyGeo, upperCanopyMat);
    upperCanopy.position.set(0, 3.42, 0);
    kioskGroup.add(upperCanopy);

    // D. Overhead Hanging Curved Monitor Displays (Matching Image 2 with Apex / Legion visuals)
    const monAngles = [0, Math.PI * 0.66, Math.PI * 1.33];
    monAngles.forEach((ang) => {
      const monGroup = new THREE.Group();
      monGroup.position.set(Math.sin(ang) * 1.25, 2.45, Math.cos(ang) * 1.25);
      monGroup.rotation.y = ang + Math.PI;

      // Monitor Screen
      const mCanvas = document.createElement('canvas');
      mCanvas.width = 512;
      mCanvas.height = 320;
      const mctx = mCanvas.getContext('2d');
      mctx.fillStyle = '#080c14';
      mctx.fillRect(0, 0, 512, 320);

      const mgrad = mctx.createLinearGradient(0, 0, 512, 320);
      mgrad.addColorStop(0, '#ff007f');
      mgrad.addColorStop(0.5, '#0055ff');
      mgrad.addColorStop(1, '#00f0ff');
      mctx.fillStyle = mgrad;
      mctx.fillRect(12, 12, 488, 296);

      mctx.fillStyle = '#ffffff';
      mctx.font = 'bold 36px Arial';
      mctx.textAlign = 'center';
      mctx.fillText(loc.title, 256, 120);
      mctx.font = 'bold 24px Arial';
      mctx.fillText('RTX 4090 • 240Hz PureSight', 256, 170);
      mctx.fillStyle = '#ffff00';
      mctx.fillText('APEX LEGENDS 300+ FPS', 256, 220);

      const mTex = new THREE.CanvasTexture(mCanvas);
      const mMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(0.78, 0.48),
        new THREE.MeshBasicMaterial({ map: mTex, side: THREE.DoubleSide })
      );
      monGroup.add(mMesh);

      // Arm bracket connecting to central column
      const armGeo = new THREE.BoxGeometry(0.04, 0.04, 1.2);
      const armMesh = new THREE.Mesh(armGeo, colMat);
      armMesh.position.set(0, 0.22, 0.55);
      monGroup.add(armMesh);

      kioskGroup.add(monGroup);
    });

    atmosphereGroup.add(kioskGroup);
  });

  // =========================================================================
  // 3. TOWERING ILLUMINATED LENOVO MONOLITH TOTEM (Matching Image 3)
  // =========================================================================
  const totemGroup = new THREE.Group();
  totemGroup.name = "Lenovo_Illuminated_Red_Totem";
  totemGroup.position.set(3.8, 0, 18.0);

  // Red Glowing Totem Core
  const totemCanvas = document.createElement('canvas');
  totemCanvas.width = 512;
  totemCanvas.height = 1024;
  const tctx = totemCanvas.getContext('2d');
  tctx.fillStyle = '#e2231a';
  tctx.fillRect(0, 0, 512, 1024);

  // Crisp White Vertical "Lenovo" Typography (Matching Image 3)
  tctx.save();
  tctx.translate(256, 512);
  tctx.rotate(-Math.PI / 2);
  tctx.fillStyle = '#ffffff';
  tctx.font = 'bold 155px Arial, sans-serif';
  tctx.textAlign = 'center';
  tctx.textBaseline = 'middle';
  tctx.fillText('Lenovo', 0, 0);
  tctx.restore();

  // Subtle border glow on totem
  tctx.strokeStyle = '#ff6b6b';
  tctx.lineWidth = 14;
  tctx.strokeRect(8, 8, 496, 1008);

  const totemTex = new THREE.CanvasTexture(totemCanvas);
  const totemMat = new THREE.MeshStandardMaterial({
    map: totemTex,
    emissive: 0xe2231a,
    emissiveIntensity: 0.95,
    roughness: 0.25
  });

  // Front and Back Face Monolith (height ~5.2m, width ~1.5m, thickness ~0.35m)
  const totemMesh = new THREE.Mesh(new THREE.BoxGeometry(1.4, 5.2, 0.35), totemMat);
  totemMesh.position.set(0, 2.6, 0);
  totemGroup.add(totemMesh);

  // Intense Red Light radiating from the Totem into the expo aisle
  const totemLight = new THREE.PointLight(0xe2231a, 2.8, 14, 1.8);
  totemLight.position.set(0, 2.6, 0.4);
  totemGroup.add(totemLight);

  atmosphereGroup.add(totemGroup);

  // =========================================================================
  // 4. SWEEPING CURVED NEON RIBBONS ACROSS THE CEILING (Matching Image 3)
  // =========================================================================
  // Sweeping 3D Bezier neon tubes looping across the expo hall perimeter
  const ribbonCurves = [
    // Left ribbon (Magenta/Purple swooping arc)
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-12.0, 4.6, 22.0),
      new THREE.Vector3(-8.0, 5.4, 14.0),
      new THREE.Vector3(-10.0, 5.0, 4.0),
      new THREE.Vector3(-6.0, 4.8, -6.0)
    ]),
    // Right ribbon (Electric Cyan swooping arc)
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(12.0, 4.6, 22.0),
      new THREE.Vector3(8.0, 5.4, 14.0),
      new THREE.Vector3(10.0, 5.0, 4.0),
      new THREE.Vector3(6.0, 4.8, -6.0)
    ]),
    // Center Transverse Loop (Violet/Indigo linking bridge)
    new THREE.CatmullRomCurve3([
      new THREE.Vector3(-8.0, 5.2, 10.0),
      new THREE.Vector3(-2.0, 5.8, 11.5),
      new THREE.Vector3(2.0, 5.8, 11.5),
      new THREE.Vector3(8.0, 5.2, 10.0)
    ])
  ];

  const ribbonColors = [0xff007f, 0x00f0ff, 0x9900ff];
  ribbonCurves.forEach((curve, cIdx) => {
    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.08, 12, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: ribbonColors[cIdx],
      emissive: ribbonColors[cIdx],
      emissiveIntensity: 2.5,
      roughness: 0.1
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    atmosphereGroup.add(tubeMesh);
  });

  // =========================================================================
  // 5. CYBER TECH POD / GLOWING ORB INSTALLATION (Matching Left of Image 3)
  // =========================================================================
  const orbGroup = new THREE.Group();
  orbGroup.name = "Glowing_Orb_Pod_Kiosk";
  orbGroup.position.set(-3.8, 0, 18.0);

  // Black metallic pedestal
  const orbBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.65, 0.75, 1.1, 32),
    new THREE.MeshStandardMaterial({ color: 0x12141a, roughness: 0.25, metalness: 0.85 })
  );
  orbBase.position.y = 0.55;
  orbGroup.add(orbBase);

  // Outer Dark Metallic Shell with Window
  const outerSphereGeo = new THREE.SphereGeometry(0.60, 32, 32);
  const outerSphereMat = new THREE.MeshStandardMaterial({
    color: 0x1a1e28,
    metalness: 0.9,
    roughness: 0.2,
    transparent: true,
    opacity: 0.85
  });
  const outerSphere = new THREE.Mesh(outerSphereGeo, outerSphereMat);
  outerSphere.position.y = 1.6;
  orbGroup.add(outerSphere);

  // Inner Glowing Crimson Core Orb (Matching Image 3)
  const innerCoreGeo = new THREE.SphereGeometry(0.35, 24, 24);
  const innerCoreMat = new THREE.MeshStandardMaterial({
    color: 0xff1122,
    emissive: 0xe2231a,
    emissiveIntensity: 2.8,
    roughness: 0.1
  });
  const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat);
  innerCore.position.y = 1.6;
  orbGroup.add(innerCore);

  const orbLight = new THREE.PointLight(0xff1122, 2.4, 8, 1.8);
  orbLight.position.set(0, 1.6, 0.4);
  orbGroup.add(orbLight);

  atmosphereGroup.add(orbGroup);

  // =========================================================================
  // 6. REALISTIC 3D ATTENDEES NEAR DEVICES (Natural Clothes, Hair & Poses)
  // =========================================================================
  const peopleData = [
    // Person 1: Near Legion Laptop Desk (-7.4, 0, 13.5) - Leaning slightly forward, examining screen
    {
      pos: new THREE.Vector3(-7.3, 0, 13.3),
      rotY: Math.PI * 0.75,
      gender: 'male',
      hairStyle: 'pompadour_fade',
      hairCol: 0x241712, // Dark brown
      skinCol: 0xdfa98f, // Warm skin
      topType: 'hoodie',
      topCol: 0x1e2430,  // Dark legion hoodie
      bottomCol: 0x2b384e, // Indigo denim jeans
      shoeCol: 0xffffff, // White sneakers with red trim
      pose: 'inspecting_laptop',
      name: 'Alex (Legion Gamer)'
    },
    // Person 2: Standing beside Legion Desk (-8.8, 0, 13.9) - Holding smartphone, looking at display
    {
      pos: new THREE.Vector3(-8.8, 0, 14.1),
      rotY: Math.PI * 0.25,
      gender: 'female',
      hairStyle: 'styled_bob',
      hairCol: 0x4a2a18, // Auburn brown
      skinCol: 0xf2c4ac,
      topType: 'jacket',
      topCol: 0xe2231a,  // Lenovo Red tech jacket
      bottomCol: 0x1a1d24, // Black trousers
      shoeCol: 0x11141a, // Black smart boots
      pose: 'standing_phone',
      name: 'Maya (Tech Reviewer)'
    },
    // Person 3: Near Lenovo AI PC Desk (7.8, 0, 14.0) - Testing laptop trackpad
    {
      pos: new THREE.Vector3(6.6, 0, 14.0),
      rotY: Math.PI * 0.5,
      gender: 'male',
      hairStyle: 'curly_crop',
      hairCol: 0x181412, // Black
      skinCol: 0x8d5536, // Deep rich skin tone
      topType: 'blazer',
      topCol: 0x1b2838,  // Navy smart casual blazer
      bottomCol: 0xc8c0b2, // Chino trousers
      shoeCol: 0x4a2e1b, // Brown leather shoes
      pose: 'interacting',
      name: 'Daniel (AI Engineer)'
    },
    // Person 4: Near Adaptive Computing Desk (-7.4, 0, 2.2) - Looking amazed at dual screens
    {
      pos: new THREE.Vector3(-7.4, 0, 1.9),
      rotY: Math.PI * 0.65,
      gender: 'female',
      hairStyle: 'high_ponytail',
      hairCol: 0x12100e, // Jet black
      skinCol: 0xdeb89b,
      topType: 'crewneck',
      topCol: 0x00d2ff,  // Cyan expo crewneck
      bottomCol: 0x222630, // Charcoal jeans
      shoeCol: 0xffffff, // White sneakers
      pose: 'amazed',
      name: 'Sarah (Creative Pro)'
    },
    // Person 5: Near Personal AI Desk (7.8, 0, 1.5) - Conversing near device
    {
      pos: new THREE.Vector3(7.9, 0, 1.3),
      rotY: -Math.PI * 0.35,
      gender: 'male',
      hairStyle: 'short_textured',
      hairCol: 0x7c6a58, // Sandy brown
      skinCol: 0xecd0ba,
      topType: 'polo',
      topCol: 0x223344,  // Dark slate polo
      bottomCol: 0x1f242d, // Dark jeans
      shoeCol: 0x333740, // Grey sneakers
      pose: 'casual_chat',
      name: 'Kevin (Attendee)'
    }
  ];

  const peopleMeshes = [];

  peopleData.forEach((pData, idx) => {
    const person = buildRealisticAttendee(pData);
    person.position.copy(pData.pos);
    person.rotation.y = pData.rotY;
    atmosphereGroup.add(person);
    peopleMeshes.push(person);
  });

  scene.add(atmosphereGroup);

  // Return update loop for subtle lifelike breathing & micro-movements
  return {
    update: (time) => {
      // Subtle pulse on inner tech core orb
      innerCore.scale.setScalar(1 + Math.sin(time * 2.5) * 0.04);
      orbLight.intensity = 2.4 + Math.sin(time * 3.0) * 0.4;

      // Realistic breathing and subtle idle swaying on attendees
      peopleMeshes.forEach((p, pIdx) => {
        const offset = pIdx * 1.3;
        // Chest breathing (gentle expansion/contraction)
        if (p.userData.chest) {
          const breath = 1.0 + Math.sin(time * 2.2 + offset) * 0.025;
          p.userData.chest.scale.set(breath, breath, breath);
        }
        // Subtle natural head turning / glance
        if (p.userData.head) {
          p.userData.head.rotation.y = Math.sin(time * 0.8 + offset) * 0.12;
          p.userData.head.rotation.x = Math.sin(time * 1.1 + offset) * 0.04;
        }
        // Subtle body weight shift
        p.position.y = Math.sin(time * 1.5 + offset) * 0.003;
      });
    }
  };
}

/**
 * Builds a realistic 3D human expo attendee with natural anatomy, layered clothes,
 * styled hair, detailed sneakers, and a hanging Lenovo VIP expo lanyard badge!
 */
function buildRealisticAttendee(data) {
  const root = new THREE.Group();
  root.name = `Attendee_${data.name}`;

  const skinMat = new THREE.MeshStandardMaterial({
    color: data.skinCol,
    roughness: 0.65,
    metalness: 0.05
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: data.hairCol,
    roughness: 0.85,
    metalness: 0.1
  });

  const topMat = new THREE.MeshStandardMaterial({
    color: data.topCol,
    roughness: 0.75,
    metalness: 0.1
  });

  const pantsMat = new THREE.MeshStandardMaterial({
    color: data.bottomCol,
    roughness: 0.8,
    metalness: 0.05
  });

  const shoeMat = new THREE.MeshStandardMaterial({
    color: data.shoeCol,
    roughness: 0.4,
    metalness: 0.2
  });

  // 1. Torso / Upper Body (Chest & Jacket/Shirt)
  const chestGroup = new THREE.Group();
  chestGroup.position.set(0, 1.22, 0);

  // Main Chest Block with natural tapered curvature
  const chestGeo = new THREE.BoxGeometry(0.38, 0.44, 0.24);
  const chestMesh = new THREE.Mesh(chestGeo, topMat);
  chestGroup.add(chestMesh);

  // Clothing Collar
  const collarGeo = new THREE.BoxGeometry(0.24, 0.08, 0.22);
  const collarMesh = new THREE.Mesh(collarGeo, topMat);
  collarMesh.position.set(0, 0.22, 0.01);
  chestGroup.add(collarMesh);

  // Hanging Lenovo Expo VIP Lanyard (Draped around neck to chest)
  const lanyardGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.35, 8);
  const lanyardMat = new THREE.MeshBasicMaterial({ color: 0xe2231a }); // Lenovo Red Ribbon
  [-0.07, 0.07].forEach(lx => {
    const strap = new THREE.Mesh(lanyardGeo, lanyardMat);
    strap.position.set(lx, 0.08, 0.13);
    strap.rotation.z = lx > 0 ? 0.2 : -0.2;
    chestGroup.add(strap);
  });

  // VIP Badge Card
  const badgeCard = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, 0.13, 0.005),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  badgeCard.position.set(0, -0.06, 0.135);
  chestGroup.add(badgeCard);

  // Badge Red Header
  const badgeHeader = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, 0.035, 0.006),
    new THREE.MeshBasicMaterial({ color: 0xe2231a })
  );
  badgeHeader.position.set(0, -0.02, 0.136);
  chestGroup.add(badgeHeader);

  root.add(chestGroup);
  root.userData.chest = chestGroup;

  // 2. Neck & Head
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.56, 0);

  // Neck
  const neckGeo = new THREE.CylinderGeometry(0.065, 0.075, 0.12, 16);
  const neckMesh = new THREE.Mesh(neckGeo, skinMat);
  neckMesh.position.set(0, -0.08, 0);
  headGroup.add(neckMesh);

  // Cranium / Face (Natural rounded proportions)
  const faceGeo = new THREE.SphereGeometry(0.125, 20, 20);
  faceGeo.scale(0.9, 1.15, 1.0);
  const faceMesh = new THREE.Mesh(faceGeo, skinMat);
  faceMesh.position.set(0, 0.06, 0.01);
  headGroup.add(faceMesh);

  // Realistic Styled 3D Hair
  if (data.hairStyle === 'pompadour_fade') {
    // Modern styled pompadour with volume on top & tight fade
    const topHair = new THREE.Mesh(
      new THREE.SphereGeometry(0.135, 16, 16),
      hairMat
    );
    topHair.scale.set(0.92, 0.7, 1.1);
    topHair.position.set(0, 0.14, -0.01);
    headGroup.add(topHair);

    const quiff = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.14), hairMat);
    quiff.position.set(0, 0.18, 0.06);
    quiff.rotation.x = -0.2;
    headGroup.add(quiff);
  } else if (data.hairStyle === 'styled_bob') {
    // Sleek chin-length modern bob
    const bobCap = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), hairMat);
    bobCap.position.set(0, 0.08, -0.02);
    headGroup.add(bobCap);

    [-0.11, 0.11].forEach(bx => {
      const bobSide = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, 0.18), hairMat);
      bobSide.position.set(bx, -0.02, 0.02);
      headGroup.add(bobSide);
    });
  } else if (data.hairStyle === 'high_ponytail') {
    // Sleek high ponytail
    const baseHair = new THREE.Mesh(new THREE.SphereGeometry(0.135, 16, 16), hairMat);
    baseHair.position.set(0, 0.07, -0.02);
    headGroup.add(baseHair);

    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.35, 12), hairMat);
    tail.position.set(0, 0.12, -0.16);
    tail.rotation.x = -0.4;
    headGroup.add(tail);
  } else {
    // Classic neat textured crop
    const cropHair = new THREE.Mesh(new THREE.SphereGeometry(0.135, 16, 16), hairMat);
    cropHair.position.set(0, 0.09, -0.01);
    headGroup.add(cropHair);
  }

  // Realistic Eyes & Eyebrows
  [-0.045, 0.045].forEach(ex => {
    // Eye sclera
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    eye.position.set(ex, 0.06, 0.115);
    headGroup.add(eye);

    // Dark pupil
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 8), new THREE.MeshBasicMaterial({ color: 0x221814 }));
    pupil.position.set(ex, 0.06, 0.126);
    headGroup.add(pupil);

    // Eyebrow
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.009, 0.01), hairMat);
    brow.position.set(ex, 0.082, 0.12);
    headGroup.add(brow);
  });

  // Nose contour
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.045, 8), skinMat);
  nose.position.set(0, 0.04, 0.13);
  nose.rotation.x = 0.2;
  headGroup.add(nose);

  root.add(headGroup);
  root.userData.head = headGroup;

  // 3. Arms & Hands with Natural Poses
  const armGeo = new THREE.CylinderGeometry(0.055, 0.048, 0.58, 12);
  const handGeo = new THREE.BoxGeometry(0.055, 0.09, 0.035);

  // Left Arm
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.25, 1.36, 0);
  const leftArmMesh = new THREE.Mesh(armGeo, topMat);
  leftArmMesh.position.set(0, -0.26, 0);
  leftArm.add(leftArmMesh);

  const leftHand = new THREE.Mesh(handGeo, skinMat);
  leftHand.position.set(0, -0.57, 0);
  leftArm.add(leftHand);

  // Right Arm
  const rightArm = new THREE.Group();
  rightArm.position.set(0.25, 1.36, 0);
  const rightArmMesh = new THREE.Mesh(armGeo, topMat);
  rightArmMesh.position.set(0, -0.26, 0);
  rightArm.add(rightArmMesh);

  const rightHand = new THREE.Mesh(handGeo, skinMat);
  rightHand.position.set(0, -0.57, 0);
  rightArm.add(rightHand);

  // Pose-specific arm rotations
  if (data.pose === 'inspecting_laptop') {
    // Both arms reaching forward to laptop keyboard
    leftArm.rotation.x = -Math.PI * 0.35;
    leftArm.rotation.z = Math.PI * 0.12;
    rightArm.rotation.x = -Math.PI * 0.38;
    rightArm.rotation.z = -Math.PI * 0.10;
  } else if (data.pose === 'standing_phone') {
    // Left arm down, right arm holding phone up
    rightArm.rotation.x = -Math.PI * 0.45;
    rightArm.rotation.y = -Math.PI * 0.15;
    // Add 3D smartphone in hand
    const phoneGeo = new THREE.BoxGeometry(0.04, 0.08, 0.008);
    const phoneMat = new THREE.MeshBasicMaterial({ color: 0x00d2ff });
    const phone = new THREE.Mesh(phoneGeo, phoneMat);
    phone.position.set(0, -0.58, 0.03);
    rightArm.add(phone);
  } else if (data.pose === 'interacting') {
    // Left arm down, right arm reaching forward to touch device
    leftArm.rotation.x = 0.05;
    rightArm.rotation.x = -Math.PI * 0.38;
    rightArm.rotation.y = -Math.PI * 0.08;
  } else {
    // Natural casual standing posture
    leftArm.rotation.x = 0.08;
    leftArm.rotation.z = 0.06;
    rightArm.rotation.x = -0.05;
    rightArm.rotation.z = -0.06;
  }

  root.add(leftArm);
  root.add(rightArm);

  // 4. Waist & Legs (Realistic Trousers with Fabric Folds)
  const pelvisMesh = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.16, 0.22), pantsMat);
  pelvisMesh.position.set(0, 0.94, 0);
  root.add(pelvisMesh);

  // Belt with metal buckle
  const beltMesh = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.04, 0.23), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
  beltMesh.position.set(0, 0.99, 0);
  root.add(beltMesh);

  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.045, 0.01), new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8 }));
  buckle.position.set(0, 0.99, 0.12);
  root.add(buckle);

  const legGeo = new THREE.CylinderGeometry(0.075, 0.065, 0.78, 14);

  // Left Leg
  const leftLeg = new THREE.Mesh(legGeo, pantsMat);
  leftLeg.position.set(-0.11, 0.52, 0);
  root.add(leftLeg);

  // Right Leg
  const rightLeg = new THREE.Mesh(legGeo, pantsMat);
  rightLeg.position.set(0.11, 0.52, 0);
  root.add(rightLeg);

  // 5. Realistic Shoes / Sneakers with Accent Soles
  [-0.11, 0.11].forEach(sx => {
    const shoeGroup = new THREE.Group();
    shoeGroup.position.set(sx, 0.06, 0.03);

    // Shoe Upper
    const shoeUpper = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.09, 0.22),
      shoeMat
    );
    shoeGroup.add(shoeUpper);

    // White thick sneaker sole
    const sole = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.03, 0.24),
      new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.3 })
    );
    sole.position.set(0, -0.04, 0);
    shoeGroup.add(sole);

    root.add(shoeGroup);
  });

  return root;
}
