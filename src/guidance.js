/**
 * Lenovo Future Expo - Guidance & Waypoint System
 */
import * as THREE from 'three';

class GuidanceSystem {
  constructor() {
    this.hudElement = null;
    this.hudTextElement = null;
    this.worldSubtitleMesh = null;
    this.subtitleCanvas = null;
    this.subtitleTexture = null;
    this.waypointMesh = null;
  }

  init(scene) {
    this.hudElement = document.getElementById('desktop-hud');
    this.hudTextElement = document.getElementById('hud-text');

    // 1. World-space floating guidance subtitle banner (placed above main aisle)
    this.subtitleCanvas = document.createElement('canvas');
    this.subtitleCanvas.width = 1024;
    this.subtitleCanvas.height = 256;
    this.subtitleTexture = new THREE.CanvasTexture(this.subtitleCanvas);

    const subGeo = new THREE.PlaneGeometry(3.6, 0.9);
    const subMat = new THREE.MeshBasicMaterial({
      map: this.subtitleTexture,
      transparent: true,
      side: THREE.DoubleSide
    });
    this.worldSubtitleMesh = new THREE.Mesh(subGeo, subMat);
    this.worldSubtitleMesh.position.set(0, 3.2, 17.5);
    scene.add(this.worldSubtitleMesh);

    // 2. Animated floating beacon waypoint
    const ringGeo = new THREE.TorusGeometry(0.35, 0.04, 12, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00d2ff, transparent: true, opacity: 0.85 });
    this.waypointMesh = new THREE.Mesh(ringGeo, ringMat);
    this.waypointMesh.rotation.x = Math.PI * 0.5;
    this.waypointMesh.position.set(0, 1.0, 14.0);
    scene.add(this.waypointMesh);

    this.showGuidance("Welcome to Lenovo Future Expo. Step through the entrance arch to begin.");
  }

  showGuidance(message, targetPos = null) {
    // 1. Update 2D Desktop HUD
    if (this.hudTextElement) {
      this.hudTextElement.textContent = message;
    }
    if (this.hudElement) {
      this.hudElement.classList.remove('hidden');
    }

    // 2. Update 3D World Subtitle Canvas
    if (this.subtitleCanvas) {
      const ctx = this.subtitleCanvas.getContext('2d');
      const w = this.subtitleCanvas.width;
      const h = this.subtitleCanvas.height;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(10, 16, 26, 0.88)';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#00d2ff';
      ctx.lineWidth = 4;
      ctx.strokeRect(6, 6, w - 12, h - 12);

      ctx.fillStyle = '#00d2ff';
      ctx.font = 'bold 24px Arial';
      ctx.fillText('LENOVO EXPO GUIDE', 30, 45);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px Arial';
      
      // Multi-line word wrap
      const words = message.split(' ');
      let line = '';
      let y = 100;
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > w - 60 && i > 0) {
          ctx.fillText(line, 30, y);
          line = words[i] + ' ';
          y += 42;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 30, y);

      if (this.subtitleTexture) {
        this.subtitleTexture.needsUpdate = true;
      }
    }

    // 3. Move beacon waypoint if target position provided
    if (targetPos && this.waypointMesh) {
      this.waypointMesh.position.set(targetPos.x, targetPos.y, 0.2);
      this.waypointMesh.visible = true;
    }
  }

  update(time) {
    // Animate floating waypoint
    if (this.waypointMesh && this.waypointMesh.visible) {
      this.waypointMesh.position.z = 0.2 + Math.sin(time * 3) * 0.08;
      this.waypointMesh.rotation.z += 0.02;
    }
  }
}

export const guidanceSystem = new GuidanceSystem();
