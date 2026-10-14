/**
 * Lenovo Future Expo - WebXR VR Manager
 * Handles WebXR Diagnostics, Direct User-Gesture Session Requests,
 * Reference Space Negotiation (local-floor -> local), Quest 3S Controllers, and Error Reporting.
 */
import * as THREE from 'three';
import { soundManager } from './audio.js';

export class VRManager {
  constructor(renderer, scene, userGroup, onSelectCallback) {
    this.renderer = renderer;
    this.scene = scene;
    this.userGroup = userGroup;
    this.onSelectCallback = onSelectCallback;

    // Ensure Three.js WebXR is enabled
    this.renderer.xr.enabled = true;

    this.controller1 = null;
    this.controller2 = null;
    this.controllerGrip1 = null;
    this.controllerGrip2 = null;

    this.isVRActive = false;
    this.currentSession = null;
    this.diagInfo = {
      isHttps: window.location.protocol === 'https:',
      isSecureContext: window.isSecureContext === true,
      hasNavigatorXR: 'xr' in navigator && !!navigator.xr,
      isImmersiveSupported: false,
      isThreeXREnabled: this.renderer.xr.enabled === true,
      protocol: window.location.protocol,
      host: window.location.host,
      userAgent: navigator.userAgent,
      vrStatus: "Detecting WebXR environment..."
    };

    this.initControllers();
    this.runDiagnostics();
  }

  /**
   * Run initial diagnostics on page load and cache capability checks.
   * Does not block or consume the user gesture token needed for requestSession.
   */
  async runDiagnostics() {
    console.log("%c=== LENOVO FUTURE EXPO - WebXR Diagnostics ===", "color: #00d2ff; font-weight: bold; font-size: 14px;");
    console.log("Protocol:", this.diagInfo.protocol);
    console.log("Host:", this.diagInfo.host);
    console.log("HTTPS:", this.diagInfo.isHttps ? "YES" : "NO");
    console.log("Secure Context (window.isSecureContext):", this.diagInfo.isSecureContext ? "YES" : "NO");
    console.log("navigator.xr present:", this.diagInfo.hasNavigatorXR ? "YES" : "NO");
    console.log("Three.js XR Enabled (renderer.xr.enabled):", this.diagInfo.isThreeXREnabled ? "YES" : "NO");
    console.log("User Agent:", this.diagInfo.userAgent);

    if (this.diagInfo.hasNavigatorXR) {
      try {
        this.diagInfo.isImmersiveSupported = await navigator.xr.isSessionSupported('immersive-vr');
        console.log("navigator.xr.isSessionSupported('immersive-vr'):", this.diagInfo.isImmersiveSupported ? "YES" : "NO");
      } catch (err) {
        console.warn("navigator.xr.isSessionSupported('immersive-vr') threw error:", err);
        this.diagInfo.isImmersiveSupported = false;
      }
    } else {
      console.warn("navigator.xr is undefined on this browser.");
    }

    if (this.diagInfo.isImmersiveSupported) {
      this.diagInfo.vrStatus = "READY: Meta Quest 3S / WebXR Immersive VR supported! Tap 'ENTER VR' to enter.";
    } else if (!this.diagInfo.hasNavigatorXR) {
      if (!this.diagInfo.isSecureContext && !this.diagInfo.isHttps) {
        this.diagInfo.vrStatus = "WebXR requires HTTPS (or http://localhost). Open on HTTPS or Meta Quest Browser.";
      } else {
        this.diagInfo.vrStatus = "navigator.xr is undefined. Use Meta Quest Browser on Quest 3S.";
      }
    } else {
      this.diagInfo.vrStatus = "navigator.xr is available, but immersive-vr display not found. (Supported on Meta Quest Browser; on PC use 'DESKTOP PREVIEW').";
    }

    this.updateDiagnosticsUI();
  }

  updateDiagnosticsUI() {
    const elHttps = document.getElementById('diag-https');
    const elSecure = document.getElementById('diag-secure');
    const elXR = document.getElementById('diag-xr');
    const elSession = document.getElementById('diag-session');
    const elThree = document.getElementById('diag-three');
    const elProtocol = document.getElementById('diag-protocol');
    const elHost = document.getElementById('diag-host');
    const elUA = document.getElementById('diag-ua');
    const elStatus = document.getElementById('diag-status');

    if (elHttps) {
      elHttps.textContent = this.diagInfo.isHttps ? "✓ YES" : "✗ NO";
      elHttps.className = "diag-val " + (this.diagInfo.isHttps ? "pass" : "fail");
    }
    if (elSecure) {
      elSecure.textContent = this.diagInfo.isSecureContext ? "✓ YES" : "✗ NO";
      elSecure.className = "diag-val " + (this.diagInfo.isSecureContext ? "pass" : "fail");
    }
    if (elXR) {
      elXR.textContent = this.diagInfo.hasNavigatorXR ? "✓ YES" : "✗ NO";
      elXR.className = "diag-val " + (this.diagInfo.hasNavigatorXR ? "pass" : "fail");
    }
    if (elSession) {
      elSession.textContent = this.diagInfo.isImmersiveSupported ? "✓ YES" : "✗ NO";
      elSession.className = "diag-val " + (this.diagInfo.isImmersiveSupported ? "pass" : "warn");
    }
    if (elThree) {
      elThree.textContent = this.diagInfo.isThreeXREnabled ? "✓ YES" : "✗ NO";
      elThree.className = "diag-val " + (this.diagInfo.isThreeXREnabled ? "pass" : "fail");
    }
    if (elProtocol) {
      elProtocol.textContent = this.diagInfo.protocol;
      elProtocol.className = "diag-val " + (this.diagInfo.isHttps ? "pass" : "fail");
    }
    if (elHost) {
      elHost.textContent = this.diagInfo.host;
    }
    if (elUA) {
      elUA.textContent = this.diagInfo.userAgent;
    }
    if (elStatus) {
      elStatus.textContent = this.diagInfo.vrStatus;
      elStatus.className = "diag-val " + (this.diagInfo.isImmersiveSupported ? "pass" : "warn");
    }
  }

  setVRStatus(statusMsg, isError = false) {
    this.diagInfo.vrStatus = statusMsg;
    const elStatus = document.getElementById('diag-status');
    if (elStatus) {
      elStatus.textContent = statusMsg;
      elStatus.className = "diag-val " + (isError ? "fail" : "pass");
    }
  }

  showErrorDialog(title, message, errorObj = null) {
    console.error(`[WebXR Error] ${title}:`, message, errorObj);

    let modal = document.getElementById('webxr-error-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'webxr-error-modal';
      modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.85); z-index: 99999;
        display: flex; justify-content: center; align-items: center;
        padding: 20px; font-family: -apple-system, sans-serif;
      `;
      document.body.appendChild(modal);
    }

    const errDetails = errorObj ? `\n\nError Name: ${errorObj.name || 'N/A'}\nError Message: ${errorObj.message || 'N/A'}\nCode: ${errorObj.code || 'N/A'}` : '';

    modal.innerHTML = `
      <div style="
        background: #121824; border: 2px solid #e2231a; border-radius: 12px;
        padding: 24px; max-width: 600px; width: 100%; color: #f0f4f8; text-align: left;
        box-shadow: 0 8px 32px rgba(226, 35, 26, 0.4);
      ">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
          <span style="font-size: 24px;">⚠️</span>
          <h3 style="color: #ff5252; margin: 0; font-size: 18px;">${title}</h3>
        </div>
        <p style="font-size: 14px; line-height: 1.5; color: #cfd8dc; margin-bottom: 14px;">${message}</p>
        <pre style="
          background: #090c12; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px;
          padding: 10px; font-size: 12px; color: #ffb300; overflow-x: auto; white-space: pre-wrap; word-break: break-all;
        ">${errDetails || 'No additional stack details'}</pre>
        <div style="margin-top: 18px; text-align: right;">
          <button id="btn-close-error-modal" style="
            background: #e2231a; color: #fff; border: none; padding: 8px 20px;
            font-weight: bold; border-radius: 6px; cursor: pointer; font-size: 14px;
          ">DISMISS</button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    document.getElementById('btn-close-error-modal')?.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  /**
   * Initiates the WebXR Immersive-VR session.
   * CRITICAL: Called directly from the user's click gesture without intermediate awaits
   * to preserve the transient user activation token.
   */
  async startVRSession() {
    // 1. Synchronous check for navigator.xr
    if (!('xr' in navigator) || !navigator.xr) {
      const msg = "WebXR (navigator.xr) is undefined. Open this website via HTTPS in Meta Quest Browser on your Quest 3S.";
      console.error(msg);
      this.setVRStatus(msg, true);
      this.showErrorDialog("WebXR Not Available", msg);
      return;
    }

    this.setVRStatus("Requesting WebXR immersive-vr session from Meta Quest OS...");

    let session = null;
    let primaryError = null;

    // 2. Request session directly in the user gesture call stack
    // Request with optional features (Quest 3S standard)
    try {
      session = await navigator.xr.requestSession('immersive-vr', {
        optionalFeatures: [
          'local-floor',
          'bounded-floor',
          'hand-tracking',
          'layers'
        ]
      });
    } catch (err1) {
      console.warn("Primary requestSession with optionalFeatures rejected, trying minimal fallback:", err1);
      primaryError = err1;

      // Fallback: minimal requestSession
      try {
        session = await navigator.xr.requestSession('immersive-vr');
      } catch (err2) {
        console.error("WebXR requestSession failed completely:", primaryError, err2);
        const errMsg = `${primaryError?.name || err2?.name || 'Error'}: ${primaryError?.message || err2?.message || 'requestSession failed'}`;
        this.setVRStatus(`WebXR requestSession Failed: ${errMsg}`, true);
        this.showErrorDialog(
          "WebXR Session Request Rejected",
          "The Meta Quest Browser rejected the immersive VR session request.\n\n" +
          "1. Verify you are on HTTPS (https://lenovo-future-expo.vercel.app).\n" +
          "2. Ensure Quest Browser permissions allow Spatial Tracking (Settings > Permissions).\n" +
          "3. Try closing and reopening Quest Browser tab.",
          primaryError || err2
        );
        return;
      }
    }

    if (!session) {
      this.setVRStatus("Failed to obtain WebXR session.", true);
      return;
    }

    // 3. Negotiate Reference Space & Connect session to Three.js WebXR Manager
    try {
      this.currentSession = session;

      // Try local-floor first, then fallback to local
      try {
        await this.renderer.xr.setReferenceSpaceType('local-floor');
      } catch (refErr) {
        console.warn("local-floor reference space unsupported, falling back to local reference space:", refErr);
        try {
          await this.renderer.xr.setReferenceSpaceType('local');
        } catch (e2) {
          console.warn("Fallback to local reference space failed:", e2);
        }
      }

      await this.renderer.xr.setSession(session);
      this.isVRActive = true;
      this.setVRStatus("WebXR immersive-vr active! Welcome to Lenovo Future Expo VR.");
      soundManager.init();

      // Hide 2D landing overlay
      const landingScreen = document.getElementById('landing-screen');
      if (landingScreen) landingScreen.classList.add('hidden');

      session.addEventListener('end', () => {
        console.log("WebXR immersive-vr session ended.");
        this.isVRActive = false;
        this.currentSession = null;
        this.setVRStatus("VR Session Ended. Click 'ENTER VR' to re-enter.");
        if (landingScreen) landingScreen.classList.remove('hidden');
      });
    } catch (rendererErr) {
      console.error("Error setting WebXR session on Three.js renderer:", rendererErr);
      const errMsg = `${rendererErr.name || 'RendererError'}: ${rendererErr.message || 'Failed to attach XR session'}`;
      this.setVRStatus(`Three.js XR Error: ${errMsg}`, true);
      this.showErrorDialog("Three.js XR Renderer Error", "Failed to connect the WebXR session to the 3D renderer.", rendererErr);
    }
  }

  initControllers() {
    // 1. Controller 1 (Right Hand Pointer Space)
    this.controller1 = this.renderer.xr.getController(0);
    this.controller1.addEventListener('selectstart', () => {
      if (this.onSelectCallback) this.onSelectCallback(this.controller1);
    });
    this.userGroup.add(this.controller1);

    // 2. Controller 2 (Left Hand Pointer Space)
    this.controller2 = this.renderer.xr.getController(1);
    this.controller2.addEventListener('selectstart', () => {
      if (this.onSelectCallback) this.onSelectCallback(this.controller2);
    });
    this.userGroup.add(this.controller2);

    // 3. Controller Visuals Sub-Groups (Shown ONLY when physical touch controllers are used)
    this.controllerVisuals1 = new THREE.Group();
    this.controllerVisuals1.name = "Right_Controller_Visuals";
    this.controller1.add(this.controllerVisuals1);

    this.controllerVisuals2 = new THREE.Group();
    this.controllerVisuals2.name = "Left_Controller_Visuals";
    this.controller2.add(this.controllerVisuals2);

    // Laser Pointer Rays for Touch Controllers
    const laserGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -4)
    ]);
    const laserMat = new THREE.LineBasicMaterial({ color: 0x00d2ff, linewidth: 2, transparent: true, opacity: 0.75 });

    const laser1 = new THREE.Line(laserGeo, laserMat);
    this.controllerVisuals1.add(laser1);

    const laser2 = new THREE.Line(laserGeo.clone(), laserMat.clone());
    this.controllerVisuals2.add(laser2);

    // Sleek VR Controller Ring/Grip (Box/Ring, NOT a cylinder disguised as a hand)
    const ctrlRingGeo = new THREE.RingGeometry(0.02, 0.04, 16);
    const ctrlRingMat = new THREE.MeshBasicMaterial({ color: 0x00d2ff, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });
    const ringMesh1 = new THREE.Mesh(ctrlRingGeo, ctrlRingMat);
    ringMesh1.rotation.x = Math.PI / 2;
    this.controllerVisuals1.add(ringMesh1);

    const ringMesh2 = new THREE.Mesh(ctrlRingGeo.clone(), ctrlRingMat.clone());
    ringMesh2.rotation.x = Math.PI / 2;
    this.controllerVisuals2.add(ringMesh2);

    // Listen for input source connection events
    this.controller1.addEventListener('connected', (event) => {
      const data = event.data;
      if (data && data.hand) {
        // Hand tracking active: HIDE controller visuals
        this.controllerVisuals1.visible = false;
      } else {
        // Physical touch controller: SHOW controller visuals
        this.controllerVisuals1.visible = true;
      }
    });

    this.controller2.addEventListener('connected', (event) => {
      const data = event.data;
      if (data && data.hand) {
        this.controllerVisuals2.visible = false;
      } else {
        this.controllerVisuals2.visible = true;
      }
    });
  }

  updateInputSources(inputSources) {
    if (!inputSources) return;
    for (const source of inputSources) {
      if (source.hand) {
        if (source.handedness === 'right' || source.handedness === 'none') {
          if (this.controllerVisuals1) this.controllerVisuals1.visible = false;
        }
        if (source.handedness === 'left') {
          if (this.controllerVisuals2) this.controllerVisuals2.visible = false;
        }
      }
    }
  }

  getRightController() {
    return this.controller1;
  }

  getLeftController() {
    return this.controller2;
  }
}

