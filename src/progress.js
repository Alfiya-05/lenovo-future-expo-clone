/**
 * Lenovo Future Expo - Progress Manager & World-Space Progress Board
 */
import * as THREE from 'three';

export const STAGES = {
  ENTRANCE: 'entrance',
  LEGION: 'legion',
  AI_PC: 'aipc',
  ADAPTIVE: 'adaptive',
  PERSONAL_AI: 'personal_ai',
  XR: 'xr',
  FUTURE_LAB: 'future_lab',
  COMPLETED: 'completed'
};

export const STAGE_INFO = [
  { id: STAGES.ENTRANCE, title: 'Entrance Tour', target: 'Legion Gaming' },
  { id: STAGES.LEGION, title: 'Legion Gaming', target: 'Lenovo AI PC' },
  { id: STAGES.AI_PC, title: 'Lenovo AI PC', target: 'Adaptive Computing' },
  { id: STAGES.ADAPTIVE, title: 'Adaptive Computing', target: 'Personal AI' },
  { id: STAGES.PERSONAL_AI, title: 'Personal AI', target: 'Lenovo XR' },
  { id: STAGES.XR, title: 'Lenovo XR', target: 'Lenovo Future Lab' },
  { id: STAGES.FUTURE_LAB, title: 'Future Lab Finale', target: 'Exit Expo' }
];

class ProgressManager {
  constructor() {
    this.completedStages = new Set();
    this.currentStage = STAGES.ENTRANCE;
    this.listeners = [];
    this.boardMesh = null;
    this.boardCanvas = null;
    this.boardTexture = null;
  }

  isStageCompleted(stageId) {
    return this.completedStages.has(stageId);
  }

  completeStage(stageId) {
    if (!this.completedStages.has(stageId)) {
      this.completedStages.add(stageId);
      
      // Advance current stage pointer
      const idx = STAGE_INFO.findIndex(s => s.id === stageId);
      if (idx !== -1 && idx + 1 < STAGE_INFO.length) {
        this.currentStage = STAGE_INFO[idx + 1].id;
      } else {
        this.currentStage = STAGES.COMPLETED;
      }

      this.updateBoard();
      this.notifyListeners(stageId);
    }
  }

  reset() {
    this.completedStages.clear();
    this.currentStage = STAGES.ENTRANCE;
    this.updateBoard();
    this.notifyListeners('reset');
  }

  onProgressChange(callback) {
    this.listeners.push(callback);
  }

  notifyListeners(event) {
    this.listeners.forEach(cb => cb(this.currentStage, this.completedStages, event));
  }

  createWorldProgressBoard() {
    this.boardCanvas = document.createElement('canvas');
    this.boardCanvas.width = 1024;
    this.boardCanvas.height = 768;
    this.boardTexture = new THREE.CanvasTexture(this.boardCanvas);

    const geo = new THREE.PlaneGeometry(2.2, 1.65);
    const mat = new THREE.MeshBasicMaterial({
      map: this.boardTexture,
      transparent: true,
      side: THREE.DoubleSide
    });

    this.boardMesh = new THREE.Mesh(geo, mat);
    this.boardMesh.name = "World_Progress_Board";
    this.boardMesh.position.set(-2.8, -17.5, 2.2);
    this.boardMesh.rotation.y = Math.PI * 0.15;

    this.updateBoard();
    return this.boardMesh;
  }

  updateBoard() {
    if (!this.boardCanvas) return;
    const ctx = this.boardCanvas.getContext('2d');
    const w = this.boardCanvas.width;
    const h = this.boardCanvas.height;

    // Background Card
    ctx.fillStyle = 'rgba(10, 16, 24, 0.95)';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#00d2ff';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, w - 20, h - 20);

    // Header
    ctx.fillStyle = '#e2231a';
    ctx.fillRect(30, 30, 200, 60);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.fillText('Lenovo', 60, 75);

    ctx.fillStyle = '#00d2ff';
    ctx.font = 'bold 36px Arial';
    ctx.fillText('EXPO VISITOR PROGRESS', 260, 75);

    ctx.strokeStyle = 'rgba(0, 210, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(30, 110);
    ctx.lineTo(w - 30, 110);
    ctx.stroke();

    // Stage rows
    STAGE_INFO.forEach((stage, idx) => {
      const y = 180 + idx * 80;
      const isDone = this.completedStages.has(stage.id);
      const isCurrent = this.currentStage === stage.id;

      // Status pill
      if (isDone) {
        ctx.fillStyle = 'rgba(0, 255, 150, 0.2)';
        ctx.fillRect(40, y - 40, w - 80, 65);
        ctx.fillStyle = '#00ff96';
        ctx.font = 'bold 32px Arial';
        ctx.fillText('✓ COMPLETED', 50, y);
      } else if (isCurrent) {
        ctx.fillStyle = 'rgba(0, 210, 255, 0.25)';
        ctx.fillRect(40, y - 40, w - 80, 65);
        ctx.strokeStyle = '#00d2ff';
        ctx.strokeRect(40, y - 40, w - 80, 65);
        ctx.fillStyle = '#00d2ff';
        ctx.font = 'bold 32px Arial';
        ctx.fillText('▶ CURRENT', 50, y);
      } else {
        ctx.fillStyle = '#546e7a';
        ctx.font = '28px Arial';
        ctx.fillText('○ LOCKED', 50, y);
      }

      ctx.fillStyle = isDone ? '#ffffff' : (isCurrent ? '#ffffff' : '#78909c');
      ctx.font = 'bold 30px Arial';
      ctx.fillText(stage.title, 340, y);

      if (isCurrent) {
        ctx.fillStyle = '#ffb300';
        ctx.font = 'italic 24px Arial';
        ctx.fillText(`Next: ${stage.target}`, 700, y);
      }
    });

    if (this.boardTexture) {
      this.boardTexture.needsUpdate = true;
    }
  }
}

export const progressManager = new ProgressManager();
