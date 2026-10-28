/**
 * roomScene.js — Three.js 3D workstation scene & GSAP camera director.
 *
 * Builds an atmospheric cyber workstation: desk, laptop (ROG G14), wall monitors,
 * RGB strips, power cable, projector. Manages animation phases 1-5 with GSAP
 * camera timelines.
 */

import * as THREE from 'three';
import gsap from 'gsap';
import { SpaceCanvas } from './spaceCanvas.js';
import { LiveCalendar } from './liveCalendar.js';
import { TypewriterGoals } from './typewriterGoals.js';
import { SpeedometerGauges } from './speedometerGauges.js';

export class RoomScene {
  constructor(canvas, audioManager) {
    this.canvas = canvas;
    this.audio = audioManager;

    // Phase: 0=ambient, 1=powering, 2=booting, 3=gauges, 4=ready, 5=transitioning, 6=portfolio
    this.phase = 0;

    this._initRenderer();
    this._initScene();
    this._buildRoom();
    this._buildDesk();
    this._buildLaptop();
    this._buildWallMonitors();
    this._buildPowerCable();
    this._buildProjector();
    this._initCanvasTextures();

    this.clock = new THREE.Clock();
    this._tick = this._tick.bind(this);
    requestAnimationFrame(this._tick);

    window.addEventListener('resize', () => this._onResize());
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x050608, 0.035);

    this.camera = new THREE.PerspectiveCamera(
      50, window.innerWidth / window.innerHeight, 0.1, 100
    );
    this.camera.position.set(0, 4.5, 9);
    this.camera.lookAt(0, 1.5, 0);

    // Ambient dim
    this.scene.add(new THREE.AmbientLight(0x1a1a2e, 0.3));

    // Key light
    const key = new THREE.PointLight(0x00f0ff, 0.5, 20);
    key.position.set(-3, 6, 3);
    this.scene.add(key);
    this.keyLight = key;

    // Fill light
    const fill = new THREE.PointLight(0xff007f, 0.3, 15);
    fill.position.set(3, 5, 2);
    this.scene.add(fill);
    this.fillLight = fill;
  }

  // ===================== ROOM =====================
  _buildRoom() {
    const roomGeo = new THREE.BoxGeometry(20, 10, 14);
    const roomMat = new THREE.MeshStandardMaterial({
      color: 0x0a0b14,
      roughness: 0.9,
      metalness: 0.1,
      side: THREE.BackSide,
    });
    this.room = new THREE.Mesh(roomGeo, roomMat);
    this.room.position.y = 4;
    this.scene.add(this.room);

    // Floor with subtle reflection feel
    const floorGeo = new THREE.PlaneGeometry(20, 14);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x080810,
      roughness: 0.4,
      metalness: 0.6,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Back wall RGB strips (start off, activate in Phase 2)
    this.rgbStrips = new THREE.Group();

    // Left strip
    const stripGeo = new THREE.BoxGeometry(0.05, 8, 0.05);
    const stripMatL = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    this.stripLeft = new THREE.Mesh(stripGeo, stripMatL);
    this.stripLeft.position.set(-9.9, 4, 0);
    this.stripLeft.visible = false;
    this.rgbStrips.add(this.stripLeft);

    // Right strip
    const stripMatR = new THREE.MeshBasicMaterial({ color: 0xff007f });
    this.stripRight = new THREE.Mesh(stripGeo, stripMatR);
    this.stripRight.position.set(9.9, 4, 0);
    this.stripRight.visible = false;
    this.rgbStrips.add(this.stripRight);

    // Top-back strip
    const stripGeoH = new THREE.BoxGeometry(20, 0.05, 0.05);
    const stripMatTop = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    this.stripTop = new THREE.Mesh(stripGeoH, stripMatTop);
    this.stripTop.position.set(0, 8, -6.9);
    this.stripTop.visible = false;
    this.rgbStrips.add(this.stripTop);

    // Desk edge strip
    const deskStripGeo = new THREE.BoxGeometry(6, 0.03, 0.03);
    const deskStripMat = new THREE.MeshBasicMaterial({ color: 0xff007f });
    this.deskStrip = new THREE.Mesh(deskStripGeo, deskStripMat);
    this.deskStrip.position.set(0, 2.05, -2.5);
    this.deskStrip.visible = false;
    this.rgbStrips.add(this.deskStrip);

    this.scene.add(this.rgbStrips);
  }

  // ===================== DESK =====================
  _buildDesk() {
    const deskGroup = new THREE.Group();

    // Desktop — ergonomic sloped surface
    const topGeo = new THREE.BoxGeometry(6, 0.08, 3.5);
    const deskMat = new THREE.MeshStandardMaterial({
      color: 0x12121c,
      roughness: 0.5,
      metalness: 0.3,
    });
    const top = new THREE.Mesh(topGeo, deskMat);
    top.position.y = 2.0;
    top.castShadow = true;
    top.receiveShadow = true;
    deskGroup.add(top);

    // Front edge accent
    const edgeGeo = new THREE.BoxGeometry(6, 0.04, 0.06);
    const edgeMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.3,
      metalness: 0.6,
    });
    const edge = new THREE.Mesh(edgeGeo, edgeMat);
    edge.position.set(0, 2.0, 1.75);
    deskGroup.add(edge);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.15, 2.0, 0.15);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x0a0a14, roughness: 0.6, metalness: 0.4 });
    [[-2.7, -1.5], [2.7, -1.5], [-2.7, 1.5], [2.7, 1.5]].forEach(([x, z]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(x, 1.0, z);
      leg.castShadow = true;
      deskGroup.add(leg);
    });

    this.scene.add(deskGroup);
    this.desk = deskGroup;
  }

  // ===================== LAPTOP (ROG G14) =====================
  _buildLaptop() {
    this.laptop = new THREE.Group();
    this.laptop.position.set(0, 2.04, -0.5);

    // Base (bottom half)
    const baseGeo = new THREE.BoxGeometry(2.2, 0.06, 1.5);
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0x222230,
      roughness: 0.35,
      metalness: 0.75,
    });
    const base = new THREE.Mesh(baseGeo, metalMat);
    base.castShadow = true;
    this.laptop.add(base);

    // Keyboard area
    const kbGeo = new THREE.BoxGeometry(1.9, 0.01, 0.9);
    const kbMat = new THREE.MeshStandardMaterial({ color: 0x0a0a12, roughness: 0.8 });
    const kb = new THREE.Mesh(kbGeo, kbMat);
    kb.position.set(0, 0.04, -0.05);
    this.laptop.add(kb);

    // Trackpad
    const tpGeo = new THREE.BoxGeometry(0.7, 0.005, 0.4);
    const tpMat = new THREE.MeshStandardMaterial({ color: 0x0a0a12, roughness: 0.5, metalness: 0.3 });
    const tp = new THREE.Mesh(tpGeo, tpMat);
    tp.position.set(0, 0.04, 0.55);
    this.laptop.add(tp);

    // Lid group (starts closed, opens in Phase 2)
    this.lid = new THREE.Group();
    this.lid.position.set(0, 0.03, -0.75);
    this.lid.rotation.x = -Math.PI / 2; // Closed flat

    // Lid back panel
    const lidBackGeo = new THREE.BoxGeometry(2.2, 0.04, 1.5);
    const lidBack = new THREE.Mesh(lidBackGeo, metalMat);
    lidBack.castShadow = true;
    this.lid.add(lidBack);

    // Slash lighting on lid (pulsing diagonal beam)
    const slashGeo = new THREE.PlaneGeometry(1.8, 0.08);
    const slashMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.8,
    });
    this.slashLight = new THREE.Mesh(slashGeo, slashMat);
    this.slashLight.position.set(0, 0.03, 0);
    this.slashLight.rotation.z = Math.PI / 6;
    this.lid.add(this.slashLight);

    // Second slash (pink)
    const slashMat2 = new THREE.MeshBasicMaterial({
      color: 0xff007f,
      transparent: true,
      opacity: 0.6,
    });
    this.slashLight2 = new THREE.Mesh(slashGeo, slashMat2);
    this.slashLight2.position.set(0.3, 0.03, 0.2);
    this.slashLight2.rotation.z = Math.PI / 6;
    this.lid.add(this.slashLight2);

    // Screen (will display the speedometer canvas texture)
    const screenGeo = new THREE.PlaneGeometry(1.98, 1.28);
    this.screenTexture = null; // Set in _initCanvasTextures
    this.screenMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this.screen = new THREE.Mesh(screenGeo, this.screenMat);
    this.screen.position.set(0, 0.76, 0);
    this.screen.rotation.x = -Math.PI / 2;
    this.lid.add(this.screen);

    // Screen bezel
    const bezelGeo = new THREE.BoxGeometry(2.2, 0.02, 1.5);
    const bezelMat = new THREE.MeshStandardMaterial({ color: 0x08080c, roughness: 0.6 });
    const bezel = new THREE.Mesh(bezelGeo, bezelMat);
    bezel.position.set(0, 0.76, 0);
    bezel.rotation.x = -Math.PI / 2;
    // We add bezel as the top of the lid - but screen sits "above" when open
    // Actually let's add screen on front face of lid
    // Lid is rotated, so "front" is the +Y local face when closed.
    // We'll handle screen display when lid opens.

    this.laptop.add(this.lid);
    this.scene.add(this.laptop);
  }

  // ===================== WALL MONITORS =====================
  _buildWallMonitors() {
    // Two monitors on the back wall, left and right
    this.wallScreens = [];

    for (let i = 0; i < 2; i++) {
      const x = i === 0 ? -4.5 : 4.5;
      const group = new THREE.Group();

      // Monitor body
      const frameGeo = new THREE.BoxGeometry(3.0, 2.0, 0.1);
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0x0a0a14,
        roughness: 0.4,
        metalness: 0.6,
      });
      const frame = new THREE.Mesh(frameGeo, frameMat);
      frame.castShadow = true;
      group.add(frame);

      // Screen surface (texture assigned later)
      const screenGeo = new THREE.PlaneGeometry(2.8, 1.85);
      const screenMat = new THREE.MeshBasicMaterial({ color: 0x000011 });
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.z = 0.06;
      group.add(screen);

      // Stand
      const standGeo = new THREE.BoxGeometry(0.15, 0.5, 0.1);
      const standMat = new THREE.MeshStandardMaterial({ color: 0x08080c, roughness: 0.5 });
      const stand = new THREE.Mesh(standGeo, standMat);
      stand.position.y = -1.2;
      group.add(stand);

      const baseGeo = new THREE.BoxGeometry(0.6, 0.04, 0.3);
      const standBase = new THREE.Mesh(baseGeo, standMat);
      standBase.position.y = -1.45;
      group.add(standBase);

      group.position.set(x, 4.5, -6.8);
      group.lookAt(0, 4, 0);

      this.scene.add(group);
      this.wallScreens.push({ group, screen, screenMat, x });
    }
  }

  // ===================== POWER CABLE =====================
  _buildPowerCable() {
    // Cable starts hidden off-screen left, slides into laptop left port in Phase 2
    const cableGroup = new THREE.Group();

    // Cable body (curved tube approximated with segments)
    const points = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      points.push(new THREE.Vector3(
        -4 + t * 2.8,
        2.0 + Math.sin(t * Math.PI) * 0.3,
        0
      ));
    }
    const cableGeo = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(points), 20, 0.025, 8, false
    );
    const cableMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a24,
      roughness: 0.6,
      metalness: 0.3,
    });
    this.cable = new THREE.Mesh(cableGeo, cableMat);
    this.cable.visible = false;
    cableGroup.add(this.cable);

    // Connector head
    const connGeo = new THREE.BoxGeometry(0.08, 0.04, 0.06);
    const connMat = new THREE.MeshStandardMaterial({
      color: 0x33333d,
      roughness: 0.3,
      metalness: 0.8,
    });
    this.connector = new THREE.Mesh(connGeo, connMat);
    this.connector.position.copy(points[points.length - 1]);
    this.connector.visible = false;
    cableGroup.add(this.connector);

    this.scene.add(cableGroup);

    // Spark particles for cable docking
    this.sparkParticles = this._createSparkParticles();
  }

  _createSparkParticles() {
    const count = 30;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];
    const lifetimes = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = -1.1;
      positions[i * 3 + 1] = 2.05;
      positions[i * 3 + 2] = 0;
      velocities.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.05,
        Math.random() * 0.05,
        (Math.random() - 0.5) * 0.05
      ));
      lifetimes.push(0);
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.05,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geo, mat);
    points.visible = false;
    this.scene.add(points);

    return { points, geo, velocities, lifetimes, active: false, elapsed: 0 };
  }

  _triggerSparks() {
    const s = this.sparkParticles;
    s.active = true;
    s.elapsed = 0;
    s.points.visible = true;
    const positions = s.geo.attributes.position.array;
    for (let i = 0; i < s.velocities.length; i++) {
      positions[i * 3] = -1.1;
      positions[i * 3 + 1] = 2.05;
      positions[i * 3 + 2] = 0;
      s.lifetimes[i] = 1.0;
    }
    s.geo.attributes.position.needsUpdate = true;
  }

  // ===================== PROJECTOR =====================
  _buildProjector() {
    const group = new THREE.Group();

    // Projector body
    const bodyGeo = new THREE.BoxGeometry(0.6, 0.35, 0.5);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x111119,
      roughness: 0.4,
      metalness: 0.6,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    group.add(body);

    // Lens
    const lensGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.2, 16);
    const lensMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      emissive: 0x00f0ff,
      emissiveIntensity: 0,
    });
    this.projectorLens = new THREE.Mesh(lensGeo, lensMat);
    this.projectorLens.rotation.x = Math.PI / 2;
    this.projectorLens.position.z = 0.3;
    group.add(this.projectorLens);

    // Mount arm
    const armGeo = new THREE.BoxGeometry(0.06, 1.0, 0.06);
    const arm = new THREE.Mesh(armGeo, bodyMat);
    arm.position.y = 0.65;
    group.add(arm);

    group.position.set(4.5, 8.0, -5);
    this.scene.add(group);
    this.projector = group;

    // Volumetric light beam (cone, initially invisible)
    const beamGeo = new THREE.ConeGeometry(1.2, 5.0, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    this.projectorBeam = new THREE.Mesh(beamGeo, beamMat);
    this.projectorBeam.position.set(4.5, 5.5, -2);
    this.projectorBeam.rotation.x = Math.PI / 2 + 0.3;
    this.projectorBeam.rotation.z = -0.4;
    this.scene.add(this.projectorBeam);
  }

  // ===================== CANVAS TEXTURES =====================
  _initCanvasTextures() {
    // Speedometer gauges → laptop screen
    this.gauges = new SpeedometerGauges(512, 384);
    this.gaugesTexture = new THREE.CanvasTexture(this.gauges.canvas);
    this.gaugesTexture.minFilter = THREE.LinearFilter;
    this.gaugesTexture.magFilter = THREE.LinearFilter;
    this.screenMat.map = this.gaugesTexture;
    this.screenMat.needsUpdate = true;

    // Space canvas → shared background for wall monitors
    this.spaceCanvas = new SpaceCanvas(512, 384);
    this.spaceTexture = new THREE.CanvasTexture(this.spaceCanvas.canvas);
    this.spaceTexture.minFilter = THREE.LinearFilter;

    // Left wall: calendar overlay
    this.calendar = new LiveCalendar(512, 384);

    // Left wall: typewriter goals
    this.typewriter = new TypewriterGoals(512, 384);

    // Left wall composite texture
    this.leftWallTexture = new THREE.CanvasTexture(this.spaceCanvas.canvas);
    this.leftWallTexture.minFilter = THREE.LinearFilter;

    // Right wall: telemetry
    this.rightWallTexture = new THREE.CanvasTexture(this.spaceCanvas.canvas);
    this.rightWallTexture.minFilter = THREE.LinearFilter;

    // Apply to wall screens
    this.wallScreens[0].screenMat.map = this.leftWallTexture;
    this.wallScreens[0].screenMat.color.setHex(0xffffff);
    this.wallScreens[0].screenMat.needsUpdate = true;

    this.wallScreens[1].screenMat.map = this.rightWallTexture;
    this.wallScreens[1].screenMat.color.setHex(0xffffff);
    this.wallScreens[1].screenMat.needsUpdate = true;

    // Right wall telemetry data
    this.telemetrySkills = [
      { name: 'JavaScript', level: 0, target: 95 },
      { name: 'Three.js / WebGL', level: 0, target: 88 },
      { name: 'React / Next.js', level: 0, target: 90 },
      { name: 'Node.js', level: 0, target: 85 },
      { name: 'GSAP / Animation', level: 0, target: 82 },
      { name: 'Python', level: 0, target: 75 },
      { name: 'TypeScript', level: 0, target: 80 },
    ];

    // Create dedicated right-wall canvas
    this.rightWallCanvas = document.createElement('canvas');
    this.rightWallCanvas.width = 512;
    this.rightWallCanvas.height = 384;
    this.rightWallCtx = this.rightWallCanvas.getContext('2d');
    this.rightWallTexture = new THREE.CanvasTexture(this.rightWallCanvas);
    this.rightWallTexture.minFilter = THREE.LinearFilter;
    this.wallScreens[1].screenMat.map = this.rightWallTexture;
    this.wallScreens[1].screenMat.needsUpdate = true;

    // Create dedicated left-wall canvas
    this.leftWallCanvas = document.createElement('canvas');
    this.leftWallCanvas.width = 512;
    this.leftWallCanvas.height = 384;
    this.leftWallCtx = this.leftWallCanvas.getContext('2d');
    this.leftWallTexture = new THREE.CanvasTexture(this.leftWallCanvas);
    this.leftWallTexture.minFilter = THREE.LinearFilter;
    this.wallScreens[0].screenMat.map = this.leftWallTexture;
    this.wallScreens[0].screenMat.needsUpdate = true;
  }

  // ===================== PHASE CONTROLLERS =====================

  /** Phase 2: Power up — boot chime, cable dock, RGB strips, lid open */
  powerUp() {
    if (this.phase > 0) return;
    this.phase = 1;
    this.audio.playBootChime();

    // Activate RGB strips after 0.5s
    gsap.delayedCall(0.5, () => {
      this.stripLeft.visible = true;
      this.stripRight.visible = true;
      this.stripTop.visible = true;
      this.deskStrip.visible = true;

      this.stripLeft.material.opacity = 0;
      this.stripRight.material.opacity = 0;
      this.stripTop.material.opacity = 0;
      this.deskStrip.material.opacity = 0;
      this.stripLeft.material.transparent = true;
      this.stripRight.material.transparent = true;
      this.stripTop.material.transparent = true;
      this.deskStrip.material.transparent = true;

      gsap.to([this.stripLeft.material, this.stripRight.material, this.stripTop.material, this.deskStrip.material], {
        opacity: 1,
        duration: 1.0,
        ease: 'power2.inOut',
      });
    });

    // Slide power cable in after 1s
    gsap.delayedCall(1.0, () => {
      this.cable.visible = true;
      this.connector.visible = true;
      this.audio.playSpark();
      this._triggerSparks();

      // Animate cable sliding in (scale from left)
      this.cable.scale.x = 0.01;
      this.connector.position.x = -4;
      gsap.to(this.cable.scale, { x: 1, duration: 0.6, ease: 'power2.out' });
      gsap.to(this.connector.position, { x: -1.2, duration: 0.6, ease: 'power2.out' });
    });

    // Open laptop lid after 1.8s
    gsap.delayedCall(1.8, () => {
      this.phase = 2;
      this.audio.playRev();
      gsap.to(this.lid.rotation, {
        x: 0,
        duration: 1.2,
        ease: 'power3.inOut',
        onComplete: () => {
          this.phase = 3;
          this._startBootSequence();
        },
      });
    });
  }

  /** Phase 3: Boot sequence — gauges sweep, brand fade-in */
  _startBootSequence() {
    // Sweep gauges to max
    gsap.to(this.gauges, {
      leftTarget: 100,
      rightTarget: 100,
      duration: 3.0,
      ease: 'power2.inOut',
      onUpdate: () => {
        this.audio.playRev();
      },
    });

    // Fade in brand name
    gsap.to(this.gauges, {
      brandAlpha: 1,
      duration: 1.5,
      delay: 1.0,
      ease: 'power2.out',
    });

    // Fade out ROG emblem as gauges reach max
    gsap.to(this.gauges, {
      showROG: false,
      duration: 0,
      delay: 3.0,
    });

    // After gauges max, show portfolio prompt
    gsap.delayedCall(3.5, () => {
      this.phase = 4;
      if (this.onReady) this.onReady();
    });
  }

  /** Phase 5: Projector transition & camera zoom to wall */
  transitionToPortfolio() {
    if (this.phase < 4) return;
    this.phase = 5;
    this.audio.playProjectorHum();

    // Ignite projector
    this.projectorLens.material.emissiveIntensity = 0;
    gsap.to(this.projectorLens.material, { emissiveIntensity: 2, duration: 0.8 });
    gsap.to(this.projectorBeam.material, { opacity: 0.15, duration: 0.8 });

    // Camera sweeps right then zooms into projected screen
    const tl = gsap.timeline();
    tl.to(this.camera.position, {
      x: 3.5, y: 5.0, z: 5,
      duration: 1.5,
      ease: 'power2.inOut',
    });
    tl.to(this.camera.position, {
      x: 4.2, y: 5.5, z: 1,
      duration: 1.5,
      ease: 'power2.in',
    });
    tl.to(this.camera.position, {
      x: 4.4, y: 5.8, z: -0.5,
      duration: 1.0,
      ease: 'power3.in',
      onUpdate: () => {
        this.camera.lookAt(4.5, 5.5, -3);
      },
      onComplete: () => {
        this.phase = 6;
        if (this.onTransitionComplete) this.onTransitionComplete();
      },
    });
  }

  /** Return to room from portfolio view */
  returnToRoom() {
    if (this.phase !== 6) return;
    this.phase = 4;

    gsap.to(this.projectorBeam.material, { opacity: 0, duration: 0.5 });
    gsap.to(this.projectorLens.material, { emissiveIntensity: 0, duration: 0.5 });

    gsap.to(this.camera.position, {
      x: 0, y: 4.5, z: 9,
      duration: 1.5,
      ease: 'power2.inOut',
      onUpdate: () => {
        this.camera.lookAt(0, 1.5, 0);
      },
      onComplete: () => {
        if (this.onReturnComplete) this.onReturnComplete();
      },
    });
  }

  // ===================== RENDER LOOP =====================
  _onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  _updateSparks(dt) {
    const s = this.sparkParticles;
    if (!s.active) return;
    s.elapsed += dt;
    const positions = s.geo.attributes.position.array;
    let allDead = true;
    for (let i = 0; i < s.velocities.length; i++) {
      if (s.lifetimes[i] > 0) {
        positions[i * 3] += s.velocities[i].x;
        positions[i * 3 + 1] += s.velocities[i].y;
        positions[i * 3 + 2] += s.velocities[i].z;
        s.velocities[i].y -= 0.002; // gravity
        s.lifetimes[i] -= dt * 2;
        allDead = false;
      }
    }
    s.geo.attributes.position.needsUpdate = true;
    s.points.material.opacity = Math.max(0, 1 - s.elapsed * 2);
    if (allDead || s.elapsed > 1) {
      s.active = false;
      s.points.visible = false;
    }
  }

  _renderLeftWall() {
    const ctx = this.leftWallCtx;
    // Draw space background
    this.spaceCanvas.render(16);
    ctx.drawImage(this.spaceCanvas.canvas, 0, 0);
    // Draw calendar overlay on top half
    this.calendar.render();
    ctx.drawImage(this.calendar.canvas, 0, 0, 256, 200);
    // Draw typewriter on bottom half
    this.typewriter.update(performance.now());
    this.typewriter.render();
    ctx.drawImage(this.typewriter.canvas, 0, 200, 256, 184);
    this.leftWallTexture.needsUpdate = true;
  }

  _renderRightWall() {
    const ctx = this.rightWallCtx;
    // Space background
    ctx.drawImage(this.spaceCanvas.canvas, 0, 0);

    // Animate skill bars
    let allDone = true;
    for (const skill of this.telemetrySkills) {
      if (skill.level < skill.target) {
        skill.level += (skill.target - skill.level) * 0.02;
        if (skill.target - skill.level > 0.5) allDone = false;
      }
    }

    // Panel
    ctx.fillStyle = 'rgba(8, 8, 16, 0.85)';
    ctx.fillRect(20, 20, 472, 344);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 20, 472, 344);

    // Header
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 16px "Orbitron", monospace';
    ctx.textAlign = 'left';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 6;
    ctx.fillText('// TECH STACK TELEMETRY', 35, 48);
    ctx.shadowBlur = 0;

    // Skill bars
    const startY = 75;
    const barHeight = 10;
    const barWidth = 340;
    const barX = 140;
    let y = startY;

    for (const skill of this.telemetrySkills) {
      // Label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = '12px "Rajdhani", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(skill.name, 35, y + 9);

      // Track
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.fillRect(barX, y, barWidth, barHeight);

      // Fill
      const fillW = (skill.level / 100) * barWidth;
      const grad = ctx.createLinearGradient(barX, 0, barX + fillW, 0);
      grad.addColorStop(0, '#00f0ff');
      grad.addColorStop(1, '#ff007f');
      ctx.fillStyle = grad;
      ctx.fillRect(barX, y, fillW, barHeight);

      // Value
      ctx.fillStyle = 'rgba(0, 240, 255, 0.8)';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(skill.level) + '%', 472, y + 9);

      y += 35;
    }

    // Footer status
    ctx.fillStyle = allDone ? '#00f0ff' : 'rgba(255, 191, 0, 0.8)';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(allDone ? '> STATUS: ALL SYSTEMS NOMINAL' : '> STATUS: CALIBRATING...', 35, y + 15);

    this.rightWallTexture.needsUpdate = true;
  }

  _tick() {
    requestAnimationFrame(this._tick);
    const dt = this.clock.getDelta();

    // Animate slash lighting (always pulsing)
    if (this.slashLight && this.phase < 2) {
      const t = this.clock.elapsedTime;
      this.slashLight.material.opacity = 0.4 + 0.4 * Math.sin(t * 2);
      this.slashLight2.material.opacity = 0.3 + 0.3 * Math.sin(t * 2 + Math.PI);
    }

    // Key light subtle pulse when powered
    if (this.phase >= 1) {
      const t = this.clock.elapsedTime;
      this.keyLight.intensity = 0.5 + 0.15 * Math.sin(t * 1.5);
      this.fillLight.intensity = 0.3 + 0.1 * Math.sin(t * 1.5 + Math.PI);
    }

    // Update gauges
    this.gauges.update(dt * 1000);
    this.gauges.render();
    this.gaugesTexture.needsUpdate = true;

    // Update wall screens
    this._renderLeftWall();
    this._renderRightWall();

    // Update sparks
    this._updateSparks(dt);

    this.renderer.render(this.scene, this.camera);
  }
}
