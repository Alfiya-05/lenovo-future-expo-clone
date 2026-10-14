# Lenovo Future Expo // Standalone WebXR VR Experience

A standalone, browser-based **WebXR VR experience of the Lenovo Future Expo**, engineered for **Meta Quest 3S (Quest Browser)** and Desktop browsers using **Three.js** and the authoritative **`generate_expo_environment.blend`** 3D model.

---

## 🚀 Quick Start & Local Testing

To run the WebXR experience locally:

### Option 1: Python Built-in Server
```bash
cd lenovo-future-expo
python -m http.server 8000
```
Open your browser at `http://localhost:8000`.

---

## 🥽 Testing on Meta Quest 3S (Quest Browser)

1. Connect your Meta Quest 3S to the same Wi-Fi network as your host PC, or host on an HTTPS server (e.g. Vercel, Netlify, GitHub Pages).
2. Open **Quest Browser** inside the headset.
3. Navigate to your HTTPS URL or local IP address (e.g. `https://your-deployment.vercel.app` or `https://192.168.1.xxx:8000`).
4. Click **ENTER VR (QUEST 3S)**.
5. Put on the headset and begin your walkthrough!

### VR Controls on Quest 3S:
- **Teleportation**: Push and release the **Right Thumbstick (forward)** to cast an arc and teleport anywhere in the hall.
- **Snap Turning**: Tilt **Right Thumbstick Left / Right** for 45° snap turns.
- **Ray Interaction**: Point your controller laser at interactive pedestals, screens, and buttons, then pull the **Index Trigger** to select/activate.
- **VR Options Menu**: Press the **Menu Button (Left Controller)** to summon the floating world-space menu (Resume, Teleport to Entrance, Reset All Progress, Toggle Audio Mute).

---

## 🖥️ Desktop Preview Controls

- **W / A / S / D**: Walk forward, left, backward, right.
- **Mouse Look**: Click canvas to lock cursor and look around.
- **Left Click**: Point and interact with 3D pedestals, kiosks, and buttons.
- **Q / E**: 45° Snap Turn left / right.
- **Shift**: Sprint.
- **ESC**: Toggle cursor lock and open VR Options Menu.

---

## 🏛️ Expo Tour Flow & Interactive Stalls

```
ENTRANCE (Holographic Assistant & Tour Start)
   ↓
LEGION GAMING (5-Target Laser Minigame)
   ↓
LENOVO AI PC (Interactive 3D Laptop with Neural NPU Tasks)
   ↓
ADAPTIVE COMPUTING (4-Mode Morphing Matrix: Work, Creative, Gaming, Mobile)
   ↓
PERSONAL AI (Cross-Device Continuity: Laptop ↔ Motorola Smartphone Sync)
   ↓
LENOVO XR (Spatial Computing Simulation: 360° Floating UI & Holograms)
   ↓
LENOVO FUTURE LAB (Grand Finale Showcase on 14m Curved Video Wall)
```

---

## 📁 Project Structure

```
lenovo-future-expo/
├── index.html                  # Main WebXR & desktop landing page
├── style.css                   # Futuristic Lenovo trade-show theme
├── src/
│   ├── main.js                 # App initialization, Three.js render loop, GLTF loader
│   ├── vr.js                   # WebXR session manager & Quest 3S controller setup
│   ├── locomotion.js           # Parabolic teleportation arc, snap turning, hall boundaries
│   ├── interaction.js          # Raycasting & 3D world-space button dispatch
│   ├── progress.js             # 6-stall state machine & world-space progress board
│   ├── guidance.js             # Directional waypoints & guidance subtitles
│   ├── audio.js                # Procedural Web Audio API sound effects & ambiance
│   ├── stalls/
│   │   ├── entrance.js         # Welcome arch & holographic virtual guide
│   │   ├── legion.js           # Legion 5-target gaming minigame
│   │   ├── ai-pc.js            # Lenovo AI PC laptop simulation (Summarize, NPU Benchmark)
│   │   ├── adaptive.js         # Adaptive Computing 4-mode hinge morphing
│   │   ├── personal-ai.js      # Cross-device data flow (Laptop ↔ Phone)
│   │   ├── xr.js               # Spatial computing simulation
│   │   └── future-lab.js       # Grand finale pavilion & video wall presentation
│   └── ui/
│       └── vr-menu.js          # World-space floating VR menu
├── assets/
│   ├── environment/
│   │   └── generate_expo_environment_runtime.glb # Optimized runtime asset
│   └── models/
│       └── lenovo_ai_laptop.glb
└── vendor/
    ├── three.module.js         # Three.js core library
    ├── GLTFLoader.js           # glTF 2.0 runtime loader
    └── PointerLockControls.js  # Desktop preview camera controller
```

---

## ⚡ Performance Optimizations for Quest 3S

- **Geometry**: Clean quad-dominant low-poly environment (~8,586 triangles total) for consistent 90 FPS rendering.
- **Draw Calls**: Merged modular components and batched materials.
- **Lighting**: Soft WebGL ambient + focused spotlights, avoiding expensive real-time shadow passes on mobile GPU.
- **Audio**: Synthesized Web Audio API eliminating file streaming latency.
