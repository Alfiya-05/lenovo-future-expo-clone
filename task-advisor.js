/**
 * Lenovo Future Expo - Task-Based Experience Advisor System
 *
 * Complements the Gaming Advisor by showcasing laptop capabilities for everyday
 * primary tasks: Video Calls, Meetings, Binge Watching, Music, Creative Work, Coding.
 *
 * When the user walks near a device:
 *  - A secondary hover card appears beside the gaming card showing task icons
 *  - Selecting a task spawns a unique themed assistant character:
 *      * Video Calls  -> Corporate Video Liaison (Suited professional with headset)
 *      * Meetings     -> Virtual Board Director (Executive with holographic briefcase)
 *      * Binge Watch  -> Entertainment Curator (Casual cinema-goer with popcorn bucket)
 *      * Music        -> Audio Engineer DJ (Neon-lit DJ with oversized headphones)
 *      * Creative     -> Digital Artist (Paint-splattered artisan with stylus & tablet)
 *      * Coding       -> Dev Hacker (Hoodie-wearing developer with floating code)
 *  - Character walks from corner, faces the user, and speaks about the laptop's strengths for that task
 */
import * as THREE from 'three';
import { soundManager } from './audio.js';
import { LAPTOP_PROFILES } from './gaming-advisor.js';

// ==========================================
// 1. TASK DEFINITIONS & ASSISTANT PROFILES
// ==========================================
const TASKS = [
  {
    id: 'video_calls',
    name: 'VIDEO CALLS',
    icon: '📹',
    iconColor: '#00bcd4',
    accentColor: '#00d2ff',
    charName: 'VIDEO LIAISON',
    charStyle: 'corporate'
  },
  {
    id: 'meetings',
    name: 'MEETINGS',
    icon: '💼',
    iconColor: '#7c4dff',
    accentColor: '#b388ff',
    charName: 'BOARD DIRECTOR',
    charStyle: 'executive'
  },
  {
    id: 'binge_watch',
    name: 'BINGE WATCH',
    icon: '🎬',
    iconColor: '#e91e63',
    accentColor: '#ff80ab',
    charName: 'ENTERTAINMENT CURATOR',
    charStyle: 'cinema'
  },
  {
    id: 'music',
    name: 'MUSIC',
    icon: '🎵',
    iconColor: '#ff9100',
    accentColor: '#ffab40',
    charName: 'AUDIO ENGINEER',
    charStyle: 'dj'
  },
  {
    id: 'creative',
    name: 'CREATIVE',
    icon: '🎨',
    iconColor: '#e040fb',
    accentColor: '#ea80fc',
    charName: 'DIGITAL ARTIST',
    charStyle: 'artist'
  },
  {
    id: 'coding',
    name: 'CODING',
    icon: '💻',
    iconColor: '#00e676',
    accentColor: '#69f0ae',
    charName: 'DEV HACKER',
    charStyle: 'hacker'
  }
];

// Task benchmark responses per laptop
// Task benchmark responses per laptop with detailed component breakdowns & personal closing lines
const TASK_BENCHMARKS = {
  legion_pro_7i: {
    video_calls: {
      quality: '4K Ultra HD AI Stream',
      rating: 'CRYSTAL CLEAR',
      quote: "Welcome to your high-performance studio! The Legion Pro 7i features an FHD webcam paired with an AI dual-microphone array that silences room noise and ambient chatter. The 240Hz PureSight WQXGA display renders colleagues in fluid clarity, while the i9-14900HX runs Teams, Zoom, and OBS simultaneously without dropping a frame. Your voice will sound so crisp, your colleagues will swear you are speaking from a professional broadcasting studio!",
      ttsText: "Welcome! This Legion Pro 7i turns every video call into a broadcast studio. The Intel Core i9 and PureSight display handle multiple video feeds with AI noise reduction. Your colleagues will swear you are broadcasting from a professional studio!"
    },
    meetings: {
      quality: 'Multi-App Powerhouse',
      rating: 'EXECUTIVE GRADE',
      quote: "Good day! This Legion Pro 7i is an executive powerhouse! Its 24-core Intel Core i9 processor and 32GB overclocked DDR5 RAM let you present 4K decks while juggling twenty live spreadsheets and collaborative docs. Coldfront 5.0 Vapor Chamber cooling keeps it whisper-quiet in meetings. You will feel like the sharpest commander in the boardroom!",
      ttsText: "Good day! This Legion Pro 7i is an executive powerhouse. 32 gigabytes of DDR5 RAM and whisper-quiet Vapor Chamber cooling let you juggle heavy decks and spreadsheets. You will run circles around everyone in the boardroom!"
    },
    binge_watch: {
      quality: '2.5K HDR Cinematic',
      rating: 'THEATER GRADE',
      quote: "Lights, camera, action! The 16-inch PureSight 240Hz 2.5K HDR display transforms streaming into an IMAX-like experience, delivering 500 nits of peak brightness and 100% sRGB color depth. Dual Harman speakers with Dolby Atmos spatial audio place every footstep and explosion around you. Grab your popcorn—it will feel just like a movie theatre right in your own room!",
      ttsText: "Lights, camera, action! With this 2.5K PureSight HDR display and Dolby Atmos Harman sound, grab your popcorn—it will feel just like a movie theatre right in your own room!"
    },
    music: {
      quality: 'Studio Reference',
      rating: 'AUDIOPHILE TIER',
      quote: "Feel every frequency! The Harman-tuned acoustic sound system with smart amp technology delivers thunderous bass and sparkling highs. The i9-14900HX and ultra-fast PCIe Gen4 SSD handle heavy digital audio workstations like Ableton or FL Studio at near-zero latency. Close your eyes and it will feel just like standing front row at a live concert!",
      ttsText: "Feel every frequency! Harman-tuned acoustic sound and low-latency Intel Core i9 power make your music soar. Close your eyes and it will feel just like standing front row at a live concert!"
    },
    creative: {
      quality: '4090 GPU Accelerated',
      rating: 'CREATOR PRO',
      quote: "Unleash your imagination! The monster NVIDIA GeForce RTX 4090 GPU with 16GB VRAM shreds through 8K video exports in Premiere and real-time ray-traced renders in Blender. The factory color-calibrated PureSight display ensures 100% color accuracy. Your creative strokes will feel as fluid and vibrant as painting on real canvas!",
      ttsText: "Unleash your imagination! The RTX 4090 GPU accelerates 8K video exports and 3D renders with 100 percent color accuracy. Your art will feel as fluid and vibrant as painting on real canvas!"
    },
    coding: {
      quality: '24-Core Beast',
      rating: 'DEVELOPER SUPREME',
      quote: "Hello, fellow engineer! The 24-core i9-14900HX compiles massive multi-thousand-file repositories in mere seconds. The 240Hz refresh rate makes scrolling through dense code buttery smooth, while 32GB RAM runs heavy Docker stacks and local LLMs simultaneously. Your code compiles so fast you won't even have time to take a coffee break!",
      ttsText: "Hello developer! The 24-core Intel i9 and fast memory compile massive codebases in seconds. Your builds will fly by so fast you won't even have time to take a coffee break!"
    }
  },
  ai_pc_aura: {
    video_calls: {
      quality: '2.8K OLED AI-Enhanced',
      rating: 'AI-POWERED',
      quote: "Welcome to next-gen collaboration! The 45.2 TOPS Neural Processing Unit handles real-time background replacement, automatic framing, and bidirectional voice isolation on-device with zero CPU overhead. The 2.8K PureSight Pro OLED display renders every face with lifelike accuracy. Your voice comes through so clear, your team will think you're in the same room with them!",
      ttsText: "Welcome! The 45 TOPS AI processor handles real-time background blur and voice isolation natively on the 2.8K OLED. Your team will think you are speaking right next to them!"
    },
    meetings: {
      quality: 'AI Meeting Assistant',
      rating: 'SMART MEETING',
      quote: "Welcome to smart productivity! The dedicated AI NPU transcribes meeting discussions in real-time, generates action summaries, and translates languages on-the-fly without sending data to the cloud. The ultra-vivid 15.3-inch OLED touchscreen lets you annotate slides effortlessly. You will glide through every meeting with total confidence!",
      ttsText: "Welcome! The dedicated AI engine generates real-time meeting transcripts and smart summaries locally for privacy. You will glide through every meeting with total confidence!"
    },
    binge_watch: {
      quality: '2.8K OLED True Black',
      rating: 'CINEMA PERFECT',
      quote: "Prepare to be mesmerized! The 15.3-inch 2.8K PureSight Pro OLED panel produces true infinite contrast with zero-light blacks and 500 nits HDR brilliance. Quad Dolby Atmos speakers project 3D spatial sound, while the 15-hour battery keeps you streaming all night. Dim the lights and sit back—it will feel just like a luxury private movie theatre!",
      ttsText: "Prepare to be mesmerized! The 2.8K PureSight Pro OLED delivers true infinite blacks and Dolby Atmos sound. Dim the lights and sit back—it will feel just like a private movie theatre!"
    },
    music: {
      quality: 'AI-Enhanced Audio',
      rating: 'SMART AUDIO',
      quote: "Immerse yourself in sound! The high-fidelity quad-speaker array with dual woofers produces rich, resonant bass and crisp vocals. The whisper-quiet thermal system ensures absolute zero fan noise during delicate acoustic tracks. Put on your favorite album—it will feel like a private acoustic performance in your living room!",
      ttsText: "Immerse yourself in sound! Quad speakers with dual woofers and whisper-quiet thermals give you pure acoustic bliss. It will feel like a private acoustic performance in your living room!"
    },
    creative: {
      quality: 'AI-Accelerated Creation',
      rating: 'AI CREATOR',
      quote: "Experience effortless art! The PureSight Pro OLED screen covers 100% sRGB and 100% P3 wide color gamuts with delta-E below 1. The 45 TOPS NPU runs Stable Diffusion and AI photo enhancement tools locally in seconds. Creating on this screen feels as natural and rewarding as holding a fine brush!",
      ttsText: "Experience effortless art! The OLED display offers 100 percent P3 color precision with local AI generation. Creating here feels as natural as holding a fine brush!"
    },
    coding: {
      quality: 'AI Code Copilot',
      rating: 'AI DEV PARTNER',
      quote: "Elevate your workflow! The high-efficiency ARM silicon and NPU run local coding copilots without internet latency. The flicker-free, low-blue-light certified 2.8K OLED screen eliminates eye strain during marathon night sessions. You'll write clean code for hours with zero fatigue!",
      ttsText: "Elevate your workflow! Local AI code assistance runs on the NPU while the flicker-free 2.8K OLED protects your eyes. You will write clean code for hours with zero fatigue!"
    }
  },
  adaptive_yoga_9i: {
    video_calls: {
      quality: 'Dual Screen Magic',
      rating: 'DUAL DISPLAY PRO',
      quote: "Dual-screen superpower unlocked! Host your 4K video conference on the top 2.8K OLED display while referencing your agenda, chat messages, and notes on the bottom touch screen. The 5MP IR webcam and smart noise cancellation make you shine. Your clients will be blown away by how organized and polished you look!",
      ttsText: "Dual screen superpower! Put your video call on top and notes below on twin 2.8K OLEDs. Your clients will be blown away by how organized and polished you look!"
    },
    meetings: {
      quality: 'Dual-Screen Productivity',
      rating: 'MULTI-TASK KING',
      quote: "Double your meeting impact! Open presentation decks across both 13.3-inch OLED screens in book mode, or stack them vertically for a dual-monitor command post on any coffee table. The Intel Core Ultra 7 processor makes multitasking seamless. You'll never scramble between windows in a meeting again!",
      ttsText: "Double your meeting impact! Twin OLED displays give you a full dual-monitor setup anywhere. You will never scramble between windows in a meeting again!"
    },
    binge_watch: {
      quality: 'Dual OLED Theater',
      rating: 'PERSONAL CINEMA',
      quote: "The ultimate entertainment setup! Tent mode lets you prop up the dual 2.8K OLED screens anywhere, while the 360-degree Bowers & Wilkins rotating soundbar blasts Dolby Atmos audio directly at you no matter how you orient it. Kick back on your couch—it will feel just like having your own portable movie theatre!",
      ttsText: "The ultimate entertainment setup! Dual 2.8K OLEDs and the Bowers and Wilkins rotating soundbar blast Dolby Atmos audio right at you. It will feel just like having your own portable movie theatre!"
    },
    music: {
      quality: 'DJ Console Mode',
      rating: 'DUAL DECK',
      quote: "Step into the DJ booth! The bottom touch screen transforms into a virtual mixing console with live frequency faders, while the top screen displays your track waveforms. The 360-degree rotating Bowers & Wilkins soundbar ensures punchy, directional beats. You will feel like a headline DJ remixing live on stage!",
      ttsText: "Step into the DJ booth! Turn the lower screen into a touch mixer while the rotating Bowers and Wilkins soundbar pumps out beats. You will feel like a headline DJ on stage!"
    },
    creative: {
      quality: 'Canvas + Palette',
      rating: 'ARTIST STUDIO',
      quote: "A digital dream canvas! Sketch and paint on the top 2.8K OLED with the precision active stylus while keeping your tool palette, color wheel, and layer stack on the lower screen. With 100% DCI-P3 color depth, your artwork comes alive with breathtaking vibrancy!",
      ttsText: "A digital dream canvas! Paint on top with the active stylus and keep your palette below on dual OLED displays. Your artwork comes alive with breathtaking vibrancy!"
    },
    coding: {
      quality: 'Code + Terminal',
      rating: 'SPLIT WORKFLOW',
      quote: "Dual-monitor coding anywhere! Keep your code editor pinned on the top screen and terminal, logs, or documentation running on the bottom. The dual 2.8K OLED screens give you unprecedented screen real estate in an ultrabook. You will feel like a master hacker commanding a twin-display battle station!",
      ttsText: "Dual monitor coding anywhere! Code on the top screen and keep your terminal on the bottom. You will feel like a master hacker commanding a twin battle station!"
    }
  },
  thinkpad_x1_carbon: {
    video_calls: {
      quality: 'Enterprise Secure',
      rating: 'BUSINESS ELITE',
      quote: "Enterprise security meets studio clarity! The Communications Bar houses an FHD + IR camera with physical privacy shutter and dual 360-degree microphones powered by AI noise suppression. The 2.8K OLED display shows shared presentations in razor-sharp detail. Your business meetings will radiate total authority and confidence!",
      ttsText: "Enterprise security meets studio clarity! An FHD IR camera with physical shutter and AI dual microphones ensure crystal clear calls. Your meetings will radiate total authority!"
    },
    meetings: {
      quality: 'Executive Boardroom',
      rating: 'C-SUITE READY',
      quote: "Command the boardroom! The legendary ThinkPad ergonomic keyboard offers unmatched typing tactile precision, while the Intel Core Ultra 7 vPro processor and 32GB memory deliver rock-solid reliability. Fast charging and all-day battery mean you never hunt for outlets. You'll run your meetings with absolute poise and mastery!",
      ttsText: "Command the boardroom! The legendary ThinkPad keyboard and Intel Core Ultra 7 processor deliver rock-solid reliability. You will run your meetings with absolute poise and mastery!"
    },
    binge_watch: {
      quality: 'OLED True Black HDR',
      rating: 'PREMIUM VIEWING',
      quote: "Cinema on the go! The 14-inch 2.8K OLED HDR 500 True Black display offers an astonishing 1,000,000:1 contrast ratio and 120Hz refresh rate. Dolby Atmos audio brings depth and spatial realism to every scene, wrapped in an ultralight 1.09kg carbon fiber chassis. Sit back and relax—it will feel just like a private movie theatre in first class!",
      ttsText: "Cinema on the go! The 2.8K OLED True Black HDR screen and Dolby Atmos audio in an ultralight carbon fiber body make movies feel just like a private movie theatre in first class!"
    },
    music: {
      quality: 'Dolby Atmos Audio',
      rating: 'PREMIUM SOUND',
      quote: "Audiophile precision anywhere! The upward-firing Dolby Atmos speakers project balanced acoustic staging with clear vocals and tight instrument separation. The ultra-stiff carbon fiber body prevents chassis rattle even at full volume. Plug in or play out—it will feel like having reference studio monitors on your desk!",
      ttsText: "Audiophile precision anywhere! Upward-firing Dolby Atmos audio and a vibration-free carbon fiber chassis make it feel like having reference studio monitors on your desk!"
    },
    creative: {
      quality: 'Color Accurate OLED',
      rating: 'PRO CREATIVE',
      quote: "Craft with precision! The 2.8K OLED panel covers 100% DCI-P3 with eye-safe hardware low blue light. Intel Arc graphics accelerate photo touch-ups, Vector design, and video grading with flawless precision. Your designs will pop with true-to-life colors that jump off the screen!",
      ttsText: "Craft with precision! The 2.8K OLED with 100 percent DCI P3 color precision accelerates photo and video grading. Your designs will pop with true-to-life colors!"
    },
    coding: {
      quality: 'ThinkPad Legendary KB',
      rating: 'DEV FAVORITE',
      quote: "The developer's holy grail! The ThinkPad X1 keyboard is celebrated worldwide for its tactile feedback, TrackPoint precision, and sculpted keycaps. The 2.8K 120Hz OLED screen renders text with razor-sharp typography. Compile code, run local Docker containers, and debug without fatigue—you'll feel completely unstoppable!",
      ttsText: "The developer's holy grail! The legendary tactile keyboard and razor-sharp 2.8K 120 Hertz OLED screen keep you typing at peak speed. You will feel completely unstoppable!"
    }
  }
};

// ==========================================
// 2. TASK ADVISOR MANAGER CLASS
// ==========================================
export class TaskAdvisorManager {
  constructor(scene, camera, interactionManager) {
    this.scene = scene;
    this.camera = camera;
    this.interactionManager = interactionManager;

    this.selectedTaskIndex = 0;
    this.activeLaptop = null;
    this.cardScale = 0;
    this.targetCardScale = 0;

    // Task Card Mesh & Texture
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
    this.cardMesh.name = "Task_Advisor_Hover_Card";
    this.cardMesh.visible = false;
    this.scene.add(this.cardMesh);

    // Active Task Character State
    this.activeCharacter = null;
    this.speechBubbleMesh = null;
    this.isSummoning = false;

    this.initCardInteractions();
    this.renderTaskCard();
  }

  // ==========================================
  // 3. TASK CARD RENDERING
  // ==========================================
  renderTaskCard(isSummoningState = false) {
    const ctx = this.cardCtx;
    const w = 1024;
    const h = 700;
    ctx.clearRect(0, 0, w, h);

    const laptop = this.activeLaptop || LAPTOP_PROFILES[0];
    const task = TASKS[this.selectedTaskIndex];
    const benchmarks = TASK_BENCHMARKS[laptop.id] || TASK_BENCHMARKS.legion_pro_7i;
    const bench = benchmarks[task.id];

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

    // 1. Outer Frosted Glass Card Body with gradient accent
    drawRoundRect(16, 16, w - 32, h - 32, 32, 'rgba(12, 8, 28, 0.94)', '#b388ff', 6);
    drawRoundRect(24, 24, w - 48, h - 48, 26, null, 'rgba(179, 136, 255, 0.25)', 2);

    // 2. Header: "PRIMARY GOALS OF THE USER" Badge
    drawRoundRect(36, 36, 430, 48, 12, '#7c4dff', null);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ PRIMARY GOALS OF THE USER', 251, 68);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#ff80ab';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('WHAT DO YOU NEED?', w - 45, 68);

    // Separator
    ctx.strokeStyle = 'rgba(179, 136, 255, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(36, 98);
    ctx.lineTo(w - 36, 98);
    ctx.stroke();

    // 3. Task Selection Grid (2 rows x 3 columns)
    const gridCols = 3;
    const gridRows = 2;
    const cellW = 290;
    const cellH = 72;
    const cellGapX = 22;
    const cellGapY = 14;
    const gridStartX = (w - (gridCols * cellW + (gridCols - 1) * cellGapX)) / 2;
    const gridStartY = 115;

    TASKS.forEach((t, idx) => {
      const col = idx % gridCols;
      const row = Math.floor(idx / gridCols);
      const tx = gridStartX + col * (cellW + cellGapX);
      const ty = gridStartY + row * (cellH + cellGapY);
      const isSelected = idx === this.selectedTaskIndex;

      const bg = isSelected ? 'rgba(124, 77, 255, 0.28)' : 'rgba(20, 16, 38, 0.7)';
      const border = isSelected ? t.accentColor : 'rgba(255, 255, 255, 0.15)';
      drawRoundRect(tx, ty, cellW, cellH, 14, bg, border, isSelected ? 4 : 2);

      // Icon emoji
      ctx.font = '32px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(t.icon, tx + 14, ty + 48);

      // Task name
      ctx.fillStyle = isSelected ? '#ffffff' : '#cfd8dc';
      ctx.font = 'bold 22px Arial';
      ctx.fillText(t.name, tx + 58, ty + 38);

      // Status
      ctx.fillStyle = isSelected ? t.accentColor : '#78909c';
      ctx.font = '14px Arial';
      ctx.fillText(isSelected ? '● SELECTED' : 'Tap to select', tx + 58, ty + 60);
    });

    // 4. Main Info Box
    const qBoxY = 290;
    const qBoxH = 210;
    drawRoundRect(40, qBoxY, w - 80, qBoxH, 20, 'rgba(18, 12, 38, 0.85)', 'rgba(179, 136, 255, 0.4)', 2);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff80ab';
    ctx.font = 'bold 18px Arial';
    ctx.fillText('TASK CAPABILITY ANALYSIS', w / 2, qBoxY + 34);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(`"How does this laptop handle ${task.name}?"`, w / 2, qBoxY + 74);

    ctx.fillStyle = '#b388ff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`QUALITY: ${bench.quality}`, w / 2, qBoxY + 116);

    ctx.fillStyle = '#00ff96';
    ctx.font = 'bold 22px Arial';
    ctx.fillText(`VERDICT: ${bench.rating}`, w / 2, qBoxY + 155);

    ctx.fillStyle = '#cfd8dc';
    ctx.font = '17px Arial';
    ctx.fillText(`PROCESSOR: ${laptop.specs.processor}`, w / 2, qBoxY + 190);

    // 5. Action Buttons
    const btnY = 525;
    const btnH = 115;

    // Button A: Summon Assistant
    const yesW = 460;
    const yesX = (w - yesW) / 2 - 130;
    if (!isSummoningState) {
      drawRoundRect(yesX, btnY, yesW, btnH, 20, '#b388ff', '#ffffff', 4);
      ctx.fillStyle = '#08141e';
      ctx.font = 'bold 34px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`✓ SHOW ME!`, yesX + yesW / 2, btnY + 50);
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`Summon ${task.charName} to demonstrate!`, yesX + yesW / 2, btnY + 86);
    } else {
      drawRoundRect(yesX, btnY, yesW, btnH, 20, '#ff80ab', '#ffffff', 4);
      ctx.fillStyle = '#08141e';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`⏳ SUMMONING ASSISTANT...`, yesX + yesW / 2, btnY + 50);
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`Walking towards you now!`, yesX + yesW / 2, btnY + 86);
    }

    // Button B: Next Task
    const switchW = 280;
    const switchX = yesX + yesW + 24;
    drawRoundRect(switchX, btnY, switchW, btnH, 20, 'rgba(124, 77, 255, 0.25)', '#b388ff', 3);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`⚡ NEXT TASK`, switchX + switchW / 2, btnY + 50);
    ctx.fillStyle = '#cfd8dc';
    ctx.font = '15px Arial';
    ctx.fillText(`Browse more options`, switchX + switchW / 2, btnY + 82);

    // Footer
    ctx.fillStyle = '#78909c';
    ctx.font = 'italic 15px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Select a primary goal to see how this device excels at it!', w / 2, h - 28);

    this.cardTexture.needsUpdate = true;
  }

  // ==========================================
  // 4. INTERACTION HOTSPOTS
  // ==========================================
  initCardInteractions() {
    this.interactionManager.registerInteractable(this.cardMesh, (hit) => {
      if (!hit || !hit.uv) return;
      soundManager.playClick();
      const uv = hit.uv;
      const x = uv.x * 1024;
      const y = (1 - uv.y) * 700;

      // Task grid cells
      const gridCols = 3;
      const cellW = 290;
      const cellH = 72;
      const cellGapX = 22;
      const cellGapY = 14;
      const gridStartX = (1024 - (gridCols * cellW + (gridCols - 1) * cellGapX)) / 2;
      const gridStartY = 115;

      for (let idx = 0; idx < TASKS.length; idx++) {
        const col = idx % gridCols;
        const row = Math.floor(idx / gridCols);
        const tx = gridStartX + col * (cellW + cellGapX);
        const ty = gridStartY + row * (cellH + cellGapY);
        if (x >= tx && x <= tx + cellW && y >= ty && y <= ty + cellH) {
          this.selectedTaskIndex = idx;
          this.renderTaskCard();
          return;
        }
      }

      // YES button
      const yesW = 460;
      const yesX = (1024 - yesW) / 2 - 130;
      const btnY = 525;
      const btnH = 115;
      if (x >= yesX && x <= yesX + yesW && y >= btnY && y <= btnY + btnH) {
        if (!this.isSummoning) {
          this.triggerTaskSummon();
        }
        return;
      }

      // NEXT TASK button
      const switchW = 280;
      const switchX = yesX + yesW + 24;
      if (x >= switchX && x <= switchX + switchW && y >= btnY && y <= btnY + btnH) {
        this.selectedTaskIndex = (this.selectedTaskIndex + 1) % TASKS.length;
        this.renderTaskCard();
        return;
      }
    });

    // 3D Hit boxes for VR controllers
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

    // Task grid hitboxes (2 rows x 3 cols) - approximate UV coords
    const gridHitboxes = [
      { x: -0.38, y: 0.30 }, { x: 0.0, y: 0.30 }, { x: 0.38, y: 0.30 },
      { x: -0.38, y: 0.18 }, { x: 0.0, y: 0.18 }, { x: 0.38, y: 0.18 }
    ];
    gridHitboxes.forEach((pos, idx) => {
      makeHitbox(pos.x, pos.y, 0.38, 0.10, () => {
        this.selectedTaskIndex = idx;
        this.renderTaskCard();
      });
    });

    // Summon button
    makeHitbox(-0.19, -0.34, 0.67, 0.18, () => {
      if (!this.isSummoning) {
        this.triggerTaskSummon();
      }
    });

    // Next task button
    makeHitbox(0.39, -0.34, 0.41, 0.18, () => {
      this.selectedTaskIndex = (this.selectedTaskIndex + 1) % TASKS.length;
      this.renderTaskCard();
    });
  }

  // ==========================================
  // 5. TRIGGER TASK SUMMON
  // ==========================================
  triggerTaskSummon() {
    this.isSummoning = true;
    this.renderTaskCard(true);
    soundManager.playAIChime();

    const task = TASKS[this.selectedTaskIndex];
    const laptop = this.activeLaptop || LAPTOP_PROFILES[0];

    const corners = laptop.spawnCorners || [new THREE.Vector3(-10, 0, 10)];
    const spawnPos = corners[Math.floor(Math.random() * corners.length)].clone();

    this.dismissActiveCharacter();

    const charModel = this.buildTaskAssistant(task);
    charModel.group.position.copy(spawnPos);
    charModel.group.position.y = 0;
    this.scene.add(charModel.group);

    this.createPortalEffect(spawnPos);

    const playerWorldPos = new THREE.Vector3();
    this.camera.getWorldPosition(playerWorldPos);
    const targetPos = playerWorldPos.clone();
    targetPos.y = 0;
    const toPlayer = new THREE.Vector3().subVectors(targetPos, spawnPos).normalize();
    targetPos.sub(toPlayer.multiplyScalar(1.5));

    this.activeCharacter = {
      model: charModel,
      task: task,
      laptop: laptop,
      targetPos: targetPos,
      walkSpeed: 2.8,
      walkTime: 0,
      footstepTimer: 0,
      state: 'WALKING'
    };
  }

  // ==========================================
  // 6. BUILD TASK ASSISTANT CHARACTERS
  // ==========================================
  buildTaskAssistant(task) {
    const root = new THREE.Group();
    root.name = `Task_Assistant_${task.id}`;

    const accentHex = parseInt(task.iconColor.replace('#', ''), 16);
    const charData = this.getCharacterDesign(task);

    // Skin material
    const skinMat = new THREE.MeshStandardMaterial({ color: charData.skinCol, roughness: 0.55, metalness: 0.0 });
    const topMat = new THREE.MeshStandardMaterial({ color: charData.topCol, roughness: 0.4, metalness: 0.1 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: charData.pantsCol, roughness: 0.45, metalness: 0.1 });
    const hairMat = new THREE.MeshStandardMaterial({ color: charData.hairCol, roughness: 0.6, metalness: 0.0 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: charData.shoeCol, roughness: 0.4, metalness: 0.2 });
    const accentMat = new THREE.MeshStandardMaterial({
      color: accentHex,
      emissive: accentHex,
      emissiveIntensity: 0.6,
      roughness: 0.3,
      metalness: 0.2
    });

    // Torso
    const chestGroup = new THREE.Group();
    chestGroup.position.set(0, 1.22, 0);
    const chestGeo = new THREE.BoxGeometry(0.38, 0.44, 0.24);
    const chestMesh = new THREE.Mesh(chestGeo, topMat);
    chestGroup.add(chestMesh);

    // Collar
    const collarGeo = new THREE.BoxGeometry(0.24, 0.08, 0.22);
    const collarMesh = new THREE.Mesh(collarGeo, topMat);
    collarMesh.position.set(0, 0.22, 0.01);
    chestGroup.add(collarMesh);

    // Accent stripe on chest
    const stripeMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.39, 0.06, 0.002),
      accentMat
    );
    stripeMesh.position.set(0, 0.05, 0.125);
    chestGroup.add(stripeMesh);

    root.add(chestGroup);

    // Head
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.56, 0);

    const neckGeo = new THREE.CylinderGeometry(0.065, 0.075, 0.12, 16);
    const neckMesh = new THREE.Mesh(neckGeo, skinMat);
    neckMesh.position.set(0, -0.08, 0);
    headGroup.add(neckMesh);

    const faceGeo = new THREE.SphereGeometry(0.125, 20, 20);
    faceGeo.scale(0.9, 1.15, 1.0);
    const faceMesh = new THREE.Mesh(faceGeo, skinMat);
    faceMesh.position.set(0, 0.06, 0.01);
    headGroup.add(faceMesh);

    // Hair based on character style
    if (charData.hairStyle === 'slick_back') {
      const topHair = new THREE.Mesh(new THREE.SphereGeometry(0.135, 16, 16), hairMat);
      topHair.scale.set(0.92, 0.7, 1.1);
      topHair.position.set(0, 0.14, -0.01);
      headGroup.add(topHair);
    } else if (charData.hairStyle === 'spiky') {
      const spiky = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.16, 8), hairMat);
      spiky.position.set(0, 0.18, 0);
      headGroup.add(spiky);
      const base = new THREE.Mesh(new THREE.SphereGeometry(0.135, 16, 16), hairMat);
      base.position.set(0, 0.09, -0.01);
      headGroup.add(base);
    } else if (charData.hairStyle === 'curly') {
      const curly = new THREE.Mesh(new THREE.SphereGeometry(0.145, 16, 16), hairMat);
      curly.position.set(0, 0.10, 0);
      headGroup.add(curly);
    } else if (charData.hairStyle === 'bun') {
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.135, 16, 16), hairMat);
      cap.position.set(0, 0.08, -0.02);
      headGroup.add(cap);
      const bun = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), hairMat);
      bun.position.set(0, 0.22, -0.08);
      headGroup.add(bun);
    } else {
      const cropHair = new THREE.Mesh(new THREE.SphereGeometry(0.135, 16, 16), hairMat);
      cropHair.position.set(0, 0.09, -0.01);
      headGroup.add(cropHair);
    }

    // Eyes & eyebrows
    [-0.045, 0.045].forEach(ex => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      eye.position.set(ex, 0.06, 0.115);
      headGroup.add(eye);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 8), new THREE.MeshBasicMaterial({ color: 0x221814 }));
      pupil.position.set(ex, 0.06, 0.126);
      headGroup.add(pupil);
      const brow = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.009, 0.01), hairMat);
      brow.position.set(ex, 0.082, 0.12);
      headGroup.add(brow);
    });

    // Nose
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.045, 8), skinMat);
    nose.position.set(0, 0.04, 0.13);
    nose.rotation.x = 0.2;
    headGroup.add(nose);

    // Task-specific accessories
    if (task.charStyle === 'corporate' || task.charStyle === 'executive') {
      // Headset/earpiece
      const earpiece = new THREE.Mesh(
        new THREE.TorusGeometry(0.12, 0.012, 8, 16, Math.PI),
        accentMat
      );
      earpiece.position.set(0, 0.06, 0);
      earpiece.rotation.y = Math.PI / 2;
      headGroup.add(earpiece);

      const mic = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.08, 8), accentMat);
      mic.position.set(-0.12, 0.02, 0.06);
      mic.rotation.z = -0.4;
      headGroup.add(mic);
    } else if (task.charStyle === 'dj') {
      // Big headphones
      const headband = new THREE.Mesh(
        new THREE.TorusGeometry(0.14, 0.018, 8, 24, Math.PI),
        accentMat
      );
      headband.position.set(0, 0.14, 0);
      headband.rotation.y = Math.PI / 2;
      headGroup.add(headband);

      [-0.14, 0.14].forEach(hx => {
        const pad = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.05, 0.03, 12),
          accentMat
        );
        pad.position.set(hx, 0.04, 0);
        pad.rotation.z = Math.PI / 2;
        headGroup.add(pad);
      });
    } else if (task.charStyle === 'cinema') {
      // Sunglasses
      [-0.045, 0.045].forEach(ex => {
        const lens = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, 0.025, 0.005),
          new THREE.MeshBasicMaterial({ color: 0x111111 })
        );
        lens.position.set(ex, 0.06, 0.132);
        headGroup.add(lens);
      });
      const bridge = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.005, 0.005),
        new THREE.MeshBasicMaterial({ color: 0x333333 })
      );
      bridge.position.set(0, 0.06, 0.132);
      headGroup.add(bridge);
    } else if (task.charStyle === 'hacker') {
      // Hood edge
      const hood = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.04, 0.16),
        topMat
      );
      hood.position.set(0, 0.18, -0.04);
      headGroup.add(hood);
    }

    root.add(headGroup);

    // Arms
    const armGeo = new THREE.CylinderGeometry(0.055, 0.048, 0.58, 12);
    const handGeo = new THREE.BoxGeometry(0.055, 0.09, 0.035);

    const leftArm = new THREE.Group();
    leftArm.position.set(-0.25, 1.36, 0);
    const leftArmMesh = new THREE.Mesh(armGeo, topMat);
    leftArmMesh.position.set(0, -0.26, 0);
    leftArm.add(leftArmMesh);
    const leftHand = new THREE.Mesh(handGeo, skinMat);
    leftHand.position.set(0, -0.57, 0);
    leftArm.add(leftHand);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.25, 1.36, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, topMat);
    rightArmMesh.position.set(0, -0.26, 0);
    rightArm.add(rightArmMesh);
    const rightHand = new THREE.Mesh(handGeo, skinMat);
    rightHand.position.set(0, -0.57, 0);
    rightArm.add(rightHand);

    // Task-specific prop in hand
    if (task.charStyle === 'cinema') {
      // Popcorn bucket
      const bucket = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.03, 0.12, 8),
        new THREE.MeshStandardMaterial({ color: 0xff1744, emissive: 0xff1744, emissiveIntensity: 0.3 })
      );
      bucket.position.set(0, -0.50, 0.04);
      leftArm.add(bucket);
      leftArm.rotation.x = -Math.PI * 0.3;
    } else if (task.charStyle === 'artist') {
      // Stylus
      const stylus = new THREE.Mesh(
        new THREE.CylinderGeometry(0.006, 0.003, 0.18, 8),
        accentMat
      );
      stylus.position.set(0, -0.55, 0.02);
      stylus.rotation.x = -0.4;
      rightArm.add(stylus);
      rightArm.rotation.x = -Math.PI * 0.35;
    } else if (task.charStyle === 'executive') {
      // Briefcase
      const briefcase = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.10, 0.04),
        new THREE.MeshStandardMaterial({ color: 0x3e2723, metalness: 0.3 })
      );
      briefcase.position.set(0, -0.56, 0.02);
      rightArm.add(briefcase);
    } else if (task.charStyle === 'hacker') {
      // Floating code tablet
      const tablet = new THREE.Mesh(
        new THREE.BoxGeometry(0.10, 0.14, 0.005),
        new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0x00e676, emissiveIntensity: 0.5 })
      );
      tablet.position.set(0, -0.48, 0.06);
      rightArm.add(tablet);
      rightArm.rotation.x = -Math.PI * 0.38;
    } else {
      // Natural pose
      leftArm.rotation.x = 0.08;
      leftArm.rotation.z = 0.06;
      rightArm.rotation.x = -0.05;
      rightArm.rotation.z = -0.06;
    }

    root.add(leftArm);
    root.add(rightArm);

    // Legs
    const pelvisMesh = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.16, 0.22), pantsMat);
    pelvisMesh.position.set(0, 0.94, 0);
    root.add(pelvisMesh);

    const beltMesh = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.04, 0.23), new THREE.MeshStandardMaterial({ color: 0x1a1a1a }));
    beltMesh.position.set(0, 0.99, 0);
    root.add(beltMesh);

    const legGeo = new THREE.CylinderGeometry(0.075, 0.065, 0.78, 14);
    const leftLeg = new THREE.Mesh(legGeo, pantsMat);
    leftLeg.position.set(-0.11, 0.52, 0);
    root.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, pantsMat);
    rightLeg.position.set(0.11, 0.52, 0);
    root.add(rightLeg);

    // Shoes
    [-0.11, 0.11].forEach(sx => {
      const shoeGroup = new THREE.Group();
      shoeGroup.position.set(sx, 0.06, 0.03);
      const shoeUpper = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.09, 0.22), shoeMat);
      shoeGroup.add(shoeUpper);
      const sole = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.03, 0.24),
        new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.3 })
      );
      sole.position.set(0, -0.04, 0);
      shoeGroup.add(sole);
      root.add(shoeGroup);
    });

    // Glowing accent light on the character
    const charLight = new THREE.PointLight(accentHex, 1.2, 4, 2);
    charLight.position.set(0, 1.3, 0.3);
    root.add(charLight);

    return {
      group: root,
      head: headGroup,
      leftArm: leftArm,
      rightArm: rightArm,
      leftLeg: leftLeg,
      rightLeg: rightLeg
    };
  }

  getCharacterDesign(task) {
    const designs = {
      corporate: {
        skinCol: 0xe8c4a0, topCol: 0x1a237e, pantsCol: 0x263238, hairCol: 0x1a1206,
        shoeCol: 0x1a1a1a, hairStyle: 'slick_back'
      },
      executive: {
        skinCol: 0xd4a76a, topCol: 0x212121, pantsCol: 0x37474f, hairCol: 0x4e342e,
        shoeCol: 0x3e2723, hairStyle: 'slick_back'
      },
      cinema: {
        skinCol: 0xf5d0b5, topCol: 0xb71c1c, pantsCol: 0x1a237e, hairCol: 0x5d4037,
        shoeCol: 0xffffff, hairStyle: 'curly'
      },
      dj: {
        skinCol: 0xc68642, topCol: 0x1b0033, pantsCol: 0x0d0d0d, hairCol: 0xe040fb,
        shoeCol: 0xff6d00, hairStyle: 'spiky'
      },
      artist: {
        skinCol: 0xffe0b2, topCol: 0x4a148c, pantsCol: 0x311b92, hairCol: 0xd50000,
        shoeCol: 0x9e9e9e, hairStyle: 'bun'
      },
      hacker: {
        skinCol: 0xe0c8a8, topCol: 0x0d0d0d, pantsCol: 0x1b1b1b, hairCol: 0x263238,
        shoeCol: 0x212121, hairStyle: 'crop'
      }
    };
    return designs[task.charStyle] || designs.corporate;
  }

  // ==========================================
  // 7. PORTAL EFFECT
  // ==========================================
  createPortalEffect(position) {
    const portalGroup = new THREE.Group();
    portalGroup.position.copy(position);
    portalGroup.position.y = 0.01;
    this.scene.add(portalGroup);

    // Glowing ring
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xb388ff,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.55, 32), ringMat);
    ring.rotation.x = -Math.PI / 2;
    portalGroup.add(ring);

    // Inner glow
    const innerGlow = new THREE.Mesh(
      new THREE.CircleGeometry(0.35, 32),
      new THREE.MeshBasicMaterial({ color: 0x7c4dff, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
    );
    innerGlow.rotation.x = -Math.PI / 2;
    portalGroup.add(innerGlow);

    // Vertical energy beam
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.45, 3.0, 16, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xb388ff, transparent: true, opacity: 0.25, side: THREE.DoubleSide })
    );
    beam.position.y = 1.5;
    portalGroup.add(beam);

    const portalLight = new THREE.PointLight(0xb388ff, 4, 6, 2);
    portalLight.position.set(0, 1, 0);
    portalGroup.add(portalLight);

    // Fade out portal
    let opacity = 1;
    const fadeInterval = setInterval(() => {
      opacity -= 0.03;
      ringMat.opacity = opacity * 0.9;
      innerGlow.material.opacity = opacity * 0.5;
      beam.material.opacity = opacity * 0.25;
      portalLight.intensity = opacity * 4;
      if (opacity <= 0) {
        clearInterval(fadeInterval);
        this.scene.remove(portalGroup);
      }
    }, 40);
  }

  // ==========================================
  // 8. SPEECH BUBBLE
  // ==========================================
  showCharacterSpeechBubble(charData) {
    const task = charData.task;
    const laptop = charData.laptop;
    const benchmarks = TASK_BENCHMARKS[laptop.id] || TASK_BENCHMARKS.legion_pro_7i;
    const bench = benchmarks[task.id];

    const accentHex = parseInt(task.iconColor.replace('#', ''), 16);

    // Build speech bubble canvas
    const bubbleCanvas = document.createElement('canvas');
    bubbleCanvas.width = 1024;
    bubbleCanvas.height = 600;
    const ctx = bubbleCanvas.getContext('2d');

    // Background
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
      if (fillStyle) { ctx.fillStyle = fillStyle; ctx.fill(); }
      if (strokeStyle && lineWidth > 0) { ctx.strokeStyle = strokeStyle; ctx.lineWidth = lineWidth; ctx.stroke(); }
    };

    // Main bubble body
    drawRoundRect(20, 20, 984, 530, 28, 'rgba(12, 6, 30, 0.95)', task.accentColor, 5);

    // Header with character name
    drawRoundRect(40, 40, 300, 48, 12, task.iconColor, null);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${task.icon} ${task.charName}`, 190, 72);

    // Laptop name
    ctx.textAlign = 'right';
    ctx.fillStyle = task.accentColor;
    ctx.font = 'bold 18px Arial';
    ctx.fillText(laptop.name.toUpperCase(), 984, 72);

    // Rating badge
    drawRoundRect(40, 102, 200, 36, 10, '#00ff96', null);
    ctx.fillStyle = '#08141e';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`⭐ ${bench.rating}`, 140, 127);

    // Quality info
    ctx.textAlign = 'left';
    ctx.fillStyle = task.accentColor;
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`QUALITY: ${bench.quality}`, 260, 128);

    // Main dialogue text (word-wrapped)
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    const maxWidth = 920;
    const lineHeight = 30;
    let dialogY = 170;
    const words = bench.quote.split(' ');
    let line = '';
    for (const word of words) {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth) {
        ctx.fillText(line.trim(), 50, dialogY);
        line = word + ' ';
        dialogY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), 50, dialogY);

    // Dismiss hint
    ctx.fillStyle = '#78909c';
    ctx.font = 'italic 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Tap to dismiss • Walk away to return', 512, 530);

    // Create 3D mesh for speech bubble
    const bubbleTex = new THREE.CanvasTexture(bubbleCanvas);
    bubbleTex.minFilter = THREE.LinearFilter;

    if (this.speechBubbleMesh) {
      this.interactionManager.unregisterInteractable(this.speechBubbleMesh);
      charData.model.group.remove(this.speechBubbleMesh);
    }

    this.speechBubbleMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2.0, 1.18),
      new THREE.MeshBasicMaterial({ map: bubbleTex, transparent: true, side: THREE.DoubleSide })
    );
    this.speechBubbleMesh.position.set(0, 2.4, 0.35);
    charData.model.group.add(this.speechBubbleMesh);

    this.interactionManager.registerInteractable(this.speechBubbleMesh, () => {
      this.dismissActiveCharacter();
    });

    // Speak the dialogue via TTS
    this.speakTaskDialogue(charData);
  }

  // ==========================================
  // 9. TTS SPEECH
  // ==========================================
  speakTaskDialogue(charData) {
    const task = charData.task;
    const laptop = charData.laptop;
    const benchmarks = TASK_BENCHMARKS[laptop.id] || TASK_BENCHMARKS.legion_pro_7i;
    const bench = benchmarks[task.id];

    // Duck background convention chatter so dialogue is completely clear
    soundManager.duckCrowdChatter();

    // Play chime first, then speak
    soundManager.playAIChime();

    setTimeout(() => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(bench.ttsText);
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          const bestVoice = this.getBestVoiceForTask(task, voices);
          if (bestVoice) utterance.voice = bestVoice;
        }

        // Different vocal characteristics per task type
        if (task.charStyle === 'corporate' || task.charStyle === 'executive') {
          utterance.pitch = 0.92;
          utterance.rate = 0.98;
        } else if (task.charStyle === 'cinema') {
          utterance.pitch = 1.08;
          utterance.rate = 1.05;
        } else if (task.charStyle === 'dj') {
          utterance.pitch = 1.18;
          utterance.rate = 1.12;
        } else if (task.charStyle === 'artist') {
          utterance.pitch = 1.05;
          utterance.rate = 0.92;
        } else if (task.charStyle === 'hacker') {
          utterance.pitch = 0.85;
          utterance.rate = 1.08;
        } else {
          utterance.pitch = 1.0;
          utterance.rate = 1.0;
        }

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn("TaskAdvisor: SpeechSynthesis error:", e);
      }
    }, 600);
  }

  getBestVoiceForTask(task, voices) {
    if (task.charStyle === 'corporate' || task.charStyle === 'executive') {
      return voices.find(v => (v.name.includes('David') || v.name.includes('George') || v.name.includes('Guy') || v.name.includes('Natural')) && v.lang.startsWith('en')) ||
             voices.find(v => v.lang.startsWith('en-GB')) ||
             voices.find(v => v.lang.startsWith('en')) || voices[0];
    } else if (task.charStyle === 'cinema' || task.charStyle === 'dj') {
      return voices.find(v => (v.name.includes('Jenny') || v.name.includes('Google US English') || v.name.includes('Samantha')) && v.lang.startsWith('en')) ||
             voices.find(v => v.lang.startsWith('en-US')) ||
             voices.find(v => v.lang.startsWith('en')) || voices[0];
    } else if (task.charStyle === 'artist') {
      return voices.find(v => (v.name.includes('Zira') || v.name.includes('Jenny') || v.name.includes('Fiona')) && v.lang.startsWith('en')) ||
             voices.find(v => v.lang.startsWith('en')) || voices[0];
    } else {
      return voices.find(v => (v.name.includes('Mark') || v.name.includes('Google UK English Male') || v.name.includes('Daniel')) && v.lang.startsWith('en')) ||
             voices.find(v => v.lang.startsWith('en-US')) ||
             voices.find(v => v.lang.startsWith('en')) || voices[0];
    }
  }

  // ==========================================
  // 10. DISMISS
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
    this.renderTaskCard(false);
  }

  // ==========================================
  // 11. UPDATE LOOP
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
        this.renderTaskCard();
      }
      this.targetCardScale = 1.0;
      this.cardMesh.visible = true;

      // Position task card on the RIGHT side of the laptop from approaching player perspective
      const centerCardPos = nearestLaptop.position.clone().add(nearestLaptop.cardOffset);
      const toPlayer = playerWorldPos.clone().sub(centerCardPos);
      toPlayer.y = 0;
      toPlayer.normalize();
      const rightVector = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), toPlayer).normalize();

      const targetCardPos = centerCardPos.clone().addScaledVector(rightVector, 0.92);
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
        if (char.model.leftArm) char.model.leftArm.rotation.x = -walkSin * 0.4;
        if (char.model.rightArm) char.model.rightArm.rotation.x = walkSin * 0.4;

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

      // Subtle idle head movement
      if (this.activeCharacter.model.head) {
        this.activeCharacter.model.head.rotation.y = Math.sin(time * 2.0) * 0.08;
      }
    }
  }
}
