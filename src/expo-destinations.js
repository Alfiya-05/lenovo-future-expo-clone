/**
 * Lenovo Future Expo - Authoritative Destination Configuration
 * Single source of truth for stall IDs, world coordinates, orientations,
 * landing positions, themes, and interactive metadata.
 */
import * as THREE from 'three';

export const STALL_IDS = {
  ENTRANCE: 'ENTRANCE',
  LEGION_GAMING: 'LEGION_GAMING',
  AI_PC: 'AI_PC',
  ADAPTIVE_COMPUTING: 'ADAPTIVE_COMPUTING',
  PERSONAL_AI: 'PERSONAL_AI',
  LENOVO_XR: 'LENOVO_XR',
  FUTURE_LAB: 'FUTURE_LAB'
};

export const EXPO_DESTINATIONS = [
  {
    id: STALL_IDS.ENTRANCE,
    name: 'Entrance Arch',
    shortName: 'ENTRANCE',
    zone: 'Zone 00',
    title: 'Exhibition Hall Gateway',
    description: 'Holographic Virtual Guide & Tour Initiation Portal',
    themeColor: 0xe2231a, // Lenovo Red
    accentColor: 0x00d2ff,
    boothCenter: new THREE.Vector3(0.0, 0.0, 20.5),
    landingPosition: new THREE.Vector3(0.0, 0.0, 21.0),
    landingRotationY: 0.0, // Face -Z (down central aisle)
    iconType: 'entrance',
    badgeText: 'START TOUR'
  },
  {
    id: STALL_IDS.LEGION_GAMING,
    name: 'Legion Gaming',
    shortName: 'LEGION',
    zone: 'Zone 01',
    title: 'High-Performance Esports Arena',
    description: 'Legion Tower Gaming Rig & 5-Target Reaction Challenge',
    themeColor: 0xff2a6d, // Legion Crimson
    accentColor: 0xff0055,
    boothCenter: new THREE.Vector3(-8.0, 0.0, 13.8),
    landingPosition: new THREE.Vector3(-5.0, 0.0, 13.8),
    landingRotationY: Math.PI / 2, // Face -X into booth
    iconType: 'gaming',
    badgeText: '5 TARGETS'
  },
  {
    id: STALL_IDS.AI_PC,
    name: 'Lenovo AI PC',
    shortName: 'AI PC',
    zone: 'Zone 02',
    title: 'Next-Gen Aura Edition AI Computing',
    description: '3D Laptop with 105° OLED Screen, Neural NPU & Grabbable Doc',
    themeColor: 0x00d2ff, // Lenovo Cyan
    accentColor: 0x0088cc,
    boothCenter: new THREE.Vector3(7.5, 0.0, 14.2),
    landingPosition: new THREE.Vector3(5.0, 0.0, 14.2),
    landingRotationY: -Math.PI / 2, // Face +X into booth
    iconType: 'laptop',
    badgeText: 'NPU MATRIX'
  },
  {
    id: STALL_IDS.ADAPTIVE_COMPUTING,
    name: 'Adaptive Computing',
    shortName: 'ADAPTIVE',
    zone: 'Zone 03',
    title: 'Dynamic Multi-Mode Architecture',
    description: 'Hardware Transformation Matrix: Work, Creative, Gaming & Mobile',
    themeColor: 0xffb300, // Amber Gold
    accentColor: 0xff8c00,
    boothCenter: new THREE.Vector3(-8.0, 0.0, 2.5),
    landingPosition: new THREE.Vector3(-5.0, 0.0, 2.5),
    landingRotationY: Math.PI / 2, // Face -X into booth
    iconType: 'adaptive',
    badgeText: '4 MODES'
  },
  {
    id: STALL_IDS.PERSONAL_AI,
    name: 'Personal AI',
    shortName: 'PERSONAL AI',
    zone: 'Zone 04',
    title: 'Unified Ecosystem Mesh',
    description: 'Cross-Device AI Synchronizer & Live Data Transmission Orb',
    themeColor: 0x00ff96, // Mint Emerald
    accentColor: 0x00cc77,
    boothCenter: new THREE.Vector3(8.0, 0.0, 2.5),
    landingPosition: new THREE.Vector3(5.0, 0.0, 2.5),
    landingRotationY: -Math.PI / 2, // Face +X into booth
    iconType: 'device',
    badgeText: 'CROSS-DEV'
  },
  {
    id: STALL_IDS.LENOVO_XR,
    name: 'Lenovo XR',
    shortName: 'LENOVO XR',
    zone: 'Zone 05',
    title: 'Photorealistic Spatial Computing',
    description: 'Spatial XR Headset Experience & Concentric Holographic Ring Core',
    themeColor: 0xb388ff, // Spatial Purple
    accentColor: 0x7c4dff,
    boothCenter: new THREE.Vector3(-8.0, 0.0, -8.5),
    landingPosition: new THREE.Vector3(-5.0, 0.0, -8.5),
    landingRotationY: Math.PI / 2, // Face -X into booth
    iconType: 'xr',
    badgeText: 'SPATIAL XR'
  },
  {
    id: STALL_IDS.FUTURE_LAB,
    name: 'Future Lab Core',
    shortName: 'FUTURE LAB',
    zone: 'Zone 06',
    title: 'Grand Finale Showcase Pavilion',
    description: '5 Synchronized Concept Node Pillars & 14m Cinematic Video Wall',
    themeColor: 0xffffff, // Tech Pure White / Cyan
    accentColor: 0x00d2ff,
    boothCenter: new THREE.Vector3(0.0, 0.0, -18.5),
    landingPosition: new THREE.Vector3(0.0, 0.0, -15.5),
    landingRotationY: 0.0, // Face -Z into pavilion
    iconType: 'lab',
    badgeText: '5 NODES'
  }
];

export function getDestinationById(id) {
  return EXPO_DESTINATIONS.find(d => d.id === id) || null;
}

export function getAllDestinations() {
  return EXPO_DESTINATIONS;
}
