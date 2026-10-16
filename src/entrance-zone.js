/**
 * Lenovo Future Expo - Grand Entrance Zone
 * 
 * Features:
 * - A large illuminated architectural archway with glowing "LENOVO FUTURE EXPO"
 *   in vibrant Lenovo Red and brilliant White with soft emissive lighting and pulse.
 * - Positioned at Z = 20.5, exactly 7.0m in front of the player spawn at Z = 27.5,
 *   so the archway is the very first thing seen when the expo begins.
 * - A clean reflective floor path leading from the spawn area through the archway into the expo hall.
 * - Luminous accent strips along the path borders and vertical light beams / pillars.
 * - Console log confirming creation and position.
 */
import * as THREE from 'three';

export function setupGrandEntranceZone(scene) {
  const entranceZoneGroup = new THREE.Group();
  entranceZoneGroup.name = "Grand_Entrance_Zone";

  // Palette constants
  const COLOR_LENOVO_RED = 0xe2231a;
  const COLOR_WHITE = 0xffffff;
  const COLOR_DARK_METAL = 0x0e131d;
  const COLOR_GLOSS_FLOOR = 0x090d14;

  // Track dynamic animation elements
  const emissiveMaterials = [];
  const pulsingLights = [];
  const lightBeams = [];

  // =========================================================================
  // 1. ARRIVAL PLAZA DECK & CLEAN REFLECTIVE FLOOR PATH
  // =========================================================================
  // Arrival terrace deck underneath the spawn zone (Z = 24.0 to 30.0, X = -6.0 to +6.0)
  const plazaDeckGeo = new THREE.BoxGeometry(11.0, 0.02, 6.5);
  const plazaDeckMat = new THREE.MeshStandardMaterial({
    color: 0x0c1018,
    roughness: 0.35,
    metalness: 0.5
  });
  const plazaDeck = new THREE.Mesh(plazaDeckGeo, plazaDeckMat);
  plazaDeck.position.set(0, 0.01, 27.0);
  entranceZoneGroup.add(plazaDeck);

  // Plaza deck perimeter border trims (subtle ambient red & white glow)
  const deckBorderMat = new THREE.MeshBasicMaterial({ color: COLOR_LENOVO_RED });
  [-5.5, 5.5].forEach(xPos => {
    const curb = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 6.5), deckBorderMat);
    curb.position.set(xPos, 0.03, 27.0);
    entranceZoneGroup.add(curb);
  });
  const rearCurb = new THREE.Mesh(new THREE.BoxGeometry(11.0, 0.06, 0.12), deckBorderMat);
  rearCurb.position.set(0, 0.03, 30.25);
  entranceZoneGroup.add(rearCurb);

  // Procedural canvas texture for the central reflective path
  const pathCanvas = document.createElement('canvas');
  pathCanvas.width = 512;
  pathCanvas.height = 1024;
  const pctx = pathCanvas.getContext('2d');

  // Deep obsidian reflective showroom base
  pctx.fillStyle = '#090d14';
  pctx.fillRect(0, 0, 512, 1024);

  // Subtle metallic grid texture
  pctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  pctx.lineWidth = 1;
  for (let y = 0; y < 1024; y += 32) {
    pctx.beginPath();
    pctx.moveTo(0, y);
    pctx.lineTo(512, y);
    pctx.stroke();
  }
  for (let x = 0; x < 512; x += 32) {
    pctx.beginPath();
    pctx.moveTo(x, 0);
    pctx.lineTo(x, 1024);
    pctx.stroke();
  }

  // Central runway guide track lines
  pctx.strokeStyle = 'rgba(226, 35, 26, 0.35)';
  pctx.lineWidth = 3;
  pctx.beginPath();
  pctx.moveTo(128, 0);
  pctx.lineTo(128, 1024);
  pctx.moveTo(384, 0);
  pctx.lineTo(384, 1024);
  pctx.stroke();

  // Subtle directional forward chevrons pointing toward the expo (-Z)
  pctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  pctx.lineWidth = 4;
  for (let y = 96; y < 1024; y += 128) {
    pctx.beginPath();
    pctx.moveTo(216, y + 24);
    pctx.lineTo(256, y);
    pctx.lineTo(296, y + 24);
    pctx.stroke();
  }

  const pathTexture = new THREE.CanvasTexture(pathCanvas);
  pathTexture.wrapS = THREE.RepeatWrapping;
  pathTexture.wrapT = THREE.RepeatWrapping;
  pathTexture.repeat.set(1, 4);

  // The clean reflective floor path:
  // Runs from spawn area (Z = 28.5) straight through the archway (Z = 20.5) to Z = 15.0
  // Total length: 13.5m, Width: 4.6m
  const pathGeo = new THREE.BoxGeometry(4.6, 0.02, 13.5);
  const pathMat = new THREE.MeshStandardMaterial({
    map: pathTexture,
    color: COLOR_GLOSS_FLOOR,
    roughness: 0.10, // Glossy, clean reflective trade show floor
    metalness: 0.80  // Mirror-like sheen catching the archway and light strips
  });
  const reflectivePath = new THREE.Mesh(pathGeo, pathMat);
  reflectivePath.position.set(0, 0.02, 21.75);
  entranceZoneGroup.add(reflectivePath);

  // =========================================================================
  // 2. LIGHT ACCENT STRIPS & CROSS BARS ALONG THE PATH
  // =========================================================================
  const stripGeo = new THREE.BoxGeometry(0.08, 0.04, 13.5);
  
  const leftStripMat = new THREE.MeshStandardMaterial({
    color: COLOR_LENOVO_RED,
    emissive: COLOR_LENOVO_RED,
    emissiveIntensity: 2.2,
    roughness: 0.2
  });
  emissiveMaterials.push({ mat: leftStripMat, base: 2.2, amp: 0.6, phase: 0.0 });
  const leftStrip = new THREE.Mesh(stripGeo, leftStripMat);
  leftStrip.position.set(-2.34, 0.035, 21.75);
  entranceZoneGroup.add(leftStrip);

  const rightStripMat = new THREE.MeshStandardMaterial({
    color: COLOR_WHITE,
    emissive: 0xeeeeee,
    emissiveIntensity: 2.0,
    roughness: 0.2
  });
  emissiveMaterials.push({ mat: rightStripMat, base: 2.0, amp: 0.5, phase: Math.PI });
  const rightStrip = new THREE.Mesh(stripGeo, rightStripMat);
  rightStrip.position.set(2.34, 0.035, 21.75);
  entranceZoneGroup.add(rightStrip);

  // Transverse glowing cross-accent bars embedded into the floor path
  const crossZPositions = [27.5, 25.5, 23.5, 21.5, 20.5, 18.5, 16.5];
  crossZPositions.forEach((zPos, idx) => {
    const isRed = idx % 2 === 0;
    const crossMat = new THREE.MeshBasicMaterial({
      color: isRed ? COLOR_LENOVO_RED : COLOR_WHITE,
      transparent: true,
      opacity: 0.85
    });
    const crossBar = new THREE.Mesh(new THREE.BoxGeometry(4.55, 0.005, 0.08), crossMat);
    crossBar.position.set(0, 0.031, zPos);
    entranceZoneGroup.add(crossBar);
  });

  // =========================================================================
  // 3. LIGHT BEAMS & LUMINOUS ACCENT PYLONS ALONG THE PATHWAY
  // =========================================================================
  const pillarZPositions = [27.0, 24.5, 22.5, 20.5, 18.0];
  const pylonMat = new THREE.MeshStandardMaterial({
    color: COLOR_DARK_METAL,
    roughness: 0.25,
    metalness: 0.8
  });

  pillarZPositions.forEach((zPos, idx) => {
    [-2.55, 2.55].forEach((xPos, sideIdx) => {
      const pylonGroup = new THREE.Group();
      pylonGroup.position.set(xPos, 0, zPos);

      // Base pedestal
      const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.2, 0.3), pylonMat);
      baseMesh.position.y = 0.6;
      pylonGroup.add(baseMesh);

      // Recessed vertical LED light bar (alternating red and crisp white)
      const useRed = (idx + sideIdx) % 2 === 0;
      const ledBarMat = new THREE.MeshStandardMaterial({
        color: useRed ? COLOR_LENOVO_RED : COLOR_WHITE,
        emissive: useRed ? COLOR_LENOVO_RED : 0xffffff,
        emissiveIntensity: 2.4,
        roughness: 0.1
      });
      emissiveMaterials.push({
        mat: ledBarMat,
        base: 2.2,
        amp: 0.7,
        phase: idx * 0.8 + sideIdx * Math.PI
      });

      const ledBar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.0, 0.06), ledBarMat);
      ledBar.position.set(xPos < 0 ? 0.13 : -0.13, 0.6, 0);
      pylonGroup.add(ledBar);

      // Top beacon cap
      const capMat = new THREE.MeshBasicMaterial({ color: useRed ? COLOR_LENOVO_RED : COLOR_WHITE });
      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.05, 0.32), capMat);
      cap.position.y = 1.22;
      pylonGroup.add(cap);

      // Upward architectural light beam cone (lightweight additive volumetric beam)
      const beamGeo = new THREE.CylinderGeometry(0.06, 0.45, 3.8, 14, 1, true);
      const beamMat = new THREE.MeshBasicMaterial({
        color: useRed ? 0xff3b30 : 0xe0f7ff,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const lightBeam = new THREE.Mesh(beamGeo, beamMat);
      lightBeam.position.y = 3.12;
      pylonGroup.add(lightBeam);

      lightBeams.push({
        mesh: lightBeam,
        baseOpacity: 0.18,
        idx: idx + sideIdx * 2
      });

      entranceZoneGroup.add(pylonGroup);
    });
  });

  // =========================================================================
  // 4. LARGE ILLUMINATED GRAND ARCHWAY (Z = 20.5, X = 0)
  // 7.0m directly ahead of spawn (Z = 27.5), fully framed in viewport
  // =========================================================================
  const archGroup = new THREE.Group();
  archGroup.name = "Grand_Lenovo_Illuminated_Archway";
  archGroup.position.set(0, 0, 20.5);

  // A. Structural Vertical Pylons (Left & Right)
  // Height: 5.2m, Width: 0.8m, Depth: 0.85m
  const archColumnGeo = new THREE.BoxGeometry(0.8, 5.2, 0.85);
  const archFrameMat = new THREE.MeshStandardMaterial({
    color: COLOR_DARK_METAL,
    roughness: 0.2,
    metalness: 0.85
  });

  // Left Architectural Column (X = -3.8)
  const leftCol = new THREE.Mesh(archColumnGeo, archFrameMat);
  leftCol.position.set(-3.8, 2.6, 0);
  archGroup.add(leftCol);

  // Right Architectural Column (X = +3.8)
  const rightCol = new THREE.Mesh(archColumnGeo, archFrameMat);
  rightCol.position.set(3.8, 2.6, 0);
  archGroup.add(rightCol);

  // Base Plinths
  [-3.8, 3.8].forEach(xPos => {
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.35, 1.25), archFrameMat);
    plinth.position.set(xPos, 0.175, 0);
    archGroup.add(plinth);

    // Glowing base trim ring
    const baseGlow = new THREE.Mesh(
      new THREE.RingGeometry(0.65, 0.78, 32),
      new THREE.MeshBasicMaterial({ color: COLOR_LENOVO_RED, side: THREE.DoubleSide })
    );
    baseGlow.rotation.x = -Math.PI / 2;
    baseGlow.position.set(xPos, 0.02, 0);
    archGroup.add(baseGlow);
  });

  // Vertical Illuminated Edge Light Strips on columns (Red & White)
  const colNeonGeo = new THREE.BoxGeometry(0.08, 4.8, 0.08);

  // Left Column: Bold Lenovo Red neon channel
  const leftNeonMat = new THREE.MeshStandardMaterial({
    color: COLOR_LENOVO_RED,
    emissive: COLOR_LENOVO_RED,
    emissiveIntensity: 2.6,
    roughness: 0.1
  });
  emissiveMaterials.push({ mat: leftNeonMat, base: 2.6, amp: 0.8, phase: 0.0 });
  const leftNeonFront = new THREE.Mesh(colNeonGeo, leftNeonMat);
  leftNeonFront.position.set(-3.38, 2.6, 0.43);
  archGroup.add(leftNeonFront);
  const leftNeonBack = new THREE.Mesh(colNeonGeo, leftNeonMat);
  leftNeonBack.position.set(-3.38, 2.6, -0.43);
  archGroup.add(leftNeonBack);

  // Right Column: Brilliant White neon channel
  const rightNeonMat = new THREE.MeshStandardMaterial({
    color: COLOR_WHITE,
    emissive: 0xffffff,
    emissiveIntensity: 2.4,
    roughness: 0.1
  });
  emissiveMaterials.push({ mat: rightNeonMat, base: 2.4, amp: 0.7, phase: Math.PI });
  const rightNeonFront = new THREE.Mesh(colNeonGeo, rightNeonMat);
  rightNeonFront.position.set(3.38, 2.6, 0.43);
  archGroup.add(rightNeonFront);
  const rightNeonBack = new THREE.Mesh(colNeonGeo, rightNeonMat);
  rightNeonBack.position.set(3.38, 2.6, -0.43);
  archGroup.add(rightNeonBack);

  // B. Grand Overhead Cross-Beam / Canopy Bridge (Y = 4.4m to 5.4m)
  const headerBridgeGeo = new THREE.BoxGeometry(8.4, 1.1, 1.0);
  const headerBridge = new THREE.Mesh(headerBridgeGeo, archFrameMat);
  headerBridge.position.set(0, 4.75, 0);
  archGroup.add(headerBridge);

  // Top and Bottom Glowing Neon Edge Strips spanning the header
  const headerStripGeo = new THREE.BoxGeometry(8.42, 0.08, 0.08);
  const headerRedMat = new THREE.MeshStandardMaterial({
    color: COLOR_LENOVO_RED,
    emissive: COLOR_LENOVO_RED,
    emissiveIntensity: 2.5,
    roughness: 0.1
  });
  emissiveMaterials.push({ mat: headerRedMat, base: 2.5, amp: 0.7, phase: 0.0 });

  const headerWhiteMat = new THREE.MeshStandardMaterial({
    color: COLOR_WHITE,
    emissive: 0xffffff,
    emissiveIntensity: 2.3,
    roughness: 0.1
  });
  emissiveMaterials.push({ mat: headerWhiteMat, base: 2.3, amp: 0.6, phase: Math.PI * 0.5 });

  // Front top edge (Red) & bottom edge (White)
  const topStripFront = new THREE.Mesh(headerStripGeo, headerRedMat);
  topStripFront.position.set(0, 5.28, 0.51);
  archGroup.add(topStripFront);

  const bottomStripFront = new THREE.Mesh(headerStripGeo, headerWhiteMat);
  bottomStripFront.position.set(0, 4.22, 0.51);
  archGroup.add(bottomStripFront);

  // Back top edge (Red) & bottom edge (White)
  const topStripBack = new THREE.Mesh(headerStripGeo, headerRedMat);
  topStripBack.position.set(0, 5.28, -0.51);
  archGroup.add(topStripBack);

  const bottomStripBack = new THREE.Mesh(headerStripGeo, headerWhiteMat);
  bottomStripBack.position.set(0, 4.22, -0.51);
  archGroup.add(bottomStripBack);

  // Angled side canopy wings for futuristic silhouette
  const wingGeo = new THREE.BoxGeometry(0.35, 1.2, 1.1);
  [-4.4, 4.4].forEach((wx, wIdx) => {
    const wing = new THREE.Mesh(wingGeo, archFrameMat);
    wing.position.set(wx, 4.75, 0);
    wing.rotation.z = (wIdx === 0 ? 1 : -1) * 0.25;
    archGroup.add(wing);

    const wingNeon = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.22, 0.06), headerRedMat);
    wingNeon.position.set(wx + (wIdx === 0 ? -0.15 : 0.15), 4.75, 0.53);
    wingNeon.rotation.z = (wIdx === 0 ? 1 : -1) * 0.25;
    archGroup.add(wingNeon);
  });

  // C. High-Resolution "LENOVO FUTURE EXPO" Illuminated Sign Face
  const createArchSignTexture = (isFront) => {
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 2048;
    signCanvas.height = 512;
    const sctx = signCanvas.getContext('2d');

    // Deep brushed metallic sign plate background
    const bgGrad = sctx.createLinearGradient(0, 0, 2048, 512);
    bgGrad.addColorStop(0, '#0a0d14');
    bgGrad.addColorStop(0.5, '#121824');
    bgGrad.addColorStop(1, '#0a0d14');
    sctx.fillStyle = bgGrad;
    sctx.fillRect(0, 0, 2048, 512);

    // Glowing outer border
    sctx.strokeStyle = '#e2231a';
    sctx.lineWidth = 14;
    sctx.strokeRect(10, 10, 2028, 492);

    sctx.strokeStyle = '#ffffff';
    sctx.lineWidth = 4;
    sctx.strokeRect(24, 24, 2000, 464);

    // Signature Lenovo Red Badge on left of text
    const badgeX = 80;
    const badgeY = 145;
    const badgeW = 400;
    const badgeH = 150;
    
    // Drop shadow glow for badge
    sctx.shadowColor = 'rgba(226, 35, 26, 0.9)';
    sctx.shadowBlur = 32;
    sctx.fillStyle = '#e2231a';
    sctx.fillRect(badgeX, badgeY, badgeW, badgeH);

    // Lenovo White Wordmark inside badge
    sctx.shadowColor = 'transparent';
    sctx.shadowBlur = 0;
    sctx.fillStyle = '#ffffff';
    sctx.font = 'bold 96px "Segoe UI", Arial, sans-serif';
    sctx.textAlign = 'center';
    sctx.textBaseline = 'middle';
    sctx.fillText('Lenovo', badgeX + badgeW / 2, badgeY + badgeH / 2 + 4);

    // Glowing White & Red "FUTURE EXPO" Typography
    const textStartX = 540;
    const textCenterY = 220;

    // Glowing shadow for "FUTURE EXPO"
    sctx.shadowColor = '#ffffff';
    sctx.shadowBlur = 28;
    sctx.fillStyle = '#ffffff';
    sctx.font = '900 120px "Segoe UI", Arial, sans-serif';
    sctx.textAlign = 'left';
    sctx.textBaseline = 'middle';
    sctx.fillText('FUTURE EXPO', textStartX, textCenterY);

    // Red futuristic stroke outline
    sctx.shadowColor = 'transparent';
    sctx.shadowBlur = 0;
    sctx.strokeStyle = '#e2231a';
    sctx.lineWidth = 4;
    sctx.strokeText('FUTURE EXPO', textStartX, textCenterY);

    // Sub-header innovation tagline
    sctx.fillStyle = '#e0f2fe';
    sctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
    sctx.letterSpacing = '6px';
    sctx.fillText('TECHNOLOGY • INNOVATION • SMARTER FOR ALL', textStartX + 6, textCenterY + 105);

    // Year badge / portal indicator
    sctx.fillStyle = '#e2231a';
    sctx.font = 'bold 28px monospace';
    sctx.fillText('[ 2026 OFFICIAL GATEWAY ]', 1560, textCenterY + 105);

    return new THREE.CanvasTexture(signCanvas);
  };

  const frontSignTexture = createArchSignTexture(true);
  const backSignTexture = createArchSignTexture(false);

  const signGeo = new THREE.PlaneGeometry(7.8, 0.95);

  const frontSignMat = new THREE.MeshStandardMaterial({
    map: frontSignTexture,
    emissive: new THREE.Color(0xffffff),
    emissiveMap: frontSignTexture,
    emissiveIntensity: 1.8,
    roughness: 0.15,
    metalness: 0.2
  });
  emissiveMaterials.push({ mat: frontSignMat, base: 1.8, amp: 0.6, phase: 0.0 });

  const frontSignMesh = new THREE.Mesh(signGeo, frontSignMat);
  frontSignMesh.position.set(0, 4.75, 0.52);
  archGroup.add(frontSignMesh);

  // Back sign facing users looking back from inside the expo hall
  const backSignMat = new THREE.MeshStandardMaterial({
    map: backSignTexture,
    emissive: new THREE.Color(0xffffff),
    emissiveMap: backSignTexture,
    emissiveIntensity: 1.5,
    roughness: 0.15,
    metalness: 0.2
  });
  emissiveMaterials.push({ mat: backSignMat, base: 1.5, amp: 0.5, phase: 0.0 });

  const backSignMesh = new THREE.Mesh(signGeo, backSignMat);
  backSignMesh.position.set(0, 4.75, -0.52);
  backSignMesh.rotation.y = Math.PI;
  archGroup.add(backSignMesh);

  // D. Soft Emissive Lighting (Point Lights casting red & soft white glow)
  const archRedLight = new THREE.PointLight(COLOR_LENOVO_RED, 2.4, 18, 1.8);
  archRedLight.position.set(-2.0, 4.5, 1.2);
  archGroup.add(archRedLight);
  pulsingLights.push({ light: archRedLight, base: 2.4, amp: 0.6, phase: 0.0 });

  const archWhiteLight = new THREE.PointLight(0xffffff, 2.2, 18, 1.8);
  archWhiteLight.position.set(2.0, 4.5, 1.2);
  archGroup.add(archWhiteLight);
  pulsingLights.push({ light: archWhiteLight, base: 2.2, amp: 0.5, phase: Math.PI * 0.5 });

  const portalDownLight = new THREE.PointLight(0x00d2ff, 1.8, 14, 2.0);
  portalDownLight.position.set(0, 4.2, 0);
  archGroup.add(portalDownLight);
  pulsingLights.push({ light: portalDownLight, base: 1.8, amp: 0.4, phase: Math.PI });

  entranceZoneGroup.add(archGroup);

  // Add the entire Grand Entrance Zone to the scene
  scene.add(entranceZoneGroup);

  // Console log confirming arch creation and position as requested
  console.log(`%c[Lenovo Expo] Grand Entrance Archway created at position: X=${archGroup.position.x.toFixed(2)}, Y=${archGroup.position.y.toFixed(2)}, Z=${archGroup.position.z.toFixed(2)} (7.0m in front of spawn at Z=27.50)`, 'color: #e2231a; font-weight: bold; font-size: 13px;');

  return {
    update: (time, delta = 0.016) => {
      // 1. Subtle, elegant light pulse on the archway emissive materials
      emissiveMaterials.forEach(item => {
        if (item.mat) {
          const pulse = item.base + item.amp * Math.sin(time * 2.2 + item.phase);
          item.mat.emissiveIntensity = pulse;
        }
      });

      // 2. Subtle pulse on point lights
      pulsingLights.forEach(item => {
        if (item.light) {
          item.light.intensity = item.base + item.amp * Math.sin(time * 2.2 + item.phase);
        }
      });

      // 3. Subtle shimmer on light beam cones
      lightBeams.forEach(item => {
        if (item.mesh && item.mesh.material) {
          item.mesh.material.opacity = item.baseOpacity + 0.05 * Math.sin(time * 2.0 + item.idx * 0.7);
        }
      });
    }
  };
}
