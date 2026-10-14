/**
 * Lenovo Future Expo - Interactive Gaming Benchmark & Character Advisor System
 * 
 * Features:
 *  - Automatically detects proximity when user walks near any laptop in the expo
 *  - Displays a hovering rounded-corner card with game icons: Minecraft, Roblox, Terraria
 *  - Prompts: "Do you want to know if this game runs perfectly on this laptop?"
 *  - When user taps "YES":
 *      * Minecraft -> Spawns 3D Minecraft Villager (authentic bald head, unibrow, emerald eyes, protruding 3D nose, brown robe)
 *      * Roblox    -> Spawns 3D Robloxian ("Noob") with cylindrical smooth face, plastic shine, and tilted Roblox "R" logo on blue torso
 *      * Terraria  -> Spawns authentic pixelated Terraria Guide sprite with NearestFilter pixel-art rendering
 *  - Character walks smoothly from the corner to the player, stops in front of them, turns to face them
 *  - Speaks authentic dialogue with dedicated game-specific UI themes & fonts:
 *      * Minecraft: Full Minecraft GUI beveled box, Press Start 2P pixel font, Minecraft color codes, and original "Hrrrrm" sound
 *      * Roblox: Modern Roblox speech bubble, Fredoka rounded font, tilted "R" badge, and original "OOF" sound
 *      * Terraria: Authentic Terraria stone dialog box with ornate golden double-frame, Guide nameplate, and retro sound
 *  - Plays authentic audio files (villager_idle.ogg, roblox_oof.ogg, terraria_open.wav) + Web Speech TTS
 */
import * as THREE from 'three';
import { soundManager } from './audio.js';

// ==========================================
// 1. LAPTOP SPECIFICATIONS & BENCHMARKS
// ==========================================
export const LAPTOP_PROFILES = [
  {
    id: 'legion_pro_7i',
    name: 'Lenovo Legion Pro 7i Gen 9',
    zone: 'Zone 01 - Legion Gaming',
    position: new THREE.Vector3(-8.0, 1.15, 13.8),
    cardOffset: new THREE.Vector3(0, 0.65, 0.2),
    spawnCorners: [
      new THREE.Vector3(-11.5, 0, 19.0),
      new THREE.Vector3(-11.5, 0, 8.5),
      new THREE.Vector3(-4.0, 0, 18.0)
    ],
    specs: {
      processor: 'Intel Core i9-14900HX (24 Cores, 5.8 GHz)',
      gpu: 'NVIDIA GeForce RTX 4090 16GB (175W TGP)',
      display: '16" PureSight Gaming 240Hz 2.5K WQXGA HDR',
      ram: '32GB Overclocked DDR5-5600',
      cooling: 'Legion Coldfront 5.0 Vapor Chamber'
    },
    benchmarks: {
      minecraft: {
        fps: '320+ FPS',
        rating: 'ULTRA SUPREME',
        quote: "*Adjusts emerald trade* Yes, this Legion Pro 7i runs Minecraft beyond perfection! With its Intel Core i9-14900HX and monster RTX 4090, you can push 32-chunk render distance with BSL Ultra Shaders at over 320 FPS! The 240Hz PureSight display makes every diamond block radiant! A trade worth 64 emeralds! Villager approved!",
        ttsText: "Yes, it can run Minecraft beyond perfection! It has the Intel Core i9 14900HX processor, RTX 4090 graphics, and PureSight 240 Hertz display. You can run ultra shaders at over 300 FPS! Villager approved!"
      },
      roblox: {
        fps: '240 FPS (Locked)',
        rating: 'GOD TIER',
        quote: "OOF! Whoa, this Legion machine is an absolute beast! Yes, it crushes Roblox at maximum graphics level 10 with locked 240 FPS! Even in massive 100-player Brookhaven, BedWars, or ray-traced Frontlines, the RTX 4090 and i9 stay icy cool with Vapor Chamber cooling! GG!",
        ttsText: "Oof! Absolutely yes! This Legion Pro 7i runs Roblox effortlessly at maximum graphics quality 10 with locked 240 frames per second! Powered by the RTX 4090 and Core i9 processor on a 240 Hertz PureSight screen! GG!"
      },
      terraria: {
        fps: 'Locked 60+ FPS',
        rating: 'LEGENDARY TIER',
        quote: "Greetings, adventurer! I am the Guide, and I assure you this laptop is legendary! Terraria and even massive modpacks like Calamity and Thorium will run like water at ultra-high framerates. Its i9 CPU and NVMe Gen4 SSD load worlds in an instant, and the 240Hz screen makes every pixel pop!",
        ttsText: "Greetings adventurer! Yes, Terraria runs flawlessly! The Core i9 processor and ultra-fast SSD load massive Calamity mod worlds in seconds, while the PureSight display renders every biome in gorgeous clarity!"
      }
    }
  },
  {
    id: 'ai_pc_aura',
    name: 'Lenovo Yoga Slim 7x AI PC',
    zone: 'Zone 02 - Lenovo AI PC',
    position: new THREE.Vector3(7.15, 1.215, 14.35),
    cardOffset: new THREE.Vector3(0, 0.65, 0.2),
    spawnCorners: [
      new THREE.Vector3(11.5, 0, 19.0),
      new THREE.Vector3(11.5, 0, 9.0),
      new THREE.Vector3(4.0, 0, 18.0)
    ],
    specs: {
      processor: 'Snapdragon X Elite / Intel Core Ultra 7 (45.2 TOPS)',
      gpu: 'Intel Arc 140V Xe2 / Qualcomm Adreno GPU',
      display: '15.3" 2.8K PureSight Pro OLED 120Hz 500 nits',
      ram: '32GB LPDDR5X-8533 High-Speed',
      cooling: 'Whisper-Quiet Dual Fan Intelligent Thermals'
    },
    benchmarks: {
      minecraft: {
        fps: '120+ FPS',
        rating: 'EXCELLENT',
        quote: "*Inspects workstation* Yes! The AI PC handles Minecraft effortlessly! The high-efficiency neural processor and GPU deliver a solid 120 FPS on high render distance! And look at that PureSight 2.8K OLED screen—deep caves have true zero blacks, and glowstone glows with HDR brilliance! Truly civilized!",
        ttsText: "Yes, it can run Minecraft beautifully! It has the Intel Core Ultra 7 AI processor and PureSight 2.8K OLED 120 Hertz display, running at over 120 frames per second with vibrant HDR colors!"
      },
      roblox: {
        fps: '120 FPS',
        rating: 'SUPER SMOOTH',
        quote: "OOF! Absolutely! Roblox runs super smooth on this AI PC! You get 90 to 120 FPS on graphics level 8 to 10. Plus, with the 45 TOPS AI chip and 15-hour battery life, you can play Roblox all day on the go without the fan screaming!",
        ttsText: "Oof! Yes, Roblox runs super smooth on this AI PC! You get up to 120 frames per second on the 2.8K OLED display, with all-day battery life and whisper-quiet thermals!"
      },
      terraria: {
        fps: 'Locked 60 FPS',
        rating: 'PERFECT 60',
        quote: "Welcome! The Guide approves! Terraria runs with 100% fluid 60 FPS on this PureSight OLED display. Every pixel of the Jungle and Glowing Mushroom biome shines with vivid color accuracy, and the AI processor stays cool while you mine!",
        ttsText: "Welcome! Yes, Terraria runs with locked 60 frames per second on this PureSight OLED display! The vivid colors make exploring caverns and biomes look breathtaking!"
      }
    }
  },
  {
    id: 'adaptive_yoga_9i',
    name: 'Lenovo Yoga Book 9i Multi-Mode',
    zone: 'Zone 03 - Adaptive Computing',
    position: new THREE.Vector3(-8.0, 1.35, 2.5),
    cardOffset: new THREE.Vector3(0, 0.65, 0.2),
    spawnCorners: [
      new THREE.Vector3(-11.5, 0, 6.0),
      new THREE.Vector3(-11.5, 0, -2.0),
      new THREE.Vector3(-4.0, 0, 3.0)
    ],
    specs: {
      processor: 'Intel Core Ultra 7 155H with Intel AI Boost',
      gpu: 'Intel Arc Xe-LPG Graphics',
      display: 'Dual 13.3" 2.8K PureSight OLED Touch Displays',
      ram: '16GB LPDDR5X-7467',
      cooling: 'Advanced Multimode Thermal Vents'
    },
    benchmarks: {
      minecraft: {
        fps: '90+ FPS',
        rating: 'DUAL SCREEN PRO',
        quote: "*Gestures excitedly* Dual screens for Minecraft?! Astonishing! You can have Minecraft running on the top OLED display at 90 FPS, while keeping your crafting recipes, wiki, and Nether coordinate map on the bottom touch screen! The Core Ultra 7 makes multi-tasking smoother than polished andesite!",
        ttsText: "Dual screens for Minecraft! Yes, it runs at over 90 frames per second on the top PureSight OLED, while you keep crafting recipes on the bottom screen!"
      },
      roblox: {
        fps: '90 FPS',
        rating: 'MULTI-TASK BEAST',
        quote: "OOF! Two screens is epic for Roblox! Play Roblox on the top screen while chatting with your friends or watching gameplay tutorials on the bottom screen! Intel Arc graphics easily deliver 90 FPS on max settings!",
        ttsText: "Oof! Two screens is incredible for Roblox! Game on the top display at 90 FPS while chatting with friends on the lower screen! Powered by Intel Arc graphics!"
      },
      terraria: {
        fps: 'Locked 60 FPS',
        rating: 'EXPLORER GRADE',
        quote: "Hello explorer! This dual-screen Yoga is like holding the Magic Mirror and Cell Phone at once! Terraria on the upper screen with zero lag, and full recipe guide on the lower screen. Highly recommended for any dungeon raid!",
        ttsText: "Hello explorer! Yes, Terraria runs at locked 60 FPS on the upper screen, while you browse your recipes and map on the second screen! Perfect for adventurers!"
      }
    }
  },
  {
    id: 'thinkpad_x1_carbon',
    name: 'Lenovo ThinkPad X1 Carbon Gen 12',
    zone: 'Zone 04 - Personal AI',
    position: new THREE.Vector3(7.2, 1.25, 1.9),
    cardOffset: new THREE.Vector3(0, 0.65, 0.2),
    spawnCorners: [
      new THREE.Vector3(11.5, 0, 6.0),
      new THREE.Vector3(11.5, 0, -2.0),
      new THREE.Vector3(4.0, 0, 2.5)
    ],
    specs: {
      processor: 'Intel Core Ultra 7 165H vPro with Intel Arc',
      gpu: 'Intel Arc Graphics (8 Xe-cores)',
      display: '14" 2.8K OLED HDR 500 True Black 120Hz',
      ram: '32GB LPDDR5X Ultra Memory',
      cooling: 'Carbon Fiber Lightweight Chassis & Dual Exhaust'
    },
    benchmarks: {
      minecraft: {
        fps: '110+ FPS',
        rating: 'OBSIDIAN TOUGH',
        quote: "*Nods with deep respect* The legendary ThinkPad! Tough as obsidian and light as a feather! With the Core Ultra 7 and Intel Arc, you get over 110 FPS on Minecraft with Fabric optimization mods. You can game anywhere with unbreakable durability!",
        ttsText: "The legendary ThinkPad! Yes, it runs Minecraft at over 110 frames per second on its 2.8K OLED display, with military-grade carbon fiber toughness!"
      },
      roblox: {
        fps: '100+ FPS',
        rating: 'EXECUTIVE GAMER',
        quote: "OOF! The executive gaming machine! The ThinkPad X1 runs Roblox at 100+ FPS with ease. The OLED True Black display makes horror and space Roblox games look terrifyingly crisp and responsive!",
        ttsText: "Oof! The ThinkPad X1 runs Roblox at over 100 FPS! The OLED True Black screen makes every game pop with extreme clarity and zero motion blur!"
      },
      terraria: {
        fps: 'Locked 60 FPS',
        rating: 'BATTLE TESTED',
        quote: "Greetings! The ThinkPad X1 Carbon has military-grade durability, perfect for surviving Blood Moons and Solar Eclipses! Flawless 60 FPS Terraria performance anywhere in the world!",
        ttsText: "Greetings! The ThinkPad X1 delivers flawless 60 FPS performance for Terraria, built with military-grade durability for any boss fight!"
      }
    }
  }
];

export const GAMES = [
  { id: 'minecraft', name: 'MINECRAFT', iconColor: '#5b8731', accentColor: '#00d2ff', charType: 'villager', charName: 'MINECRAFT VILLAGER' },
  { id: 'roblox', name: 'ROBLOX', iconColor: '#e2231a', accentColor: '#00d2ff', charType: 'robloxian', charName: 'ROBLOXIAN AVATAR' },
  { id: 'terraria', name: 'TERRARIA', iconColor: '#2e7d32', accentColor: '#ffb300', charType: 'terraria_guide', charName: 'TERRARIA GUIDE' }
];

// ==========================================
// 2. MAIN GAMING ADVISOR CLASS
// ==========================================
export class GamingAdvisorManager {
  constructor(scene, camera, interactionManager) {
    this.scene = scene;
    this.camera = camera;
    this.interactionManager = interactionManager;

    this.selectedGameIndex = 0;
    this.activeLaptop = null;
    this.cardScale = 0;
    this.targetCardScale = 0;

    // Hover Card Mesh & Texture
    this.cardCanvas = document.createElement('canvas');
    this.cardCanvas.width = 1024;
    this.cardCanvas.height = 700;
    this.cardCtx = this.cardCanvas.getContext('2d');
    this.cardTexture = new THREE.CanvasTexture(this.cardCanvas);
    this.cardTexture.minFilter = THREE.LinearFilter;

    this.cardMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5, 1.02),
      new THREE.MeshBasicMaterial({ map: this.cardTexture, transparent: true, side: THREE.DoubleSide })
    );
    this.cardMesh.name = "Gaming_Advisor_Hover_Card";
    this.cardMesh.visible = false;
    this.scene.add(this.cardMesh);

    // Active Spun Character State
    this.activeCharacter = null;
    this.speechBubbleMesh = null;
    this.isSummoning = false;

    // Register 3D Interactive Hotspots on Hover Card
    this.initCardInteractions();

    // Render Initial Card
    this.renderHoverCard();
  }

  // ==========================================
  // 3. CARD RENDERING & ICONS
  // ==========================================
  renderHoverCard(isSummoningState = false) {
    const ctx = this.cardCtx;
    const w = 1024;
    const h = 700;
    ctx.clearRect(0, 0, w, h);

    const laptop = this.activeLaptop || LAPTOP_PROFILES[0];
    const game = GAMES[this.selectedGameIndex];
    const bench = laptop.benchmarks[game.id];

    // Helper: Rounded Rectangle
    const drawRoundRect = (x, y, rw, rh, rad, fillStyle, strokeStyle, lineWidth = 0) => {
      ctx.beginPath();
      ctx.moveTo(x + rad, y);
      ctx.lineTo(x + rw - rad, y);
      ctx.quadraticCurveTo(x + rw, y, x + rw, y + rad);
      ctx.lineTo(x + rw, y + rh - rad);
      ctx.quadraticCurveTo(x + rw, y + rh, x + rw - rad, y + rh);
      ctx.lineTo(x + rad, y + rh);
      ctx.quadraticCurveTo(x, y + rh, x, y + rh - rad);
      ctx.lineTo(x, y + rad);
      ctx.quadraticCurveTo(x, y, x + rad, y);
      ctx.closePath();
      if (fillStyle) {
        ctx.fillStyle = fillStyle;
        ctx.fill();
      }
      if (strokeStyle && lineWidth > 0) {
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      }
    };

    // 1. Outer Frosted Glass Card Body
    drawRoundRect(16, 16, w - 32, h - 32, 32, 'rgba(10, 16, 26, 0.94)', '#00d2ff', 6);
    drawRoundRect(24, 24, w - 48, h - 48, 26, null, 'rgba(0, 210, 255, 0.25)', 2);

    // 2. Header Banner: Lenovo Badge + Laptop Title
    drawRoundRect(40, 40, 150, 44, 10, '#e2231a', null);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Lenovo', 115, 71);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#00d2ff';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(laptop.name.toUpperCase(), 210, 72);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffb300';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(laptop.zone.toUpperCase(), w - 50, 72);

    // Separator line
    ctx.strokeStyle = 'rgba(0, 210, 255, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 100);
    ctx.lineTo(w - 40, 100);
    ctx.stroke();

    // 3. Game Selection Tabs with Custom Icons
    const tabW = 280;
    const tabH = 92;
    const tabGap = 32;
    const startX = (w - (3 * tabW + 2 * tabGap)) / 2;
    const tabY = 120;

    GAMES.forEach((g, idx) => {
      const tx = startX + idx * (tabW + tabGap);
      const isSelected = idx === this.selectedGameIndex;
      const bg = isSelected ? 'rgba(0, 210, 255, 0.22)' : 'rgba(20, 30, 45, 0.7)';
      const border = isSelected ? '#00d2ff' : 'rgba(255, 255, 255, 0.2)';
      drawRoundRect(tx, tabY, tabW, tabH, 16, bg, border, isSelected ? 4 : 2);

      // Draw Custom Game Icon
      const iconX = tx + 20;
      const iconY = tabY + 18;

      if (g.id === 'minecraft') {
        // Pixel Grass Block Icon
        drawRoundRect(iconX, iconY, 56, 56, 8, '#5b8731', '#866043', 4);
        ctx.fillStyle = '#866043';
        ctx.fillRect(iconX + 6, iconY + 28, 44, 22);
        ctx.fillStyle = '#402b1c';
        ctx.fillRect(iconX + 10, iconY + 34, 12, 10);
        ctx.fillRect(iconX + 30, iconY + 38, 14, 8);
      } else if (g.id === 'roblox') {
        // Red Roblox Tilt Icon
        drawRoundRect(iconX, iconY, 56, 56, 12, '#e2231a', '#ffffff', 2);
        ctx.save();
        ctx.translate(iconX + 28, iconY + 28);
        ctx.rotate(-0.25);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-14, -14, 28, 28);
        ctx.fillStyle = '#e2231a';
        ctx.fillRect(-6, -6, 12, 12);
        ctx.restore();
      } else if (g.id === 'terraria') {
        // Terraria Tree Icon
        drawRoundRect(iconX, iconY, 56, 56, 10, '#1b3b22', '#2e7d32', 3);
        ctx.fillStyle = '#2e7d32';
        ctx.beginPath();
        ctx.arc(iconX + 28, iconY + 22, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#6d4c41';
        ctx.fillRect(iconX + 24, iconY + 26, 8, 24);
      }

      // Tab Label Text
      ctx.textAlign = 'left';
      ctx.fillStyle = isSelected ? '#ffffff' : '#cfd8dc';
      ctx.font = 'bold 24px Arial';
      ctx.fillText(g.name, iconX + 68, tabY + 44);

      ctx.fillStyle = isSelected ? '#00d2ff' : '#90a4ae';
      ctx.font = '16px Arial';
      ctx.fillText(isSelected ? '● ACTIVE CHOICE' : 'Click to select', iconX + 68, tabY + 70);
    });

    // 4. Main Question Box (Rounded Center Card)
    const qBoxY = 235;
    const qBoxH = 265;
    drawRoundRect(40, qBoxY, w - 80, qBoxH, 20, 'rgba(15, 25, 40, 0.85)', 'rgba(0, 210, 255, 0.4)', 2);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffb300';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('DEVICE CAPABILITY VERIFICATION', w / 2, qBoxY + 38);

    // The Requested Core Question
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.fillText(`"Do you want to know if ${game.name} runs perfectly on this laptop?"`, w / 2, qBoxY + 84);

    // Laptop Specs Highlights
    ctx.fillStyle = '#00d2ff';
    ctx.font = 'bold 22px Arial';
    ctx.fillText(`HARDWARE: ${laptop.specs.processor}`, w / 2, qBoxY + 130);

    ctx.fillStyle = '#cfd8dc';
    ctx.font = '20px Arial';
    ctx.fillText(`GPU: ${laptop.specs.gpu}`, w / 2, qBoxY + 165);
    ctx.fillText(`DISPLAY: ${laptop.specs.display}`, w / 2, qBoxY + 198);

    ctx.fillStyle = '#00ff96';
    ctx.font = 'bold 22px Arial';
    ctx.fillText(`EXPECTED TARGET: ${bench.fps} • RATING: ${bench.rating}`, w / 2, qBoxY + 236);

    // 5. Action Buttons (YES / NEXT GAME / CLOSE)
    const btnY = 525;
    const btnH = 115;

    // Button A: Big "YES!" (Primary)
    const yesW = 460;
    const yesX = (w - yesW) / 2 - 130;
    if (!isSummoningState) {
      drawRoundRect(yesX, btnY, yesW, btnH, 20, '#00ff96', '#ffffff', 4);
      ctx.fillStyle = '#08141e';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`✓ YES! TELL ME`, yesX + yesW / 2, btnY + 52);

      ctx.fillStyle = '#08141e';
      ctx.font = 'bold 18px Arial';
      ctx.fillText(`Summon ${game.charName} to speak!`, yesX + yesW / 2, btnY + 88);
    } else {
      drawRoundRect(yesX, btnY, yesW, btnH, 20, '#ffb300', '#ffffff', 4);
      ctx.fillStyle = '#08141e';
      ctx.font = 'bold 30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`⏳ SUMMONING EXPERT...`, yesX + yesW / 2, btnY + 52);
      ctx.font = 'bold 18px Arial';
      ctx.fillText(`Character is walking towards you!`, yesX + yesW / 2, btnY + 88);
    }

    // Button B: Switch Game
    const switchW = 280;
    const switchX = yesX + yesW + 24;
    drawRoundRect(switchX, btnY, switchW, btnH, 20, 'rgba(0, 210, 255, 0.25)', '#00d2ff', 3);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`🎮 NEXT GAME`, switchX + switchW / 2, btnY + 52);
    ctx.fillStyle = '#cfd8dc';
    ctx.font = '16px Arial';
    ctx.fillText(`Cycle to next title`, switchX + switchW / 2, btnY + 85);

    // Footer Hint
    ctx.fillStyle = '#90a4ae';
    ctx.font = 'italic 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Tap with VR Controller Ray or Desktop Mouse Click to interact', w / 2, h - 28);

    this.cardTexture.needsUpdate = true;
  }

  // ==========================================
  // 4. INTERACTION HOTSPOTS & 3D HITBOXES
  // ==========================================
  initCardInteractions() {
    this.interactionManager.registerInteractable(this.cardMesh, (hit) => {
      if (!hit || !hit.uv) return;
      soundManager.playClick();
      const uv = hit.uv;
      const x = uv.x * 1024;
      const y = (1 - uv.y) * 700;

      const tabW = 280;
      const tabH = 92;
      const tabGap = 32;
      const startX = (1024 - (3 * tabW + 2 * tabGap)) / 2;
      const tabY = 120;

      GAMES.forEach((g, idx) => {
        const tx = startX + idx * (tabW + tabGap);
        if (x >= tx && x <= tx + tabW && y >= tabY && y <= tabY + tabH) {
          this.selectedGameIndex = idx;
          this.renderHoverCard();
          return;
        }
      });

      const yesW = 460;
      const yesX = (1024 - yesW) / 2 - 130;
      const btnY = 525;
      const btnH = 115;
      if (x >= yesX && x <= yesX + yesW && y >= btnY && y <= btnY + btnH) {
        if (!this.isSummoning) {
          this.triggerYesSummon();
        }
        return;
      }

      const switchW = 280;
      const switchX = yesX + yesW + 24;
      if (x >= switchX && x <= switchX + switchW && y >= btnY && y <= btnY + btnH) {
        this.selectedGameIndex = (this.selectedGameIndex + 1) % GAMES.length;
        this.renderHoverCard();
        return;
      }
    });

    const makeHitbox = (x, y, w, h, onClick) => {
      const geo = new THREE.PlaneGeometry(w, h);
      const mat = new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, 0.015);
      this.cardMesh.add(mesh);
      this.interactionManager.registerInteractable(mesh, () => {
        soundManager.playClick();
        onClick();
      });
      return mesh;
    };

    makeHitbox(-0.34, 0.27, 0.41, 0.14, () => {
      this.selectedGameIndex = 0;
      this.renderHoverCard();
    });

    makeHitbox(0.0, 0.27, 0.41, 0.14, () => {
      this.selectedGameIndex = 1;
      this.renderHoverCard();
    });

    makeHitbox(0.34, 0.27, 0.41, 0.14, () => {
      this.selectedGameIndex = 2;
      this.renderHoverCard();
    });

    makeHitbox(-0.19, -0.34, 0.67, 0.18, () => {
      if (!this.isSummoning) {
        this.triggerYesSummon();
      }
    });

    makeHitbox(0.39, -0.34, 0.41, 0.18, () => {
      this.selectedGameIndex = (this.selectedGameIndex + 1) % GAMES.length;
      this.renderHoverCard();
    });
  }

  // ==========================================
  // 5. TRIGGER "YES" SUMMON
  // ==========================================
  triggerYesSummon() {
    this.isSummoning = true;
    this.renderHoverCard(true);
    soundManager.playPortalSummon();

    const game = GAMES[this.selectedGameIndex];
    const laptop = this.activeLaptop || LAPTOP_PROFILES[0];

    const corners = laptop.spawnCorners || [new THREE.Vector3(-10, 0, 10)];
    const spawnPos = corners[Math.floor(Math.random() * corners.length)].clone();

    this.dismissActiveCharacter();

    let charModel;
    if (game.id === 'minecraft') {
      charModel = this.buildMinecraftVillager();
    } else if (game.id === 'roblox') {
      charModel = this.buildRobloxianAvatar();
    } else {
      charModel = this.buildTerrariaGuide();
    }

    charModel.group.position.copy(spawnPos);
    charModel.group.position.y = 0;
    this.scene.add(charModel.group);

    this.createPortalEffect(spawnPos);

    const playerWorldPos = new THREE.Vector3();
    this.camera.getWorldPosition(playerWorldPos);

    const playerFwd = new THREE.Vector3();
    this.camera.getWorldDirection(playerFwd);
    playerFwd.y = 0;
    playerFwd.normalize();

    const targetPos = playerWorldPos.clone().add(playerFwd.clone().multiplyScalar(1.9));
    targetPos.y = 0;

    this.activeCharacter = {
      model: charModel,
      game: game,
      laptop: laptop,
      state: 'WALKING',
      walkSpeed: 2.3,
      walkTime: 0,
      targetPos: targetPos,
      footstepTimer: 0
    };
  }

  // ==========================================
  // 6. PROCEDURAL 3D CHARACTERS
  // ==========================================

  /**
   * Character 1: 3D Minecraft Villager (Matching User's Reference Image 1)
   * Bald block head, thick unibrow, emerald eyes, protruding 3D nose, brown robe, folded arms, dark boots
   */
  buildMinecraftVillager() {
    const root = new THREE.Group();
    root.name = "Minecraft_Villager_Character";

    // 1. Head Group (Bald, Tan/Peach Skin matching Image 1)
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.55, 0);

    const headMat = new THREE.MeshStandardMaterial({ color: 0xbd8b72, roughness: 0.85 });
    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.42, 0.34), headMat);
    headGroup.add(headMesh);

    // Dark thick unibrow right across forehead
    const browMat = new THREE.MeshBasicMaterial({ color: 0x362419 });
    const browMesh = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.05, 0.02), browMat);
    browMesh.position.set(0, 0.08, 0.175);
    headGroup.add(browMesh);

    // Eyes: White sclera with Emerald Green pupils
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const eyePupilMat = new THREE.MeshBasicMaterial({ color: 0x1e824c });

    [-0.085, 0.085].forEach(xOff => {
      const eyeWhite = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.065, 0.02), eyeWhiteMat);
      eyeWhite.position.set(xOff, 0.015, 0.175);
      headGroup.add(eyeWhite);

      const pupil = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.055, 0.022), eyePupilMat);
      pupil.position.set(xOff + (xOff > 0 ? -0.015 : 0.015), 0.015, 0.176);
      headGroup.add(pupil);
    });

    // Iconic Protruding 3D Minecraft Nose
    const noseMat = new THREE.MeshStandardMaterial({ color: 0xa7735b, roughness: 0.85 });
    const noseMesh = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.22, 0.14), noseMat);
    noseMesh.position.set(0, -0.06, 0.22);
    headGroup.add(noseMesh);

    root.add(headGroup);

    // 2. Brown Robe (Matching Image 1)
    const robeMat = new THREE.MeshStandardMaterial({ color: 0x543d2b, roughness: 0.9 });
    const robeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.82, 0.30), robeMat);
    robeMesh.position.set(0, 0.95, 0);
    root.add(robeMesh);

    // Darker brown collar trim
    const collarMat = new THREE.MeshStandardMaterial({ color: 0x3d2b1f });
    const collarMesh = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.14, 0.32), collarMat);
    collarMesh.position.set(0, 1.30, 0);
    root.add(collarMesh);

    // 3. Crossed / Folded Arms in Front (Classic Villager Pose)
    const armsGroup = new THREE.Group();
    armsGroup.position.set(0, 1.05, 0.19);

    // Robe sleeves
    const armSleeveMesh = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.16, 0.18), robeMat);
    armsGroup.add(armSleeveMesh);

    // Dark robe cuffs
    const cuffMat = new THREE.MeshStandardMaterial({ color: 0x3d2b1f });
    [-0.20, 0.20].forEach(cx => {
      const cuff = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.165, 0.185), cuffMat);
      cuff.position.set(cx, 0, 0);
      armsGroup.add(cuff);
    });

    // Hands tucked into sleeves
    const armHandMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.13, 0.19), headMat);
    armsGroup.add(armHandMesh);
    root.add(armsGroup);

    // 4. Legs & Dark Charcoal Boots
    const legMat = new THREE.MeshStandardMaterial({ color: 0x422f21 });
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x333333 });

    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.10, 0.54, 0);
    const leftLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.44, 0.14), legMat);
    leftLegMesh.position.set(0, -0.22, 0);
    leftLeg.add(leftLegMesh);
    const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.12, 0.17), bootMat);
    leftBoot.position.set(0, -0.48, 0.01);
    leftLeg.add(leftBoot);
    root.add(leftLeg);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.10, 0.54, 0);
    const rightLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.44, 0.14), legMat);
    rightLegMesh.position.set(0, -0.22, 0);
    rightLeg.add(rightLegMesh);
    const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.12, 0.17), bootMat);
    rightBoot.position.set(0, -0.48, 0.01);
    rightLeg.add(rightBoot);
    root.add(rightLeg);

    return {
      group: root,
      head: headGroup,
      leftLeg: leftLeg,
      rightLeg: rightLeg,
      leftArm: null,
      rightArm: null,
      crossedArms: armsGroup,
      type: 'villager'
    };
  }

  /**
   * Character 2: 3D Robloxian Avatar ("Noob") - Matching User's Reference Image 2
   * CYLINDRICAL smooth plastic head, glossy material, smiley face, tilted Roblox "R" on blue torso, yellow arms, green legs
   */
  buildRobloxianAvatar() {
    const root = new THREE.Group();
    root.name = "Robloxian_Avatar_Character";

    // Glossy Plastic Materials typical of Roblox 3D avatars
    const yellowPlastic = new THREE.MeshStandardMaterial({ color: 0xfed543, roughness: 0.18, metalness: 0.05 });
    const bluePlastic = new THREE.MeshStandardMaterial({ color: 0x0d69ac, roughness: 0.18, metalness: 0.05 });
    const greenPlastic = new THREE.MeshStandardMaterial({ color: 0x75b036, roughness: 0.18, metalness: 0.05 });

    // 1. Head (CYLINDRICAL with rounded top & stud, matching Image 2!)
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.48, 0);

    // Cylindrical Head
    const headGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.32, 32);
    const headMesh = new THREE.Mesh(headGeo, yellowPlastic);
    headGroup.add(headMesh);

    // Top Stud
    const studGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 24);
    const studMesh = new THREE.Mesh(studGeo, yellowPlastic);
    studMesh.position.set(0, 0.185, 0);
    headGroup.add(studMesh);

    // Front Face Canvas Texture (Cylindrical curved face with classic Roblox eyes and smile)
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = 256;
    faceCanvas.height = 256;
    const fctx = faceCanvas.getContext('2d');
    fctx.fillStyle = '#fed543';
    fctx.fillRect(0, 0, 256, 256);

    // Eyes
    fctx.fillStyle = '#111111';
    fctx.beginPath();
    fctx.ellipse(90, 110, 12, 18, 0, 0, Math.PI * 2);
    fctx.fill();
    fctx.beginPath();
    fctx.ellipse(166, 110, 12, 18, 0, 0, Math.PI * 2);
    fctx.fill();

    // Catchlight highlight in eyes
    fctx.fillStyle = '#ffffff';
    fctx.beginPath();
    fctx.arc(88, 106, 4, 0, Math.PI * 2);
    fctx.fill();
    fctx.beginPath();
    fctx.arc(164, 106, 4, 0, Math.PI * 2);
    fctx.fill();

    // Curved Smile
    fctx.strokeStyle = '#111111';
    fctx.lineWidth = 9;
    fctx.lineCap = 'round';
    fctx.beginPath();
    fctx.arc(128, 135, 42, 0.15 * Math.PI, 0.85 * Math.PI, false);
    fctx.stroke();

    const faceTex = new THREE.CanvasTexture(faceCanvas);
    const facePlaneGeo = new THREE.PlaneGeometry(0.28, 0.28);
    const facePlaneMat = new THREE.MeshBasicMaterial({ map: faceTex, transparent: true });
    const faceDecal = new THREE.Mesh(facePlaneGeo, facePlaneMat);
    faceDecal.position.set(0, 0, 0.182);
    headGroup.add(faceDecal);

    root.add(headGroup);

    // 2. Torso: Royal Blue with THE ICONIC ROBLOX "R" LOGO (Matching Image 2!)
    const torsoMesh = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.58, 0.28), bluePlastic);
    torsoMesh.position.set(0, 0.98, 0);

    // Draw the Roblox tilted "R" logo on the upper-left of chest
    const rLogoCanvas = document.createElement('canvas');
    rLogoCanvas.width = 256;
    rLogoCanvas.height = 256;
    const rctx = rLogoCanvas.getContext('2d');
    rctx.clearRect(0, 0, 256, 256);

    // Tilted white Roblox "R" with bold red outline (matching Image 2)
    rctx.save();
    rctx.translate(128, 128);
    rctx.rotate(-0.24); // ~14° tilt

    // Red outer outline box / stylized R
    rctx.fillStyle = '#e2231a';
    rctx.beginPath();
    rctx.roundRect(-75, -85, 150, 170, 24);
    rctx.fill();

    // White Inner "R"
    rctx.fillStyle = '#ffffff';
    rctx.beginPath();
    rctx.roundRect(-60, -70, 120, 140, 16);
    rctx.fill();

    // Red stylized center hole & cutout
    rctx.fillStyle = '#e2231a';
    rctx.beginPath();
    rctx.roundRect(-30, -50, 60, 48, 10);
    rctx.fill();
    rctx.fillRect(-60, 15, 60, 55);
    rctx.restore();

    const rLogoTex = new THREE.CanvasTexture(rLogoCanvas);
    const rLogoMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.18, 0.18),
      new THREE.MeshBasicMaterial({ map: rLogoTex, transparent: true })
    );
    rLogoMesh.position.set(0.10, 0.10, 0.142); // Upper-left chest
    torsoMesh.add(rLogoMesh);

    root.add(torsoMesh);

    // 3. Left & Right Yellow Arms
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.38, 1.22, 0);
    const leftArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.54, 0.22), yellowPlastic);
    leftArmMesh.position.set(0, -0.23, 0);
    leftArm.add(leftArmMesh);
    root.add(leftArm);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.38, 1.22, 0);
    const rightArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.54, 0.22), yellowPlastic);
    rightArmMesh.position.set(0, -0.23, 0);
    rightArm.add(rightArmMesh);
    root.add(rightArm);

    // 4. Left & Right Green Legs (Matching Image 2)
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.14, 0.70, 0);
    const leftLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.68, 0.24), greenPlastic);
    leftLegMesh.position.set(0, -0.34, 0);
    leftLeg.add(leftLegMesh);
    root.add(leftLeg);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.14, 0.70, 0);
    const rightLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.68, 0.24), greenPlastic);
    rightLegMesh.position.set(0, -0.34, 0);
    rightLeg.add(rightLegMesh);
    root.add(rightLeg);

    return {
      group: root,
      head: headGroup,
      leftLeg: leftLeg,
      rightLeg: rightLeg,
      leftArm: leftArm,
      rightArm: rightArm,
      crossedArms: null,
      type: 'robloxian'
    };
  }

  /**
   * Character 3: 3D Pixelated Terraria Guide (Matching User's Reference Image 3)
   * Rendered with pixel-art canvas mapped with NearestFilter for authentic crisp 16-bit retro look!
   */
  buildTerrariaGuide() {
    const root = new THREE.Group();
    root.name = "Terraria_Guide_Pixel_Character";

    // Build the exact pixel grid from Image 3
    const pxW = 24;
    const pxH = 38;
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = pxW;
    spriteCanvas.height = pxH;
    const pctx = spriteCanvas.getContext('2d');
    pctx.clearRect(0, 0, pxW, pxH);

    // Color definitions extracted directly from Image 3
    const OUTLINE = '#231c19';
    const HAIR_DARK = '#5e2718';
    const HAIR_MID = '#8e3f2b';
    const HAIR_LIGHT = '#b85536';
    const SKIN = '#e88060';
    const SKIN_LIGHT = '#f09a78';
    const EYE_WHITE = '#ffffff';
    const EYE_PUPIL = '#2c2420';
    const SLEEVE = '#6886a6';
    const VEST_LIGHT = '#a6a498';
    const VEST_MID = '#8a887e';
    const VEST_DARK = '#6b6960';
    const BELT = '#4d3f35';
    const PANTS = '#c2bc9e';
    const PANTS_DARK = '#9c967e';
    const BOOT = '#4d2c1a';

    const p = (x, y, color) => {
      pctx.fillStyle = color;
      pctx.fillRect(x, y, 1, 1);
    };

    // Row-by-row pixel painting of Terraria Guide (matching Image 3)
    // Hair Spikes (top rows 2-10)
    for (let x = 8; x <= 16; x++) p(x, 3, HAIR_MID);
    p(10, 2, HAIR_LIGHT); p(11, 2, HAIR_LIGHT); p(14, 2, HAIR_MID);
    for (let x = 6; x <= 18; x++) p(x, 4, x % 2 === 0 ? HAIR_LIGHT : HAIR_MID);
    for (let x = 5; x <= 19; x++) p(x, 5, HAIR_MID);
    p(4, 5, OUTLINE); p(20, 5, OUTLINE);
    for (let x = 5; x <= 19; x++) p(x, 6, x < 12 ? HAIR_LIGHT : HAIR_DARK);
    p(17, 7, HAIR_MID); p(18, 7, HAIR_MID); p(19, 7, HAIR_MID);

    // Face & Eye (rows 8-15)
    for (let y = 8; y <= 14; y++) {
      for (let x = 9; x <= 16; x++) p(x, y, SKIN);
    }
    // Eye
    p(13, 11, EYE_WHITE); p(13, 12, EYE_WHITE);
    p(14, 11, EYE_PUPIL); p(14, 12, EYE_PUPIL);
    // Nose highlight
    p(16, 13, SKIN_LIGHT); p(17, 13, OUTLINE);

    // Hair sides and curls
    p(5, 7, HAIR_DARK); p(5, 8, HAIR_MID); p(6, 9, HAIR_MID);
    p(7, 10, HAIR_DARK); p(8, 11, HAIR_MID); p(8, 12, HAIR_DARK);

    // Blue Shoulder Sleeve (rows 16-20)
    for (let y = 16; y <= 20; y++) {
      p(6, y, OUTLINE);
      p(7, y, SLEEVE);
      p(8, y, SLEEVE);
    }
    p(7, 21, SKIN); p(8, 21, SKIN); // Hand

    // Vest / Tunic (rows 16-25)
    for (let y = 16; y <= 24; y++) {
      p(9, y, VEST_DARK);
      for (let x = 10; x <= 16; x++) {
        p(x, y, x % 3 === 0 ? VEST_LIGHT : VEST_MID);
      }
      p(17, y, OUTLINE);
    }

    // Belt (row 25)
    for (let x = 9; x <= 16; x++) p(x, 25, BELT);

    // Hands
    p(6, 22, SKIN); p(7, 22, SKIN); p(8, 22, SKIN);
    p(17, 22, SKIN); p(18, 22, SKIN);

    // Pants (rows 26-32)
    for (let y = 26; y <= 32; y++) {
      p(8, y, OUTLINE);
      for (let x = 9; x <= 15; x++) p(x, y, x === 12 ? PANTS_DARK : PANTS);
      p(16, y, OUTLINE);
    }

    // Boots (rows 33-35)
    for (let y = 33; y <= 35; y++) {
      p(8, y, OUTLINE);
      for (let x = 9; x <= 16; x++) p(x, y, BOOT);
      p(17, y, OUTLINE);
    }
    // Bottom outline
    for (let x = 8; x <= 17; x++) p(x, 36, OUTLINE);

    // NearestFilter Texture for pixel perfection!
    const pixelTexture = new THREE.CanvasTexture(spriteCanvas);
    pixelTexture.magFilter = THREE.NearestFilter;
    pixelTexture.minFilter = THREE.NearestFilter;

    // Sprite Plane (1.1m wide x 1.75m high)
    const spriteGeo = new THREE.PlaneGeometry(1.1, 1.75);
    const spriteMat = new THREE.MeshBasicMaterial({
      map: pixelTexture,
      transparent: true,
      side: THREE.DoubleSide,
      alphaTest: 0.1
    });

    const spriteMesh = new THREE.Mesh(spriteGeo, spriteMat);
    spriteMesh.position.set(0, 0.88, 0);
    root.add(spriteMesh);

    // Pixelated Floor Drop Shadow
    const shadowGeo = new THREE.PlaneGeometry(0.8, 0.35);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x0a0c10,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(0, 0.01, 0);
    root.add(shadow);

    return {
      group: root,
      head: spriteMesh,
      sprite: spriteMesh,
      leftLeg: null,
      rightLeg: null,
      leftArm: null,
      rightArm: null,
      type: 'terraria_guide'
    };
  }

  // ==========================================
  // 7. PORTAL PARTICLE EFFECT
  // ==========================================
  createPortalEffect(position) {
    const portalGroup = new THREE.Group();
    portalGroup.position.copy(position);
    portalGroup.position.y = 0.02;

    const ringGeo = new THREE.RingGeometry(0.4, 0.9, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00d2ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    portalGroup.add(ring);

    this.scene.add(portalGroup);

    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 0.05;
      ring.scale.setScalar(1 + Math.sin(elapsed * 5) * 0.15);
      ringMat.opacity = Math.max(0, 0.85 - elapsed * 0.35);
      if (elapsed > 2.5) {
        clearInterval(interval);
        this.scene.remove(portalGroup);
      }
    }, 50);
  }

  // ==========================================
  // 8. 3D SPEECH BUBBLE & GAME-THEMED SUBTITLES
  // ==========================================
  showCharacterSpeechBubble(charData) {
    if (this.speechBubbleMesh) {
      this.scene.remove(this.speechBubbleMesh);
      this.speechBubbleMesh = null;
    }

    const bubbleCanvas = document.createElement('canvas');
    bubbleCanvas.width = 1024;
    bubbleCanvas.height = 576;
    const ctx = bubbleCanvas.getContext('2d');

    const game = charData.game;
    const laptop = charData.laptop;
    const bench = laptop.benchmarks[game.id];

    // Dispatch to authentic Game-Themed Dialogue Renderers
    if (game.id === 'minecraft') {
      this.renderMinecraftDialogue(ctx, 1024, 576, charData);
    } else if (game.id === 'roblox') {
      this.renderRobloxDialogue(ctx, 1024, 576, charData);
    } else {
      this.renderTerrariaDialogue(ctx, 1024, 576, charData);
    }

    const bubbleTexture = new THREE.CanvasTexture(bubbleCanvas);
    bubbleTexture.minFilter = THREE.LinearFilter;

    const bubbleMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.68, 0.95),
      new THREE.MeshBasicMaterial({ map: bubbleTexture, transparent: true, side: THREE.DoubleSide })
    );
    bubbleMesh.position.set(0, 2.30, 0);
    charData.model.group.add(bubbleMesh);
    this.speechBubbleMesh = bubbleMesh;

    // Register click interaction on speech bubble
    this.interactionManager.registerInteractable(bubbleMesh, (hit) => {
      if (!hit || !hit.uv) return;
      const uv = hit.uv;
      const x = uv.x * 1024;
      const y = (1 - uv.y) * 576;

      // Replay Voice button: [580, 422, 175, 44]
      if (x >= 580 && x <= 755 && y >= 422 && y <= 470) {
        soundManager.playClick();
        this.speakCharacterDialogue(charData);
        return;
      }

      // Done / Close button: [775, 422, 190, 44]
      if (x >= 775 && x <= 975 && y >= 422 && y <= 470) {
        soundManager.playClick();
        this.dismissActiveCharacter();
        return;
      }
    });

    // Speak audio & TTS
    this.speakCharacterDialogue(charData);
  }

  /**
   * THEME 1: MINECRAFT SUBTITLE & GUI DIALOGUE BOX
   * Full Minecraft stone beveled frame, Press Start 2P pixel font, yellow/green color codes
   */
  renderMinecraftDialogue(ctx, w, h, charData) {
    ctx.clearRect(0, 0, w, h);
    const laptop = charData.laptop;
    const bench = laptop.benchmarks.minecraft;

    // 1. Dark Stone Background with 4px Beveled Minecraft GUI Frame
    const bx = 16, by = 16, bw = w - 32, bh = h - 32;

    // Outer Black Outline (4px)
    ctx.fillStyle = '#000000';
    ctx.fillRect(bx, by, bw, bh);

    // Inner Fill (Dark Translucent Granite #161616)
    ctx.fillStyle = 'rgba(22, 22, 22, 0.96)';
    ctx.fillRect(bx + 4, by + 4, bw - 8, bh - 8);

    // Classic Minecraft Bevel Highlights (White Top/Left, Dark Grey Bottom/Right)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(bx + 4, by + 4, bw - 8, 4); // Top
    ctx.fillRect(bx + 4, by + 4, 4, bh - 8); // Left

    ctx.fillStyle = '#373737';
    ctx.fillRect(bx + 4, by + bh - 8, bw - 8, 4); // Bottom
    ctx.fillRect(bx + bw - 8, by + 4, 4, bh - 8); // Right

    // 2. Minecraft Subtitles Banner Header
    ctx.fillStyle = '#222222';
    ctx.fillRect(40, 36, w - 80, 52);
    ctx.strokeStyle = '#3f3f00';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 36, w - 80, 52);

    // Pixel Font Helper with authentic drop shadow
    const drawPixelText = (text, x, y, col = '#ffffff', shadowCol = '#3f3f3f', size = 18) => {
      ctx.font = `${size}px "Press Start 2P", monospace`;
      ctx.fillStyle = shadowCol;
      ctx.fillText(text, x + 3, y + 3);
      ctx.fillStyle = col;
      ctx.fillText(text, x, y);
    };

    drawPixelText('[ Subtitles: <Villager> Hrrrrmm! ]', 60, 70, '#ffff55', '#3f3f00', 18);
    drawPixelText('MINECRAFT BENCHMARK', w - 380, 70, '#55ff55', '#003f00', 16);

    // 3. Dialogue Header
    drawPixelText('Villager: "Hrrrrmm! Yes, it can run Minecraft!"', 50, 140, '#ffffff', '#222222', 20);

    // 4. Hardware Specs in Minecraft Formatting
    drawPixelText(`• CPU: ${laptop.specs.processor}`, 50, 190, '#ffff55', '#3f3f00', 16);
    drawPixelText(`• GPU: ${laptop.specs.gpu}`, 50, 230, '#55ff55', '#003f00', 16);
    drawPixelText(`• Display: ${laptop.specs.display}`, 50, 270, '#55ffff', '#003f3f', 16);
    drawPixelText(`• Target FPS: ${bench.fps} (BSL Ultra Shaders)`, 50, 310, '#ffaa00', '#3f2a00', 16);
    drawPixelText(`• Trade Rating: 64 Emeralds Approved! Hrrrrm!`, 50, 350, '#55ff55', '#003f00', 16);

    // 5. Minecraft Stone GUI Buttons
    // Replay Button: [580, 422, 175, 48]
    const drawMcButton = (bx, by, bw, bh, text) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(bx, by, bw, bh);
      ctx.fillStyle = '#6a6a6a';
      ctx.fillRect(bx + 3, by + 3, bw - 6, bh - 6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bx + 3, by + 3, bw - 6, 3); // top highlight
      ctx.fillRect(bx + 3, by + 3, 3, bh - 6); // left highlight
      ctx.fillStyle = '#303030';
      ctx.fillRect(bx + 3, by + bh - 6, bw - 6, 3); // bottom shadow
      ctx.fillRect(bx + bw - 6, by + 3, 3, bh - 6); // right shadow

      ctx.textAlign = 'center';
      drawPixelText(text, bx + bw / 2, by + 32, '#ffffff', '#222222', 15);
      ctx.textAlign = 'left';
    };

    drawMcButton(560, 420, 195, 52, 'Replay Hrmm');
    drawMcButton(775, 420, 195, 52, 'Done [Exit]');
  }

  /**
   * THEME 2: ROBLOX MODERN CHAT BUBBLE & DIALOGUE
   * Translucent slate bubble, Fredoka font, tilted Roblox "R" badge, blue/green pill buttons
   */
  renderRobloxDialogue(ctx, w, h, charData) {
    ctx.clearRect(0, 0, w, h);
    const laptop = charData.laptop;
    const bench = laptop.benchmarks.roblox;

    // 1. Sleek Rounded Roblox Chat Bubble with Tail
    const bx = 20, by = 20, bw = w - 40, bh = 480;
    const rad = 28;

    ctx.beginPath();
    ctx.moveTo(bx + rad, by);
    ctx.lineTo(bx + bw - rad, by);
    ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + rad);
    ctx.lineTo(bx + bw, by + bh - rad);
    ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - rad, by + bh);
    // Downward tail
    ctx.lineTo(540, by + bh);
    ctx.lineTo(512, by + bh + 45);
    ctx.lineTo(484, by + bh);
    ctx.lineTo(bx + rad, by + bh);
    ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - rad);
    ctx.lineTo(bx, by + rad);
    ctx.quadraticCurveTo(bx, by, bx + rad, by);
    ctx.closePath();

    ctx.fillStyle = 'rgba(20, 24, 32, 0.96)';
    ctx.fill();
    ctx.strokeStyle = '#00a2ff';
    ctx.lineWidth = 5;
    ctx.stroke();

    // 2. Roblox Red "R" Badge & Name Tag
    ctx.fillStyle = '#e2231a';
    ctx.beginPath();
    ctx.roundRect(45, 42, 42, 42, 10);
    ctx.fill();

    // White "R" in badge
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px Fredoka, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('R', 66, 73);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#00a2ff';
    ctx.font = 'bold 28px Fredoka, Arial, sans-serif';
    ctx.fillText('Robloxian [Classic Noob]', 100, 72);

    ctx.fillStyle = '#00ff96';
    ctx.font = 'bold 18px Fredoka, Arial, sans-serif';
    ctx.fillText('✓ Verified Metaverse Explorer', 430, 72);

    ctx.strokeStyle = 'rgba(0, 162, 255, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(45, 96);
    ctx.lineTo(w - 45, 96);
    ctx.stroke();

    // 3. Core Dialogue
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Fredoka, Arial, sans-serif';
    ctx.fillText('"OOF! Absolutely yes! Roblox runs at max graphics quality 10!"', 45, 145);

    ctx.fillStyle = '#cfd8dc';
    ctx.font = '22px Fredoka, Arial, sans-serif';
    ctx.fillText(`Runs 100-player Brookhaven & BedWars effortlessly with zero lag.`, 45, 185);

    // 4. Specs Pills
    const badgeY = 230;
    const pills = [
      { label: 'PROCESSOR', val: laptop.specs.processor.split('(')[0].trim(), col: '#00a2ff' },
      { label: 'GRAPHICS', val: laptop.specs.gpu.split('(')[0].trim(), col: '#ffb300' },
      { label: 'DISPLAY', val: laptop.specs.display.split('(')[0].trim(), col: '#00ff96' },
      { label: 'PERFORMANCE', val: `${bench.fps} Max Quality 10`, col: '#e2231a' }
    ];

    pills.forEach((p, idx) => {
      const px = 45 + idx * 230;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.roundRect(px, badgeY, 218, 70, 14);
      ctx.fill();
      ctx.strokeStyle = p.col;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = p.col;
      ctx.font = 'bold 15px Fredoka, Arial, sans-serif';
      ctx.fillText(p.label, px + 14, badgeY + 26);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Fredoka, Arial, sans-serif';
      ctx.fillText(p.val.length > 20 ? p.val.substring(0, 19) + '…' : p.val, px + 14, badgeY + 52);
    });

    // 5. Roblox Pill Action Buttons
    // Replay Button
    ctx.fillStyle = '#00a2ff';
    ctx.beginPath();
    ctx.roundRect(580, 415, 175, 48, 24);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Fredoka, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔊 REPLAY OOF', 667, 446);

    // Thanks Button
    ctx.fillStyle = '#00ff96';
    ctx.beginPath();
    ctx.roundRect(775, 415, 190, 48, 24);
    ctx.fill();
    ctx.fillStyle = '#08141e';
    ctx.fillText('✓ GG, THANKS!', 870, 446);
  }

  /**
   * THEME 3: TERRARIA NPC DIALOGUE WINDOW
   * Dark slate stone panel, ornate gold double-frame with corner scrollwork, Guide nameplate, warm cream pixel font
   */
  renderTerrariaDialogue(ctx, w, h, charData) {
    ctx.clearRect(0, 0, w, h);
    const laptop = charData.laptop;
    const bench = laptop.benchmarks.terraria;

    const bx = 16, by = 16, bw = w - 32, bh = h - 32;

    // 1. Dark Blue Stone Background #151828
    ctx.fillStyle = 'rgba(21, 24, 40, 0.97)';
    ctx.fillRect(bx, by, bw, bh);

    // 2. Ornate Terraria Double Gold Border (#d4af37 & #f5c542)
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 6;
    ctx.strokeRect(bx + 4, by + 4, bw - 8, bh - 8);

    ctx.strokeStyle = '#f5c542';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx + 12, by + 12, bw - 24, bh - 24);

    // Ornamental Corner Brackets
    const drawCorner = (cx, cy) => {
      ctx.fillStyle = '#f5c542';
      ctx.fillRect(cx - 10, cy - 10, 20, 20);
      ctx.fillStyle = '#7a5716';
      ctx.fillRect(cx - 6, cy - 6, 12, 12);
    };
    drawCorner(bx + 12, by + 12);
    drawCorner(bx + bw - 12, by + 12);
    drawCorner(bx + 12, by + bh - 12);
    drawCorner(bx + bw - 12, by + bh - 12);

    // 3. Guide Nameplate Banner Header
    ctx.fillStyle = '#3a2016';
    ctx.fillRect(45, 36, 180, 46);
    ctx.strokeStyle = '#f5c542';
    ctx.lineWidth = 3;
    ctx.strokeRect(45, 36, 180, 46);

    const drawPixelText = (text, x, y, col = '#fff7d6', shadowCol = '#20150b', size = 18) => {
      ctx.font = `${size}px "Press Start 2P", monospace`;
      ctx.fillStyle = shadowCol;
      ctx.fillText(text, x + 3, y + 3);
      ctx.fillStyle = col;
      ctx.fillText(text, x, y);
    };

    drawPixelText('GUIDE', 85, 68, '#f5c542', '#30180a', 20);
    drawPixelText('[ TERRARIA NPC DIALOGUE ]', 245, 68, '#a89f81', '#101010', 16);

    // 4. Core Dialogue
    drawPixelText('Guide: "Greetings! Terraria runs flawlessly here!"', 45, 140, '#fff7d6', '#101010', 18);
    drawPixelText(`• CPU: ${laptop.specs.processor}`, 45, 190, '#f5c542', '#2a1a08', 16);
    drawPixelText(`• GPU: ${laptop.specs.gpu}`, 45, 230, '#55ff55', '#002a00', 16);
    drawPixelText(`• Display: ${laptop.specs.display}`, 45, 270, '#55ffff', '#002a2a', 16);
    drawPixelText(`• Target: ${bench.fps} (No drops during Calamity!)`, 45, 310, '#ff9900', '#2a1500', 16);
    drawPixelText(`• World Load Time: < 1.2s via High-Speed SSD!`, 45, 350, '#fff7d6', '#101010', 16);

    // 5. Terraria Stone Buttons with Gold Border
    const drawTerrariaButton = (bx, by, bw, bh, text) => {
      ctx.fillStyle = '#2d2e38';
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 3;
      ctx.strokeRect(bx, by, bw, bh);

      ctx.textAlign = 'center';
      drawPixelText(text, bx + bw / 2, by + 32, '#fff7d6', '#101010', 15);
      ctx.textAlign = 'left';
    };

    drawTerrariaButton(560, 420, 195, 52, 'Listen Again');
    drawTerrariaButton(775, 420, 195, 52, 'Close [X]');
  }

  getBestVoiceForCharacter(charType) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    if (charType === 'villager') {
      // Look for deep, rich, expressive male voices
      return voices.find(v => (v.name.includes('Natural') || v.name.includes('Google UK English Male') || v.name.includes('George') || v.name.includes('Ryan') || v.name.includes('Guy') || v.name.includes('David')) && v.lang.startsWith('en')) ||
             voices.find(v => v.lang.startsWith('en-GB')) ||
             voices.find(v => v.lang.startsWith('en')) || voices[0];
    } else if (charType === 'robloxian') {
      // Look for high-energy, bright, youthful voice
      return voices.find(v => (v.name.includes('Jenny') || v.name.includes('Zira') || v.name.includes('Steffan') || v.name.includes('Google US English') || v.name.includes('Samantha')) && v.lang.startsWith('en')) ||
             voices.find(v => v.lang.startsWith('en-US')) ||
             voices.find(v => v.lang.startsWith('en')) || voices[0];
    } else {
      // Terraria Guide: Adventurous, wise British or fantasy explorer tone
      return voices.find(v => (v.name.includes('UK') || v.name.includes('Oliver') || v.name.includes('Daniel') || v.name.includes('Arthur')) && v.lang.startsWith('en')) ||
             voices.find(v => v.lang.startsWith('en-GB')) ||
             voices.find(v => v.lang.startsWith('en')) || voices[0];
    }
  }

  speakCharacterDialogue(charData) {
    const game = charData.game;
    const laptop = charData.laptop;
    const bench = laptop.benchmarks[game.id];

    // Helper: start natural game-themed spoken dialogue after authentic intro sound
    const startSpokenDialogue = () => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(bench.ttsText);
        const bestVoice = this.getBestVoiceForCharacter(game.charType);
        if (bestVoice) {
          utterance.voice = bestVoice;
        }

        if (game.id === 'minecraft') {
          // Deep, warm, humorous nasal villager vocal delivery
          utterance.pitch = 0.80;
          utterance.rate = 0.94;
        } else if (game.id === 'roblox') {
          // Youthful, energetic, excited gamer delivery with bloxy chimes
          utterance.pitch = 1.34;
          utterance.rate = 1.15;
          soundManager.playRobloxChatBoing();
        } else {
          // Terraria Guide: Wise, friendly fantasy explorer tone
          utterance.pitch = 0.98;
          utterance.rate = 0.95;

          // Accompany dialogue with rhythmic 16-bit Terraria NPC chatter blips
          let blipCount = 0;
          const blipInterval = setInterval(() => {
            if (window.speechSynthesis.speaking && blipCount < 14) {
              soundManager.playTerrariaBlip();
              blipCount++;
            } else {
              clearInterval(blipInterval);
            }
          }, 180);
        }

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn("SpeechSynthesis error:", e);
      }
    };

    // Duck background convention chatter so dialogue is completely clear
    soundManager.duckCrowdChatter();

    // 1. Play Authentic Retro Sound First, then smoothly continue with dialogue!
    if (game.id === 'minecraft') {
      // Real YouTube Villager Sound (from https://www.youtube.com/watch?v=fiwRZ_j61Dc)
      soundManager.playVillagerHmm(() => {
        startSpokenDialogue();
      });
    } else if (game.id === 'roblox') {
      // Iconic Roblox "OOF" Sound
      soundManager.playRobloxOof(() => {
        startSpokenDialogue();
      });
    } else {
      // Iconic Terraria Opening Chime
      soundManager.playTerrariaChime(() => {
        startSpokenDialogue();
      });
    }
  }

  // ==========================================
  // 9. DISMISS / CLEANUP CHARACTER
  // ==========================================
  dismissActiveCharacter() {
    // Restore background convention chatter
    soundManager.restoreCrowdChatter();

    if (this.speechBubbleMesh && this.activeCharacter) {
      this.interactionManager.unregisterInteractable(this.speechBubbleMesh);
      this.activeCharacter.model.group.remove(this.speechBubbleMesh);
      this.speechBubbleMesh = null;
    }

    if (this.activeCharacter) {
      this.activeCharacter.state = 'DEPARTING';
      const grp = this.activeCharacter.model.group;

      let scale = 1.0;
      const fadeInterval = setInterval(() => {
        scale -= 0.1;
        grp.scale.setScalar(Math.max(0, scale));
        if (scale <= 0) {
          clearInterval(fadeInterval);
          this.scene.remove(grp);
        }
      }, 40);

      this.activeCharacter = null;
    }

    this.isSummoning = false;
    this.renderHoverCard(false);
  }

  // ==========================================
  // 10. REAL-TIME PROXIMITY & ANIMATION LOOP
  // ==========================================
  update(delta, time) {
    const playerWorldPos = new THREE.Vector3();
    this.camera.getWorldPosition(playerWorldPos);

    let nearestLaptop = null;
    let minDist = Infinity;

    for (const laptop of LAPTOP_PROFILES) {
      const dist = playerWorldPos.distanceTo(laptop.position);
      if (dist < minDist) {
        minDist = dist;
        nearestLaptop = laptop;
      }
    }

    const proximityThreshold = 3.2;

    if (nearestLaptop && minDist <= proximityThreshold) {
      if (this.activeLaptop !== nearestLaptop) {
        this.activeLaptop = nearestLaptop;
        this.renderHoverCard();
      }
      this.targetCardScale = 1.0;
      this.cardMesh.visible = true;

      // Position gaming card on the LEFT side of the laptop from approaching player perspective
      const centerCardPos = nearestLaptop.position.clone().add(nearestLaptop.cardOffset);
      const toPlayer = playerWorldPos.clone().sub(centerCardPos);
      toPlayer.y = 0;
      toPlayer.normalize();
      const rightVector = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), toPlayer).normalize();

      const targetCardPos = centerCardPos.clone().addScaledVector(rightVector, -0.92);
      this.cardMesh.position.copy(targetCardPos);
      this.cardMesh.lookAt(playerWorldPos.x, targetCardPos.y, playerWorldPos.z);
    } else {
      if (minDist > 3.8) {
        this.targetCardScale = 0.0;
      }
    }

    this.cardScale += (this.targetCardScale - this.cardScale) * Math.min(1.0, delta * 8.0);
    this.cardMesh.scale.setScalar(Math.max(0.001, this.cardScale));
    if (this.cardScale < 0.02 && this.targetCardScale === 0) {
      this.cardMesh.visible = false;
    }

    // Active Character Walk & Idle Animation
    if (this.activeCharacter && this.activeCharacter.state === 'WALKING') {
      const char = this.activeCharacter;
      const grp = char.model.group;

      const toTarget = char.targetPos.clone().sub(grp.position);
      toTarget.y = 0;
      const distToTarget = toTarget.length();

      if (distToTarget > 0.25) {
        toTarget.normalize();
        grp.position.addScaledVector(toTarget, char.walkSpeed * delta);
        grp.lookAt(char.targetPos.x, grp.position.y, char.targetPos.z);

        char.walkTime += delta * 9.0;
        const walkSin = Math.sin(char.walkTime);

        if (char.model.leftLeg) char.model.leftLeg.rotation.x = walkSin * 0.55;
        if (char.model.rightLeg) char.model.rightLeg.rotation.x = -walkSin * 0.55;

        if (char.model.leftArm) char.model.leftArm.rotation.x = -walkSin * 0.55;
        if (char.model.rightArm) char.model.rightArm.rotation.x = walkSin * 0.55;

        if (char.model.crossedArms) {
          char.model.crossedArms.position.y = 1.05 + Math.sin(char.walkTime * 2) * 0.02;
        }

        // Terraria 2D Sprite step animation
        if (char.model.sprite) {
          char.model.sprite.rotation.z = Math.sin(char.walkTime) * 0.08;
        }

        grp.position.y = Math.abs(walkSin) * 0.05;

        char.footstepTimer += delta;
        if (char.footstepTimer > 0.32) {
          char.footstepTimer = 0;
          soundManager.playFootstep();
        }
      } else {
        char.state = 'SPEAKING';
        if (char.model.leftLeg) char.model.leftLeg.rotation.x = 0;
        if (char.model.rightLeg) char.model.rightLeg.rotation.x = 0;
        if (char.model.leftArm) char.model.leftArm.rotation.x = 0;
        if (char.model.rightArm) char.model.rightArm.rotation.x = 0;
        if (char.model.sprite) char.model.sprite.rotation.z = 0;
        grp.position.y = 0;

        grp.lookAt(playerWorldPos.x, grp.position.y, playerWorldPos.z);

        this.showCharacterSpeechBubble(char);
      }
    } else if (this.activeCharacter && this.activeCharacter.state === 'SPEAKING') {
      const grp = this.activeCharacter.model.group;
      grp.lookAt(playerWorldPos.x, grp.position.y, playerWorldPos.z);

      if (this.speechBubbleMesh) {
        this.speechBubbleMesh.lookAt(playerWorldPos);
      }

      if (this.activeCharacter.model.head) {
        this.activeCharacter.model.head.rotation.y = Math.sin(time * 2.0) * 0.08;
      }
    }
  }
}
