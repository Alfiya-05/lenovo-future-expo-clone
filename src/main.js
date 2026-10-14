/**
 * Lenovo Future Expo - Standalone WebXR VR Application Entry
 * Built for Meta Quest 3S (Quest Browser) & Desktop WebXR via Three.js.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { VRManager } from './vr.js';
import { LocomotionManager } from './locomotion.js';
import { InteractionManager } from './interaction.js';
import { progressManager } from './progress.js';
import { guidanceSystem } from './guidance.js';
import { soundManager } from './audio.js';
import { VRMenu } from './ui/vr-menu.js';
import { HandUIManager } from './hand-ui.js';
import { GrabInteractionManager } from './grab-interaction.js';

import { setupEntranceExperience } from './stalls/entrance.js';
import { setupLegionGaming } from './stalls/legion.js';
import { setupLenovoAIPC } from './stalls/ai-pc.js';
import { setupAdaptiveComputing } from './stalls/adaptive.js';
import { setupPersonalAI } from './stalls/personal-ai.js';
import { setupLenovoXR } from './stalls/xr.js';
import { setupFutureLab } from './stalls/future-lab.js';

// Unregister any legacy Service Workers to prevent stale client caching on Meta Quest Browser
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  }).catch(() => {});
}

class LenovoExpoApp {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.userGroup = null;

    this.vrManager = null;
    this.locomotionManager = null;
    this.interactionManager = null;
    this.vrMenu = null;

    this.stallUpdaters = [];
    this.clock = new THREE.Clock();

    this.init();
  }

  async init() {
    // 1. Scene & Camera Setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0c10);

    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 200);
    this.camera.position.set(0, 1.70, 21.0);

    this.userGroup = new THREE.Group();
    this.userGroup.position.set(0, 0, 0);
    this.userGroup.add(this.camera);
    this.scene.add(this.userGroup);

    // 2. WebGL / WebXR Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    this.renderer.xr.enabled = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.container.appendChild(this.renderer.domElement);

    // 3. Exhibition Lighting
    this.setupLighting();

    // 4. Managers & Core Systems
    this.interactionManager = new InteractionManager(this.scene, this.camera, this.renderer);
    this.locomotionManager = new LocomotionManager(this.scene, this.camera, this.renderer, this.userGroup);
    this.handUIManager = new HandUIManager(this.scene, this.camera, this.renderer, this.userGroup, this.locomotionManager, this.interactionManager);
    this.interactionManager.setHandUIManager(this.handUIManager);
    this.vrManager = new VRManager(this.renderer, this.scene, this.userGroup, (controller) => {
      if (!this.handUIManager || !this.handUIManager.triggerVRSelect(controller)) {
        this.interactionManager.triggerVRSelect(controller);
      }
    });
    this.vrMenu = new VRMenu(this.scene, this.camera, this.interactionManager, this.locomotionManager);
    this.grabInteractionManager = new GrabInteractionManager(this.scene, this.camera, this.handUIManager);

    // 5. Initialize Subsystems & Guidance
    guidanceSystem.init(this.scene);
    const progressBoard = progressManager.createWorldProgressBoard();
    this.scene.add(progressBoard);

    // 6. Action Button Handlers
    const enterVRBtn = document.getElementById('btn-enter-vr');
    if (enterVRBtn) {
      enterVRBtn.addEventListener('click', (e) => {
        e.preventDefault();
        soundManager.init();
        this.vrManager.startVRSession();
      });
    }

    const desktopBtn = document.getElementById('btn-desktop-preview');
    if (desktopBtn) {
      desktopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        soundManager.init();
        document.getElementById('landing-screen').classList.add('hidden');
        document.getElementById('desktop-hud').classList.remove('hidden');
        this.locomotionManager.desktopControls.lock();
      });
    }

    window.addEventListener('resize', () => this.onWindowResize());
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') {
        this.vrMenu.toggle();
      }
    });

    // 7. Load Environment & Stalls
    this.loadEnvironmentAndStalls();

    // 8. Start Real-Time Render Loop
    this.renderer.setAnimationLoop(() => this.renderLoop());
  }

  setupLighting() {
    const ambLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xddeeff, 1.2);
    dirLight.position.set(0, 15, -5);
    this.scene.add(dirLight);

    const aisleLight = new THREE.PointLight(0x00d2ff, 1.5, 35);
    aisleLight.position.set(0, 4.0, 0);
    this.scene.add(aisleLight);
  }

  loadEnvironmentAndStalls() {
    const statusText = document.getElementById('loading-status-text');
    const progressFill = document.getElementById('progress-bar-fill');
    const progressPct = document.getElementById('loading-percentage');

    const loader = new GLTFLoader();
    const envUrl = './assets/environment/generate_expo_environment_runtime.glb';

    loader.load(
      envUrl,
      (gltf) => {
        const model = gltf.scene;
        model.name = "Lenovo_Expo_Hall_Environment";
        this.scene.add(model);

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = false;
            child.receiveShadow = false;
            if (child.material) {
              child.material.roughness = Math.max(child.material.roughness || 0.3, 0.2);
            }
          }
        });

        // Initialize All 6 Stalls + Entrance
        this.stallUpdaters.push(setupEntranceExperience(this.scene, this.interactionManager));
        this.stallUpdaters.push(setupLegionGaming(this.scene, this.interactionManager));
        this.stallUpdaters.push(setupLenovoAIPC(this.scene, this.interactionManager, this.grabInteractionManager));
        this.stallUpdaters.push(setupAdaptiveComputing(this.scene, this.interactionManager));
        this.stallUpdaters.push(setupPersonalAI(this.scene, this.interactionManager));
        this.stallUpdaters.push(setupLenovoXR(this.scene, this.interactionManager));
        this.stallUpdaters.push(setupFutureLab(this.scene, this.interactionManager));

        statusText.textContent = "READY // LENOVO FUTURE EXPO LOADED";
        progressFill.style.width = "100%";
        progressPct.textContent = "100%";
      },
      (xhr) => {
        if (xhr.total > 0) {
          const pct = Math.round((xhr.loaded / xhr.total) * 100);
          progressFill.style.width = `${pct}%`;
          progressPct.textContent = `${pct}%`;
          statusText.textContent = `LOADING 3D EXPO ENVIRONMENT (${pct}%)...`;
        }
      },
      (error) => {
        console.error("Error loading expo environment GLB:", error);
        statusText.textContent = "ERROR: Could not load expo environment GLB. Check console.";
        statusText.style.color = "#e2231a";
      }
    );
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  renderLoop() {
    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    if (this.renderer.xr.isPresenting) {
      const rightController = this.vrManager.getRightController();

      const session = this.renderer.xr.getSession();
      if (session && session.inputSources) {
        this.locomotionManager.updateVRInput(session.inputSources, delta);
        this.vrManager.updateInputSources(session.inputSources);
      }

      this.interactionManager.updateVRControllerRay(rightController);
    }

    if (this.handUIManager) {
      this.handUIManager.update(delta);
    }

    if (this.grabInteractionManager) {
      this.grabInteractionManager.update(delta);
    }

    this.locomotionManager.update(delta);

    guidanceSystem.update(time);
    this.stallUpdaters.forEach((stall) => {
      if (stall && stall.update) {
        stall.update(time);
      }
    });

    this.renderer.render(this.scene, this.camera);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new LenovoExpoApp();
});
